"use client";

import { useState } from "react";
import { FileText, Plus, Vote, CheckCircle, XCircle, Zap, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGameStore } from "@/lib/store/useGameStore";
import { POLICY_PRESETS } from "@/lib/gameData";
import { generateAIResponse, buildPolicyAnalysisPrompt } from "@/lib/ai/aiClient";
import { formatShortDate, cn } from "@/lib/utils";
import type { PolicyArea, PolicyParameter } from "@/lib/store/types";

const POLICY_AREAS: PolicyArea[] = [
  "Economy", "NHS", "Housing", "Education", "Defence",
  "Environment", "Immigration", "Crime", "Welfare", "Foreign Policy",
];

const STATUS_STYLES = {
  draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  passed: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  withdrawn: "bg-muted text-muted-foreground",
};

export default function PolicyPage() {
  const { player, worldState, policies, addPolicy, submitPolicyToHouse, addNewsItem, settings } = useGameStore();

  const [tab, setTab] = useState("create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<PolicyArea>("Economy");
  const [parameters, setParameters] = useState<PolicyParameter[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  if (!player) return null;

  const handlePreset = (preset: typeof POLICY_PRESETS[0]) => {
    setName(preset.name);
    setDescription(preset.description);
    setArea(preset.area);
    setParameters(preset.parameters.map((p) => ({ ...p })));
    setAiAnalysis(null);
  };

  const handleAddParameter = () => {
    setParameters((prev) => [
      ...prev,
      { key: `param_${prev.length}`, label: "New Parameter", value: 50, min: 0, max: 100, unit: "" },
    ]);
  };

  const handleParamChange = (index: number, value: number) => {
    setParameters((prev) => prev.map((p, i) => i === index ? { ...p, value } : p));
  };

  const handleAnalyse = async () => {
    if (!name) return;
    setAnalysing(true);
    setAnalysisError(null);
    try {
      const result = await generateAIResponse({
        settings: settings.ai,
        systemPrompt: "You are a UK political analyst. Be concise and realistic.",
        userPrompt: buildPolicyAnalysisPrompt(name, description, parameters, player, worldState),
        maxTokens: 300,
      });
      setAiAnalysis(result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalysing(false);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    addPolicy({
      name: name.trim(),
      description,
      area,
      parameters,
      supportingNPCIds: [],
      opposingNPCIds: [],
    });
    setName("");
    setDescription("");
    setParameters([]);
    setAiAnalysis(null);
    setTab("history");
  };

  const handleSubmit = (policyId: string) => {
    submitPolicyToHouse(policyId);
    const pol = policies.find((p) => p.id === policyId);
    if (pol) {
      addNewsItem({
        headline: `${player.name} introduces ${pol.name} — debate expected`,
        sentiment: "neutral",
        aiGenerated: false,
        source: "Hansard / PA Media",
        relatedPolicyId: policyId,
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Policy Creator</h1>
        <p className="text-sm text-muted-foreground">Draft bills, set parameters, and submit to the House.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="create">Draft New Bill</TabsTrigger>
          <TabsTrigger value="history">Policy History ({policies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* Presets */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {POLICY_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePreset(preset)}
                  className="text-xs border border-border/60 rounded-md px-2.5 py-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Bill Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. NHS Emergency Funding Act 2025" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this bill aim to achieve?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Policy Area</Label>
                <div className="flex flex-wrap gap-2">
                  {POLICY_AREAS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setArea(a)}
                      className={cn(
                        "text-xs rounded px-2.5 py-1 border transition-all",
                        area === a
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "border-border text-muted-foreground hover:border-border/80"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Parameters</Label>
                <Button size="xs" variant="ghost" onClick={handleAddParameter}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
              {parameters.length === 0 && (
                <p className="text-xs text-muted-foreground">No parameters. Select a preset or add manually.</p>
              )}
              <div className="space-y-4">
                {parameters.map((p, i) => (
                  <div key={p.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{p.label}</span>
                      <span className="font-semibold text-foreground">{p.value.toLocaleString()}{p.unit}</span>
                    </div>
                    <Slider
                      min={p.min}
                      max={p.max}
                      step={Math.max(1, Math.floor((p.max - p.min) / 100))}
                      value={[p.value]}
                      onValueChange={([v]) => handleParamChange(i, v)}
                    />
                  </div>
                ))}
              </div>

              {/* AI Analysis */}
              <div className="mt-4 space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAnalyse}
                  disabled={!name || analysing || !settings.ai.enabled}
                  className="w-full"
                  title={!settings.ai.enabled ? "Enable AI in Settings first" : ""}
                >
                  {analysing
                    ? <><Zap className="mr-2 h-3.5 w-3.5 animate-pulse" /> Analysing...</>
                    : <><BarChart2 className="mr-2 h-3.5 w-3.5" /> AI Impact Analysis</>
                  }
                </Button>
                {analysisError && (
                  <p className="text-xs text-red-400">{analysisError}</p>
                )}
                {aiAnalysis && (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-foreground/90 leading-relaxed">
                    {aiAnalysis}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCreate} disabled={!name.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Save to Draft
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {policies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No policies drafted yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <Card key={policy.id} className="hover:border-border/80 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-semibold text-foreground">{policy.name}</h3>
                          <span className={cn("text-[10px] border rounded px-1.5 py-0.5 font-medium", STATUS_STYLES[policy.status])}>
                            {policy.status.toUpperCase()}
                          </span>
                          <Badge variant="outline" className="text-[10px]">{policy.area}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{policy.description}</p>

                        {(policy.status === "passed" || policy.status === "failed") && (
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {policy.votesFor} for
                            </div>
                            <div className="flex items-center gap-1 text-red-400">
                              <XCircle className="h-3.5 w-3.5" />
                              {policy.votesAgainst} against
                            </div>
                            <div className="text-muted-foreground">{policy.abstentions} abstain</div>
                          </div>
                        )}
                      </div>

                      {policy.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleSubmit(policy.id)}
                          className="shrink-0"
                        >
                          <Vote className="mr-1.5 h-4 w-4" />
                          Submit to House
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
