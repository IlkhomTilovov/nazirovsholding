import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguageTabs } from '@/components/admin/translated/LanguageTabsProvider';

interface Props {
  label: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  placeholder?: Record<string, string>;
  required?: boolean;
}

export function TranslatedInput({ label, value, onChange, placeholder, required }: Props) {
  const { activeLang, languages } = useLanguageTabs();
  const lang = languages.find((l) => l.code === activeLang) ?? languages[0];
  if (!lang) return null;
  return (
    <div className="space-y-2">
      <Label>{label}{required ? ' *' : ''}</Label>
      <Input
        value={value[lang.code] || ''}
        placeholder={placeholder?.[lang.code]}
        onChange={(e) => onChange({ ...value, [lang.code]: e.target.value })}
      />
    </div>
  );
}
