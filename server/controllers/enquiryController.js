const db = require('../db');

// CREATE a new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const {
      client_name, company_name, mobile_number, email, address,
      enquiry_date, source, service_required, requirement_description,
      assigned_employee, follow_up_date, status, notes
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO enquiries
       (client_name, company_name, mobile_number, email, address,
        enquiry_date, source, service_required, requirement_description,
        assigned_employee, follow_up_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_name, company_name, mobile_number, email, address,
       enquiry_date, source, service_required, requirement_description,
       assigned_employee, follow_up_date, status || 'New', notes]
    );

    res.status(201).json({ id: result.insertId, message: 'Enquiry created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating enquiry', error: err.message });
  }
};

// READ all enquiries
exports.getAllEnquiries = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM enquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enquiries', error: err.message });
  }
};

// READ one enquiry by ID
exports.getEnquiryById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enquiry', error: err.message });
  }
};

// UPDATE an enquiry
exports.updateEnquiry = async (req, res) => {
  try {
    const {
      client_name, company_name, mobile_number, email, address,
      enquiry_date, source, service_required, requirement_description,
      assigned_employee, follow_up_date, status, notes
    } = req.body;

    const [result] = await db.query(
      `UPDATE enquiries SET
       client_name=?, company_name=?, mobile_number=?, email=?, address=?,
       enquiry_date=?, source=?, service_required=?, requirement_description=?,
       assigned_employee=?, follow_up_date=?, status=?, notes=?
       WHERE id=?`,
      [client_name, company_name, mobile_number, email, address,
       enquiry_date, source, service_required, requirement_description,
       assigned_employee, follow_up_date, status, notes, req.params.id]
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

// SEARCH enquiries
exports.searchEnquiries = async (req, res) => {
  try {
    const { keyword } = req.query;
    const [rows] = await db.query(
      `SELECT * FROM enquiries
       WHERE client_name LIKE ? OR company_name LIKE ? OR mobile_number LIKE ? OR email LIKE ?
       ORDER BY created_at DESC`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error searching enquiries', error: err.message });
  }
};