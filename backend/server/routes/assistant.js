import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { callGemini } from '../utils/gemini.js';
import Task from '../models/Task.js';
import Workflow from '../models/Workflow.js';
import TeamMember from '../models/TeamMember.js';
import Notification from '../models/Notification.js';

const router = Router();

// ─── Keyword fallback parser (works without Gemini) ─────────────────────
function parseIntentLocal(msg) {
  const m = msg.toLowerCase();

  // Help / what can you do
  if (/\b(help|what can you|what do you|what you can|capabilities|features|how to use)\b/.test(m))
    return { action: 'help' };

  // Stats
  if (/\b(stats|statistics|dashboard|how am i doing|my progress|performance)\b/.test(m))
    return { action: 'get_stats' };

  // Overdue
  if (/\b(overdue|past due|missed deadline|late tasks?)\b/.test(m))
    return { action: 'get_overdue' };

  // Deadlines
  if (/\b(deadline|due soon|upcoming|what'?s due)\b/.test(m))
    return { action: 'get_deadlines' };

  // List tasks
  if (/\b(list|show|all|my)\b.*\btask/.test(m) || /\btasks?\b.*\b(list|show|all)\b/.test(m))
    return { action: 'list_tasks', status: 'all', priority: 'all' };

  // Delete task
  if (/\b(delete|remove)\b.*\btask\b/.test(m)) {
    const title = msg.replace(/^.*?(delete|remove)\s+(the\s+)?task\s+(called\s+|named\s+)?/i, '').replace(/["""]/g, '').trim();
    return { action: 'delete_task', title };
  }

  // Mark task done
  if (/\b(mark|set|change)\b.*\b(done|complete|finished)\b/.test(m)) {
    const title = msg.replace(/^.*?(mark|set|change)\s+(the\s+)?/i, '').replace(/\s*(as\s+)?(done|complete|finished|completed).*$/i, '').replace(/["""]/g, '').trim();
    return { action: 'update_task_status', title, status: 'completed' };
  }

  // Start task
  if (/\b(start|begin)\b.*\b(working|task)\b/.test(m)) {
    const title = msg.replace(/^.*?(start|begin)\s+(working\s+on\s+)?/i, '').replace(/["""]/g, '').trim();
    return { action: 'update_task_status', title, status: 'in_progress' };
  }

  // Create task
  if (/\b(create|add|new|make)\b.*\btask\b/.test(m)) {
    const titleMatch = msg.match(/(?:called|named|titled?)\s+["""]?(.+?)["""]?(?:\s+with|\s+due|\s+priority|$)/i)
      || msg.match(/task\s+["""](.+?)["""]/i)
      || msg.match(/task\s+(?:called\s+|named\s+)?(.+?)(?:\s+due|\s+with|\s+priority|$)/i);
    const title = titleMatch?.[1]?.trim() || 'Untitled Task';
    const priority = /\bhigh\b/i.test(m) ? 'high' : /\blow\b/i.test(m) ? 'low' : 'medium';
    const deadlineMatch = m.match(/due\s+(tomorrow|today|next\s+\w+|\d{4}-\d{2}-\d{2})/i);
    let deadline = null;
    if (deadlineMatch) {
      const d = deadlineMatch[1].toLowerCase();
      if (d === 'tomorrow') deadline = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      else if (d === 'today') deadline = new Date().toISOString().slice(0, 10);
      else if (/^\d{4}/.test(d)) deadline = d;
    }
    return { action: 'create_task', title, priority, status: 'todo', deadline, description: '' };
  }

  // Team
  if (/\b(show|list|my)\b.*\bteam\b/.test(m) || /\bteam\b.*\b(members?|list|show)\b/.test(m))
    return { action: 'list_team' };

  if (/\b(add|invite)\b.*\b(member|teammate|person)\b/.test(m) || /\badd\b.*\bas\b/.test(m)) {
    const nameMatch = msg.match(/add\s+(\w+)/i);
    const emailMatch = msg.match(/email\s+(\S+@\S+)/i);
    const roleMatch = msg.match(/as\s+(?:a\s+)?(\w+)/i);
    return { action: 'add_team_member', name: nameMatch?.[1] || '', email: emailMatch?.[1] || '', role: roleMatch?.[1] || 'Member' };
  }

  if (/\b(remove|kick)\b.*\b(member|teammate)\b/.test(m)) {
    const nameMatch = msg.match(/(?:remove|kick)\s+(\w+)/i);
    return { action: 'remove_team_member', name: nameMatch?.[1] || '' };
  }

  // Workflows
  if (/\b(list|show|my)\b.*\bworkflow/.test(m))
    return { action: 'list_workflows' };

  if (/\b(create|new|make)\b.*\bworkflow\b/.test(m)) {
    const titleMatch = msg.match(/workflow\s+(?:called\s+|named\s+)?["""]?(.+?)["""]?\s+with/i);
    const stepsMatch = msg.match(/steps?:?\s*(.+)/i);
    const steps = stepsMatch ? stepsMatch[1].split(/,\s*/).map(s => s.trim()).filter(Boolean) : [];
    return { action: 'create_workflow', title: titleMatch?.[1] || 'New Workflow', steps };
  }

  return null; // no match
}

// ─── Parse intent from natural language ──────────────────────────────────
async function parseIntent(message) {
  // Try keyword parser first (instant, no API needed)
  const local = parseIntentLocal(message);
  if (local) return local;

  // Try Gemini for complex/ambiguous messages
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const prompt = `You are an intent parser for a project management app called TaskFlow AI.
Parse the user's message into a JSON action. Respond ONLY with valid JSON, no markdown.

Available actions:
- {"action":"create_task","title":"...","description":"...","priority":"low|medium|high","status":"todo|in_progress|completed","deadline":"YYYY-MM-DD or null"}
- {"action":"list_tasks","status":"todo|in_progress|completed|all","priority":"low|medium|high|all"}
- {"action":"update_task_status","title":"...","status":"todo|in_progress|completed"}
- {"action":"delete_task","title":"..."}
- {"action":"get_stats"}
- {"action":"add_team_member","name":"...","email":"...","role":"..."}
- {"action":"list_team"}
- {"action":"remove_team_member","name":"..."}
- {"action":"create_workflow","title":"...","steps":["step1","step2",...]}
- {"action":"list_workflows"}
- {"action":"get_deadlines"}
- {"action":"get_overdue"}
- {"action":"chat","message":"..."}  (for general questions/advice)

User message: "${message.replace(/"/g, '\\"')}"`;

    try {
      const raw = await callGemini(prompt);
      const clean = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch { /* fall through */ }
  }

  return { action: 'chat', message };
}

// ─── Execute the parsed action ───────────────────────────────────────────
async function executeAction(intent, userId) {
  const result = { success: true, message: '', data: null };

  switch (intent.action) {
    case 'create_task': {
      const task = await Task.create({
        title: intent.title || 'Untitled Task',
        description: intent.description || '',
        priority: intent.priority || 'medium',
        status: intent.status || 'todo',
        deadline: intent.deadline ? new Date(intent.deadline) : undefined,
        createdBy: userId,
      });
      await Notification.create({
        userId,
        title: 'Task Created via AI',
        message: `"${task.title}" added to your board.`,
        type: 'success',
      });
      result.message = `Created task "${task.title}" with ${task.priority} priority.`;
      result.data = { type: 'task_created', task: { _id: task._id, title: task.title, priority: task.priority, status: task.status } };
      break;
    }

    case 'list_tasks': {
      const filter = { createdBy: userId };
      if (intent.status && intent.status !== 'all') filter.status = intent.status;
      if (intent.priority && intent.priority !== 'all') filter.priority = intent.priority;
      const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(20);
      const summary = tasks.length === 0
        ? 'You have no tasks matching that filter.'
        : tasks.map((t, i) => `${i + 1}. **${t.title}** — ${t.status.replace('_', ' ')} · ${t.priority}`).join('\n');
      result.message = tasks.length === 0 ? summary : `Found ${tasks.length} task${tasks.length > 1 ? 's' : ''}:\n${summary}`;
      result.data = { type: 'task_list', count: tasks.length, tasks: tasks.map(t => ({ _id: t._id, title: t.title, status: t.status, priority: t.priority })) };
      break;
    }

    case 'update_task_status': {
      const task = await Task.findOne({
        createdBy: userId,
        title: { $regex: new RegExp(intent.title?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      });
      if (!task) {
        result.success = false;
        result.message = `Couldn't find a task matching "${intent.title}".`;
        break;
      }
      const oldStatus = task.status;
      task.status = intent.status;
      await task.save();
      result.message = `Updated "${task.title}" from ${oldStatus.replace('_', ' ')} → **${intent.status.replace('_', ' ')}**.`;
      result.data = { type: 'task_updated', task: { _id: task._id, title: task.title, status: task.status } };
      break;
    }

    case 'delete_task': {
      const task = await Task.findOneAndDelete({
        createdBy: userId,
        title: { $regex: new RegExp(intent.title?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      });
      if (!task) {
        result.success = false;
        result.message = `Couldn't find a task matching "${intent.title}".`;
        break;
      }
      result.message = `Deleted task "${task.title}".`;
      result.data = { type: 'task_deleted', title: task.title };
      break;
    }

    case 'get_stats': {
      const tasks = await Task.find({ createdBy: userId });
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const todo = tasks.filter(t => t.status === 'todo').length;
      const overdue = tasks.filter(t => t.status !== 'completed' && t.deadline && t.deadline < Date.now()).length;
      const score = total > 0 ? Math.round((completed / total) * 100) : 0;
      result.message = `📊 **Your Dashboard**\n• Total: ${total} tasks\n• Completed: ${completed}\n• In Progress: ${inProgress}\n• To Do: ${todo}\n• Overdue: ${overdue}\n• Score: ${score}%`;
      result.data = { type: 'stats', total, completed, inProgress, todo, overdue, score };
      break;
    }

    case 'add_team_member': {
      if (!intent.name || !intent.email || !intent.role) {
        result.success = false;
        result.message = 'I need a name, email, and role to add a team member.';
        break;
      }
      const existing = await TeamMember.findOne({ email: intent.email.toLowerCase() });
      if (existing) {
        result.success = false;
        result.message = `${intent.email} is already on the team.`;
        break;
      }
      const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
      const member = await TeamMember.create({
        name: intent.name,
        email: intent.email.toLowerCase(),
        role: intent.role,
        avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        avatarInitials: intent.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        status: 'offline',
        addedBy: userId,
      });
      result.message = `Added **${member.name}** (${member.role}) to your team.`;
      result.data = { type: 'member_added', member: { name: member.name, role: member.role } };
      break;
    }

    case 'list_team': {
      const members = await TeamMember.find({ addedBy: userId });
      if (members.length === 0) {
        result.message = 'Your team is empty. Say "add [name] as [role] with email [email]" to add someone.';
      } else {
        const list = members.map((m, i) => `${i + 1}. **${m.name}** — ${m.role}`).join('\n');
        result.message = `👥 **Your Team** (${members.length}):\n${list}`;
      }
      result.data = { type: 'team_list', count: members.length };
      break;
    }

    case 'remove_team_member': {
      const member = await TeamMember.findOneAndDelete({
        addedBy: userId,
        name: { $regex: new RegExp(intent.name?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      });
      if (!member) {
        result.success = false;
        result.message = `Couldn't find a team member matching "${intent.name}".`;
        break;
      }
      result.message = `Removed **${member.name}** from the team.`;
      result.data = { type: 'member_removed', name: member.name };
      break;
    }

    case 'create_workflow': {
      if (!intent.title || !intent.steps?.length) {
        result.success = false;
        result.message = 'I need a title and at least one step to create a workflow.';
        break;
      }
      const wf = await Workflow.create({
        title: intent.title,
        createdBy: userId,
        steps: intent.steps.map((s, i) => ({
          title: typeof s === 'string' ? s : s.title,
          order: i + 1,
          status: i === 0 ? 'in_progress' : 'pending',
        })),
      });
      result.message = `Created workflow "${wf.title}" with ${wf.steps.length} steps.`;
      result.data = { type: 'workflow_created', workflow: { _id: wf._id, title: wf.title, steps: wf.steps.length } };
      break;
    }

    case 'list_workflows': {
      const workflows = await Workflow.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(10);
      if (workflows.length === 0) {
        result.message = 'No workflows yet. Say "create a workflow called X with steps: A, B, C".';
      } else {
        const list = workflows.map((w, i) => {
          const done = w.steps.filter(s => s.status === 'completed').length;
          return `${i + 1}. **${w.title}** — ${done}/${w.steps.length} steps done`;
        }).join('\n');
        result.message = `📋 **Workflows** (${workflows.length}):\n${list}`;
      }
      result.data = { type: 'workflow_list', count: workflows.length };
      break;
    }

    case 'get_deadlines': {
      const now = Date.now();
      const sevenDays = now + 7 * 24 * 60 * 60 * 1000;
      const tasks = await Task.find({
        createdBy: userId,
        status: { $ne: 'completed' },
        deadline: { $gte: now, $lte: sevenDays },
      }).sort({ deadline: 1 });
      if (tasks.length === 0) {
        result.message = 'No deadlines in the next 7 days. You\'re clear!';
      } else {
        const list = tasks.map((t, i) => {
          const days = Math.ceil((t.deadline - now) / (1000 * 60 * 60 * 24));
          return `${i + 1}. **${t.title}** — ${days} day${days > 1 ? 's' : ''} left`;
        }).join('\n');
        result.message = `⏰ **Upcoming Deadlines**:\n${list}`;
      }
      result.data = { type: 'deadlines', count: tasks.length };
      break;
    }

    case 'get_overdue': {
      const tasks = await Task.find({
        createdBy: userId,
        status: { $ne: 'completed' },
        deadline: { $lt: new Date() },
      });
      if (tasks.length === 0) {
        result.message = 'No overdue tasks — you\'re on track!';
      } else {
        const list = tasks.map((t, i) => `${i + 1}. **${t.title}** — ${t.priority} priority`).join('\n');
        result.message = `🚨 **${tasks.length} Overdue Task${tasks.length > 1 ? 's' : ''}**:\n${list}`;
      }
      result.data = { type: 'overdue', count: tasks.length };
      break;
    }

    case 'help': {
      result.message = "Hey! I'm your AI assistant and I can do quite a lot 😊\n\nHere's what I can help you with:\n\n🗂 **Task Management** — Create, list, update, or delete tasks just by telling me\n📊 **Stats & Analytics** — Get a quick overview of how you're doing\n⏰ **Deadlines & Overdue** — I'll tell you what's due soon or already late\n👥 **Team** — Add or remove team members, see who's on your team\n🔄 **Workflows** — Create step-by-step workflows to organize your process\n\nJust talk to me naturally! For example:\n• \"Create a high priority task called Design Review due tomorrow\"\n• \"What's overdue?\"\n• \"Show my stats\"";
      result.data = { type: 'chat' };
      break;
    }

    case 'chat':
    default: {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const chatPrompt = `You are TaskFlow AI — a friendly, warm, human-like productivity assistant built into a project management app.
Respond naturally like a helpful colleague, not a robot. Use a conversational tone.
Keep responses concise (2-4 sentences). Be encouraging and practical.
You can help with: creating/managing tasks, viewing stats, checking deadlines/overdue items, managing team members, and creating workflows.
If the user's message is casual (like "hi", "thanks", "cool"), respond warmly and briefly.

User: ${intent.message || intent.action}`;
          result.message = await callGemini(chatPrompt);
          result.data = { type: 'chat' };
          break;
        } catch { /* fall through to static response */ }
      }
      result.message = "Hmm, I'm not sure what you mean by that! But no worries — I'm here to help 😊\n\nTry asking me things like:\n• \"Create a task called...\"\n• \"Show my stats\"\n• \"What's overdue?\"\n• \"Show my team\"\n\nOr just ask me what I can do!";
      result.data = { type: 'chat' };
      break;
    }
  }

  return result;
}

// ─── Main endpoint ───────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

    const intent = await parseIntent(message.trim());
    const result = await executeAction(intent, req.user._id);

    res.json({
      message: result.message,
      data: result.data,
      success: result.success,
      intent: intent.action,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
