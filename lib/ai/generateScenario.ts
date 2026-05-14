"use client";

import { AISettings, GeneratedScenario, Party } from "../store/types";
import { generateAIResponse } from "./aiClient";

// ─── Default / Fallback Scenario ─────────────────────────────────────────────

export const DEFAULT_SCENARIO: GeneratedScenario = {
  electionYear: 2024,
  electionHeadline: "Labour wins historic majority — Tories face existential reckoning",
  governmentParty: "Labour",
  primeMinister: "Sarah Thornton",
  majoritySize: 74,
  politicalContext:
    "After fourteen years in opposition, Labour secured a decisive majority on a platform of 'National Renewal'. The Conservative Party suffered its worst result since 1906, with Reform UK splitting the right-wing vote and the Liberal Democrats surging in the 'blue-wall' suburbs.",
  results: {
    Labour: { seats: 412, votesPct: 33.7, swing: "+7.2" },
    Conservative: { seats: 121, votesPct: 23.7, swing: "-13.5" },
    "Liberal Democrat": { seats: 72, votesPct: 12.2, swing: "+4.1" },
    SNP: { seats: 43, votesPct: 3.7, swing: "-0.8" },
    "Reform UK": { seats: 5, votesPct: 14.2, swing: "+12.1" },
    Green: { seats: 4, votesPct: 7.0, swing: "+5.1" },
    Independent: { seats: 9, votesPct: 5.5, swing: "+2.0" },
  },
  regionalResults: {
    "Scotland": "SNP",
    "Northern Ireland": "Independent",
    "North East England": "Labour",
    "North West England": "Labour",
    "Yorkshire & the Humber": "Labour",
    "East Midlands": "Labour",
    "West Midlands": "Labour",
    "Wales": "Labour",
    "East of England": "Conservative",
    "London": "Labour",
    "South East England": "Conservative",
    "South West England": "Liberal Democrat",
  },
  cabinet: [
    { role: "Prime Minister", name: "Sarah Thornton", party: "Labour", description: "Former barrister and Shadow Home Secretary. First female PM since Thatcher." },
    { role: "Chancellor of the Exchequer", name: "Marcus Webb", party: "Labour", description: "Ex-Bank of England economist. Architect of Labour's fiscal credibility plan." },
    { role: "Home Secretary", name: "Priya Sharma", party: "Labour", description: "Former Crown Prosecution Service lawyer. Tough on crime, reformist on policing." },
    { role: "Foreign Secretary", name: "James Alderton", party: "Labour", description: "Ex-diplomat turned MP. Veteran of the Chilcot-era Foreign Office." },
    { role: "Secretary of State for Health", name: "Dr. Anne Fielding", party: "Labour", description: "Former NHS consultant from Leeds. Led party health policy for six years." },
    { role: "Secretary of State for Education", name: "Tom Rashidi", party: "Labour", description: "Ex-comprehensive headteacher from Sheffield. Fierce advocate for state schools." },
    { role: "Secretary of State for Defence", name: "Hugh Garrett", party: "Labour", description: "Retired Admiral. Crossed from Conservatives in 2022 over defence budget cuts." },
    { role: "Secretary of State for Housing", name: "Fatima Osei-Bonsu", party: "Labour", description: "Former housing charity director. Promises 300,000 homes a year." },
    { role: "Leader of the Opposition", name: "Dominic Fairfax", party: "Conservative", description: "Led Tories to their worst defeat in a century. Facing leadership challenge." },
    { role: "Shadow Chancellor", name: "Victoria Hawes", party: "Conservative", description: "Former hedge fund manager. Leading the post-election policy review." },
    { role: "SNP Westminster Leader", name: "Catriona MacLeish", party: "SNP", description: "Firebrand independence advocate from Glasgow. Eyes another indyref." },
    { role: "Liberal Democrat Leader", name: "Oliver Carmichael", party: "Liberal Democrat", description: "Led LibDems to their best result since 2010. Now holds the balance in the Lords." },
  ],
  headlines: [
    "Labour landslide: Thornton enters Downing Street with 74-seat majority",
    "Tory massacre: Party reduced to 121 seats — worst result since 1906",
    "Reform UK splits right-wing vote — Conservatives blame Farage for catastrophe",
    "LibDem surge sweeps through 'blue-wall' suburbs of Surrey and Hampshire",
    "Scotland holds firm for SNP despite national swing — independence question returns",
  ],
  keyFacts: [
    "Conservative vote share: 23.7% — lowest since the 1906 Liberal landslide",
    "Labour's first Commons majority since Tony Blair's 2005 victory",
    "Turnout: 62.1% — third lowest in post-war British electoral history",
  ],
};

// ─── AI Prompt ────────────────────────────────────────────────────────────────

