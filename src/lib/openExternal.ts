import { isAllowedExternalUrl } from "@/lib/external";

/** Detect if running inside a Tauri webview */
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Open an external URL in the system default browser (Tauri) or a new tab (web).
 * Only URLs on the domain allowlist are opened.
 * Returns true when a navigation attempt was executed.
 */
export async function openExternal(url: string): Promise<boolean> {
  if (!url) return false;

  // Ensure the URL has a protocol
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  if (!isAllowedExternalUrl(fullUrl)) {
    console.warn(`[openExternal] Blocked non-allowlisted URL: ${fullUrl}`);
    return false;
  }

  if (isTauri()) {
    try {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(fullUrl);
      return true;
    } catch (err) {
      console.error("[openExternal] Tauri opener failed, trying in-app redirect:", err);
      try {
        window.location.assign(fullUrl);
        return true;
      } catch (redirectErr) {
        console.error("[openExternal] In-app redirect failed:", redirectErr);
        return false;
      }
    }
  }

  const popup = window.open(fullUrl, "_blank", "noopener,noreferrer");
  if (popup) return true;

  // Popup can be blocked if call is no longer in direct user gesture.
  window.location.assign(fullUrl);
  return true;
}
