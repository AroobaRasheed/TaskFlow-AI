// convex/lib/gemini.ts
// Gemini AI client – single place to call the Google Generative Language API.

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/** Raw call to Gemini. Returns the text of the first candidate. */
export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables.");

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text) throw new Error("Gemini returned an empty response.");
  return text.trim();
}

// ─── Typed prompt helpers ─────────────────────────────────────────────────

export interface TaskAnalysis {
  priority: "low" | "medium" | "high";
  estimatedHours: number;
  riskLevel: "low" | "medium" | "high";
  workflowSuggestions: string[];
  productivityAdvice: string;
}

/**
 * Analyze a task and return structured AI suggestions.
 */
export async function analyzeTaskWithAI(params: {
  title: string;
  description: string;
  deadline?: string;
  teamSize?: number;
}): Promise<TaskAnalysis> {
  const prompt = `
You are an expert project management AI. Analyze this task and respond ONLY with valid JSON.

Task Title: ${params.title}
Description: ${params.description}
Deadline: ${params.deadline ?? "not specified"}
Team Size: ${params.teamSize ?? 1}

Return exactly this JSON shape (no markdown, no extra text):
{
  "priority": "low" | "medium" | "high",
  "estimatedHours": <number>,
  "riskLevel": "low" | "medium" | "high",
  "workflowSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "productivityAdvice": "<one sentence advice>"
}
`.trim();

  const raw = await callGemini(prompt);

  // Strip possible markdown fences
  const clean = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean) as TaskAnalysis;
  } catch {
    // Fallback sensible defaults if parsing fails
    return {
      priority: "medium",
      estimatedHours: 4,
      riskLevel: "medium",
      workflowSuggestions: [
        "Break the task into smaller subtasks.",
        "Schedule daily check-ins.",
        "Define clear acceptance criteria.",
      ],
      productivityAdvice:
        "Focus on high-impact activities first to maximize output.",
    };
  }
}

/**
 * Generate a chat reply from the AI assistant.
 */
export async function chatWithAI(userMessage: string): Promise<string> {
  const prompt = `
You are TaskFlow AI – a friendly, concise productivity assistant for project management teams.
Answer the following question with practical, actionable advice in 2-4 sentences.

User: ${userMessage}
`.trim();

  return callGemini(prompt);
}

/**
 * Generate team productivity insights.
 */
export async function generateProductivityInsights(stats: {
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  productivityScore: number;
}): Promise<string> {
  const prompt = `
You are a productivity coach AI. Based on the team stats below, give 3 short, actionable insights.
Format as a plain numbered list (1. 2. 3.) with no extra text.

Stats:
- Completed Tasks: ${stats.completedTasks}
- Pending Tasks: ${stats.pendingTasks}
- Overdue Tasks: ${stats.overdueTasks}
- Productivity Score: ${stats.productivityScore}/100
`.trim();

  return callGemini(prompt);
}
