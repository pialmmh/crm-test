const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const db = require('./db.cjs');

dotenv.config({ path: './server/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('./server/uploads'));

// AI Agent Prompt
const SYSTEM_PROMPT = `You are a helpful, concise AI assistant. Your responses should be:
- Clear and direct
- Helpful and informative
- Concise but complete
- Friendly and professional
- Focused on solving the user's problem

Keep responses brief while ensuring they fully address the user's question or request.`;

// Multer setup for NID upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './server/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    const aiResponse = completion.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({
      error: 'Failed to get response from AI. Please try again.',
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Create partner
app.post(
  '/partners',
  upload.fields([
    { name: 'nid', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
  ]),
  (req, res) => {
    console.log('POST /partners - Body:', req.body);
    console.log('POST /partners - Files:', req.files);

    const { name, email, phone, address, partner_type } = req.body;
    if (
      !name ||
      !partner_type ||
      !['customer', 'vendor'].includes(partner_type)
    ) {
      console.log('Validation failed:', { name, partner_type });
      return res
        .status(400)
        .json({ error: 'Name and valid partner_type are required' });
    }
    const nid_filename = req.files?.nid?.[0]?.filename || null;
    const passport_filename = req.files?.passport?.[0]?.filename || null;
    console.log('Inserting partner with data:', {
      name,
      email,
      phone,
      address,
      partner_type,
      nid_filename,
      passport_filename,
    });

    db.query(
      'INSERT INTO partners (name, email, phone, address, partner_type, nid_filename, passport_filename) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        email,
        phone,
        address,
        partner_type,
        nid_filename,
        passport_filename,
      ],
      (err, result) => {
        if (err) {
          console.error('Database insert error:', err);
          return res.status(500).json({ error: 'DB error', details: err });
        }

        console.log('Insert successful, ID:', result.insertId);

        db.query(
          'SELECT * FROM partners WHERE id = ?',
          [result.insertId],
          (err2, rows) => {
            if (err2) {
              console.error('Database select error:', err2);
              return res.status(500).json({ error: 'DB error', details: err2 });
            }
            console.log('Partner created:', rows[0]);
            res.status(201).json({ partner: rows[0] });
          }
        );
      }
    );
  }
);

// List partners
app.get('/partners', (req, res) => {
  db.query('SELECT * FROM partners ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });
    res.json({ partners: rows });
  });
});

// Update partner
app.put(
  '/partners/:id',
  upload.fields([
    { name: 'nid', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
  ]),
  (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, partner_type } = req.body;
    let updateFields = [name, email, phone, address, partner_type];
    let sql =
      'UPDATE partners SET name=?, email=?, phone=?, address=?, partner_type=?';

    if (req.files?.nid?.[0]) {
      sql += ', nid_filename=?';
      updateFields.push(req.files.nid[0].filename);
    }

    if (req.files?.passport?.[0]) {
      sql += ', passport_filename=?';
      updateFields.push(req.files.passport[0].filename);
    }

    sql += ' WHERE id=?';
    updateFields.push(id);

    db.query(sql, updateFields, (err, result) => {
      if (err) return res.status(500).json({ error: 'DB error', details: err });
      db.query('SELECT * FROM partners WHERE id = ?', [id], (err2, rows) => {
        if (err2)
          return res.status(500).json({ error: 'DB error', details: err2 });
        res.json({ partner: rows[0] });
      });
    });
  }
);

// Delete partner
app.delete('/partners/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM partners WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });
    res.json({ success: true });
  });
});

// ========== PACKAGE MANAGEMENT ENDPOINTS ==========

// Get all packages
app.get('/packages', (req, res) => {
  const sql =
    'SELECT * FROM packages WHERE is_active = TRUE ORDER BY price ASC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });
    res.json({ packages: results });
  });
});

// Get package by ID
app.get('/packages/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM packages WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });
    if (results.length === 0)
      return res.status(404).json({ error: 'Package not found' });
    res.json({ package: results[0] });
  });
});

