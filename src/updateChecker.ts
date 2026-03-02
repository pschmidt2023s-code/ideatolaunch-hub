/**
 * Simple update checker – uses native Tauri dialog + browser open.
 * No custom modal, no background download.
 */

const VERSION_URL = "https://raw.githubusercontent.com/pschmidt2023s-code/ideatolaunch-hub/main/docs/version.json";

function semverCompare(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

export async function runSimpleUpdateCheck(): Promise<void> {
  try {
    const { getVersion } = await import("@tauri-apps/api/app");
    const currentVersion = await getVersion();

    const res = await fetch(VERSION_URL, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();

    if (!data?.version || semverCompare(currentVersion, data.version) >= 0) return;

    const { ask } = await import("@tauri-apps/plugin-dialog");
    const confirmed = await ask(
      `Neue Version verfügbar: ${data.version}\n\nJetzt herunterladen?`,
      {
        title: "BrandOS Update",
        kind: "info",
        okLabel: "Download",
        cancelLabel: "Später",
      }
    );

    if (confirmed && data.windows) {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(data.windows);
    }
  } catch (e) {
    console.warn("[UPDATER] check failed:", e);
  }
}
