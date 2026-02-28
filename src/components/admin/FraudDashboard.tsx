import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Shield, AlertTriangle, CheckCircle, Search, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReferralValidation {
  id: string;
  referral_id: string;
  referred_user_id: string;
  fraud_score: number;
  status: string;
  ip_hash: string | null;
  device_fingerprint: string | null;
  email_similarity_score: number;
  signup_velocity_flag: boolean;
  shared_payment_flag: boolean;
  risk_factors: string[];
  admin_override: boolean;
  admin_override_reason: string | null;
  created_at: string;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  valid: { label: "Gültig", className: "bg-green-100 text-green-800" },
  suspicious: { label: "Verdächtig", className: "bg-yellow-100 text-yellow-800" },
  flagged: { label: "Blockiert", className: "bg-red-100 text-red-800" },
  pending: { label: "Ausstehend", className: "bg-muted text-muted-foreground" },
  override_valid: { label: "Manuell freigegeben", className: "bg-blue-100 text-blue-800" },
  override_flagged: { label: "Manuell blockiert", className: "bg-purple-100 text-purple-800" },
};

export default function FraudDashboard() {
  const [validations, setValidations] = useState<ReferralValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadValidations();
  }, []);

  const loadValidations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("referral_validations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Fehler beim Laden");
    } else {
      setValidations((data as unknown as ReferralValidation[]) || []);
    }
    setLoading(false);
  };

  const handleOverride = async (id: string, newStatus: string, reason: string) => {
    const { error } = await supabase
      .from("referral_validations")
      .update({
        status: newStatus,
        admin_override: true,
        admin_override_reason: reason,
      })
      .eq("id", id);

    if (error) {
      toast.error("Override fehlgeschlagen");
    } else {
      toast.success("Status aktualisiert");
      loadValidations();
    }
  };

  const filtered = validations.filter((v) => {
    if (filter !== "all" && v.status !== filter) return false;
    if (search && !v.referred_user_id.includes(search) && !v.referral_id.includes(search)) return false;
    return true;
  });

  const stats = {
    total: validations.length,
    valid: validations.filter((v) => v.status === "valid" || v.status === "override_valid").length,
    suspicious: validations.filter((v) => v.status === "suspicious").length,
    flagged: validations.filter((v) => v.status === "flagged" || v.status === "override_flagged").length,
    avgScore: validations.length > 0
      ? Math.round(validations.reduce((s, v) => s + v.fraud_score, 0) / validations.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Gesamt</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Gültig</p>
            <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Verdächtig</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.suspicious}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Blockiert</p>
            <p className="text-2xl font-bold text-destructive">{stats.flagged}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">⌀ Score</p>
            <p className="text-2xl font-bold">{stats.avgScore}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Referral ID oder User ID suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="valid">Gültig</SelectItem>
            <SelectItem value="suspicious">Verdächtig</SelectItem>
            <SelectItem value="flagged">Blockiert</SelectItem>
            <SelectItem value="pending">Ausstehend</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risikofaktoren</TableHead>
                <TableHead>Override</TableHead>
                <TableHead>Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => {
                const badge = STATUS_BADGES[v.status] || STATUS_BADGES.pending;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="text-xs">
                      {new Date(v.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono font-bold ${v.fraud_score > 70 ? "text-destructive" : v.fraud_score > 40 ? "text-yellow-600" : "text-green-600"}`}>
                        {v.fraud_score}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {(v.risk_factors || []).slice(0, 2).map((f, i) => (
                          <span key={i} className="text-[10px] bg-muted rounded px-1.5 py-0.5">{f.split(":")[0]}</span>
                        ))}
                        {(v.risk_factors || []).length > 2 && (
                          <span className="text-[10px] text-muted-foreground">+{v.risk_factors.length - 2}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {v.admin_override && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <OverrideDialog validation={v} onOverride={handleOverride} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    {loading ? "Laden…" : "Keine Einträge gefunden"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function OverrideDialog({
  validation,
  onOverride,
}: {
  validation: ReferralValidation;
  onOverride: (id: string, status: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [newStatus, setNewStatus] = useState("override_valid");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Referral-Validierung Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Fraud Score:</span> <strong>{validation.fraud_score}</strong></div>
            <div><span className="text-muted-foreground">Status:</span> <strong>{validation.status}</strong></div>
            <div><span className="text-muted-foreground">IP Hash:</span> {validation.ip_hash || "–"}</div>
            <div><span className="text-muted-foreground">Device:</span> {validation.device_fingerprint?.slice(0, 12) || "–"}</div>
            <div><span className="text-muted-foreground">Velocity:</span> {validation.signup_velocity_flag ? "⚠️ Ja" : "Nein"}</div>
            <div><span className="text-muted-foreground">Shared Payment:</span> {validation.shared_payment_flag ? "⚠️ Ja" : "Nein"}</div>
          </div>

          {(validation.risk_factors || []).length > 0 && (
            <div className="rounded border p-2 space-y-1">
              <p className="text-xs font-medium">Risikofaktoren:</p>
              {validation.risk_factors.map((f, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {f}</p>
              ))}
            </div>
          )}

          <div className="space-y-2 border-t pt-3">
            <p className="text-sm font-medium">Admin Override</p>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="override_valid">Manuell freigeben</SelectItem>
                <SelectItem value="override_flagged">Manuell blockieren</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Begründung…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button
                  onClick={() => onOverride(validation.id, newStatus, reason)}
                  disabled={!reason.trim()}
                  size="sm"
                >
                  Override speichern
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
