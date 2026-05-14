"use client";

import { MapPin, Users, Heart, Home, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/store/useGameStore";
import { getStatColour, cn } from "@/lib/utils";

const ISSUES = [
  { key: "nhs", label: "NHS & Health", baseScore: 35, deltaFn: (w: { nhsWaitTimesWeeks: number }) => Math.max(0, 100 - w.nhsWaitTimesWeeks * 3) },
  { key: "housing", label: "Housing", baseScore: 42 },
  { key: "crime", label: "Crime & Safety", baseScore: 55, deltaFn: (w: { crimeIndex: number }) => 100 - w.crimeIndex },
  { key: "jobs", label: "Jobs & Economy", baseScore: 48, deltaFn: (w: { unemployment: number }) => Math.max(0, 100 - w.unemployment * 10) },
  { key: "schools", label: "Schools", baseScore: 62, deltaFn: (w: { schoolRating: number }) => w.schoolRating },
  { key: "transport", label: "Transport", baseScore: 40 },
];

export default function ConstituencyPage() {
  const { player, worldState } = useGameStore();

  if (!player) return null;

  const issueScores = ISSUES.map((issue) => ({
    ...issue,
    score: issue.deltaFn
      ? Math.round(issue.deltaFn(worldState as never))
      : issue.baseScore,
  }));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Constituency</h1>
          <p className="text-sm text-muted-foreground">
            <MapPin className="inline h-3.5 w-3.5 mr-1" />
            {player.constituency}
          </p>
        </div>
        <Badge
          variant={player.localApproval >= 50 ? "success" : "destructive"}
          className="text-sm px-3"
        >
          {player.localApproval}% Local Approval
        </Badge>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Local Approval", value: player.localApproval, unit: "%", icon: <Heart className="h-4 w-4 text-red-400" />, colour: getStatColour(player.localApproval) },
          { label: "Majority", value: 4821, unit: "votes", icon: <Users className="h-4 w-4 text-blue-400" />, colour: "text-foreground" },
          { label: "Surgeries Held", value: 0, unit: "", icon: <Home className="h-4 w-4 text-green-400" />, colour: "text-foreground" },
          { label: "Casework", value: 14, unit: "open", icon: <TrendingUp className="h-4 w-4 text-yellow-400" />, colour: "text-yellow-400" },
        ].map(({ label, value, unit, icon, colour }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-secondary/60 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div>
                <div className={cn("text-xl font-bold tabular-nums", colour)}>
                  {value.toLocaleString()}{unit && <span className="text-sm font-normal ml-1 text-muted-foreground">{unit}</span>}
                </div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Local issues */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Constituency Satisfaction by Issue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {issueScores.map(({ key, label, score }) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-semibold", getStatColour(score))}>{score}%</span>
              </div>
              <Progress
                value={score}
                className="h-2"
                indicatorClassName={
                  score >= 70 ? "bg-green-400" : score >= 50 ? "bg-yellow-400" : score >= 30 ? "bg-orange-400" : "bg-red-400"
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent casework */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Casework</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { issue: "Planning permission refused — local family extension", status: "open", priority: "low" },
              { issue: "Neighbour dispute — noise complaint Elm Street", status: "open", priority: "low" },
              { issue: "Benefit sanctions — single parent, 2 children", status: "open", priority: "high" },
              { issue: "School exclusion appeal — Year 9 student", status: "resolved", priority: "medium" },
              { issue: "Pothole reporting — Church Lane", status: "resolved", priority: "low" },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={cn(
                  "mt-1 h-2 w-2 rounded-full shrink-0",
                  c.status === "resolved" ? "bg-green-400" : c.priority === "high" ? "bg-red-400" : "bg-yellow-400"
                )} />
                <div className="flex-1">
                  <p className="text-foreground/90">{c.issue}</p>
                  <div className="flex gap-2 mt-0.5">
                    <Badge variant={c.status === "resolved" ? "success" : "warning"} className="text-[10px] px-1.5 py-0">
                      {c.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {c.priority} priority
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
