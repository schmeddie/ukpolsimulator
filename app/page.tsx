"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store/useGameStore";
import { APIKeyGate } from "@/components/intro/APIKeyGate";
import { ScenarioLoader } from "@/components/intro/ScenarioLoader";
import { CinematicIntro } from "@/components/intro/CinematicIntro";
import { ConstituencyPicker } from "@/components/intro/ConstituencyPicker";
import { CharacterSetup } from "@/components/intro/CharacterSetup";
import type { GeneratedScenario, Party, Background } from "@/lib/store/types";

type IntroPhase = "apikey" | "generating" | "cinematic" | "constituency" | "character";

export default function IntroPage() {
  const router = useRouter();
  const { startGame, setScenario } = useGameStore();

  const [phase, setPhase] = useState<IntroPhase>("apikey");
  const [scenario, setLocalScenario] = useState<GeneratedScenario | null>(null);
  const [constituency, setConstituency] = useState<string>("");

  const handleScenarioReady = (sc: GeneratedScenario) => {
    setLocalScenario(sc);
    setScenario(sc);
    setPhase("cinematic");
  };

  const handleCharacterComplete = (name: string, party: Party, background: Background) => {
    if (!scenario) return;
    startGame(name, party, background, constituency);
    router.push("/game/dashboard");
  };

  if (phase === "apikey") {
    return (
      <APIKeyGate
        onGenerating={() => setPhase("generating")}
        onScenarioReady={handleScenarioReady}
      />
    );
  }

  if (phase === "generating") {
    return <ScenarioLoader />;
  }

  if (phase === "cinematic" && scenario) {
    return (
      <CinematicIntro
        scenario={scenario}
        onComplete={() => setPhase("constituency")}
      />
    );
  }

  if (phase === "constituency" && scenario) {
    return (
      <ConstituencyPicker
        scenario={scenario}
        onSelect={(c) => {
          setConstituency(c);
          setPhase("character");
        }}
      />
    );
  }

  if (phase === "character" && scenario) {
    return (
      <CharacterSetup
        constituency={constituency}
        scenario={scenario}
        onComplete={handleCharacterComplete}
      />
    );
  }

  return null;
}
