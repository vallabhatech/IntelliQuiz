import { CheckCircle2 } from "lucide-react";

interface Question {
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
  order: number;
}

interface QuestionEditorProps {
  questions: Question[];
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export function QuestionEditor({ questions }: QuestionEditorProps) {
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id ?? i} className="glass-card p-6">
          <div className="flex items-start gap-3 mb-4">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-black"
              style={{ background: "oklch(0.65 0.28 280)" }}
            >
              {i + 1}
            </span>
            <p className="font-medium leading-relaxed">{q.text}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {q.options.map((option, optIdx) => (
              <div
                key={optIdx}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${
                  optIdx === q.correctIndex
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                    optIdx === q.correctIndex
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {OPTION_LABELS[optIdx]}
                </span>
                {option}
                {optIdx === q.correctIndex && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                )}
              </div>
            ))}
          </div>

          {q.explanation && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300 leading-relaxed">
                <span className="font-semibold">Explanation: </span>
                {q.explanation}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
