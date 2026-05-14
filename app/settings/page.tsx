"use client";

import { useState } from "react";
import { Settings, Key, Zap, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGameStore } from "@/lib/store/useGameStore";
import { generateAIResponse } from "@/lib/ai/aiClient";
import { cn } from "@/lib/utils";
import type { AISettings } from "@/lib/store/types";

const PROVIDER_MODELS: Record<AISettings["provider"], string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"],
  anthropic: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-opus-4-7"],
  openrouter: ["openai/gpt-4o-mini", "anthropic/claude-haiku", "meta-llama/llama-3.1-8b-instruct"],
};

export default function SettingsPage() {
  const { settings, updateAISettings, updateSettings } = useGameStore();

  const [apiKey, setApiKey] = useState(settings.ai.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleSave = () => {
    updateAISettings({
      apiKey,
      enabled: apiKey.length > 8,
    });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError(null);
    const tempSettings: AISettings = { ...settings.ai, apiKey, enabled: true };
    try {
      const result = await generateAIResponse({
        settings: tempSettings,
        systemPrompt: "You are a UK politics simulation assistant. Respond in 1 sentence.",
        userPrompt: "Confirm you are connected to Project Westminster.",
        maxTokens: 50,
      });
      if (result) {
        setTestResult("success");
        updateAISettings({ apiKey, enabled: true });
      }
    } catch (err) {
      setTestResult("error");
      setTestError(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your AI key and game preferences.</p>
          </div>
        </div>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4 text-yellow-400" />
              AI Engine (BYOK)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-md bg-primary/5 border border-primary/20 p-3 text-xs text-foreground/80 leading-relaxed">
              <strong>Bring Your Own Key:</strong> Your API key is stored locally in your browser and is never sent to any server other than your chosen AI provider.
              The AI powers dynamic emails, policy analysis, and Dispatch Box debates.
            </div>

            {/* Provider */}
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <div className="flex gap-2">
                {(["openai", "anthropic", "openrouter"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      updateAISettings({ provider: p, model: PROVIDER_MODELS[p][0] });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs border font-medium transition-all",
                      settings.ai.provider === p
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border text-muted-foreground hover:border-border/80"
                    )}
                  >
                    {p === "openai" ? "OpenAI" : p === "anthropic" ? "Anthropic" : "OpenRouter"}
                  </button>
                ))}
              </div>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label>Model</Label>
              <div className="flex flex-wrap gap-2">
                {PROVIDER_MODELS[settings.ai.provider].map((m) => (
                  <button
                    key={m}
                    onClick={() => updateAISettings({ model: m })}
                    className={cn(
                      "px-2.5 py-1 rounded text-[11px] border transition-all",
                      settings.ai.model === m
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border text-muted-foreground hover:border-border/80"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apikey">API Key</Label>
              <div className="relative">
                <Input
                  id="apikey"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`sk-... or your ${settings.ai.provider} key`}
                  className="pr-10 font-mono text-xs"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-2 text-xs",
                settings.ai.enabled ? "text-green-400" : "text-muted-foreground"
              )}>
                <div className={cn("h-2 w-2 rounded-full", settings.ai.enabled ? "bg-green-400 animate-pulse" : "bg-muted-foreground/40")} />
                {settings.ai.enabled ? "AI Active" : "AI Inactive"}
              </div>
              {testResult === "success" && (
                <div className="flex items-center gap-1 text-green-400 text-xs">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Connection verified
                </div>
              )}
              {testResult === "error" && (
                <div className="flex items-center gap-1 text-red-400 text-xs">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {testError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} size="sm" disabled={!apiKey.trim()}>
                Save Key
              </Button>
              <Button
                onClick={handleTest}
                size="sm"
                variant="outline"
                disabled={testing || !apiKey.trim()}
              >
                {testing ? <><Zap className="mr-2 h-3.5 w-3.5 animate-pulse" />Testing...</> : "Test Connection"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Game Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <div className="flex gap-2">
                {(["Easy", "Normal", "Hard", "Realistic"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => updateSettings({ difficulty: d })}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs border font-medium transition-all",
                      settings.difficulty === d
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border text-muted-foreground hover:border-border/80"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Auto-Save</div>
                <div className="text-xs text-muted-foreground">Save progress after each turn</div>
              </div>
              <button
                onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                className={cn(
                  "h-6 w-11 rounded-full transition-colors relative",
                  settings.autoSave ? "bg-primary" : "bg-secondary"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full bg-white absolute top-1 transition-all",
                  settings.autoSave ? "left-6" : "left-1"
                )} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Back to game */}
        <Button variant="outline" onClick={() => window.history.back()} className="w-full">
          Back to Westminster
        </Button>
      </div>
    </div>
  );
}
