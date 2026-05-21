export const stats = [
  { label: 'Total Tasks', value: '248', delta: 12, color: 'purple' },
  { label: 'Completed', value: '164', delta: 8, color: 'green' },
  { label: 'Pending', value: '63', delta: -4, color: 'blue' },
  { label: 'High Priority', value: '21', delta: 3, color: 'red' },
];

export const weeklyProductivity = [
  { day: 'Mon', tasks: 12, focus: 80 },
  { day: 'Tue', tasks: 18, focus: 65 },
  { day: 'Wed', tasks: 15, focus: 72 },
  { day: 'Thu', tasks: 22, focus: 88 },
  { day: 'Fri', tasks: 19, focus: 76 },
  { day: 'Sat', tasks: 8, focus: 45 },
  { day: 'Sun', tasks: 6, focus: 40 },
];

export const progressDistribution = [
  { name: 'Completed', value: 164, color: '#8B5CF6' },
  { name: 'In Progress', value: 63, color: '#3B82F6' },
  { name: 'Pending', value: 21, color: '#22D3EE' },
];

export const activity = [
  { who: 'Mira Chen', action: 'completed', target: 'Q3 Roadmap Outline', time: '12m ago', color: '#A78BFA' },
  { who: 'Jordan Reyes', action: 'commented on', target: 'Onboarding redesign', time: '34m ago', color: '#3B82F6' },
  { who: 'AI Assistant', action: 'flagged risk on', target: 'Payments integration', time: '1h ago', color: '#F472B6' },
  { who: 'Sam Patel', action: 'created task', target: 'Customer interviews', time: '2h ago', color: '#34D399' },
  { who: 'You', action: 'updated deadline for', target: 'Beta launch', time: '3h ago', color: '#FBBF24' },
];

export const deadlines = [
  { title: 'Mobile App Beta', date: 'May 24', daysLeft: 3, owner: 'Mira' },
  { title: 'Investor Update Deck', date: 'May 27', daysLeft: 6, owner: 'Alex' },
  { title: 'Security Audit', date: 'Jun 02', daysLeft: 12, owner: 'Jordan' },
  { title: 'Q3 Planning', date: 'Jun 09', daysLeft: 19, owner: 'Team' },
];

const A = (initials, color) => ({ initials, color });

export const kanban = {
  'To Do': [
    { id: 1, title: 'Design empty states for analytics', description: 'Cover no-data and onboarding paths with consistent illustrations.', priority: 'Medium', tag: 'Design', deadline: 'May 26', comments: 4, attachments: 2, assignees: [A('MC', '#A78BFA'), A('JR', '#3B82F6')] },
    { id: 2, title: 'Research competitive AI assistants', description: 'Compare top 5 PM AI tools and document patterns.', priority: 'Low', tag: 'Research', deadline: 'May 30', comments: 1, attachments: 0, assignees: [A('SP', '#34D399')] },
    { id: 3, title: 'Spec voice-input UX', description: 'Microcopy + state machine for hands-free task capture.', priority: 'High', tag: 'Product', deadline: 'May 28', comments: 7, attachments: 3, assignees: [A('AK', '#FBBF24'), A('MC', '#A78BFA')] },
  ],
  'In Progress': [
    { id: 4, title: 'Implement Kanban drag interactions', description: 'Pointer + keyboard accessible drag and drop on the task board.', priority: 'High', tag: 'Engineering', deadline: 'May 25', comments: 12, attachments: 5, assignees: [A('JR', '#3B82F6')], progress: 65 },
    { id: 5, title: 'Polish onboarding flow', description: 'Refine copy, animations, and skip paths for new sign-ups.', priority: 'Medium', tag: 'Design', deadline: 'May 27', comments: 5, attachments: 1, assignees: [A('MC', '#A78BFA')], progress: 40 },
    { id: 6, title: 'AI risk-scoring model v2', description: 'Retrain on Q1+Q2 data and ship behind feature flag.', priority: 'High', tag: 'ML', deadline: 'May 29', comments: 9, attachments: 4, assignees: [A('SP', '#34D399'), A('AI', '#F472B6')], progress: 78 },
  ],
  'Completed': [
    { id: 7, title: 'Refactor notification service', description: 'Move to event bus, drop legacy webhooks.', priority: 'Medium', tag: 'Engineering', deadline: 'May 20', comments: 6, attachments: 2, assignees: [A('JR', '#3B82F6')] },
    { id: 8, title: 'Launch landing page A/B', description: '50/50 split, gradient hero vs. video hero.', priority: 'Low', tag: 'Marketing', deadline: 'May 18', comments: 3, attachments: 1, assignees: [A('AK', '#FBBF24')] },
  ],
};

export const teamMembers = [
  { name: 'Mira Chen', role: 'Design Lead', tasks: 38, completion: 92, focus: 88, avatar: A('MC', '#A78BFA') },
  { name: 'Jordan Reyes', role: 'Sr. Engineer', tasks: 44, completion: 86, focus: 81, avatar: A('JR', '#3B82F6') },
  { name: 'Sam Patel', role: 'ML Researcher', tasks: 29, completion: 79, focus: 74, avatar: A('SP', '#34D399') },
  { name: 'Alex Kim', role: 'Product Lead', tasks: 52, completion: 90, focus: 83, avatar: A('AK', '#FBBF24') },
];
