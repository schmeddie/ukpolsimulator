"use client";

import { useGameStore } from "@/lib/store/useGameStore";
import { sentimentDot } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function NewsTicker() {
  const { news } = useGameStore();

  const tickerItems = news.slice(0, 12);

  return (
    <div className="fixed bottom-0 left-[240px] right-0 z-30 h-8 flex items-center border-t border-border/50 bg-[hsl(var(--sidebar-bg))] overflow-hidden">
      <div className="flex-shrink-0 px-3 text-[10px] font-bold text-primary tracking-widest uppercase border-r border-border/50 h-full flex items-center">
        BREAKING
      </div>
      <div className="flex-1 overflow-hidden ticker-wrap">
        <div className="ticker-content flex items-center gap-8 px-4">
          {tickerItems.map((item, i) => (
            <span key={item.id ?? i} className="flex items-center gap-2 shrink-0">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", sentimentDot(item.sentiment))} />
              <span className="text-xs text-foreground/80">{item.headline}</span>
              <span className="text-[10px] text-muted-foreground">— {item.source}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
