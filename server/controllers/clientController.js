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