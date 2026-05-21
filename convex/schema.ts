import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Users ───────────────────────────────────────────────────────────────
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    tokenIdentifier: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    password: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  // ─── Email Verification Tokens ───────────────────────────────────────────
  emailVerifications: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_token", ["token"]),

  // ─── Tasks ────────────────────────────────────────────────────────────────
  tasks: defineTable({
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
    aiSuggestions: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_assignee", ["assignedTo"])
    .index("by_created", ["createdAt"]),

  // ─── Chat Messages (AI Assistant) ─────────────────────────────────────────
  chatMessages: defineTable({
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  // ─── Team Members ─────────────────────────────────────────────────────────
  teamMembers: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(),
    department: v.optional(v.string()),
    avatarColor: v.string(),
    avatarInitials: v.string(),
    status: v.union(v.literal("online"), v.literal("away"), v.literal("offline")),
    addedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_added_by", ["addedBy"])
    .index("by_created", ["createdAt"]),

  // ─── Team Messages (member-to-member communication) ───────────────────────
  teamMessages: defineTable({
    senderId: v.string(),      // "user:{id}" or "member:{id}"
    senderName: v.string(),
    senderInitials: v.string(),
    senderColor: v.string(),
    recipientId: v.optional(v.string()),  // null = broadcast to all
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"]),

  // ─── Workflows ────────────────────────────────────────────────────────────
  workflows: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_created", ["createdAt"]),

  // ─── Workflow Steps ───────────────────────────────────────────────────────
  workflowSteps: defineTable({
    workflowId: v.id("workflows"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("blocked")
    ),
    assignedTo: v.optional(v.string()),  // member name
    estimatedHours: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_workflow", ["workflowId"])
    .index("by_workflow_order", ["workflowId", "order"]),

  // ─── Notifications ────────────────────────────────────────────────────────
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("success"),
      v.literal("error")
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_read", ["read"]),

  // ─── Analytics Snapshots ─────────────────────────────────────────────────
  analytics: defineTable({
    userId: v.id("users"),
    productivityScore: v.number(),
    completedTasks: v.number(),
    pendingTasks: v.number(),
    overdueTasks: v.number(),
    weekLabel: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_week", ["weekLabel"]),
});
