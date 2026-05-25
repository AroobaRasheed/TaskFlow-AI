import { Router } from 'express';
import Task from '../models/Task.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const isOverdue = (d) => d && d < Date.now();
const calcScore = (c, t) => t === 0 ? 0 : Math.min(100, Math.round((c / t) * 100));

// ─── Team progress ────────────────────────────────────────────────────────
router.get('/team', auth, async (req, res) => {
  try {
    const tasks = await Task.find();
    const byStatus = {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
    res.json({
      total: tasks.length,
      byStatus,
      byPriority: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      },
      completionRate: calcScore(byStatus.completed, tasks.length),
      overdueCount: tasks.filter(t => t.status !== 'completed' && isOverdue(t.deadline)).length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Upcoming deadlines ───────────────────────────────────────────────────
router.get('/deadlines', auth, async (req, res) => {
  try {
    const now = Date.now();
    const sevenDays = now + 7 * 24 * 60 * 60 * 1000;
    const tasks = await Task.find({
      status: { $ne: 'completed' },
      deadline: { $gte: now, $lte: sevenDays },
    }).sort({ deadline: 1 });

    res.json(tasks.map(t => ({
      _id: t._id,
      title: t.title,
      priority: t.priority,
      deadline: t.deadline,
      status: t.status,
      daysLeft: Math.ceil((t.deadline - now) / (1000 * 60 * 60 * 24)),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
