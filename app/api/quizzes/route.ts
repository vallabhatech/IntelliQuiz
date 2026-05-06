import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createQuizSchema } from "@/lib/validations";
import { generateQuizQuestions, GeminiQuotaError } from "@/lib/gemini";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { creatorId: session.user.id },
      include: {
        _count: { select: { questions: true, sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quizzes });
  } catch (err) {
    console.error("[GET /api/quizzes]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createQuizSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
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
      include: { questions: true },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/quizzes]", err);
    if (err instanceof GeminiQuotaError) {
      return NextResponse.json(
        { error: "AI quota exceeded. Please wait a minute and try again." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(err.retryAfterMs / 1000)) } }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to create quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
