import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface LockedOverlayProps {
  children: ReactNode;
  message?: string;
}

export function LockedOverlay({ children, message }: LockedOverlayProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-3">
          <Lock className="h-6 w-6 text-accent" />
        </div>
        <p className="text-sm font-semibold mb-1">{message || t("upgrade.locked")}</p>
        <p className="text-xs text-muted-foreground mb-3">{t("upgrade.lockedDesc")}</p>
        <Button
          size="sm"
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => navigate("/pricing")}
        >
          {t("upgrade.cta")}
        </Button>
      </div>
    </div>
  );
}
