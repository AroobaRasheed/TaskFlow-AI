import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import EmailVerification from '../models/EmailVerification.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Generate JWT
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ─── Sign up ──────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'member',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    // Generate OTP
    const token = String(Math.floor(100000 + Math.random() * 900000));
    await EmailVerification.create({
      email: user.email,
      token,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    // Try sending via Resend, fall back to dev mode
    let devToken = null;
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'TaskFlow AI <onboarding@resend.dev>',
            to: [user.email],
            subject: 'Your TaskFlow AI verification code',
            html: `<h2>Your code: ${token}</h2><p>Expires in 15 minutes.</p>`,
          }),
        });
        if (!r.ok) devToken = token;
      } catch {
        devToken = token;
      }
    } else {
      devToken = token;
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: signToken(user._id),
      devToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Verify email OTP ─────────────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { email, token } = req.body;
    const record = await EmailVerification.findOne({ token, used: false });

    if (!record) return res.status(400).json({ error: 'Invalid verification code.' });
    if (record.email !== email.toLowerCase()) return res.status(400).json({ error: 'Code does not match this email.' });
    if (record.expiresAt < Date.now()) return res.status(400).json({ error: 'Code has expired. Please request a new one.' });

    record.used = true;
    await record.save();

    await User.findOneAndUpdate({ email: email.toLowerCase() }, { emailVerified: true });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'No account found with this email.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password.' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      token: signToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get current user ─────────────────────────────────────────────────────
router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

// ─── Update profile ───────────────────────────────────────────────────────
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, avatar, role } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (avatar !== undefined) updates.avatar = avatar;
    if (role !== undefined) updates.role = role;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── List all users ───────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Resend OTP ───────────────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    await EmailVerification.deleteMany({ email: email.toLowerCase() });

    const token = String(Math.floor(100000 + Math.random() * 900000));
    await EmailVerification.create({
      email: email.toLowerCase(),
      token,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    let devToken = token; // always return in dev for now
    res.json({ success: true, devToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
