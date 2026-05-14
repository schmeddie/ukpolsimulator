"use client";

import { useMemo } from "react";
import {
  TrendingUp, TrendingDown, Users, Banknote, Heart, Home,
  AlertTriangle, Award, Star, Flame, Calendar, Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatCard } from "@/components/game/StatCard";
import { MiniChart } from "@/components/game/MiniChart";
import { useGameStore } from "@/lib/store/useGameStore";
import {
  formatGameDate, getStatColour, getMoodLabel, sentimentColour,
  sentimentDot, getPartyColour, formatShortDate, truncate,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

function buildSparkData(base: number, count = 8): Array<{ label: string; value: number }> {
  const data = [];
  let v = base;
  for (let i = 0; i < count; i++) {
    v = Math.max(0, Math.min(100, v + (Math.random() - 0.5) * 6));
    data.push({ label: `T-${count - i}`, value: v });
  }
  return data;
}

export default function DashboardPage() {
  const { player, worldState, news, inbox, calendar, policies, npcs } = useGameStore();

  const approvalSpark = useMemo(() => buildSparkData(player?.approvalRating ?? 40), []);
  const unitySpark = useMemo(() => buildSparkData(worldState.partyUnity), []);

  if (!player) return null;

  const unreadEmails = inbox.filter((e) => !e.read).length;
  const upcomingEvents = calendar
    .filter((e) => !e.attended)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const recentNews = news.slice(0, 6);
  const passedPolicies = policies.filter((p) => p.status === "passed").length;
  const failedPolicies = policies.filter((p) => p.status === "failed").length;

  const cabinetMinistersKnown = npcs.filter((n) => n.isInCabinet).slice(0, 6);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{formatGameDate(worldState.currentDate)}</p>
        </div>
        {unreadEmails > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-1.5 text-sm text-destructive">
            <Mail className="h-4 w-4" />
            {unreadEmails} unread email{unreadEmails > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="National Approval"
          value={player.approvalRating}
          unit="%"
          trend={player.approvalRating >= 45 ? "up" : "down"}
          trendValue={player.approvalRating >= 45 ? "Rising" : "Falling"}
          colourClass={getStatColour(player.approvalRating)}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label="Local Approval"
          value={player.localApproval}
          unit="%"
          trend={player.localApproval >= 50 ? "up" : "down"}
          trendValue={`${player.constituency.split("&")[0].trim()}`}
          colourClass={getStatColour(player.localApproval)}
          icon={<Home className="h-4 w-4 text-blue-400" />}
        />
        <StatCard
          label="Party Unity"
          value={Math.round(worldState.partyUnity)}
          unit="%"
          trend={worldState.partyUnity >= 60 ? "up" : "down"}
          trendValue={`${player.party}`}
          colourClass={getStatColour(worldState.partyUnity)}
          icon={<Users className="h-4 w-4 text-purple-400" />}
        />
        <StatCard
          label="Days to Election"
          value={worldState.nextElectionDays}
          unit="days"
          trend="flat"
          trendValue={`${worldState.electionYear} GE`}
          icon={<Calendar className="h-4 w-4 text-yellow-400" />}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player stats */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Charisma", value: player.charisma, colour: "bg-blue-400" },
              { label: "Intelligence", value: player.intelligence, colour: "bg-purple-400" },
              { label: "Integrity", value: player.integrity, colour: "bg-green-400" },
              { label: "Ambition", value: player.ambition, colour: "bg-orange-400" },
              { label: "Party Loyalty", value: player.partyLoyaltyScore, colour: "bg-pink-400" },
              { label: "Media Profile", value: player.mediaProfile, colour: "bg-yellow-400" },
            ].map(({ label, value, colour }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-semibold", getStatColour(value))}>{value}</span>
                </div>
                <Progress
                  value={value}
                  className="h-1.5"
                  indicatorClassName={colour}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* World indicators */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Banknote className="h-4 w-4 text-green-400" />
              Economic Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Inflation", value: `${worldState.inflation}%`, trend: worldState.inflation > 3 ? "bad" : "good" },
              { label: "GDP Growth", value: `${worldState.gdpGrowth}%`, trend: worldState.gdpGrowth > 0 ? "good" : "bad" },
              { label: "Unemployment", value: `${worldState.unemployment}%`, trend: worldState.unemployment > 5 ? "bad" : "good" },
              { label: "NHS Wait", value: `${worldState.nhsWaitTimesWeeks} wks`, trend: worldState.nhsWaitTimesWeeks > 18 ? "bad" : "good" },
              { label: "Public Mood", value: getMoodLabel(worldState.publicMood), trend: worldState.publicMood > 0 ? "good" : "bad" },
            ].map(({ label, value, trend }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-semibold", trend === "good" ? "text-green-400" : "text-red-400")}>
                  {value}
                </span>
              </div>
            ))}

            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Party Polls</p>
              <div className="space-y-1.5">
                {Object.entries(worldState.polls)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([p, pct]) => (
                    <div key={p} className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${pct * 1.5}px`,
                          backgroundColor: getPartyColour(p as any),
                          minWidth: "4px",
                        }}
                      />
                      <span className="text-[11px] text-muted-foreground flex-1 truncate">{p}</span>
                      <span className="text-[11px] font-semibold text-foreground">{pct}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval trend + calendar */}
        <div className="space-y-4">
          {/* Approval mini chart */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm">Approval Trend</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <MiniChart data={approvalSpark} colour="#22c55e" height={70} />
            </CardContent>
          </Card>

          {/* Unity mini chart */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm">Party Unity Trend</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <MiniChart data={unitySpark} colour="#a78bfa" height={70} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent news */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              Recent Headlines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {recentNews.map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/20 transition-colors">
                  <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", sentimentDot(item.sentiment))} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", sentimentColour(item.sentiment))}>
                      {item.headline}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.source} · {formatShortDate(item.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming events + scandal/achievements */}
        <div className="space-y-4">
          {/* Upcoming calendar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {upcomingEvents.length === 0 && (
                <p className="text-xs text-muted-foreground">No upcoming events.</p>
              )}
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {event.mandatory && <div className="h-2 w-2 rounded-full bg-red-400" />}
                    {!event.mandatory && <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground">{formatShortDate(event.date)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Scandals */}
          {player.scandals.length > 0 && (
            <Card className="border-orange-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-400">
                  <AlertTriangle className="h-4 w-4" />
                  Active Scandals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {player.scandals.filter((s) => !s.resolved).map((s) => (
                  <div key={s.id} className="text-xs text-orange-300/80">
                    {"★".repeat(s.severity)} {s.description}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Policy summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                Policy Record
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 pt-0">
              {[
                { label: "Passed", value: passedPolicies, colour: "text-green-400" },
                { label: "Failed", value: failedPolicies, colour: "text-red-400" },
                { label: "Draft", value: policies.filter((p) => p.status === "draft").length, colour: "text-yellow-400" },
              ].map(({ label, value, colour }) => (
                <div key={label} className="text-center">
                  <div className={cn("text-2xl font-bold tabular-nums", colour)}>{value}</div>
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cabinet Overview */}
      {cabinetMinistersKnown.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              Key Cabinet Ministers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-border/30">
              {cabinetMinistersKnown.map((npc) => (
                <div key={npc.id} className="p-3 hover:bg-secondary/20 transition-colors">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-2"
                    style={{ backgroundColor: getPartyColour(npc.party) }}
                  >
                    {npc.name.charAt(0)}
                  </div>
                  <div className="text-xs font-semibold text-foreground truncate">{npc.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate" title={npc.ministerialRole}>
                    {truncate(npc.ministerialRole ?? npc.role, 24)}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1">
                    <div
                      className={cn(
                        "text-[10px] font-medium",
                        npc.loyaltyToPlayer > 20 ? "text-green-400" : npc.loyaltyToPlayer < -20 ? "text-red-400" : "text-muted-foreground"
                      )}
                    >
                      {npc.loyaltyToPlayer > 20 ? "Ally" : npc.loyaltyToPlayer < -20 ? "Rival" : "Neutral"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
