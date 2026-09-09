const fs = require('fs');
const path = 'server.ts';
let content = fs.readFileSync(path, 'utf8');

const dbCode = `
import fs from 'fs';
const DB_FILE = path.join(process.cwd(), 'database.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ audits: {} }, null, 2));
}

// Get all audits
app.get('/api/v1/audits', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json(data.audits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read database' });
  }
});

// Save new audit
app.post('/api/v1/audits', (req, res) => {
  try {
    const newAudit = req.body;
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    data.audits[newAudit.id] = newAudit;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

  // AI Orchestration Endpoint`;

content = content.replace("  // AI Orchestration Endpoint", dbCode);
fs.writeFileSync(path, content);
