/**
 * Shared Edge Function utilities for BrandOS
 * Provides consistent CORS, auth, error handling and response helpers.
 */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export function jsonResponse(body: Record<string, unknown>, status = 200, cacheSeconds = 0) {
  const headers: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };
  if (cacheSeconds > 0) {
    headers["Cache-Control"] = `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`;
  } else {
    headers["Cache-Control"] = "no-store";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export function corsResponse() {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Standard error handler for AI gateway responses.
 * Returns appropriate HTTP status + user-facing German message.
 */
export function handleAIError(response: Response, label: string) {
  if (response.status === 429) {
    return jsonResponse({ error: "Rate Limit erreicht. Bitte versuche es in einer Minute erneut." }, 429);
  }
  if (response.status === 402) {
    return jsonResponse({ error: "AI-Credits aufgebraucht. Bitte Credits im Workspace aufladen." }, 402);
  }
  console.error(`[${label}] AI gateway error: ${response.status}`);
  return jsonResponse({ error: "AI-Dienst vorübergehend nicht verfügbar." }, 502);
}

/**
 * Safe JSON parse with fallback.
 */
export function safeJsonParse<T = unknown>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Extract tool call arguments from AI response.
 */
export function extractToolArgs<T = Record<string, unknown>>(aiData: any): T | null {
  const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) return null;
  return safeJsonParse<T>(toolCall.function.arguments);
}

/**
 * Sanitize a string input with max length.
 */
export function sanitize(value: unknown, maxLength = 500, fallback = "Nicht angegeben"): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed || fallback;
}

/**
 * Wrap an async handler with timeout protection.
 * Returns 504 if the handler exceeds the given timeout.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 25000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Function timeout")), timeoutMs)
    ),
  ]);
}
