const db = require('../db');

const GST_RATE = 0.18;
const round2 = (n) => Math.round(n * 100) / 100;

exports.getQuotationById = async (req, res) => {
  try {
    const [[quotation]] = await db.query(
      `SELECT q.*, c.client_name, c.company_name, c.mobile_number, c.email
       FROM quotations q
       JOIN clients c ON q.client_id = c.id
       WHERE q.id = ?`,
      [req.params.id]
    );
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const [items] = await db.query(
      'SELECT id, description, quantity, rate, amount FROM quotation_items WHERE quotation_id = ?',
      [req.params.id]
    );

    res.json({ ...quotation, items });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quotation', error: err.message });
  }
};

exports.createQuotation = async (req, res) => {
  const {
    client_id, quotation_date, valid_until, proposal_type,
    items, discount = 0, gst_applied = false, terms, notes, status
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one service item is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Server-side money math
    const lineItems = items.map(i => ({
      description: i.description,
      quantity: Number(i.quantity),
      rate: Number(i.rate),
      amount: round2(Number(i.quantity) * Number(i.rate)),
    }));
    const subtotal = round2(lineItems.reduce((sum, i) => sum + i.amount, 0));
    const taxable = Math.max(subtotal - Number(discount), 0);
    const gst_amount = gst_applied ? round2(taxable * GST_RATE) : 0;
    const total_amount = round2(taxable + gst_amount);

    // 2. Auto-generate quotation number, e.g. QT-2026-001
    const year = new Date(quotation_date).getFullYear();
    const [[{ max_seq }]] = await conn.query(
      `SELECT MAX(CAST(SUBSTRING_INDEX(quotation_number, '-', -1) AS UNSIGNED)) AS max_seq
       FROM quotations WHERE quotation_number LIKE ? FOR UPDATE`,
      [`QT-${year}-%`]
    );
    const quotation_number = `QT-${year}-${String((max_seq || 0) + 1).padStart(3, '0')}`;

    // 3. Insert the quotation
    const [result] = await conn.query(
      `INSERT INTO quotations
       (quotation_number, client_id, quotation_date, valid_until, proposal_type,
        subtotal, discount, gst_applied, gst_amount, total_amount, terms, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quotation_number, client_id, quotation_date, valid_until, proposal_type,
       subtotal, discount, gst_applied, gst_amount, total_amount, terms, notes, status || 'Draft']
    );

    // 4. Insert all line items in one bulk statement
    const rows = lineItems.map(i => [result.insertId, i.description, i.quantity, i.rate, i.amount]);
    await conn.query(
      'INSERT INTO quotation_items (quotation_id, description, quantity, rate, amount) VALUES ?',
      [rows]
    );

    await conn.commit();
    res.status(201).json({ id: result.insertId, quotation_number, total_amount, message: 'Quotation created successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error creating quotation', error: err.message });
  } finally {
    conn.release();
  }
};

exports.getAllQuotations = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.id, q.quotation_number, q.quotation_date, q.valid_until, q.proposal_type,
              q.subtotal, q.discount, q.gst_applied, q.gst_amount, q.total_amount, q.status,
              c.id AS client_id, c.client_name, c.company_name
       FROM quotations q
       JOIN clients c ON q.client_id = c.id
       ORDER BY q.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quotations', error: err.message });
  }
};

exports.updateQuotation = async (req, res) => {
  const { id } = req.params;
  const {
    client_id, quotation_date, valid_until, proposal_type,
    items, discount = 0, gst_applied = false, terms, notes, status
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one service item is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const lineItems = items.map(i => ({
      description: i.description,
      quantity: Number(i.quantity),
      rate: Number(i.rate),
      amount: round2(Number(i.quantity) * Number(i.rate)),
    }));
    const subtotal = round2(lineItems.reduce((sum, i) => sum + i.amount, 0));
    const taxable = Math.max(subtotal - Number(discount), 0);
    const gst_amount = gst_applied ? round2(taxable * GST_RATE) : 0;
    const total_amount = round2(taxable + gst_amount);

    const [result] = await conn.query(
      `UPDATE quotations SET
       client_id=?, quotation_date=?, valid_until=?, proposal_type=?,
       subtotal=?, discount=?, gst_applied=?, gst_amount=?, total_amount=?, terms=?, notes=?, status=?
       WHERE id=?`,
      [client_id, quotation_date, valid_until, proposal_type,
       subtotal, discount, gst_applied, gst_amount, total_amount, terms, notes, status, id]
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Replace all line items rather than trying to diff old vs new
    await conn.query('DELETE FROM quotation_items WHERE quotation_id = ?', [id]);
    const rows = lineItems.map(i => [id, i.description, i.quantity, i.rate, i.amount]);
    await conn.query(
      'INSERT INTO quotation_items (quotation_id, description, quantity, rate, amount) VALUES ?',
      [rows]
    );

    await conn.commit();
    res.json({ message: 'Quotation updated successfully', total_amount });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error updating quotation', error: err.message });
  } finally {
    conn.release();
  }
};

exports.updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Draft', 'Sent', 'Accepted', 'Rejected'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${valid.join(', ')}` });
    }
    const [result] = await db.query('UPDATE quotations SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
};