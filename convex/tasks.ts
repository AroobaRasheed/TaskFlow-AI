// convex/tasks.ts
// Full CRUD for tasks with real-time Convex queries.

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { taskCreateValidator, taskUpdateValidator } from "./lib/validators";
import { now, isOverdue } from "./lib/helpers";
import { TASKS_PAGE_SIZE } from "./lib/constants";

// ─── Helper: resolve authenticated user ──────────────────────────────────

async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  let user;

  if (identity) {
    user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
  } else {
    // Fallback for demo without auth
    user = await ctx.db.query("users").order("desc").first();
  }

  if (!user) throw new Error("User profile not found. Please log in or sign up.");
  return user;
}

// ─── List all tasks ───────────────────────────────────────────────────────

export const getTasks = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("completed")
      )
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
  },
  handler: async (ctx, { status, priority }) => {
    let tasks;

    if (status) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_status", (q: any) => q.eq("status", status))
        .order("desc")
        .take(TASKS_PAGE_SIZE);
    } else if (priority) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_priority", (q: any) => q.eq("priority", priority))
        .order("desc")
        .take(TASKS_PAGE_SIZE);
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_created")
        .order("desc")
        .take(TASKS_PAGE_SIZE);
    }

    // Annotate each task with overdue flag
    return tasks.map((t: any) => ({
      ...t,
      isOverdue: t.status !== "completed" && isOverdue(t.deadline),
    }));
  },
});

// ─── Get single task ──────────────────────────────────────────────────────

export const getTaskById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const task = await ctx.db.get(id);
    if (!task) return null;
    return { ...task, isOverdue: task.status !== "completed" && isOverdue(task.deadline) };
  },
});

// ─── Create task ──────────────────────────────────────────────────────────

export const createTask = mutation({
  args: taskCreateValidator,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx as any);

    if (!args.title.trim()) throw new Error("Task title cannot be empty.");

    if (args.deadline && args.deadline < Date.now()) {
      throw new Error("Deadline cannot be in the past.");
    }

    const taskId = await ctx.db.insert("tasks", {
      title: args.title.trim(),
      description: args.description?.trim(),
      priority: args.priority,
      status: args.status,
      deadline: args.deadline,
      assignedTo: args.assignedTo,
      estimatedTime: args.estimatedTime,
      aiSuggestions: undefined,
      createdBy: user._id,
      createdAt: now(),
      updatedAt: now(),
    });

    // Create a notification for task creation
    await ctx.db.insert("notifications", {
      userId: user._id,
      title: "Task Created",
      message: `"${args.title}" has been added to your board.`,
      read: false,
      type: "success",
      createdAt: now(),
    });

    return taskId;
  },
});

// ─── Update task ──────────────────────────────────────────────────────────

export const updateTask = mutation({
  args: taskUpdateValidator,
  handler: async (ctx, { id, ...updates }) => {
    await requireUser(ctx as any);

    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found.");

    const patch: Record<string, unknown> = { updatedAt: now() };

    if (updates.title !== undefined) {
      if (!updates.title.trim()) throw new Error("Title cannot be empty.");
      patch.title = updates.title.trim();
    }
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.priority !== undefined) patch.priority = updates.priority;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.deadline !== undefined) patch.deadline = updates.deadline;
    if (updates.assignedTo !== undefined) patch.assignedTo = updates.assignedTo;
    if (updates.estimatedTime !== undefined) patch.estimatedTime = updates.estimatedTime;
    if (updates.aiSuggestions !== undefined) patch.aiSuggestions = updates.aiSuggestions;

    await ctx.db.patch(id, patch);
    return id;
  },
});

// ─── Delete task ──────────────────────────────────────────────────────────

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx as any);

    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found.");

    await ctx.db.delete(id);
    return { success: true };
  },
});

// ─── Bulk status update (kanban drag-drop) ────────────────────────────────

export const updateTaskStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, { id, status }) => {
    await requireUser(ctx as any);
    await ctx.db.patch(id, { status, updatedAt: now() });
    return id;
  },
});
