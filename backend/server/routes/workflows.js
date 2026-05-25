import { Router } from 'express';
import Workflow from '../models/Workflow.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// ─── List all workflows ───────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const workflows = await Workflow.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    const result = workflows.map(wf => {
      const obj = wf.toObject();
      const completed = obj.steps.filter(s => s.status === 'completed').length;
      return {
        ...obj,
        progress: obj.steps.length > 0 ? Math.round((completed / obj.steps.length) * 100) : 0,
      };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get single workflow ──────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const wf = await Workflow.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!wf) return res.status(404).json({ error: 'Workflow not found.' });
    res.json(wf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Create workflow ──────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, steps } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Workflow title is required.' });
    if (!steps?.length) return res.status(400).json({ error: 'At least one step is required.' });

    const wf = await Workflow.create({
      title: title.trim(),
      description: description?.trim(),
      createdBy: req.user._id,
      steps: steps.map((s, i) => ({
        title: s.title.trim(),
        description: s.description?.trim(),
        order: i + 1,
        status: i === 0 ? 'in_progress' : 'pending',
        assignedTo: s.assignedTo,
        estimatedHours: s.estimatedHours,
      })),
    });

    res.status(201).json(wf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Update step status ───────────────────────────────────────────────────
router.patch('/:id/steps/:stepId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const wf = await Workflow.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!wf) return res.status(404).json({ error: 'Workflow not found.' });

    const step = wf.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ error: 'Step not found.' });

    step.status = status;
    if (status === 'completed') step.completedAt = Date.now();

    // Auto-activate next step
    if (status === 'completed') {
      const nextStep = wf.steps.find(s => s.order === step.order + 1 && s.status === 'pending');
      if (nextStep) nextStep.status = 'in_progress';
    }

    await wf.save();
    res.json(wf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Delete workflow ──────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const wf = await Workflow.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!wf) return res.status(404).json({ error: 'Workflow not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
