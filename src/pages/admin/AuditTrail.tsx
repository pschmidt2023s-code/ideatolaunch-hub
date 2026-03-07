import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Shield, Clock, User, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  admin_id: string;
  action_type: string;
  affected_user_id: string | null;
  details: any;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  user_upgrade: "bg-success/10 text-success",
  user_downgrade: "bg-warning/10 text-warning",
  user_ban: "bg-destructive/10 text-destructive",
  license_create: "bg-accent/10 text-accent",
  license_revoke: "bg-destructive/10 text-destructive",
  discount_create: "bg-primary/10 text-primary",
  feature_flag_toggle: "bg-blue-500/10 text-blue-500",
  default: "bg-muted text-muted-foreground",
};

export default function AuditTrail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setEntries((data as AuditEntry[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const actionTypes = [...new Set(entries.map((e) => e.action_type))];

  const filtered = entries.filter((e) => {
    if (filterType && e.action_type !== filterType) return false;
    if (search && !e.action_type.toLowerCase().includes(search.toLowerCase()) && !JSON.stringify(e.details).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")} className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Audit Trail
            </h1>
            <p className="text-sm text-muted-foreground">Alle administrativen Aktionen auf einen Blick.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen…"
              className="pl-9 rounded-xl"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              variant={filterType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(null)}
              className="rounded-xl text-xs"
            >
              Alle
            </Button>
            {actionTypes.slice(0, 5).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                className="rounded-xl text-xs"
              >
                {type.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Entries */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Keine Audit-Einträge gefunden.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => {
              const colorClass = ACTION_COLORS[entry.action_type] || ACTION_COLORS.default;
              const date = new Date(entry.created_at);
              return (
                <div key={entry.id} className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Badge className={cn("rounded-lg text-[10px] font-semibold uppercase shrink-0", colorClass)}>
                        {entry.action_type.replace(/_/g, " ")}
                      </Badge>
                      <div>
                        {entry.details && (
                          <p className="text-sm text-foreground">
                            {typeof entry.details === "object" ? JSON.stringify(entry.details) : String(entry.details)}
                          </p>
                        )}
                        {entry.affected_user_id && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.affected_user_id.slice(0, 8)}…
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {date.toLocaleDateString("de-DE")} {date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
