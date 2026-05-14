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
import { addDays, addHours } from "date-fns";
import { generateAIResponse, buildEmailSystemPrompt, buildReplyEmailPrompt, buildNPCProfilePrompt } from "../ai/aiClient";

// ─── Extended Types ───────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  competence: number;
  loyalty: number;
  personality: string;
  profileStr?: string; // Stored AI-generated profile
}

export interface FreeformEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
}

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

interface ExtendedState {
  staff: StaffMember[];
  sentEmails: FreeformEmail[];
  isAdvancing: boolean; // Use this to disable the advance button in UI while AI loads
}

interface GameActions {
  // Game flow
  setScenario: (scenario: GeneratedScenario) => void;
  startGame: (name: string, party: Party, background: Background, constituency: string) => void;
  advanceTurn: () => Promise<void>;
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
  sendFreeformEmail: (toName: string, toRole: string, subject: string, body: string) => Promise<void>;

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
  generateProfile: (id: string, isStaff: boolean) => Promise<string | null>;
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

export const useGameStore = create<GameState & ExtendedState & GameActions>()(
  persist(
    (set, get) => ({
      // ── Initial State ────────────────────────────────────────────────────────
      phase: "character-creation",
      scenario: null,
      player: null,
      worldState: defaultWorldState,
      npcs: [],
      staff: [],
      inbox: [],
      sentEmails: [],
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
      isAdvancing: false,

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

        // Build NPCs: use scenario cabinet first, then dynamically generate the remaining seats up to 650
        const npcs = generateInitialNPCs(party, sc);
        const inbox = buildWelcomeEmails(player, ws);
        
        // Generate immediate staff team
        const staff: StaffMember[] = [
          { id: uuidv4(), name: "Samira Patel", role: "Chief of Staff", competence: 80, loyalty: 90, personality: "Highly organized, fiercely protective." },
          { id: uuidv4(), name: "Tom Jenkins", role: "Head of Communications", competence: 75, loyalty: 70, personality: "Media-obsessed spinner, slightly cynical." },
          { id: uuidv4(), name: "Eleanor Vance", role: "Constituency Manager", competence: 85, loyalty: 80, personality: "Deeply embedded in local issues, warm but stressed." }
        ];

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
          staff,
          inbox,
          sentEmails: [],
          calendar,
          turnCount: 0,
          lastSaved: new Date(),
          isAdvancing: false,
        });
      },

      advanceTurn: async () => {
        const state = get();
        if (!state.player || state.isAdvancing) return;

        set({ isAdvancing: true });

        try {
          const now = state.worldState.currentDate;
          const upcoming = state.calendar.filter(e => new Date(e.date) > now).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // Jump to the next event, but max out at 24 hours of idle time
          let nextDate = upcoming.length > 0 ? new Date(upcoming[0].date) : addHours(now, 24);
          const maxAdvanceMs = 24 * 60 * 60 * 1000;
          if (nextDate.getTime() - now.getTime() > maxAdvanceMs) {
              nextDate = new Date(now.getTime() + maxAdvanceMs);
          }

          // Roll to see if a random AI event intercepts the timeline before nextDate (40% chance if AI enabled)
          let generatedEmail = null;
          if (state.settings.ai.enabled && Math.random() < 0.4) {
             const randomMs = Math.random() * (nextDate.getTime() - now.getTime());
             nextDate = new Date(now.getTime() + randomMs);

             try {
                const rawJson = await generateAIResponse({
                   settings: state.settings.ai,
                   systemPrompt: buildEmailSystemPrompt(state.player, state.worldState),
                   userPrompt: "Generate a new spontaneous email event for the player. Output valid JSON only.",
                   maxTokens: 350
                });
                const cleanJson = rawJson.replace(/^```(?:json)?/m, "").replace(/```$/m, "").trim();
                generatedEmail = JSON.parse(cleanJson);
             } catch (err) {
                console.warn("AI Email generation failed:", err);
             }
          }

          const hoursPassed = (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          const daysPassed = hoursPassed / 24;

          const daysToElection = Math.max(0, state.worldState.nextElectionDays - daysPassed);
          const moodDrift = (Math.random() - 0.5) * 4 * daysPassed;
          const unityDrift = (Math.random() - 0.5) * 3 * daysPassed;

          set((s) => ({
            worldState: {
              ...s.worldState,
              currentDate: nextDate,
              nextElectionDays: daysToElection,
              publicMood: Math.max(-100, Math.min(100, s.worldState.publicMood + moodDrift)),
              partyUnity: Math.max(0, Math.min(100, s.worldState.partyUnity + unityDrift)),
            },
            turnCount: s.turnCount + 1,
            lastSaved: new Date(),
            isAdvancing: false,
            player: s.player ? { ...s.player, experience: s.player.experience + (daysPassed * 0.1) } : null,
          }));

          if (generatedEmail) {
             get().addEmail({ ...generatedEmail, date: nextDate, aiGenerated: true, read: false, urgent: generatedEmail.urgent || false });
          }
        } catch (error) {
          console.error("Advance Turn failed:", error);
          set({ isAdvancing: false });
        }
      },

      resetGame: () =>
        set({
          phase: "character-creation",
          scenario: null,
          player: null,
          worldState: defaultWorldState,
          npcs: [],
          staff: [],
          inbox: [],
          sentEmails: [],
          policies: [],
          news: [],
          calendar: [],
          dispatchBoxHistory: [],
          turnCount: 0,
          isAdvancing: false,
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

      sendFreeformEmail: async (toName, toRole, subject, body) => {
        const state = get();
        if (!state.player) return;

        // 1. Record the sent email
        const newSent: FreeformEmail = {
          id: uuidv4(),
          to: toName,
          subject,
          body,
          date: state.worldState.currentDate,
        };
        set((s) => ({ sentEmails: [newSent, ...s.sentEmails] }));

        if (!state.settings.ai.enabled) {
          get().addEmail({ from: toName, fromRole: toRole, subject: "Re: " + subject, body: "I have received your email, but my AI assistant is currently offline.", aiGenerated: false, urgent: false });
          return;
        }

        // 2. Query AI for a reply
        try {
          const prompt = buildReplyEmailPrompt(toName, toRole, subject, body, state.player, state.worldState);
          const rawJson = await generateAIResponse({
            settings: state.settings.ai,
            systemPrompt: prompt,
            userPrompt: "Write a reply to the player's email. Output valid JSON only.",
            maxTokens: 300
          });
          const cleanJson = rawJson.replace(/^```(?:json)?/m, "").replace(/```$/m, "").trim();
          const reply = JSON.parse(cleanJson);

          // Fast-forward 30 minutes for the response
          const replyDate = new Date(state.worldState.currentDate.getTime() + 30 * 60 * 1000);
          get().addEmail({ from: toName, fromRole: toRole, subject: reply.subject || "Re: " + subject, body: reply.body, aiGenerated: true, urgent: false });
        } catch (err) {
          console.error("Failed to generate email reply", err);
        }
      },

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

      generateProfile: async (id, isStaff) => {
        const state = get();
        if (!state.player || !state.settings.ai.enabled) return null;

        let targetName = ""; let targetRole = ""; let targetDesc = "";

        if (isStaff) {
          const s = state.staff.find(x => x.id === id);
          if (!s) return null;
          targetName = s.name; targetRole = s.role; targetDesc = s.personality;
        } else {
          const n = state.npcs.find(x => x.id === id);
          if (!n) return null;
          targetName = n.name; targetRole = n.role; targetDesc = n.personalityDescription;
        }

        try {
          const prompt = buildNPCProfilePrompt(targetName, targetRole, targetDesc, state.player, state.worldState);
          const profileText = await generateAIResponse({ settings: state.settings.ai, systemPrompt: "You are an expert political profiler.", userPrompt: prompt, maxTokens: 400 });
          
          if (isStaff) set((s) => ({ staff: s.staff.map(st => st.id === id ? { ...st, profileStr: profileText } : st) }));
          else set((s) => ({ npcs: s.npcs.map(npc => npc.id === id ? ({ ...npc, profileStr: profileText } as any) : npc) }));
          
          return profileText;
        } catch (err) {
          console.error("Profile gen failed", err);
          return null;
        }
      }
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
        staff: state.staff,
        inbox: state.inbox,
        sentEmails: state.sentEmails,
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
