"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, SkipForward } from "lucide-react";
import { UKMap } from "./UKMap";
import { getPartyColour } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { GeneratedScenario, Party } from "@/lib/store/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type CinematicPhase =
  | "title"       // "GENERAL ELECTION 20XX"
  | "bars"        // Animated vote / seat bars
  | "map"         // UK map colouring in
  | "headlines"   // Fading AI headlines
  | "done";

const PHASE_DURATIONS: Record<CinematicPhase, number> = {
  title: 2800,
  bars: 4500,
  map: 3500,
  headlines: 0,   // driven by headline count
  done: 0,
};

// ─── Vote bars component ──────────────────────────────────────────────────────

function VoteBars({ scenario, progress }: { scenario: GeneratedScenario; progress: number }) {
  const entries = Object.entries(scenario.results ?? {})
    .filter(([, r]) => r && r.seats > 0)
    .sort(([, a], [, b]) => (b?.seats ?? 0) - (a?.seats ?? 0)) as [Party, { seats: number; votesPct: number; swing: string }][];

  const maxSeats = Math.max(...entries.map(([, r]) => r.seats));
  const totalSeats = entries.reduce((s, [, r]) => s + r.seats, 0);

  return (
    <div className="w-full max-w-xl space-y-3">
      {/* Majority line indicator */}
      <div className="relative flex items-center gap-3 text-xs text-slate-500 mb-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="shrink-0">MAJORITY: 326 SEATS</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {entries.map(([party, result]) => {
        const animatedSeats = Math.round(result.seats * progress);
        const barWidthPct = (result.seats / totalSeats) * 100 * progress;
        const colour = getPartyColour(party as Party);
        const isWinner = party === scenario.governmentParty;
        const swing = result.swing;
        const swingUp = swing.startsWith("+");

        return (
          <div key={party} className="flex items-center gap-3 group">
            {/* Party name */}
            <div className="w-32 text-right shrink-0">
              <div className={cn("text-xs font-semibold", isWinner ? "text-white" : "text-slate-400")}>
                {party}
              </div>
            </div>

            {/* Bar */}
            <div className="flex-1 relative h-8 bg-white/5 rounded overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded transition-all duration-100"
                style={{
                  width: `${barWidthPct}%`,
                  backgroundColor: colour,
                  opacity: isWinner ? 0.9 : 0.65,
                  boxShadow: isWinner ? `0 0 16px ${colour}55` : "none",
                }}
              />
              {/* Majority threshold line */}
              <div
                className="absolute top-0 h-full w-px bg-white/20"
                style={{ left: `${(326 / totalSeats) * 100}%` }}
              />
            </div>

            {/* Stats */}
            <div className="w-24 shrink-0 text-right">
              <div className={cn("text-base font-black tabular-nums", isWinner ? "text-white" : "text-slate-300")}>
                {animatedSeats}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                <span>{result.votesPct.toFixed(1)}%</span>
                <span className={swingUp ? "text-green-400" : "text-red-400"}>
                  {swing}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Headline Fader ───────────────────────────────────────────────────────────

function HeadlineFader({
  headlines,
  keyFacts,
  onDone,
}: {
  headlines: string[];
  keyFacts: string[];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const all = [...headlines, ...keyFacts.map((f) => `📊 ${f}`)];
  const doneCalledRef = useRef(false);

  useEffect(() => {
    if (all.length === 0) { onDone(); return; }

    const show = 2800;
    const fade = 500;

    const timeout = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        const next = index + 1;
        if (next >= all.length) {
          if (!doneCalledRef.current) {
            doneCalledRef.current = true;
            onDone();
          }
          return;
        }
        setIndex(next);
        setOpacity(1);
      }, fade);
    }, show);

    return () => clearTimeout(timeout);
  }, [index, all.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const isKeyFact = all[index]?.startsWith("📊");

  return (
    <div
      className="transition-opacity duration-500 text-center max-w-2xl px-6"
      style={{ opacity }}
    >
      <div className={cn(
        "font-bold leading-snug",
        isKeyFact ? "text-xl text-primary" : "text-2xl md:text-3xl text-white"
      )}>
        {all[index]}
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {all.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-primary" : i < index ? "w-2 bg-primary/30" : "w-2 bg-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  scenario: GeneratedScenario;
  onComplete: () => void;
}

export function CinematicIntro({ scenario, onComplete }: Props) {
  const [phase, setPhase] = useState<CinematicPhase>("title");
  const [barProgress, setBarProgress] = useState(0);
  const [mapVisible, setMapVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);

  // Fade in title
  useEffect(() => {
    const t = setTimeout(() => setTitleVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Phase sequencer
  useEffect(() => {
    if (phase === "title") {
      const t = setTimeout(() => setPhase("bars"), PHASE_DURATIONS.title);
      return () => clearTimeout(t);
    }
    if (phase === "bars") {
      // Animate bars via rAF
      const startTime = Date.now();
      const duration = 2800;
      let raf: number;
      const animate = () => {
        const p = Math.min((Date.now() - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setBarProgress(eased);
        if (p < 1) {
          raf = requestAnimationFrame(animate);
        } else {
          setTimeout(() => setPhase("map"), 800);
        }
      };
      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
    }
    if (phase === "map") {
      const t = setTimeout(() => setMapVisible(true), 200);
      const t2 = setTimeout(() => setPhase("headlines"), PHASE_DURATIONS.map);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [phase]);

  const winnerColour = getPartyColour(scenario.governmentParty);

  return (
    <div className="relative min-h-screen bg-[#050a14] flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-all duration-2000"
        style={{ background: `${winnerColour}18` }}
      />

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded border border-white/5 hover:border-white/15"
      >
        Skip intro
        <SkipForward className="h-3.5 w-3.5" />
      </button>

      {/* ── TITLE PHASE ── */}
      {phase === "title" && (
        <div
          className="flex flex-col items-center gap-6 text-center transition-opacity duration-700"
          style={{ opacity: titleVisible ? 1 : 0 }}
        >
          <div className="text-xs font-bold text-slate-500 tracking-[0.5em] uppercase">
            BBC Election Night — {scenario.electionYear}
          </div>
          <div
            className="text-6xl md:text-8xl font-black tracking-tighter leading-none"
            style={{ color: winnerColour, textShadow: `0 0 80px ${winnerColour}55` }}
          >
            GENERAL
            <br />
            ELECTION
          </div>
          <div className="text-4xl font-black text-white tabular-nums">{scenario.electionYear}</div>
          <div className="text-slate-400 text-lg max-w-md leading-relaxed mt-2">
            {scenario.electionHeadline}
          </div>
        </div>
      )}

      {/* ── BARS PHASE ── */}
      {phase === "bars" && (
        <div className="flex flex-col items-center gap-8 w-full px-6 animate-fade-in">
          <div className="text-center">
            <div className="text-xs text-slate-500 tracking-[0.4em] uppercase mb-2">Results Declared</div>
            <h2 className="text-2xl font-black text-white">
              <span style={{ color: winnerColour }}>{scenario.governmentParty}</span> wins
              {scenario.majoritySize > 0
                ? ` — majority of ${scenario.majoritySize}`
                : " — minority government"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">New Prime Minister: {scenario.primeMinister}</p>
          </div>
          <VoteBars scenario={scenario} progress={barProgress} />
        </div>
      )}

      {/* ── MAP PHASE ── */}
      {phase === "map" && (
        <div
          className="flex flex-col md:flex-row items-center gap-10 px-6 animate-fade-in transition-opacity duration-700"
          style={{ opacity: mapVisible ? 1 : 0 }}
        >
          {/* Map */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-20"
              style={{ background: winnerColour }}
            />
            <UKMap
              regionalResults={scenario.regionalResults as Record<string, any>}
              showLabels
              width={220}
            />
          </div>

          {/* Legend + context */}
          <div className="max-w-sm space-y-5">
            <div>
              <div className="text-xs text-slate-500 tracking-widest uppercase mb-1">Seat distribution</div>
              <h2 className="text-xl font-bold text-white">{scenario.electionHeadline}</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{scenario.politicalContext}</p>
            </div>

            {/* Party legend */}
            <div className="space-y-1.5">
              {Object.entries(scenario.results ?? {})
                .filter(([, r]) => r && r.seats > 0)
                .sort(([, a], [, b]) => (b?.seats ?? 0) - (a?.seats ?? 0))
                .map(([party, result]) => (
                  <div key={party} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: getPartyColour(party as Party) }}
                    />
                    <span className="text-slate-300 flex-1">{party}</span>
                    <span className="text-slate-400 font-semibold tabular-nums">{result?.seats} seats</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HEADLINES PHASE ── */}
      {phase === "headlines" && (
        <div className="flex flex-col items-center gap-10 animate-fade-in">
          <div className="text-xs text-slate-500 tracking-[0.4em] uppercase">The morning after</div>
          <HeadlineFader
            headlines={scenario.headlines}
            keyFacts={scenario.keyFacts}
            onDone={onComplete}
          />

          <button
            onClick={onComplete}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-4"
          >
            Continue to Westminster
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
