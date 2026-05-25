import { motion } from 'framer-motion';
import { ListChecks, CheckCircle2, Clock, Flame, Sparkles } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import AIRecommendation from '../components/AIRecommendation.jsx';
import { useCallback } from 'react';

const icons = [ListChecks, CheckCircle2, Clock, Flame];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: liveStats } = useApi(() => api.getStats());
  const { data: recentTasks } = useApi(() => api.getRecentActivity());
  const { data: distribution } = useApi(() => api.getStatusDistribution());
  const { data: upcomingDeadlines } = useApi(() => api.getUpcomingDeadlines());

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = user?.name || 'there';

  const stats = liveStats ? [
    { label: 'Total Tasks',  value: String(liveStats.total),      delta: 0, color: 'purple' },
    { label: 'Completed',    value: String(liveStats.completed),  delta: 0, color: 'green'  },
    { label: 'In Progress',  value: String(liveStats.inProgress), delta: 0, color: 'blue'   },
    { label: 'Overdue',      value: String(liveStats.overdue),    delta: 0, color: 'red'     },
  ] : [
    { label: 'Total Tasks',  value: '—', delta: 0, color: 'purple' },
    { label: 'Completed',    value: '—', delta: 0, color: 'green'  },
    { label: 'In Progress',  value: '—', delta: 0, color: 'blue'   },
    { label: 'Overdue',      value: '—', delta: 0, color: 'red'    },
  ];

  const pieData = distribution?.length
    ? distribution.map((d, i) => ({ name: d.label, value: d.count, color: ['#8B5CF6','#3B82F6','#22D3EE'][i] ?? '#8B5CF6' }))
    : [{ name: 'No data', value: 1, color: '#ffffff20' }];

  const completePct = liveStats ? liveStats.productivityScore : 0;

  const deadlines = upcomingDeadlines?.slice(0, 4).map(t => ({
    title: t.title,
    date: new Date(t.deadline ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    daysLeft: t.daysLeft,
    owner: 'Team',
  })) ?? [];

  const activityFeed = recentTasks?.slice(0, 5).map(t => ({
    who: 'Team',
    action: t.status === 'completed' ? 'completed' : 'updated',
    target: t.title,
    time: new Date(t.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    color: t.priority === 'high' ? '#F472B6' : t.priority === 'medium' ? '#A78BFA' : '#34D399',
  })) ?? [];

  const recs = [
    { title: 'Balance workload', desc: 'Reassign 2 overdue tasks to free up capacity and reduce team stress.' },
    { title: 'Complete in-progress first', desc: 'Finishing in-progress tasks before starting new ones boosts sprint velocity.' },
    { title: 'Schedule a retro', desc: 'A short 20-min weekly review improves team momentum by ~12%.' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-white/40 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="font-display text-3xl font-bold">{greeting}, {displayName} 👋</h1>
        </div>
        <button className="btn-primary" onClick={() => navigate('/app/chat')}>
          <Sparkles className="w-4 h-4"/>Ask AI
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} icon={icons[i]} label={s.label} value={s.value} delta={s.delta} color={s.color} i={i}/>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-semibold">Weekly Productivity</div>
              <div className="text-xs text-white/40">Tasks completed vs. focus score</div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Legend dot="var(--btn-from, #A78BFA)" label="Tasks"/>
              <Legend dot="var(--btn-to, #3B82F6)"   label="Focus %"/>
            </div>
          </div>
          <div className="h-72 grid place-items-center text-white/30 text-sm">
            Weekly productivity chart will populate as you complete tasks
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass p-6 flex flex-col">
          <div className="font-display font-semibold mb-1">Progress Distribution</div>
          <div className="text-xs text-white/40 mb-4">All active tasks</div>
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={56} outerRadius={84} paddingAngle={4}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="none"/>)}
                </Pie>
                <Tooltip contentStyle={{ background: '#13131F', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12 }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="font-display text-3xl font-bold">{completePct}%</div>
                <div className="text-xs text-white/40">complete</div>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }}/>
                  <span className="text-white/70">{d.name}</span>
                </div>
                <span className="text-white/40">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
          <AIRecommendation items={recs}/>
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-display font-semibold">Upcoming Deadlines</div>
                <div className="text-xs text-white/40">Next 7 days</div>
              </div>
              <button className="text-xs hover:text-white transition"
                style={{ color: 'var(--accent-1, #A78BFA)' }}
                onClick={() => navigate('/app/tasks')}>
                View all
              </button>
            </div>
            <div className="space-y-3">
              {deadlines.length === 0 ? (
                <div className="text-sm text-white/40 text-center py-6">No upcoming deadlines</div>
              ) : deadlines.map((d, i) => (
                <motion.div key={d.title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl grid place-items-center text-xs font-mono font-semibold shrink-0"
                    style={{ background: 'var(--accent-1, #8B5CF6)33', color: 'var(--accent-1, #A78BFA)' }}>
                    {d.date.split(' ')[1]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.title}</div>
                    <div className="text-xs text-white/40">Owner: {d.owner}</div>
                  </div>
                  <div className={`text-xs shrink-0 ${d.daysLeft <= 5 ? 'text-rose-400' : 'text-white/50'}`}>{d.daysLeft}d left</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <div className="font-display font-semibold mb-1">Recent Activity</div>
          <div className="text-xs text-white/40 mb-4">Live feed</div>
          <div className="relative pl-5 space-y-5">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-purple/40 via-white/10 to-transparent"/>
            {activityFeed.length === 0 ? (
              <div className="text-sm text-white/40 text-center py-6">No recent activity</div>
            ) : activityFeed.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="relative">
                <span className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full border-2 border-bg"
                  style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }}/>
                <div className="text-sm">
                  <span className="font-medium">{a.who}</span>
                  <span className="text-white/50"> {a.action} </span>
                  <span style={{ color: 'var(--accent-1, #A78BFA)' }}>{a.target}</span>
                </div>
                <div className="text-xs text-white/40 mt-0.5">{a.time}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// unused import cleanup: AreaChart, Area removed from usage but kept in import for potential future use

function Legend({ dot, label }) {
  return (
    <span className="flex items-center gap-1.5 text-white/50">
      <span className="w-2 h-2 rounded-full" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}/>{label}
    </span>
  );
}
