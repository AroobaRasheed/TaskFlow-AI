import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { now } from "./lib/helpers";

// ─── Get team messages (no auth required — anyone can read) ───────────────
export const getTeamMessages = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("teamMessages")
      .withIndex("by_created")
      .order("desc")
      .take(limit ?? 100);
  },
});

// ─── Send a team message (no auth required — sender info passed explicitly) ─
// This avoids the "User not found" error entirely for the chat feature.
export const sendTeamMessage = mutation({
  args: {
    content: v.string(),
    senderName: v.string(),
    senderInitials: v.string(),
    senderColor: v.string(),
    senderId: v.string(),
  },
  handler: async (ctx, { content, senderName, senderInitials, senderColor, senderId }) => {
    if (!content.trim()) throw new Error("Message cannot be empty.");
    if (!senderName.trim()) throw new Error("Sender name is required.");

    return await ctx.db.insert("teamMessages", {
      senderId,
      senderName,
      senderInitials,
      senderColor,
      content: content.trim(),
      createdAt: now(),
    });
  },
});

// ─── Clear team messages ──────────────────────────────────────────────────
export const clearTeamMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("teamMessages").collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    return { deleted: messages.length };
  },
});
