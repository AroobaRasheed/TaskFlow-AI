// convex/http.ts
// HTTP action endpoints (webhooks, health check, etc.)

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// ─── Health check ─────────────────────────────────────────────────────────

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "ok", app: "TaskFlow AI", timestamp: Date.now() }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

// ─── CORS preflight for API routes ────────────────────────────────────────

http.route({
  path: "/health",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }),
});

export default http;
