/**
 * Website-based update checker for Tauri desktop app.
 * Fetches version.json from the website and prompts user if a newer version exists.
 */

interface VersionInfo {
  version: string;
  notes: string;
  windows: string;
}

function compareVersions(current: string, latest: string): number {
  const a = current.split(".").map(Number);
  const b = latest.split(".").map(Number);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

export async function checkForUpdate(): Promise<void> {
  try {
    const { getVersion } = await import("@tauri-apps/api/app");
    const currentVersion = await getVersion();

    const res = await fetch("https://MYDOMAIN.de/version.json", {
      cache: "no-store",
    });

    if (!res.ok) return;

    const data: VersionInfo = await res.json();

    if (compareVersions(currentVersion, data.version) >= 0) return;

    const { ask } = await import("@tauri-apps/plugin-dialog");
    const confirmed = await ask(
      `Neue Version verfügbar: ${data.version}\n\n${data.notes}\n\nJetzt herunterladen?`,
      {
        title: "BrandOS Update",
        kind: "info",
        okLabel: "Download",
        cancelLabel: "Später",
      }
    );

    if (!confirmed || !data.windows) return;

    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(data.windows);
  } catch {
    // Silently fail – never crash the app for an update check
  }
}
