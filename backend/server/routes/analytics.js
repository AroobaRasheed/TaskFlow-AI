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
    const tasks = await Task.find({ createdBy: req.user._id });
    const completed = tasks.filter(t => t.status === 'completed').length;
    res.json({ score: calcScore(completed, tasks.length), total: tasks.length, completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Overdue count ────────────────────────────────────────────────────────
router.get('/overdue', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id });
    const overdue = tasks.filter(t => t.status !== 'completed' && isOverdue(t.deadline));
    res.json({ count: overdue.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Weekly trends ────────────────────────────────────────────────────────
router.get('/trends', auth, async (req, res) => {
  try {
    const weeks = Math.min(Math.max(parseInt(req.query.weeks) || 8, 1), 52);
    const snapshots = await Analytics.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(weeks);
    res.json(snapshots.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
