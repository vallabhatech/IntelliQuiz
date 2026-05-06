"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  remaining?: number;
  total: number;
  endTime?: number;
}

export function Timer({ remaining: remainingProp, total, endTime }: TimerProps) {
  const computeRemaining = () =>
    endTime ? Math.max(0, Math.ceil((endTime - Date.now()) / 1000)) : (remainingProp ?? total);

  const [remaining, setRemaining] = useState(computeRemaining);

  useEffect(() => {
    if (!endTime) {
      setRemaining(remainingProp ?? total);
      return;
    }
    setRemaining(computeRemaining());
    const interval = setInterval(() => {
      const r = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) clearInterval(interval);
    }, 250);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTime, remainingProp, total]);

  const percentage = total > 0 ? (remaining / total) * 100 : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const color =
    percentage > 60
      ? "oklch(0.7 0.22 150)"
      : percentage > 30
      ? "oklch(0.75 0.22 60)"
      : "oklch(0.65 0.25 25)";

  const isUrgent = remaining <= 5 && remaining > 0;

  return (
    <div className={`relative w-24 h-24 ${isUrgent ? "animate-pulse" : ""}`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="oklch(0.22 0.02 280)"
          strokeWidth="6"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-bold tabular-nums" style={{ color }}>
            {remaining}
          </span>
          <p className="text-xs text-muted-foreground leading-none">sec</p>
        </div>
      </div>
    </div>
  );
}
