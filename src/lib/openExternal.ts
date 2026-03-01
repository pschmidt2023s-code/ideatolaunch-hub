import { isAllowedExternalUrl } from "@/lib/external";

/** Detect if running inside a Tauri webview */
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Open an external URL in the system default browser (Tauri) or a new tab (web).
 * Only URLs on the domain allowlist are opened.
 */
export async function openExternal(url: string): Promise<void> {
  if (!url) return;

  // Ensure the URL has a protocol
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  if (!isAllowedExternalUrl(fullUrl)) {
    console.warn(`[openExternal] Blocked non-allowlisted URL: ${fullUrl}`);
    return;
  }

  if (isTauri()) {
    try {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(fullUrl);
    } catch (err) {
      console.error("[openExternal] Tauri opener failed, falling back:", err);
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  } else {
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  }
}
