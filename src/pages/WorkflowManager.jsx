import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  GitBranch, Plus, X, ChevronRight, Check, Play,
  AlertTriangle, Clock, Trash2, ArrowRight, Users, Zap
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: '#ffffff40', bg: 'bg-white/10',          icon: Clock },
  in_progress: { label: 'In Progress', color: '#3B82F6',   bg: 'bg-blue-500/20',        icon: Play },
  completed:   { label: 'Completed',   color: '#10B981',   bg: 'bg-emerald-500/20',     icon: Check },
  blocked:     { label: 'Blocked',     color: '#EF4444',   bg: 'bg-red-500/20',         icon: AlertTriangle },
};

function StepStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg}`} style={{ color: cfg.color }}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

// ─── Step Node (in workflow diagram) ──────────────────────────────────────
function StepNode({ step, index, total, onStatusChange }) {
  const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <motion.div layout className="flex-1 relative group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
        <div className={`glass p-4 transition-all cursor-pointer hover:border-white/20
          ${step.status === 'in_progress' ? 'border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : ''}
          ${step.status === 'completed' ? 'border-emerald-500/30' : ''}
          ${step.status === 'blocked' ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''}`}
          onClick={() => setMenuOpen(o => !o)}>
          <div className="flex items-start gap-3">
            {/* Step number */}
            <div className={`w-8 h-8 rounded-lg grid place-items-center text-xs font-bold shrink-0 transition-all`}
              style={{ background: step.status === 'completed' ? '#10B98130' : step.status === 'in_progress' ? '#3B82F630' : '#ffffff10',
                       color: cfg.color, border: `1px solid ${cfg.color}40` }}>
              {step.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium text-sm ${step.status === 'completed' ? 'line-through text-white/40' : ''}`}>{step.title}</span>
                <StepStatusBadge status={step.status} />
              </div>
              {step.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{step.description}</p>}
              <div className="flex items-center gap-3 mt-2">
                {step.assignedTo && (
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <Users className="w-3 h-3" />{step.assignedTo}
                  </span>
                )}
                {step.estimatedHours && (
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <Clock className="w-3 h-3" />{step.estimatedHours}h
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status change menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 top-full z-20 mt-1 glass-strong rounded-xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}>
                <div className="p-2">
                  <p className="text-xs text-white/30 px-2 py-1 font-medium">Change status</p>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const SIcon = cfg.icon;
                    return (
                      <button key={key} onClick={() => { onStatusChange(step._id, key); setMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition
                          ${step.status === key ? 'bg-white/10' : ''}`}
                        style={{ color: cfg.color }}>
                        <SIcon className="w-4 h-4" />{cfg.label}
                        {step.status === key && <Check className="w-3.5 h-3.5 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Arrow connector */}
      {index < total - 1 && (
        <ArrowRight className={`w-5 h-5 shrink-0 transition-colors
          ${step.status === 'completed' ? 'text-emerald-400' : 'text-white/20'}`} />
      )}
    </div>
  );
}

// ─── Workflow Card ─────────────────────────────────────────────────────────
function WorkflowCard({ workflow, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const updateStep = useMutation(api.workflows.updateStepStatus);

  const handleStatusChange = async (stepId, status) => {
    try { await updateStep({ stepId, status }); }
    catch (e) { alert(e.message); }
  };

  const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
  const currentStep = workflow.steps.find(s => s.status === 'in_progress');
  const blockedStep = workflow.steps.find(s => s.status === 'blocked');

  return (
    <motion.div layout className="glass overflow-hidden">
      {/* Card Header */}
      <button className="w-full text-left p-5 hover:bg-white/[0.02] transition" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #8B5CF620, #3B82F620)', border: '1px solid #8B5CF630' }}>
            <GitBranch className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-semibold truncate">{workflow.title}</span>
              {blockedStep && <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">Blocked</span>}
            </div>
            {workflow.description && <p className="text-xs text-white/40 mt-0.5 truncate">{workflow.description}</p>}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-white/30">{completedSteps}/{workflow.steps.length} steps</span>
              {currentStep && <span className="text-xs text-blue-400">Current: {currentStep.title}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress ring */}
            <div className="relative w-12 h-12 shrink-0">
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke={workflow.progress === 100 ? '#10B981' : '#8B5CF6'} strokeWidth="3"
                  strokeDasharray={`${(workflow.progress / 100) * 94.25} 94.25`} strokeLinecap="round"/>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{workflow.progress}%</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-white/30 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" initial={{ width: 0 }}
            animate={{ width: `${workflow.progress}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ background: workflow.progress === 100 ? '#10B981' : 'linear-gradient(to right, #8B5CF6, #3B82F6)' }} />
        </div>
      </button>

      {/* Expanded Steps */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10">
            <div className="p-5">
              <p className="text-xs text-white/30 mb-4 font-medium uppercase tracking-wider">
                Workflow Steps — click a step to change its status
              </p>
              {/* Horizontal scroll for steps */}
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center gap-0 min-w-max">
                  {workflow.steps.map((step, i) => (
                    <StepNode key={step._id} step={step} index={i} total={workflow.steps.length}
                      onStatusChange={handleStatusChange} />
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 pb-4 flex justify-end">
              <button onClick={() => onDelete(workflow._id)} className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition">
                <Trash2 className="w-3.5 h-3.5" />Delete workflow
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Create Workflow Modal ─────────────────────────────────────────────────
function CreateWorkflowModal({ onClose }) {
  const createWorkflow = useMutation(api.workflows.createWorkflow);
  const members = useQuery(api.teamMembers.listTeamMembers);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([
    { title: '', description: '', estimatedHours: '', assignedTo: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addStep = () => setSteps(s => [...s, { title: '', description: '', estimatedHours: '', assignedTo: '' }]);
  const removeStep = (i) => setSteps(s => s.filter((_, idx) => idx !== i));
  const updateStep = (i, key, val) => setSteps(s => s.map((st, idx) => idx === i ? { ...st, [key]: val } : st));

  const TEMPLATES = [
    { label: 'Product Launch', steps: ['Planning', 'Design', 'Development', 'QA Testing', 'Deployment', 'Post-launch Review'] },
    { label: 'Bug Fix', steps: ['Reproduce', 'Root Cause Analysis', 'Fix', 'Review', 'Deploy'] },
    { label: 'Feature Dev', steps: ['Requirements', 'Design', 'Backend', 'Frontend', 'Testing', 'Release'] },
  ];

  const applyTemplate = (tmpl) => {
    setTitle(tmpl.label);
    setSteps(tmpl.steps.map(s => ({ title: s, description: '', estimatedHours: '', assignedTo: '' })));
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Workflow title is required.'); return; }
    const validSteps = steps.filter(s => s.title.trim());
    if (validSteps.length === 0) { setError('At least one step with a title is required.'); return; }

    setLoading(true);
    try {
      await createWorkflow({
        title: title.trim(),
        description: description.trim() || undefined,
        steps: validSteps.map(s => ({
          title: s.title.trim(),
          description: s.description.trim() || undefined,
          estimatedHours: s.estimatedHours ? Number(s.estimatedHours) : undefined,
          assignedTo: s.assignedTo || undefined,
        })),
      });
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to create workflow.');
    } finally {
      setLoading(false);
    }
  };

  const memberNames = (members || []).map(m => m.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-strong w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-lg">Create Workflow</h2>
            <p className="text-white/40 text-sm">Define sequential steps from start to finish</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"><X className="w-4 h-4"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</div>}

          {/* Templates */}
          <div>
            <p className="text-xs text-white/40 mb-2 font-medium">Quick templates</p>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => applyTemplate(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition">
                  <Zap className="w-3 h-3 text-yellow-400" />{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Workflow Title *</label>
              <input className="input-glow" placeholder="e.g. Product Feature Launch" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Description (optional)</label>
              <textarea className="input-glow resize-none h-20" placeholder="What is this workflow for?" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Steps (in order)</p>
              <button onClick={addStep} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition">
                <Plus className="w-3.5 h-3.5" />Add step
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <motion.div key={i} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="glass p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-white/10 grid place-items-center text-xs font-bold shrink-0 text-white/50">{i + 1}</span>
                    <input className="input-glow flex-1 py-2 text-sm" placeholder={`Step ${i + 1} title *`}
                      value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} />
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(i)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pl-8">
                    <input className="input-glow py-2 text-sm" placeholder="Description (optional)"
                      value={step.description} onChange={e => updateStep(i, 'description', e.target.value)} />
                    <div className="flex gap-2">
                      <input className="input-glow py-2 text-sm w-20" placeholder="Hours" type="number" min="0.5" step="0.5"
                        value={step.estimatedHours} onChange={e => updateStep(i, 'estimatedHours', e.target.value)} />
                      <select className="input-glow py-2 text-sm flex-1"
                        value={step.assignedTo} onChange={e => updateStep(i, 'assignedTo', e.target.value)}>
                        <option value="">Assign…</option>
                        {memberNames.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-white/10">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creating…' : `Create Workflow (${steps.filter(s => s.title.trim()).length} steps)`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function WorkflowManager() {
  const workflows = useQuery(api.workflows.listWorkflows);
  const deleteWorkflow = useMutation(api.workflows.deleteWorkflow);
  const [showCreate, setShowCreate] = useState(false);

  const handleDelete = async (id) => {
    if (!confirm('Delete this workflow and all its steps?')) return;
    try { await deleteWorkflow({ id }); }
    catch (e) { alert(e.message); }
  };

  const totalWorkflows = workflows?.length || 0;
  const completedWorkflows = workflows?.filter(w => w.progress === 100).length || 0;
  const inProgressWorkflows = workflows?.filter(w => w.progress > 0 && w.progress < 100).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Workflow Manager</h1>
          <p className="text-white/40 text-sm">Visualize and track task sequences from start to finish.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" />New Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: totalWorkflows, color: '#8B5CF6', icon: GitBranch },
          { label: 'In Progress', value: inProgressWorkflows, color: '#3B82F6', icon: Play },
          { label: 'Completed', value: completedWorkflows, color: '#10B981', icon: Check },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <div className="font-display font-bold text-2xl">{value}</div>
              <div className="text-xs text-white/40">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Workflows list */}
      {workflows === undefined && (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="glass h-24 animate-pulse" />)}
        </div>
      )}

      {workflows !== undefined && workflows.length === 0 && (
        <div className="glass p-16 text-center">
          <GitBranch className="w-14 h-14 mx-auto text-white/20 mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">No workflows yet</h3>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Create a workflow to visualize how tasks move from start to finish — step by step.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" />Create your first workflow
          </button>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {(workflows || []).map(wf => (
            <WorkflowCard key={wf._id} workflow={wf} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      </div>

      {showCreate && <CreateWorkflowModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
