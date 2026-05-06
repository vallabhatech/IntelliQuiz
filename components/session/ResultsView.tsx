"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  correctCount: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  order: number;
}

interface ResultsViewProps {
  leaderboard: LeaderboardEntry[];
  questions: Question[];
  totalQuestions: number;
  highlightUserId?: string;
}

const RANK_COLORS = [
  { bg: "oklch(0.75 0.22 60)", text: "black" },
  { bg: "oklch(0.75 0.1 220)", text: "black" },
  { bg: "oklch(0.65 0.18 35)", text: "black" },
];

export function ResultsView({
  leaderboard,
  questions,
  totalQuestions,
  highlightUserId,
}: ResultsViewProps) {
  const [tab, setTab] = useState<"leaderboard" | "questions">("leaderboard");

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted mb-5">
        <button
          onClick={() => setTab("leaderboard")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all",
            tab === "leaderboard"
              ? "bg-card shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Trophy className="w-3.5 h-3.5" />
          Leaderboard
        </button>
        <button
          onClick={() => setTab("questions")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all",
            tab === "questions"
              ? "bg-card shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Question Review
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "leaderboard" ? (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-2"
          >
            {leaderboard.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-muted-foreground text-sm">No participants recorded for this session.</p>
              </div>
            ) : (
              leaderboard.map((entry, i) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center gap-4 p-4 glass-card border transition-all",
                    entry.userId === highlightUserId
                      ? "border-primary/40"
                      : "border-transparent"
                  )}
                >
                  {/* Rank badge */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={
                      i < 3
                        ? { background: RANK_COLORS[i].bg, color: RANK_COLORS[i].text }
                        : undefined
                    }
                  >
                    {i >= 3 ? (
                      <span className="text-muted-foreground font-semibold">{i + 1}</span>
                    ) : (
                      i + 1
                    )}
                  </div>

                  {/* Name + stats */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {entry.name}
                      {entry.userId === highlightUserId && (
                        <span className="ml-1.5 text-xs text-primary">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.correctCount} / {totalQuestions} correct
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg tabular-nums">{entry.score.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {questions.map((q, qi) => (
              <div key={q.id} className="glass-card p-5">
                <p className="font-semibold text-sm leading-relaxed mb-3">
                  <span className="text-muted-foreground mr-2 tabular-nums">{qi + 1}.</span>
                  {q.text}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
                        oi === q.correctIndex
                          ? "bg-emerald-400/10 border border-emerald-400/30 text-emerald-700 dark:text-emerald-400 font-medium"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {oi === q.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      )}
                      <span className={oi !== q.correctIndex ? "pl-6" : ""}>{opt}</span>
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border italic leading-relaxed">
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
