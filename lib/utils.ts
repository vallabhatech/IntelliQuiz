import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "EASY": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "MEDIUM": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "HARD": return "text-red-400 bg-red-400/10 border-red-400/20";
    default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "DRAFT": return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    case "ACTIVE": return "text-green-400 bg-green-400/10 border-green-400/20";
    case "PAUSED": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "COMPLETED": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
}
