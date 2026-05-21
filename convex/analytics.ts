// convex/analytics.ts
// Weekly analytics snapshots and productivity trends.

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { now, currentWeekLabel, calcProductivityScore, isOverdue } from "./lib/helpers";

// ─── Save a weekly analytics snapshot ────────────────────────────────────
// Call this once per week (or on-demand for demo purposes).

export const saveSnapshot = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
    if (!user) throw new Error("User not found.");

    const allTasks = await ctx.db.query("tasks").collect();
    const completed = allTasks.filter((t) => t.status === "completed").length;
    const pending = allTasks.filter((t) => t.status !== "completed").length;
    const overdue = allTasks.filter(
      (t) => t.status !== "completed" && isOverdue(t.deadline)
    ).length;
    const score = calcProductivityScore(completed, allTasks.length);
    const weekLabel = currentWeekLabel();

    // Upsert: delete old snapshot for this week if it exists
    const existing = await ctx.db
      .query("analytics")
      .withIndex("by_week", (q) => q.eq("weekLabel", weekLabel))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        productivityScore: score,
        completedTasks: completed,
        pendingTasks: pending,
        overdueTasks: overdue,
        createdAt: now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("analytics", {
      userId: user._id,
      productivityScore: score,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
      weekLabel,
      createdAt: now(),
    });
  },
});

// ─── Get last N weekly snapshots (for trend charts) ───────────────────────

export const getWeeklyTrends = query({
  args: { weeks: v.optional(v.number()) },
  handler: async (ctx, { weeks }) => {
    const snapshots = await ctx.db
      .query("analytics")
      .withIndex("by_week")
      .order("desc")
      .take(weeks ?? 8);

    return snapshots.reverse(); // oldest → newest for charting
  },
});

// ─── Current productivity score (live, no snapshot needed) ───────────────

export const getLiveProductivityScore = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const completed = tasks.filter((t) => t.status === "completed").length;
    return {
      score: calcProductivityScore(completed, tasks.length),
      total: tasks.length,
      completed,
    };
  },
});

// ─── Overdue task count ───────────────────────────────────────────────────

export const getOverdueCount = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const overdue = tasks.filter(
      (t) => t.status !== "completed" && isOverdue(t.deadline)
    );
    return { count: overdue.length, tasks: overdue };
  },
});
