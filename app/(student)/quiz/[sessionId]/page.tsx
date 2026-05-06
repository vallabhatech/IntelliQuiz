import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentQuizView } from "@/components/session/StudentQuizView";

type PageProps = {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ name?: string; uid?: string }>;
};

export default async function StudentQuizPage({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const { name, uid } = await searchParams;

  if (!name || !uid) redirect("/join");

  const quizSession = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: {
      quiz: {
        select: {
          title: true,
          roomCode: true,
          timePerQuestion: true,
          _count: { select: { questions: true } },
        },
      },
    },
  });

  if (!quizSession || !quizSession.quiz.roomCode) {
    redirect("/join");
  }

  return (
    <StudentQuizView
      sessionId={sessionId}
      userId={uid}
      userName={decodeURIComponent(name)}
      quizTitle={quizSession.quiz.title}
      roomCode={quizSession.quiz.roomCode}
      totalQuestions={quizSession.quiz._count.questions}
    />
  );
}
