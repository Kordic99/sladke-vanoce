"use client";

import { useEffect, useState } from "react";
import { christmasCountdown } from "../lib/christmas";

export function ChristmasCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", tick); };
  }, []);
  const countdown = now === null ? null : christmasCountdown(now);
  const parts = [
    [countdown?.days, "dní"], [countdown?.hours, "hodin"],
    [countdown?.minutes, "minut"], [countdown?.seconds, "sekund"],
  ] as const;
  return <div className="christmas-countdown">
    <h1>{countdown?.isChristmas ? "Veselé Vánoce!" : "Do Vánoc zbývá"}</h1>
    <div className="countdown-clock" role="timer" aria-label="Odpočet do Štědrého dne" aria-live="off">
      {parts.map(([value, label]) => <div className="countdown-unit" key={label}><strong>{value === undefined ? "–" : String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}
    </div>
    <div className="countdown-date">{countdown?.isChristmas ? "Dnes je Štědrý den. Užijte si ho spolu." : `Štědrý den · 24. prosince${countdown ? ` ${countdown.year}` : ""}`}</div>
  </div>;
}
