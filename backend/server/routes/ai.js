import { Router } from 'express';
import { auth } from '../middleware/auth.js';

const router = Router();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// ─── Analyze task ─────────────────────────────────────────────────────────
router.post('/analyze', auth, async (req, res) => {
  try {
    const { title, description, deadline, teamSize } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Task title is required.' });

    const prompt = `You are an expert project management AI. Analyze this task and respond ONLY with valid JSON.

Task Title: ${title}
Description: ${description || 'not specified'}
Deadline: ${deadline ? new Date(deadline).toLocaleDateString() : 'not specified'}
Team Size: ${teamSize || 1}

Return exactly this JSON shape (no markdown, no extra text):
{
  "priority": "low" | "medium" | "high",
  "estimatedHours": <number>,
  "riskLevel": "low" | "medium" | "high",
  "workflowSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "productivityAdvice": "<one sentence advice>"
}`;

    try {
      const raw = await callGemini(prompt);
      const clean = raw.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(clean);
      res.json(analysis);
    } catch {
      // Fallback
      res.json({
        priority: 'medium',
        estimatedHours: 4,
        riskLevel: 'medium',
        workflowSuggestions: [
          'Break the task into smaller subtasks.',
          'Schedule daily check-ins.',
          'Define clear acceptance criteria.',
        ],
        productivityAdvice: 'Focus on high-impact activities first to maximize output.',
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Productivity insights ────────────────────────────────────────────────
router.post('/insights', auth, async (req, res) => {
  try {
    const { completedTasks, pendingTasks, overdueTasks, productivityScore } = req.body;
    const prompt = `You are a productivity coach AI. Based on the team stats below, give 3 short, actionable insights.
Format as a plain numbered list (1. 2. 3.) with no extra text.

Stats:
- Completed Tasks: ${completedTasks}
- Pending Tasks: ${pendingTasks}
- Overdue Tasks: ${overdueTasks}
- Productivity Score: ${productivityScore}/100`;

    try {
      const insights = await callGemini(prompt);
      res.json({ insights });
    } catch {
      res.json({ insights: '1. Focus on completing in-progress tasks.\n2. Address overdue items first.\n3. Schedule daily standups to maintain momentum.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
