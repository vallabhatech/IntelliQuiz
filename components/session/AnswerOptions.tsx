"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_COLORS = [
  { base: "oklch(0.65 0.28 280)", bg: "oklch(0.65 0.28 280 / 0.15)" },
  { base: "oklch(0.7 0.2 200)", bg: "oklch(0.7 0.2 200 / 0.15)" },
  { base: "oklch(0.7 0.22 150)", bg: "oklch(0.7 0.22 150 / 0.15)" },
  { base: "oklch(0.75 0.22 60)", bg: "oklch(0.75 0.22 60 / 0.15)" },
];

interface AnswerOptionsProps {
  options: string[];
  selectedIndex: number | null;
  correctIndex: number | null;
  onSelect: (index: number) => void;
  disabled: boolean;
}

export function AnswerOptions({
  options,
  selectedIndex,
  correctIndex,
  onSelect,
  disabled,
}: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option, idx) => {
        const isSelected = selectedIndex === idx;
        const isCorrect = correctIndex !== null && idx === correctIndex;
        const isWrong = isSelected && correctIndex !== null && idx !== correctIndex;
        const color = OPTION_COLORS[idx];

        let borderColor = color.base;
        let bgColor = "oklch(0.13 0.015 280)";
        let textColor = "oklch(0.95 0.005 280)";

        if (isCorrect) {
          borderColor = "oklch(0.7 0.22 150)";
          bgColor = "oklch(0.7 0.22 150 / 0.15)";
          textColor = "oklch(0.8 0.18 150)";
        } else if (isWrong) {
          borderColor = "oklch(0.65 0.25 25)";
          bgColor = "oklch(0.65 0.25 25 / 0.15)";
          textColor = "oklch(0.75 0.2 25)";
        } else if (isSelected) {
          bgColor = color.bg;
        }

        return (
          <motion.button
            key={idx}
            onClick={() => !disabled && onSelect(idx)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            className="flex items-center gap-3 p-4 rounded-xl border text-left transition-all w-full disabled:cursor-not-allowed"
            style={{
              borderColor,
              backgroundColor: bgColor,
              color: textColor,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 text-black"
              style={{ background: isCorrect || isWrong ? borderColor : color.base }}
            >
              {OPTION_LABELS[idx]}
            </div>
            <span className="flex-1 text-sm font-medium leading-snug">{option}</span>
            {isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: borderColor }} />}
            {isWrong && <XCircle className="w-5 h-5 shrink-0" style={{ color: borderColor }} />}
          </motion.button>
        );
      })}
    </div>
  );
}
