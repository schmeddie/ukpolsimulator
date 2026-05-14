"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Users, Calendar, ChevronRight, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/store/useGameStore";
import { formatGameDate, getStatColour, getPartyColour } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Header() {
  const { player, worldState, advanceTurn, settings } = useGameStore();
  const router = useRouter();

  if (!player) return null;

  const approvalColour = getStatColour(player.approvalRating);
  const unityColour = getStatColour(worldState.partyUnity);

  const urgentScandalCount = player.scandals.filter((s) => !s.resolved).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-sm px-4">
      {/* Date */}
      <div className="flex items-center gap-2 min-w-0">
        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium text-foreground">{formatGameDate(worldState.currentDate)}</span>
        <Badge variant="outline" className="text-[10px] hidden sm:flex">
          {worldState.nextElectionDays}d to election
        </Badge>
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Approval */}
      <div className="flex items-center gap-1.5">
        {player.approvalRating >= 50 ? (
          <TrendingUp className="h-3.5 w-3.5 text-green-400" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
        )}
        <span className="text-xs text-muted-foreground hidden sm:inline">Approval</span>
        <span className={cn("text-sm font-bold tabular-nums", approvalColour)}>
          {player.approvalRating}%
        </span>
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Party Unity */}
      <div className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground hidden sm:inline">Unity</span>
        <span className={cn("text-sm font-bold tabular-nums", unityColour)}>
          {Math.round(worldState.partyUnity)}%
        </span>
      </div>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Party */}
      <div className="hidden sm:flex items-center gap-1.5">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: getPartyColour(player.party) }}
        />
        <span className="text-xs text-muted-foreground">{player.party}</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
        <span className="text-xs font-medium text-foreground">{player.role}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Scandal Warning */}
      {urgentScandalCount > 0 && (
        <button
          onClick={() => router.push("/game/dashboard")}
          className="flex items-center gap-1.5 rounded-md bg-orange-500/10 border border-orange-500/30 px-2 py-1 text-xs text-orange-400 hover:bg-orange-500/20 transition-colors"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {urgentScandalCount} scandal{urgentScandalCount > 1 ? "s" : ""}
        </button>
      )}

      {/* AI Status */}
      {settings.ai.enabled && (
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-primary">
          <Zap className="h-3 w-3" />
          <span>AI Active</span>
        </div>
      )}

      {/* Continue Button */}
      <Button
        variant="default"
        size="sm"
        onClick={() => advanceTurn(7)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 px-4"
      >
        Continue
        <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </header>
  );
}
