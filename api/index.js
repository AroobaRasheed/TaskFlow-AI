import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import userRoutes from './lib/routes/users.js';
import taskRoutes from './lib/routes/tasks.js';
import dashboardRoutes from './lib/routes/dashboard.js';
import chatRoutes from './lib/routes/chat.js';
import aiRoutes from './lib/routes/ai.js';
import progressRoutes from './lib/routes/progress.js';
import analyticsRoutes from './lib/routes/analytics.js';
import teamMemberRoutes from './lib/routes/teamMembers.js';
import teamMessageRoutes from './lib/routes/teamMessages.js';
import workflowRoutes from './lib/routes/workflows.js';
import notificationRoutes from './lib/routes/notifications.js';
import assistantRoutes from './lib/routes/assistant.js';

const app = express();

// ─── MongoDB connection caching for serverless ──────────────────────────────
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/team-members', teamMemberRoutes);
app.use('/api/team-messages', teamMessageRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assistant', assistantRoutes);

export default app;
