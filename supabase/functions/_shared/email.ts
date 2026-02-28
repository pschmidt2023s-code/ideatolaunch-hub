// ─── Resend email sender for edge functions ──────────────────────────
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const RESEND_API_URL = "https://api.resend.com/emails";

// TODO: Replace YOURDOMAIN with your verified Resend domain
const FROM_EMAIL = "BuildYourBrand <no-reply@aldenairperfumes.de>";
const REPLY_TO = "support@aldenairperfumes.de";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends an email via Resend. Returns true on success, false on failure.
 * Never throws – failures are logged and optionally written to error_logs.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY not configured – skipping");
    return false;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        reply_to: REPLY_TO,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend API error [${res.status}]: ${body}`);
      await logEmailError(params.to, params.subject, `Resend ${res.status}: ${body}`);
      return false;
    }

    const data = await res.json();
    console.log(`[email] Sent "${params.subject}" to ${params.to} (id: ${data.id})`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[email] Send failed:", msg);
    await logEmailError(params.to, params.subject, msg);
    return false;
  }
}

/**
 * Best-effort write to error_logs table. Silent on failure.
 */
async function logEmailError(to: string, subject: string, message: string): Promise<void> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;

    const sb = createClient(url, key);
    await sb.from("error_logs").insert({
      error_type: "email",
      message: `Failed to send "${subject}" to ${to}`,
      metadata: { to, subject, error: message },
    });
  } catch {
    // silently ignore logging failures
  }
}

// Re-export templates for convenience
export { paymentSuccessEmail, upgradeEmail, cancellationEmail, blueprintEmail } from "./email-templates.ts";
export type { Locale } from "./email-layout.ts";
