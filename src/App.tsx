import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { BrandProvider } from "@/hooks/useBrand";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
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
const DebugGating = lazy(() => import("./pages/debug/Gating"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const AGB = lazy(() => import("./pages/AGB"));
const Product = lazy(() => import("./pages/Product"));
const Blog = lazy(() => import("./pages/Blog"));
const MinimalistischerArbeitsplatz = lazy(() => import("./pages/blog/MinimalistischerArbeitsplatz"));
const ProduktivitaetHomeOffice = lazy(() => import("./pages/blog/ProduktivitaetHomeOffice"));
const SchreibtischSetupGuide = lazy(() => import("./pages/blog/SchreibtischSetupGuide"));

const queryClient = new QueryClient();

function LazyFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/minimalistischer-arbeitsplatz" element={<MinimalistischerArbeitsplatz />} />
                  <Route path="/blog/produktivitaet-home-office" element={<ProduktivitaetHomeOffice />} />
                  <Route path="/blog/schreibtisch-setup-guide" element={<SchreibtischSetupGuide />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/step/:stepNumber" element={<ProtectedRoute><StepPage /></ProtectedRoute>} />
                  <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/pricing" element={<ProtectedRoute><DashboardPricing /></ProtectedRoute>} />
                  <Route path="/internal/analytics" element={<ProtectedRoute><InternalAnalytics /></ProtectedRoute>} />
                  <Route path="/admin/insights" element={<AdminInsights />} />
                  <Route path="/debug/gating" element={<DebugGating />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <CookieConsentBanner />
            </BrowserRouter>
          </TooltipProvider>
        </BrandProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
