"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Users,
  Building2,
  MapPin,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  ChevronRight,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/store/useGameStore";
import { getPartyColour } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/game/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/game/inbox", icon: Inbox, label: "Inbox" },
  { href: "/game/cabinet", icon: Users, label: "Cabinet & Party" },
  { href: "/game/parliament", icon: Building2, label: "Parliament" },
  { href: "/game/constituency", icon: MapPin, label: "Constituency" },
  { href: "/game/calendar", icon: Calendar, label: "Calendar" },
  { href: "/game/policy", icon: FileText, label: "Policy Creator" },
  { href: "/game/dispatch-box", icon: MessageSquare, label: "Dispatch Box" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { player, inbox } = useGameStore();
  const unreadCount = inbox.filter((e) => !e.read).length;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] flex flex-col border-r border-border/50 bg-[hsl(var(--sidebar-bg))]">
      {/* Logo / Branding */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/30">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 border border-primary/30">
          <Crown className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground tracking-wide">PROJECT</div>
          <div className="text-xs text-primary font-semibold tracking-widest">WESTMINSTER</div>
        </div>
      </div>

      {/* Player Info */}
      {player && (
        <div className="px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: getPartyColour(player.party) }}
            >
              {player.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{player.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{player.role}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">MP for</span>
            <span className="text-foreground font-medium truncate max-w-[140px]" title={player.constituency}>
              {player.constituency.split("&")[0].trim()}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const isInbox = href === "/game/inbox";

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 mb-0.5",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="flex-1">{label}</span>
              {isInbox && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white px-1">
                  {unreadCount}
                </span>
              )}
              {isActive && <ChevronRight className="h-3 w-3 text-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav */}
      <div className="border-t border-border/30 px-2 py-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
            pathname === "/settings"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings & AI
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all"
        >
          <Shield className="h-4 w-4 shrink-0" />
          New Game
        </Link>
      </div>
    </aside>
  );
}
