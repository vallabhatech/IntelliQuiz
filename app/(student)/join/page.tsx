"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Brain, Loader2, Hash, User } from "lucide-react";
import { motion } from "framer-motion";

function generateGuestId() {
  return "guest_" + Math.random().toString(36).slice(2, 10);
}

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const codeFromUrl = searchParams.get("code")?.toUpperCase().slice(0, 6) ?? "";

  const [roomCode, setRoomCode] = useState(codeFromUrl);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  // Auto-focus name field when code is pre-filled from URL
  useEffect(() => {
    if (codeFromUrl) {
      nameRef.current?.focus();
    }
  }, [codeFromUrl]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (roomCode.length !== 6) {
      toast.error("Room code must be exactly 6 characters");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/sessions?roomCode=${roomCode.toUpperCase()}`
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Room not found");
        return;
      }

      const uid = session?.user?.id ?? generateGuestId();
      router.push(
        `/quiz/${data.sessionId}?name=${encodeURIComponent(name.trim())}&uid=${uid}`
      );
    } catch {
      toast.error("Failed to join room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: "oklch(0.65 0.28 280)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.65 0.28 280)" }}
            >
              <Brain className="w-6 h-6 text-black" />
            </div>
            <span className="font-bold text-xl text-gradient">IntelliQuiz</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Join a Quiz</h1>
          <p className="text-muted-foreground text-sm">
            {codeFromUrl
              ? "Enter your name to join"
              : "Enter the room code and your display name"}
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Name
              </label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                placeholder="e.g. Alex"
                maxLength={24}
                required
                className="w-full px-4 py-3 rounded-xl bg-input border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) =>
                  setRoomCode(e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="e.g. AB3X7K"
                maxLength={6}
                required
                className="w-full px-4 py-4 rounded-xl bg-input border border-border text-center text-2xl font-bold tracking-widest font-mono uppercase placeholder:text-muted-foreground placeholder:text-base placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <p className="text-xs text-muted-foreground text-center">
                {roomCode.length}/6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || roomCode.length !== 6 || !name.trim()}
              className="w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-primary"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Join Quiz
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
