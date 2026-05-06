import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  color = "var(--primary)",
  trend,
  trendUp,
}: StatsCardProps) {
  return (
    <div className="glass-card p-6 hover:glow-sm transition-all duration-300 anim-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: color }}
        >
          <Icon className="w-5 h-5" style={{ color: "var(--primary-foreground)" }} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trendUp
                ? "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10"
                : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-400/10"
            )}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
