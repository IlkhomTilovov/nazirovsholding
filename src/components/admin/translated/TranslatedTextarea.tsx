import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { LanguageDef } from '@/hooks/useLanguages';

interface Props {
  label: string;
  languages: LanguageDef[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  placeholder?: Record<string, string>;
  rows?: number;
  required?: boolean;
}

export function TranslatedTextarea({ label, languages, value, onChange, placeholder, rows = 3, required }: Props) {
  const cols = Math.min(languages.length, 2) || 1;
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {languages.map((lang) => (
        <div key={lang.code} className="space-y-2">
          <Label>{label} ({lang.code.toUpperCase()}){required ? ' *' : ''}</Label>
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
