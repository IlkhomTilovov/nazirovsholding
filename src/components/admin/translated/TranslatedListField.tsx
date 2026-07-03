import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguageTabs } from '@/components/admin/translated/LanguageTabsProvider';

interface Props {
  label: string;
  hint?: string;
  /** Raw newline-separated text per language. Convert to/from string[] at load/save time. */
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  placeholder?: Record<string, string>;
  rows?: number;
}

export function TranslatedListField({ label, hint, value, onChange, placeholder, rows = 4 }: Props) {
  const { activeLang, languages } = useLanguageTabs();
  const lang = languages.find((l) => l.code === activeLang) ?? languages[0];
  if (!lang) return null;
  return (
    <div className="space-y-2">
      <Label>{label}{hint ? ` — ${hint}` : ''}</Label>
      <Textarea
        rows={rows}
        value={value[lang.code] || ''}
        placeholder={placeholder?.[lang.code]}
        onChange={(e) => onChange({ ...value, [lang.code]: e.target.value })}
      />
    </div>
  );
}
