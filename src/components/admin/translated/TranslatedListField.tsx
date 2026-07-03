import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { LanguageDef } from '@/hooks/useLanguages';

interface Props {
  label: string;
  hint?: string;
  languages: LanguageDef[];
  /** Raw newline-separated text per language. Convert to/from string[] at load/save time. */
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  placeholder?: Record<string, string>;
  rows?: number;
}

export function TranslatedListField({ label, hint, languages, value, onChange, placeholder, rows = 4 }: Props) {
  const cols = Math.min(languages.length, 2) || 1;
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {languages.map((lang) => (
        <div key={lang.code} className="space-y-2">
          <Label>{label} ({lang.code.toUpperCase()}){hint ? ` — ${hint}` : ''}</Label>
          <Textarea
            rows={rows}
            value={value[lang.code] || ''}
            placeholder={placeholder?.[lang.code]}
            onChange={(e) => onChange({ ...value, [lang.code]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
