import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function UpgradeBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
          <Rocket className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold">{t("upgrade.bannerTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("upgrade.bannerDesc")}</p>
        </div>
      </div>
      <Button
        size="sm"
        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => navigate("/pricing")}
      >
        {t("upgrade.cta")}
      </Button>
    </div>
  );
}
