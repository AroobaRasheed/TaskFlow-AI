import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { now } from "./lib/helpers";

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

// ─── List all workflows ───────────────────────────────────────────────────
export const listWorkflows = query({
  args: {},
  handler: async (ctx) => {
    const workflows = await ctx.db
      .query("workflows")
      .withIndex("by_created")
      .order("desc")
      .collect();

    const result = await Promise.all(
      workflows.map(async (wf: any) => {
        const steps = await ctx.db
          .query("workflowSteps")
          .withIndex("by_workflow", (q: any) => q.eq("workflowId", wf._id))
          .collect();
        const sorted = steps.sort((a: any, b: any) => a.order - b.order);
        const completed = sorted.filter((s: any) => s.status === "completed").length;
        return {
          ...wf,
          steps: sorted,
          progress: sorted.length > 0 ? Math.round((completed / sorted.length) * 100) : 0,
        };
      })
    );
    return result;
  },
});

// ─── Get single workflow with steps ───────────────────────────────────────
export const getWorkflow = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, { id }) => {
    const wf = await ctx.db.get(id);
    if (!wf) return null;
    const steps = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflow", (q: any) => q.eq("workflowId", id))
      .collect();
    return { ...wf, steps: steps.sort((a: any, b: any) => a.order - b.order) };
  },
});

// ─── Create workflow ──────────────────────────────────────────────────────
export const createWorkflow = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    steps: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        estimatedHours: v.optional(v.number()),
        assignedTo: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { title, description, steps }) => {
    const user = await requireUser(ctx as any);
    if (!title.trim()) throw new Error("Workflow title is required.");
    if (steps.length === 0) throw new Error("At least one step is required.");

    const wfId = await ctx.db.insert("workflows", {
      title: title.trim(),
      description: description?.trim(),
      createdBy: user._id,
      createdAt: now(),
      updatedAt: now(),
    });

    for (let i = 0; i < steps.length; i++) {
      await ctx.db.insert("workflowSteps", {
        workflowId: wfId,
        title: steps[i].title.trim(),
        description: steps[i].description?.trim(),
        order: i + 1,
        status: i === 0 ? "in_progress" : "pending",
        assignedTo: steps[i].assignedTo,
        estimatedHours: steps[i].estimatedHours,
      });
    }

    return wfId;
  },
});

// ─── Update step status ───────────────────────────────────────────────────
export const updateStepStatus = mutation({
  args: {
    stepId: v.id("workflowSteps"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, { stepId, status }) => {
    await requireUser(ctx as any);

    const step = await ctx.db.get(stepId);
    if (!step) throw new Error("Step not found.");

    await ctx.db.patch(stepId, {
      status,
      completedAt: status === "completed" ? now() : undefined,
    });

    // Auto-activate next step when current is completed
    if (status === "completed") {
      const allSteps = await ctx.db
        .query("workflowSteps")
        .withIndex("by_workflow", (q: any) => q.eq("workflowId", step.workflowId))
        .collect();

      const nextStep = allSteps
        .sort((a: any, b: any) => a.order - b.order)
        .find((s: any) => s.order === step.order + 1 && s.status === "pending");

      if (nextStep) {
        await ctx.db.patch(nextStep._id, { status: "in_progress" });
      }
    }

    await ctx.db.patch(step.workflowId, { updatedAt: now() });
    return stepId;
  },
});

// ─── Add step to existing workflow ───────────────────────────────────────
export const addWorkflowStep = mutation({
  args: {
    workflowId: v.id("workflows"),
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
  },
  handler: async (ctx, { workflowId, title, description, assignedTo, estimatedHours }) => {
    await requireUser(ctx as any);
    if (!title.trim()) throw new Error("Step title is required.");

    const existingSteps = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflow", (q: any) => q.eq("workflowId", workflowId))
      .collect();

    const maxOrder = existingSteps.reduce((max: number, s: any) => Math.max(max, s.order), 0);

    const stepId = await ctx.db.insert("workflowSteps", {
      workflowId,
      title: title.trim(),
      description: description?.trim(),
      order: maxOrder + 1,
      status: "pending",
      assignedTo,
      estimatedHours,
    });

    await ctx.db.patch(workflowId, { updatedAt: now() });
    return stepId;
  },
});

// ─── Delete workflow ──────────────────────────────────────────────────────
export const deleteWorkflow = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx as any);

    const steps = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflow", (q: any) => q.eq("workflowId", id))
      .collect();

    for (const step of steps) {
      await ctx.db.delete(step._id);
    }
    await ctx.db.delete(id);
    return { success: true };
  },
});
