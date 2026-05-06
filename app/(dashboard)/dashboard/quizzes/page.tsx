import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizCard } from "@/components/quiz/QuizCard";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

export default async function QuizzesPage() {
  const session = await auth();
  if (!session) return null;

  const quizzes = await prisma.quiz.findMany({
    where: { creatorId: session.user.id },
    include: {
      _count: { select: { questions: true, sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">My Quizzes</h1>
          <p className="text-sm text-muted-foreground">
            {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} created
          </p>
        </div>
        <Link
          href="/dashboard/quizzes/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(0.65 0.28 280 / 0.15)" }}
          >
            <Sparkles className="w-8 h-8" style={{ color: "oklch(0.65 0.28 280)" }} />
          </div>
          <h3 className="font-semibold text-lg mb-2">No quizzes yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Create your first quiz. Enter a topic and get questions generated instantly.
          </p>
          <Link
            href="/dashboard/quizzes/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 btn-primary"
          >
            <Sparkles className="w-4 h-4" />
            Create first quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={{
                id: quiz.id,
                title: quiz.title,
                topic: quiz.topic,
                difficulty: quiz.difficulty,
                status: quiz.status,
                timePerQuestion: quiz.timePerQuestion,
                questionCount: quiz._count.questions,
                sessionCount: quiz._count.sessions,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
