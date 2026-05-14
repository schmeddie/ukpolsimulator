"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  GameState,
  Player,
  WorldState,
  NPC,
  Email,
  EmailChoice,
  Policy,
  NewsItem,
  CalendarEvent,
  ChatMessage,
  GameSettings,
  AISettings,
  Background,
  Party,
  PolicyArea,
  GeneratedScenario,
} from "./types";
import { generateInitialNPCs } from "../gameData";
import { addDays } from "date-fns";

// ─── Default State ────────────────────────────────────────────────────────────

const DEFAULT_START_DATE = new Date("2024-01-15");

const defaultWorldState: WorldState = {
  currentDate: DEFAULT_START_DATE,
  inflation: 4.2,
  gdpGrowth: 0.3,
  unemployment: 4.6,
  nhsWaitTimesWeeks: 18,
  schoolRating: 62,
  crimeIndex: 54,
  publicMood: -12,
  partyUnity: 68,
  nextElectionDays: 487,
  electionYear: 2025,
  governmentParty: "Conservative",
  oppositionParty: "Labour",
  activeGlobalEvents: ["Cost of Living Crisis", "Ukraine War (ongoing)"],
  polls: {
    Labour: 42,
    Conservative: 26,
    "Liberal Democrat": 12,
    SNP: 4,
    Green: 7,
    "Reform UK": 14,
    Independent: 2,
  },
};

const defaultSettings: GameSettings = {
  ai: {
    provider: "openai",
    apiKey: "",
    model: "gpt-4o-mini",
    enabled: false,
  },
  difficulty: "Normal",
  autoSave: true,
  newsTickerSpeed: 40,
  soundEnabled: false,
};

// ─── Background Stat Buffs ────────────────────────────────────────────────────

const BACKGROUND_BUFFS: Record<Background, Partial<Pick<Player, "charisma" | "intelligence" | "integrity" | "ambition">>> = {
  "Trade Unionist":  { charisma: 5, integrity: 8, ambition: 4, intelligence: 3 },
  "City Banker":     { intelligence: 8, ambition: 8, charisma: 4, integrity: -5 },
  "Lawyer":          { intelligence: 9, charisma: 4, integrity: 3, ambition: 5 },
  "Teacher":         { integrity: 6, charisma: 5, intelligence: 5, ambition: 2 },
  "Military Officer":{ integrity: 7, charisma: 6, intelligence: 4, ambition: 6 },
  "Journalist":      { charisma: 8, intelligence: 6, integrity: 2, ambition: 7 },
  "Activist":        { integrity: 9, charisma: 7, intelligence: 3, ambition: 6 },
  "Business Owner":  { ambition: 8, intelligence: 6, charisma: 5, integrity: 1 },
};

// ─── Store Actions Type ───────────────────────────────────────────────────────

interface GameActions {
  // Game flow
  setScenario: (scenario: GeneratedScenario) => void;
  startGame: (name: string, party: Party, background: Background, constituency: string) => void;
  advanceTurn: (days?: number) => void;
  resetGame: () => void;

  // Player
  updatePlayerStat: (key: keyof Player, value: number) => void;
  addScandal: (description: string, severity: 1 | 2 | 3 | 4 | 5) => void;

  // World
  updateWorldState: (updates: Partial<WorldState>) => void;

  // Inbox
  addEmail: (email: Omit<Email, "id" | "date" | "read">) => void;
  markEmailRead: (id: string) => void;
  chooseEmailOption: (emailId: string, choiceId: string) => void;

  // Policy
  addPolicy: (policy: Omit<Policy, "id" | "introducedDate" | "status" | "votesFor" | "votesAgainst" | "abstentions">) => void;
  submitPolicyToHouse: (policyId: string) => void;
  updatePolicyStatus: (policyId: string, status: Policy["status"]) => void;

  // News
  addNewsItem: (item: Omit<NewsItem, "id" | "date">) => void;

  // Calendar
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  attendEvent: (eventId: string, outcome: string) => void;

  // Dispatch Box
  addDispatchMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearDispatchHistory: () => void;

  // Settings
  updateAISettings: (settings: Partial<AISettings>) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;

  // NPCs
  updateNPCRelationship: (npcId: string, delta: number) => void;
}

// ─── Initial Inbox Emails ─────────────────────────────────────────────────────

