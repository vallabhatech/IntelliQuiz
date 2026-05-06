export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateQuizQuestions } from "@/lib/gemini";
import { z } from "zod";

const generateSchema = z.object({
  topic: z.string().min(5).max(500),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  count: z.number().int().min(3).max(30),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { topic, difficulty, count } = parsed.data;
    const questions = await generateQuizQuestions(topic, difficulty, count);

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("[POST /api/generate]", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
