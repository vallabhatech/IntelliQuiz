"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { WaitingRoom } from "./WaitingRoom";
import { QuestionDisplay } from "./QuestionDisplay";
import { LiveLeaderboard } from "@/components/leaderboard/LiveLeaderboard";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import type {
  QuestionStartPayload,
  AnswerResultPayload,
  LeaderboardEntry,
  RoomJoinedPayload,
  QuestionResultPayload,
} from "@/types";

interface StudentQuizViewProps {
  sessionId: string;
  userId: string;
  userName: string;
  quizTitle: string;
  roomCode: string;
  totalQuestions: number;
}

type Phase = "connecting" | "waiting" | "question" | "locked" | "result" | "break" | "ended";

export function StudentQuizView({
  sessionId,
  userId,
  userName,
  quizTitle,
  roomCode,
  totalQuestions,
}: StudentQuizViewProps) {
  const { socket, isConnected } = useSocket();
  const [phase, setPhase] = useState<Phase>("connecting");
  const [participantCount, setParticipantCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionStartPayload | null>(null);
  const [questionEndTime, setQuestionEndTime] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResultPayload | null>(null);
  const [finalLeaderboard, setFinalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const answerStartTime = useRef<number>(0);
  const breakTransitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Client-side break countdown (cosmetic — server controls actual advance)
  useEffect(() => {
    if (phase !== "break") return;
    const t = setInterval(() => {
      setBreakSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    function onRoomJoined(payload: RoomJoinedPayload & { currentQuestion?: QuestionStartPayload & { alreadyAnswered?: boolean } }) {
      setParticipantCount(payload.participantCount);
      if (payload.status === "ACTIVE" && payload.currentQuestion) {
        setCurrentQuestion(payload.currentQuestion);
        setQuestionEndTime(payload.currentQuestion.questionEndTime);
        setSelectedIndex(payload.currentQuestion.alreadyAnswered ? -2 : null);
        setAnswerResult(null);
        answerStartTime.current = Date.now();
        setPhase(payload.currentQuestion.alreadyAnswered ? "locked" : "question");
      } else {
        setPhase("waiting");
      }
    }
    function onParticipantJoined({ participantCount: count }: { participantCount: number }) {
      setParticipantCount(count);
    }
    function onQuestionStart(payload: QuestionStartPayload) {
      setCurrentQuestion(payload);
      setQuestionEndTime(payload.questionEndTime);
      setSelectedIndex(null);
      setAnswerResult(null);
      setBreakSeconds(0);
      answerStartTime.current = Date.now();
      setPhase("question");
    }
    function onAnswerSubmitted() { setPhase("locked"); }
    function onAnswerResult(payload: AnswerResultPayload) {
      setAnswerResult(payload);
      setPhase("result");
    }
    function onQuestionResult(payload: QuestionResultPayload) {
      setBreakSeconds(payload.breakSeconds);
      if (payload.breakSeconds > 0) {
        if (breakTransitionTimer.current) clearTimeout(breakTransitionTimer.current);
        breakTransitionTimer.current = setTimeout(() => setPhase("break"), 1500);
      }
    }
    function onQuizEnded({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
      if (breakTransitionTimer.current) clearTimeout(breakTransitionTimer.current);
      setFinalLeaderboard(leaderboard);
      setPhase("ended");
    }
    function onError({ message }: { message: string }) {
      console.error("[socket error]", message);
    }

    socket.on("room-joined", onRoomJoined);
    socket.on("participant-joined", onParticipantJoined);
    socket.on("question-start", onQuestionStart);
    socket.on("answer-submitted", onAnswerSubmitted);
    socket.on("answer-result", onAnswerResult);
    socket.on("question-result", onQuestionResult);
    socket.on("quiz-ended", onQuizEnded);
    socket.on("error", onError);

    socket.emit("join-room", { roomCode, userId, userName });

    return () => {
      socket.off("room-joined", onRoomJoined);
      socket.off("participant-joined", onParticipantJoined);
      socket.off("question-start", onQuestionStart);
      socket.off("answer-submitted", onAnswerSubmitted);
      socket.off("answer-result", onAnswerResult);
      socket.off("question-result", onQuestionResult);
      socket.off("quiz-ended", onQuizEnded);
      socket.off("error", onError);
      if (breakTransitionTimer.current) clearTimeout(breakTransitionTimer.current);
    };
  }, [socket, isConnected, roomCode, userId]);

  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (!socket || !currentQuestion || selectedIndex !== null) return;

      setSelectedIndex(index);
      const timeMs = Date.now() - answerStartTime.current;

      socket.emit("submit-answer", {
        questionId: currentQuestion.question.id,
        selectedIndex: index,
        timeMs,
      });
    },
    [socket, currentQuestion, selectedIndex]
  );

  if (phase === "ended") {
    return <FinalResults leaderboard={finalLeaderboard} userId={userId} quizTitle={quizTitle} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto scrollbar-hidden">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-bold text-lg">{quizTitle}</h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isConnected
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-red-400/10 text-red-400"
                }`}
              >
                {isConnected ? "Connected" : "Reconnecting…"}
              </span>
            </div>
            {answerResult && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total score</p>
                <p className="font-bold text-lg" style={{ color: "oklch(0.65 0.28 280)" }}>
                  {answerResult.totalScore.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {phase === "connecting" && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
                  style={{ borderColor: "oklch(0.65 0.28 280)" }}
                />
                <p className="text-muted-foreground text-sm">Connecting…</p>
              </div>
            </div>
          )}

          {phase === "waiting" && (
            <WaitingRoom
              roomCode={roomCode}
              quizTitle={quizTitle}
              participantCount={participantCount}
            />
          )}

          {(phase === "question" || phase === "locked" || phase === "result") && currentQuestion && (
            <>
              <QuestionDisplay
                question={currentQuestion.question}
                questionNumber={currentQuestion.questionNumber}
                totalQuestions={totalQuestions}
                timeLimit={currentQuestion.timeLimit}
                questionEndTime={questionEndTime}
                selectedIndex={selectedIndex}
                answerResult={phase === "result" ? answerResult : null}
                onSelect={handleSelectAnswer}
              />
              {phase === "locked" && selectedIndex !== null && selectedIndex >= 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                    ✓ Answer locked in — waiting for timer
                  </span>
                </motion.div>
              )}
            </>
          )}

          {phase === "break" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center mt-8"
            >
              <p className="text-muted-foreground text-sm mb-3 uppercase tracking-widest text-xs font-medium">
                Next question in
              </p>
              <p
                className="text-7xl font-bold mb-4 tabular-nums"
                style={{ color: "oklch(0.65 0.28 280)" }}
              >
                {breakSeconds}
              </p>
              <p className="text-muted-foreground text-sm">Get ready!</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Desktop leaderboard */}
      <aside className="hidden lg:flex min-w-[22rem] shrink-0 flex-col p-4 border-l border-border">
        <LiveLeaderboard currentUserId={userId} />
      </aside>

      {/* Mobile leaderboard toggle */}
      <button
        onClick={() => setShowLeaderboard((v) => !v)}
        className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg btn-primary text-sm font-semibold"
      >
        <Trophy className="w-4 h-4" />
        Leaderboard
      </button>

      {/* Mobile leaderboard drawer */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-background/95 backdrop-blur-sm p-4 max-h-[60vh] overflow-y-auto scrollbar-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{ color: "oklch(0.75 0.22 60)" }} />
                Live Leaderboard
              </h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-xs text-muted-foreground px-2 py-1 rounded-lg hover:bg-accent transition-colors"
              >
                Close ✕
              </button>
            </div>
            <LiveLeaderboard currentUserId={userId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FinalResults({
  leaderboard,
  userId,
  quizTitle,
}: {
  leaderboard: LeaderboardEntry[];
  userId: string;
  quizTitle: string;
}) {
  const myEntry = leaderboard.find((e) => e.userId === userId);
  const RANK_COLORS = [
    "oklch(0.75 0.22 60)",
    "oklch(0.75 0.1 220)",
    "oklch(0.65 0.18 35)",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 pt-8"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "oklch(0.75 0.22 60 / 0.2)" }}
        >
          <Trophy className="w-8 h-8" style={{ color: "oklch(0.75 0.22 60)" }} />
        </div>
        <h1 className="text-3xl font-bold mb-1">Quiz Over!</h1>
        <p className="text-muted-foreground text-sm">{quizTitle}</p>
        {myEntry && (
          <div className="mt-4 inline-flex items-center gap-3 glass-card px-6 py-3">
            <span className="text-muted-foreground text-sm">Your rank</span>
            <span className="text-2xl font-bold text-gradient">#{myEntry.rank}</span>
            <span className="text-muted-foreground text-sm">with</span>
            <span className="text-2xl font-bold">{myEntry.score.toLocaleString()} pts</span>
          </div>
        )}
      </motion.div>

      <div className="w-full space-y-2">
        <AnimatePresence>
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-4 p-4 glass-card border ${
                entry.userId === userId
                  ? "border-primary/40"
                  : "border-transparent"
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                style={
                  i < 3
                    ? { background: RANK_COLORS[i], color: "black" }
                    : { background: "oklch(0.18 0.02 280)", color: "oklch(0.6 0.01 280)" }
                }
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {entry.name}
                  {entry.userId === userId && (
                    <span className="ml-1.5 text-xs" style={{ color: "oklch(0.65 0.28 280)" }}>
                      (you)
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{entry.correctCount} correct</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{entry.score.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
