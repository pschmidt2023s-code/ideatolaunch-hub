import { lazy, Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { BrandProvider } from "@/hooks/useBrand";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { BetaBadge } from "@/components/BetaBadge";
import { BetaFeedbackButton } from "@/components/BetaFeedbackButton";
import SplashScreen from "@/components/SplashScreen";
import "@/i18n";

// Critical path: keep eager
import Index from "./pages/Index";

// Lazy-load all non-landing routes
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const StarterMode = lazy(() => import("./pages/StarterMode"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InsightsPage = lazy(() => import("./pages/Insights"));
const StepPage = lazy(() => import("./pages/workflow/StepPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Pricing = lazy(() => import("./pages/Pricing"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const DashboardPricing = lazy(() => import("./pages/DashboardPricing"));
const InternalAnalytics = lazy(() => import("./pages/internal/Analytics"));
const AdminInsights = lazy(() => import("./pages/admin/Insights"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const MonetizationAdmin = lazy(() => import("./pages/admin/MonetizationAdmin"));
const DebugGating = lazy(() => import("./pages/debug/Gating"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const AGB = lazy(() => import("./pages/AGB"));
const Product = lazy(() => import("./pages/Product"));
const Blog = lazy(() => import("./pages/Blog"));
const MinimalistischerArbeitsplatz = lazy(() => import("./pages/blog/MinimalistischerArbeitsplatz"));
const ProduktivitaetHomeOffice = lazy(() => import("./pages/blog/ProduktivitaetHomeOffice"));
const SchreibtischSetupGuide = lazy(() => import("./pages/blog/SchreibtischSetupGuide"));

const ProduktionskostenRechner = lazy(() => import("./pages/tools/ProduktionskostenRechner"));
const BreakEvenRechner = lazy(() => import("./pages/tools/BreakEvenRechner"));
const MoqRechner = lazy(() => import("./pages/tools/MoqRechner"));

const EigenmarkeGruenden = lazy(() => import("./pages/guide/EigenmarkeGruenden"));
const PrivateLabelStarten = lazy(() => import("./pages/guide/PrivateLabelStarten"));
const LieferantenFinden = lazy(() => import("./pages/guide/LieferantenFinden"));
const ProduktionskostenKalkulieren = lazy(() => import("./pages/guide/ProduktionskostenKalkulieren"));
const MoqBerechnen = lazy(() => import("./pages/guide/MoqBerechnen"));
const BreakEvenGuide = lazy(() => import("./pages/guide/BreakEvenGuide"));
const KapitalbedarfBerechnen = lazy(() => import("./pages/guide/KapitalbedarfBerechnen"));
const LaunchPlanErstellen = lazy(() => import("./pages/guide/LaunchPlanErstellen"));
const ProduktionsfehlerVermeiden = lazy(() => import("./pages/guide/ProduktionsfehlerVermeiden"));
const UeberUns = lazy(() => import("./pages/UeberUns"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Community = lazy(() => import("./pages/Community"));
const ReferralDashboard = lazy(() => import("./pages/ReferralDashboard"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));

const Research = lazy(() => import("./pages/Research"));
const Press = lazy(() => import("./pages/Press"));
const Academy = lazy(() => import("./pages/Academy"));
const VsExcel = lazy(() => import("./pages/comparisons/VsExcel"));
const VsNotion = lazy(() => import("./pages/comparisons/VsNotion"));
const BestTools = lazy(() => import("./pages/comparisons/BestTools"));

const CompliancePage = lazy(() => import("./pages/CompliancePage"));
const StrategicPage = lazy(() => import("./pages/StrategicPage"));
const AdminFraud = lazy(() => import("./pages/admin/FraudPage"));
const FounderIntelligencePage = lazy(() => import("./pages/FounderIntelligencePage"));
const CommandCenter = lazy(() => import("./pages/CommandCenter"));
const IntelligencePage = lazy(() => import("./pages/IntelligencePage"));
const RecoveryMode = lazy(() => import("./pages/RecoveryMode"));
const ExecutionOS = lazy(() => import("./pages/ExecutionOS"));
const ProductEvolution = lazy(() => import("./pages/ProductEvolution"));
const RevenueActivation = lazy(() => import("./pages/RevenueActivation"));
const GrowthEngine = lazy(() => import("./pages/admin/GrowthEngine"));
const PartnerDashboard = lazy(() => import("./pages/admin/PartnerDashboard"));
const BetaDashboard = lazy(() => import("./pages/admin/BetaDashboard"));
const Download = lazy(() => import("./pages/Download"));
const FailureSimulator = lazy(() => import("./pages/FailureSimulator"));
const MarketBenchmark = lazy(() => import("./pages/MarketBenchmark"));
const WebsiteBuilder = lazy(() => import("./pages/WebsiteBuilder"));

const queryClient = new QueryClient();

function LazyFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="h-4 w-72 rounded-md bg-muted" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-32 rounded-xl bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
        </div>
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

const isTauriEnv = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const App = () => {
  const [showSplash, setShowSplash] = useState(isTauriEnv);

  const handleSplashFinished = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && isTauriEnv && <SplashScreen onFinished={handleSplashFinished} />}

      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrandProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />

                <HashRouter>

                  <Suspense fallback={<LazyFallback />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                      <Route path="/starter" element={<ProtectedRoute><StarterMode /></ProtectedRoute>} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/impressum" element={<Impressum />} />
                      <Route path="/datenschutz" element={<Datenschutz />} />
                      <Route path="/agb" element={<AGB />} />
                      <Route path="/product" element={<Product />} />
                      <Route path="/download" element={<Download />} />

                      {/* Blog */}
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/minimalistischer-arbeitsplatz" element={<MinimalistischerArbeitsplatz />} />
                      <Route path="/blog/produktivitaet-home-office" element={<ProduktivitaetHomeOffice />} />
                      <Route path="/blog/schreibtisch-setup-guide" element={<SchreibtischSetupGuide />} />

                      {/* Free Tools */}
                      <Route path="/tools/produktionskosten-rechner" element={<ProduktionskostenRechner />} />
                      <Route path="/tools/break-even-rechner" element={<BreakEvenRechner />} />
                      <Route path="/tools/moq-rechner" element={<MoqRechner />} />

                      {/* Guide / Pillar + Cluster */}
                      <Route path="/guide/eigenmarke-gruenden" element={<EigenmarkeGruenden />} />
                      <Route path="/guide/private-label-starten" element={<PrivateLabelStarten />} />
                      <Route path="/guide/lieferanten-finden" element={<LieferantenFinden />} />
                      <Route path="/guide/produktionskosten-kalkulieren" element={<ProduktionskostenKalkulieren />} />
                      <Route path="/guide/moq-berechnen" element={<MoqBerechnen />} />
                      <Route path="/guide/break-even-rechner" element={<BreakEvenGuide />} />
                      <Route path="/guide/kapitalbedarf-berechnen" element={<KapitalbedarfBerechnen />} />
                      <Route path="/guide/launch-plan-erstellen" element={<LaunchPlanErstellen />} />
                      <Route path="/guide/produktionsfehler-vermeiden" element={<ProduktionsfehlerVermeiden />} />
                      <Route path="/ueber-uns" element={<UeberUns />} />
                      <Route path="/case-studies" element={<CaseStudies />} />
                      <Route path="/community" element={<Community />} />

                      {/* Backlink & Authority */}
                      <Route path="/research" element={<Research />} />
                      <Route path="/press" element={<Press />} />
                      <Route path="/academy" element={<Academy />} />
                      <Route path="/buildyourbrand-vs-excel" element={<VsExcel />} />
                      <Route path="/buildyourbrand-vs-notion" element={<VsNotion />} />
                      <Route path="/best-private-label-tools" element={<BestTools />} />

                      {/* Dashboard */}
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/dashboard/command" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
                      <Route path="/dashboard/intelligence" element={<ProtectedRoute><IntelligencePage /></ProtectedRoute>} />
                      <Route path="/dashboard/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
                      <Route path="/dashboard/step/:stepNumber" element={<ProtectedRoute><StepPage /></ProtectedRoute>} />
                      <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                      <Route path="/dashboard/pricing" element={<ProtectedRoute><DashboardPricing /></ProtectedRoute>} />
                      <Route path="/dashboard/referrals" element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />
                      <Route path="/dashboard/affiliate" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
                      <Route path="/dashboard/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
                      <Route path="/dashboard/strategic" element={<ProtectedRoute><StrategicPage /></ProtectedRoute>} />
                      <Route path="/dashboard/intelligence" element={<ProtectedRoute><FounderIntelligencePage /></ProtectedRoute>} />
                      <Route path="/dashboard/recovery" element={<ProtectedRoute><RecoveryMode /></ProtectedRoute>} />
                      <Route path="/dashboard/execution" element={<ProtectedRoute><ExecutionOS /></ProtectedRoute>} />
                      <Route path="/dashboard/evolution" element={<ProtectedRoute><ProductEvolution /></ProtectedRoute>} />
                      <Route path="/dashboard/revenue" element={<ProtectedRoute><RevenueActivation /></ProtectedRoute>} />
                      <Route path="/dashboard/failure-simulator" element={<ProtectedRoute><FailureSimulator /></ProtectedRoute>} />
                      <Route path="/dashboard/benchmark" element={<ProtectedRoute><MarketBenchmark /></ProtectedRoute>} />
                      <Route path="/dashboard/website-builder" element={<ProtectedRoute><WebsiteBuilder /></ProtectedRoute>} />
                      <Route path="/internal/analytics" element={<ProtectedRoute><InternalAnalytics /></ProtectedRoute>} />
                      <Route path="/admin/insights" element={<AdminInsights />} />
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/fraud" element={<AdminFraud />} />
                      <Route path="/admin/monetization" element={<MonetizationAdmin />} />
                      <Route path="/admin/growth" element={<GrowthEngine />} />
                      <Route path="/admin/partners" element={<PartnerDashboard />} />
                      <Route path="/admin/beta" element={<BetaDashboard />} />
                      <Route path="/debug/gating" element={<DebugGating />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>

                  <CookieConsentBanner />
                  <BetaBadge />
                  <BetaFeedbackButton />
                </HashRouter>
              </TooltipProvider>
            </BrandProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  );
};

export default App;
