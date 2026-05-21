# TaskFlow AI – Backend

> AI-powered project management built with **Convex** + **Gemini AI**  
> Hackathon-ready · Real-time · Production-quality

---

## ✨ What's included

| Module | File | Description |
|---|---|---|
| Schema | `convex/schema.ts` | All DB tables & indexes |
| Users | `convex/users.ts` | Auth-linked user profiles |
| Tasks | `convex/tasks.ts` | Full CRUD + status management |
| AI Analysis | `convex/ai.ts` | Gemini task analyzer + insights |
| AI Chat | `convex/chat.ts` | Chat assistant with history |
| Dashboard | `convex/dashboard.ts` | Live stats for the UI |
| Analytics | `convex/analytics.ts` | Weekly snapshots + trends |
| Notifications | `convex/notifications.ts` | In-app notification system |
| Progress | `convex/progress.ts` | Completion tracking |
| HTTP | `convex/http.ts` | Health check endpoint |
| Gemini client | `convex/lib/gemini.ts` | Reusable AI helper functions |

---

## 🚀 Quick Start (5 minutes)

### 1. Clone & install

```bash
git clone <your-repo>
cd taskflow-ai
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This will:
- Ask you to log in / create a Convex account (free)
- Create a new project
- Auto-fill `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL` in `.env.local`

### 3. Add your Gemini API Key

Get a free key at https://makersuite.google.com/app/apikey

```bash
# Add to Convex environment (not .env.local – Convex needs it server-side)
npx convex env set GEMINI_API_KEY your_key_here
```

### 4. Copy the example env file

```bash
cp .env.example .env.local
# Fill in VITE_CONVEX_URL from your Convex dashboard
```

### 5. Run the dev server

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- Convex dashboard: https://dashboard.convex.dev

---

## 🗂️ Folder Structure

```
convex/
├── schema.ts          ← DB tables + indexes
├── auth.config.ts     ← Convex Auth configuration
├── users.ts           ← User queries & mutations
├── tasks.ts           ← Task CRUD
├── ai.ts              ← Gemini AI actions
├── chat.ts            ← Chat assistant
├── dashboard.ts       ← Dashboard statistics
├── analytics.ts       ← Weekly analytics
├── notifications.ts   ← Notification system
├── progress.ts        ← Progress tracking
├── http.ts            ← HTTP endpoints
└── lib/
    ├── gemini.ts      ← Gemini API client
    ├── validators.ts  ← Input validators
    ├── helpers.ts     ← Utility functions
    └── constants.ts   ← App-wide constants
```

---

## 🔌 Frontend Integration (React + Vite)

### Setup

```tsx
// src/main.tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
);
```

### Using the APIs

```tsx
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";

// ── Real-time task list ────────────────────────────────────────────────
const tasks = useQuery(api.tasks.getTasks, {});

// ── Dashboard stats ────────────────────────────────────────────────────
const stats = useQuery(api.dashboard.getStats, {});

// ── Create a task ──────────────────────────────────────────────────────
const createTask = useMutation(api.tasks.createTask);
await createTask({ title: "My Task", priority: "high", status: "todo" });

// ── Analyze task with AI ───────────────────────────────────────────────
const analyzeTask = useAction(api.ai.analyzeTask);
const analysis = await analyzeTask({ taskId, title, description });

// ── Chat with AI ───────────────────────────────────────────────────────
const sendMessage = useAction(api.chat.sendMessage);
const reply = await sendMessage({ message: "How do I prioritize my tasks?" });

// ── Notifications ──────────────────────────────────────────────────────
const notifications = useQuery(api.notifications.getNotifications, {});
const unreadCount = useQuery(api.notifications.getUnreadCount, {});
```

---

## 🤖 AI Features

### Task Analyzer
Sends task details to Gemini and returns:
- **Priority level** (low / medium / high)
- **Estimated completion time** (hours)
- **Risk level** (low / medium / high)
- **Workflow suggestions** (3 actionable tips)
- **Productivity advice** (one sentence)

### Chat Assistant
Context-aware productivity coach that:
- Answers project management questions
- Suggests workflow improvements
- Provides task optimization advice
- Stores conversation history

### Productivity Insights
Analyzes team metrics and generates:
- Workload distribution warnings
- Overdue task alerts
- Productivity improvement suggestions

---

## 📊 Database Tables

| Table | Purpose |
|---|---|
| `users` | User profiles linked to auth |
| `tasks` | Tasks with AI suggestions embedded |
| `chatMessages` | AI chat history per user |
| `notifications` | In-app notification log |
| `analytics` | Weekly productivity snapshots |

---

## 🌐 Deployment

```bash
# Deploy Convex backend
npx convex deploy

# Build frontend
npm run build

# Set production env vars in Convex dashboard:
# https://dashboard.convex.dev → your-project → Settings → Environment Variables
# Add: GEMINI_API_KEY
```

---

## 🔒 Security

- All mutations require authentication via `ctx.auth.getUserIdentity()`
- Gemini API key is stored as a Convex server-side environment variable (never exposed to the browser)
- Input validation on all public-facing functions via `convex/lib/validators.ts`

---

## 🛠️ Tips for the Hackathon

1. **Seed demo data** – Use the Convex dashboard to insert sample tasks directly
2. **Use `useQuery` for everything live** – Convex auto-subscribes and re-renders
3. **Gemini is fast** – Average response < 2 seconds for task analysis
4. **Health check** – Hit `<your-convex-http-url>/health` to verify deployment

---

Built with ❤️ using [Convex](https://convex.dev) + [Gemini](https://deepmind.google/technologies/gemini/)
