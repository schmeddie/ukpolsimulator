"use client";

import { useState, useMemo } from "react";
import { Search, Users, MapPin, Shield } from "lucide-react";
import { useGameStore } from "@/lib/store/useGameStore";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPartyColour } from "@/lib/utils";
import { Party } from "@/lib/store/types";

export default function ParliamentPage() {
  const { npcs } = useGameStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [partyFilter, setPartyFilter] = useState<Party | "All">("All");

  // Get a unique list of parties actually present in the generated Commons
  const activeParties = useMemo(() => {
    const parties = new Set(npcs.map((n) => n.party));
    return ["All", ...Array.from(parties)] as (Party | "All")[];
  }, [npcs]);

  const filteredNpcs = useMemo(() => {
    return npcs.filter((npc) => {
      const matchesSearch =
        npc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        npc.constituency.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesParty = partyFilter === "All" || npc.party === partyFilter;
      return matchesSearch && matchesParty;
    });
  }, [npcs, searchQuery, partyFilter]);

  if (npcs.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No MPs generated. Please start a game first.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in flex flex-col h-[calc(100vh-56px)]">
      {/* Header & Filters */}
      <div className="shrink-0 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            House of Commons
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse all {npcs.length} generated Members of Parliament.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or constituency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {activeParties.map((party) => (
              <button
                key={party}
                onClick={() => setPartyFilter(party)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-all ${
                  partyFilter === party
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                {party}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MP List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-8">
        {filteredNpcs.map((npc) => (
          <Card key={npc.id} className="hover:border-border/80 transition-colors">
            <CardContent className="p-4 flex gap-4">
              {/* Party Color Bar */}
              <div
                className="w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: getPartyColour(npc.party) }}
              />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{npc.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {npc.constituency}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">{npc.role}</Badge>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  {npc.personalityDescription}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}