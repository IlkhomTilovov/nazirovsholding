export function getTranslated(
  field: Record<string, string> | null | undefined,
  lang: string,
  fallbackLang: string
): string {
  if (!field) return '';
  return field[lang] || field[fallbackLang] || Object.values(field)[0] || '';
}

export function getTranslatedList(
  field: Record<string, string[]> | null | undefined,
  lang: string,
  fallbackLang: string
): string[] {
  if (!field) return [];
  return field[lang] ?? field[fallbackLang] ?? Object.values(field)[0] ?? [];
}
