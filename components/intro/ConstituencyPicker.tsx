"use client";

import { useState } from "react";
import { MapPin, ChevronRight, Search, X, ArrowLeft } from "lucide-react";
import { UKMap, REGION_ID_TO_NAME } from "./UKMap";
import { CONSTITUENCIES_BY_REGION } from "@/lib/gameData";
import { getPartyColour } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { GeneratedScenario, Party } from "@/lib/store/types";

interface Props {
  scenario: GeneratedScenario;
  onSelect: (constituency: string) => void;
}

export function ConstituencyPicker({ scenario, onSelect }: Props) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [chosen, setChosen] = useState<string | null>(null);

  const regionName = selectedRegionId ? REGION_ID_TO_NAME[selectedRegionId] : null;
  const constituencies = regionName ? (CONSTITUENCIES_BY_REGION[regionName] ?? []) : [];

  const filtered = constituencies.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const winnerParty = regionName
    ? (scenario.regionalResults?.[regionName] as Party | undefined)
    : undefined;

  const handleConfirm = () => {
    if (chosen) onSelect(chosen);
  };

  return (
    <div className="relative min-h-screen bg-[#050a14] flex flex-col items-center justify-center overflow-hidden px-4 py-8">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-primary/70 tracking-[0.4em] uppercase">
            Character Creation
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Where will you serve?
          </h1>
          <p className="text-slate-400 text-sm max-w-md">
            Click a region on the map, then select your constituency.
            Your local base shapes your career.
          </p>
        </div>

        {/* Main layout: map + panel side by side on large screens */}
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start justify-center">

          {/* ── UK Map ── */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {/* Hover tooltip */}
              {hoveredRegionId && !selectedRegionId && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white pointer-events-none">
                  {REGION_ID_TO_NAME[hoveredRegionId]}
                </div>
              )}
              <UKMap
                regionalResults={scenario.regionalResults as Record<string, any>}
                highlighted={hoveredRegionId}
                selected={selectedRegionId}
                onRegionClick={(id) => {
                  setSelectedRegionId(id);
                  setSearch("");
                  setChosen(null);
                }}
                showLabels
                width={260}
              />
            </div>

            {/* Party legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
              {Object.entries(scenario.results ?? {})
                .filter(([, r]) => (r?.seats ?? 0) > 0)
                .sort(([, a], [, b]) => (b?.seats ?? 0) - (a?.seats ?? 0))
                .slice(0, 6)
                .map(([party]) => (
                  <div key={party} className="flex items-center gap-1.5 text-slate-400">
                    <div
                      className="h-2 w-2 rounded-sm shrink-0"
                      style={{ backgroundColor: getPartyColour(party as Party) }}
                    />
                    <span className="truncate">{party}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* ── Constituency Panel ── */}
          <div className="flex-1 max-w-md w-full">
            {!selectedRegionId ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center glass-panel rounded-xl p-6">
                <MapPin className="h-8 w-8 text-primary/40" />
                <div>
                  <p className="text-slate-300 font-medium">Select a region</p>
                  <p className="text-slate-500 text-sm mt-1">Click any area on the map to see constituencies</p>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: "520px" }}>
                {/* Panel header */}
                <div className="p-4 border-b border-white/8 flex items-center gap-3">
                  <button
                    onClick={() => { setSelectedRegionId(null); setChosen(null); }}
                    className="text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{regionName}</div>
                    {winnerParty && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: getPartyColour(winnerParty) }}
                        />
                        Won by {winnerParty}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{constituencies.length} seats</span>
                </div>

                {/* Search */}
                <div className="px-3 py-2 border-b border-white/5">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search constituencies…"
                      className="w-full bg-black/30 border border-white/8 rounded-md pl-8 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/40"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-500">No constituencies match.</div>
                  ) : (
                    filtered.map((c) => (
                      <button
                        key={c}
                        onClick={() => setChosen(c)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-xs border-b border-white/5 transition-all flex items-center gap-2",
                          chosen === c
                            ? "bg-primary/15 text-primary border-l-2 border-l-primary"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <MapPin className="h-3 w-3 shrink-0 opacity-50" />
                        <span className="flex-1">{c}</span>
                        {chosen === c && <ChevronRight className="h-3 w-3 text-primary" />}
                      </button>
                    ))
                  )}
                </div>

                {/* Confirm */}
                {chosen && (
                  <div className="p-3 border-t border-white/8 bg-black/20">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Selected</div>
                        <div className="text-xs font-semibold text-white truncate">{chosen}</div>
                      </div>
                      <button
                        onClick={handleConfirm}
                        className="flex items-center gap-2 bg-primary text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                      >
                        Confirm
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
