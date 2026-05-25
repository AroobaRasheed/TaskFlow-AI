import { Router } from 'express';
import ChatMessage from '../models/ChatMessage.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// ─── Get chat history ─────────────────────────────────────────────────────
router.get('/history', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send message ─────────────────────────────────────────────────────────
router.post('/send', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

    let response;
    try {
      const prompt = `You are TaskFlow AI – a friendly, concise productivity assistant for project management teams.\nAnswer the following question with practical, actionable advice in 2-4 sentences.\n\nUser: ${message.trim()}`;
      response = await callGemini(prompt);
    } catch {
      response = "I'm currently in offline mode. Try: break the work into vertical slices, assign each to one engineer, and ship the riskiest piece first behind a feature flag.";
    }

    const chatMsg = await ChatMessage.create({
      userId: req.user._id,
      message: message.trim(),
      response,
    });

    res.json({ message: chatMsg.message, response: chatMsg.response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Clear chat ───────────────────────────────────────────────────────────
router.delete('/clear', auth, async (req, res) => {
  try {
    const result = await ChatMessage.deleteMany({ userId: req.user._id });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
