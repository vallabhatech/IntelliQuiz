import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRoomCode } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
        sessions: {
          where: { status: "WAITING" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!quiz || quiz.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    if (quiz.questions.length === 0) {
      return NextResponse.json(
        { error: "Cannot start a quiz with no questions" },
        { status: 400 }
      );
    }

    // If a WAITING session already exists, return it — don't create a duplicate
    // and don't overwrite the roomCode (which would strand students already in the old room).
    if (quiz.sessions.length > 0 && quiz.roomCode) {
      const existing = quiz.sessions[0];
      return NextResponse.json({
        sessionId: existing.id,
        roomCode: quiz.roomCode,
      });
    }

    // Generate a unique roomCode (or reuse if quiz already has one from a completed run).
    let roomCode = quiz.roomCode ?? generateRoomCode();
    if (!quiz.roomCode) {
      let attempts = 0;
      while (attempts < 10) {
        const conflict = await prisma.quiz.findFirst({
          where: { roomCode, NOT: { id } },
        });
        if (!conflict) break;
        roomCode = generateRoomCode();
        attempts++;
      }
    }

    const [, quizSession] = await prisma.$transaction([
      prisma.quiz.update({
        where: { id },
        data: { roomCode, status: "ACTIVE" },
      }),
      prisma.quizSession.create({
        data: {
          quizId: id,
          hostId: session.user.id,
          status: "WAITING",
        },
      }),
    ]);

    return NextResponse.json({
      sessionId: quizSession.id,
      roomCode,
    });
  } catch (err) {
    console.error("[POST /api/quizzes/[id]/session]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
