import { Router } from 'express';
import TeamMember from '../models/TeamMember.js';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];
const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// ─── List team members ────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const members = await TeamMember.find({ addedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Add team member ──────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    if (!name?.trim() || !email?.trim() || !role?.trim()) {
      return res.status(400).json({ error: 'Name, email and role are required.' });
    }

    const existing = await TeamMember.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'A member with this email already exists.' });

    const member = await TeamMember.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role.trim(),
      department: department?.trim(),
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      avatarInitials: getInitials(name.trim()),
      status: 'offline',
      addedBy: req.user._id,
    });

    await Notification.create({
      userId: req.user._id,
      title: 'Team Member Added',
      message: `${name.trim()} has been added to your team.`,
      type: 'success',
    });

    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Update team member ───────────────────────────────────────────────────
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) {
      updates.name = req.body.name.trim();
      updates.avatarInitials = getInitials(req.body.name.trim());
    }
    if (req.body.role !== undefined) updates.role = req.body.role.trim();
    if (req.body.department !== undefined) updates.department = req.body.department;
    if (req.body.status !== undefined) updates.status = req.body.status;

    const member = await TeamMember.findOneAndUpdate({ _id: req.params.id, addedBy: req.user._id }, updates, { new: true });
    if (!member) return res.status(404).json({ error: 'Member not found.' });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Remove team member ───────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findOneAndDelete({ _id: req.params.id, addedBy: req.user._id });
    if (!member) return res.status(404).json({ error: 'Member not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
