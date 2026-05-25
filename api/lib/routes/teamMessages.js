import { Router } from 'express';
import TeamMessage from '../models/TeamMessage.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// ─── Get messages ─────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const messages = await TeamMessage.find().sort({ createdAt: -1 }).limit(limit);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send message ─────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { content, senderName, senderInitials, senderColor, senderId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required.' });

    const msg = await TeamMessage.create({
      senderId: senderId || `user:${req.user._id}`,
      senderName: senderName || req.user.name,
      senderInitials: senderInitials || req.user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      senderColor: senderColor || '#8B5CF6',
      content: content.trim(),
    });

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
