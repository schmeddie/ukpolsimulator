"use client";

import { Building2, Vote, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/store/useGameStore";
import { getPartyColour, cn } from "@/lib/utils";
import type { Party } from "@/lib/store/types";

const SEATS: Record<Party, number> = {
  Conservative: 262,
  Labour: 215,
  "Liberal Democrat": 72,
  SNP: 43,
  Green: 4,
  "Reform UK": 5,
  Independent: 9,
};

export default function ParliamentPage() {
  const { worldState, npcs, player } = useGameStore();

  const pollEntries = Object.entries(worldState.polls).sort(([, a], [, b]) => b - a);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Parliament</h1>
        <p className="text-sm text-muted-foreground">Current Commons composition and voting projections.</p>
      </div>

      {/* Parliament visualisation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4 text-yellow-400" />
            House of Commons — Seat Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Hemicycle bars */}
          <div className="space-y-3">
            {Object.entries(SEATS)
              .sort(([, a], [, b]) => b - a)
              .map(([party, seats]) => (
                <div key={party} className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getPartyColour(party as Party) }}
                  />
                  <div className="w-32 text-xs text-muted-foreground shrink-0 truncate">{party}</div>
                  <div className="flex-1 bg-secondary/50 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(seats / 650) * 100}%`,
                        backgroundColor: getPartyColour(party as Party),
                      }}
                    />
                  </div>
                  <div className="w-12 text-xs font-semibold text-right text-foreground shrink-0">{seats}</div>
                  <div className="w-10 text-[10px] text-muted-foreground shrink-0">
                    {((seats / 650) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total seats: 650</span>
            <span className="text-muted-foreground">Majority: 326</span>
            <Badge variant={SEATS.Conservative >= 326 ? "success" : "destructive"}>
              Government: {SEATS.Conservative >= 326 ? "Majority" : "Minority"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Opinion polls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Current Opinion Polls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {pollEntries.map(([party, pct]) => (
              <div key={party} className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: getPartyColour(party as Party) }}
                />
                <div className="w-36 text-xs text-foreground shrink-0">{party}</div>
                <div className="flex-1 bg-secondary/40 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct * 2}%`,
                      backgroundColor: getPartyColour(party as Party),
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div className="w-10 text-xs font-bold text-right shrink-0"
                  style={{ color: getPartyColour(party as Party) }}>
                  {pct}%
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">Source: Composite poll average</p>
        </CardContent>
      </Card>

      {/* Vote history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Vote className="h-4 w-4 text-purple-400" />
            Voting Chamber Atmosphere
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Government Majority", value: `${Math.max(0, SEATS.Conservative - 326)}`, sub: "seats over threshold", colour: SEATS.Conservative >= 326 ? "text-green-400" : "text-red-400" },
              { label: "Opposition Strength", value: `${650 - SEATS.Conservative}`, sub: "combined opposition", colour: "text-blue-400" },
              { label: "Crossbench", value: `${SEATS.Independent + SEATS["Liberal Democrat"]}`, sub: "potential swing votes", colour: "text-yellow-400" },
              { label: "Party Unity", value: `${Math.round(worldState.partyUnity)}%`, sub: "governing party", colour: cn(worldState.partyUnity >= 60 ? "text-green-400" : "text-orange-400") },
            ].map(({ label, value, sub, colour }) => (
              <div key={label} className="text-center p-3 rounded-lg bg-secondary/30">
                <div className={cn("text-2xl font-bold tabular-nums", colour)}>{value}</div>
                <div className="text-xs font-medium text-foreground mt-1">{label}</div>
                <div className="text-[10px] text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
