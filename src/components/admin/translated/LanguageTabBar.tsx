import { useLanguageTabs } from '@/components/admin/translated/LanguageTabsProvider';

export function LanguageTabBar() {
  const { activeLang, setActiveLang, languages } = useLanguageTabs();
  if (languages.length <= 1) return null;
  return (
    <div className="flex items-center gap-1 border-b mb-4">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setActiveLang(lang.code)}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeLang === lang.code
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
