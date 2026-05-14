"use client";

import { useState } from "react";
import { Crown, Key, Eye, EyeOff, Zap, ChevronRight, AlertCircle, CheckCircle, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/lib/store/useGameStore";
import { generateScenario, DEFAULT_SCENARIO } from "@/lib/ai/generateScenario";
import { cn } from "@/lib/utils";
import type { AISettings, GeneratedScenario } from "@/lib/store/types";

const PROVIDERS: Array<{
  id: AISettings["provider"];
  label: string;
  placeholder: string;
  models: string[];
  hint: string;
  custom?: true;
}> = [
  {
    id: "openai",
    label: "OpenAI",
    placeholder: "sk-...",
    models: ["gpt-4o-mini", "gpt-4o"],
    hint: "platform.openai.com",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    placeholder: "sk-ant-...",
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
    hint: "console.anthropic.com",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    placeholder: "sk-or-...",
    models: ["openai/gpt-4o-mini", "anthropic/claude-haiku"],
    hint: "openrouter.ai",
  },
  {
    id: "custom",
    label: "Custom",
    placeholder: "API key (or leave blank)",
    models: [],
    hint: "OpenAI-compatible endpoint",
    custom: true,
  },
];

interface Props {
  onScenarioReady: (scenario: GeneratedScenario) => void;
  onGenerating: () => void;
}

export function APIKeyGate({ onScenarioReady, onGenerating }: Props) {
  const { settings, updateAISettings } = useGameStore();

  const [provider, setProvider] = useState<AISettings["provider"]>(settings.ai.provider);
  const [model, setModel] = useState(settings.ai.model);
  const [apiKey, setApiKey] = useState(settings.ai.apiKey);
  const [baseUrl, setBaseUrl] = useState(settings.ai.baseUrl ?? "");
  const [customModel, setCustomModel] = useState(settings.ai.model);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;
  const isCustom = provider === "custom";

  const handleProviderChange = (p: AISettings["provider"]) => {
    setProvider(p);
    const pr = PROVIDERS.find((x) => x.id === p)!;
    if (!pr.custom) setModel(pr.models[0] ?? "");
    setStatus("idle");
    setErrorMsg(null);
  };

  const buildSettings = (): AISettings => ({
    provider,
    model: isCustom ? customModel.trim() : model,
    apiKey: apiKey.trim(),
    enabled: true,
    baseUrl: isCustom ? baseUrl.trim() : undefined,
  });

  const canGenerate = isCustom
    ? baseUrl.trim().length > 0 && customModel.trim().length > 0
    : apiKey.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    const tempSettings = buildSettings();
    updateAISettings(tempSettings);

    setStatus("testing");
    setErrorMsg(null);
    onGenerating();

    try {
      const scenario = await generateScenario(tempSettings);
      updateAISettings({ enabled: true });
      onScenarioReady(scenario);
    } catch (err) {
      console.warn("Scenario generation failed, using default:", err);
      updateAISettings({ enabled: true });
      onScenarioReady(DEFAULT_SCENARIO);
    }
  };

  const handleSkip = () => {
    onGenerating();
    setTimeout(() => onScenarioReady(DEFAULT_SCENARIO), 600);
  };

  return (
    <div className="relative min-h-screen bg-[#050a14] flex flex-col items-center justify-center overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-8 flex flex-col items-center gap-8 animate-fade-in">
        {/* Branding */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl scale-150" />
            <div className="relative h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Crown className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-primary/70 tracking-[0.35em] uppercase mb-1">Project</div>
            <h1 className="text-4xl font-black text-white tracking-tight">WESTMINSTER</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xs leading-relaxed">
              A political career simulator. Your choices shape a nation.
            </p>
          </div>
        </div>

        {/* API Key card */}
        <div className="w-full glass-panel rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Key className="h-4 w-4 text-primary" />
            Connect Your AI Engine
          </div>

          <div className="text-xs text-slate-400 leading-relaxed bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
            The AI generates a unique political scenario, dynamic news, and live debates.
            Your key stays in your browser — never sent to our servers.
          </div>

          {/* Provider tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                className={cn(
                  "py-2 rounded-lg text-xs font-semibold border transition-all",
                  provider === p.id
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Model selector (preset providers) */}
          {!isCustom && currentProvider.models.length > 0 && (
            <div className="flex gap-1.5">
              {currentProvider.models.map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={cn(
                    "flex-1 py-1.5 rounded text-[10px] font-medium border transition-all truncate px-1",
                    model === m
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-300"
                  )}
                >
                  {m.split("/").pop()}
                </button>
              ))}
            </div>
          )}

          {/* Custom endpoint fields */}
          {isCustom && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Globe className="h-3 w-3" />
                  Base URL
                </label>
                <Input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => { setBaseUrl(e.target.value); setStatus("idle"); setErrorMsg(null); }}
                  placeholder="https://your-endpoint.com/v1"
                  className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 font-mono text-xs focus:border-primary/50"
                />
                <p className="text-[10px] text-slate-600">
                  The path <span className="text-slate-500">/chat/completions</span> will be appended automatically.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Model ID
                </label>
                <Input
                  type="text"
                  value={customModel}
                  onChange={(e) => { setCustomModel(e.target.value); setStatus("idle"); setErrorMsg(null); }}
                  placeholder="e.g. llama-3.1-8b or gpt-4o-mini"
                  className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 font-mono text-xs focus:border-primary/50"
                />
              </div>
            </div>
          )}

          {/* API Key input */}
          <div className="space-y-1.5">
            {isCustom && (
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                API Key
              </label>
            )}
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setStatus("idle"); setErrorMsg(null); }}
                placeholder={currentProvider.placeholder}
                className="pr-10 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 font-mono text-xs focus:border-primary/50"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center">
            {isCustom ? "Any OpenAI-compatible endpoint (Ollama, LM Studio, vLLM, etc.)" : (
              <>Get a key at <span className="text-primary/70">{currentProvider.hint}</span></>
            )}
          </div>

          {/* Status */}
          {status === "ok" && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <CheckCircle className="h-3.5 w-3.5" />
              Connected — generating your political world…
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMsg}
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || status === "testing"}
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-11 text-sm gap-2"
          >
            {status === "testing" ? (
              <>
                <Zap className="h-4 w-4 animate-pulse" />
                Generating political scenario…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate My Political World
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Shield className="h-3.5 w-3.5" />
          Continue without AI (use default scenario)
        </button>
      </div>
    </div>
  );
}
