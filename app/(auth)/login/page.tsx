import { Suspense } from "react";
import Link from "next/link";
import { Brain, Sparkles, Zap, Users } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Animated gradient orbs */}
      <div className="auth-orb" style={{
        width: "500px", height: "500px",
        background: "var(--auth-orb-1)",
        top: "-80px", right: "-80px",
        animationDuration: "13s",
      }} />
      <div className="auth-orb" style={{
        width: "400px", height: "400px",
        background: "var(--auth-orb-2)",
        bottom: "-100px", left: "-80px",
        animationDelay: "-4s",
        animationDuration: "10s",
      }} />
      <div className="auth-orb" style={{
        width: "280px", height: "280px",
        background: "var(--auth-orb-3)",
        top: "40%", left: "10%",
        animationDelay: "-7s",
        animationDuration: "15s",
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
            { icon: <Sparkles className="w-3 h-3" />, text: "Smart quizzes" },
            { icon: <Zap className="w-3 h-3" />, text: "Real-time sessions" },
            { icon: <Users className="w-3 h-3" />, text: "50+ students / room" },
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
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage and host your quizzes
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">new here?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Link
            href="/register"
            className="block w-full text-center py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-all"
          >
            Create a free account
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
