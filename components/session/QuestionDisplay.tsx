"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "./Timer";
import { AnswerOptions } from "./AnswerOptions";
import type { SafeQuestion, AnswerResultPayload } from "@/types";

interface QuestionDisplayProps {
  question: SafeQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
  questionEndTime: number | null;
  selectedIndex: number | null;
  answerResult: AnswerResultPayload | null;
  onSelect: (index: number) => void;
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  timeLimit,
  questionEndTime,
  selectedIndex,
  answerResult,
  onSelect,
}: QuestionDisplayProps) {
  const isAnswered = selectedIndex !== null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <div
                  key={i}
                  className="h-1 w-4 rounded-full transition-all"
                  style={{
                    background:
                      i < questionNumber
                        ? "oklch(0.65 0.28 280)"
                        : "oklch(0.22 0.02 280)",
                  }}
                />
              ))}
            </div>
          </div>
          <Timer
            endTime={questionEndTime ?? undefined}
            remaining={timeLimit}
            total={timeLimit}
          />
        </div>

        <div className="glass-card p-6">
          <p className="text-lg font-semibold leading-relaxed">{question.text}</p>
        </div>

        <AnswerOptions
          options={question.options}
          selectedIndex={selectedIndex}
          correctIndex={answerResult?.correctIndex ?? null}
          onSelect={onSelect}
          disabled={isAnswered}
        />

        <AnimatePresence>
          {answerResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`glass-card p-4 border ${
                answerResult.isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-red-500/40 bg-red-500/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p
                  className={`font-semibold ${
                    answerResult.isCorrect ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {answerResult.isCorrect ? "🎉 Correct!" : "❌ Wrong"}
                </p>
                {answerResult.isCorrect && (
                  <span className="text-sm font-bold" style={{ color: "oklch(0.65 0.28 280)" }}>
                    +{answerResult.points} pts
                  </span>
                )}
              </div>
              {answerResult.explanation && (
                <p className="text-sm text-muted-foreground">{answerResult.explanation}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
