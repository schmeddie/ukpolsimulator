"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Trash2, User, Bot, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/store/useGameStore";
import { generateAIResponse, buildDispatchBoxSystemPrompt } from "@/lib/ai/aiClient";
import { getPartyColour, formatGameDate, cn } from "@/lib/utils";
import type { NPC } from "@/lib/store/types";

export default function DispatchBoxPage() {
  const { player, worldState, npcs, dispatchBoxHistory, addDispatchMessage, clearDispatchHistory, settings } = useGameStore();

  const [message, setMessage] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState<NPC | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const opponents = npcs
    .filter((n) => n.party !== player?.party)
    .sort((a, b) => b.loyaltyToPlayer - a.loyaltyToPlayer)
    .slice(0, 12);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dispatchBoxHistory]);

  if (!player) return null;

  const handleSend = async () => {
    if (!message.trim() || !selectedOpponent) return;
    const userMsg = message.trim();
    setMessage("");
    setError(null);

    addDispatchMessage({ role: "user", content: userMsg, speaker: player.name });

    if (!settings.ai.enabled || !settings.ai.apiKey) {
      addDispatchMessage({
        role: "assistant",
        content: `[${selectedOpponent.name} stands at the Dispatch Box] — The AI is not configured. Please add your API key in Settings to enable real-time debate.`,
        speaker: selectedOpponent.name,
      });
      return;
    }

    setLoading(true);
    try {
      const systemPrompt = buildDispatchBoxSystemPrompt(selectedOpponent, player, worldState);

      // Build conversation history for context
      const historyContext = dispatchBoxHistory
        .slice(-6)
        .map((m) => `${m.speaker ?? m.role}: ${m.content}`)
        .join("\n");

      const response = await generateAIResponse({
        settings: settings.ai,
        systemPrompt,
        userPrompt: `${historyContext}\n\n${player.name}: ${userMsg}`,
        maxTokens: 250,
      });

      addDispatchMessage({
        role: "assistant",
        content: response,
        speaker: selectedOpponent.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px-32px)] animate-fade-in">
      {/* Opponent selector */}
      <div className="w-[260px] shrink-0 border-r border-border/50 flex flex-col">
        <div className="px-4 py-3 border-b border-border/50">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Dispatch Box
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Select an opponent to debate</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-2">
            {opponents.map((opp) => (
              <button
                key={opp.id}
                onClick={() => { setSelectedOpponent(opp); setError(null); }}
                className={cn(
                  "w-full text-left px-4 py-2.5 hover:bg-secondary/30 transition-colors",
                  selectedOpponent?.id === opp.id && "bg-secondary/50 border-l-2 border-l-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: getPartyColour(opp.party) }}
                  >
                    {opp.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{opp.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{opp.party}</div>
                  </div>
                  <div className={cn(
                    "ml-auto text-[10px] font-semibold shrink-0",
                    opp.loyaltyToPlayer > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {opp.loyaltyToPlayer > 0 ? "+" : ""}{opp.loyaltyToPlayer}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Opponent header */}
        {selectedOpponent ? (
          <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/30">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: getPartyColour(selectedOpponent.party) }}
              >
                {selectedOpponent.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold">{selectedOpponent.name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedOpponent.ministerialRole ?? selectedOpponent.role} · {selectedOpponent.party}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] ml-2">{selectedOpponent.traits[0]}</Badge>
            </div>
            <Button
              size="xs"
              variant="ghost"
              onClick={clearDispatchHistory}
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select an opponent to begin the debate.
          </div>
        )}

        {selectedOpponent && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 px-6 py-4">
              {dispatchBoxHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                  <div className="text-sm text-muted-foreground">
                    The House is in session. You have the floor.
                  </div>
                  {!settings.ai.enabled && (
                    <div className="text-xs text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      AI not configured — add your key in Settings for live debate
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-4">
                {dispatchBoxHistory.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
                    >
                      {!isUser && (
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                          style={{ backgroundColor: getPartyColour(selectedOpponent.party) }}
                        >
                          {selectedOpponent.name.charAt(0)}
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[70%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-secondary text-foreground rounded-bl-sm"
                      )}>
                        {!isUser && (
                          <div className="text-[10px] font-semibold text-muted-foreground mb-1">
                            {msg.speaker}
                          </div>
                        )}
                        <p>{msg.content}</p>
                      </div>
                      {isUser && (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                          {player.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: getPartyColour(selectedOpponent.party) }}
                    >
                      {selectedOpponent.name.charAt(0)}
                    </div>
                    <div className="bg-secondary rounded-xl px-4 py-3 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.15s]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.3s]" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Error banner */}
            {error && (
              <div className="mx-6 mb-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border/50 px-6 py-3 flex gap-3 items-end">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rise to speak at the Dispatch Box… (Enter to send)"
                className="flex-1 min-h-[44px] max-h-[120px] resize-none text-sm"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || loading}
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                {loading ? <Zap className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
