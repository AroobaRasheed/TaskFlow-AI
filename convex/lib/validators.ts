// convex/lib/validators.ts
// Reusable Convex validator objects for common input shapes.

import { v } from "convex/values";

// ─── Task validators ──────────────────────────────────────────────────────

export const taskCreateValidator = {
  title: v.string(),
  description: v.optional(v.string()),
  priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  status: v.union(
    v.literal("todo"),
    v.literal("in_progress"),
    v.literal("completed")
  ),
  deadline: v.optional(v.number()),
  assignedTo: v.optional(v.id("users")),
  estimatedTime: v.optional(v.number()),
};

export const taskUpdateValidator = {
  id: v.id("tasks"),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  priority: v.optional(
    v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
  ),
  status: v.optional(
    v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed")
    )
  ),
  deadline: v.optional(v.number()),
  assignedTo: v.optional(v.id("users")),
  estimatedTime: v.optional(v.number()),
  aiSuggestions: v.optional(v.string()),
};

// ─── Auth validators ──────────────────────────────────────────────────────

export const signUpValidator = {
  name: v.string(),
  email: v.string(),
  password: v.string(),
  role: v.optional(
    v.union(v.literal("admin"), v.literal("member"), v.literal("viewer"))
  ),
};

// ─── AI validators ────────────────────────────────────────────────────────

export const analyzeTaskValidator = {
  taskId: v.id("tasks"),
  title: v.string(),
  description: v.optional(v.string()),
  deadline: v.optional(v.number()),
  teamSize: v.optional(v.number()),
};

export const chatMessageValidator = {
  message: v.string(),
};

// ─── Notification validators ──────────────────────────────────────────────

export const createNotificationValidator = {
  userId: v.id("users"),
  title: v.string(),
  message: v.string(),
  type: v.union(
    v.literal("info"),
    v.literal("warning"),
    v.literal("success"),
    v.literal("error")
  ),
};
