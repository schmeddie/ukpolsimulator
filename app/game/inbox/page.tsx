"use client";

import { useState } from "react";
import { Mail, MailOpen, AlertTriangle, Zap, RefreshCw, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGameStore } from "@/lib/store/useGameStore";
import { formatGameDate, formatRelativeDate, cn } from "@/lib/utils";
import {
  generateAIResponse,
  buildEmailSystemPrompt,
} from "@/lib/ai/aiClient";
import type { Email, EmailChoice } from "@/lib/store/types";
import { v4 as uuidv4 } from "uuid";

const SENDER_COLOURS: Record<string, string> = {
  "Chief Whip": "text-yellow-400",
  Constituent: "text-blue-400",
  Lobbyist: "text-orange-400",
  Journalist: "text-purple-400",
  "Party HQ": "text-pink-400",
  "Cabinet Office": "text-green-400",
  "NPC MP": "text-cyan-400",
  "Think Tank": "text-indigo-400",
  "Foreign Ambassador": "text-rose-400",
};

function EmailListItem({
  email,
  isSelected,
  onClick,
}: {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}) {
  const senderColour = SENDER_COLOURS[email.fromRole] ?? "text-muted-foreground";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-border/40 hover:bg-secondary/30 transition-colors",
        isSelected && "bg-secondary/50 border-l-2 border-l-primary",
        !email.read && !isSelected && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="shrink-0 mt-0.5">
          {email.read
            ? <MailOpen className="h-4 w-4 text-muted-foreground/50" />
            : <Mail className="h-4 w-4 text-primary" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("text-xs font-semibold truncate", senderColour)}>
              {email.from}
            </span>
            {email.urgent && (
              <AlertTriangle className="h-3 w-3 text-orange-400 shrink-0" />
            )}
            {!email.read && (
              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 ml-auto" />
            )}
          </div>
          <p className={cn("text-xs truncate", email.read ? "text-muted-foreground" : "text-foreground font-medium")}>
            {email.subject}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatRelativeDate(email.date)}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function InboxPage() {
  const { player, worldState, inbox, markEmailRead, chooseEmailOption, addEmail, settings } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(inbox[0]?.id ?? null);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const selectedEmail = inbox.find((e) => e.id === selectedId) ?? null;

  const handleSelect = (email: Email) => {
    setSelectedId(email.id);
    if (!email.read) markEmailRead(email.id);
  };

  const handleChoice = (emailId: string, choiceId: string) => {
    chooseEmailOption(emailId, choiceId);
  };

  const handleGenerateAIEmail = async () => {
    if (!player) return;
    setGenerating(true);
    setAiError(null);
    try {
      const raw = await generateAIResponse({
        settings: settings.ai,
        systemPrompt: buildEmailSystemPrompt(player, worldState),
        userPrompt: "Generate a new political email now.",
        maxTokens: 500,
      });

      const parsed = JSON.parse(raw);
      const choices: EmailChoice[] = (parsed.choices ?? []).map((c: { id?: string; label: string; consequence: string; effects?: object }) => ({
        id: uuidv4(),
        label: c.label,
        consequence: c.consequence,
        effects: c.effects ?? {},
      }));

      addEmail({
        from: parsed.from,
        fromRole: parsed.fromRole,
        subject: parsed.subject,
        body: parsed.body,
        urgent: parsed.urgent ?? false,
        choices,
        aiGenerated: true,
      });
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate email.");
    } finally {
      setGenerating(false);
    }
  };

  const unreadCount = inbox.filter((e) => !e.read).length;

  return (
    <div className="flex h-[calc(100vh-56px-32px)] animate-fade-in">
      {/* Email list sidebar */}
      <div className="w-[300px] shrink-0 border-r border-border/50 flex flex-col">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Inbox</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{unreadCount}</Badge>
            )}
          </div>
          <Button
            size="xs"
            variant="ghost"
            onClick={handleGenerateAIEmail}
            disabled={generating || !settings.ai.enabled}
            title={settings.ai.enabled ? "Generate AI email" : "Enable AI in Settings first"}
          >
            {generating
              ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              : <Zap className="h-3.5 w-3.5 text-primary" />
            }
          </Button>
        </div>

        {aiError && (
          <div className="px-4 py-2 text-[11px] text-red-400 bg-red-500/10 border-b border-red-500/20">
            {aiError}
          </div>
        )}

        <ScrollArea className="flex-1">
          {inbox.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No emails yet. Click Continue to advance.
            </div>
          )}
          {inbox.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={selectedId === email.id}
              onClick={() => handleSelect(email)}
            />
          ))}
        </ScrollArea>
      </div>

      {/* Email body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedEmail ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select an email to read
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      <span className={cn("font-semibold", SENDER_COLOURS[selectedEmail.fromRole] ?? "text-foreground")}>
                        {selectedEmail.from}
                      </span>
                      <span className="text-muted-foreground/60 ml-1">· {selectedEmail.fromRole}</span>
                    </span>
                    <span>·</span>
                    <span>{formatGameDate(selectedEmail.date)}</span>
                    {selectedEmail.urgent && (
                      <Badge variant="warning" className="text-[10px]">URGENT</Badge>
                    )}
                    {selectedEmail.aiGenerated && (
                      <Badge variant="info" className="text-[10px]">AI</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Body */}
              <div className="prose prose-sm prose-invert max-w-none">
                {selectedEmail.body.split("\n").map((line, i) => (
                  <p key={i} className={cn("text-sm leading-relaxed", line === "" ? "mt-4" : "text-foreground/90 mt-1")}>
                    {line || <>&nbsp;</>}
                  </p>
                ))}
              </div>

              {/* Choices */}
              {selectedEmail.choices && selectedEmail.choices.length > 0 && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    How do you respond?
                  </p>
                  {selectedEmail.chosenId ? (
                    <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
                      You chose: <span className="font-semibold">
                        {selectedEmail.choices.find((c) => c.id === selectedEmail.chosenId)?.label}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedEmail.choices.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => handleChoice(selectedEmail.id, choice.id)}
                          className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                          <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {choice.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{choice.consequence}</div>
                          {Object.entries(choice.effects).filter(([, v]) => v !== 0).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {Object.entries(choice.effects)
                                .filter(([, v]) => (v as number) !== 0)
                                .map(([key, val]) => (
                                  <span
                                    key={key}
                                    className={cn(
                                      "text-[10px] rounded px-1.5 py-0.5 font-medium",
                                      (val as number) > 0
                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                                    )}
                                  >
                                    {key.replace(/([A-Z])/g, " $1").toLowerCase()} {(val as number) > 0 ? "+" : ""}{val as number}
                                  </span>
                                ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
