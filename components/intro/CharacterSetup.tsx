"use client";

import { useState } from "react";
import { MapPin, ChevronRight, Zap, Crown, Building2, AlertTriangle } from "lucide-react";
import { getPartyColour } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { GeneratedScenario, Party, Background } from "@/lib/store/types";

const BACKGROUNDS: Array<{
  name: Background;
  icon: string;
  description: string;
  stat: string;
}> = [
  { name: "Trade Unionist",   icon: "✊", description: "Rose through union ranks. Trusted by working people.", stat: "Integrity +8 · Charisma +5" },
  { name: "City Banker",      icon: "📈", description: "High-flying City career. Economic gravitas, ethical question marks.", stat: "Intelligence +8 · Ambition +8 · Integrity −5" },
  { name: "Lawyer",           icon: "⚖️", description: "Sharp legal mind. Built for scrutiny and debate.", stat: "Intelligence +9 · Charisma +4" },
  { name: "Teacher",          icon: "📚", description: "Community roots. Trusted but often underestimated.", stat: "Integrity +6 · Charisma +5" },
  { name: "Military Officer", icon: "🎖️", description: "Discipline and duty. Popular in the shires.", stat: "Integrity +7 · Charisma +6" },
  { name: "Journalist",       icon: "🗞️", description: "Knows the media game. Controversial past.", stat: "Charisma +8 · Media Profile +15" },
  { name: "Activist",         icon: "📣", description: "Principled outsider with grassroots credibility.", stat: "Integrity +9 · Charisma +7" },
  { name: "Business Owner",   icon: "💼", description: "Self-made pragmatist. Economic competence claimed.", stat: "Ambition +8 · Intelligence +6" },
];

const PARTIES: Party[] = [
  "Labour", "Conservative", "Liberal Democrat", "SNP", "Green", "Reform UK", "Independent",
];

interface Props {
  constituency: string;
  scenario: GeneratedScenario;
  onComplete: (name: string, party: Party, background: Background) => void;
}

export function CharacterSetup({ constituency, scenario, onComplete }: Props) {
  const [name, setName] = useState("");
  const [party, setParty] = useState<Party | null>(null);
  const [background, setBackground] = useState<Background | null>(null);
  const [step, setStep] = useState<"identity" | "party" | "background">("identity");

  const govParty = scenario.governmentParty;

  const getPartyContext = (p: Party) => {
    if (p === govParty) return { label: "In Government", colour: "text-green-400", icon: <Crown className="h-3 w-3" /> };
    const result = scenario.results?.[p];
    if (result && result.seats >= 100) return { label: "Official Opposition", colour: "text-blue-400", icon: <Building2 className="h-3 w-3" /> };
    if (p === "Independent") return { label: "Cross-bench", colour: "text-slate-400", icon: null };
    return { label: "Minor Party", colour: "text-slate-500", icon: null };
  };

  const canProceedIdentity = name.trim().length >= 2;
  const canProceedParty = !!party;
  const canProceedBackground = !!background;

  const handleStart = () => {
    if (name.trim() && party && background) {
      onComplete(name.trim(), party, background);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050a14] flex flex-col items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-primary/70 font-bold tracking-widest uppercase">
            <MapPin className="h-3.5 w-3.5" />
            {constituency}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {step === "identity" ? "Who are you?" : step === "party" ? "Your party allegiance" : "Your background"}
          </h1>
          <p className="text-slate-400 text-sm">
            {step === "identity" && "Give your MP a name."}
            {step === "party" && `The ${govParty} currently holds power. Choose your allegiance.`}
            {step === "background" && "Your career before Westminster shapes your starting stats."}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          {(["identity", "party", "background"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all",
                step === s ? "bg-primary text-black border-primary" :
                (["identity", "party", "background"].indexOf(step) > i) ? "bg-primary/20 text-primary border-primary/40" :
                "border-white/15 text-slate-600"
              )}>
                {i + 1}
              </div>
              {i < 2 && <div className="h-px w-8 bg-white/10" />}
            </div>
          ))}
        </div>

        {/* ── Step: Identity ── */}
        {step === "identity" && (
          <div className="w-full glass-panel rounded-xl p-6 space-y-5 animate-fade-in">
            <label className="block space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Thornton"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && canProceedIdentity && setStep("party")}
                autoFocus
              />
            </label>
            <button
              onClick={() => setStep("party")}
              disabled={!canProceedIdentity}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next: Choose Your Party
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Step: Party ── */}
        {step === "party" && (
          <div className="w-full space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PARTIES.map((p) => {
                const ctx = getPartyContext(p);
                const seats = scenario.results?.[p]?.seats ?? 0;
                const isSelected = party === p;

                return (
                  <button
                    key={p}
                    onClick={() => setParty(p)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getPartyColour(p) }} />
                      <span className="text-sm font-bold text-white">{p}</span>
                      <div className={cn("flex items-center gap-1 text-[10px] font-semibold ml-auto", ctx.colour)}>
                        {ctx.icon}
                        {ctx.label}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 tabular-nums">
                      {seats > 0 ? `${seats} seats` : "No Westminster seats"}
                    </div>
                    {p === govParty && (
                      <div className="text-[10px] text-green-400 mt-1">Start as government backbencher</div>
                    )}
                    {p !== govParty && seats >= 80 && (
                      <div className="text-[10px] text-blue-400 mt-1">Start in official opposition</div>
                    )}
                    {seats < 10 && p !== "Independent" && (
                      <div className="text-[10px] text-yellow-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Hard mode — tiny parliamentary group
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("identity")}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-400 text-sm hover:border-white/20 hover:text-white transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep("background")}
                disabled={!canProceedParty}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-bold py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
              >
                Next: Background
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Background ── */}
        {step === "background" && (
          <div className="w-full space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => setBackground(bg.name)}
                  className={cn(
                    "text-left p-3 rounded-xl border-2 transition-all flex flex-col gap-1",
                    background === bg.name
                      ? "border-primary bg-primary/10"
                      : "border-white/8 bg-white/[0.02] hover:border-white/20"
                  )}
                >
                  <div className="text-xl">{bg.icon}</div>
                  <div className="text-xs font-bold text-white leading-tight">{bg.name}</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">{bg.description}</div>
                  <div className="text-[10px] text-primary/80 font-medium mt-1">{bg.stat}</div>
                </button>
              ))}
            </div>

            {/* Summary bar */}
            {background && (
              <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <div className="text-slate-500 uppercase tracking-wide text-[10px]">Name</div>
                  <div className="text-white font-semibold mt-0.5">{name}</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-slate-500 uppercase tracking-wide text-[10px]">Party</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: party ? getPartyColour(party) : "#888" }} />
                    <span className="text-white font-semibold">{party}</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-slate-500 uppercase tracking-wide text-[10px]">Background</div>
                  <div className="text-white font-semibold mt-0.5">{background}</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-slate-500 uppercase tracking-wide text-[10px]">Seat</div>
                  <div className="text-white font-semibold mt-0.5 max-w-[120px] truncate">{constituency}</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("party")}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-400 text-sm hover:border-white/20 hover:text-white transition-all"
              >
                Back
              </button>
              <button
                onClick={handleStart}
                disabled={!canProceedBackground}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-black py-3 rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Zap className="h-4 w-4" />
                Begin Your Career
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
