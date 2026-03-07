import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandHealthCard } from "@/components/dashboard/BrandHealthCard";
import { SmartInsightsPanel } from "@/components/dashboard/SmartInsightsPanel";
import { PhaseProgressBar } from "@/components/dashboard/PhaseProgressBar";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import BlueprintExport from "@/components/BlueprintExport";
import { WeeklyCEOReviewCard, MomentumScoreCard, DecisionTimeline, RetentionUpgradeTrigger } from "@/components/dashboard/RetentionWidgets";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEvent, logError } from "@/lib/analytics";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, ArrowRight, Target, Calculator, Factory, Shield, Rocket,
  MoreVertical, Pencil, Trash2, HelpCircle, PartyPopper, Wrench, Crosshair, Brain, BarChart3,
} from "lucide-react";
import { GuidedStarterDialog } from "@/components/GuidedStarterDialog";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { cn } from "@/lib/utils";

const TOTAL_PHASES = 5;
const stepIcons = [Target, Calculator, Factory, Shield, Rocket];

export default function Dashboard() {
  const { user } = useAuth();
  const { brands, activeBrand, setActiveBrandId, refetchBrands } = useBrand();
  const { isFree } = useSubscription();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const queryClient = useQueryClient();

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<{ id: string; name: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [guidedOpen, setGuidedOpen] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ["profile-starter", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("completed_starter_mode").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const showGuidedStarter = !profileData?.completed_starter_mode;

  const handleGuidedClose = async (open: boolean) => {
    setGuidedOpen(open);
    if (!open && user) {
      await supabase.from("profiles").upsert({ user_id: user.id, completed_starter_mode: true }, { onConflict: "user_id" });
      queryClient.invalidateQueries({ queryKey: ["profile-starter", user.id] });
    }
  };

  const createBrand = async () => {
    if (isFree && brands.length >= 1) { toast.error(t("upgrade.brandLimit")); return; }
    const { data, error } = await supabase.from("brands").insert({ user_id: user!.id, name: "Neue Marke" }).select().single();
    if (error) { toast.error(t("steps.saveError")); logError(error.message, { errorType: "api", metadata: { action: "createBrand" } }); return; }
    toast.success(t("steps.saved"));
    trackEvent(brands.length === 0 ? "first_brand_created" : "brand_created", { brandName: "Neue Marke" });
    await refetchBrands();
    if (data) setActiveBrandId(data.id);
  };

  const handleRename = async () => {
    if (!editingBrand || !newName.trim()) return;
    const { error } = await supabase.from("brands").update({ name: newName.trim() }).eq("id", editingBrand.id);
    if (error) { toast.error(t("steps.saveError")); return; }
    toast.success(t("steps.saved"));
    setRenameOpen(false);
    refetchBrands();
  };

  const handleDelete = async () => {
    if (!editingBrand) return;
    const { error } = await supabase.from("brands").delete().eq("id", editingBrand.id);
    if (error) { toast.error(t("steps.saveError")); return; }
    toast.success(t("dashboard.brandDeleted"));
    setDeleteOpen(false);
    setEditingBrand(null);
    refetchBrands();
  };

  const currentBrand = activeBrand;
  const isCompleted = currentBrand ? currentBrand.current_step > TOTAL_PHASES : false;
  const clampedStep = currentBrand ? Math.min(currentBrand.current_step, TOTAL_PHASES) : 1;

  useEffect(() => {
    if (!isCompleted || !currentBrand) return;
    const storageKey = `confetti_fired_${currentBrand.id}`;
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "true");
    const end = Date.now() + 2000;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [isCompleted, currentBrand]);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {isFree && <UpgradeBanner />}

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("dashboard.title")}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <Button onClick={createBrand} variant="premium" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("dashboard.newBrand")}</span>
          </Button>
        </div>

        {/* ── No brands ── */}
        {!brands?.length ? (
          <EmptyState
            icon={<Plus className="h-6 w-6 text-accent" />}
            title={t("dashboard.createFirst")}
            description={t("dashboard.createFirstDesc")}
            action={<Button onClick={createBrand} variant="premium" className="gap-2"><Plus className="h-4 w-4" />{t("dashboard.createBrand")}</Button>}
          />
        ) : (
          <>
            {/* ── Completion banner ── */}
            {currentBrand && isCompleted && (
              <AnimatedCard index={0}>
                <div className="rounded-xl border border-success/30 bg-success/5 p-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 shrink-0">
                    <PartyPopper className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-success">🎉 {t("dashboard.congratulations", "Glückwunsch!")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard.brandComplete", "Deine Marke «{{name}}» ist startklar! Alle 5 Phasen abgeschlossen.").replace("{{name}}", currentBrand.name)}
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* ── Phase Progress ── */}
            {currentBrand && (
              <AnimatedCard index={1}>
                <PhaseProgressBar />
              </AnimatedCard>
            )}

            {/* ── Next Step CTA ── */}
            {currentBrand && !isCompleted && (
              <AnimatedCard index={2} variant="fade-up">
                <button
                  onClick={() => navigate(`/dashboard/step/${clampedStep}`)}
                  className="w-full flex items-center gap-4 rounded-xl border-2 border-accent/30 bg-accent/5 p-5 text-left hover:border-accent/50 transition-all"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    {(() => { const Icon = stepIcons[clampedStep - 1]; return <Icon className="h-5 w-5" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-0.5">
                      {isDE ? "Nächster Schritt" : "Next Step"} · Phase {clampedStep}/{TOTAL_PHASES}
                    </p>
                    <p className="font-semibold truncate">{t(`steps.s${clampedStep}`)}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent shrink-0" />
                </button>
              </AnimatedCard>
            )}

            {/* ── Quick Links ── */}
            {currentBrand && (
              <AnimatedCard index={3}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Crosshair, label: "Command Center", href: "/dashboard/command", desc: "Risiko & Strategie" },
                    { icon: Brain, label: "Intelligence", href: "/dashboard/intelligence", desc: "KI-Analyse" },
                    { icon: BarChart3, label: "Simulationen", href: "/dashboard/failure-simulator", desc: "Szenarien testen" },
                  ].map((link) => (
                    <button
                      key={link.href}
                      onClick={() => navigate(link.href)}
                      className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                        <link.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{link.label}</p>
                        <p className="text-[11px] text-muted-foreground">{link.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </AnimatedCard>
            )}

            {/* ── Brand Health + Insights ── */}
            {currentBrand && (
              <AnimatedCard index={4}>
                <BrandHealthCard />
              </AnimatedCard>
            )}

            {currentBrand && (
              <AnimatedCard index={5}>
                <div className="rounded-xl border bg-card p-5 shadow-card">
                  <SmartInsightsPanel />
                </div>
              </AnimatedCard>
            )}

            {/* ── Community Intelligence ── */}
            {currentBrand && (
              <AnimatedCard index={5.5}>
                <CommunityIntelligenceWidget />
              </AnimatedCard>
            )}

            {/* ── Retention Widgets ── */}
            {currentBrand && (
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatedCard index={6}><WeeklyCEOReviewCard /></AnimatedCard>
                <AnimatedCard index={7}><MomentumScoreCard /></AnimatedCard>
              </div>
            )}
            {currentBrand && <RetentionUpgradeTrigger />}
            {currentBrand && <DecisionTimeline />}

            {/* ── Quick Tools ── */}
            {currentBrand && (
              <AnimatedCard index={8}>
                <div className="rounded-xl border bg-card p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{t("dashboard.quickAccess", "Schnellzugriff")}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: isDE ? "Produktionskosten" : "Production Costs", href: "/tools/produktionskosten-rechner" },
                      { label: "Break-Even", href: "/tools/break-even-rechner" },
                      { label: "MOQ", href: "/tools/moq-rechner" },
                    ].map((tool) => (
                      <button
                        key={tool.href}
                        onClick={() => navigate(tool.href)}
                        className="rounded-lg border bg-background px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-center"
                      >
                        {tool.label}
                      </button>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {currentBrand && <BlueprintExport />}

            {/* ── Brand Management ── */}
            {currentBrand && (
              <AnimatedCard index={9}>
                <div className="rounded-xl border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <span className="text-sm font-bold text-muted-foreground">{currentBrand.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold">{currentBrand.name}</h2>
                        <p className="text-[11px] text-muted-foreground">
                          {isCompleted ? t("dashboard.completed", "✓ Abgeschlossen") : t("dashboard.stepOf", { step: clampedStep })}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingBrand(currentBrand); setNewName(currentBrand.name); setRenameOpen(true); }}>
                          <Pencil className="mr-2 h-4 w-4" /> {t("dashboard.renameBrand")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setEditingBrand(currentBrand); setDeleteOpen(true); }}>
                          <Trash2 className="mr-2 h-4 w-4" /> {t("dashboard.deleteBrand")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((stepNum) => {
                      const Icon = stepIcons[stepNum - 1];
                      const done = stepNum < clampedStep || isCompleted;
                      const active = !isCompleted && stepNum === clampedStep;
                      return (
                        <button
                          key={stepNum}
                          onClick={() => navigate(`/dashboard/step/${stepNum}`)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition-all hover:shadow-sm",
                            active ? "border-accent bg-accent/5" : done ? "border-success/30 bg-success/5" : "border-border opacity-60 hover:opacity-80"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", active ? "text-accent" : done ? "text-success" : "text-muted-foreground")} />
                          <span className="text-[10px] font-medium leading-tight hidden sm:block">{t(`steps.p${stepNum}`)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* ── Other brands ── */}
            {brands.length > 1 && (
              <div>
                <h3 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("dashboard.allBrands")}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {brands.filter((b) => b.id !== currentBrand?.id).map((brand) => (
                    <div key={brand.id} className="flex items-center justify-between rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
                      <button className="flex-1 text-left" onClick={() => { setActiveBrandId(brand.id); navigate(`/dashboard/step/${Math.min(brand.current_step, 5)}`); }}>
                        <p className="text-sm font-medium">{brand.name}</p>
                        <p className="text-xs text-muted-foreground">{t("dashboard.stepOf", { step: Math.min(brand.current_step, 5) })}</p>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingBrand(brand); setNewName(brand.name); setRenameOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" />{t("dashboard.renameBrand")}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setEditingBrand(brand); setDeleteOpen(true); }}>
                            <Trash2 className="mr-2 h-4 w-4" />{t("dashboard.deleteBrand")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentBrand && showGuidedStarter && (
              <Button variant="outline" onClick={() => setGuidedOpen(true)} className="gap-2">
                <HelpCircle className="h-4 w-4" />
                {t("dashboard.guidedStarter", "Ich brauche Hilfe beim Start")}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("dashboard.renameBrand")}</DialogTitle></DialogHeader>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRename()} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>{t("steps.back")}</Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>{t("steps.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.deleteBrand")}</AlertDialogTitle>
            <AlertDialogDescription>{t("dashboard.deleteConfirm", { name: editingBrand?.name })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("steps.back")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>{t("dashboard.deleteBrand")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <GuidedStarterDialog open={guidedOpen} onOpenChange={handleGuidedClose} />
    </DashboardLayout>
  );
}
