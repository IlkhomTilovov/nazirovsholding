interface Props {
  label: string;
  questions: string[];
  onPick: (q: string) => void;
}

export function SuggestedQuestions({ label, questions, onPick }: Props) {
  return (
    <div className="px-4 py-3 border-t bg-muted/30">
      <div className="text-xs font-medium text-muted-foreground mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-accent hover:text-accent-foreground transition"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
