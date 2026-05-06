"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import { WaitingRoom } from "./WaitingRoom";
import { QuestionDisplay } from "./QuestionDisplay";
import { LiveLeaderboard } from "@/components/leaderboard/LiveLeaderboard";
import { motion } from "framer-motion";
import { Pause, Play, SkipForward, Trophy, Users, ArrowLeft } from "lucide-react";
import { ResultsView } from "@/components/session/ResultsView";
import type {
  QuestionStartPayload,
  LeaderboardEntry,
  QuestionResultPayload,
} from "@/types";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  order: number;
}

interface HostSessionViewProps {
  quizId: string;
  sessionId: string;
  quizTitle: string;
  roomCode: string;
  totalQuestions: number;
  hostId: string;
  initialParticipants: number;
  questions: Question[];
}

type SessionPhase = "waiting" | "active" | "paused" | "break" | "ended";

export function HostSessionView({
  quizId,
  sessionId,
  quizTitle,
  roomCode,
  totalQuestions,
  hostId,
  initialParticipants,
  questions,
}: HostSessionViewProps) {
  const { socket, isConnected } = useSocket();
  const [phase, setPhase] = useState<SessionPhase>("waiting");
  const [participantCount, setParticipantCount] = useState(initialParticipants);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionStartPayload | null>(null);
  const [questionEndTime, setQuestionEndTime] = useState<number | null>(null);
  const [finalLeaderboard, setFinalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (phase !== "break") return;
    const t = setInterval(() => {
      setBreakSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    // Guard on isConnected so the effect re-fires on reconnect, ensuring
    // the host's new socket rejoins the Socket.IO room and receives events.
    if (!socket || !isConnected) return;

    function onRoomJoined({ participantCount: count }: { participantCount: number }) {
      setParticipantCount(count);
    }
    function onParticipantJoined({ participantCount: count }: { participantCount: number }) {
      setParticipantCount(count);
    }
    function onQuestionStart(payload: QuestionStartPayload) {
      setCurrentQuestion(payload);
      setQuestionEndTime(payload.questionEndTime);
      setBreakSeconds(0);
      setPhase("active");
    }
    function onQuestionResult(payload: QuestionResultPayload) {
      setBreakSeconds(payload.breakSeconds);
      if (payload.breakSeconds > 0) setPhase("break");
    }
    function onQuizPaused() { setPhase("paused"); }
    function onQuizResumed() { setPhase("active"); }
    function onQuizEnded({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
      setFinalLeaderboard(leaderboard);
      setPhase("ended");
    }
    function onError({ message }: { message: string }) {
      console.error("[host socket error]", message);
    }

    socket.on("room-joined", onRoomJoined);
    socket.on("participant-joined", onParticipantJoined);
    socket.on("question-start", onQuestionStart);
    socket.on("question-result", onQuestionResult);
    socket.on("quiz-paused", onQuizPaused);
    socket.on("quiz-resumed", onQuizResumed);
    socket.on("quiz-ended", onQuizEnded);
    socket.on("error", onError);

    // Use host-specific join so the host is NOT added to the participants list
    socket.emit("host-join-room", { roomCode, sessionId });

    return () => {
      socket.off("room-joined", onRoomJoined);
      socket.off("participant-joined", onParticipantJoined);
      socket.off("question-start", onQuestionStart);
      socket.off("question-result", onQuestionResult);
      socket.off("quiz-paused", onQuizPaused);
      socket.off("quiz-resumed", onQuizResumed);
      socket.off("quiz-ended", onQuizEnded);
      socket.off("error", onError);
    };
  }, [socket, isConnected, roomCode, sessionId]);

  const handleStart = useCallback(() => {
    if (!socket) return;
    socket.emit("host-start-session", { sessionId });
  }, [socket, sessionId]);

  const handleSkipBreak = useCallback(() => {
    if (!socket) return;
    socket.emit("host-next-question", { sessionId });
  }, [socket, sessionId]);

  const handlePause = useCallback(() => {
    if (!socket) return;
    socket.emit("host-pause", { sessionId });
    setPhase("paused");
  }, [socket, sessionId]);

  const handleResume = useCallback(() => {
    if (!socket) return;
    socket.emit("host-resume", { sessionId });
    setPhase("active");
  }, [socket, sessionId]);

  if (phase === "ended") {
    return (
      <FinalResults
        leaderboard={finalLeaderboard}
        quizTitle={quizTitle}
        quizId={quizId}
        questions={questions}
      />
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hidden p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-bold text-xl">{quizTitle}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {participantCount} players
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isConnected
                      ? "bg-emerald-400/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-400/10 text-red-400"
                  }`}
                >
                  {isConnected ? "Live" : "Disconnected"}
                </span>
                {currentQuestion && (
                  <span className="text-xs text-muted-foreground">
                    Q{currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
                  </span>
                )}
              </div>
            </div>

            {phase !== "waiting" && (
              <div className="flex items-center gap-2">
                {phase === "active" && (
                  <button
                    onClick={handlePause}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                )}
                {phase === "paused" && (
                  <button
                    onClick={handleResume}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </button>
                )}
                {phase === "break" && (
                  <button
                    onClick={handleSkipBreak}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 btn-primary"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip break
                  </button>
                )}
              </div>
            )}
          </div>

          {phase === "waiting" ? (
            <WaitingRoom
              roomCode={roomCode}
              quizTitle={quizTitle}
              participantCount={participantCount}
              isHost
              onStart={handleStart}
            />
          ) : phase === "break" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Next question in
              </p>
              <p
                className="text-7xl font-bold mb-4 tabular-nums"
                style={{ color: "oklch(0.65 0.28 280)" }}
              >
                {breakSeconds}
              </p>
              <p className="text-muted-foreground text-sm">Auto-advancing…</p>
            </motion.div>
          ) : currentQuestion ? (
            <QuestionDisplay
              question={currentQuestion.question}
              questionNumber={currentQuestion.questionNumber}
              totalQuestions={currentQuestion.totalQuestions}
              timeLimit={currentQuestion.timeLimit}
              questionEndTime={questionEndTime}
              selectedIndex={null}
              answerResult={null}
              onSelect={() => {}}
            />
          ) : null}

          {phase === "paused" && (
            <div className="mt-4 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm text-center font-medium">
              Quiz paused. Click Resume to continue.
            </div>
          )}
        </div>
      </div>

      {/* Desktop leaderboard */}
      <aside className="hidden lg:flex min-w-[22rem] shrink-0 flex-col p-4 border-l border-border overflow-y-auto scrollbar-hidden">
        <LiveLeaderboard currentUserId={hostId} />
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
      {showLeaderboard && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-background/95 backdrop-blur-sm p-4 max-h-[60vh] overflow-y-auto scrollbar-hidden">
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
          <LiveLeaderboard currentUserId={hostId} />
        </div>
      )}
    </div>
  );
}

function FinalResults({
  leaderboard,
  quizTitle,
  quizId,
  questions,
}: {
  leaderboard: LeaderboardEntry[];
  quizTitle: string;
  quizId: string;
  questions: Question[];
}) {
  return (
    <div className="flex flex-col items-center p-6 lg:p-8 max-w-3xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 w-full"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "oklch(0.75 0.22 60 / 0.15)" }}
        >
          <Trophy className="w-8 h-8" style={{ color: "oklch(0.75 0.22 60)" }} />
        </div>
        <h1 className="font-display text-3xl font-bold mb-1">Quiz Complete!</h1>
        <p className="text-muted-foreground text-sm">{quizTitle}</p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{leaderboard.length} participants</span>
          <span>·</span>
          <span>{questions.length} questions</span>
        </div>
      </motion.div>

      <div className="w-full mb-8">
        <ResultsView
          leaderboard={leaderboard}
          questions={questions}
          totalQuestions={questions.length}
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/quizzes/${quizId}/results`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-accent transition-all"
        >
          <Trophy className="w-4 h-4" />
          Full results
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 btn-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
