const db = require('../db');

exports.getAllEmployees = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM employees WHERE status = 'Active' ORDER BY employee_name"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employees', error: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { employee_name, employee_code, role, mobile_number, email, joining_date } = req.body;
    const [result] = await db.query(
      `INSERT INTO employees (employee_name, employee_code, role, mobile_number, email, joining_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_name, employee_code, role, mobile_number, email, joining_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Employee created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating employee', error: err.message });
  }
};