import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BrandHealthCard } from "@/components/dashboard/BrandHealthCard";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  ArrowRight,
  Target,
  Calculator,
  Factory,
  Shield,
  Rocket,
  MoreVertical,
  Pencil,
  Trash2,
  HelpCircle,
  PartyPopper,
  Wrench,
} from "lucide-react";
import { GuidedStarterDialog } from "@/components/GuidedStarterDialog";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";

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
      const { data } = await supabase
        .from("profiles")
        .select("completed_starter_mode")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const showGuidedStarter = !profileData?.completed_starter_mode;

  const handleGuidedClose = async (open: boolean) => {
    setGuidedOpen(open);
    if (!open && user) {
      // Mark as completed so it doesn't show again
      await supabase
        .from("profiles")
        .upsert({ user_id: user.id, completed_starter_mode: true }, { onConflict: "user_id" });
      queryClient.invalidateQueries({ queryKey: ["profile-starter", user.id] });
    }
  };

  const stepKeys = ["p1", "p2", "p3", "p4", "p5"];

  const createBrand = async () => {
    if (isFree && brands.length >= 1) {
      toast.error(t("upgrade.brandLimit"));
      return;
    }
    const { data, error } = await supabase.from("brands").insert({
      user_id: user!.id,
      name: "Neue Marke",
    }).select().single();
    if (error) {
      toast.error(t("steps.saveError"));
      logError(error.message, { errorType: "api", metadata: { action: "createBrand" } });
      return;
    }
    toast.success(t("steps.saved"));
    trackEvent(brands.length === 0 ? "first_brand_created" : "brand_created", { brandName: "Neue Marke" });
    await refetchBrands();
    if (data) setActiveBrandId(data.id);
  };

  const handleRename = async () => {
    if (!editingBrand || !newName.trim()) return;
    const { error } = await supabase
      .from("brands")
      .update({ name: newName.trim() })
      .eq("id", editingBrand.id);
    if (error) {
      toast.error(t("steps.saveError"));
      return;
    }
    toast.success(t("steps.saved"));
    setRenameOpen(false);
    refetchBrands();
  };

  const handleDelete = async () => {
    if (!editingBrand) return;
    const { error } = await supabase.from("brands").delete().eq("id", editingBrand.id);
    if (error) {
      toast.error(t("steps.saveError"));
      return;
    }
    toast.success(t("dashboard.brandDeleted"));
    setDeleteOpen(false);
    setEditingBrand(null);
    refetchBrands();
  };

  const openRename = (brand: { id: string; name: string }) => {
    setEditingBrand(brand);
    setNewName(brand.name);
    setRenameOpen(true);
  };

  const openDelete = (brand: { id: string; name: string }) => {
    setEditingBrand(brand);
    setDeleteOpen(true);
  };

  const currentBrand = activeBrand;
  const isCompleted = currentBrand ? currentBrand.current_step > TOTAL_PHASES : false;
  const clampedStep = currentBrand ? Math.min(currentBrand.current_step, TOTAL_PHASES) : 1;
  const progress = isCompleted ? 100 : currentBrand ? Math.round(((clampedStep - 1) / TOTAL_PHASES) * 100) : 0;
  useEffect(() => {
    if (!isCompleted || !currentBrand) return;
    const storageKey = `confetti_fired_${currentBrand.id}`;
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "true");
    const duration = 2000;
    const end = Date.now() + duration;
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

        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <Button
            onClick={createBrand}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("dashboard.newBrand")}</span>
          </Button>
        </div>

        {/* Phase Progress – clear visual */}
        {currentBrand && <PhaseProgressBar />}

        {/* Next Step Highlight */}
        {currentBrand && !isCompleted && (
          <AnimatedCard index={1} variant="fade-up">
            <button
              onClick={() => navigate(`/dashboard/step/${clampedStep}`)}
              className="w-full flex items-center gap-4 rounded-2xl border-2 border-accent/30 bg-accent/5 p-5 text-left hover:border-accent/50 card-interactive"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                {(() => { const Icon = stepIcons[clampedStep - 1]; return <Icon className="h-5 w-5" />; })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-0.5">
                  {isDE ? "Nächster Schritt" : "Next Step"}
                </p>
                <p className="font-semibold truncate">{t(`steps.s${clampedStep}`)}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-accent shrink-0" />
            </button>
          </AnimatedCard>
        )}

        {/* Quick Access */}
        {currentBrand && (
          <AnimatedCard index={2} variant="fade-up">
            <div className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {t("dashboard.quickAccess", "Schnellzugriff")}
                </span>
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
                    className="rounded-xl border bg-background px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-center focus-ring"
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedCard>
        )}

        {currentBrand && showGuidedStarter && (
          <Button
            variant="outline"
            onClick={() => setGuidedOpen(true)}
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            {t("dashboard.guidedStarter", "Ich brauche Hilfe beim Start")}
          </Button>
        )}
        {!brands?.length ? (
          <EmptyState
            icon={<Plus className="h-6 w-6 text-accent" />}
            title={t("dashboard.createFirst")}
            description={t("dashboard.createFirstDesc")}
            action={
              <Button
                onClick={createBrand}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="h-4 w-4" />
                {t("dashboard.createBrand")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {currentBrand && isCompleted && (
              <div className="animate-fade-in rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 p-6 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                    <PartyPopper className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-green-700 dark:text-green-300">
                      🎉 {t("dashboard.congratulations", "Glückwunsch!")}
                    </h2>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">
                      {t("dashboard.brandComplete", "Deine Marke «{{name}}» ist startklar! Alle 5 Phasen abgeschlossen.").replace("{{name}}", currentBrand.name)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {currentBrand && <BrandHealthCard />}
            
            {/* Retention Engine Widgets */}
            {currentBrand && (
              <div className="grid gap-4 sm:grid-cols-2">
                <WeeklyCEOReviewCard />
                <MomentumScoreCard />
              </div>
            )}
            {currentBrand && <RetentionUpgradeTrigger />}
            {currentBrand && <DecisionTimeline />}
            
            {currentBrand && <BlueprintExport />}

            {currentBrand && (
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{currentBrand.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${isCompleted ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-accent/10 text-accent"}`}>
                      {isCompleted ? t("dashboard.completed", "✓ Abgeschlossen") : t("dashboard.stepOf", { step: clampedStep })}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openRename(currentBrand)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("dashboard.renameBrand")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDelete(currentBrand)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("dashboard.deleteBrand")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <Progress value={progress} className="mb-6 h-2" />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {stepKeys.map((key, i) => {
                    const Icon = stepIcons[i];
                    const stepNum = i + 1;
                    const stepDone = stepNum < clampedStep || (isCompleted && stepNum === TOTAL_PHASES);
                    const isCurrent = !isCompleted && stepNum === clampedStep;

                    return (
                      <button
                        key={key}
                        onClick={() => navigate(`/dashboard/step/${stepNum}`)}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:shadow-md ${
                          isCurrent
                            ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                            : stepDone
                            ? "border-green-500/30 bg-green-500/5"
                            : "opacity-60"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isCurrent ? "text-accent" : stepDone ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
                        <span className="text-xs font-medium leading-tight">{t(`steps.${key}`)}</span>
                      </button>
                    );
                  })}
                </div>

                <Button
                  className="mt-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate(`/dashboard/step/${clampedStep}`)}
                >
                  {t("dashboard.continue")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {brands.length > 1 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t("dashboard.allBrands")}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {brands.filter((b) => b.id !== currentBrand?.id).map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-card hover:shadow-md transition-shadow"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          setActiveBrandId(brand.id);
                          navigate(`/dashboard/step/${Math.min(brand.current_step, 7)}`);
                        }}
                      >
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("dashboard.stepOf", { step: Math.min(brand.current_step, 7) })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openRename(brand)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("dashboard.renameBrand")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDelete(brand)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("dashboard.deleteBrand")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ArrowRight
                          className="h-4 w-4 text-muted-foreground cursor-pointer"
                          onClick={() => {
                            setActiveBrandId(brand.id);
                            navigate(`/dashboard/step/${Math.min(brand.current_step, 7)}`);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.renameBrand")}</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              {t("steps.back")}
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              {t("steps.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.deleteBrand")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.deleteConfirm", { name: editingBrand?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("steps.back")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {t("dashboard.deleteBrand")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <GuidedStarterDialog open={guidedOpen} onOpenChange={handleGuidedClose} />
    </DashboardLayout>
  );
}
