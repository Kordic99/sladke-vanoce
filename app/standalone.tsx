import React from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "./dashboard";
import { loadBrowserPlan } from "../lib/browser-storage";
import "./globals.css";
import "./readability.css";
import "./christmas.css";
import "./calendar.css";
import "./mobile.css";

try {
  const { plan, revision } = loadBrowserPlan();
  createRoot(document.getElementById("root")!).render(<Dashboard initialPlan={plan} initialRevision={revision} browserStorage />);
} catch {
  const root = document.getElementById("root")!;
  root.style.cssText = "max-width:650px;margin:80px auto;padding:30px;font-family:Segoe UI,Arial,sans-serif";
  root.textContent = "Uložený seznam se nepodařilo načíst. Otevřete dashboard v běžném prohlížeči s povoleným ukládáním místních dat. Existující data nebyla přepsána.";
}
