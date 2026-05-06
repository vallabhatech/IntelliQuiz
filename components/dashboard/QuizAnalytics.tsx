import { formatDate, getDifficultyColor, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface QuizStat {
  id: string;
  title: string;
  difficulty: string;
  status: string;
  sessionCount: number;
  createdAt: Date | string;
}

interface QuizAnalyticsProps {
  quizzes: QuizStat[];
}

export function QuizAnalytics({ quizzes }: QuizAnalyticsProps) {
  if (quizzes.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground text-sm">No quizzes yet. Create your first quiz!</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold">Quiz Overview</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-muted-foreground font-medium">Title</th>
              <th className="text-left px-6 py-3 text-muted-foreground font-medium">Difficulty</th>
              <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
              <th className="text-left px-6 py-3 text-muted-foreground font-medium">Sessions</th>
              <th className="text-left px-6 py-3 text-muted-foreground font-medium">Created</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr
                key={quiz.id}
                className="border-b border-border/50 hover:bg-white/3 transition-colors"
              >
                <td className="px-6 py-4 font-medium max-w-48 truncate">{quiz.title}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}
                  >
                    {quiz.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(quiz.status)}`}
                  >
                    {quiz.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{quiz.sessionCount}</td>
                <td className="px-6 py-4 text-muted-foreground">{formatDate(quiz.createdAt)}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/quizzes/${quiz.id}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
