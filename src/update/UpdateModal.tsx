import { useState, useCallback } from "react";
import type { UpdateCheckResult, UpdateProgress } from "./updateService";

export type UpdateState =
  | "available"
  | "downloading"
  | "launching"
  | "done"
  | "error";

interface UpdateModalProps {
  info: UpdateCheckResult;
  onDismiss: () => void;
}

export function UpdateModal({ info, onDismiss }: UpdateModalProps) {
  const [state, setState] = useState<UpdateState>("available");
  const [progress, setProgress] = useState<UpdateProgress>({
    downloaded: 0,
    total: 0,
    percent: 0,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdate = useCallback(async () => {
    try {
      setState("downloading");
      const { downloadInstaller, runInstallerAndQuit } = await import(
        "./updateService"
      );

      const filePath = await downloadInstaller(info.installerUrl, (p) => {
        setProgress(p);
      });

      setState("launching");

      // Brief pause so user sees the final message
      await new Promise((r) => setTimeout(r, 1200));

      await runInstallerAndQuit(filePath);
      setState("done");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }, [info.installerUrl]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4">
          <h2 className="text-lg font-bold text-primary-foreground tracking-tight">
            BrandOS Update
          </h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Available state */}
          {state === "available" && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Aktuelle Version
                </span>
                <span className="font-mono font-medium text-foreground">
                  v{info.currentVersion}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Neue Version</span>
                <span className="font-mono font-semibold text-accent">
                  v{info.latestVersion}
                </span>
              </div>

              {info.notes && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Changelog
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {info.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onDismiss}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Später
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Jetzt updaten
                </button>
              </div>
            </>
          )}

          {/* Downloading state */}
          {state === "downloading" && (
            <div className="space-y-3">
              <p className="text-sm text-foreground font-medium">
                Update wird heruntergeladen…
              </p>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress.percent}%</span>
                <span>
                  {formatBytes(progress.downloaded)}
                  {progress.total > 0 && ` / ${formatBytes(progress.total)}`}
                </span>
              </div>
            </div>
          )}

          {/* Launching state */}
          {(state === "launching" || state === "done") && (
            <div className="space-y-3 text-center py-2">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-foreground font-medium">
                Update wird jetzt installiert.
              </p>
              <p className="text-xs text-muted-foreground">
                BrandOS wird geschlossen. Danach bitte die neue Version starten.
              </p>
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <div className="space-y-3">
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                Update fehlgeschlagen: {errorMsg}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onDismiss}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Schließen
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
