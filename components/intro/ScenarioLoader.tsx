"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";

const STEPS = [
  "Consulting the opinion polls…",
  "Analysing swing seats…",
  "Counting postal votes…",
  "Calling marginals…",
  "Forming the government…",
  "Appointing the cabinet…",
  "Preparing the King's Speech…",
  "Opening Parliament…",
];

export function ScenarioLoader() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 900);
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => { clearInterval(stepTimer); clearInterval(dotTimer); };
  }, []);

  return (
    <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center gap-10">
      {/* Pulsing crown */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl scale-150 animate-pulse" />
        <div className="relative h-20 w-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
          <Crown className="h-10 w-10 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-3">
        <h2 className="text-2xl font-black text-white tracking-tight">
          Generating Your Political World
        </h2>
        <p className="text-sm text-slate-400 min-h-[20px] transition-all">
          {STEPS[stepIndex]}{dots}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <p className="text-xs text-slate-600 max-w-xs text-center">
        The AI is crafting a unique, plausible UK political scenario for your game.
      </p>
    </div>
  );
}
