import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Theme } from '@/lib/themes';

const THEME_CACHE_KEY = 'furniture-active-theme';
const THEME_READY_KEY = 'furniture-theme-ready';

const DEFAULT_THEME: Theme = {
  name: 'Noir & Gold Export',
  slug: 'noir-gold-export',
  colorPalette: {
    background: '0 0% 5%',
    foreground: '40 40% 95%',
    card: '0 0% 8%',
    cardForeground: '40 40% 95%',
    popover: '0 0% 8%',
    popoverForeground: '40 40% 95%',
    primary: '42 55% 54%',
    primaryForeground: '0 0% 5%',
    secondary: '0 0% 12%',
    secondaryForeground: '40 40% 95%',
    muted: '0 0% 12%',
    mutedForeground: '40 15% 65%',
    accent: '44 70% 70%',
    accentForeground: '0 0% 5%',
    destructive: '0 70% 50%',
    destructiveForeground: '0 0% 100%',
    border: '0 0% 18%',
    input: '0 0% 15%',
    ring: '42 55% 54%',
    warmCream: '40 30% 92%',
    warmBeige: '40 20% 80%',
    warmBrown: '30 25% 25%',
    darkWood: '0 0% 8%',
    goldAccent: '42 60% 55%',
    sageGreen: '120 15% 45%',
  },
  typography: {
    fontSans: 'Work Sans, system-ui, sans-serif',
    fontSerif: 'Instrument Serif, Georgia, serif',
    fontHeading: 'Instrument Serif, Georgia, serif',
  },
  componentStyles: {
    borderRadius: '0.25rem',
    buttonRadius: '0.25rem',
    cardRadius: '0.5rem',
    shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.4)',
    shadowMd: '0 4px 12px -2px rgb(0 0 0 / 0.5)',
    shadowLg: '0 20px 40px -10px rgb(0 0 0 / 0.6)',
  },
  layoutSettings: {
    containerMaxWidth: '1400px',
    sectionSpacing: '6rem',
    cardPadding: '1.5rem',
  },
  isActive: true,
  isDark: true,
};

const normalizeTheme = (theme: Partial<Theme> | null): Theme => ({
  ...DEFAULT_THEME,
  ...(theme || {}),
  colorPalette: { ...DEFAULT_THEME.colorPalette, ...(theme?.colorPalette || {}) },
  typography: { ...DEFAULT_THEME.typography, ...(theme?.typography || {}) },
  componentStyles: { ...DEFAULT_THEME.componentStyles, ...(theme?.componentStyles || {}) },
  layoutSettings: { ...DEFAULT_THEME.layoutSettings, ...(theme?.layoutSettings || {}) },
});

interface ThemeContextType {
  currentTheme: Theme | null;
  themes: Theme[];
  isLoading: boolean;
  isThemeReady: boolean;
  setActiveTheme: (themeId: string) => Promise<void>;
  previewTheme: (theme: Theme) => void;
  resetPreview: () => void;
  isPreviewMode: boolean;
  refreshThemes: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const cacheTheme = (theme: Theme) => {
  try {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(theme));
    localStorage.setItem(THEME_READY_KEY, 'true');
  } catch (e) {
    console.warn('Failed to cache theme:', e);
  }
};

