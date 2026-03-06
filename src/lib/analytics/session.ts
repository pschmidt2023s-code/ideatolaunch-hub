// ── Session ID ──────────────────────────────────────────────
let _sessionId: string | null = null;

export function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  return _sessionId;
}

export function resetSession() {
  _sessionId = null;
}
