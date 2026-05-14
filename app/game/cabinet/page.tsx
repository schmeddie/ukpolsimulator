"use client";

import { useState } from "react";
import { Users, Search, Filter, Shield, Zap, AlertTriangle, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useGameStore } from "@/lib/store/useGameStore";
import { getPartyColour, getStatColour, cn } from "@/lib/utils";
import type { NPC } from "@/lib/store/types";

const TRAIT_COLOURS: Record<string, string> = {
  Loyal: "bg-green-500/15 text-green-400 border-green-500/25",
  Ambitious: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  "Chaos Agent": "bg-red-500/15 text-red-400 border-red-500/25",
  Principled: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Opportunist: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  Idealist: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Pragmatist: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  Backstabber: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  "Media Savvy": "bg-pink-500/15 text-pink-400 border-pink-500/25",
  "Grassroots Hero": "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

function NPCCard({ npc }: { npc: NPC }) {
  const { updateNPCRelationship } = useGameStore();
  const loyaltyColour = npc.loyaltyToPlayer > 20
    ? "text-green-400"
    : npc.loyaltyToPlayer < -20
    ? "text-red-400"
    : "text-muted-foreground";

  return (
    <Card className="hover:border-border/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: getPartyColour(npc.party) }}
          >
            {npc.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{npc.name}</h3>
                <p className="text-[11px] text-muted-foreground">{npc.ministerialRole ?? npc.role}</p>
                <p className="text-[10px] text-muted-foreground/60">{npc.constituency}</p>
              </div>
              <div className="text-right shrink-0">
                <div className={cn("text-sm font-bold tabular-nums", loyaltyColour)}>
                  {npc.loyaltyToPlayer > 0 ? "+" : ""}{npc.loyaltyToPlayer}
                </div>
                <div className="text-[10px] text-muted-foreground">loyalty</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {npc.traits.map((trait) => (
                <span
                  key={trait}
                  className={cn(
                    "text-[10px] border rounded px-1.5 py-0.5 font-medium",
                    TRAIT_COLOURS[trait] ?? "bg-secondary text-muted-foreground"
                  )}
                >
                  {trait}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Progress
                value={Math.max(0, npc.loyaltyToPlayer + 100) / 2}
                className="h-1 flex-1"
                indicatorClassName={
                  npc.loyaltyToPlayer > 20 ? "bg-green-400" : npc.loyaltyToPlayer < -20 ? "bg-red-400" : "bg-muted-foreground"
                }
              />
              <div className="flex gap-1">
                <button
                  onClick={() => updateNPCRelationship(npc.id, 5)}
                  className="h-6 w-6 rounded text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors flex items-center justify-center"
                  title="Cultivate relationship"
                >
                  +
                </button>
                <button
                  onClick={() => updateNPCRelationship(npc.id, -5)}
                  className="h-6 w-6 rounded text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                  title="Antagonise"
                >
                  –
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CabinetPage() {
  const { player, npcs, worldState } = useGameStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("party");

  if (!player) return null;

  const filtered = npcs.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.party.toLowerCase().includes(search.toLowerCase()) ||
    (n.ministerialRole ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const partyNPCs = filtered.filter((n) => n.party === player.party);
  const cabinetNPCs = filtered.filter((n) => n.isInCabinet);
  const allyNPCs = filtered.filter((n) => n.loyaltyToPlayer > 30);
  const rivalNPCs = filtered.filter((n) => n.loyaltyToPlayer < -20);

  const partyMoodAvg = npcs.filter((n) => n.party === player.party).reduce((acc, n) => acc + n.loyaltyToPlayer, 0) / Math.max(1, npcs.filter((n) => n.party === player.party).length);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Cabinet & Party</h1>
          <p className="text-sm text-muted-foreground">Manage relationships with your fellow MPs.</p>
        </div>
      </div>

      {/* Party summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Party Unity", value: `${Math.round(worldState.partyUnity)}%`, colour: getStatColour(worldState.partyUnity), icon: <Shield className="h-4 w-4" /> },
          { label: "Your Standing", value: `${Math.round((partyMoodAvg + 100) / 2)}%`, colour: getStatColour((partyMoodAvg + 100) / 2), icon: <Heart className="h-4 w-4" /> },
          { label: "Allies", value: allyNPCs.length, colour: "text-green-400", icon: <Users className="h-4 w-4" /> },
          { label: "Rivals", value: rivalNPCs.length, colour: "text-red-400", icon: <AlertTriangle className="h-4 w-4" /> },
        ].map(({ label, value, colour, icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-secondary/60 flex items-center justify-center text-muted-foreground shrink-0">
                {icon}
              </div>
              <div>
                <div className={cn("text-xl font-bold tabular-nums", colour)}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search MPs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="party">Party ({partyNPCs.length})</TabsTrigger>
          <TabsTrigger value="cabinet">Cabinet ({cabinetNPCs.length})</TabsTrigger>
          <TabsTrigger value="allies">Allies ({allyNPCs.length})</TabsTrigger>
          <TabsTrigger value="rivals">Rivals ({rivalNPCs.length})</TabsTrigger>
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
        </TabsList>

        {[
          { value: "party", data: partyNPCs },
          { value: "cabinet", data: cabinetNPCs },
          { value: "allies", data: allyNPCs },
          { value: "rivals", data: rivalNPCs },
          { value: "all", data: filtered },
        ].map(({ value, data }) => (
          <TabsContent key={value} value={value}>
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No MPs found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.map((npc) => <NPCCard key={npc.id} npc={npc} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
