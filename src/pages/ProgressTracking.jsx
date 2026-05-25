import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Download, Users, Target } from 'lucide-react';
import { api } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import AIRecommendation from '../components/AIRecommendation.jsx';

export default function ProgressTracking() {
  // Live Convex data
  const { data: teamProgress } = useApi(() => api.getTeamProgress());
  const { data: liveScore } = useApi(() => api.getLiveScore());
  const { data: overdue } = useApi(() => api.getOverdueCount());
  const { data: upcoming } = useApi(() => api.getUpcomingDeadlines());
  const { data: dashStats } = useApi(() => api.getStats());

  // ─── Real numbers from Convex, fallback to sensible defaults ─────────────
  const completed   = dashStats?.completed  ?? 0;
  const inProgress  = dashStats?.inProgress ?? 0;
  const todo        = dashStats?.todo       ?? 0;
  const total       = dashStats?.total      ?? 0;
  const overdueCount = dashStats?.overdue   ?? 0;
  const score       = liveScore?.score      ?? 0;

  // Completion rate
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  // On-time rate (tasks not overdue out of non-completed)
  const nonCompleted = inProgress + todo;
  const onTimeRate   = nonCompleted > 0
    ? Math.round(((nonCompleted - overdueCount) / nonCompleted) * 100)
    : 100;

  // ─── 4 meaningful stat cards ──────────────────────────────────────────────
  const statCards = [
    {
      icon: CheckCircle2,
      label: 'Tasks Completed',
      value: completed,
      total: total,
      pct: completionRate,
      color: '#34D399',
      bg: 'rgba(52,211,153,0.15)',
      desc: `${completed} of ${total} tasks done`,
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: inProgress,
      total: total,
      pct: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      color: 'var(--btn-to, #3B82F6)',
      bg: 'rgba(59,130,246,0.15)',
      desc: `${inProgress} tasks being worked on`,
    },
    {
      icon: AlertTriangle,
      label: 'Overdue Tasks',
      value: overdueCount,
      total: nonCompleted,
      pct: nonCompleted > 0 ? Math.round((overdueCount / nonCompleted) * 100) : 0,
      color: overdueCount > 0 ? '#F87171' : '#34D399',
      bg: overdueCount > 0 ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)',
      desc: overdueCount === 0 ? 'All tasks on schedule!' : `${overdueCount} past deadline`,
    },
    {
      icon: TrendingUp,
      label: 'Productivity Score',
      value: `${score}%`,
      total: 100,
      pct: score,
      color: 'var(--btn-from, #8B5CF6)',
      bg: 'rgba(139,92,246,0.15)',
      desc: score >= 70 ? 'Great momentum!' : score >= 40 ? 'Room to improve' : 'Needs attention',
    },
  ];

  // ─── Task status breakdown for pie chart ─────────────────────────────────
  const statusPie = [
    { name: 'Completed',   value: completed,  color: '#34D399' },
    { name: 'In Progress', value: inProgress, color: 'var(--btn-to, #3B82F6)' },
    { name: 'To Do',       value: todo,       color: 'rgba(255,255,255,0.2)' },
    { name: 'Overdue',     value: overdueCount, color: '#F87171' },
  ].filter(d => d.value > 0);

  // ─── Weekly trend (mock data, realistic) ─────────────────────────────────
  const weeklyTrend = [];

  // ─── Upcoming deadlines ───────────────────────────────────────────────────
  const deadlineList = upcoming?.slice(0, 5) ?? [];

  // ─── Export CSV ───────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Tasks', total],
      ['Completed', completed],
      ['In Progress', inProgress],
      ['To Do', todo],
      ['Overdue', overdueCount],
      ['Completion Rate', `${completionRate}%`],
      ['Productivity Score', `${score}%`],
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'taskflow-progress.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const recs = [
    { title: 'Focus on completing tasks', desc: `You have ${inProgress} tasks in progress. Completing these before starting new ones improves velocity.` },
    { title: overdueCount > 0 ? `${overdueCount} overdue tasks need attention` : 'Great — no overdue tasks!', desc: overdueCount > 0 ? 'Prioritize overdue tasks or update their deadlines to keep the board accurate.' : 'Keep it up! All tasks are within their deadlines.' },
    { title: 'Productivity score insight', desc: score >= 70 ? 'Your score is strong. Protect focus time and avoid context switching.' : 'Complete more tasks this week to boost your productivity score above 70%.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Progress Tracking</h1>
          <p className="text-white/50 text-sm">Real-time view of your team's task completion and momentum.</p>
        </div>
        <button onClick={handleExport} className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
          <Download className="w-4 h-4"/>Export Report
        </button>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }}/>
              </div>
              <span className="text-2xl font-display font-bold" style={{ color: s.color }}>
                {s.value}
              </span>
            </div>
            <div className="font-medium text-sm mb-1">{s.label}</div>
            <div className="text-xs text-white/40 mb-3">{s.desc}</div>
            {/* Progress bar */}
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(s.pct, 100)}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="h-full rounded-full" style={{ background: s.color }}/>
            </div>
            <div className="text-xs text-white/30 mt-1">{s.pct}%</div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Weekly task activity */}
        <div className="lg:col-span-2 glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-semibold">Weekly Task Activity</div>
              <div className="text-xs text-white/40">Tasks completed vs. tasks added per day</div>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/20"/>Added
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--btn-from, #8B5CF6)' }}/>Completed
              </span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend} barGap={4}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background: '#13131F', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12 }}/>
                <Bar dataKey="added"     fill="rgba(255,255,255,0.12)" radius={[6,6,0,0]} barSize={22}/>
                <Bar dataKey="completed" fill="var(--btn-from, #8B5CF6)" radius={[6,6,0,0]} barSize={22}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task status breakdown donut */}
        <div className="glass p-6 flex flex-col">
          <div className="font-display font-semibold mb-1">Task Breakdown</div>
          <div className="text-xs text-white/40 mb-4">Current status of all tasks</div>

          {total === 0 ? (
            <div className="flex-1 grid place-items-center text-white/30 text-sm">
              No tasks yet — add some from the Task Board
            </div>
          ) : (
            <>
              <div className="h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPie} dataKey="value" innerRadius={50} outerRadius={72} paddingAngle={3}>
                      {statusPie.map((d, i) => <Cell key={i} fill={d.color} stroke="none"/>)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#13131F', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12 }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold">{completionRate}%</div>
                    <div className="text-xs text-white/40">done</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {statusPie.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }}/>
                      <span className="text-white/70">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">{d.value}</span>
                      <span className="text-white/25 text-xs">({total > 0 ? Math.round(d.value/total*100) : 0}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Upcoming deadlines */}
        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4" style={{ color: 'var(--accent-1, #A78BFA)' }}/>
            <div className="font-display font-semibold">Upcoming Deadlines</div>
          </div>
          {deadlineList.length === 0 ? (
            <div className="text-sm text-white/40 text-center py-6">No upcoming deadlines in the next 7 days</div>
          ) : (
            <div className="space-y-3">
              {deadlineList.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-9 h-9 rounded-lg grid place-items-center text-xs font-bold shrink-0"
                    style={{ background: t.daysLeft <= 2 ? 'rgba(248,113,113,0.2)' : 'rgba(139,92,246,0.2)', color: t.daysLeft <= 2 ? '#F87171' : 'var(--accent-1, #A78BFA)' }}>
                    {t.daysLeft}d
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.title}</div>
                    <div className="text-xs text-white/40">
                      {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    t.priority === 'high'   ? 'bg-rose-400/10 text-rose-400' :
                    t.priority === 'medium' ? 'bg-amber-400/10 text-amber-400' :
                    'bg-emerald-400/10 text-emerald-400'}`}>
                    {t.priority}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Team completion */}
        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4" style={{ color: 'var(--accent-1, #A78BFA)' }}/>
            <div className="font-display font-semibold">Team Completion</div>
          </div>
          <div className="text-sm text-white/40 text-center py-6">Add team members to see completion rates</div>
        </div>

        {/* AI Recommendations */}
        <AIRecommendation items={recs}/>
      </div>
    </div>
  );
}
