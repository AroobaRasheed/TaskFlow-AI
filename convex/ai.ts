// convex/ai.ts
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { analyzeTaskWithAI, generateProductivityInsights } from "./lib/gemini";
import { safeStringify } from "./lib/helpers";

export const analyzeTask = action({
  args: {
    taskId: v.optional(v.id("tasks")), // optional — works without a saved task
    title: v.string(),
    description: v.optional(v.string()),
    deadline: v.optional(v.number()),
    teamSize: v.optional(v.number()),
  },
  handler: async (ctx, { taskId, title, description, deadline, teamSize }) => {
    const analysis = await analyzeTaskWithAI({
      title,
      description: description ?? "",
      deadline: deadline ? new Date(deadline).toLocaleDateString() : undefined,
      teamSize: teamSize ?? 1,
    });

    // If we have a taskId, persist the AI results back
    if (taskId) {
      await ctx.runMutation(api.tasks.updateTask, {
        id: taskId,
        aiSuggestions: safeStringify(analysis),
        priority: analysis.priority,
        estimatedTime: analysis.estimatedHours,
      });
    }

    return analysis;
  },
});

export const getProductivityInsights = action({
  args: {
    completedTasks: v.number(),
    pendingTasks: v.number(),
    overdueTasks: v.number(),
    productivityScore: v.number(),
  },
  handler: async (ctx, stats) => {
    const insights = await generateProductivityInsights(stats);
    return { insights };
  },
});
