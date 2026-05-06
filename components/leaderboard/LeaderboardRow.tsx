"use client";

import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

const RANK_COLORS = [
  "oklch(0.75 0.22 60)",  // gold
  "oklch(0.75 0.1 220)",  // silver
  "oklch(0.65 0.18 35)",  // bronze
];

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  const rankColor = RANK_COLORS[entry.rank - 1];
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isCurrentUser
          ? "border-primary/40 bg-primary/10"
          : "border-border/50 bg-white/3"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
          isTop3 ? "text-black" : "text-muted-foreground bg-muted"
        }`}
        style={isTop3 ? { background: rankColor } : undefined}
      >
        {isTop3 ? (
          entry.rank === 1 ? <Trophy className="w-4 h-4" /> : entry.rank
        ) : (
          entry.rank
        )}
      </div>

      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
        {entry.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">
            {entry.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {entry.name}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs" style={{ color: "oklch(0.65 0.28 280)" }}>
              (you)
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{entry.correctCount} correct</p>
      </div>

      {entry.streak >= 2 && (
        <div className="flex items-center gap-1 text-orange-400">
          <Flame className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">{entry.streak}</span>
        </div>
      )}

      <div className="text-right shrink-0">
        <p className="font-bold text-sm">{entry.score.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">pts</p>
      </div>
    </motion.div>
  );
}
