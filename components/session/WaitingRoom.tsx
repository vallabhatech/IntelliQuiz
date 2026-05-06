"use client";

import { motion } from "framer-motion";
import { Users, Copy, Check, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WaitingRoomProps {
  roomCode: string;
  quizTitle: string;
  participantCount: number;
  isHost?: boolean;
  onStart?: () => void;
}

export function WaitingRoom({
  roomCode,
  quizTitle,
  participantCount,
  isHost,
  onStart,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyLink() {
    const link = `${window.location.origin}/join?code=${roomCode}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Join link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-md w-full"
      >
        <div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
            style={{ background: "oklch(0.65 0.28 280 / 0.2)" }}
          >
            <Users className="w-8 h-8" style={{ color: "oklch(0.65 0.28 280)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-1">{quizTitle}</h2>
          <p className="text-muted-foreground text-sm">
            {isHost ? "Waiting for students to join" : "Waiting for the quiz to start…"}
          </p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold tracking-widest font-mono text-gradient">
                {roomCode}
              </span>
              <button
                onClick={copyCode}
                className="p-2 rounded-lg glass hover:bg-white/10 transition-all"
                title="Copy room code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {copiedLink ? "Link copied!" : "Copy join link"}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            <span className="font-semibold text-foreground">{participantCount}</span> player
            {participantCount !== 1 ? "s" : ""} joined
          </span>
        </div>

        {isHost && (
          <button
            onClick={onStart}
            disabled={participantCount === 0}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed btn-primary"
          >
            Start Quiz ({participantCount} player{participantCount !== 1 ? "s" : ""})
          </button>
        )}
      </motion.div>
    </div>
  );
}
