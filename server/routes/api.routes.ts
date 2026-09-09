import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { AIService } from '../services/ai.service';

const router = Router();
const aiService = new AIService();
const DB_FILE = path.join(process.cwd(), 'database.json');

router.get('/v1/audits', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json(data.audits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read database' });
  }
});

router.post('/v1/audits', (req, res) => {
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

router.post('/v1/audit', async (req, res) => {
  try {
    const { title, price, rawSpecs } = req.body;
    const aiData = await aiService.runAuditPipeline(title, price, rawSpecs);
    res.json(aiData);
  } catch (error) {
    console.error("AI Engine Error:", error);
    res.status(500).json({ error: "Failed to run AI Audit" });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { query, contextData } = req.body;
    const response = await aiService.runChat(query, contextData);
    res.json({ response });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});

export default router;
