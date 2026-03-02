// ── Beta Client System ──────────────────────────────────────

export type ClientMode = "production" | "beta";

const MODE_KEY = "brandos_client_mode";

export function getClientMode(): ClientMode {
  if (typeof window === "undefined") return "production";
  const stored = localStorage.getItem(MODE_KEY);
  if (stored === "beta") return "beta";
  return "production";
}

export function setClientMode(mode: ClientMode) {
  localStorage.setItem(MODE_KEY, mode);
}

export function isBetaMode(): boolean {
  return getClientMode() === "beta";
}

// ── Anonymous Usage Tracking ────────────────────────────────

const SESSION_KEY = "brandos_beta_session";

interface BetaSession {
  id: string;
  startedAt: number;
  routes: string[];
  clicks: number;
}

function getSession(): BetaSession {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const session: BetaSession = {
    id: `bs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt: Date.now(),
    routes: [],
    clicks: 0,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function saveSession(session: BetaSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function trackBetaRoute(route: string) {
  if (!isBetaMode()) return;
  const session = getSession();
  if (session.routes[session.routes.length - 1] !== route) {
    session.routes.push(route);
    saveSession(session);
  }
}

export function trackBetaClick() {
  if (!isBetaMode()) return;
  const session = getSession();
  session.clicks++;
  saveSession(session);
}

export function getBetaSessionStats() {
  const session = getSession();
  return {
    sessionId: session.id,
    durationMinutes: Math.round((Date.now() - session.startedAt) / 60000),
    routeCount: session.routes.length,
    uniqueRoutes: [...new Set(session.routes)].length,
    clicks: session.clicks,
  };
}

// ── Beta Feature Gating ─────────────────────────────────────

const BETA_FEATURES = new Set([
  "capitalPressure",
  "advancedSimulation",
  "marketIntelligence",
]);

export function isBetaFeature(key: string): boolean {
  return BETA_FEATURES.has(key);
}

export function canAccessBetaFeature(key: string): boolean {
  if (!isBetaFeature(key)) return true;
  return isBetaMode();
}

// ── Feedback Storage ────────────────────────────────────────

export interface BetaFeedback {
  id: string;
  category: "bug" | "feature" | "ux" | "other";
  message: string;
  route: string;
  timestamp: number;
}

const FEEDBACK_KEY = "brandos_beta_feedback";

export function saveBetaFeedback(feedback: Omit<BetaFeedback, "id" | "timestamp">) {
  const entries = getBetaFeedback();
  entries.push({
    ...feedback,
    id: `fb-${Date.now()}`,
    timestamp: Date.now(),
  });
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries));
}

export function getBetaFeedback(): BetaFeedback[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
