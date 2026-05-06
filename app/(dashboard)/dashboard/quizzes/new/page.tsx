import { QuizForm } from "@/components/quiz/QuizForm";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewQuizPage() {
  return (
    <div className="min-h-full flex flex-col p-6 lg:p-10">
      <div className="w-full max-w-xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard/quizzes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to quizzes
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--primary)", opacity: 0.9 }}
          >
            <Sparkles className="w-6 h-6" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <h1 className="font-display text-2xl font-bold mb-1.5">Create a New Quiz</h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Describe your topic and get polished multiple-choice questions in seconds.
          </p>
        </div>

        {/* Form card */}
        <div className="auth-card p-8">
          <QuizForm />
        </div>
      </div>
    </div>
  );
}
