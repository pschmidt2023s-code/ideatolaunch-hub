import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installGlobalErrorHandler, trackPageLoad } from "./lib/analytics";

// HashRouter compat: normalize direct deep links like /admin/dashboard -> /#/admin/dashboard
// while preserving preview token query params (e.g. ?__lovable_token=...).
if (typeof window !== "undefined") {
  const { origin, pathname, search, hash } = window.location;
  if (pathname !== "/" && !hash) {
    // Keep __lovable_token etc. as real query params, move route query params into hash
    const url = new URL(window.location.href);
    const lovableToken = url.searchParams.get("__lovable_token");
    // Build the real query string (only system params like __lovable_token)
    const systemParams = new URLSearchParams();
    if (lovableToken) systemParams.set("__lovable_token", lovableToken);
    // Build hash with pathname + remaining query params
    url.searchParams.delete("__lovable_token");
    const routeQuery = url.searchParams.toString();
    const hashPath = routeQuery ? `${pathname}?${routeQuery}` : pathname;
    const systemQuery = systemParams.toString();
    const newUrl = `${origin}/${systemQuery ? `?${systemQuery}` : ""}#${hashPath}`;
    window.history.replaceState(null, "", newUrl);
  }
}

installGlobalErrorHandler();
trackPageLoad();

// Register Service Worker for offline support
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
