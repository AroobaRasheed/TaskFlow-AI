import { Router } from 'express';
import Task from '../models/Task.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const isOverdue = (deadline) => deadline && deadline < Date.now();
const calcScore = (completed, total) => total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));

// ─── Dashboard stats ──────────────────────────────────────────────────────
router.get('/stats', auth, async (req, res) => {
  try {
    const tasks = await Task.find();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const overdue = tasks.filter(t => t.status !== 'completed' && isOverdue(t.deadline)).length;

    res.json({
      total, completed, inProgress, todo, overdue,
      productivityScore: calcScore(completed, total),
      priorityBreakdown: {
        high: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
        medium: tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length,
        low: tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Recent activity ──────────────────────────────────────────────────────
router.get('/recent', auth, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).limit(10);
    res.json(tasks.map(t => ({
      _id: t._id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      updatedAt: t.updatedAt,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Status distribution ──────────────────────────────────────────────────
router.get('/distribution', auth, async (req, res) => {
  try {
    const tasks = await Task.find();
    const total = tasks.length || 1;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;

    res.json([
      { label: 'To Do', count: todo, pct: Math.round((todo / total) * 100) },
      { label: 'In Progress', count: inProgress, pct: Math.round((inProgress / total) * 100) },
      { label: 'Completed', count: completed, pct: Math.round((completed / total) * 100) },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
