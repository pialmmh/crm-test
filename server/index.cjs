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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
