import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const roomCode = req.nextUrl.searchParams.get("roomCode");
    if (!roomCode) {
      return NextResponse.json({ error: "Room code required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { roomCode: roomCode.toUpperCase() },
      include: {
        sessions: {
          where: { status: { in: ["WAITING", "ACTIVE", "PAUSED"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!quiz || !quiz.sessions.length) {
      return NextResponse.json({ error: "Room not found or session ended" }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: quiz.sessions[0].id,
      quizTitle: quiz.title,
    });
  } catch (err) {
    console.error("[GET /api/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
