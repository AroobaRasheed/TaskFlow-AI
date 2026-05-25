import { Router } from 'express';
import ChatMessage from '../models/ChatMessage.js';
import { auth } from '../middleware/auth.js';
import { callGemini } from '../utils/gemini.js';

const router = Router();

// ─── Get chat history ─────────────────────────────────────────────────────
router.get('/history', auth, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Clear chat ───────────────────────────────────────────────────────────
router.delete('/clear', auth, async (req, res) => {
  try {
    const result = await ChatMessage.deleteMany({ userId: req.user._id });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
