const db = require('../db');

exports.getPayments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         p.*,
         c.client_name, c.company_name, c.mobile_number,
         q.quotation_number
       FROM client_payments p
       JOIN clients c ON p.client_id = c.id
       LEFT JOIN quotations q ON p.quotation_id = q.id
       ORDER BY p.payment_date DESC, p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payments', error: err.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const {
      client_id,
      quotation_id,
      project_name,
      payment_date,
      payment_type,
      payment_mode,
      total_amount,
      received_amount,
      transaction_id,
      payment_status,
    } = req.body;

    const total = Number(total_amount) || 0;
    const received = Number(received_amount) || 0;
    const pending = Math.max(total - received, 0);
    const status = payment_status || (received >= total && total > 0 ? 'Paid' : received > 0 ? 'Partial' : 'Pending');
    const proofPath = req.file ? `/uploads/payments/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO client_payments 
       (client_id, quotation_id, project_name, payment_date, payment_type, payment_mode, total_amount, received_amount, pending_amount, transaction_id, payment_status, payment_proof)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id,
        quotation_id || null,
        project_name || null,
        payment_date,
        payment_type,
        payment_mode,
        total,
        received,
        pending,
        transaction_id || null,
        status,
        proofPath,
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Payment recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating payment', error: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_id,
      quotation_id,
      project_name,
      payment_date,
      payment_type,
      payment_mode,
      total_amount,
      received_amount,
      transaction_id,
      payment_status,
      existing_proof,
    } = req.body;

    const total = Number(total_amount) || 0;
    const received = Number(received_amount) || 0;
    const pending = Math.max(total - received, 0);
    const status = payment_status || (received >= total && total > 0 ? 'Paid' : received > 0 ? 'Partial' : 'Pending');
    const proofPath = req.file ? `/uploads/payments/${req.file.filename}` : (existing_proof || null);

    await db.query(
      `UPDATE client_payments SET
         client_id = ?, quotation_id = ?, project_name = ?, payment_date = ?,
         payment_type = ?, payment_mode = ?, total_amount = ?, received_amount = ?,
         pending_amount = ?, transaction_id = ?, payment_status = ?, payment_proof = ?
       WHERE id = ?`,
      [
        client_id,
        quotation_id || null,
        project_name || null,
        payment_date,
        payment_type,
        payment_mode,
        total,
        received,
        pending,
        transaction_id || null,
        status,
        proofPath,
        id,
      ]
    );

    res.json({ message: 'Payment updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment', error: err.message });
  }
};