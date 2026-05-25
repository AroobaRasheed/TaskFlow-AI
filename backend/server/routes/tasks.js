import { Router } from 'express';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const isOverdue = (deadline) => deadline && deadline < Date.now();

// ─── Get all tasks ────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    filter.createdBy = req.user._id;

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(100);
    const result = tasks.map(t => ({
      ...t.toObject(),
      isOverdue: t.status !== 'completed' && isOverdue(t.deadline),
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get single task ──────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ ...task.toObject(), isOverdue: task.status !== 'completed' && isOverdue(task.deadline) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Create task ──────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, status, deadline, assignedTo, estimatedTime } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Task title is required.' });

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      priority: priority || 'medium',
      status: status || 'todo',
      deadline,
      assignedTo,
      estimatedTime,
      createdBy: req.user._id,
    });

    await Notification.create({
      userId: req.user._id,
      title: 'Task Created',
      message: `"${title}" has been added to your board.`,
      type: 'success',
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Update task ──────────────────────────────────────────────────────────
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const allowed = ['title', 'description', 'priority', 'status', 'deadline', 'assignedTo', 'estimatedTime', 'aiSuggestions'];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) task[key] = req.body[key];
    });

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Update task status ───────────────────────────────────────────────────
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, { status }, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Delete task ──────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
