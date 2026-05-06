import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const quizSession = await prisma.quizSession.findUnique({
      where: { id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            topic: true,
            difficulty: true,
            timePerQuestion: true,
            roomCode: true,
            _count: { select: { questions: true } },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!quizSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: quizSession });
  } catch (err) {
    console.error("[GET /api/sessions/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
