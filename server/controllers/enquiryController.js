const db = require('../db');
const { findOrCreateClient } = require('./clientController');

// CREATE a new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const {
      client_name, company_name, mobile_number, email, address, // client fields
      enquiry_date, source, service_required, requirement_description,
      assigned_employee_id, follow_up_date, status, notes
    } = req.body;

    const client_id = await findOrCreateClient({ client_name, company_name, mobile_number, email, address });

    const [result] = await db.query(
      `INSERT INTO enquiries
       (client_id, enquiry_date, source, service_required, requirement_description,
        assigned_employee_id, follow_up_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_id, enquiry_date, source, service_required, requirement_description,
       assigned_employee_id, follow_up_date, status || 'New', notes]
    );

    res.status(201).json({ id: result.insertId, client_id, message: 'Enquiry created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating enquiry', error: err.message });
  }
};

// READ all enquiries (with client + employee details joined in)
exports.getAllEnquiries = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         e.id, e.enquiry_date, e.source, e.service_required, e.requirement_description,
         e.follow_up_date, e.status, e.notes, e.created_at,
         c.id AS client_id, c.client_name, c.company_name, c.mobile_number, c.email, c.address,
         emp.id AS employee_id, emp.employee_name
       FROM enquiries e
       JOIN clients c ON e.client_id = c.id
       LEFT JOIN employees emp ON e.assigned_employee_id = emp.id
       ORDER BY e.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enquiries', error: err.message });
  }
};

// READ one enquiry by ID (with client + employee details joined in)
exports.getEnquiryById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         e.id, e.enquiry_date, e.source, e.service_required, e.requirement_description,
         e.follow_up_date, e.status, e.notes, e.created_at,
         c.id AS client_id, c.client_name, c.company_name, c.mobile_number, c.email, c.address,
         emp.id AS employee_id, emp.employee_name
       FROM enquiries e
       JOIN clients c ON e.client_id = c.id
       LEFT JOIN employees emp ON e.assigned_employee_id = emp.id
       WHERE e.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enquiry', error: err.message });
  }
};

// UPDATE an enquiry (enquiry fields only — client details are updated separately via clientController)
exports.updateEnquiry = async (req, res) => {
  try {
    const {
      enquiry_date, source, service_required, requirement_description,
      assigned_employee_id, follow_up_date, status, notes
    } = req.body;

    const [result] = await db.query(
      `UPDATE enquiries SET
       enquiry_date=?, source=?, service_required=?, requirement_description=?,
       assigned_employee_id=?, follow_up_date=?, status=?, notes=?
       WHERE id=?`,
      [enquiry_date, source, service_required, requirement_description,
       assigned_employee_id, follow_up_date, status, notes, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Enquiry not found' });
    res.json({ message: 'Enquiry updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating enquiry', error: err.message });
  }
};

// DELETE an enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM enquiries WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Enquiry not found' });
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting enquiry', error: err.message });
  }
};

// SEARCH enquiries (matches against joined client fields)
exports.searchEnquiries = async (req, res) => {
  try {
    const { keyword } = req.query;
    const [rows] = await db.query(
      `SELECT
         e.id, e.status, e.enquiry_date,
         c.client_name, c.company_name, c.mobile_number, c.email
       FROM enquiries e
       JOIN clients c ON e.client_id = c.id
       WHERE c.client_name LIKE ? OR c.company_name LIKE ? OR c.mobile_number LIKE ? OR c.email LIKE ?
       ORDER BY e.created_at DESC`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error searching enquiries', error: err.message });
  }
};