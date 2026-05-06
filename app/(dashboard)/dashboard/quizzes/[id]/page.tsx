import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Play, Clock, HelpCircle, BarChart2 } from "lucide-react";
import { QuestionEditor } from "@/components/quiz/QuestionEditor";
import { getDifficultyColor, getStatusColor } from "@/lib/utils";
import { StartSessionButton } from "@/components/quiz/StartSessionButton";
import { ShareRoomCode } from "@/components/quiz/ShareRoomCode";

type PageProps = { params: Promise<{ id: string }> };

export default async function QuizDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session) return null;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { sessions: true } },
    },
  });

  if (!quiz || quiz.creatorId !== session.user.id) notFound();

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options as string[],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    order: q.order,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <Link
          href="/dashboard/quizzes"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to quizzes
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
            <h1 className="text-2xl font-bold mb-1">{quiz.title}</h1>
            <p className="text-muted-foreground text-sm">{quiz.topic}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/dashboard/quizzes/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium glass hover:bg-white/10 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Link>
            <StartSessionButton quizId={id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xl font-bold">{quiz.questions.length}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xl font-bold">{quiz.timePerQuestion}s</p>
            <p className="text-xs text-muted-foreground">Per question</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xl font-bold">{quiz._count.sessions}</p>
            <p className="text-xs text-muted-foreground">Sessions run</p>
          </div>
        </div>
      </div>

      {quiz.roomCode && (
        <div className="glass-card p-4 mb-8 space-y-3">
          <ShareRoomCode roomCode={quiz.roomCode} />
          <div className="h-px bg-border" />
          <Link
            href={`/dashboard/quizzes/${id}/session`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 btn-primary"
          >
            <Play className="w-4 h-4" />
            Go to session
          </Link>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-lg mb-4">Questions</h2>
        <QuestionEditor questions={questions} />
      </div>
    </div>
  );
}