const SCENARIO_PROMPT = `You are generating a completely fictional but politically plausible UK general election result for a political simulation game called "Project Westminster".

RULES:
1. Scenario must be realistic — grounded in actual UK political geography and dynamics
2. DO NOT use real politicians' names — all people must be fictional but plausible
3. The result must make geographic sense (SNP wins in Scotland, LibDems in south England, etc.)
4. Cabinet roles must be real UK government positions
5. Names should reflect the diversity of modern Britain
6. You may set the election any year from 2024–2030
7. A Labour landslide, Conservative comeback, hung parliament, or LibDem surge are all valid
8. Total seats must add up to 650

Return ONLY a raw JSON object — no markdown, no code block fences, just the JSON:

{
  "electionYear": 2025,
  "electionHeadline": "10-word dramatic headline summarising the result",
  "governmentParty": "Labour",
  "primeMinister": "Fictional Full Name",
  "majoritySize": 74,
  "politicalContext": "2-3 sentences describing what led to this result and its significance.",
  "results": {
    "Labour": { "seats": 412, "votesPct": 33.7, "swing": "+7.2" },
    "Conservative": { "seats": 121, "votesPct": 23.7, "swing": "-13.5" },
    "Liberal Democrat": { "seats": 72, "votesPct": 12.2, "swing": "+4.1" },
    "SNP": { "seats": 43, "votesPct": 3.7, "swing": "-0.8" },
    "Reform UK": { "seats": 5, "votesPct": 14.2, "swing": "+12.1" },
    "Green": { "seats": 4, "votesPct": 7.0, "swing": "+5.1" },
    "Independent": { "seats": 9, "votesPct": 5.5, "swing": "+2.0" }
  },
  "regionalResults": {
    "Scotland": "SNP",
    "Northern Ireland": "Independent",
    "North East England": "Labour",
    "North West England": "Labour",
    "Yorkshire & the Humber": "Labour",
    "East Midlands": "Labour",
    "West Midlands": "Labour",
    "Wales": "Labour",
    "East of England": "Conservative",
    "London": "Labour",
    "South East England": "Conservative",
    "South West England": "Liberal Democrat"
  },
  "cabinet": [
    { "role": "Prime Minister", "name": "Fictional Name", "party": "Labour", "description": "One sentence biography." },
    { "role": "Chancellor of the Exchequer", "name": "Fictional Name", "party": "Labour", "description": "One sentence." },
    { "role": "Home Secretary", "name": "Fictional Name", "party": "Labour", "description": "One sentence." },
    { "role": "Foreign Secretary", "name": "Fictional Name", "party": "Labour", "description": "One sentence." },
    { "role": "Secretary of State for Health", "name": "Fictional Name", "party": "Labour", "description": "One sentence." },
    { "role": "Secretary of State for Education", "name": "Fictional Name", "party": "Labour", "description": "One sentence." },
    { "role": "Secretary of State for Defence", "name": "Fictional Name", "party": "Labour", "description": "One sentence." },
    { "role": "Secretary of State for Housing", "name": "Fictional Name", "party": "Labour", "description": "One sentence." },
    { "role": "Leader of the Opposition", "name": "Fictional Name", "party": "Conservative", "description": "One sentence." },
    { "role": "Shadow Chancellor", "name": "Fictional Name", "party": "Conservative", "description": "One sentence." },
    { "role": "SNP Westminster Leader", "name": "Fictional Name", "party": "SNP", "description": "One sentence." },
    { "role": "Liberal Democrat Leader", "name": "Fictional Name", "party": "Liberal Democrat", "description": "One sentence." }
  ],
  "headlines": [
    "Headline 1 — government victory / defeat angle",
    "Headline 2 — losing party reaction",
    "Headline 3 — third party / regional angle",
    "Headline 4 — economic or constitutional implication",
    "Headline 5 — human interest / mood piece"
  ],
  "keyFacts": [
    "Stat with number — e.g. historical comparison",
    "Stat with number — e.g. turnout or swing",
    "Stat with number — e.g. seats won/lost"
  ]
}`;

// ─── Generator ────────────────────────────────────────────────────────────────

export async function generateScenario(
  settings: AISettings
): Promise<GeneratedScenario> {
  const raw = await generateAIResponse({
    settings,
    systemPrompt:
      "You generate fictional UK election scenarios for a political simulation game. Return only valid JSON with no extra text.",
    userPrompt: SCENARIO_PROMPT,
    maxTokens: 1800,
  });

  // Strip any accidental markdown fences
  const cleaned = raw
    .replace(/^```(?:json)?/m, "")
    .replace(/```$/m, "")
    .trim();

  const parsed = JSON.parse(cleaned) as GeneratedScenario;

  // Basic validation
  if (!parsed.electionYear || !parsed.governmentParty || !parsed.results) {
    throw new Error("Incomplete scenario returned by AI.");
  }

  return parsed;
}
