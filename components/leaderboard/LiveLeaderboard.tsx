"use client";

import { AnimatePresence } from "framer-motion";
import { LeaderboardRow } from "./LeaderboardRow";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Trophy } from "lucide-react";

interface LiveLeaderboardProps {
  currentUserId?: string;
  initialEntries?: never[];
}

export function LiveLeaderboard({ currentUserId }: LiveLeaderboardProps) {
  const entries = useLeaderboard();

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Trophy className="w-4 h-4" style={{ color: "oklch(0.75 0.22 60)" }} />
        <h3 className="font-semibold text-sm">Live Leaderboard</h3>
        <span className="ml-auto text-xs text-muted-foreground">{entries.length} players</span>
      </div>

      <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto scrollbar-hidden">
        {entries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Waiting for answers…
          </p>
        ) : (
          <AnimatePresence mode="popLayout">
            {entries.slice(0, 10).map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                isCurrentUser={entry.userId === currentUserId}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
