/**
 * Analytics barrel export.
 * Re-exports from focused sub-modules for backward compatibility.
 */
export { getConsent, setConsent } from "./consent";
export { resetSession } from "./session";
export { trackEvent, trackCriticalEvent } from "./events";
export type { EventName } from "./events";
export { logError } from "./errors";
export {
  withPerfTracking,
  startStepTimer,
  clearStepTimer,
  trackPageLoad,
  installGlobalErrorHandler,
  observeLongTasks,
  observeSlowResources,
} from "./performance";
