import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { HostSessionView } from "@/components/session/HostSessionView";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function HostSessionPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { sessionId } = await searchParams;
  const authSession = await auth();
  if (!authSession) redirect("/login");

  if (!sessionId) {
    redirect(`/dashboard/quizzes/${id}`);
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!quiz || quiz.creatorId !== authSession.user.id) notFound();

  const quizSession = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: {
      _count: { select: { participants: true } },
    },
  });

  if (!quizSession) notFound();

  return (
    <HostSessionView
      quizId={id}
      sessionId={sessionId}
      quizTitle={quiz.title}
      roomCode={quiz.roomCode ?? ""}
      totalQuestions={quiz.questions.length}
      hostId={authSession.user.id}
      initialParticipants={quizSession._count.participants}
      questions={quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options as string[],
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        order: q.order,
      }))}
    />
  );
}
