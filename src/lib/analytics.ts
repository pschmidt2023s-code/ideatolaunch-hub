/**
 * @deprecated Import from "@/lib/analytics" (barrel) instead.
 * This file re-exports everything for backward compatibility.
 */
export {
  getConsent,
  setConsent,
  resetSession,
  trackEvent,
  trackCriticalEvent,
  logError,
  withPerfTracking,
  startStepTimer,
  clearStepTimer,
  trackPageLoad,
  installGlobalErrorHandler,
  observeLongTasks,
  observeSlowResources,
} from "./analytics/index";
