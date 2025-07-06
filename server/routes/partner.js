// File: server/routes/partner.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Create partner
router.post('/', upload.single('nid'), (req, res) => {
  const { name, email, phone, address, partner_type } = req.body;
  const nid_filename = req.file?.filename || null;

  const sql = `INSERT INTO partners (name, email, phone, address, partner_type, nid_filename)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [name, email, phone, address, partner_type, nid_filename],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId });
    }
  );
});

// Get all partners
router.get('/', (req, res) => {
  db.query('SELECT * FROM partners', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
