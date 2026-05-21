import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { teamMembers } from '../data/mock.js';
import { Users, Zap, Award, MessageSquare } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';

export default function TeamAnalytics() {
  const data = teamMembers.map(m => ({ name: m.name.split(' ')[0], tasks: m.tasks, color: m.avatar.color }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Team Analytics</h1>
        <p className="text-white/50 text-sm">Who's flowing, who's stuck, and where to rebalance.</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Team Size" value="12" delta={9} color="purple" i={0}/>
        <StatCard icon={Zap} label="Avg. Velocity" value="36/wk" delta={11} color="blue" i={1}/>
        <StatCard icon={Award} label="Top Performer" value="Alex" delta={undefined} color="green" i={2}/>
        <StatCard icon={MessageSquare} label="Async Replies" value="2.3h" delta={-18} color="red" i={3}/>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-semibold">Tasks by Member</div>
              <div className="text-xs text-white/40">This quarter</div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={data} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false}/>
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 13 }} axisLine={false} tickLine={false} width={70}/>
                <Tooltip contentStyle={{ background: '#13131F', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12 }}/>
                <Bar dataKey="tasks" radius={[0,10,10,0]} barSize={22}>
                  {data.map((d, i) => <Cell key={i} fill={d.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6">
          <div className="font-display font-semibold mb-1">Team Roster</div>
          <div className="text-xs text-white/40 mb-4">Active contributors</div>
          <div className="space-y-3">
            {teamMembers.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl grid place-items-center text-xs font-semibold" style={{ background: m.avatar.color }}>
                  {m.avatar.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <div className="text-xs text-white/40">{m.role}</div>
                </div>
                <div className="text-xs text-emerald-400">+{m.completion}%</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
