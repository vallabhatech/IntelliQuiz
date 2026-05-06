"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Brain, Zap, Trophy, Users, ArrowRight, Sparkles,
  Wand2, Hash, GraduationCap, CheckCircle2, Clock,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ─── Scroll-triggered fade-in wrapper ─────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const from =
    direction === "up" ? { opacity: 0, y: 28 }
    : direction === "left" ? { opacity: 0, x: -28 }
    : direction === "right" ? { opacity: 0, x: 28 }
    : { opacity: 0 };

  return (
    <motion.div
      ref={ref}
      initial={from}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Shared constants ─────────────────────────────────────────────────────
const OPTION_COLORS = [
  "oklch(0.65 0.28 280)",
  "oklch(0.7 0.2 200)",
  "oklch(0.7 0.22 150)",
  "oklch(0.75 0.22 60)",
];
const LABELS = ["A", "B", "C", "D"];

// ─── Shared leaderboard rank colors ──────────────────────────────────────
const RANK_COLORS = [
  "oklch(0.75 0.22 60)",
  "oklch(0.75 0.1 220)",
  "oklch(0.65 0.18 35)",
];

// ─── Phase 1: Quiz Creation ───────────────────────────────────────────────
const CREATE_TOPIC = "The Solar System";
const CREATE_QUESTIONS = [
  "What is the largest planet in our solar system?",
  "How many moons does Mars have?",
  "What is the closest star to Earth besides the Sun?",
];

function CreatePhase() {
  const [chars, setChars] = useState(0);
  const [stage, setStage] = useState<"typing" | "generating" | "done">("typing");

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setChars(i);
      if (i >= CREATE_TOPIC.length) {
        clearInterval(iv);
        setTimeout(() => setStage("generating"), 500);
        setTimeout(() => setStage("done"), 2000);
      }
    }, 70);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -10 }}
      transition={{ duration: 0.38 }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {stage !== "done" ? (
          <motion.div key="form" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            className="space-y-3 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-black"
                style={{ background: "oklch(0.65 0.28 280)" }}>
                <Wand2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm">Create New Quiz</span>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Topic or subject</label>
              <div className="px-3 py-2.5 rounded-lg border border-border text-sm flex items-center gap-0.5"
                style={{ background: "oklch(0.13 0.015 280)" }}>
                <span>{CREATE_TOPIC.slice(0, chars)}</span>
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.75 }}
                  className="inline-block w-0.5 h-4 ml-0.5 rounded-full"
                  style={{ background: "oklch(0.65 0.28 280)" }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Questions</label>
                <div className="px-3 py-2 rounded-lg border border-border text-sm font-semibold"
                  style={{ background: "oklch(0.13 0.015 280)" }}>10</div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Difficulty</label>
                <div className="px-3 py-2 rounded-lg border text-xs font-semibold"
                  style={{ borderColor: "oklch(0.75 0.22 60 / 0.4)", color: "oklch(0.75 0.22 60)", background: "oklch(0.75 0.22 60 / 0.08)" }}>
                  Medium ▾
                </div>
              </div>
            </div>

            <motion.div
              animate={stage === "generating" ? { scale: [1, 0.97, 1] } : {}}
              transition={{ duration: 0.15 }}
              className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 btn-primary"
            >
              {stage === "generating" ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}>
                    <Zap className="w-4 h-4" />
                  </motion.div>
                  Generating with AI…
                </>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Quiz</>
              )}
            </motion.div>

            {stage === "generating" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex gap-1.5 justify-center pt-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.55, delay: i * 0.13 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "oklch(0.65 0.28 280)" }} />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }} className="space-y-2.5">
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.7 0.22 150)" }} />
              <span className="text-sm font-semibold" style={{ color: "oklch(0.7 0.22 150)" }}>
                10 questions generated!
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground">The Solar System</span>
            </motion.div>

            {CREATE_QUESTIONS.map((q, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border"
                style={{ background: "oklch(0.13 0.015 280)" }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-black shrink-0 mt-0.5"
                  style={{ background: "oklch(0.65 0.28 280)" }}>{i + 1}</div>
                <span className="text-xs leading-snug">{q}</span>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <Hash className="w-3 h-3" />
              Room code:
              <span className="font-mono font-bold" style={{ color: "oklch(0.65 0.28 280)" }}>SLR4X9</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Phase 2: Students Playing ────────────────────────────────────────────
const PLAY_QUESTION = "What is the largest planet in our solar system?";
const PLAY_OPTIONS = ["Mercury", "Jupiter", "Saturn", "Mars"];
const PLAY_CORRECT = 1;

const PLAY_LB_INIT = [
  { id: "p-alex",  name: "Alex K.",  score: 3240 },
  { id: "p-sarah", name: "Sarah M.", score: 3010 },
  { id: "p-you",   name: "You",      score: 2580, isYou: true },
  { id: "p-tom",   name: "Tom R.",   score: 2400 },
  { id: "p-lisa",  name: "Lisa P.",  score: 2140 },
];

function PlayingPhase() {
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState<number | null>(null);
  const [showBonus, setShowBonus] = useState(false);
  const [lb, setLb] = useState(PLAY_LB_INIT);

  useEffect(() => {
    const countDown = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    const pick = setTimeout(() => {
      setSelected(PLAY_CORRECT);
      setShowBonus(true);
      setLb(prev =>
        [...prev.map(e =>
          e.id === "p-you"  ? { ...e, score: e.score + 420 }
          : e.id === "p-tom" ? { ...e, score: e.score + 310 }
          : e
        )].sort((a, b) => b.score - a.score)
      );
    }, 3200);
    return () => { clearInterval(countDown); clearTimeout(pick); };
  }, []);

  const timerPct = (timeLeft / 15) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4 }}
      className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start"
    >
      {/* Question card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-medium text-muted-foreground">Question 6 / 10</span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tabular-nums"
            style={{
              background: timeLeft > 5 ? "oklch(0.75 0.22 60 / 0.12)" : "oklch(0.65 0.25 25 / 0.12)",
              color: timeLeft > 5 ? "oklch(0.75 0.22 60)" : "oklch(0.65 0.25 25)",
            }}>
            <Clock className="w-3 h-3" />{timeLeft}s
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1 bg-border rounded-full mb-3 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: "oklch(0.65 0.28 280)" }}
            animate={{ width: `${timerPct}%` }} transition={{ duration: 0.95, ease: "linear" }} />
        </div>

        <p className="text-sm font-semibold mb-3 leading-snug">{PLAY_QUESTION}</p>

        <div className="grid grid-cols-2 gap-1.5">
          {PLAY_OPTIONS.map((opt, i) => {
            const isChosen = selected === i;
            const isCorrect = selected !== null && i === PLAY_CORRECT;
            const isWrong = isChosen && i !== PLAY_CORRECT;
            return (
              <motion.div key={i}
                animate={isCorrect ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 p-2 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: isCorrect ? "oklch(0.7 0.22 150)" : isWrong ? "oklch(0.65 0.25 25)" : OPTION_COLORS[i],
                  background: isCorrect ? "oklch(0.7 0.22 150 / 0.14)" : isWrong ? "oklch(0.65 0.25 25 / 0.14)" : "oklch(0.13 0.015 280)",
                  color: isCorrect ? "oklch(0.8 0.18 150)" : "oklch(0.92 0.005 280)",
                }}>
                <div className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-bold text-black shrink-0"
                  style={{ background: isCorrect ? "oklch(0.7 0.22 150)" : OPTION_COLORS[i] }}>
                  {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : LABELS[i]}
                </div>
                {opt}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Your score</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: "oklch(0.65 0.28 280)" }}>3,000 pts</span>
            <AnimatePresence>
              {showBonus && (
                <motion.span key="bonus"
                  initial={{ opacity: 0, y: 5, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[11px] font-bold" style={{ color: "oklch(0.7 0.22 150)" }}>
                  +420
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Live leaderboard sidebar */}
      <div className="hidden md:block glass-card p-3 w-44">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Trophy className="w-3.5 h-3.5" style={{ color: "oklch(0.75 0.22 60)" }} />
          <span className="text-[11px] font-bold">Live</span>
          <span className="ml-auto text-[10px] text-muted-foreground">18 players</span>
        </div>
        <motion.div layout className="space-y-1">
          <AnimatePresence initial={false}>
            {lb.map((e, i) => (
              <motion.div key={e.id} layout layoutId={e.id}
                transition={{ layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                className="flex items-center gap-1.5 px-1.5 py-1 rounded-md"
                style={{
                  background: e.isYou ? "oklch(0.65 0.28 280 / 0.1)" : "transparent",
                  border: e.isYou ? "1px solid oklch(0.65 0.28 280 / 0.2)" : "1px solid transparent",
                }}>
                <div className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: i < 3 ? RANK_COLORS[i] : "oklch(0.2 0.02 280)", color: i < 3 ? "black" : "oklch(0.6 0.01 280)" }}>
                  {i + 1}
                </div>
                <span className="text-[11px] flex-1 truncate font-medium">{e.name}</span>
                <motion.span key={e.score}
                  initial={{ color: "oklch(0.7 0.22 150)" }}
                  animate={{ color: "oklch(0.7 0.01 280)" }}
                  transition={{ duration: 0.6 }}
                  className="text-[10px] font-bold tabular-nums">
                  {e.score.toLocaleString()}
                </motion.span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Phase 3: Final Results ────────────────────────────────────────────────
const RESULTS_DATA = [
  { id: "r-alex",  name: "Alex K.",  score: 9840, correct: 10 },
  { id: "r-sarah", name: "Sarah M.", score: 8720, correct: 9 },
  { id: "r-you",   name: "You",      score: 7960, correct: 8, isYou: true },
  { id: "r-tom",   name: "Tom R.",   score: 6440, correct: 7 },
  { id: "r-lisa",  name: "Lisa P.",  score: 5280, correct: 5 },
];

function ResultsPhase() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.42 }}
      className="w-full"
    >
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2.5"
          style={{ background: "oklch(0.75 0.22 60 / 0.18)" }}>
          <Trophy className="w-6 h-6" style={{ color: "oklch(0.75 0.22 60)" }} />
        </motion.div>
        <motion.h3 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="font-bold text-base">
          Quiz Over!
        </motion.h3>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
          className="text-[11px] text-muted-foreground">
          The Solar System · 10 questions · 18 players
        </motion.p>
      </div>

      <div className="space-y-1.5">
        {RESULTS_DATA.map((e, i) => (
          <motion.div key={e.id}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 p-2.5 rounded-xl border"
            style={{
              borderColor: e.isYou ? "oklch(0.65 0.28 280 / 0.4)" : "oklch(0.22 0.02 280)",
              background: e.isYou ? "oklch(0.65 0.28 280 / 0.07)" : "oklch(0.13 0.015 280)",
            }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
              style={{ background: i < 3 ? RANK_COLORS[i] : "oklch(0.18 0.02 280)", color: i < 3 ? "black" : "oklch(0.6 0.01 280)" }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs truncate">
                {e.name}
                {e.isYou && <span className="ml-1.5 text-[10px]" style={{ color: "oklch(0.65 0.28 280)" }}>(you)</span>}
              </p>
              <p className="text-[10px] text-muted-foreground">{e.correct}/10 correct</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xs">{e.score.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">pts</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── 3-phase cycling demo ─────────────────────────────────────────────────
type DemoPhase = "create" | "playing" | "results";
const PHASE_DURATIONS: Record<DemoPhase, number> = { create: 5800, playing: 6200, results: 5200 };
const PHASE_NEXT: Record<DemoPhase, DemoPhase>   = { create: "playing", playing: "results", results: "create" };
const PHASE_LABELS: Record<DemoPhase, string> = {
  create: "Creating quiz",
  playing: "Live session",
  results: "Final results",
};

function ProductDemo() {
  const [phase, setPhase] = useState<DemoPhase>("create");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase(p => PHASE_NEXT[p]);
      setCycle(c => c + 1);
    }, PHASE_DURATIONS[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="w-full">
      {/* Phase indicator pills */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {(["create", "playing", "results"] as DemoPhase[]).map(p => (
          <motion.div key={p}
            animate={{
              background: p === phase ? "oklch(0.65 0.28 280)" : "oklch(0.22 0.02 280)",
              color: p === phase ? "black" : "oklch(0.5 0.01 280)",
              scale: p === phase ? 1 : 0.95,
            }}
            transition={{ duration: 0.3 }}
            className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
            {PHASE_LABELS[p]}
          </motion.div>
        ))}
      </div>

      <div className="min-h-[240px] flex items-start">
        <AnimatePresence mode="wait">
          {phase === "create"  && <CreatePhase  key={`c-${cycle}`} />}
          {phase === "playing" && <PlayingPhase key={`p-${cycle}`} />}
          {phase === "results" && <ResultsPhase key={`r-${cycle}`} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────
export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Ambient orbs — dark mode only ───────────────────────────────── */}
      <div className="dark:block hidden fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[160px] opacity-[0.14]"
          style={{ background: "oklch(0.65 0.28 280)" }}
        />
        <div
          className="absolute top-1/3 right-[-20%] w-[600px] h-[600px] rounded-full blur-[130px] opacity-[0.07]"
          style={{ background: "oklch(0.7 0.2 200)" }}
        />
        <div
          className="absolute bottom-1/4 left-[-12%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07]"
          style={{ background: "oklch(0.65 0.25 25)" }}
        />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 flex justify-center px-4 pt-3 pb-1 pointer-events-none">
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto w-full max-w-4xl rounded-2xl px-5 h-14 flex items-center justify-between transition-all duration-300"
          style={{
            backdropFilter: "blur(20px) saturate(1.6)",
            WebkitBackdropFilter: "blur(20px) saturate(1.6)",
            background: scrolled
              ? "color-mix(in oklch, var(--background) 80%, transparent)"
              : "color-mix(in oklch, var(--background) 60%, transparent)",
            border: "1px solid oklch(0.55 0.05 280 / 0.35)",
            boxShadow: scrolled
              ? "0 4px 24px oklch(0 0 0 / 0.12), inset 0 1px 0 oklch(1 0 0 / 0.08)"
              : "0 2px 12px oklch(0 0 0 / 0.06), inset 0 1px 0 oklch(1 0 0 / 0.08)",
          }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center glow-sm"
              style={{ background: "oklch(0.65 0.28 280)" }}
            >
              <Brain className="w-4 h-4 text-black" />
            </div>
            <span className="font-display font-bold text-lg text-gradient tracking-[-0.02em]">IntelliQuiz</span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-all">
              How it works
            </a>
            <a href="#features" className="hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-all">
              Features
            </a>
            <Link href="/join" className="hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-all">
              Join quiz
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="hidden sm:block text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-all"
            >
              Sign in
            </Link>
            <ThemeToggle />
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-xl font-semibold transition-all hover:opacity-90 btn-primary shadow-md ml-1"
            >
              Get started
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">

        {/* Badge pill */}
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold tracking-[-0.03em] mb-6 leading-[1.06]"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}
        >
          Create and Host{" "}
          <span className="text-gradient">Live Quizzes</span>
          <br />
          <span style={{ fontSize: "clamp(1.8rem, 5vw, 3.5rem)" }}>in Under 60 Seconds</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-[1.7] font-medium"
        >
         Generate AI-powered quizzes instantly and host engaging live competitions with real-time leaderboards.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.33 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <Link
            href="/register"
            className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm btn-primary hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5"
            style={{ boxShadow: "0 8px 32px oklch(0.65 0.28 280 / 0.25)" }}
          >
            <Sparkles className="w-4 h-4" />
            Start creating
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/join"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm glass hover:bg-white/8 transition-all border border-border"
          >
            <Hash className="w-4 h-4" />
            Join with room code
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex items-center justify-center gap-8 md:gap-14 mb-20"
        >
          {[
            { value: "< 5s", label: "Quiz generation" },
            { value: "50+", label: "Players per session" },
            { value: "100%", label: "Free to start" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-8 md:gap-14">
              {i > 0 && <div className="w-px h-8 bg-border hidden sm:block" />}
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        <FadeIn className="text-center mb-16">
          <p
            className="text-xs font-semibold tracking-[0.18em] uppercase mb-3"
            style={{ color: "oklch(0.65 0.28 280)" }}
          >
            How it works
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] mb-4">
            From idea to live quiz in 3 steps
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            No templates. No slide decks. No prep time.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* Connector */}
          <div
            className="hidden md:block absolute top-[3.5rem] left-[calc(33%+1.5rem)] right-[calc(33%+1.5rem)] h-px"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.65 0.28 280 / 0.5), oklch(0.7 0.22 150 / 0.5))",
            }}
          />

          {[
            {
              step: "01", icon: <Wand2 className="w-5 h-5" />,
              title: "Describe your topic",
              desc: "Type any topic, paste lecture notes, or upload content. AI generates polished MCQs with explanations in under 5 seconds.",
              color: "oklch(0.65 0.28 280)",
            },
            {
              step: "02", icon: <Hash className="w-5 h-5" />,
              title: "Share the room code",
              desc: "Launch a live session and share the 6-character code. Students join from any browser — no app, no account, no friction.",
              color: "oklch(0.7 0.22 150)",
            },
            {
              step: "03", icon: <Trophy className="w-5 h-5" />,
              title: "Compete in real time",
              desc: "Questions sync instantly across all devices. Speed bonuses, streak multipliers, and live rankings update after every answer.",
              color: "oklch(0.75 0.22 60)",
            },
          ].map((s, i) => (
            <FadeIn key={s.step} delay={i * 0.1}>
              <div className="glass-card p-7 relative overflow-hidden group hover:glow-sm transition-all duration-300 h-full">
                <span
                  className="absolute top-4 right-5 text-7xl font-black select-none pointer-events-none"
                  style={{ color: "oklch(1 0 0 / 0.03)" }}
                >
                  {s.step}
                </span>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-black transition-transform group-hover:scale-110 duration-300 relative z-10"
                  style={{ background: s.color }}
                >
                  {s.icon}
                </div>
                <h3 className="font-bold text-lg mb-2.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Features bento ──────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        <FadeIn className="text-center mb-16">
          <p
            className="text-xs font-semibold tracking-[0.18em] uppercase mb-3"
            style={{ color: "oklch(0.65 0.28 280)" }}
          >
            Features
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] mb-4">
            Everything you need to run great quizzes
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Built for educators, trainers, and anyone who wants to engage an audience.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Large: AI Generation */}
          <FadeIn delay={0} className="lg:col-span-2">
            <div
              className="glass-card p-8 h-full group hover:glow-sm transition-all duration-300 relative overflow-hidden"
              style={{ border: "1px solid oklch(0.65 0.28 280 / 0.2)" }}
            >
              <div
                className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl -z-0 opacity-[0.07]"
                style={{ background: "oklch(0.65 0.28 280)" }}
              />
              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-black"
                  style={{ background: "oklch(0.65 0.28 280)" }}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xl mb-3">AI Quiz Generation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md">
                  Type any topic — history, biology, your own lecture notes — and get 5–20
                  polished multiple-choice questions with answer explanations in under 5 seconds.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Any topic", "Custom difficulty", "Answer explanations", "5–20 questions", "Instant generation"].map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full border font-medium"
                      style={{
                        borderColor: "oklch(0.65 0.28 280 / 0.3)",
                        color: "oklch(0.65 0.28 280)",
                        background: "oklch(0.65 0.28 280 / 0.07)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Real-time sync */}
          <FadeIn delay={0.06}>
            <div
              className="glass-card p-6 h-full group hover:glow-sm transition-all duration-300"
              style={{ border: "1px solid oklch(0.75 0.22 60 / 0.2)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-black"
                style={{ background: "oklch(0.75 0.22 60)" }}
              >
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-2">Real-time Sync</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Questions, countdown timers, and scores sync across all devices instantly. Every player sees the same thing at the same time.
              </p>
            </div>
          </FadeIn>

          {/* Live leaderboard */}
          <FadeIn delay={0.1}>
            <div
              className="glass-card p-6 h-full group hover:glow-sm transition-all duration-300"
              style={{ border: "1px solid oklch(0.7 0.22 150 / 0.2)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-black"
                style={{ background: "oklch(0.7 0.22 150)" }}
              >
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-2">Live Leaderboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Animated rankings update after every question. Speed bonuses and streak multipliers keep competition fierce to the last second.
              </p>
            </div>
          </FadeIn>

          {/* No login */}
          <FadeIn delay={0.14}>
            <div
              className="glass-card p-6 h-full group hover:glow-sm transition-all duration-300"
              style={{ border: "1px solid oklch(0.7 0.2 200 / 0.2)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-black"
                style={{ background: "oklch(0.7 0.2 200)" }}
              >
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-2">No Login for Students</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Students enter a name and 6-character code. No download, no account, no friction. Works on any device.
              </p>
            </div>
          </FadeIn>

          {/* Custom timer */}
          <FadeIn delay={0.18}>
            <div className="glass-card p-6 h-full group hover:glow-sm transition-all duration-300">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-black"
                style={{ background: "oklch(0.65 0.25 25)" }}
              >
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-2">Custom Timer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set time-per-question to control pace. Faster correct answers earn bigger speed bonuses.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Two-path cards ───────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <FadeIn className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em]">
            Who are you?
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">Pick your path and get started in seconds.</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <Link
              href="/register"
              className="glass-card p-8 text-left hover:glow-sm transition-all duration-300 group hover:scale-[1.02] block"
              style={{ border: "1px solid oklch(0.65 0.28 280 / 0.25)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-black transition-transform group-hover:scale-110 duration-300"
                style={{ background: "oklch(0.65 0.28 280)" }}
              >
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl mb-2">I&apos;m an Educator</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Create quizzes, host live sessions, and track results. Free to start — no credit card needed.
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "oklch(0.65 0.28 280)" }}
              >
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/join"
              className="glass-card p-8 text-left hover:glow-sm transition-all duration-300 group hover:scale-[1.02] block"
              style={{ border: "1px solid oklch(0.7 0.2 200 / 0.25)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-black transition-transform group-hover:scale-110 duration-300"
                style={{ background: "oklch(0.7 0.2 200)" }}
              >
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl mb-2">I&apos;m a Student</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Got a room code? Jump in instantly. No account, no download — just enter your name and play.
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "oklch(0.7 0.2 200)" }}
              >
                Enter room code
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Final CTA banner ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12 mb-16">
        <FadeIn>
          <div
            className="relative overflow-hidden rounded-2xl p-12 text-center"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.28 280 / 0.12), oklch(0.7 0.2 200 / 0.08))",
              border: "1px solid oklch(0.65 0.28 280 / 0.18)",
            }}
          >
            {/* Background glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-3xl opacity-15 -z-10"
              style={{ background: "oklch(0.65 0.28 280)" }}
            />
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] mb-4">
              Ready to run your first live quiz?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
              No credit card. No setup time. Sign up, type a topic, and you&apos;re live in under a minute.
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold btn-primary hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5"
              style={{ boxShadow: "0 8px 32px oklch(0.65 0.28 280 / 0.3)" }}
            >
              <Sparkles className="w-4 h-4" />
              Create your first quiz — free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.65 0.28 280)" }}
            >
              <Brain className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-display font-bold text-sm text-gradient tracking-[-0.02em]">IntelliQuiz</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/join" className="hover:text-foreground transition-colors">Join quiz</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 IntelliQuiz</p>
        </div>
      </footer>
    </div>
  );
}
