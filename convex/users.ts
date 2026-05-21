// convex/users.ts
// User management – queries & mutations.

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { now } from "./lib/helpers";
import { signUpValidator } from "./lib/validators";
import { DEFAULT_AVATAR } from "./lib/constants";

// ─── Get current authenticated user ──────────────────────────────────────

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    let user;
    if (identity) {
      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .first();
    } else {
      user = await ctx.db.query("users").order("desc").first();
    }
    return user ?? null;
  },
});

// ─── Get a user by ID ─────────────────────────────────────────────────────

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ─── List all users (for task assignment dropdowns) ───────────────────────

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// ─── Create / upsert user after first login ───────────────────────────────

export const createUser = mutation({
  args: signUpValidator,
  handler: async (ctx, { name, email, role }) => {
    // Check for existing user
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) return existing._id;

    const identity = await ctx.auth.getUserIdentity();

    const userId = await ctx.db.insert("users", {
      name,
      email,
      role: role ?? "member",
      avatar: `${DEFAULT_AVATAR}?seed=${encodeURIComponent(name)}`,
      createdAt: now(),
      tokenIdentifier: identity?.tokenIdentifier,
    });

    return userId;
  },
});

// ─── Update user profile ──────────────────────────────────────────────────

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("member"), v.literal("viewer"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) throw new Error("User not found.");

    const updates: Partial<typeof args> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.avatar !== undefined) updates.avatar = args.avatar;
    if (args.role !== undefined) updates.role = args.role;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});
