import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface GeneratedQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export class GeminiQuotaError extends Error {
  constructor(public retryAfterMs: number) {
    super("AI quota exceeded. Please try again later.");
    this.name = "GeminiQuotaError";
  }
}

const SYSTEM_PROMPT = `You are an expert quiz generator. You MUST return ONLY a valid JSON object with a single key "questions" containing an array. No markdown, no backticks, no explanation text.
Each object in the "questions" array must have exactly these fields:
- "question": a clear, unambiguous question string
- "options": an array of exactly 4 distinct answer strings
- "correctIndex": a number (0, 1, 2, or 3) indicating which option is correct
- "explanation": a 1-2 sentence educational explanation of why the answer is correct`;

const GEMINI_SYSTEM_PROMPT = `You are an expert quiz generator. You MUST return ONLY a valid JSON array with no markdown, no backticks, no explanation text.
Each object in the array must have exactly these fields:
- "question": a clear, unambiguous question string
- "options": an array of exactly 4 distinct answer strings
- "correctIndex": a number (0, 1, 2, or 3) indicating which option is correct
- "explanation": a 1-2 sentence educational explanation of why the answer is correct`;

function validateQuestions(questions: unknown[], count: number): GeneratedQuestion[] {
  if (!Array.isArray(questions)) throw new Error("AI returned invalid JSON: not an array");
  if (questions.length !== count) throw new Error(`AI returned ${questions.length} questions, expected ${count}`);
  for (const q of questions) {
    const item = q as Record<string, unknown>;
    if (!item.question || !Array.isArray(item.options) || item.options.length !== 4)
      throw new Error("AI returned malformed question data");
    if (typeof item.correctIndex !== "number" || item.correctIndex < 0 || item.correctIndex > 3)
      throw new Error("AI returned invalid correctIndex");
  }
  return questions as GeneratedQuestion[];
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests") || msg.includes("rate_limit");
}

async function tryGroq(userPrompt: string, count: number): Promise<GeneratedQuestion[]> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const questions = Array.isArray(parsed.questions) ? parsed.questions : parsed;
  return validateQuestions(questions as unknown[], count);
}

const GEMINI_MODELS = ["gemini-1.5-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];

async function tryGemini(userPrompt: string, count: number): Promise<GeneratedQuestion[]> {
  let lastError: unknown;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await model.generateContent(`${GEMINI_SYSTEM_PROMPT}\n\n${userPrompt}`);
      const text = result.response
        .text()
        .trim()
        .replace(/^```json\n?/, "")
        .replace(/^```\n?/, "")
        .replace(/\n?```$/, "");
      return validateQuestions(JSON.parse(text) as unknown[], count);
    } catch (err) {
      if (isQuotaError(err)) { lastError = err; continue; }
      throw err;
    }
  }
  const retryMatch = (lastError instanceof Error ? lastError.message : "").match(/retry[^0-9]*(\d+)/i);
  const retryAfterMs = retryMatch ? parseInt(retryMatch[1]) * 1000 : 60_000;
  throw new GeminiQuotaError(retryAfterMs);
}

export async function generateQuizQuestions(
  topic: string,
  difficulty: "EASY" | "MEDIUM" | "HARD",
  count: number
): Promise<GeneratedQuestion[]> {
  const difficultyDescriptions = {
    EASY: "straightforward, factual questions suitable for beginners",
    MEDIUM: "moderately challenging questions requiring good understanding",
    HARD: "complex, nuanced questions requiring expert-level knowledge",
  };

  const userPrompt = `Generate exactly ${count} multiple choice questions about: "${topic}"
Difficulty: ${difficulty} - ${difficultyDescriptions[difficulty]}

Requirements:
- Each question must be clear and have exactly one correct answer
- All 4 options must be plausible (avoid obviously wrong distractors)
- Questions should cover different aspects of the topic
- Explanations should be educational and concise

Return exactly ${count} questions.`;

  // Try Groq first (14,400 req/day free tier), fall back to Gemini
  if (process.env.GROQ_API_KEY) {
    try {
      return await tryGroq(userPrompt, count);
    } catch (err) {
      if (!isQuotaError(err)) throw err;
      console.warn("[AI] Groq quota hit, falling back to Gemini");
    }
  }

  return tryGemini(userPrompt, count);
}
