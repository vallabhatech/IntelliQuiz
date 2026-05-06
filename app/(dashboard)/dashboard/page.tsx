import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuizAnalytics } from "@/components/dashboard/QuizAnalytics";
import { BookOpen, Users, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const [quizCount, sessionCount, quizzes] = await Promise.all([
    prisma.quiz.count({ where: { creatorId: session.user.id } }),
    prisma.quizSession.count({
      where: { quiz: { creatorId: session.user.id } },
    }),
    prisma.quiz.findMany({
      where: { creatorId: session.user.id },
      include: { _count: { select: { sessions: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const participantCount = await prisma.participant.count({
    where: { session: { quiz: { creatorId: session.user.id } } },
  });

  const quizStats = quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    difficulty: q.difficulty,
    status: q.status,
    sessionCount: q._count.sessions,
    createdAt: q.createdAt,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">
            Welcome back, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s an overview of your quiz activity
          </p>
        </div>
        <Link
          href="/dashboard/quizzes/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 btn-primary"
        >
          <Sparkles className="w-4 h-4" />
          New Quiz
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          label="Total Quizzes"
          value={quizCount}
          icon={BookOpen}
          color="oklch(0.65 0.28 280)"
        />
        <StatsCard
          label="Total Participants"
          value={participantCount}
          icon={Users}
          color="oklch(0.7 0.2 200)"
        />
        <StatsCard
          label="Sessions Hosted"
          value={sessionCount}
          icon={Trophy}
          color="oklch(0.7 0.22 150)"
        />
      </div>

      <div className="mb-4">
        <h2 className="font-semibold text-base text-muted-foreground uppercase tracking-wide text-xs mb-3">Quizzes</h2>
        <QuizAnalytics quizzes={quizStats} />
      </div>
    </div>
  );
}
