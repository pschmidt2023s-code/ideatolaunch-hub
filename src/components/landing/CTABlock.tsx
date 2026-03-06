import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface CTABlockProps {
  variant?: "default" | "download";
}

export function CTABlock({ variant = "default" }: CTABlockProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  if (variant === "download") {
    return (
      <section className="border-t px-4 sm:px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold font-display md:text-3xl mb-4">
            {isDE ? "BrandOS Desktop – jetzt herunterladen" : "BrandOS Desktop – download now"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {isDE
              ? "Offline arbeiten, schnellere Performance, native Updates. Verfügbar für Windows."
              : "Work offline, faster performance, native updates. Available for Windows."}
          </p>
          <Button
            size="lg"
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-8"
            onClick={() => navigate("/download")}
          >
            {isDE ? "Desktop App herunterladen" : "Download desktop app"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t px-4 sm:px-6 py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold font-display md:text-3xl mb-4">
          {isDE ? "Bereit, deine Marke zu starten?" : "Ready to launch your brand?"}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          {isDE
            ? "Kostenlos starten. Keine Kreditkarte. Kein Risiko. Erkenne Fehler bevor sie teuer werden."
            : "Start free. No credit card. No risk. Detect mistakes before they get expensive."}
        </p>
        <Button
          size="lg"
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-8"
          onClick={() => navigate("/auth?tab=signup")}
        >
          {isDE ? "Jetzt kostenlos starten" : "Start free now"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
