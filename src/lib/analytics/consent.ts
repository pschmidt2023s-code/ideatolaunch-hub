// ── Consent ─────────────────────────────────────────────────
const CONSENT_KEY = "analytics_consent";

export function getConsent(): boolean | null {
  const val = localStorage.getItem(CONSENT_KEY);
  if (val === "true") return true;
  if (val === "false") return false;
  return null;
}

export function setConsent(accepted: boolean) {
  localStorage.setItem(CONSENT_KEY, String(accepted));
}

export function isTrackingAllowed(): boolean {
  return getConsent() === true;
}
