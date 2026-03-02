import { useState, useEffect, useCallback, useRef } from "react";

type SplashPhase = "loading" | "checking" | "downloading" | "installing" | "done";

interface SplashScreenProps {
  onFinished: () => void;
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<SplashPhase>("loading");
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [statusText, setStatusText] = useState("Lade App…");
  const ranRef = useRef(false);

  const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  const isProduction = !import.meta.env.DEV;

  // Phase 1: Loading animation
  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (isTauri && isProduction) {
            setPhase("checking");
          } else {
            setTimeout(onFinished, 400);
          }
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [phase, onFinished, isTauri, isProduction]);

  // Phase 2: Check for updates
  useEffect(() => {
    if (phase !== "checking" || ranRef.current) return;
    ranRef.current = true;

    setStatusText("Suche nach Updates…");

    (async () => {
      try {
        const { checkUpdateAvailable } = await import("@/update/updateService");
        const result = await checkUpdateAvailable();

        if (!result.available) {
          setStatusText("App ist aktuell ✓");
          setTimeout(onFinished, 600);
          return;
        }

        setStatusText(`Update ${result.latestVersion} gefunden – Download startet…`);
        setPhase("downloading");

        // Download
        const { downloadInstaller } = await import("@/update/updateService");
        const filePath = await downloadInstaller(result.installerUrl, (p) => {
          setDownloadPercent(p.percent);
        });

        setPhase("installing");
        setStatusText("Update wird installiert…");

        // Launch silent installer and quit
        const { Command } = await import("@tauri-apps/plugin-shell");
        const cmd = Command.create("cmd", ["/c", "start", "", filePath, "/S"]);
        await cmd.execute();

        await new Promise((r) => setTimeout(r, 1500));

        const { exit } = await import("@tauri-apps/plugin-process");
        await exit(0);
      } catch (e) {
        console.warn("[SPLASH-UPDATER] Update check/download failed:", e);
        setStatusText("App wird geladen…");
        setTimeout(onFinished, 600);
      }
    })();
  }, [phase, onFinished]);

  const phaseLabel = (() => {
    switch (phase) {
      case "loading": return `Lade… ${progress}%`;
      case "checking": return statusText;
      case "downloading": return `Download: ${downloadPercent}%`;
      case "installing": return statusText;
      default: return statusText;
    }
  })();

  const barWidth = (() => {
    switch (phase) {
      case "loading": return progress;
      case "checking": return 100;
      case "downloading": return downloadPercent;
      case "installing": return 100;
      default: return 100;
    }
  })();

  const showPulse = phase === "checking" || phase === "installing";

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="mb-8 relative">
        <div className={`relative w-32 h-32 ${showPulse ? "animate-pulse" : ""}`}>
          <img
            src="/icon.png"
            alt="Build Your Brand"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full -z-10 animate-ping" />
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-white text-4xl font-bold mb-2 tracking-wider">
        Build Your Brand
      </h1>
      <p className="text-white/80 text-lg mb-8 font-light">
        From Idea to Launch — Safe &amp; Smart
      </p>

      {/* Progress Bar */}
      <div className="w-72 h-2.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-200 ease-out ${
            phase === "downloading"
              ? "bg-green-300"
              : phase === "installing"
              ? "bg-yellow-300 animate-pulse"
              : "bg-white"
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p className="text-white/70 text-sm mt-4 text-center max-w-xs">
        {phaseLabel}
      </p>

      {phase === "downloading" && (
        <p className="text-white/40 text-xs mt-1">
          Bitte warten – App wird aktualisiert
        </p>
      )}
      {phase === "installing" && (
        <p className="text-white/40 text-xs mt-1">
          Installation läuft – App startet gleich neu
        </p>
      )}
    </div>
  );
}
