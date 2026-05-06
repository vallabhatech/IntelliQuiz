import Link from "next/link";
import { Brain, Sparkles, Zap, Trophy } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Animated gradient orbs */}
      <div className="auth-orb" style={{
        width: "560px", height: "560px",
        background: "var(--auth-orb-1)",
        top: "-120px", left: "-120px",
        animationDuration: "14s",
      }} />
      <div className="auth-orb" style={{
        width: "440px", height: "440px",
        background: "var(--auth-orb-2)",
        bottom: "-100px", right: "-100px",
        animationDelay: "-5s",
        animationDuration: "11s",
      }} />
      <div className="auth-orb" style={{
        width: "320px", height: "320px",
        background: "var(--auth-orb-3)",
        top: "55%", left: "65%",
        animationDelay: "-8s",
        animationDuration: "13s",
      }} />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-7 anim-fade-up">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "var(--primary)" }}
            >
              <Brain className="w-5 h-5" style={{ color: "var(--primary-foreground)" }} />
            </div>
            <span className="font-display text-2xl font-bold text-gradient">IntelliQuiz</span>
          </Link>
        </div>

        {/* Trust chips */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap anim-fade-up anim-d1">
          {[
            { icon: <Sparkles className="w-3 h-3" />, text: "14K AI calls / day free" },
            { icon: <Zap className="w-3 h-3" />, text: "Live multiplayer" },
            { icon: <Trophy className="w-3 h-3" />, text: "Real-time leaderboard" },
          ].map((chip) => (
            <span
              key={chip.text}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border bg-accent text-muted-foreground font-medium"
            >
              {chip.icon}
              {chip.text}
            </span>
          ))}
        </div>

        {/* Card */}
        <div className="auth-card p-7 anim-scale-in anim-d2">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign up as admin to create and host quizzes
            </p>
          </div>

          <RegisterForm />

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">already a member?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Link
            href="/login"
            className="block w-full text-center py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-all"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4 anim-fade-up anim-d5">
          Joining as a student?{" "}
          <Link href="/join" className="hover:underline hover:text-foreground transition-colors font-medium">
            Enter room code →
          </Link>
        </p>
      </div>
    </div>
  );
}
