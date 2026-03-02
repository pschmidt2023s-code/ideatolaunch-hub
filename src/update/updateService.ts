/**
 * Website-based update service for Tauri desktop app.
 * Fetches version.json, compares versions, downloads installer, launches it.
 */

export interface VersionJson {
  version: string;
  notes: string;
  windows: string;
}

export interface UpdateCheckResult {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  notes: string;
  installerUrl: string;
}

export type UpdateProgress = {
  downloaded: number;
  total: number;
  percent: number;
};

const VERSION_URL = "https://raw.githubusercontent.com/pschmidt2023s-code/ideatolaunch-hub/main/docs/version.json";

/** Compare two semver strings. Returns -1 if a<b, 0 if equal, 1 if a>b */
export function semverCompare(a: string, b: string): number {
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

async function fetchVersionJson(): Promise<VersionJson> {
  const res = await fetch(VERSION_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function checkUpdateAvailable(): Promise<UpdateCheckResult> {
  const { getVersion } = await import("@tauri-apps/api/app");
  const currentVersion = await getVersion();
  const data = await fetchVersionJson();

  return {
    available: semverCompare(currentVersion, data.version) < 0,
    currentVersion,
    latestVersion: data.version,
    notes: data.notes,
    installerUrl: data.windows,
  };
}

/**
 * Downloads the installer to the Downloads directory.
 * Reports progress via callback.
 * Returns the full file path string.
 */
export async function downloadInstaller(
  url: string,
  onProgress: (p: UpdateProgress) => void
): Promise<string> {
  const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  const { downloadDir } = await import("@tauri-apps/api/path");
  const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");

  const filename = url.split("/").pop() || "BrandOS-setup.exe";
  const dirPath = await downloadDir();
  const fullPath = `${dirPath}${filename}`;

  // Use Tauri's native HTTP client to bypass CORS
  const res = await tauriFetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);

  const buffer = await res.arrayBuffer();
  const data = new Uint8Array(buffer);

  onProgress({ downloaded: data.byteLength, total: data.byteLength, percent: 100 });

  await writeFile(filename, data, { baseDir: BaseDirectory.Download });

  return fullPath;
}

/** Launch the downloaded installer and quit the app */
export async function runInstallerAndQuit(filePath: string): Promise<void> {
  const { Command } = await import("@tauri-apps/plugin-shell");

  // On Windows, use cmd /c start to launch the installer detached
  const cmd = Command.create("cmd", ["/c", "start", "", filePath]);
  await cmd.spawn();

  // Give the OS a moment to launch the process, then quit
  await new Promise((r) => setTimeout(r, 800));

  const { exit } = await import("@tauri-apps/plugin-process");
  await exit(0);
}
