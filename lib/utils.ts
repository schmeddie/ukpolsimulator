import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { Party } from "./store/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGameDate(date: Date | string): string {
  return format(new Date(date), "d MMMM yyyy");
}

export function formatShortDate(date: Date | string): string {
  return format(new Date(date), "dd MMM");
}

export function formatRelativeDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getPartyColour(party: Party): string {
  const colours: Record<Party, string> = {
    Labour: "#e4003b",
    Conservative: "#0087dc",
    "Liberal Democrat": "#faa61a",
    SNP: "#fff95d",
    Green: "#02a95b",
    "Reform UK": "#12b6cf",
    Independent: "#888888",
  };
  return colours[party] ?? "#888888";
}

export function getPartyBgClass(party: Party): string {
  const classes: Record<Party, string> = {
    Labour: "bg-party-labour",
    Conservative: "bg-party-tory",
    "Liberal Democrat": "bg-party-libdem",
    SNP: "bg-party-snp",
    Green: "bg-party-green",
    "Reform UK": "bg-party-reform",
    Independent: "bg-party-independent",
  };
  return classes[party] ?? "bg-muted";
}

export function getStatColour(value: number, inverse = false): string {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return "text-green-400";
  if (v >= 50) return "text-yellow-400";
  if (v >= 30) return "text-orange-400";
  return "text-red-400";
}

export function getMoodLabel(mood: number): string {
  if (mood >= 30) return "Optimistic";
  if (mood >= 10) return "Content";
  if (mood >= -10) return "Neutral";
  if (mood >= -30) return "Frustrated";
  if (mood >= -60) return "Angry";
  return "Despairing";
}

export function getRoleRank(role: string): number {
  const ranks: Record<string, number> = {
    "Backbencher": 1,
    "Parliamentary Private Secretary": 2,
    "Junior Minister": 3,
    "Shadow Cabinet": 4,
    "Cabinet Minister": 5,
    "Leader of the Opposition": 6,
    "Party Leader": 6,
    "Prime Minister": 7,
  };
  return ranks[role] ?? 0;
}

export function clampStat(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function sentimentColour(sentiment: string): string {
  switch (sentiment) {
    case "positive": return "text-green-400";
    case "negative": return "text-red-400";
    case "scandal": return "text-orange-400";
    default: return "text-muted-foreground";
  }
}

export function sentimentDot(sentiment: string): string {
  switch (sentiment) {
    case "positive": return "bg-green-400";
    case "negative": return "bg-red-400";
    case "scandal": return "bg-orange-400";
    default: return "bg-slate-400";
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}
