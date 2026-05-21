// convex/email.ts
// Email verification system using Resend API.
// Sends a 6-digit OTP code to the user's email on signup.

import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { now } from "./lib/helpers";

// ─── Generate a 6-digit OTP ───────────────────────────────────────────────

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Send verification email via Resend ──────────────────────────────────

export const sendVerificationEmail = action({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, { email, name }) => {
    const apiKey = process.env.RESEND_API_KEY;

    // Generate OTP and store in DB
    const token = generateOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await ctx.runMutation(api.email.storeVerificationToken, {
      email,
      token,
      expiresAt,
    });

    // If no API key, return token directly for testing
    if (!apiKey) {
      console.log(`[DEV] Verification code for ${email}: ${token}`);
      return { success: true, devToken: token };
    }

    // Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TaskFlow AI <onboarding@resend.dev>",
        to: [email],
        subject: "Your TaskFlow AI verification code",
        html: buildEmailHTML(name, token),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Email send failed: ${err}`);
    }

    return { success: true };
  },
});

// ─── Store token in DB (called from action above) ─────────────────────────

export const storeVerificationToken = mutation({
  args: {
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { email, token, expiresAt }) => {
    // Delete any existing unused tokens for this email
    const existing = await ctx.db
      .query("emailVerifications")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    for (const e of existing) {
      await ctx.db.delete(e._id);
    }

    // Store new token
    await ctx.db.insert("emailVerifications", {
      email,
      token,
      expiresAt,
      used: false,
    });
  },
});

// ─── Verify OTP code ──────────────────────────────────────────────────────

export const verifyEmailToken = mutation({
  args: { email: v.string(), token: v.string() },
  handler: async (ctx, { email, token }) => {
    const record = await ctx.db
      .query("emailVerifications")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!record) {
      throw new Error("Invalid verification code. Please check and try again.");
    }
    if (record.email !== email) {
      throw new Error("This code does not match your email address.");
    }
    if (record.used) {
      throw new Error("This code has already been used. Please request a new one.");
    }
    if (record.expiresAt < Date.now()) {
      throw new Error("This code has expired. Please request a new one.");
    }

    // Mark token as used
    await ctx.db.patch(record._id, { used: true });

    // Mark user as verified in DB
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { emailVerified: true });
    }

    return { success: true };
  },
});

// ─── Check if email is verified ───────────────────────────────────────────

export const isEmailVerified = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    return user?.emailVerified ?? false;
  },
});

// ─── Beautiful HTML email template ───────────────────────────────────────

function buildEmailHTML(name: string, token: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>Verify your TaskFlow AI account</title>
</head>
<body style="margin:0;padding:0;background:#0B0B12;font-family:'Segoe UI',Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B12;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;overflow:hidden;max-width:520px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#8B5CF6,#3B82F6);padding:32px;text-align:center;">
              <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;">⚡ TaskFlow AI</div>
              <div style="font-size:13px;opacity:0.85;margin-top:4px;">AI-Powered Project Management</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;">Verify your email, ${name} 👋</h1>
              <p style="margin:0 0 28px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">
                Enter this 6-digit code in TaskFlow AI to confirm your email address and activate your account.
              </p>

              <!-- OTP Box -->
              <div style="background:rgba(139,92,246,0.15);border:2px solid rgba(139,92,246,0.4);border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
                <div style="letter-spacing:12px;font-size:40px;font-weight:900;font-family:monospace;color:#A78BFA;">${token}</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:12px;">⏱ Expires in 15 minutes</div>
              </div>

              <p style="margin:0 0 20px;color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;">
                If you didn't create a TaskFlow AI account, you can safely ignore this email.
              </p>

              <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;font-size:12px;color:rgba(255,255,255,0.3);">
                For security, never share this code with anyone. TaskFlow AI will never ask for it via chat or phone.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:rgba(0,0,0,0.3);padding:20px 32px;text-align:center;font-size:12px;color:rgba(255,255,255,0.3);">
              © 2026 TaskFlow AI · Built with Convex + Gemini
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
