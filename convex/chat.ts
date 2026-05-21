// convex/chat.ts
import { query, action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { chatWithAI } from "./lib/gemini";
import { now } from "./lib/helpers";
import { CHAT_PAGE_SIZE } from "./lib/constants";

// Get chat history – works with or without Convex auth
export const getChatHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    // Get the most recent user (works in demo mode without auth)
    const user = await ctx.db.query("users").order("desc").first();
    if (!user) return [];

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit ?? CHAT_PAGE_SIZE);
  },
});

// Send message – calls Gemini and stores result
export const sendMessage = action({
  args: { message: v.string() },
  handler: async (ctx, { message }) => {
    if (!message.trim()) throw new Error("Message cannot be empty.");

    // Call Gemini
    const response = await chatWithAI(message.trim());

    // Get user (first available in demo mode)
    const user: any = await ctx.runQuery(api.users.getMe, {});
    if (!user) throw new Error("Please sign up first to save chat history.");

    await ctx.runMutation(api.chat.saveMessage, {
      userId: user._id,
      message: message.trim(),
      response,
    });

    return { message, response };
  },
});

export const saveMessage = mutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
  },
  handler: async (ctx, { userId, message, response }) => {
    return await ctx.db.insert("chatMessages", {
      userId,
      message,
      response,
      createdAt: now(),
    });
  },
});

export const clearChatHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").order("desc").first();
    if (!user) return { deleted: 0 };

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    return { deleted: messages.length };
  },
});
