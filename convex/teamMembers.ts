import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { now } from "./lib/helpers";

const AVATAR_COLORS = [
  "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#EC4899", "#14B8A6", "#F97316",
];

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Same requireUser pattern as tasks.ts ────────────────────────────────
async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  let user;

  if (identity) {
    user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
  } else {
    // Fallback for demo without Convex auth — same as tasks.ts
    user = await ctx.db.query("users").order("desc").first();
  }

  if (!user) throw new Error("User profile not found. Please log in or sign up.");
  return user;
}

// ─── List all team members ────────────────────────────────────────────────
export const listTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("teamMembers")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

// ─── Add a team member ────────────────────────────────────────────────────
export const addTeamMember = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    department: v.optional(v.string()),
  },
  handler: async (ctx, { name, email, role, department }) => {
    const user = await requireUser(ctx as any);

    if (!name.trim()) throw new Error("Name is required.");
    if (!email.trim() || !email.includes("@")) throw new Error("Valid email is required.");
    if (!role.trim()) throw new Error("Role is required.");

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_email", (q: any) => q.eq("email", email.toLowerCase()))
      .first();
    if (existing) throw new Error("A team member with this email already exists.");

    const colorIndex = Math.floor(Math.random() * AVATAR_COLORS.length);

    const memberId = await ctx.db.insert("teamMembers", {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role.trim(),
      department: department?.trim(),
      avatarColor: AVATAR_COLORS[colorIndex],
      avatarInitials: getInitials(name.trim()),
      status: "offline" as const,
      addedBy: user._id,
      createdAt: now(),
    });

    await ctx.db.insert("notifications", {
      userId: user._id,
      title: "Team Member Added",
      message: `${name.trim()} has been added to your team.`,
      read: false,
      type: "success",
      createdAt: now(),
    });

    return memberId;
  },
});

// ─── Update team member ───────────────────────────────────────────────────
export const updateTeamMember = mutation({
  args: {
    id: v.id("teamMembers"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    department: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("online"), v.literal("away"), v.literal("offline"))
    ),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireUser(ctx as any);

    const member = await ctx.db.get(id);
    if (!member) throw new Error("Team member not found.");

    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) {
      patch.name = updates.name.trim();
      patch.avatarInitials = getInitials(updates.name.trim());
    }
    if (updates.role !== undefined) patch.role = updates.role.trim();
    if (updates.department !== undefined) patch.department = updates.department;
    if (updates.status !== undefined) patch.status = updates.status;

    await ctx.db.patch(id, patch);
    return id;
  },
});

// ─── Remove team member ───────────────────────────────────────────────────
export const removeTeamMember = mutation({
  args: { id: v.id("teamMembers") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx as any);

    const member = await ctx.db.get(id);
    if (!member) throw new Error("Team member not found.");

    await ctx.db.delete(id);
    return { success: true };
  },
});
