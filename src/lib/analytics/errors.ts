import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "./session";

// ── Error logging ───────────────────────────────────────────
type ErrorType = "frontend" | "api" | "validation" | "performance";

export async function logError(
  message: string,
  opts: {
    stack?: string;
    route?: string;
    errorType?: ErrorType;
    metadata?: Record<string, unknown>;
  } = {}
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("error_logs").insert([
      {
        user_id: user?.id ?? null,
        message,
        stack: opts.stack ?? null,
        route: opts.route ?? window.location.pathname,
        error_type: opts.errorType ?? "frontend",
        metadata: (opts.metadata ?? {}) as any,
        session_id: getSessionId(),
      },
    ]);
  } catch {
    // Silent fail
  }
}
