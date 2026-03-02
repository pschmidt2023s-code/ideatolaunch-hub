/**
 * Fully automatic updater – no UI, no user interaction.
 * Checks version.json → downloads installer silently → runs silent install → quits app.
 */

import { checkUpdateAvailable, downloadInstaller, type UpdateCheckResult } from "./updateService";

/** Run a fully automatic update cycle. Returns true if an update was started. */
export async function runAutoUpdate(): Promise<boolean> {
  let result: UpdateCheckResult;

  try {
    result = await checkUpdateAvailable();
  } catch (e) {
    console.warn("[AUTO-UPDATER] Version check failed:", e);
    return false;
  }

  if (!result.available) {
    console.info("[AUTO-UPDATER] Already up to date:", result.currentVersion);
    return false;
  }

  console.info(
    `[AUTO-UPDATER] Update available: ${result.currentVersion} → ${result.latestVersion}`
  );

  // Download silently (no progress UI)
  let filePath: string;
  try {
    filePath = await downloadInstaller(result.installerUrl, (p) => {
      console.info(`[AUTO-UPDATER] Download: ${p.percent}%`);
    });
  } catch (e) {
    console.error("[AUTO-UPDATER] Download failed:", e);
    return false;
  }

  console.info("[AUTO-UPDATER] Download complete, launching silent install…");

  // Run installer silently (/S flag for NSIS) and quit
  try {
    await runSilentInstallerAndQuit(filePath);
  } catch (e) {
    console.error("[AUTO-UPDATER] Silent install failed:", e);
    return false;
  }

  return true;
}

/** Launch the NSIS installer in silent mode and quit the app */
async function runSilentInstallerAndQuit(filePath: string): Promise<void> {
  const { Command } = await import("@tauri-apps/plugin-shell");

  // /S = NSIS silent install flag
  const cmd = Command.create("cmd", ["/c", "start", "", filePath, "/S"]);
  await cmd.spawn();

  // Give the OS a moment to launch the process, then quit
  await new Promise((r) => setTimeout(r, 1000));

  const { exit } = await import("@tauri-apps/plugin-process");
  await exit(0);
}
