// ─── Enums ────────────────────────────────────────────────────────────────────

export type Party =
  | "Labour"
  | "Conservative"
  | "Liberal Democrat"
  | "SNP"
  | "Green"
  | "Reform UK"
  | "Independent";

export type Background =
  | "Trade Unionist"
  | "City Banker"
  | "Lawyer"
  | "Teacher"
  | "Military Officer"
  | "Journalist"
  | "Activist"
  | "Business Owner";

export type Role =
  | "Backbencher"
  | "Parliamentary Private Secretary"
  | "Junior Minister"
  | "Cabinet Minister"
  | "Shadow Cabinet"
  | "Party Leader"
  | "Prime Minister"
  | "Leader of the Opposition";

export type PolicyArea =
  | "Economy"
  | "NHS"
  | "Housing"
  | "Education"
  | "Defence"
  | "Environment"
  | "Immigration"
  | "Crime"
  | "Welfare"
  | "Foreign Policy";

export type NPCTrait =
  | "Loyal"
  | "Ambitious"
  | "Chaos Agent"
  | "Principled"
  | "Opportunist"
  | "Idealist"
  | "Pragmatist"
  | "Backstabber"
  | "Media Savvy"
  | "Grassroots Hero";

export type EmailSender =
  | "Chief Whip"
  | "Constituent"
  | "Lobbyist"
  | "Journalist"
  | "Party HQ"
  | "Cabinet Office"
  | "NPC MP"
  | "Think Tank"
  | "Foreign Ambassador";

export type PolicyStatus = "draft" | "submitted" | "passed" | "failed" | "withdrawn";

export type Newssentiment = "positive" | "negative" | "neutral" | "scandal";

export type GamePhase = "character-creation" | "playing" | "election" | "game-over";

// ─── Player ───────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  party: Party;
  background: Background;
  role: Role;
  constituency: string;
  constituencyRegion: string;
  // Core stats (0–100)
  charisma: number;
  intelligence: number;
  integrity: number;
  ambition: number;
  // Derived / tracked
  approvalRating: number;    // national 0–100
  localApproval: number;     // constituency 0–100
  partyLoyaltyScore: number; // 0–100; affects promotions
  mediaProfile: number;      // 0–100; affects news coverage
  wealth: number;            // abstract units
  experience: number;        // total "actions" taken
  scandals: Scandal[];
  achievements: string[];
  // BYOK settings (stored separately in settings slice)
}

// ─── World State ──────────────────────────────────────────────────────────────

export interface WorldState {
  currentDate: Date;
  // Economic indicators
  inflation: number;          // %
  gdpGrowth: number;          // %
  unemployment: number;       // %
  // Public services
  nhsWaitTimesWeeks: number;
  schoolRating: number;       // 0–100
  crimeIndex: number;         // higher = worse
  // Political
  publicMood: number;         // -100 to 100 (higher = positive)
  partyUnity: number;         // 0–100 for player's party
  nextElectionDays: number;
  electionYear: number;
  governmentParty: Party;
  oppositionParty: Party;
  // Global events
  activeGlobalEvents: string[];
  // Poll tracker
  polls: Record<Party, number>;
}

// ─── NPC ──────────────────────────────────────────────────────────────────────

export interface NPC {
  id: string;
  name: string;
  party: Party;
  role: Role;
  constituency: string;
  traits: NPCTrait[];
  // Policy stances (-100 = strongly oppose, +100 = strongly support)
  stances: Record<PolicyArea, number>;
  // Relationships
  loyaltyToPlayer: number;    // -100 to 100
  personalRelationship: number; // -100 to 100
  // Career
  ministerialRole?: string;
  isInCabinet: boolean;
  // Hidden info
  hiddenAgenda?: string;
  corruptionLevel: number;    // 0–100
  // AI personality seed
  personalityDescription: string;
}

// ─── Email System ─────────────────────────────────────────────────────────────

export interface EmailChoice {
  id: string;
  label: string;
  consequence: string;    // Human-readable description
  effects: Partial<{
    approvalRating: number;
    partyUnity: number;
    partyLoyaltyScore: number;
    localApproval: number;
    inflation: number;
    publicMood: number;
    integrity: number;
    charisma: number;
    wealth: number;
    mediaProfile: number;
  }>;
}

export interface Email {
  id: string;
  from: string;
  fromRole: EmailSender;
  subject: string;
  body: string;
  date: Date;
  read: boolean;
  urgent: boolean;
  choices?: EmailChoice[];
  chosenId?: string;
  aiGenerated: boolean;
  relatedNPCId?: string;
}

// ─── Policy ───────────────────────────────────────────────────────────────────

export interface PolicyParameter {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  area: PolicyArea;
  parameters: PolicyParameter[];
  status: PolicyStatus;
  introducedDate: Date;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  predictedEffect?: string;
  actualEffect?: string;
  supportingNPCIds: string[];
  opposingNPCIds: string[];
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  headline: string;
  date: Date;
  sentiment: Newssentiment;
  aiGenerated: boolean;
  relatedPolicyId?: string;
  relatedNPCId?: string;
  source: string; // e.g. "BBC Politics", "The Sun", "The Guardian"
}

// ─── Scandal ──────────────────────────────────────────────────────────────────

export interface Scandal {
  id: string;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  date: Date;
  resolved: boolean;
}

// ─── Calendar Event ───────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: "PMQs" | "Vote" | "Committee" | "Constituency" | "Party" | "Media" | "Crisis" | "Personal";
  mandatory: boolean;
  attended: boolean;
  outcome?: string;
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  speaker?: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AISettings {
  provider: "openai" | "anthropic" | "openrouter" | "custom";
  apiKey: string;
  model: string;
  enabled: boolean;
  baseUrl?: string;
}

export interface GameSettings {
  ai: AISettings;
  difficulty: "Easy" | "Normal" | "Hard" | "Realistic";
  autoSave: boolean;
  newsTickerSpeed: number;
  soundEnabled: boolean;
}

// ─── Generated Scenario ───────────────────────────────────────────────────────

export interface ScenarioCabinetMember {
  role: string;
  name: string;
  party: Party;
  description: string;
}

export interface ScenarioPartyResult {
  seats: number;
  votesPct: number;
  swing: string;
}

export interface GeneratedScenario {
  electionYear: number;
  electionHeadline: string;
  governmentParty: Party;
  primeMinister: string;
  majoritySize: number;          // negative = minority govt
  politicalContext: string;
  results: Partial<Record<Party, ScenarioPartyResult>>;
  regionalResults: Record<string, Party>;  // UK region → winning party
  cabinet: ScenarioCabinetMember[];
  headlines: string[];
  keyFacts: string[];
}

// ─── Full Game State ──────────────────────────────────────────────────────────

export interface GameState {
  phase: GamePhase;
  scenario: GeneratedScenario | null;
  player: Player | null;
  worldState: WorldState;
  npcs: NPC[];
  inbox: Email[];
  policies: Policy[];
  news: NewsItem[];
  calendar: CalendarEvent[];
  dispatchBoxHistory: ChatMessage[];
  settings: GameSettings;
  turnCount: number;
  lastSaved: Date | null;
}
