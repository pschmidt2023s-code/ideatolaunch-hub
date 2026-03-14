import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Bug, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChangelogEntry {
  version: string;
  date: string;
  items: { type: "feature" | "fix" | "improvement" | "security"; text: string }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "4.0",
    date: "2026-03-14",
    items: [
      { type: "feature", text: "Website Builder mit Live-Editor & KI-Wünschen" },
      { type: "feature", text: "Export Center für alle Datenexporte" },
      { type: "feature", text: "Gamification: XP & Badges für Fortschritte" },
      { type: "improvement", text: "Keyboard Shortcuts (⌘K, ⌘1-5)" },
      { type: "improvement", text: "Smart Tooltips für Business-Begriffe" },
      { type: "improvement", text: "Dark Mode Feinschliff" },
      { type: "fix", text: "Performance-Optimierungen & Lazy Loading" },
    ],
  },
  {
    version: "3.0",
    date: "2026-03-07",
    items: [
      { type: "feature", text: "Capital Intelligence Release" },
      { type: "feature", text: "Adaptive Workflow Engine" },
      { type: "feature", text: "CEO Briefing Emails" },
      { type: "improvement", text: "Dashboard Redesign (Bloomberg Terminal Aesthetic)" },
      { type: "security", text: "Session Management verbessert" },
    ],
  },
  {
    version: "2.0",
    date: "2026-02-28",
    items: [
      { type: "feature", text: "Community Hub mit Founder Circles" },
      { type: "feature", text: "Competitor Tracker" },
      { type: "feature", text: "Multi-Mode System (Founder, Trading, Investor, Strategy)" },
      { type: "improvement", text: "Mobile Navigation optimiert" },
    ],
  },
];

const TYPE_CONFIG = {
  feature: { icon: Sparkles, label: "Neu", className: "bg-accent/10 text-accent border-accent/20" },
  fix: { icon: Bug, label: "Fix", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  improvement: { icon: Zap, label: "Verbessert", className: "bg-info/10 text-info border-info/20" },
  security: { icon: Shield, label: "Sicherheit", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const CHANGELOG_VERSION_KEY = "changelog_seen_version";

export function useChangelog() {
  const [open, setOpen] = useState(false);
  const latestVersion = CHANGELOG[0]?.version;

  useEffect(() => {
    const seen = localStorage.getItem(CHANGELOG_VERSION_KEY);
    if (seen !== latestVersion) {
      // Show after a small delay so dashboard loads first
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [latestVersion]);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem(CHANGELOG_VERSION_KEY, latestVersion);
  };

  return { open, setOpen: (v: boolean) => v ? setOpen(true) : dismiss(), latestVersion, hasNew: localStorage.getItem(CHANGELOG_VERSION_KEY) !== latestVersion };
}

export function ChangelogDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) localStorage.setItem(CHANGELOG_VERSION_KEY, CHANGELOG[0]?.version);
      onOpenChange(v);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Was ist neu?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {CHANGELOG.map((entry) => (
            <div key={entry.version} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  v{entry.version}
                </Badge>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <div className="space-y-1.5">
                {entry.items.map((item, i) => {
                  const config = TYPE_CONFIG[item.type];
                  return (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 shrink-0 mt-0.5", config.className)}>
                        {config.label}
                      </Badge>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
