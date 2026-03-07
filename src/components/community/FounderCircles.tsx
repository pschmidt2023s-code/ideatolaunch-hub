import { useCommunityCircles } from "@/hooks/useCommunity";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Users } from "lucide-react";

const CIRCLE_ICONS: Record<string, string> = {
  dtc: "🎯",
  ai: "🤖",
  crypto: "₿",
  brand: "🏷️",
};

const DEFAULT_CIRCLES = [
  { name: "DTC Founders", description: "Direct-to-Consumer Strategien und Insights", icon: "dtc", member_count: 0 },
  { name: "AI Builders", description: "KI-gestützte Produkte und Automatisierung", icon: "ai", member_count: 0 },
  { name: "Crypto Founders", description: "Web3, DeFi und Token-basierte Modelle", icon: "crypto", member_count: 0 },
  { name: "Brand Operators", description: "Skalierung und Operations für Marken", icon: "brand", member_count: 0 },
];

export function FounderCircles() {
  const { data: circles } = useCommunityCircles();

  const displayCircles = circles?.length ? circles : DEFAULT_CIRCLES;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Private Gruppen · Nur auf Einladung</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {displayCircles.map((circle, i) => (
          <Card key={circle.name + i} className="border-border/60 hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{CIRCLE_ICONS[(circle as any).icon] || "🔒"}</span>
                <div>
                  <h4 className="font-semibold text-sm group-hover:text-accent transition-colors">{circle.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{circle.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Users className="h-3 w-3" />
                  Invite Only
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
