"use client";

import { useState } from "react";
import { Calendar, CheckCircle, Circle, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGameStore } from "@/lib/store/useGameStore";
import { formatGameDate, formatGameDateTime, formatShortDate, cn } from "@/lib/utils";

const EVENT_TYPE_COLOURS: Record<string, string> = {
  PMQs: "bg-red-500/10 text-red-400 border-red-500/20",
  Vote: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Committee: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Constituency: "bg-green-500/10 text-green-400 border-green-500/20",
  Party: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Media: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Crisis: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Personal: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function CalendarPage() {
  const { calendar, attendEvent, worldState, addCalendarEvent } = useGameStore();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const upcoming = calendar
    .filter((e) => !e.attended)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const past = calendar
    .filter((e) => e.attended)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const event = calendar.find((e) => e.id === selectedEvent);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Parliamentary Calendar</h1>
          <p className="text-sm text-muted-foreground">Current time: {formatGameDateTime(worldState.currentDate)}</p>
        </div>
      </div>

      {/* Upcoming events */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No upcoming events. Click Continue to advance time.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((evt) => (
              <Card
                key={evt.id}
                className={cn(
                  "cursor-pointer hover:border-border/80 transition-colors",
                  evt.mandatory && "border-l-2 border-l-red-400"
                )}
                onClick={() => setSelectedEvent(evt.id)}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    <Circle className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">{evt.title}</h3>
                      <span className={cn("text-[10px] border rounded px-1.5 py-0.5 font-medium", EVENT_TYPE_COLOURS[evt.type])}>
                        {evt.type}
                      </span>
                      {evt.mandatory && (
                        <Badge variant="destructive" className="text-[10px]">Mandatory</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{evt.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-medium text-foreground">{formatShortDate(evt.date)}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                      <Clock className="h-2.5 w-2.5" />
                      Pending
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past events */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Completed</h2>
          <div className="space-y-2">
            {past.slice(0, 5).map((evt) => (
              <div
                key={evt.id}
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border/40 text-sm opacity-60"
              >
                <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                <span className="flex-1 text-foreground/80">{evt.title}</span>
                <span className="text-[11px] text-muted-foreground">{formatShortDate(evt.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attend event dialog */}
      {event && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{event.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <div className="flex gap-2 flex-wrap text-xs">
                <Badge variant="outline">{event.type}</Badge>
                <Badge variant="outline">{formatGameDate(event.date)}</Badge>
                {event.mandatory && <Badge variant="destructive">Mandatory</Badge>}
              </div>
              {event.outcome ? (
                <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
                  Outcome: {event.outcome}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => { attendEvent(event.id, "Attended and spoke"); setSelectedEvent(null); }}
                    className="w-full"
                  >
                    Attend & Contribute (+Charisma)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { attendEvent(event.id, "Attended quietly"); setSelectedEvent(null); }}
                    className="w-full"
                  >
                    Attend Quietly
                  </Button>
                  {!event.mandatory && (
                    <Button
                      variant="ghost"
                      onClick={() => { attendEvent(event.id, "Skipped"); setSelectedEvent(null); }}
                      className="w-full text-muted-foreground"
                    >
                      Skip Event
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