const getCachedTheme = (): Theme | null => {
  try {
    const cached = localStorage.getItem(THEME_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed to get cached theme:', e);
  }
  return null;
};

const hasThemeBeenLoaded = (): boolean => {
  try {
    return localStorage.getItem(THEME_READY_KEY) === 'true';
  } catch (e) {
    return false;
  }
};

const SYSTEM_FONTS = new Set([
  'system-ui', 'sans-serif', 'serif', 'monospace', 'cursive', 'georgia',
  'arial', 'helvetica', 'times', 'times new roman', 'courier', 'courier new',
  'verdana', 'tahoma', 'trebuchet ms', 'impact', 'comic sans ms',
]);

const extractFontFamily = (fontStack: string): string | null => {
  if (!fontStack) return null;
  const first = fontStack.split(',')[0]?.trim().replace(/^["']|["']$/g, '');
  if (!first) return null;
  if (SYSTEM_FONTS.has(first.toLowerCase())) return null;
  return first;
};

export const ensureGoogleFontLoaded = (fontStack: string) => {
  const family = extractFontFamily(fontStack);
  if (!family) return;
  const id = `google-font-${family.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

export const applyThemeToDocument = (theme: Theme) => {
  const safeTheme = normalizeTheme(theme);
  const root = document.documentElement;
  
  Object.entries(safeTheme.colorPalette).forEach(([key, value]) => {
    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--${cssVar}`, value);
  });

  root.style.setProperty('--font-sans', safeTheme.typography.fontSans);
  root.style.setProperty('--font-serif', safeTheme.typography.fontSerif);
  root.style.setProperty('--font-heading', safeTheme.typography.fontHeading);

  ensureGoogleFontLoaded(safeTheme.typography.fontSans);
  ensureGoogleFontLoaded(safeTheme.typography.fontSerif);
  ensureGoogleFontLoaded(safeTheme.typography.fontHeading);

  root.style.setProperty('--radius', safeTheme.componentStyles.borderRadius);
  root.style.setProperty('--button-radius', safeTheme.componentStyles.buttonRadius);
  root.style.setProperty('--card-radius', safeTheme.componentStyles.cardRadius);
  root.style.setProperty('--shadow-sm', safeTheme.componentStyles.shadowSm);
  root.style.setProperty('--shadow-md', safeTheme.componentStyles.shadowMd);
  root.style.setProperty('--shadow-lg', safeTheme.componentStyles.shadowLg);

  root.style.setProperty('--container-max-width', safeTheme.layoutSettings.containerMaxWidth);
  root.style.setProperty('--section-spacing', safeTheme.layoutSettings.sectionSpacing);
  root.style.setProperty('--card-padding', safeTheme.layoutSettings.cardPadding);

  if (safeTheme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  root.setAttribute('data-theme-loaded', 'true');
};

export const initializeTheme = (): Theme | null => {
  const cached = getCachedTheme();
  const initialTheme = cached ? normalizeTheme(cached) : DEFAULT_THEME;
  applyThemeToDocument(initialTheme);
  return initialTheme;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(() => normalizeTheme(getCachedTheme()));
  const [savedTheme, setSavedTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(() => hasThemeBeenLoaded() && getCachedTheme() !== null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const applyTheme = useCallback((theme: Theme) => {
    applyThemeToDocument(normalizeTheme(theme));
    setIsThemeReady(true);
  }, []);

  const fetchThemes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedThemes: Theme[] = data.map((t: any) => normalizeTheme({
          id: t.id,
          name: t.name,
          slug: t.slug,
          colorPalette: t.color_palette,
          typography: t.typography,
          componentStyles: t.component_styles,
          layoutSettings: t.layout_settings,
          isActive: t.is_active,
          isDark: t.is_dark
        }));
        setThemes(mappedThemes);

        const active = mappedThemes.find(t => t.isActive);
        if (active) {
          setCurrentTheme(active);
          setSavedTheme(active);
          applyTheme(active);
          cacheTheme(active);
        } else {
          applyTheme(DEFAULT_THEME);
          cacheTheme(DEFAULT_THEME);
        }
      } else {
        applyTheme(DEFAULT_THEME);
        cacheTheme(DEFAULT_THEME);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
      const cached = getCachedTheme();
      const fallbackTheme = cached ? normalizeTheme(cached) : DEFAULT_THEME;
      setCurrentTheme(fallbackTheme);
      setSavedTheme(fallbackTheme);
      applyTheme(fallbackTheme);
    } finally {
      setIsLoading(false);
    }
  }, [applyTheme]);

  const setActiveTheme = async (themeId: string) => {
    try {
      const themeToActivate = themes.find(t => t.id === themeId);

      // Deactivate all other themes first so only one stays active
      const { error: deactivateError } = await supabase
        .from('themes')
        .update({ is_active: false })
        .neq('id', themeId);

      if (deactivateError) throw deactivateError;

      const { error } = await supabase
        .from('themes')
        .update({ is_active: true })
        .eq('id', themeId);

      if (error) throw error;

      if (themeToActivate) {
        const updatedTheme = { ...themeToActivate, isActive: true };
        cacheTheme(updatedTheme);
        applyTheme(updatedTheme);
        setCurrentTheme(updatedTheme);
        setSavedTheme(updatedTheme);
      }

      await fetchThemes();
      setIsPreviewMode(false);
    } catch (error) {
      console.error('Error setting active theme:', error);
    }
  };

  const previewTheme = (theme: Theme) => {
    if (!isPreviewMode && currentTheme) {
      setSavedTheme(currentTheme);
    }
    setIsPreviewMode(true);
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  const resetPreview = () => {
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
    setIsPreviewMode(false);
  };

  const refreshThemes = async () => {
    setIsLoading(true);
    await fetchThemes();
  };

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        isLoading,
        isThemeReady,
        setActiveTheme,
        previewTheme,
        resetPreview,
        isPreviewMode,
        refreshThemes
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
