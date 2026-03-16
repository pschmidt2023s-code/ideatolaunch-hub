import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { JourneyOverview } from "@/components/dashboard/JourneyOverview";
import { SmartInsightsPanel } from "@/components/dashboard/SmartInsightsPanel";
import { BrandHealthCard } from "@/components/dashboard/BrandHealthCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEvent, logError } from "@/lib/analytics";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { JOURNEY_PHASES } from "@/lib/journey-phases";
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
  Plus, ArrowRight, PartyPopper, MoreVertical, Pencil, Trash2, HelpCircle, Rocket,
  Brain, BarChart3, Crosshair,
} from "lucide-react";
import { GuidedStarterDialog } from "@/components/GuidedStarterDialog";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

const TOTAL_PHASES = 5;

export default function Dashboard() {
  const { user } = useAuth();
  const { brands, activeBrand, setActiveBrandId, refetchBrands } = useBrand();
  const { isFree } = useSubscription();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const activePhase = JOURNEY_PHASES[clampedStep - 1];

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
      <SEO title="Dashboard – BrandOS" description="Your brand building operating system" path="/dashboard" />
      <div className="animate-fade-in space-y-6 max-w-4xl">
        {isFree && <UpgradeBanner />}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {currentBrand ? `Welcome back` : "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {currentBrand
                ? isCompleted
                  ? `${currentBrand.name} — All phases completed 🎉`
                  : `${currentBrand.name} — Phase ${clampedStep}: ${activePhase?.title}`
                : "Create a brand to start your founder journey"
              }
            </p>
          </div>
          <Button onClick={createBrand} size="sm" className="gap-1.5 rounded-xl h-9">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Brand</span>
          </Button>
        </div>

        {/* No brands empty state */}
        {!brands?.length ? (
          <div className="rounded-2xl border-2 border-dashed border-accent/30 bg-accent/5 p-8 sm:p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 mx-auto mb-4">
              <Rocket className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-lg font-bold mb-2">Start Your Founder Journey</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Create your first brand to begin the guided 5-phase journey. From idea validation to scaling — BrandOS guides you every step.
            </p>
            <Button onClick={createBrand} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> Create Your First Brand
            </Button>
          </div>
        ) : (
          <>
            {/* Completion banner */}
            {currentBrand && isCompleted && (
              <div className="rounded-2xl border border-success/30 bg-success/5 p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 shrink-0">
                  <PartyPopper className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-success">Journey Complete!</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {currentBrand.name} has completed all 5 phases. Your brand is ready for the world!
                  </p>
                </div>
              </div>
            )}

            {/* Next step CTA */}
            {currentBrand && !isCompleted && activePhase && (
              <button
                onClick={() => navigate(`/dashboard/journey/${clampedStep}`)}
                className="w-full flex items-center gap-4 rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10 p-5 text-left hover:border-accent/40 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-md">
                  {(() => { const Icon = activePhase.icon; return <Icon className="h-5 w-5" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent font-mono">
                    Continue Your Journey
                  </p>
                  <p className="text-base font-bold mt-0.5">Phase {clampedStep}: {activePhase.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activePhase.subtitle} · {activePhase.modules.length} tools available</p>
                </div>
                <ArrowRight className="h-5 w-5 text-accent shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Quick access cards */}
            {currentBrand && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Crosshair, label: "Command Center", desc: "Mission control", href: "/dashboard/command" },
                  { icon: Brain, label: "Intelligence", desc: "AI insights", href: "/dashboard/intelligence" },
                  { icon: BarChart3, label: "Simulator", desc: "Risk analysis", href: "/dashboard/failure-simulator" },
                ].map((link) => (
                  <button
                    key={link.href}
                    onClick={() => navigate(link.href)}
                    className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left hover:border-accent/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted group-hover:bg-accent/10 transition-colors">
                      <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{link.label}</p>
                      <p className="text-[10px] text-muted-foreground">{link.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Journey Overview */}
            {currentBrand && <JourneyOverview />}

            {/* Insights row */}
            {currentBrand && (
              <div className="grid gap-4 lg:grid-cols-2">
                <BrandHealthCard />
                <div className="rounded-2xl border bg-card p-5 shadow-card">
                  <SmartInsightsPanel />
                </div>
              </div>
            )}

            {/* Brand management */}
            {currentBrand && (
              <div className="rounded-2xl border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                      <span className="text-sm font-bold font-mono text-accent">{currentBrand.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">{currentBrand.name}</h2>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {isCompleted ? "✓ All phases complete" : `Phase ${clampedStep} of ${TOTAL_PHASES}`}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => { setEditingBrand(currentBrand); setNewName(currentBrand.name); setRenameOpen(true); }}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setEditingBrand(currentBrand); setDeleteOpen(true); }}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Other brands */}
            {brands.length > 1 && (
              <div>
                <h3 className="mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] font-mono">Other Brands</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {brands.filter((b) => b.id !== currentBrand?.id).map((brand) => (
                    <div key={brand.id} className="flex items-center justify-between rounded-2xl border bg-card p-4 hover:bg-muted/30 transition-colors">
                      <button className="flex-1 text-left" onClick={() => setActiveBrandId(brand.id)}>
                        <p className="text-sm font-medium">{brand.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">Phase {Math.min(brand.current_step, 5)}/{TOTAL_PHASES}</p>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingBrand(brand); setNewName(brand.name); setRenameOpen(true); }}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setEditingBrand(brand); setDeleteOpen(true); }}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentBrand && showGuidedStarter && (
              <Button variant="outline" size="sm" onClick={() => setGuidedOpen(true)} className="gap-2 rounded-xl text-xs">
                <HelpCircle className="h-4 w-4" />
                Need help getting started?
              </Button>
            )}
          </>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Rename Brand</DialogTitle></DialogHeader>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRename()} autoFocus className="rounded-xl" />
          <DialogFooter>
            <Button onClick={handleRename} size="sm" className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{editingBrand?.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GuidedStarterDialog open={guidedOpen} onOpenChange={handleGuidedClose} />
    </DashboardLayout>
  );
}
