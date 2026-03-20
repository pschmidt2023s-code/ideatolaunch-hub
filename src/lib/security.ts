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
  | "xss_attempt"
  | "csrf_mismatch"
  | "integrity_violation";

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

// ── Password Strength Validator (2026 NIST SP 800-63B aligned) ──
export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-4
  errors: string[];
}

const WEAK_PASSWORDS = new Set([
  "password", "12345678", "123456789", "qwertyui", "abcdefgh",
  "password1", "11111111", "iloveyou", "sunshine", "princess",
  "football", "baseball", "trustno1", "letmein1", "welcome1",
  "password123", "admin123", "qwerty123", "abc12345",
]);

export function validatePasswordStrength(password: string): PasswordValidation {
  const errors: string[] = [];
  let score = 0;

  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { isValid: false, score: 0, errors: ["Dieses Passwort ist zu häufig und unsicher"] };
  }

  if (/(.)\1{3,}/.test(password)) {
    errors.push("Keine 4+ wiederholten Zeichen");
  }

  if (password.length >= 8) score++;
  else errors.push("Mindestens 8 Zeichen");

  if (password.length >= 12) score++;
  if (password.length >= 16) score++; // Bonus for long passphrases

  if (/[A-Z]/.test(password)) score++;
  else errors.push("Mindestens ein Großbuchstabe");

  if (/[0-9]/.test(password)) score++;
  else errors.push("Mindestens eine Zahl");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else errors.push("Mindestens ein Sonderzeichen empfohlen");

  // Entropy estimation
  const uniqueChars = new Set(password).size;
  if (uniqueChars < password.length * 0.5) {
    errors.push("Mehr verschiedene Zeichen verwenden");
  }

  return {
    isValid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && !WEAK_PASSWORDS.has(password.toLowerCase()),
    score: Math.min(score, 4),
    errors,
  };
}

// ── Rate Limiter (Client-Side, sliding window) ──
const rateLimitMap = new Map<string, { timestamps: number[] }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { timestamps: [] };

  // Purge expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxAttempts) {
    logSecurityEvent("rate_limited", { key, attempts: entry.timestamps.length });
    rateLimitMap.set(key, entry);
    return false;
  }

  entry.timestamps.push(now);
  rateLimitMap.set(key, entry);
  return true;
}

// ── Brute Force Protection (exponential backoff) ──
const failedLoginMap = new Map<string, { count: number; lockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 60_000; // 1 min base, doubles each escalation

export function checkAccountLock(email: string): { locked: boolean; remainingMs: number } {
  const key = email.toLowerCase().trim();
  const entry = failedLoginMap.get(key);
  if (!entry) return { locked: false, remainingMs: 0 };

  const now = Date.now();
  if (entry.lockedUntil > now) {
    return { locked: true, remainingMs: entry.lockedUntil - now };
  }

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
    // Exponential backoff: 1min, 2min, 4min, 8min, 15min cap
    const escalation = Math.min(entry.count - MAX_FAILED_ATTEMPTS, 4);
    const lockoutMs = Math.min(BASE_LOCKOUT_MS * Math.pow(2, escalation), 15 * 60 * 1000);
    entry.lockedUntil = Date.now() + lockoutMs;
    logSecurityEvent("brute_force_detected", {
      email_hint: key.slice(0, 3) + "***",
      attempts: entry.count,
      locked_seconds: Math.round(lockoutMs / 1000),
    });
  }

  failedLoginMap.set(key, entry);
}

export function resetFailedLogins(email: string): void {
  failedLoginMap.delete(email.toLowerCase().trim());
}

// ── Session Inactivity Monitor ──
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
const INACTIVITY_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
const LAST_ACTIVITY_KEY = "bos_last_activity";

export function startInactivityMonitor(onExpire: () => void) {
  const now = Date.now();
  const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || String(now), 10);

  if (now - lastActivity > INACTIVITY_TIMEOUT) {
    logSecurityEvent("session_expired", { reason: "inactivity" });
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    onExpire();
    return () => {};
  }

  const resetTimer = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      logSecurityEvent("session_expired", { reason: "inactivity" });
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      onExpire();
    }, INACTIVITY_TIMEOUT);
  };

  const events = ["mousedown", "keydown", "scroll", "touchstart"];
  events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
  resetTimer();

  return () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    events.forEach((e) => window.removeEventListener(e, resetTimer));
  };
}

// ── Input Sanitizer (XSS Protection — DOMPurify-lite) ──
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /data\s*:\s*text\/html/gi,
  /vbscript\s*:/gi,
  /expression\s*\(/gi,
  /<iframe\b/gi,
  /<object\b/gi,
  /<embed\b/gi,
  /<form\b/gi,
  /srcdoc\s*=/gi,
];

export function sanitizeInput(input: string, maxLength: number = 500): string {
  let sanitized = input.trim().slice(0, maxLength);

  // Strip HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  for (const pattern of DANGEROUS_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex state
    if (pattern.test(sanitized)) {
      logSecurityEvent("xss_attempt", {
        input_preview: sanitized.slice(0, 50),
        pattern: pattern.source,
      });
      pattern.lastIndex = 0;
      sanitized = sanitized.replace(pattern, "");
    }
  }

  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return sanitized;
}

// ── Safe HTML text ──
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

// ── URL Validation ──
const TRUSTED_DOWNLOAD_DOMAINS = [
  "github.com",
  "raw.githubusercontent.com",
  "objects.githubusercontent.com",
];

export function isTrustedDownloadUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && TRUSTED_DOWNLOAD_DOMAINS.some((d) => parsed.hostname.endsWith(d));
  } catch {
    return false;
  }
}

// ── SHA-256 Hash for file integrity ──
export async function sha256Hash(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Subresource Integrity Helper ──
export async function computeSRI(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-384", data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return `sha384-${base64}`;
}

// ── CSRF Token (per-session nonce) ──
const CSRF_KEY = "bos_csrf_nonce";

export function getCSRFToken(): string {
  let token = sessionStorage.getItem(CSRF_KEY);
  if (!token) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    token = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem(CSRF_KEY, token);
  }
  return token;
}

export function validateCSRFToken(token: string): boolean {
  const stored = sessionStorage.getItem(CSRF_KEY);
  if (!stored || stored !== token) {
    logSecurityEvent("csrf_mismatch", { route: window.location.pathname });
    return false;
  }
  return true;
}

// ── Constant-time string comparison ──
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
