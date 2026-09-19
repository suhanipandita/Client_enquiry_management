const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('Describe enquiries');
    res.json({ status: 'ok', message: 'Server is running', dbCheck: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: err.message });
  }
});

const enquiryRoutes = require('./routes/enquiryRoutes');
app.use('/api/enquiries', enquiryRoutes);

const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});