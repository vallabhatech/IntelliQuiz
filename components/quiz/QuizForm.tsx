"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, Clock, HelpCircle, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFFICULTY_STYLES: Record<Difficulty, { idle: string; active: string; label: string }> = {
  EASY: {
    label: "Easy",
    idle: "border-border text-muted-foreground hover:border-emerald-400/50 hover:text-emerald-600 dark:hover:text-emerald-400",
    active: "border-emerald-400/50 bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 font-semibold",
  },
  MEDIUM: {
    label: "Medium",
    idle: "border-border text-muted-foreground hover:border-amber-400/50 hover:text-amber-600 dark:hover:text-amber-400",
    active: "border-amber-400/50 bg-amber-400/10 text-amber-700 dark:text-amber-400 font-semibold",
  },
  HARD: {
    label: "Hard",
    idle: "border-border text-muted-foreground hover:border-red-400/50 hover:text-red-600 dark:hover:text-red-400",
    active: "border-red-400/50 bg-red-400/10 text-red-700 dark:text-red-400 font-semibold",
  },
};

interface QuizFormProps {
  defaultValues?: {
    title?: string;
    topic?: string;
    difficulty?: string;
    timePerQuestion?: number;
  };
  quizId?: string;
}

export function QuizForm({ defaultValues, quizId }: QuizFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: defaultValues?.title ?? "",
    topic: defaultValues?.topic ?? "",
    difficulty: (defaultValues?.difficulty ?? "MEDIUM") as Difficulty,
    timePerQuestion: String(defaultValues?.timePerQuestion ?? 30),
    questionCount: "10",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function stepNumber(
    field: "questionCount" | "timePerQuestion",
    delta: number,
    min: number,
    max: number
  ) {
    const current = parseInt(form[field]) || (field === "questionCount" ? 10 : 30);
    const next = Math.min(max, Math.max(min, current + delta));
    update(field, String(next));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qCount = parseInt(form.questionCount);
    const tPerQ = parseInt(form.timePerQuestion);

    if (isNaN(qCount) || qCount < 3 || qCount > 30) {
      toast.error("Questions must be between 3 and 30");
      return;
    }
    if (isNaN(tPerQ) || tPerQ < 10 || tPerQ > 120) {
      toast.error("Time per question must be between 10 and 120 seconds");
      return;
    }

    setLoading(true);
    try {
      const endpoint = quizId ? `/api/quizzes/${quizId}` : "/api/quizzes";
      const method = quizId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          topic: form.topic,
          difficulty: form.difficulty,
          timePerQuestion: tPerQ,
          questionCount: qCount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const firstError =
          typeof data.error === "string"
            ? data.error
            : Object.values(data.error as Record<string, string[]>)[0]?.[0];
        toast.error(firstError || "Failed to save quiz");
        return;
      }

      toast.success(quizId ? "Quiz updated!" : "Quiz created with AI-generated questions!");
      router.push(quizId ? `/dashboard/quizzes/${quizId}` : `/dashboard/quizzes/${data.quiz.id}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quiz Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Quiz title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. JavaScript Fundamentals"
          required
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl bg-input border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-60"
        />
      </div>

      {/* Topic / Prompt */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Generation topic</label>
        <textarea
          value={form.topic}
          onChange={(e) => update("topic", e.target.value)}
          placeholder="Describe what the quiz should cover, e.g. 'ES6 features: arrow functions, destructuring, async/await and the event loop'"
          required
          rows={4}
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl bg-input border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none disabled:opacity-60"
        />
        <p className="text-xs text-muted-foreground">
          More detail means better questions. Paste notes, a syllabus, or a topic description.
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quiz settings</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Difficulty</label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => {
            const style = DIFFICULTY_STYLES[d];
            const isActive = form.difficulty === d;
            return (
              <button
                key={d}
                type="button"
                disabled={loading}
                onClick={() => update("difficulty", d)}
                className={cn(
                  "py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring",
                  isActive ? style.active : style.idle
                )}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions + Time row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Question count */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
            Questions
            <span className="text-xs text-muted-foreground font-normal">3–30</span>
          </label>
          <div className="flex items-center rounded-xl border border-border bg-input overflow-hidden">
            <button
              type="button"
              disabled={loading}
              onClick={() => stepNumber("questionCount", -1, 3, 30)}
              className="px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              value={form.questionCount}
              onChange={(e) => update("questionCount", e.target.value)}
              min={3}
              max={30}
              required
              disabled={loading}
              className="flex-1 py-3 text-sm text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-60"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => stepNumber("questionCount", 1, 3, 30)}
              className="px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Time per question */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            Seconds / Q
            <span className="text-xs text-muted-foreground font-normal">10–120</span>
          </label>
          <div className="flex items-center rounded-xl border border-border bg-input overflow-hidden">
            <button
              type="button"
              disabled={loading}
              onClick={() => stepNumber("timePerQuestion", -5, 10, 120)}
              className="px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              value={form.timePerQuestion}
              onChange={(e) => update("timePerQuestion", e.target.value)}
              min={10}
              max={120}
              required
              disabled={loading}
              className="flex-1 py-3 text-sm text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-60"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => stepNumber("timePerQuestion", 5, 10, 120)}
              className="px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI generating banner */}
      {loading && (
        <div className="rounded-xl border border-border bg-accent/50 p-4 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 animate-pulse"
            style={{ background: "var(--primary)", opacity: 0.15 }}
          />
          <div className="absolute">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--primary)" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "var(--primary-foreground)" }} />
            </div>
          </div>
          <div className="pl-12">
            <p className="text-sm font-medium">Generating questions with AI…</p>
            <p className="text-xs text-muted-foreground">Usually takes 5–15 seconds</p>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm btn-primary"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {quizId ? "Save Changes" : "Generate & Create Quiz"}
          </>
        )}
      </button>
    </form>
  );
}
