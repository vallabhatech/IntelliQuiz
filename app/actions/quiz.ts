"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuizQuestions } from "@/lib/gemini";
import { createQuizSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateRoomCode } from "@/lib/utils";

export async function createQuizAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const raw = {
    title: formData.get("title"),
    topic: formData.get("topic"),
    difficulty: formData.get("difficulty"),
    timePerQuestion: formData.get("timePerQuestion"),
    questionCount: formData.get("questionCount"),
  };

  const parsed = createQuizSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { title, topic, difficulty, timePerQuestion, questionCount } = parsed.data;

  const questions = await generateQuizQuestions(topic, difficulty, questionCount);

  const quiz = await prisma.quiz.create({
    data: {
      title,
      topic,
      difficulty,
      timePerQuestion,
      creatorId: session.user.id,
      questions: {
        create: questions.map((q, i) => ({
          text: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          order: i,
        })),
      },
    },
  });

  revalidatePath("/dashboard/quizzes");
  redirect(`/dashboard/quizzes/${quiz.id}`);
}

export async function deleteQuizAction(quizId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.creatorId !== session.user.id) {
    throw new Error("Not found or forbidden");
  }

  await prisma.quiz.delete({ where: { id: quizId } });
  revalidatePath("/dashboard/quizzes");
}

export async function startSessionAction(quizId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz || quiz.creatorId !== session.user.id) {
    throw new Error("Not found or forbidden");
  }

  if (quiz.questions.length === 0) {
    throw new Error("Cannot start quiz with no questions");
  }

  let roomCode = generateRoomCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.quiz.findUnique({ where: { roomCode } });
    if (!existing) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  const [, quizSession] = await prisma.$transaction([
    prisma.quiz.update({
      where: { id: quizId },
      data: { roomCode, status: "ACTIVE" },
    }),
    prisma.quizSession.create({
      data: {
        quizId,
        hostId: session.user.id,
        status: "WAITING",
      },
    }),
  ]);

  revalidatePath(`/dashboard/quizzes/${quizId}`);
  redirect(`/dashboard/quizzes/${quizId}/session?sessionId=${quizSession.id}`);
}
