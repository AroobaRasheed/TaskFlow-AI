# TaskFlow AI — Full-Stack Project

> AI-powered project management | Convex backend + React frontend | Gemini AI

---

## ⚡ Quick Start (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Convex (free account)
```bash
npx convex dev
```
This will prompt you to log in / create a free Convex account,
then **automatically fill in** `VITE_CONVEX_URL` and `CONVEX_DEPLOYMENT` in your `.env.local`.

### 3. Add your Gemini API key
Get a free key at https://makersuite.google.com/app/apikey
```bash
npx convex env set GEMINI_API_KEY your_key_here
```

### 4. Run the app
In a new terminal (while `npx convex dev` is running):
```bash
npm run dev
# OR run both together:
npm run dev  # this runs convex + vite concurrently
```

App runs at: **http://localhost:5173**

---

## 📁 Project Structure

```
taskflow-ai/
├── src/                        ← React frontend (Vite + Tailwind)
│   ├── pages/
│   │   ├── Dashboard.jsx       ← Live stats from Convex
│   │   ├── TaskBoard.jsx       ← Real-time kanban + create modal
│   │   ├── ChatAssistant.jsx   ← AI chat powered by Gemini
│   │   ├── AITaskAnalyzer.jsx  ← Task analysis via Gemini
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ProgressTracking.jsx
│   │   ├── TeamAnalytics.jsx
│   │   └── Settings.jsx
│   ├── components/             ← Shared UI components
│   ├── hooks/
│   │   └── useTaskFlow.ts      ← All Convex hooks (ready to use)
│   └── data/mock.js            ← Fallback mock data
│
├── convex/                     ← Convex backend (TypeScript)
│   ├── schema.ts               ← Database tables & indexes
│   ├── tasks.ts                ← Task CRUD
│   ├── users.ts                ← User management
│   ├── ai.ts                   ← Gemini AI actions
│   ├── chat.ts                 ← AI chat assistant
│   ├── dashboard.ts            ← Live stats
│   ├── analytics.ts            ← Weekly analytics
│   ├── notifications.ts        ← Notification system
│   ├── progress.ts             ← Progress tracking
│   └── lib/
│       ├── gemini.ts           ← Gemini API client
│       ├── validators.ts       ← Input validators
│       ├── helpers.ts          ← Utility functions
│       └── constants.ts        ← App constants
│
├── .env.local                  ← Your env vars (git-ignored)
├── .env.example                ← Template
├── package.json                ← All dependencies merged
└── vite.config.js
```

---

## 🔌 How Frontend ↔ Backend Are Connected

| Feature | Frontend File | Convex API |
|---|---|---|
| Dashboard stats | `Dashboard.jsx` | `api.dashboard.getStats` |
| Task board | `TaskBoard.jsx` | `api.tasks.getTasks`, `api.tasks.createTask` |
| AI chat | `ChatAssistant.jsx` | `api.chat.sendMessage` (Gemini) |
| Task analyzer | `AITaskAnalyzer.jsx` | `api.ai.analyzeTask` (Gemini) |
| Upcoming deadlines | `Dashboard.jsx` | `api.progress.getUpcomingDeadlines` |
| User signup | `Signup.jsx` | `api.users.createUser` |

All connections use **real-time Convex subscriptions** via `useQuery` — the UI updates automatically when data changes. AI features gracefully fall back to mock data if the backend isn't connected.

---

## 🤖 Gemini AI Features

- **Task Analyzer** — Submit any task to get: priority, estimated hours, risk level, workflow steps, and productivity advice.
- **Chat Assistant** — Context-aware assistant that answers project management questions. Full conversation history stored in Convex.
- **Productivity Insights** — Generate team-level insights based on live task metrics.

---

## 🌐 Deploy

```bash
# Deploy Convex backend
npx convex deploy

# Build frontend
npm run build

# Set production Gemini key
npx convex env set GEMINI_API_KEY your_key_here --prod
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## ⚙️ Environment Variables

| Variable | Description | Where to set |
|---|---|---|
| `VITE_CONVEX_URL` | Convex project URL | `.env.local` (auto-filled by `npx convex dev`) |
| `CONVEX_DEPLOYMENT` | Deployment name | `.env.local` (auto-filled) |
| `GEMINI_API_KEY` | Google Gemini key | `npx convex env set GEMINI_API_KEY <key>` |

---

Built with ❤️ — Convex · Gemini · React · Tailwind · Framer Motion
