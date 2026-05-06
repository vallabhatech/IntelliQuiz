"use client";

import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";
import type { LeaderboardEntry, QuestionResultPayload } from "@/types";

export function useLeaderboard() {
  const { socket } = useSocket();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleQuestionResult = (payload: QuestionResultPayload) => {
      setEntries(payload.leaderboard);
    };

    const handleQuizEnded = ({ leaderboard }: { leaderboard: LeaderboardEntry[] }) => {
      setEntries(leaderboard);
    };

    socket.on("question-result", handleQuestionResult);
    socket.on("quiz-ended", handleQuizEnded);

    return () => {
      socket.off("question-result", handleQuestionResult);
      socket.off("quiz-ended", handleQuizEnded);
    };
  }, [socket]);

  return entries;
}
