const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const paymentController = require('../controllers/paymentController');

const uploadDir = path.join(__dirname, '..', 'uploads', 'payments');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.get('/', paymentController.getPayments);
router.post('/', upload.single('payment_proof'), paymentController.createPayment);
router.put('/:id', upload.single('payment_proof'), paymentController.updatePayment);

module.exports = router;