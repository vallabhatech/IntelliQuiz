"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Brain, LayoutDashboard, BookOpen, Plus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/quizzes", icon: BookOpen, label: "My Quizzes" },
  { href: "/dashboard/quizzes/new", icon: Plus, label: "Create Quiz" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col p-4 border-r border-border">
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--primary)" }}
        >
          <Brain className="w-5 h-5" style={{ color: "var(--primary-foreground)" }} />
        </div>
        <span className="font-bold text-lg text-gradient">IntelliQuiz</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : item.href === "/dashboard/quizzes"
              ? pathname === "/dashboard/quizzes" ||
                (pathname.startsWith("/dashboard/quizzes/") &&
                  !pathname.startsWith("/dashboard/quizzes/new"))
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              style={
                isActive
                  ? { background: "oklch(0.65 0.28 280 / 0.15)", color: "oklch(0.75 0.2 280)" }
                  : undefined
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-1 items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
        <ThemeToggle className="text-muted-foreground hover:text-foreground shrink-0" />
      </div>
    </div>
  );
}
