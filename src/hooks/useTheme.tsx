import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Theme } from '@/lib/themes';

const THEME_CACHE_KEY = 'furniture-active-theme';
const THEME_READY_KEY = 'furniture-theme-ready';

const DEFAULT_THEME: Theme = {
  name: 'MIR MEXA Default',
  slug: 'mir-mexa-default',
  colorPalette: {
    background: '0 0% 100%',
    foreground: '20 14% 12%',
    card: '0 0% 100%',
    cardForeground: '20 14% 12%',
    popover: '0 0% 100%',
    popoverForeground: '20 14% 12%',
    primary: '20 50% 25%',
    primaryForeground: '40 30% 96%',
    secondary: '35 25% 92%',
    secondaryForeground: '20 14% 12%',
    muted: '35 20% 95%',
    mutedForeground: '20 10% 40%',
    accent: '38 60% 50%',
    accentForeground: '20 14% 12%',
    destructive: '0 70% 45%',
    destructiveForeground: '0 0% 100%',
    border: '30 15% 88%',
    input: '30 15% 88%',
    ring: '20 50% 25%',
    warmCream: '40 35% 96%',
    warmBeige: '35 30% 88%',
    warmBrown: '25 30% 35%',
    darkWood: '20 25% 18%',
    goldAccent: '38 65% 52%',
    sageGreen: '120 15% 45%',
  },
  typography: {
    fontSans: 'Inter, system-ui, sans-serif',
    fontSerif: 'Playfair Display, Georgia, serif',
    fontHeading: 'Playfair Display, Georgia, serif',
  },
  componentStyles: {
    borderRadius: '0.5rem',
    buttonRadius: '0.5rem',
    cardRadius: '0.75rem',
    shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  layoutSettings: {
    containerMaxWidth: '1280px',
    sectionSpacing: '5rem',
    cardPadding: '1.5rem',
  },
  isActive: true,
  isDark: false,
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
