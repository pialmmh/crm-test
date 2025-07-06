import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';

const db = require('./db.cjs');

dotenv.config({ path: './server/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

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
app.post('/partners', upload.single('nid'), (req, res) => {
  const { name, email, phone, address, partner_type } = req.body;
  if (
    !name ||
    !partner_type ||
    !['customer', 'vendor'].includes(partner_type)
  ) {
    return res
      .status(400)
      .json({ error: 'Name and valid partner_type are required' });
  }
  const nid_filename = req.file ? req.file.filename : null;
  db.query(
    'INSERT INTO partners (name, email, phone, address, partner_type, nid_filename) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, address, partner_type, nid_filename],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'DB error', details: err });
      db.query(
        'SELECT * FROM partners WHERE id = ?',
        [result.insertId],
        (err2, rows) => {
          if (err2)
            return res.status(500).json({ error: 'DB error', details: err2 });
          res.status(201).json({ partner: rows[0] });
        }
      );
    }
  );
});

// List partners
app.get('/partners', (req, res) => {
  db.query('SELECT * FROM partners ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });
    res.json({ partners: rows });
  });
});

// Update partner
app.put('/partners/:id', upload.single('nid'), (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, partner_type } = req.body;
  let updateFields = [name, email, phone, address, partner_type];
  let sql =
    'UPDATE partners SET name=?, email=?, phone=?, address=?, partner_type=?';
  if (req.file) {
    sql += ', nid_filename=?';
    updateFields.push(req.file.filename);
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
});

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
