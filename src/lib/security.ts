import { supabase } from "@/integrations/supabase/client";

// ── Security Event Types ──
type SecurityEventType =
  | "failed_login"
  | "admin_access"
  | "rate_limited"
  | "suspicious_activity"
  | "password_weak"
  | "session_expired";

// ── Security Event Logger ──
export async function logSecurityEvent(
  eventType: SecurityEventType,
  metadata: Record<string, unknown> = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("security_events" as any).insert({
      event_type: eventType,
      user_id: user?.id ?? null,
      route: window.location.pathname,
      metadata,
    });
  } catch {
    // Silent fail — security logging must never break the app
  }
}

// ── Password Strength Validator ──
export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-4
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidation {
  const errors: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else errors.push("Mindestens 8 Zeichen");

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password)) score++;
  else errors.push("Mindestens ein Großbuchstabe");

  if (/[0-9]/.test(password)) score++;
  else errors.push("Mindestens eine Zahl");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else errors.push("Mindestens ein Sonderzeichen");

  return {
    isValid: password.length >= 8 && score >= 3,
    score: Math.min(score, 4),
    errors,
  };
}

// ── Rate Limiter (Client-Side) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= maxAttempts) {
    logSecurityEvent("rate_limited", { key, attempts: entry.count });
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}

// ── Session Inactivity Monitor ──
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function startInactivityMonitor(onExpire: () => void) {
  const resetTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      logSecurityEvent("session_expired", { reason: "inactivity" });
      onExpire();
    }, INACTIVITY_TIMEOUT);
  };

  const events = ["mousedown", "keydown", "scroll", "touchstart"];
  events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
  resetTimer();

  return () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    events.forEach(e => window.removeEventListener(e, resetTimer));
  };
}

// ── Input Sanitizer ──
export function sanitizeInput(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ""); // Strip basic HTML tags
}
