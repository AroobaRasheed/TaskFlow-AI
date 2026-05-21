// convex/lib/constants.ts

export const TASK_STATUSES = ["todo", "in_progress", "completed"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export const USER_ROLES = ["admin", "member", "viewer"] as const;
export const NOTIFICATION_TYPES = ["info", "warning", "success", "error"] as const;

/** Default avatar URL when user has no profile picture */
export const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/initials/svg";

/** Max chat messages returned per query */
export const CHAT_PAGE_SIZE = 50;

/** Max tasks returned per query */
export const TASKS_PAGE_SIZE = 100;
