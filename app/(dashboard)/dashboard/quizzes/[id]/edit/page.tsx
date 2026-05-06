import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import { QuizForm } from "@/components/quiz/QuizForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditQuizPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session) return null;

  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz || quiz.creatorId !== session.user.id) notFound();

  return (
    <div className="min-h-full flex flex-col p-6 lg:p-10">
      <div className="w-full max-w-xl mx-auto">
        {/* Back link */}
        <Link
          href={`/dashboard/quizzes/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to quiz
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--primary)" }}
          >
            <Edit3 className="w-5 h-5" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <h1 className="font-display text-2xl font-bold mb-1.5">Edit Quiz</h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Update the quiz settings. Questions are managed on the quiz detail page.
          </p>
        </div>

        {/* Form card */}
        <div className="auth-card p-8">
          <QuizForm
            quizId={id}
            defaultValues={{
              title: quiz.title,
              topic: quiz.topic,
              difficulty: quiz.difficulty,
              timePerQuestion: quiz.timePerQuestion,
            }}
          />
        </div>
      </div>
    </div>
  );
}
