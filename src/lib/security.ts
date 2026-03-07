import { supabase } from "@/integrations/supabase/client";

// ── Security Event Types ──
type SecurityEventType =
  | "failed_login"
  | "admin_access"
  | "rate_limited"
  | "suspicious_activity"
  | "password_weak"
  | "session_expired"
  | "account_locked"
  | "password_changed"
  | "brute_force_detected"
  | "xss_attempt";

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
      route: window.location.hash.replace("#", "") || window.location.pathname,
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

// Common weak passwords to reject
const WEAK_PASSWORDS = new Set([
  "password", "12345678", "123456789", "qwertyui", "abcdefgh",
  "password1", "11111111", "iloveyou", "sunshine", "princess",
  "football", "baseball", "trustno1", "letmein1", "welcome1",
]);

export function validatePasswordStrength(password: string): PasswordValidation {
  const errors: string[] = [];
  let score = 0;

  // Check against common weak passwords
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { isValid: false, score: 0, errors: ["Dieses Passwort ist zu häufig und unsicher"] };
  }

  // Check for sequential/repeated characters
  if (/(.)\1{3,}/.test(password)) {
    errors.push("Keine 4+ wiederholten Zeichen");
  }

  if (password.length >= 8) score++;
  else errors.push("Mindestens 8 Zeichen");

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password)) score++;
  else errors.push("Mindestens ein Großbuchstabe");

  if (/[0-9]/.test(password)) score++;
  else errors.push("Mindestens eine Zahl");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else errors.push("Mindestens ein Sonderzeichen empfohlen");

  return {
    isValid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && !WEAK_PASSWORDS.has(password.toLowerCase()),
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
    return true;
  }

  if (entry.count >= maxAttempts) {
    logSecurityEvent("rate_limited", { key, attempts: entry.count });
    return false;
  }

  entry.count++;
  return true;
}

// ── Brute Force Protection ──
const failedLoginMap = new Map<string, { count: number; lockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function checkAccountLock(email: string): { locked: boolean; remainingMs: number } {
  const key = email.toLowerCase().trim();
  const entry = failedLoginMap.get(key);
  if (!entry) return { locked: false, remainingMs: 0 };

  const now = Date.now();
  if (entry.lockedUntil > now) {
    return { locked: true, remainingMs: entry.lockedUntil - now };
  }

  // Lock expired, reset
  if (entry.lockedUntil > 0) {
    failedLoginMap.delete(key);
  }
  return { locked: false, remainingMs: 0 };
}

export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase().trim();
  const entry = failedLoginMap.get(key) || { count: 0, lockedUntil: 0 };
  entry.count++;

  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION;
    logSecurityEvent("brute_force_detected", {
      email_hint: key.slice(0, 3) + "***",
      attempts: entry.count,
      locked_minutes: 15,
    });
  }

  failedLoginMap.set(key, entry);
}

export function resetFailedLogins(email: string): void {
  failedLoginMap.delete(email.toLowerCase().trim());
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

// ── Input Sanitizer (XSS Protection) ──
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /data\s*:\s*text\/html/gi,
  /vbscript\s*:/gi,
  /expression\s*\(/gi,
];

export function sanitizeInput(input: string, maxLength: number = 500): string {
  let sanitized = input.trim().slice(0, maxLength);

  // Strip HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Check for XSS patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      logSecurityEvent("xss_attempt", {
        input_preview: sanitized.slice(0, 50),
        pattern: pattern.source,
      });
      sanitized = sanitized.replace(pattern, "");
    }
  }

  // Encode remaining dangerous characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return sanitized;
}

// ── Safe HTML text (for display, not for dangerouslySetInnerHTML) ──
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ── Email Validation ──
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim()) && email.length <= 255;
}

// ── URL Validation (for downloads/updates) ──
const TRUSTED_DOWNLOAD_DOMAINS = [
  "github.com",
  "raw.githubusercontent.com",
  "objects.githubusercontent.com",
];

export function isTrustedDownloadUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && TRUSTED_DOWNLOAD_DOMAINS.some(d => parsed.hostname.endsWith(d));
  } catch {
    return false;
  }
}

// ── SHA-256 Hash for file integrity ──
export async function sha256Hash(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
