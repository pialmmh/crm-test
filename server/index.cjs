const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const multer = require('multer');
const db = require('./db.cjs');

dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 3001;

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

// Helper function to log responses
function logResponse(response) {
  console.log('Response:', JSON.stringify(response, null, 2));
}

// Chat endpoint using OpenAI Assistant
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const assistantId = 'asst_yWvaW6ZoRxPoTPBbeTwZP2s7';

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Step 1: Create a thread
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({}),
    });

    const threadData = await threadRes.json();
    if (!threadData.id) {
      console.error('Failed to create thread:', threadData);
      return res
        .status(500)
        .json({ error: 'Failed to create thread. See server logs.' });
    }

    const threadId = threadData.id;

    // Step 2: Add message to thread
    const messageRes = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          role: 'user',
          content: message,
        }),
      }
    );

    const messageData = await messageRes.json();
    if (!messageData.id) {
      console.error('Failed to add message:', messageData);
      return res
        .status(500)
        .json({ error: 'Failed to add message. See server logs.' });
    }

    // Step 3: Run the assistant
    const runRes = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          assistant_id: assistantId,
          model: 'gpt-4o',
        }),
      }
    );

    const runData = await runRes.json();
    if (!runData.id) {
      console.error('Failed to create run:', runData);
      return res
        .status(500)
        .json({ error: 'Failed to create run. See server logs.' });
    }

    const runId = runData.id;

    // Step 4: Poll for completion
    let runStatus = 'queued';
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (
      runStatus !== 'completed' &&
      runStatus !== 'failed' &&
      runStatus !== 'cancelled' &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2',
          },
        }
      );

      const statusData = await statusRes.json();
      runStatus = statusData.status;
      attempts++;
    }

    if (runStatus !== 'completed') {
      console.error('Run did not complete successfully:', runStatus);
      return res
        .status(500)
        .json({ error: 'Assistant run did not complete successfully.' });
    }

    // Step 5: Get the response
    const messagesRes = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );

    const messagesData = await messagesRes.json();
    if (!messagesData.data || messagesData.data.length === 0) {
      console.error('No messages found:', messagesData);
      return res.status(500).json({ error: 'No response from assistant.' });
    }

    // Get the latest assistant message
    const assistantMessage = messagesData.data.find(
      (msg) => msg.role === 'assistant'
    );
    if (
      !assistantMessage ||
      !assistantMessage.content ||
      !assistantMessage.content[0]
    ) {
      console.error('No assistant message found:', messagesData);
      return res
        .status(500)
        .json({ error: 'No valid response from assistant.' });
    }

    const content = assistantMessage.content[0].text.value;
    console.log('Assistant response content:', content);

    // Check if the response contains SQL code block
    if (content.includes('```sql')) {
      console.log('Found ```sql in response');
      // Extract SQL from code block
      const parts = content.split('```');
      console.log('Split parts:', parts);
      let sql = '';

      for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('sql')) {
          sql = parts[i].substring(3).trim(); // Remove 'sql' and trim
          console.log('Found SQL part at index', i, ':', parts[i]);
          break;
        }
      }

      if (sql) {
        console.log('Extracted SQL:', sql);
        try {
          // Execute the SQL query using callback-based approach
          db.query(sql, (sqlErr, rows, fields) => {
            if (sqlErr) {
              console.log('SQL execution error:', sqlErr.message);
              // If SQL execution fails, return the SQL with error
              const errorResponse = {
                response: content.trim(),
                sql: sql,
                error: sqlErr.message,
              };
              logResponse(errorResponse);
              res.json(errorResponse);
            } else {
              const columns = fields.map((f) => f.name);

              // Return both the SQL and the results
              const response = {
                response: content.trim(),
                sql: sql,
                results: {
                  rows: rows,
                  columns: columns,
                },
              };
              logResponse(response);
              res.json(response);
            }
          });
        } catch (err) {
          console.log('SQL execution error:', err.message);
          // If SQL execution fails, return the SQL with error
          const errorResponse = {
            response: content.trim(),
            sql: sql,
            error: err.message,
          };
          logResponse(errorResponse);
          res.json(errorResponse);
        }
      } else {
        console.log('No valid SQL found in code block');
        // No valid SQL found in code block
        const noSqlResponse = { response: content.trim() };
        logResponse(noSqlResponse);
        res.json(noSqlResponse);
      }
    } else {
      console.log('No ```sql found in response');
      // No SQL code block found, return just the message
      const textResponse = { response: content.trim() };
      logResponse(textResponse);
      res.json(textResponse);
    }
  } catch (err) {
    console.error('Error calling OpenAI Assistant:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Create partner
app.post('/partners', upload.single('nid'), (req, res) => {
  console.log('POST /partners - Body:', req.body);
  console.log('POST /partners - File:', req.file);

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
  const nid_filename = req.file ? req.file.filename : null;
  console.log('Inserting partner with data:', {
    name,
    email,
    phone,
    address,
    partner_type,
    nid_filename,
  });

  db.query(
    'INSERT INTO partners (name, email, phone, address, partner_type, nid_filename) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, address, partner_type, nid_filename],
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
