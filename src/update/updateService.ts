/**
 * Website-based update service for Tauri desktop app.
 * Fetches version.json, compares versions, downloads installer with integrity checks.
 */

import { isTrustedDownloadUrl, sha256Hash } from "@/lib/security";

export interface VersionJson {
  version: string;
  notes: string;
  windows: string;
  sha256?: string; // Optional SHA-256 hash for integrity verification
}

export interface UpdateCheckResult {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  notes: string;
  installerUrl: string;
  expectedHash?: string;
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
  const data = await res.json();

  // Validate required fields
  if (!data.version || typeof data.version !== "string") throw new Error("Invalid version.json: missing version");
  if (!data.windows || typeof data.windows !== "string") throw new Error("Invalid version.json: missing windows URL");

  return data;
}

export async function checkUpdateAvailable(): Promise<UpdateCheckResult> {
  const { getVersion } = await import("@tauri-apps/api/app");
  const currentVersion = await getVersion();
  const data = await fetchVersionJson();

  // Verify download URL is from a trusted source
  if (!isTrustedDownloadUrl(data.windows)) {
    console.error("[UPDATE] Untrusted download URL rejected:", data.windows);
    throw new Error("Update URL is not from a trusted source");
  }

  return {
    available: semverCompare(currentVersion, data.version) < 0,
    currentVersion,
    latestVersion: data.version,
    notes: data.notes,
    installerUrl: data.windows,
    expectedHash: data.sha256,
  };
}

/**
 * Downloads the installer to the Downloads directory.
 * Reports progress via callback.
 * Verifies integrity if hash is provided.
 * Returns the full file path string.
 */
export async function downloadInstaller(
  url: string,
  onProgress: (p: UpdateProgress) => void,
  expectedHash?: string
): Promise<string> {
  // Security: Verify URL is trusted before downloading
  if (!isTrustedDownloadUrl(url)) {
    throw new Error("Download rejected: untrusted URL");
  }

  const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  const { downloadDir } = await import("@tauri-apps/api/path");
  const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");

  const filename = url.split("/").pop() || "BrandOS-setup.exe";

  // Validate filename doesn't contain path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    throw new Error("Invalid filename detected");
  }

  const dirPath = await downloadDir();
  const separator = dirPath.includes("\\") ? "\\" : "/";
  const fullPath = `${dirPath}${dirPath.endsWith("\\") || dirPath.endsWith("/") ? "" : separator}${filename}`;

  // Use Tauri's native HTTP client to bypass CORS
  const res = await tauriFetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);

  const buffer = await res.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Verify file integrity if hash is provided
  if (expectedHash) {
    const actualHash = await sha256Hash(buffer);
    if (actualHash !== expectedHash.toLowerCase()) {
      console.error(`[UPDATE] Hash mismatch! Expected: ${expectedHash}, Got: ${actualHash}`);
      throw new Error("File integrity check failed – download may be corrupted or tampered with");
    }
    console.info("[UPDATE] ✓ File integrity verified (SHA-256)");
  }

  // Validate minimum file size (installer should be > 1MB)
  if (data.byteLength < 1_000_000) {
    throw new Error("Downloaded file is suspiciously small – aborting");
  }

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
