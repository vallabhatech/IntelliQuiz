import type { User, Quiz, Question, QuizSession, Participant } from "@prisma/client";

export type SafeQuestion = {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  order: number;
};

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image?: string | null;
  score: number;
  streak: number;
  correctCount: number;
}

export interface RoomJoinedPayload {
  sessionId: string;
  quizTitle: string;
  participantCount: number;
  status: string;
  currentQuestion?: QuestionStartPayload;
}

export interface QuestionStartPayload {
  question: SafeQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
  questionStartTime: number;
  questionEndTime: number;
}

export interface QuestionResultPayload {
  correctIndex: number;
  explanation: string | null;
  leaderboard: LeaderboardEntry[];
  breakSeconds: number;
}

export interface AnswerResultPayload {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string | null;
  points: number;
  streak: number;
  totalScore: number;
}

export interface TimerTickPayload {
  remaining: number;
  total: number;
}

export type QuizWithQuestions = Quiz & { questions: Question[] };
export type SessionWithParticipants = QuizSession & {
  participants: Participant[];
};
