import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Download, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface LeadMagnetPopupProps {
  trigger: "scroll" | "exit" | "tool";
  onClose: () => void;
}

export function LeadMagnetPopup({ trigger, onClose }: LeadMagnetPopupProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackEvent("feature_locked_viewed", { source: `lead_magnet_${trigger}` });
  }, [trigger]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    trackEvent("upgrade_clicked", { source: "lead_magnet", trigger, email_captured: true });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border bg-card p-8 shadow-elevated">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {!submitted ? (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Download className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              Eigenmarke Starter Blueprint 2026
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Kostenloser PDF-Guide: Die 7 Schritte zum erfolgreichen Markenstart – mit Kalkulationsvorlagen, Lieferanten-Checklisten und Launch-Timeline.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Deine E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
              <Button
                type="submit"
                className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Blueprint herunterladen <Download className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Kein Spam. Jederzeit abmeldbar. DSGVO-konform.
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Blueprint ist unterwegs!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Prüfe dein Postfach. Möchtest du jetzt direkt durchstarten?
            </p>
            <Button
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => {
                onClose();
                window.location.href = "/auth?tab=signup";
              }}
            >
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook to manage lead magnet triggers
export function useLeadMagnet() {
  const [showPopup, setShowPopup] = useState(false);
  const [trigger, setTrigger] = useState<"scroll" | "exit" | "tool">("scroll");

  useEffect(() => {
    // Already shown this session?
    if (sessionStorage.getItem("lead_magnet_shown")) return;

    // Scroll trigger at 60%
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 60 && !sessionStorage.getItem("lead_magnet_shown")) {
        sessionStorage.setItem("lead_magnet_shown", "true");
        setTrigger("scroll");
        setShowPopup(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    // Exit intent (mouse leaves viewport top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem("lead_magnet_shown")) {
        sessionStorage.setItem("lead_magnet_shown", "true");
        setTrigger("exit");
        setShowPopup(true);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    const scrollTimer = setTimeout(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 5000); // Wait 5s before activating

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const showToolPopup = () => {
    if (sessionStorage.getItem("lead_magnet_shown")) return;
    sessionStorage.setItem("lead_magnet_shown", "true");
    setTrigger("tool");
    setShowPopup(true);
  };

  return { showPopup, trigger, setShowPopup, showToolPopup };
}
