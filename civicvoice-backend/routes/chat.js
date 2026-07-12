const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { one } = require('../db');
const router = express.Router();
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

router.post('/', async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required.' });
  if (!genAI) return res.json({ reply: 'AI assistant is not configured (missing API key).' });
  try {
    const total = (await one('SELECT COUNT(*)::int c FROM complaints')).c;
    const resolved = (await one("SELECT COUNT(*)::int c FROM complaints WHERE status='Resolved'")).c;
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: `You are the CivicVoice assistant for an Indian public-grievance platform.
Help citizens with: filing a complaint (3 steps — 1) title, category, live GPS location and a 10+ word description,
2) mandatory photo/video evidence, 3) automatic AI proof gate that verifies the image), categories
(Roads, Water, Electricity, Sanitation, Corruption, Other), privacy (only a pseudonymous Citizen ID like CIT7SI21L
is public; name, phone, Aadhaar are encrypted), tracking complaints on the public page, blockchain SHA-256 hashing
(tamper-proof), and department routing. There are currently ${total} complaints, ${resolved} resolved.
Keep answers short, friendly, and practical. If asked something unrelated, gently steer back to civic grievances.`,
    });
    const contents = [];
    (history || []).slice(-8).forEach(h => contents.push({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] }));
    contents.push({ role: 'user', parts: [{ text: message }] });
    const result = await model.generateContent({ contents });
    res.json({ reply: result.response.text() });
  } catch (e) {
    console.error('[chat] error:', e.message);
    res.json({ reply: "Sorry, I couldn't process that right now. Please try again." });
  }
});
module.exports = router;