import { Router } from 'express';
import Task from '../models/Task.js';
import Analytics from '../models/Analytics.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const isOverdue = (d) => d && d < Date.now();
const calcScore = (c, t) => t === 0 ? 0 : Math.min(100, Math.round((c / t) * 100));

function currentWeekLabel() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ─── Live productivity score ──────────────────────────────────────────────
router.get('/score', auth, async (req, res) => {
  try {
    const tasks = await Task.find();
    const completed = tasks.filter(t => t.status === 'completed').length;
    res.json({ score: calcScore(completed, tasks.length), total: tasks.length, completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Overdue count ────────────────────────────────────────────────────────
router.get('/overdue', auth, async (req, res) => {
  try {
    const tasks = await Task.find();
    const overdue = tasks.filter(t => t.status !== 'completed' && isOverdue(t.deadline));
    res.json({ count: overdue.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Weekly trends ────────────────────────────────────────────────────────
router.get('/trends', auth, async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 8;
    const snapshots = await Analytics.find().sort({ createdAt: -1 }).limit(weeks);
    res.json(snapshots.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
