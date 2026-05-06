"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Edit3,
  Trash2,
  Play,
  Clock,
  HelpCircle,
  Loader2,
  Trophy,
} from "lucide-react";
import { getDifficultyColor, getStatusColor } from "@/lib/utils";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    topic: string;
    difficulty: string;
    status: string;
    timePerQuestion: number;
    questionCount: number;
    sessionCount: number;
  };
}

export function QuizCard({ quiz }: QuizCardProps) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleStartSession() {
    setStarting(true);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/session`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to start session");
        return;
      }

      router.push(`/dashboard/quizzes/${quiz.id}/session?sessionId=${data.sessionId}`);
    } catch {
      toast.error("Failed to start session");
    } finally {
      setStarting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this quiz? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Quiz deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="glass-card p-6 group hover:glow-sm transition-all duration-300 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2 flex-wrap">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}
          >
            {quiz.difficulty}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(quiz.status)}`}
          >
            {quiz.status}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{quiz.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quiz.topic}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          {quiz.questionCount} questions
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {quiz.timePerQuestion}s / question
        </span>
        {quiz.sessionCount > 0 && (
          <span className="flex items-center gap-1.5 ml-auto">
            <Trophy className="w-3.5 h-3.5" />
            {quiz.sessionCount} session{quiz.sessionCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={handleStartSession}
          disabled={starting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 btn-primary"
        >
          {starting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Start
        </button>

        <Link
          href={`/dashboard/quizzes/${quiz.id}/edit`}
          className="p-2.5 rounded-xl glass hover:bg-white/10 transition-all"
          title="Edit quiz"
        >
          <Edit3 className="w-4 h-4" />
        </Link>

        {quiz.sessionCount > 0 && (
          <Link
            href={`/dashboard/quizzes/${quiz.id}/results`}
            className="p-2.5 rounded-xl glass hover:bg-amber-500/10 hover:text-amber-500 transition-all text-muted-foreground"
            title="View leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </Link>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-muted-foreground"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
