/**
 * Lightweight browser fingerprint for session binding.
 * NOT a tracking fingerprint – used solely to detect new/unknown devices on login.
 */

export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // Screen
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform
  components.push(navigator.platform || "unknown");

  // Hardware concurrency
  components.push(String(navigator.hardwareConcurrency || 0));

  // Touch support
  components.push(String(navigator.maxTouchPoints || 0));

  // Canvas fingerprint (minimal)
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("BrandOS fp", 2, 15);
      components.push(canvas.toDataURL().slice(-50));
    }
  } catch {
    components.push("no-canvas");
  }

  // WebGL renderer
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        components.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "");
      }
    }
  } catch {
    components.push("no-webgl");
  }

  // Hash all components
  const raw = components.join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/** Store fingerprint in localStorage for comparison */
export function getStoredFingerprint(): string | null {
  return localStorage.getItem("_device_fp");
}

export function storeFingerprint(fp: string): void {
  localStorage.setItem("_device_fp", fp);
}

/** Check if this is a known device */
export async function isKnownDevice(): Promise<{ known: boolean; fingerprint: string }> {
  const current = await generateDeviceFingerprint();
  const stored = getStoredFingerprint();
  return { known: stored === current, fingerprint: current };
}
