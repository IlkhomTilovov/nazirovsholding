import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LanguageDef } from '@/hooks/useLanguages';

interface Props {
  label: string;
  languages: LanguageDef[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  placeholder?: Record<string, string>;
  required?: boolean;
}

export function TranslatedInput({ label, languages, value, onChange, placeholder, required }: Props) {
  const cols = Math.min(languages.length, 3) || 1;
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {languages.map((lang) => (
        <div key={lang.code} className="space-y-2">
          <Label>{label} ({lang.code.toUpperCase()}){required ? ' *' : ''}</Label>
          <Input
            value={value[lang.code] || ''}
            placeholder={placeholder?.[lang.code]}
            onChange={(e) => onChange({ ...value, [lang.code]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
