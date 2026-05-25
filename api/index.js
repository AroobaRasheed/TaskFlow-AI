import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';
import chatRoutes from './routes/chat.js';
import aiRoutes from './routes/ai.js';
import progressRoutes from './routes/progress.js';
import analyticsRoutes from './routes/analytics.js';
import teamMemberRoutes from './routes/teamMembers.js';
import teamMessageRoutes from './routes/teamMessages.js';
import workflowRoutes from './routes/workflows.js';
import notificationRoutes from './routes/notifications.js';

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

export default app;
