import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Calendar } from "lucide-react";
import { getDifficultyColor, formatDate } from "@/lib/utils";
import { ResultsView } from "@/components/session/ResultsView";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session?: string }>;
};

export default async function QuizResultsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { session: sessionParam } = await searchParams;
  const authSession = await auth();
  if (!authSession) redirect("/login");

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!quiz || quiz.creatorId !== authSession.user.id) notFound();

  const sessions = await prisma.quizSession.findMany({
    where: { quizId: id, status: "COMPLETED" },
    orderBy: { endedAt: "desc" },
  });

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options as string[],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    order: q.order,
  }));

  if (sessions.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto w-full">
        <Link
          href={`/dashboard/quizzes/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to quiz
        </Link>
        <div className="glass-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-muted">
            <Trophy className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No sessions yet</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Run a live session to see leaderboard and question results here.
          </p>
          <Link
            href={`/dashboard/quizzes/${id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold btn-primary"
          >
            Go to quiz →
          </Link>
        </div>
      </div>
    );
  }

  const selected = sessionParam
    ? (sessions.find((s) => s.id === sessionParam) ?? sessions[0])
    : sessions[0];

  const participants = await prisma.participant.findMany({
    where: { sessionId: selected.id },
    include: {
      answers: { where: { isCorrect: true } },
    },
    orderBy: [{ score: "desc" }, { joinedAt: "asc" }],
  });

  const leaderboard = participants.map((p, i) => ({
    rank: i + 1,
    userId: p.userId,
    name: p.userName,
    score: p.score,
    correctCount: p.answers.length,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
      {/* Back */}
      <Link
        href={`/dashboard/quizzes/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to quiz
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-0.5">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">{quiz.topic}</p>
        </div>
        <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "oklch(0.75 0.22 60 / 0.15)" }}>
          <Trophy className="w-6 h-6" style={{ color: "oklch(0.75 0.22 60)" }} />
        </div>
      </div>

      {/* Session selector */}
      {sessions.length > 1 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Session</p>
          <div className="flex flex-wrap gap-2">
            {sessions.map((s, i) => (
              <Link
                key={s.id}
                href={`/dashboard/quizzes/${id}/results?session=${s.id}`}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                  s.id === selected.id
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                <Calendar className="w-3 h-3" />
                {i === 0 ? "Latest" : `Session ${sessions.length - i}`}
                {s.endedAt && (
                  <span className="opacity-60">· {formatDate(s.endedAt)}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Participants", value: participants.length },
          { label: "Questions", value: questions.length },
          {
            label: "Avg score",
            value: participants.length
              ? Math.round(participants.reduce((s, p) => s + p.score, 0) / participants.length).toLocaleString()
              : "—",
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabbed results */}
      <ResultsView leaderboard={leaderboard} questions={questions} totalQuestions={questions.length} />
    </div>
  );
}
