// convex/progress.ts
// Progress tracking – per-user and per-task completion metrics.

import { query } from "./_generated/server";
import { v } from "convex/values";
import { isOverdue, calcProductivityScore } from "./lib/helpers";

// ─── Overall team progress ────────────────────────────────────────────────

export const getTeamProgress = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();

    const byStatus = {
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };

    const completionRate = calcProductivityScore(byStatus.completed, tasks.length);

    // Group tasks by priority
    const byPriority = {
      high: tasks.filter((t) => t.priority === "high").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      low: tasks.filter((t) => t.priority === "low").length,
    };

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      completionRate,
      overdueCount: tasks.filter(
        (t) => t.status !== "completed" && isOverdue(t.deadline)
      ).length,
    };
  },
});

// ─── Progress for a specific user ─────────────────────────────────────────

export const getUserProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignedTo", userId))
      .collect();

    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const overdue = tasks.filter(
      (t) => t.status !== "completed" && isOverdue(t.deadline)
    ).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate: calcProductivityScore(completed, tasks.length),
    };
  },
});

// ─── Upcoming deadlines (next 7 days) ────────────────────────────────────

export const getUpcomingDeadlines = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDays = now + 7 * 24 * 60 * 60 * 1000;

    const tasks = await ctx.db.query("tasks").collect();

    return tasks
      .filter(
        (t) =>
          t.status !== "completed" &&
          t.deadline &&
          t.deadline >= now &&
          t.deadline <= sevenDays
      )
      .sort((a, b) => (a.deadline ?? 0) - (b.deadline ?? 0))
      .map((t) => ({
        id: t._id,
        title: t.title,
        priority: t.priority,
        deadline: t.deadline,
        status: t.status,
        daysLeft: Math.ceil(((t.deadline ?? 0) - now) / (1000 * 60 * 60 * 24)),
      }));
  },
});
