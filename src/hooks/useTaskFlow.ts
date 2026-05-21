// src/hooks/useTaskFlow.ts
// Ready-to-use hooks for all TaskFlow AI backend endpoints.

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ── Users ─────────────────────────────────────────────────────────────────
export function useMe() { return useQuery(api.users.getMe, {}); }
export function useUsers() { return useQuery(api.users.listUsers, {}); }
export function useCreateUser() { return useMutation(api.users.createUser); }
export function useUpdateProfile() { return useMutation(api.users.updateProfile); }

// ── Tasks ─────────────────────────────────────────────────────────────────
export function useTasks(filters?: { status?: "todo"|"in_progress"|"completed"; priority?: "low"|"medium"|"high" }) {
  return useQuery(api.tasks.getTasks, filters ?? {});
}
export function useTask(id: Id<"tasks">) { return useQuery(api.tasks.getTaskById, { id }); }
export function useCreateTask() { return useMutation(api.tasks.createTask); }
export function useUpdateTask() { return useMutation(api.tasks.updateTask); }
export function useUpdateTaskStatus() { return useMutation(api.tasks.updateTaskStatus); }
export function useDeleteTask() { return useMutation(api.tasks.deleteTask); }

// ── Dashboard ─────────────────────────────────────────────────────────────
export function useDashboardStats() { return useQuery(api.dashboard.getStats, {}); }
export function useRecentActivity() { return useQuery(api.dashboard.getRecentActivity, {}); }
export function useStatusDistribution() { return useQuery(api.dashboard.getStatusDistribution, {}); }

// ── Analytics ─────────────────────────────────────────────────────────────
export function useWeeklyTrends(weeks = 8) { return useQuery(api.analytics.getWeeklyTrends, { weeks }); }
export function useProductivityScore() { return useQuery(api.analytics.getLiveProductivityScore, {}); }
export function useOverdueTasks() { return useQuery(api.analytics.getOverdueCount, {}); }
export function useSaveSnapshot() { return useMutation(api.analytics.saveSnapshot); }

// ── Progress ──────────────────────────────────────────────────────────────
export function useTeamProgress() { return useQuery(api.progress.getTeamProgress, {}); }
export function useUserProgress(userId: Id<"users">) { return useQuery(api.progress.getUserProgress, { userId }); }
export function useUpcomingDeadlines() { return useQuery(api.progress.getUpcomingDeadlines, {}); }

// ── Notifications ─────────────────────────────────────────────────────────
export function useNotifications(unreadOnly = false) { return useQuery(api.notifications.getNotifications, { unreadOnly }); }
export function useUnreadCount() { return useQuery(api.notifications.getUnreadCount, {}); }
export function useMarkRead() { return useMutation(api.notifications.markRead); }
export function useMarkAllRead() { return useMutation(api.notifications.markAllRead); }

// ── AI ────────────────────────────────────────────────────────────────────
export function useAnalyzeTask() { return useAction(api.ai.analyzeTask); }
export function useProductivityInsights() { return useAction(api.ai.getProductivityInsights); }

// ── Chat ──────────────────────────────────────────────────────────────────
export function useChatHistory(limit = 50) { return useQuery(api.chat.getChatHistory, { limit }); }
export function useSendMessage() { return useAction(api.chat.sendMessage); }
export function useClearChat() { return useMutation(api.chat.clearChatHistory); }
