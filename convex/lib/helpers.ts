// convex/lib/helpers.ts
// Utility functions shared across Convex modules.

/** Returns the current unix timestamp in milliseconds */
export const now = () => Date.now();

/** ISO week label like "2024-W22" for analytics bucketing */
export function currentWeekLabel(): string {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((d.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7
  );
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Simple productivity score: (completed / total) * 100 clamped 0-100 */
export function calcProductivityScore(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

/** Returns true if a deadline timestamp has passed */
export function isOverdue(deadline?: number): boolean {
  if (!deadline) return false;
  return deadline < Date.now();
}

/** Safely stringify any value for storage */
export function safeStringify(val: unknown): string {
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/** Safely parse a JSON string, returning null on failure */
export function safeParse<T = unknown>(str?: string): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}