function buildWelcomeEmails(player: Player, worldState: WorldState): Email[] {
  return [
    {
      id: uuidv4(),
      from: "Graham Ashworth",
      fromRole: "Chief Whip",
      subject: "Welcome to the House — A Word From the Chief Whip",
      body: `Dear ${player.name},\n\nWelcome to Parliament. I trust your journey here was uneventful.\n\nAs Chief Whip, my job is to ensure the Government maintains its majority. Your job — for now — is to vote as instructed and keep your head down. Build trust before you build ambitions.\n\nThe party is watching. We remember friends.\n\nYours,\nGraham Ashworth\nChief Whip`,
      date: worldState.currentDate,
      read: false,
      urgent: false,
      aiGenerated: false,
    },
    {
      id: uuidv4(),
      from: "Maureen Fletcher",
      fromRole: "Constituent",
      subject: "A&E wait times — something has to be done",
      body: `Dear ${player.name},\n\nI'm writing because my mother waited 11 hours in A&E at the Royal last Tuesday. Eleven hours. She is 82.\n\nI voted for you because you promised to fix our local hospital. Please don't forget the people who put you there.\n\nMaureen Fletcher\n${player.constituency}`,
      date: worldState.currentDate,
      read: false,
      urgent: false,
      aiGenerated: false,
      choices: [
        {
          id: uuidv4(),
          label: "Promise to raise it in Parliament",
          consequence: "Boosts local approval slightly, costs party loyalty",
          effects: { localApproval: 3, partyLoyaltyScore: -2 },
        },
        {
          id: uuidv4(),
          label: "Send a sympathetic form letter",
          consequence: "No cost, no gain",
          effects: {},
        },
        {
          id: uuidv4(),
          label: "Ignore",
          consequence: "Small dip in local approval",
          effects: { localApproval: -3 },
        },
      ],
    },
    {
      id: uuidv4(),
      from: "Nick Hardman",
      fromRole: "Journalist",
      subject: "Request for comment — party funding story",
      body: `Hi ${player.name},\n\nI'm working on a piece for The Times about donor influence on new MPs. Nothing accusatory — I'm after a quote about maintaining independence.\n\nDeadline is Thursday. Happy to discuss off the record first.\n\nNick Hardman\nPolitical Correspondent, The Times`,
      date: worldState.currentDate,
      read: false,
      urgent: true,
      aiGenerated: false,
      choices: [
        {
          id: uuidv4(),
          label: "Speak on the record — defend party integrity",
          consequence: "Media profile rises, party may be displeased",
          effects: { mediaProfile: 8, partyLoyaltyScore: -4 },
        },
        {
          id: uuidv4(),
          label: "Decline to comment",
          consequence: "Safe choice",
          effects: {},
        },
        {
          id: uuidv4(),
          label: "Brief against a colleague",
          consequence: "Journalist becomes an asset, integrity dips",
          effects: { mediaProfile: 5, integrity: -6 },
        },
      ],
    },
  ];
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      // ── Initial State ────────────────────────────────────────────────────────
      phase: "character-creation",
      scenario: null,
      player: null,
      worldState: defaultWorldState,
      npcs: [],
      inbox: [],
      policies: [],
      news: [
        {
          id: uuidv4(),
          headline: "PM faces backbench revolt over NHS funding",
          date: DEFAULT_START_DATE,
          sentiment: "negative",
          aiGenerated: false,
          source: "BBC Politics",
        },
        {
          id: uuidv4(),
          headline: "Inflation falls to 4.2% — Chancellor hails 'turning point'",
          date: DEFAULT_START_DATE,
          sentiment: "positive",
          aiGenerated: false,
          source: "The Telegraph",
        },
        {
          id: uuidv4(),
          headline: "New MPs arrive at Westminster for first session",
          date: DEFAULT_START_DATE,
          sentiment: "neutral",
          aiGenerated: false,
          source: "PA Media",
        },
        {
          id: uuidv4(),
          headline: "Opposition demands emergency debate on housing crisis",
          date: DEFAULT_START_DATE,
          sentiment: "neutral",
          aiGenerated: false,
          source: "The Guardian",
        },
        {
          id: uuidv4(),
          headline: "Poll: Reform UK surges to 14% — UKIP echo or lasting force?",
          date: DEFAULT_START_DATE,
          sentiment: "neutral",
          aiGenerated: false,
          source: "YouGov / Sky News",
        },
      ],
      calendar: [],
      dispatchBoxHistory: [],
      settings: defaultSettings,
      turnCount: 0,
      lastSaved: null,

      // ── Game Flow ────────────────────────────────────────────────────────────
      setScenario: (scenario) => set({ scenario }),

      startGame: (name, party, background, constituency) => {
        const buffs = BACKGROUND_BUFFS[background];
        const baseStats = { charisma: 40, intelligence: 40, integrity: 50, ambition: 45 };
        const player: Player = {
          id: uuidv4(),
          name,
          party,
          background,
          role: "Backbencher",
          constituency,
          constituencyRegion: "England",
          charisma: Math.min(100, baseStats.charisma + (buffs.charisma ?? 0)),
          intelligence: Math.min(100, baseStats.intelligence + (buffs.intelligence ?? 0)),
          integrity: Math.min(100, Math.max(0, baseStats.integrity + (buffs.integrity ?? 0))),
          ambition: Math.min(100, baseStats.ambition + (buffs.ambition ?? 0)),
          approvalRating: 38,
          localApproval: 52,
          partyLoyaltyScore: 65,
          mediaProfile: 10,
          wealth: 50,
          experience: 0,
          scandals: [],
          achievements: [],
        };

        // Build world state from scenario if available
        const sc = get().scenario;
        const ws: WorldState = sc
          ? {
              ...defaultWorldState,
              currentDate: new Date(`${sc.electionYear}-01-15`),
              governmentParty: sc.governmentParty,
              oppositionParty: sc.results
                ? (Object.entries(sc.results)
                    .filter(([p]) => p !== sc.governmentParty)
                    .sort(([, a], [, b]) => (b?.seats ?? 0) - (a?.seats ?? 0))[0]?.[0] as Party) ?? "Conservative"
                : "Conservative",
              polls: Object.fromEntries(
                Object.entries(sc.results ?? {}).map(([p, r]) => [p, r?.votesPct ?? 0])
              ) as Record<Party, number>,
              nextElectionDays: 5 * 365,
              electionYear: sc.electionYear + 5,
              partyUnity:
                party === sc.governmentParty ? 70 : 55,
            }
          : { ...defaultWorldState };

        // Build NPCs: use scenario cabinet first, then random MPs
        const npcs = generateInitialNPCs(party, sc?.cabinet ?? []);
        const inbox = buildWelcomeEmails(player, ws);

        // Seed first calendar events
        const calendar: CalendarEvent[] = [
          {
            id: uuidv4(),
            title: "PMQs — First Session",
            description: "Prime Minister's Questions. A chance to make your voice heard (or stay quiet).",
            date: addDays(ws.currentDate, 2),
            type: "PMQs",
            mandatory: true,
            attended: false,
          },
          {
            id: uuidv4(),
            title: "Constituency Surgery",
            description: "Meet local residents and hear their concerns.",
            date: addDays(ws.currentDate, 5),
            type: "Constituency",
            mandatory: false,
            attended: false,
          },
        ];

        set({
          phase: "playing",
          player,
          worldState: ws,
          npcs,
          inbox,
          calendar,
          turnCount: 0,
          lastSaved: new Date(),
        });
      },

      advanceTurn: (days = 7) => {
        const state = get();
        if (!state.player) return;

        const newDate = addDays(state.worldState.currentDate, days);
        const daysToElection = Math.max(0, state.worldState.nextElectionDays - days);

        // Mild random world drift
        const moodDrift = (Math.random() - 0.5) * 4;
        const unityDrift = (Math.random() - 0.5) * 3;

        // Generate a random news item (non-AI)
        const staticHeadlines = [
          { headline: "Chancellor hints at pre-election tax cut", sentiment: "positive" as const, source: "The Sun" },
          { headline: "NHS waiting list hits record 7.8 million", sentiment: "negative" as const, source: "BBC Health" },
          { headline: "Housing starts fall for third consecutive quarter", sentiment: "negative" as const, source: "Financial Times" },
          { headline: "PM's approval rating edges up after trade deal announcement", sentiment: "positive" as const, source: "YouGov" },
          { headline: "Backbenchers threaten rebellion over Rwanda plan", sentiment: "negative" as const, source: "The Guardian" },
          { headline: "Energy bills to fall 7% from next quarter", sentiment: "positive" as const, source: "BBC Business" },
          { headline: "Strike action averted as rail unions accept deal", sentiment: "positive" as const, source: "PA Media" },
          { headline: "Foreign Secretary summoned over ambassador gaffe", sentiment: "negative" as const, source: "Sky News" },
          { headline: "Party conference season: internal splits dominate coverage", sentiment: "negative" as const, source: "Political Quarterly" },
          { headline: "New polling shows voters want more NHS investment above tax cuts", sentiment: "neutral" as const, source: "Opinium" },
        ];
        const picked = staticHeadlines[Math.floor(Math.random() * staticHeadlines.length)];
        const newNews: NewsItem = {
          id: uuidv4(),
          headline: picked.headline,
          date: newDate,
          sentiment: picked.sentiment,
          aiGenerated: false,
          source: picked.source,
        };

        set((s) => ({
          worldState: {
            ...s.worldState,
            currentDate: newDate,
            nextElectionDays: daysToElection,
            publicMood: Math.max(-100, Math.min(100, s.worldState.publicMood + moodDrift)),
            partyUnity: Math.max(0, Math.min(100, s.worldState.partyUnity + unityDrift)),
          },
          news: [newNews, ...s.news].slice(0, 50),
          turnCount: s.turnCount + 1,
          lastSaved: new Date(),
          player: s.player
            ? { ...s.player, experience: s.player.experience + 1 }
            : null,
        }));
      },

      resetGame: () =>
        set({
          phase: "character-creation",
          scenario: null,
          player: null,
          worldState: defaultWorldState,
          npcs: [],
          inbox: [],
          policies: [],
          news: [],
          calendar: [],
          dispatchBoxHistory: [],
          turnCount: 0,
        }),

      // ── Player ───────────────────────────────────────────────────────────────
      updatePlayerStat: (key, value) =>
        set((s) =>
          s.player
            ? { player: { ...s.player, [key]: value } }
            : {}
        ),

      addScandal: (description, severity) =>
        set((s) =>
          s.player
            ? {
                player: {
                  ...s.player,
                  scandals: [
                    ...s.player.scandals,
                    { id: uuidv4(), description, severity, date: s.worldState.currentDate, resolved: false },
                  ],
                  approvalRating: Math.max(0, s.player.approvalRating - severity * 5),
                  integrity: Math.max(0, s.player.integrity - severity * 3),
                },
              }
            : {}
        ),

      // ── World ────────────────────────────────────────────────────────────────
      updateWorldState: (updates) =>
        set((s) => ({ worldState: { ...s.worldState, ...updates } })),

      // ── Inbox ────────────────────────────────────────────────────────────────
      addEmail: (email) =>
        set((s) => ({
          inbox: [
            {
              ...email,
              id: uuidv4(),
              date: s.worldState.currentDate,
              read: false,
            },
            ...s.inbox,
          ],
        })),

      markEmailRead: (id) =>
        set((s) => ({
          inbox: s.inbox.map((e) => (e.id === id ? { ...e, read: true } : e)),
        })),

      chooseEmailOption: (emailId, choiceId) =>
        set((s) => {
          const email = s.inbox.find((e) => e.id === emailId);
          if (!email || !email.choices) return {};
          const choice = email.choices.find((c) => c.id === choiceId);
          if (!choice) return {};

          const playerUpdates: Partial<Player> = {};
          const worldUpdates: Partial<WorldState> = {};

          const ef = choice.effects;
          if (s.player) {
            if (ef.approvalRating !== undefined) playerUpdates.approvalRating = Math.max(0, Math.min(100, s.player.approvalRating + ef.approvalRating));
            if (ef.partyLoyaltyScore !== undefined) playerUpdates.partyLoyaltyScore = Math.max(0, Math.min(100, s.player.partyLoyaltyScore + ef.partyLoyaltyScore));
            if (ef.localApproval !== undefined) playerUpdates.localApproval = Math.max(0, Math.min(100, s.player.localApproval + ef.localApproval));
            if (ef.integrity !== undefined) playerUpdates.integrity = Math.max(0, Math.min(100, s.player.integrity + ef.integrity));
            if (ef.charisma !== undefined) playerUpdates.charisma = Math.max(0, Math.min(100, s.player.charisma + ef.charisma));
            if (ef.wealth !== undefined) playerUpdates.wealth = s.player.wealth + ef.wealth;
            if (ef.mediaProfile !== undefined) playerUpdates.mediaProfile = Math.max(0, Math.min(100, s.player.mediaProfile + ef.mediaProfile));
          }
          if (ef.publicMood !== undefined) worldUpdates.publicMood = Math.max(-100, Math.min(100, s.worldState.publicMood + ef.publicMood));
          if (ef.inflation !== undefined) worldUpdates.inflation = Math.max(0, s.worldState.inflation + ef.inflation);

          return {
            inbox: s.inbox.map((e) =>
              e.id === emailId ? { ...e, read: true, chosenId: choiceId } : e
            ),
            player: s.player ? { ...s.player, ...playerUpdates } : null,
            worldState: { ...s.worldState, ...worldUpdates },
          };
        }),

      // ── Policy ───────────────────────────────────────────────────────────────
      addPolicy: (policy) =>
        set((s) => ({
          policies: [
            {
              ...policy,
              id: uuidv4(),
              introducedDate: s.worldState.currentDate,
              status: "draft",
              votesFor: 0,
              votesAgainst: 0,
              abstentions: 0,
            },
            ...s.policies,
          ],
        })),

      submitPolicyToHouse: (policyId) =>
        set((s) => {
          const policy = s.policies.find((p) => p.id === policyId);
          if (!policy || !s.player) return {};

          // Calculate vote outcome based on party unity + charisma
          const partyBonus = s.worldState.partyUnity / 100;
          const charismaBonus = s.player.charisma / 200;
          const basePassChance = 0.4 + partyBonus * 0.4 + charismaBonus * 0.2;
          const passed = Math.random() < basePassChance;

          const totalMPs = 650;
          const votesFor = passed
            ? Math.floor(totalMPs * (0.5 + Math.random() * 0.15))
            : Math.floor(totalMPs * (0.35 + Math.random() * 0.15));
          const votesAgainst = totalMPs - votesFor - Math.floor(Math.random() * 20);

          const approvalDelta = passed ? 3 : -2;
          const unityDelta = passed ? 2 : -4;

          return {
            policies: s.policies.map((p) =>
              p.id === policyId
                ? { ...p, status: passed ? "passed" : "failed", votesFor, votesAgainst, abstentions: totalMPs - votesFor - votesAgainst }
                : p
            ),
            player: { ...s.player, approvalRating: Math.max(0, Math.min(100, s.player.approvalRating + approvalDelta)) },
            worldState: { ...s.worldState, partyUnity: Math.max(0, Math.min(100, s.worldState.partyUnity + unityDelta)) },
          };
        }),

      updatePolicyStatus: (policyId, status) =>
        set((s) => ({
          policies: s.policies.map((p) => (p.id === policyId ? { ...p, status } : p)),
        })),

      // ── News ─────────────────────────────────────────────────────────────────
      addNewsItem: (item) =>
        set((s) => ({
          news: [
            { ...item, id: uuidv4(), date: s.worldState.currentDate },
            ...s.news,
          ].slice(0, 50),
        })),

      // ── Calendar ─────────────────────────────────────────────────────────────
      addCalendarEvent: (event) =>
        set((s) => ({
          calendar: [...s.calendar, { ...event, id: uuidv4() }],
        })),

      attendEvent: (eventId, outcome) =>
        set((s) => ({
          calendar: s.calendar.map((e) =>
            e.id === eventId ? { ...e, attended: true, outcome } : e
          ),
        })),

      // ── Dispatch Box ─────────────────────────────────────────────────────────
      addDispatchMessage: (msg) =>
        set((s) => ({
          dispatchBoxHistory: [
            ...s.dispatchBoxHistory,
            { ...msg, id: uuidv4(), timestamp: new Date() },
          ],
        })),

      clearDispatchHistory: () => set({ dispatchBoxHistory: [] }),

      // ── Settings ─────────────────────────────────────────────────────────────
      updateAISettings: (settings) =>
        set((s) => ({
          settings: { ...s.settings, ai: { ...s.settings.ai, ...settings } },
        })),

      updateSettings: (settings) =>
        set((s) => ({ settings: { ...s.settings, ...settings } })),

      // ── NPCs ──────────────────────────────────────────────────────────────────
      updateNPCRelationship: (npcId, delta) =>
        set((s) => ({
          npcs: s.npcs.map((n) =>
            n.id === npcId
              ? {
                  ...n,
                  loyaltyToPlayer: Math.max(-100, Math.min(100, n.loyaltyToPlayer + delta)),
                }
              : n
          ),
        })),
    }),
    {
      name: "westminster-save",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        phase: state.phase,
        scenario: state.scenario,
        player: state.player,
        worldState: state.worldState,
        npcs: state.npcs,
        inbox: state.inbox,
        policies: state.policies,
        news: state.news,
        calendar: state.calendar,
        settings: state.settings,
        turnCount: state.turnCount,
        dispatchBoxHistory: state.dispatchBoxHistory,
      }),
    }
  )
);
