import { useState, useEffect } from "react";
import { getConsent, setConsent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

export function CookieConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if consent hasn't been given or denied yet
    if (getConsent() === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent(false);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm p-4 shadow-lg animate-fade-in">
      <div className="container mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between max-w-4xl">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("consent.text")}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline} className="gap-1.5">
            <X className="h-3 w-3" />
            {t("consent.decline")}
          </Button>
          <Button size="sm" onClick={handleAccept} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {t("consent.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
