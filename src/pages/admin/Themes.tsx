import { useState, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Theme, ThemeColors, ThemeTypography, ThemeComponentStyles, ThemeLayoutSettings } from '@/lib/themes';
import {
  Check, Eye, EyeOff, Palette, Moon, Sun, RefreshCw, Plus, Copy,
  Trash2, Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ThemeBuilderDialog } from '@/components/admin/ThemeBuilderDialog';

const FONT_OPTIONS = [
  // Sans-serif
  { value: "'Inter', system-ui, sans-serif", label: "Inter" },
  { value: "'Roboto', system-ui, sans-serif", label: "Roboto" },
  { value: "'Open Sans', system-ui, sans-serif", label: "Open Sans" },
  { value: "'Lato', system-ui, sans-serif", label: "Lato" },
  { value: "'Montserrat', system-ui, sans-serif", label: "Montserrat" },
  { value: "'Poppins', system-ui, sans-serif", label: "Poppins" },
  { value: "'Raleway', system-ui, sans-serif", label: "Raleway" },
  { value: "'Nunito', system-ui, sans-serif", label: "Nunito" },
  { value: "'Nunito Sans', system-ui, sans-serif", label: "Nunito Sans" },
  { value: "'Source Sans 3', system-ui, sans-serif", label: "Source Sans 3" },
  { value: "'PT Sans', system-ui, sans-serif", label: "PT Sans" },
  { value: "'Ubuntu', system-ui, sans-serif", label: "Ubuntu" },
  { value: "'Mulish', system-ui, sans-serif", label: "Mulish" },
  { value: "'Work Sans', system-ui, sans-serif", label: "Work Sans" },
  { value: "'Rubik', system-ui, sans-serif", label: "Rubik" },
  { value: "'Manrope', system-ui, sans-serif", label: "Manrope" },
  { value: "'DM Sans', system-ui, sans-serif", label: "DM Sans" },
  { value: "'Karla', system-ui, sans-serif", label: "Karla" },
  { value: "'Plus Jakarta Sans', system-ui, sans-serif", label: "Plus Jakarta Sans" },
  { value: "'Quicksand', system-ui, sans-serif", label: "Quicksand" },
  { value: "'Fira Sans', system-ui, sans-serif", label: "Fira Sans" },
  { value: "'Cabin', system-ui, sans-serif", label: "Cabin" },
  { value: "'Barlow', system-ui, sans-serif", label: "Barlow" },
  { value: "'Oxygen', system-ui, sans-serif", label: "Oxygen" },
  { value: "'Titillium Web', system-ui, sans-serif", label: "Titillium Web" },
  { value: "'Hind', system-ui, sans-serif", label: "Hind" },
  { value: "'Heebo', system-ui, sans-serif", label: "Heebo" },
  { value: "'Cairo', system-ui, sans-serif", label: "Cairo" },
  { value: "'IBM Plex Sans', system-ui, sans-serif", label: "IBM Plex Sans" },
  // Serif
  { value: "'Playfair Display', Georgia, serif", label: "Playfair Display" },
  { value: "'Merriweather', Georgia, serif", label: "Merriweather" },
  { value: "'Lora', Georgia, serif", label: "Lora" },
  { value: "'PT Serif', Georgia, serif", label: "PT Serif" },
  { value: "'Roboto Slab', Georgia, serif", label: "Roboto Slab" },
  { value: "'Bitter', Georgia, serif", label: "Bitter" },
  { value: "'Crimson Text', Georgia, serif", label: "Crimson Text" },
  { value: "'EB Garamond', Georgia, serif", label: "EB Garamond" },
  { value: "'Cormorant Garamond', Georgia, serif", label: "Cormorant Garamond" },
  { value: "'Libre Baskerville', Georgia, serif", label: "Libre Baskerville" },
  { value: "'Noto Serif', Georgia, serif", label: "Noto Serif" },
  { value: "'Source Serif 4', Georgia, serif", label: "Source Serif 4" },
  { value: "'IBM Plex Serif', Georgia, serif", label: "IBM Plex Serif" },
  // Display / Bold
  { value: "'Oswald', sans-serif", label: "Oswald" },
  { value: "'Bebas Neue', sans-serif", label: "Bebas Neue" },
  { value: "'Anton', sans-serif", label: "Anton" },
  { value: "'Archivo Black', sans-serif", label: "Archivo Black" },
  { value: "'Righteous', sans-serif", label: "Righteous" },
  { value: "'Russo One', sans-serif", label: "Russo One" },
  { value: "'Teko', sans-serif", label: "Teko" },
  { value: "'Yanone Kaffeesatz', sans-serif", label: "Yanone Kaffeesatz" },
  { value: "'Abril Fatface', cursive", label: "Abril Fatface" },
  // Rounded / Friendly
  { value: "'Comfortaa', system-ui, sans-serif", label: "Comfortaa" },
  { value: "'Josefin Sans', system-ui, sans-serif", label: "Josefin Sans" },
  { value: "'Exo 2', system-ui, sans-serif", label: "Exo 2" },
  { value: "'Orbitron', sans-serif", label: "Orbitron" },
  // Handwriting / Script
  { value: "'Pacifico', cursive", label: "Pacifico" },
  { value: "'Lobster', cursive", label: "Lobster" },
  { value: "'Dancing Script', cursive", label: "Dancing Script" },
  { value: "'Caveat', cursive", label: "Caveat" },
  { value: "'Sacramento', cursive", label: "Sacramento" },
  { value: "'Great Vibes', cursive", label: "Great Vibes" },
  { value: "'Satisfy', cursive", label: "Satisfy" },
  { value: "'Permanent Marker', cursive", label: "Permanent Marker" },
  { value: "'Shadows Into Light', cursive", label: "Shadows Into Light" },
  { value: "'Indie Flower', cursive", label: "Indie Flower" },
  { value: "'Amatic SC', cursive", label: "Amatic SC" },
  // Monospace
  { value: "'Roboto Mono', monospace", label: "Roboto Mono" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
  { value: "'Space Mono', monospace", label: "Space Mono" },
  { value: "'IBM Plex Mono', monospace", label: "IBM Plex Mono" },
  { value: "'Press Start 2P', monospace", label: "Press Start 2P (Pixel)" },
];

const RADIUS_OPTIONS = [
  { value: "0", label: "0 (Sharp)" },
  { value: "0.25rem", label: "0.25rem" },
  { value: "0.5rem", label: "0.5rem" },
  { value: "0.75rem", label: "0.75rem" },
  { value: "1rem", label: "1rem" },
  { value: "1.5rem", label: "1.5rem (Rounded)" },
];

const Themes = () => {
  const { 
    themes, 
    currentTheme, 
    isLoading, 
    setActiveTheme, 
    previewTheme, 
    resetPreview, 
    isPreviewMode,
    refreshThemes 
  } = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'light' | 'dark'>('all');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [builderMode, setBuilderMode] = useState<'create' | 'edit' | 'clone'>('create');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    isDark: false,
    primaryColor: '222 47% 11%',
    secondaryColor: '210 40% 96%',
    accentColor: '142 76% 36%',
    backgroundColor: '0 0% 100%',
    foregroundColor: '222 47% 11%',
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0.5rem',
    shadowLevel: 'medium',
  });

  const filteredThemes = useMemo(() => {
    let result = themes.filter(theme => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'light') return !theme.isDark;
      if (selectedCategory === 'dark') return theme.isDark;
      return true;
    });

    // Sort: active theme first
    result.sort((a, b) => {
      if (a.isActive) return -1;
      if (b.isActive) return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [themes, selectedCategory]);

  const handlePreview = (theme: Theme) => {
    if (previewingId === theme.id) {
      resetPreview();
      setPreviewingId(null);
    } else {
      previewTheme(theme);
      setPreviewingId(theme.id || null);
    }
  };

  const handleApply = async (theme: Theme) => {
    if (!theme.id) return;
    await setActiveTheme(theme.id);
    setPreviewingId(null);
    toast.success(`"${theme.name}" mavzusi qo'llanildi!`);
  };

  const handleEdit = (theme: Theme) => {
    setBuilderMode('edit');
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      isDark: theme.isDark,
      primaryColor: theme.colorPalette.primary,
      secondaryColor: theme.colorPalette.secondary,
      accentColor: theme.colorPalette.accent,
      backgroundColor: theme.colorPalette.background,
      foregroundColor: theme.colorPalette.foreground,
      fontFamily: theme.typography.fontSans,
      borderRadius: theme.componentStyles.borderRadius,
      shadowLevel: 'medium',
    });
    setShowBuilder(true);
  };

  const handleDelete = async (theme: Theme) => {
    if (!theme.id || theme.isActive) return;
    if (!confirm(`"${theme.name}" mavzusini o'chirishni xohlaysizmi?`)) return;
    try {
      const { error } = await supabase.from('themes').delete().eq('id', theme.id);
      if (error) throw error;
      toast.success("Mavzu o'chirildi");
      refreshThemes();
    } catch (error: any) {
      toast.error(`Xatolik: ${error.message}`);
    }
  };

  const handleClone = (theme: Theme) => {
    setBuilderMode('clone');
    setEditingTheme(theme);
    setFormData({
      name: `${theme.name} (nusxa)`,
      isDark: theme.isDark,
      primaryColor: theme.colorPalette.primary,
      secondaryColor: theme.colorPalette.secondary,
      accentColor: theme.colorPalette.accent,
      backgroundColor: theme.colorPalette.background,
      foregroundColor: theme.colorPalette.foreground,
      fontFamily: theme.typography.fontSans,
      borderRadius: theme.componentStyles.borderRadius,
      shadowLevel: 'medium',
    });
    setShowBuilder(true);
  };

  const handleCreateNew = () => {
    setBuilderMode('create');
    setEditingTheme(null);
    setFormData({
      name: '',
      isDark: false,
      primaryColor: '222 47% 11%',
      secondaryColor: '210 40% 96%',
      accentColor: '142 76% 36%',
      backgroundColor: '0 0% 100%',
      foregroundColor: '222 47% 11%',
      fontFamily: "'Inter', system-ui, sans-serif",
      borderRadius: '0.5rem',
      shadowLevel: 'medium',
    });
    setShowBuilder(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const getShadowValues = (level: string) => {
    switch (level) {
      case 'none':
        return { sm: 'none', md: 'none', lg: 'none' };
      case 'light':
        return {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
          md: '0 2px 4px -1px rgb(0 0 0 / 0.05)',
          lg: '0 4px 8px -2px rgb(0 0 0 / 0.08)',
        };
      case 'medium':
        return {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        };
      case 'heavy':
        return {
          sm: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
          md: '0 6px 12px -2px rgb(0 0 0 / 0.15)',
          lg: '0 15px 25px -5px rgb(0 0 0 / 0.2)',
        };
      default:
        return {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        };
    }
  };

  const handleSaveTheme = async () => {
    if (!formData.name.trim()) {
      toast.error('Mavzu nomini kiriting');
      return;
    }

    const shadows = getShadowValues(formData.shadowLevel);
    const slug = generateSlug(formData.name);

    // Helpers to derive proper surface/border/muted tones from bg/fg
    const parseHsl = (v: string): [number, number, number] => {
      const m = v.match(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
      if (!m) return [0, 0, 0];
      return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
    };
    const toHsl = (h: number, s: number, l: number) =>
      `${Math.round(h)} ${Math.max(0, Math.min(100, Math.round(s)))}% ${Math.max(0, Math.min(100, Math.round(l)))}%`;
    const shiftL = (v: string, delta: number) => {
      const [h, s, l] = parseHsl(v);
      return toHsl(h, s, l + delta);
    };
    const mixL = (v: string, target: number, amount: number) => {
      const [h, s, l] = parseHsl(v);
      return toHsl(h, s, l + (target - l) * amount);
    };
    const readableOn = (bg: string) => {
      const [, , l] = parseHsl(bg);
      return l > 55 ? '0 0% 8%' : '0 0% 98%';
    };

    const bg = formData.backgroundColor;
    const fg = formData.foregroundColor;
    const isDark = formData.isDark;
    const surface = isDark ? shiftL(bg, 3) : shiftL(bg, -2);
    const border = isDark ? shiftL(bg, 8) : shiftL(bg, -8);
    const muted = isDark ? shiftL(bg, 5) : shiftL(bg, -4);
    const mutedFg = mixL(fg, isDark ? 0 : 100, 0.35);

    const colorPalette: ThemeColors = {
      background: bg,
      foreground: fg,
      card: surface,
      cardForeground: fg,
      popover: surface,
      popoverForeground: fg,
      primary: formData.primaryColor,
      primaryForeground: readableOn(formData.primaryColor),
      secondary: muted,
      secondaryForeground: fg,
      muted,
      mutedForeground: mutedFg,
      accent: formData.accentColor,
      accentForeground: readableOn(formData.accentColor),
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border,
      input: border,
      ring: formData.primaryColor,
      warmCream: bg,
      warmBeige: muted,
      warmBrown: formData.primaryColor,
      darkWood: fg,
      goldAccent: formData.accentColor,
      sageGreen: '142 76% 36%',
    };

    const typography: ThemeTypography = {
      fontSans: formData.fontFamily,
      fontSerif: formData.fontFamily,
      fontHeading: formData.fontFamily,
    };

    const componentStyles: ThemeComponentStyles = {
      borderRadius: formData.borderRadius,
      buttonRadius: formData.borderRadius,
      cardRadius: formData.borderRadius,
      shadowSm: shadows.sm,
      shadowMd: shadows.md,
      shadowLg: shadows.lg,
    };

    const layoutSettings: ThemeLayoutSettings = {
      containerMaxWidth: '1280px',
      sectionSpacing: '4rem',
      cardPadding: '1.5rem',
    };

    try {
      const themeData = {
        name: formData.name,
        slug,
        is_dark: formData.isDark,
        color_palette: JSON.parse(JSON.stringify(colorPalette)),
        typography: JSON.parse(JSON.stringify(typography)),
        component_styles: JSON.parse(JSON.stringify(componentStyles)),
        layout_settings: JSON.parse(JSON.stringify(layoutSettings)),
      };

      if (builderMode === 'edit' && editingTheme?.id) {
        const { error } = await supabase.from('themes').update(themeData).eq('id', editingTheme.id);
        if (error) throw error;
        toast.success('Mavzu muvaffaqiyatli yangilandi!');
      } else {
        const { error } = await supabase.from('themes').insert([{ ...themeData, is_active: false }]);
        if (error) throw error;
        toast.success('Mavzu muvaffaqiyatli saqlandi!');
      }

      setShowBuilder(false);
      refreshThemes();
    } catch (error: any) {
      toast.error(`Xatolik: ${error.message}`);
    }
  };

  const getColorSwatches = (theme: Theme) => {
    return [
      { color: theme.colorPalette.primary, label: 'Primary' },
      { color: theme.colorPalette.secondary, label: 'Secondary' },
      { color: theme.colorPalette.accent, label: 'Accent' },
      { color: theme.colorPalette.background, label: 'Background' },
      { color: theme.colorPalette.foreground, label: 'Text' },
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mavzular</h1>
          <p className="text-muted-foreground">Sayt dizaynini bir marta bosish bilan o'zgartiring</p>
        </div>
        <div className="flex items-center gap-2">
          {isPreviewMode && (
            <Button variant="outline" size="sm" onClick={() => { resetPreview(); setPreviewingId(null); }}>
              <EyeOff className="h-4 w-4 mr-2" />
              Bekor qilish
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={refreshThemes}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yangilash
          </Button>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Yangi mavzu
          </Button>
        </div>
      </div>

      {/* Current Theme Card */}
      {currentTheme && (
        <Card className="bg-muted/30 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Joriy mavzu</h3>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium">{currentTheme.name}</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {getColorSwatches(currentTheme).map((swatch, i) => (
                      <div
                        key={i}
                        className="h-5 w-8 rounded border"
                        style={{ backgroundColor: `hsl(${swatch.color})` }}
                        title={swatch.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {currentTheme.isDark ? <Moon className="h-3 w-3 mr-1" /> : <Sun className="h-3 w-3 mr-1" />}
                  {currentTheme.isDark ? "Qorong'i" : "Yorug'"}
                </Badge>
                <Badge variant="default" className="bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Faol
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Barcha ({themes.length})</TabsTrigger>
          <TabsTrigger value="light">
            <Sun className="h-3 w-3 mr-1" />
            Yorug' ({themes.filter(t => !t.isDark).length})
          </TabsTrigger>
          <TabsTrigger value="dark">
            <Moon className="h-3 w-3 mr-1" />
            Qorong'i ({themes.filter(t => t.isDark).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredThemes.map((theme) => (
              <CompactThemeCard
                key={theme.id || theme.slug}
                theme={theme}
                isActive={currentTheme?.id === theme.id}
                isPreviewing={previewingId === theme.id}
                onPreview={() => handlePreview(theme)}
                onApply={() => handleApply(theme)}
                onClone={() => handleClone(theme)}
                onEdit={() => handleEdit(theme)}
                onDelete={() => handleDelete(theme)}
                colorSwatches={getColorSwatches(theme)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredThemes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Bu kategoriyada mavzu topilmadi
        </div>
      )}

      {/* Theme Builder Dialog */}
      <ThemeBuilderDialog
        open={showBuilder}
        onOpenChange={setShowBuilder}
        mode={builderMode}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveTheme}
      />
    </div>
  );
};

// Color Input Component
interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput = ({ label, value, onChange }: ColorInputProps) => {
  const hslToHex = (hsl: string): string => {
    try {
      const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
      const sNorm = s / 100;
      const lNorm = l / 100;
      const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = lNorm - c / 2;
      let r = 0, g = 0, b = 0;
      if (h < 60) { r = c; g = x; }
      else if (h < 120) { r = x; g = c; }
      else if (h < 180) { g = c; b = x; }
      else if (h < 240) { g = x; b = c; }
      else if (h < 300) { r = x; b = c; }
      else { r = c; b = x; }
      const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    } catch {
      return '#000000';
    }
  };

  const hexToHsl = (hex: string): string => {
    try {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      let h = 0, s = 0;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
          case g: h = ((b - r) / d + 2) * 60; break;
          case b: h = ((r - g) / d + 4) * 60; break;
        }
      }
      return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    } catch {
      return '0 0% 0%';
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={hslToHex(value)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="w-10 h-8 rounded cursor-pointer border-0"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs h-8 flex-1"
          placeholder="0 0% 100%"
        />
      </div>
    </div>
  );
};

// Compact Theme Card Component
interface CompactThemeCardProps {
  theme: Theme;
  isActive: boolean;
  isPreviewing: boolean;
  onPreview: () => void;
  onApply: () => void;
  onClone: () => void;
  onEdit: () => void;
  onDelete: () => void;
  colorSwatches: { color: string; label: string }[];
}

const CompactThemeCard = ({ 
  theme, isActive, isPreviewing, onPreview, onApply, onClone, onEdit, onDelete, colorSwatches 
}: CompactThemeCardProps) => {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${
      isActive ? 'ring-2 ring-primary' : ''
    } ${isPreviewing ? 'ring-2 ring-accent' : ''}`}>
      {/* Mini Preview */}
      <div 
        className="h-24 relative p-2"
        style={{ backgroundColor: `hsl(${theme.colorPalette.background})` }}
      >
        <div className="h-full flex flex-col gap-1">
          <div 
            className="h-5 rounded-sm"
            style={{ backgroundColor: `hsl(${theme.colorPalette.primary})` }}
          />
          <div className="flex-1 flex gap-1">
            <div 
              className="w-2/5 rounded-sm"
              style={{ backgroundColor: `hsl(${theme.colorPalette.card})`, border: `1px solid hsl(${theme.colorPalette.border})` }}
            />
            <div 
              className="flex-1 rounded-sm"
              style={{ backgroundColor: `hsl(${theme.colorPalette.secondary})` }}
            />
          </div>
          <div 
            className="h-3 rounded-sm"
            style={{ backgroundColor: `hsl(${theme.colorPalette.accent})` }}
          />
        </div>

        {/* Status Badges */}
        <div className="absolute top-1 right-1 flex gap-0.5">
          {isActive && (
            <Badge className="bg-green-600 text-white h-5 px-1 text-[10px]">
              <Check className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-2.5">
        {/* Theme Name */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm truncate">{theme.name}</h3>
          {theme.isDark ? (
            <Moon className="h-3 w-3 text-muted-foreground" />
          ) : (
            <Sun className="h-3 w-3 text-muted-foreground" />
          )}
        </div>

        {/* Color Blocks */}
        <div className="flex gap-0.5 mb-2">
          {colorSwatches.map((swatch, i) => (
            <div
              key={i}
              className="h-4 flex-1 first:rounded-l last:rounded-r"
              style={{ backgroundColor: `hsl(${swatch.color})` }}
              title={swatch.label}
            />
          ))}
        </div>

        {/* Info */}
        <div className="text-[10px] text-muted-foreground mb-2 space-y-0.5">
          <p className="truncate">Font: {theme.typography.fontSans.split(',')[0].replace(/'/g, '')}</p>
          <p>Border radius: {theme.componentStyles.borderRadius}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs px-2"
            onClick={onPreview}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ko'rish
          </Button>
          <Button
            size="sm"
            className="flex-1 h-7 text-xs px-2"
            onClick={onApply}
            disabled={isActive}
          >
            {isActive ? (
              <Check className="h-3 w-3" />
            ) : (
              "Qo'llash"
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
            title="Tahrirlash"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClone}
            title="Nusxalash"
          >
            <Copy className="h-3 w-3" />
          </Button>
          {!isActive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
              title="O'chirish"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Themes;
