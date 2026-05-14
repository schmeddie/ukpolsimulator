"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, ChevronRight, Zap, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/store/useGameStore";
import { CONSTITUENCIES } from "@/lib/gameData";
import { getPartyColour } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Party, Background } from "@/lib/store/types";

const PARTIES: Array<{ name: Party; description: string; buffs: string[]; debuffs: string[] }> = [
  {
    name: "Labour",
    description: "Centre-left. Strong in urban areas. Union support. Focus: NHS, workers rights.",
    buffs: ["NHS popularity +8", "Trade Union backing"],
    debuffs: ["City/business trust -6", "Economic credibility challenge"],
  },
  {
    name: "Conservative",
    description: "Centre-right. Incumbent party. Establishment connections. Focus: Economy, defence.",
    buffs: ["Business network +8", "Media establishment"],
    debuffs: ["Post-scandal fatigue -10", "Youth vote deficit"],
  },
  {
    name: "Liberal Democrat",
    description: "Centrist. Pro-EU. Strong in leafy suburbs. Focus: Civil liberties, federalism.",
    buffs: ["Tactical vote magnet", "Educated vote base +6"],
    debuffs: ["Coalition baggage -8", "Identity squeeze"],
  },
  {
    name: "SNP",
    description: "Scottish nationalist. Pro-independence. Left-leaning. Scottish seats only.",
    buffs: ["Scottish mandate +12", "Clear identity"],
    debuffs: ["Limited to Scotland", "Independence fatigue"],
  },
  {
    name: "Green",
    description: "Left-green. Environmental priority. Growing urban base. Principled outsider.",
    buffs: ["Youth engagement +10", "Media attention"],
    debuffs: ["Economic credibility -8", "Small parliamentary group"],
  },
  {
    name: "Reform UK",
    description: "Right-populist. Anti-establishment. Growing threat. Culture war focus.",
    buffs: ["Protest vote energy +10", "Media controversy"],
    debuffs: ["Establishment hostility -12", "Coalition impossible"],
  },
];

const BACKGROUNDS: Array<{ name: Background; description: string; stat: string }> = [
  { name: "Trade Unionist", description: "Rose through union ranks. Working class hero.", stat: "Integrity +8, Charisma +5" },
  { name: "City Banker", description: "City high-flier. Economic credentials, ethical question marks.", stat: "Intelligence +8, Ambition +8, Integrity -5" },
  { name: "Lawyer", description: "Sharp legal mind. Prepared for scrutiny and debate.", stat: "Intelligence +9, Charisma +4" },
  { name: "Teacher", description: "Community roots. Trusted but underestimated.", stat: "Integrity +6, Charisma +5" },
  { name: "Military Officer", description: "Discipline and duty. Popular in shires.", stat: "Integrity +7, Charisma +6" },
  { name: "Journalist", description: "Knows the media game. Controversial past.", stat: "Charisma +8, Media Profile +15, Integrity +2" },
  { name: "Activist", description: "Principled outsider. Grassroots credibility.", stat: "Integrity +9, Charisma +7" },
  { name: "Business Owner", description: "Self-made pragmatist. Economic competence.", stat: "Ambition +8, Intelligence +6" },
];

export default function CharacterCreation() {
  const router = useRouter();
  const { startGame, phase } = useGameStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [party, setParty] = useState<Party | null>(null);
  const [background, setBackground] = useState<Background | null>(null);
  const [constituency, setConstituency] = useState(CONSTITUENCIES[0]);

  const handleStart = () => {
    if (!name.trim() || !party || !background) return;
    startGame(name.trim(), party, background, constituency);
    router.push("/game/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/30">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Project Westminster</h1>
            <p className="text-sm text-muted-foreground">UK Politics Simulator — Your career begins here.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border transition-all",
                step >= s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground"
              )}>
                {s}
              </div>
              <span className={cn("text-sm", step >= s ? "text-foreground" : "text-muted-foreground")}>
                {s === 1 ? "Identity" : s === 2 ? "Party" : "Background"}
              </span>
              {s < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
            </div>
          ))}
        </div>

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Who are you?</h2>
              <p className="text-sm text-muted-foreground">Name your character and choose your constituency.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Sarah Thornton"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constituency">Constituency</Label>
                <select
                  id="constituency"
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CONSTITUENCIES.slice(0, 60).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="mt-4"
            >
              Next: Choose Your Party
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Party */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Which party do you represent?</h2>
              <p className="text-sm text-muted-foreground">Each party has unique advantages and disadvantages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PARTIES.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setParty(p.name)}
                  className={cn(
                    "text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                    party === p.name
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-secondary/30"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getPartyColour(p.name) }}
                    />
                    <span className="font-semibold text-foreground">{p.name}</span>
                    {party === p.name && (
                      <Badge variant="default" className="ml-auto text-[10px]">Selected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.buffs.map((b) => (
                      <span key={b} className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 rounded px-1.5 py-0.5">{b}</span>
                    ))}
                    {p.debuffs.map((d) => (
                      <span key={d} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 rounded px-1.5 py-0.5">{d}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!party}>
                Next: Choose Background
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Background */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">What is your background?</h2>
              <p className="text-sm text-muted-foreground">Your career before Westminster shapes your starting stats.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => setBackground(bg.name)}
                  className={cn(
                    "text-left p-4 rounded-lg border-2 transition-all",
                    background === bg.name
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-secondary/30 hover:border-border/80"
                  )}
                >
                  <div className="font-semibold text-sm text-foreground mb-1">{bg.name}</div>
                  <p className="text-[11px] text-muted-foreground mb-2">{bg.description}</p>
                  <div className="text-[10px] text-primary font-medium">{bg.stat}</div>
                </button>
              ))}
            </div>

            {/* Summary */}
            {background && party && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Your Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: <Crown className="h-3.5 w-3.5" />, label: "Name", value: name },
                      { icon: <Shield className="h-3.5 w-3.5" />, label: "Party", value: party },
                      { icon: <TrendingUp className="h-3.5 w-3.5" />, label: "Background", value: background },
                      { icon: <Users className="h-3.5 w-3.5" />, label: "Role", value: "Backbencher" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          {item.icon}
                          <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
                        </div>
                        <div className="text-sm font-semibold text-foreground">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button
                onClick={handleStart}
                disabled={!background || !party || !name.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                <Zap className="mr-2 h-4 w-4" />
                Begin Your Career
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
