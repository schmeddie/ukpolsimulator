"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/game/Sidebar";
import { Header } from "@/components/game/Header";
import { NewsTicker } from "@/components/game/NewsTicker";
import { useGameStore } from "@/lib/store/useGameStore";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const { phase } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (phase === "character-creation") {
      router.replace("/");
    }
  }, [phase, router]);

  if (phase === "character-creation") return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-[240px] min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto pb-8">
          {children}
        </main>
        <NewsTicker />
      </div>
    </div>
  );
}
