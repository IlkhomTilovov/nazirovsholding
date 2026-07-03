import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguageTabs } from '@/components/admin/translated/LanguageTabsProvider';

interface Props {
  label: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  placeholder?: Record<string, string>;
  rows?: number;
  required?: boolean;
}

export function TranslatedTextarea({ label, value, onChange, placeholder, rows = 3, required }: Props) {
  const { activeLang, languages } = useLanguageTabs();
  const lang = languages.find((l) => l.code === activeLang) ?? languages[0];
  if (!lang) return null;
  return (
    <div className="space-y-2">
      <Label>{label}{required ? ' *' : ''}</Label>
      <Textarea
        rows={rows}
        value={value[lang.code] || ''}
        placeholder={placeholder?.[lang.code]}
        onChange={(e) => onChange({ ...value, [lang.code]: e.target.value })}
      />
    </div>
  );
}
