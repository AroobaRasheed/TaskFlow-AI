// convex/notifications.ts
// In-app notifications – real-time via Convex subscriptions.

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { createNotificationValidator } from "./lib/validators";
import { now } from "./lib/helpers";

// ─── Get notifications for the current user ───────────────────────────────

export const getNotifications = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, { unreadOnly }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
    if (!user) return [];

    let notifs = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(30);

    if (unreadOnly) {
      notifs = notifs.filter((n) => !n.read);
    }

    return notifs;
  },
});

// ─── Mark notification as read ────────────────────────────────────────────

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const notif = await ctx.db.get(id);
    if (!notif) throw new Error("Notification not found.");
    await ctx.db.patch(id, { read: true });
    return id;
  },
});

// ─── Mark all as read ─────────────────────────────────────────────────────

export const markAllRead = mutation({
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

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
    return { updated: unread.length };
  },
});

// ─── Create a notification (internal helper, also exposed for testing) ────

export const createNotification = mutation({
  args: createNotificationValidator,
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: now(),
    });
  },
});

// ─── Delete a notification ────────────────────────────────────────────────

export const deleteNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

// ─── Unread count (for badge) ─────────────────────────────────────────────

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return unread.length;
  },
});