// Create new package
app.post('/packages', (req, res) => {
  const { name, description, speed_mbps, validity_days, price, is_active } =
    req.body;

  if (!name || !speed_mbps || !validity_days || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql =
    'INSERT INTO packages (name, description, speed_mbps, validity_days, price, is_active) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [
    name,
    description || '',
    speed_mbps,
    validity_days,
    price,
    is_active !== undefined ? is_active : true,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });

    // Get the created package
    db.query(
      'SELECT * FROM packages WHERE id = ?',
      [result.insertId],
      (err2, rows) => {
        if (err2)
          return res.status(500).json({ error: 'DB error', details: err2 });
        res.json({ package: rows[0] });
      }
    );
  });
});

// Update package
app.put('/packages/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, speed_mbps, validity_days, price, is_active } =
    req.body;

  if (!name || !speed_mbps || !validity_days || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql =
    'UPDATE packages SET name=?, description=?, speed_mbps=?, validity_days=?, price=?, is_active=? WHERE id=?';
  const values = [
    name,
    description || '',
    speed_mbps,
    validity_days,
    price,
    is_active !== undefined ? is_active : true,
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });

    // Get the updated package
    db.query('SELECT * FROM packages WHERE id = ?', [id], (err2, rows) => {
      if (err2)
        return res.status(500).json({ error: 'DB error', details: err2 });
      if (rows.length === 0)
        return res.status(404).json({ error: 'Package not found' });
      res.json({ package: rows[0] });
    });
  });
});

// Delete package
app.delete('/packages/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'UPDATE packages SET is_active = FALSE WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'DB error', details: err });
      res.json({ success: true });
    }
  );
});

// ========== CUSTOMER PACKAGE ENDPOINTS ==========

// Get customer packages (with package details)
app.get('/customers/:customerId/packages', (req, res) => {
  const { customerId } = req.params;
  const sql = `
    SELECT cp.*, p.name as package_name, p.description as package_description, 
           p.speed_mbps, p.validity_days, p.price
    FROM customer_packages cp
    JOIN packages p ON cp.package_id = p.id
    WHERE cp.customer_id = ?
    ORDER BY cp.purchase_date DESC
  `;

  db.query(sql, [customerId], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });
    res.json({ customerPackages: results });
  });
});

// Purchase package for customer
app.post('/customers/:customerId/packages', (req, res) => {
  const { customerId } = req.params;
  const { package_id, start_date, payment_method, notes } = req.body;

  if (!package_id || !start_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // First, get package details to calculate end date and amount
  db.query(
    'SELECT * FROM packages WHERE id = ? AND is_active = TRUE',
    [package_id],
    (err, packageResults) => {
      if (err) return res.status(500).json({ error: 'DB error', details: err });
      if (packageResults.length === 0)
        return res.status(404).json({ error: 'Package not found or inactive' });

      const package = packageResults[0];
      const startDate = new Date(start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + package.validity_days);

      const sql = `
      INSERT INTO customer_packages 
      (customer_id, package_id, start_date, end_date, amount_paid, payment_method, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `;
      const values = [
        customerId,
        package_id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        package.price,
        payment_method || 'cash',
        notes || '',
      ];

      db.query(sql, values, (err, result) => {
        if (err)
          return res.status(500).json({ error: 'DB error', details: err });

        // Get the created customer package with package details
        const selectSql = `
        SELECT cp.*, p.name as package_name, p.description as package_description, 
               p.speed_mbps, p.validity_days, p.price
        FROM customer_packages cp
        JOIN packages p ON cp.package_id = p.id
        WHERE cp.id = ?
      `;

        db.query(selectSql, [result.insertId], (err2, rows) => {
          if (err2)
            return res.status(500).json({ error: 'DB error', details: err2 });
          res.json({ customerPackage: rows[0] });
        });
      });
    }
  );
});

// Update customer package status
app.put('/customers/:customerId/packages/:packageId', (req, res) => {
  const { customerId, packageId } = req.params;
  const { status, notes } = req.body;

  if (!status || !['active', 'expired', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const sql =
    'UPDATE customer_packages SET status=?, notes=? WHERE id=? AND customer_id=?';
  const values = [status, notes || '', packageId, customerId];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
