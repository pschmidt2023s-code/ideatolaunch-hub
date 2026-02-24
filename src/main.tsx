import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installGlobalErrorHandler, trackPageLoad } from "./lib/analytics";

installGlobalErrorHandler();
trackPageLoad();

createRoot(document.getElementById("root")!).render(<App />);
