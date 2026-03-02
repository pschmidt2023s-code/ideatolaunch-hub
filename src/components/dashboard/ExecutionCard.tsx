import { Zap, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExecutionAction } from "@/lib/command-center-types";

const priorityStyle: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-secondary text-secondary-foreground",
};

export function ExecutionCard({ actions }: { actions: ExecutionAction[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-accent" /> Execution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((a) => (
          <div key={a.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className={priorityStyle[a.priority]} variant="secondary">
                {a.priority}
              </Badge>
              <span className="text-sm font-medium">{a.label}</span>
            </div>
            {a.blocker && (
              <div className="flex items-center gap-1.5 text-xs text-destructive ml-1">
                <AlertCircle className="h-3 w-3" />
                Blocker: {a.blocker}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
