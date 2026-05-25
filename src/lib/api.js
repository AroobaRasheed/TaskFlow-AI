const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  try {
    const user = JSON.parse(localStorage.getItem('taskflow_user'));
    return user?.token || '';
  } catch { return ''; }
}

// Map raw server errors to user-friendly messages
function friendlyError(raw, status) {
  if (status === 500 || /timed?\s*out|buffering|ECONNREFUSED|ENOTFOUND|socket/i.test(raw)) {
    return 'Server is temporarily unavailable. Please try again in a moment.';
  }
  if (/access token|authentication error/i.test(raw)) {
    return 'Server is temporarily unavailable. Please try again in a moment.';
  }
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status === 503) return 'Service is under maintenance. Please try again shortly.';
  return raw || 'Something went wrong. Please try again.';
}

async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    throw new Error('Unable to connect to server. Please check your internet connection.');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error('Server error. Please try again.');
    return {};
  }

  if (!res.ok) throw new Error(friendlyError(data.error, res.status));
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────
export const api = {
  // Users
  signup: (body) => request('/users/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/users/login', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: (body) => request('/users/verify-email', { method: 'POST', body: JSON.stringify(body) }),
  resendOtp: (body) => request('/users/resend-otp', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/users/me'),
  updateProfile: (body) => request('/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),

  // Tasks
  getTasks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/tasks${q ? '?' + q : ''}`);
  },
  createTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateTaskStatus: (id, status) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Dashboard
  getStats: () => request('/dashboard/stats'),
  getRecentActivity: () => request('/dashboard/recent'),
  getStatusDistribution: () => request('/dashboard/distribution'),

  // Chat
  getChatHistory: (limit = 50) => request(`/chat/history?limit=${limit}`),
  sendMessage: (message) => request('/chat/send', { method: 'POST', body: JSON.stringify({ message }) }),
  clearChat: () => request('/chat/clear', { method: 'DELETE' }),

  // AI
  analyzeTask: (body) => request('/ai/analyze', { method: 'POST', body: JSON.stringify(body) }),
  getInsights: (body) => request('/ai/insights', { method: 'POST', body: JSON.stringify(body) }),

  // Progress
  getTeamProgress: () => request('/progress/team'),
  getUpcomingDeadlines: () => request('/progress/deadlines'),

  // Analytics
  getLiveScore: () => request('/analytics/score'),
  getOverdueCount: () => request('/analytics/overdue'),
  getWeeklyTrends: (weeks = 8) => request(`/analytics/trends?weeks=${weeks}`),

  // Team Members
  listTeamMembers: () => request('/team-members'),
  addTeamMember: (body) => request('/team-members', { method: 'POST', body: JSON.stringify(body) }),
  updateTeamMember: (id, body) => request(`/team-members/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  removeTeamMember: (id) => request(`/team-members/${id}`, { method: 'DELETE' }),

  // Team Messages
  getTeamMessages: (limit = 100) => request(`/team-messages?limit=${limit}`),
  sendTeamMessage: (body) => request('/team-messages', { method: 'POST', body: JSON.stringify(body) }),

  // Workflows
  listWorkflows: () => request('/workflows'),
  createWorkflow: (body) => request('/workflows', { method: 'POST', body: JSON.stringify(body) }),
  updateStepStatus: (wfId, stepId, status) => request(`/workflows/${wfId}/steps/${stepId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteWorkflow: (id) => request(`/workflows/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
};
