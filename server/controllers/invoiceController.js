const db = require('../db');

exports.getInvoices = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         i.*,
         c.client_name, c.company_name, c.mobile_number, c.email, c.address,
         q.quotation_number
       FROM invoices i
       JOIN clients c ON i.client_id = c.id
       LEFT JOIN quotations q ON i.quotation_id = q.id
       ORDER BY i.invoice_date DESC, i.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const [invoices] = await db.query(
      `SELECT 
         i.*,
         c.client_name, c.company_name, c.mobile_number, c.email, c.address
       FROM invoices i
       JOIN clients c ON i.client_id = c.id
       WHERE i.id = ?`,
      [id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const [items] = await db.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC',
      [id]
    );

    res.json({ ...invoices[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invoice details', error: err.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const {
      client_id,
      quotation_id,
      invoice_date,
      discount = 0,
      gst_applied = false,
      payment_status = 'Pending',
      notes = '',
      items = [],
    } = req.body;

    const cleanItems = items
      .filter((item) => item.description && item.description.trim())
      .map((item) => {
        const qty = Number(item.quantity) || 1;
        const rate = Number(item.rate) || 0;
        return {
          description: item.description.trim(),
          quantity: qty,
          rate,
          amount: qty * rate,
        };
      });

    const subtotal = cleanItems.reduce((sum, item) => sum + item.amount, 0);
    const disc = Number(discount) || 0;
    const taxable = Math.max(subtotal - disc, 0);
    const taxAmount = gst_applied ? Number((taxable * 0.18).toFixed(2)) : 0;
    const grandTotal = Number((taxable + taxAmount).toFixed(2));

    // Generate next invoice number: INV-YYYY-0001
    const year = new Date().getFullYear();
    const [[{ maxId }]] = await db.query('SELECT COALESCE(MAX(id), 0) AS maxId FROM invoices');
    const invoiceNumber = `INV-${year}-${String(maxId + 1).padStart(4, '0')}`;

    const [result] = await db.query(
      `INSERT INTO invoices 
       (invoice_number, client_id, quotation_id, invoice_date, subtotal, discount, gst_applied, tax_amount, grand_total, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber,
        client_id,
        quotation_id || null,
        invoice_date,
        subtotal,
        disc,
        Boolean(gst_applied),
        taxAmount,
        grandTotal,
        payment_status,
        notes || null,
      ]
    );

    const invoiceId = result.insertId;

    for (const item of cleanItems) {
      await db.query(
        'INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)',
        [invoiceId, item.description, item.quantity, item.rate, item.amount]
      );
    }

    res.status(201).json({ id: invoiceId, invoice_number: invoiceNumber, message: 'Invoice created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating invoice', error: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_id,
      quotation_id,
      invoice_date,
      discount = 0,
      gst_applied = false,
      payment_status = 'Pending',
      notes = '',
      items = [],
    } = req.body;

    const cleanItems = items
      .filter((item) => item.description && item.description.trim())
      .map((item) => {
        const qty = Number(item.quantity) || 1;
        const rate = Number(item.rate) || 0;
        return {
          description: item.description.trim(),
          quantity: qty,
          rate,
          amount: qty * rate,
        };
      });

    const subtotal = cleanItems.reduce((sum, item) => sum + item.amount, 0);
    const disc = Number(discount) || 0;
    const taxable = Math.max(subtotal - disc, 0);
    const taxAmount = gst_applied ? Number((taxable * 0.18).toFixed(2)) : 0;
    const grandTotal = Number((taxable + taxAmount).toFixed(2));

    await db.query(
      `UPDATE invoices SET
         client_id = ?, quotation_id = ?, invoice_date = ?, subtotal = ?,
         discount = ?, gst_applied = ?, tax_amount = ?, grand_total = ?,
         payment_status = ?, notes = ?
       WHERE id = ?`,
      [
        client_id,
        quotation_id || null,
        invoice_date,
        subtotal,
        disc,
        Boolean(gst_applied),
        taxAmount,
        grandTotal,
        payment_status,
        notes || null,
        id,
      ]
    );

    await db.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);

    for (const item of cleanItems) {
      await db.query(
        'INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)',
        [id, item.description, item.quantity, item.rate, item.amount]
      );
    }

    res.json({ message: 'Invoice updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating invoice', error: err.message });
  }
};