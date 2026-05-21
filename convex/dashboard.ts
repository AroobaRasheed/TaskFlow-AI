// convex/dashboard.ts
// Dashboard statistics – all real-time via Convex queries.

import { query } from "./_generated/server";
import { calcProductivityScore, isOverdue } from "./lib/helpers";

// ─── Main dashboard stats ─────────────────────────────────────────────────

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allTasks = await ctx.db.query("tasks").collect();

    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === "completed").length;
    const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
    const todo = allTasks.filter((t) => t.status === "todo").length;
    const overdue = allTasks.filter(
      (t) => t.status !== "completed" && isOverdue(t.deadline)
    ).length;
    const productivityScore = calcProductivityScore(completed, total);

    // Priority breakdown
    const highPriority = allTasks.filter((t) => t.priority === "high" && t.status !== "completed").length;
    const medPriority = allTasks.filter((t) => t.priority === "medium" && t.status !== "completed").length;
    const lowPriority = allTasks.filter((t) => t.priority === "low" && t.status !== "completed").length;

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      productivityScore,
      priorityBreakdown: { high: highPriority, medium: medPriority, low: lowPriority },
    };
  },
});

// ─── Recent activity feed (latest 10 tasks, newest first) ────────────────

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_created")
      .order("desc")
      .take(10);

    return tasks.map((t) => ({
      id: t._id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      updatedAt: t.updatedAt,
    }));
  },
});

// ─── Status distribution for charts ──────────────────────────────────────

export const getStatusDistribution = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const total = tasks.length || 1; // avoid divide by zero

    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;

    return [
      { label: "To Do", count: todo, pct: Math.round((todo / total) * 100) },
      { label: "In Progress", count: inProgress, pct: Math.round((inProgress / total) * 100) },
      { label: "Completed", count: completed, pct: Math.round((completed / total) * 100) },
    ];
  },
});
