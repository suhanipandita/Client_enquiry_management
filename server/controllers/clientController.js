const db = require('../db');

// Find a client by mobile number, or create one if it doesn't exist
exports.findOrCreateClient = async (clientData) => {
  const { client_name, company_name, mobile_number, email, address } = clientData;

  const [existing] = await db.query(
    'SELECT id FROM clients WHERE mobile_number = ?',
    [mobile_number]
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [result] = await db.query(
    `INSERT INTO clients (client_name, company_name, mobile_number, email, address)
     VALUES (?, ?, ?, ?, ?)`,
    [client_name, company_name, mobile_number, email, address]
  );

  return result.insertId;
};

// READ all clients
exports.getAllClients = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients ORDER BY client_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching clients', error: err.message });
  }
};

// READ one client by ID
exports.getClientById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Client not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching client', error: err.message });
  }
};

// UPDATE a client (e.g. their phone number or address changed)
exports.updateClient = async (req, res) => {
  try {
    const { client_name, company_name, mobile_number, email, address } = req.body;
    const [result] = await db.query(
      `UPDATE clients SET client_name=?, company_name=?, mobile_number=?, email=?, address=?
       WHERE id=?`,
      [client_name, company_name, mobile_number, email, address, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating client', error: err.message });
  }
};