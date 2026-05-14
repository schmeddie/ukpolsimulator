"use client";

import { AISettings, Player, WorldState, NPC } from "../store/types";

interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  settings: AISettings;
  maxTokens?: number;
}

export async function generateAIResponse(opts: GenerateOptions): Promise<string> {
  const { settings, systemPrompt, userPrompt, maxTokens = 600 } = opts;

  if (!settings.enabled || !settings.apiKey) {
    throw new Error("AI is not configured. Please add your API key in Settings.");
  }

  if (settings.provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model || "gpt-4o-mini",
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message ?? `OpenAI error ${res.status}`);
    }
    const data = await res.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content ?? "";
  }

  if (settings.provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": settings.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: settings.model || "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message ?? `Anthropic error ${res.status}`);
    }
    const data = await res.json() as { content: Array<{ text: string }> };
    return data.content[0]?.text ?? "";
  }

  if (settings.provider === "openrouter") {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
        "HTTP-Referer": "https://westminster.game",
        "X-Title": "Project Westminster",
      },
      body: JSON.stringify({
        model: settings.model || "openai/gpt-4o-mini",
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message ?? `OpenRouter error ${res.status}`);
    }
    const data = await res.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content ?? "";
  }

  throw new Error("Unknown AI provider");
}

// ─── Prompt Builders ──────────────────────────────────────────────────────────

export function buildWorldContext(player: Player, worldState: WorldState): string {
  return `WORLD STATE:
Date: ${new Date(worldState.currentDate).toDateString()}
Inflation: ${worldState.inflation}%  GDP Growth: ${worldState.gdpGrowth}%  Unemployment: ${worldState.unemployment}%
NHS Wait: ${worldState.nhsWaitTimesWeeks} weeks  Public Mood: ${worldState.publicMood}/100
Party Unity: ${worldState.partyUnity}/100  Days to election: ${worldState.nextElectionDays}
Government: ${worldState.governmentParty}  Opposition: ${worldState.oppositionParty}
Active events: ${worldState.activeGlobalEvents.join(", ")}

PLAYER:
Name: ${player.name}  Party: ${player.party}  Role: ${player.role}
Constituency: ${player.constituency}  Background: ${player.background}
Charisma: ${player.charisma}  Intelligence: ${player.intelligence}
Integrity: ${player.integrity}  Approval: ${player.approvalRating}%
Party Loyalty Score: ${player.partyLoyaltyScore}/100`;
}

export function buildDispatchBoxSystemPrompt(opponent: NPC, player: Player, worldState: WorldState): string {
  return `You are ${opponent.name}, ${opponent.role} for ${opponent.party} in the UK Parliament.
Your personality: ${opponent.personalityDescription}
Your traits: ${opponent.traits.join(", ")}

${buildWorldContext(player, worldState)}

You are debating ${player.name} (${player.party}) at the Dispatch Box in the House of Commons.
Respond in character — use UK political language, be combative but parliamentary.
Keep responses under 4 sentences. Reference real UK political context.
Your loyalty to the player is ${opponent.loyaltyToPlayer}/100 (negative = hostile).`;
}

export function buildEmailSystemPrompt(player: Player, worldState: WorldState): string {
  return `You generate realistic UK political emails for a politics simulation game.
${buildWorldContext(player, worldState)}

Generate a single email (from a constituent, lobbyist, journalist, or colleague) that:
1. Is relevant to current world state
2. Presents a dilemma or request
3. Feels authentic to British political culture
4. Is 80-150 words

Return ONLY valid JSON matching this schema:
{
  "from": "Full Name",
  "fromRole": "Constituent|Lobbyist|Journalist|NPC MP|Think Tank",
  "subject": "Subject line",
  "body": "Email body text",
  "urgent": false,
  "choices": [
    { "id": "1", "label": "Short action label", "consequence": "What happens", "effects": {} },
    { "id": "2", "label": "Short action label", "consequence": "What happens", "effects": {} },
    { "id": "3", "label": "Short action label", "consequence": "What happens", "effects": {} }
  ]
}`;
}

export function buildNewsSystemPrompt(player: Player, worldState: WorldState): string {
  return `You generate satirical and realistic UK political news headlines for a politics simulation.
${buildWorldContext(player, worldState)}

Generate 3 news headlines as a JSON array:
[
  { "headline": "...", "sentiment": "positive|negative|neutral|scandal", "source": "BBC Politics|The Guardian|The Times|Sky News|etc" },
  ...
]
Headlines should reflect current world state and optionally reference player actions.
Be witty and authentic to UK media style. Return ONLY valid JSON.`;
}

export function buildPolicyAnalysisPrompt(
  policyName: string,
  policyDescription: string,
  parameters: Array<{ key: string; label: string; value: number; unit: string }>,
  player: Player,
  worldState: WorldState
): string {
  const paramStr = parameters.map((p) => `${p.label}: ${p.value}${p.unit}`).join(", ");
  return `Analyse this proposed UK policy for a politics simulation:
Policy: ${policyName}
Description: ${policyDescription}
Parameters: ${paramStr}

${buildWorldContext(player, worldState)}

Provide a concise (3-4 sentence) political analysis covering:
1. Likely public reaction
2. Media framing
3. Party unity impact
4. Key opposition argument

Be realistic and reference UK political context.`;
}
