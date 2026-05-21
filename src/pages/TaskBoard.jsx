import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, ArrowUpDown, X, Loader2, Trash2, CheckCircle } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { kanban as mockKanban } from '../data/mock.js';

const STATUS_MAP = { 'To Do': 'todo', 'In Progress': 'in_progress', 'Completed': 'completed' };

const PRIORITY_COLORS = {
  high: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
};

const cols = [
  { key: 'To Do',       accent: 'from-white/10 to-transparent',       dot: '#A78BFA' },
  { key: 'In Progress', accent: 'from-neon-blue/20 to-transparent',    dot: '#3B82F6' },
  { key: 'Completed',   accent: 'from-emerald-500/15 to-transparent',  dot: '#34D399' },
];

export default function TaskBoard() {
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null); // task being edited
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo', deadline: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const tasks = useQuery(api.tasks.getTasks, {});
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const updateStatus = useMutation(api.tasks.updateTaskStatus);

  // Filter and group tasks
  const filteredTasks = tasks?.filter(t =>
    filterPriority === 'all' ? true : t.priority === filterPriority
  );

  const grouped = filteredTasks
    ? {
        'To Do':       filteredTasks.filter(t => t.status === 'todo'),
        'In Progress': filteredTasks.filter(t => t.status === 'in_progress'),
        'Completed':   filteredTasks.filter(t => t.status === 'completed'),
      }
    : { 'To Do': mockKanban['To Do'], 'In Progress': mockKanban['In Progress'], 'Completed': mockKanban['Completed'] };

  const openNew = (status = 'todo') => {
    setEditTask(null);
    setNewTask({ title: '', description: '', priority: 'medium', status, deadline: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setNewTask({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!newTask.title.trim()) return setError('Title is required.');
    setSaving(true);
    setError('');
    try {
      if (editTask) {
        await updateTask({
          id: editTask._id,
          title: newTask.title,
          description: newTask.description || undefined,
          priority: newTask.priority,
          status: newTask.status,
          deadline: newTask.deadline ? new Date(newTask.deadline).getTime() : undefined,
        });
      } else {
        await createTask({
          title: newTask.title,
          description: newTask.description || undefined,
          priority: newTask.priority,
          status: newTask.status,
          deadline: newTask.deadline ? new Date(newTask.deadline).getTime() : undefined,
        });
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save task. Check you are signed up.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask({ id: taskId }); } catch (err) { alert(err.message); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try { await updateStatus({ id: taskId, status: newStatus }); } catch (err) { alert(err.message); }
  };

  const isLive = !!tasks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Task Board</h1>
          <p className="text-white/50 text-sm">
            {isLive ? `${tasks.length} tasks · Real-time` : 'Demo mode · Sign up to save tasks'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Priority filter */}
          <select className="input-glow text-sm py-2 px-3 w-auto"
            value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="btn-primary text-sm py-2" onClick={() => openNew()}>
            <Plus className="w-4 h-4"/>New Task
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {cols.map((c, ci) => {
          const colTasks = isLive ? grouped[c.key] : mockKanban[c.key];
          return (
            <motion.div key={c.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}
              className="glass p-4 min-h-[60vh]">
              <div className={`relative -mx-4 -mt-4 px-4 py-3 rounded-t-2xl bg-gradient-to-r ${c.accent} border-b border-white/5 mb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.dot, boxShadow: `0 0 8px ${c.dot}` }}/>
                    <span className="font-display font-semibold">{c.key}</span>
                    <span className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full">{colTasks?.length ?? 0}</span>
                  </div>
                  <button className="text-white/40 hover:text-white" onClick={() => openNew(STATUS_MAP[c.key])}>
                    <Plus className="w-4 h-4"/>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {isLive ? colTasks.map((t) => (
                  <LiveTaskCard
                    key={t._id}
                    task={t}
                    onEdit={() => openEdit(t)}
                    onDelete={() => handleDelete(t._id)}
                    onStatusChange={handleStatusChange}
                  />
                )) : mockKanban[c.key].map((t, i) => (
                  <MockTaskCard key={t.id} task={t}/>
                ))}

                <button
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-sm text-white/40 hover:border-purple/40 hover:text-white transition"
                  onClick={() => openNew(STATUS_MAP[c.key])}>
                  + Add task
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 8 }}
              className="glass-strong p-6 w-full max-w-md relative">
              <button className="absolute top-4 right-4 text-white/40 hover:text-white" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5"/>
              </button>
              <h2 className="font-display text-xl font-bold mb-5">{editTask ? 'Edit Task' : 'New Task'}</h2>

              {error && (
                <div className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Title *</label>
                  <input className="input-glow" placeholder="Task title" value={newTask.title}
                    onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))} autoFocus/>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Description</label>
                  <textarea className="input-glow resize-none" rows={3} placeholder="Optional description"
                    value={newTask.description} onChange={e => setNewTask(n => ({ ...n, description: e.target.value }))}/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Priority</label>
                    <select className="input-glow" value={newTask.priority}
                      onChange={e => setNewTask(n => ({ ...n, priority: e.target.value }))}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Status</label>
                    <select className="input-glow" value={newTask.status}
                      onChange={e => setNewTask(n => ({ ...n, status: e.target.value }))}>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Deadline</label>
                  <input type="date" className="input-glow" value={newTask.deadline}
                    onChange={e => setNewTask(n => ({ ...n, deadline: e.target.value }))}/>
                </div>
                <div className="flex gap-3">
                  <button type="button" className="btn-ghost flex-1 text-sm py-2" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || !newTask.title.trim()} className="btn-primary flex-1 text-sm py-2 disabled:opacity-60">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin"/>Saving…</> : editTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LiveTaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const PRIORITY_COLORS = {
    high: 'text-rose-400 bg-rose-400/10',
    medium: 'text-amber-400 bg-amber-400/10',
    low: 'text-emerald-400 bg-emerald-400/10',
  };
  const nextStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'todo';
  const nextLabel = task.status === 'todo' ? 'Start' : task.status === 'in_progress' ? 'Complete' : 'Reopen';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple/20 transition group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-sm font-medium leading-snug flex-1">{task.title}</div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button onClick={onEdit} className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5" title="Edit">
            ✏️
          </button>
          <button onClick={onDelete} className="p-1 rounded text-white/40 hover:text-rose-400 hover:bg-rose-400/10" title="Delete">
            <Trash2 className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>
      {task.description && (
        <p className="text-xs text-white/40 mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium}`}>
            {task.priority}
          </span>
          {task.deadline && (
            <span className={`text-xs ${task.isOverdue ? 'text-rose-400' : 'text-white/40'}`}>
              {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        <button onClick={() => onStatusChange(task._id, nextStatus)}
          className="text-xs text-purple-glow hover:text-white flex items-center gap-1 transition">
          <CheckCircle className="w-3.5 h-3.5"/>{nextLabel}
        </button>
      </div>
    </motion.div>
  );
}

function MockTaskCard({ task }) {
  const PRIORITY_COLORS = {
    High: 'text-rose-400 bg-rose-400/10',
    Medium: 'text-amber-400 bg-amber-400/10',
    Low: 'text-emerald-400 bg-emerald-400/10',
  };
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="text-sm font-medium mb-1">{task.title}</div>
      <p className="text-xs text-white/40 mb-3 line-clamp-2">{task.description}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.Medium}`}>
          {task.priority}
        </span>
        <span className="text-xs text-white/40">{task.deadline}</span>
      </div>
    </div>
  );
}
