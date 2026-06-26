import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Check, X, Monitor, Tablet, Smartphone, Sparkles, Sun, Moon,
  Palette, Type as TypeIcon, Layers, Eye, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------- Types ----------
export interface ThemeFormData {
  name: string;
  isDark: boolean;
  primaryColor: string;     // HSL string "H S% L%"
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  fontFamily: string;
  borderRadius: string;
  shadowLevel: string;
}

interface ThemeBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'clone';
  formData: ThemeFormData;
  setFormData: (data: ThemeFormData) => void;
  onSave: () => void | Promise<void>;
}

// ---------- Preset themes ----------
const PRESETS: Array<{
  id: string;
  name: string;
  style: string;
  isDark: boolean;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  font: string;
  radius: string;
}> = [
  {
    id: 'noir-gold',
    name: 'Noir & Gold',
    style: 'Luxury · Editorial',
    isDark: true,
    primary: '0 0% 7%',
    secondary: '0 0% 14%',
    accent: '44 70% 54%',
    background: '0 0% 5%',
    foreground: '40 30% 96%',
    font: "'Playfair Display', Georgia, serif",
    radius: '0.25rem',
  },
  {
    id: 'modern-luxury',
    name: 'Modern Luxury',
    style: 'Black + Gold',
    isDark: true,
    primary: '0 0% 10%',
    secondary: '40 30% 92%',
    accent: '42 80% 50%',
    background: '0 0% 8%',
    foreground: '40 20% 96%',
    font: "'Cormorant Garamond', Georgia, serif",
    radius: '0.5rem',
  },
  {
    id: 'corporate-dark',
    name: 'Corporate Dark',
    style: 'Enterprise · Trust',
    isDark: true,
    primary: '215 60% 50%',
    secondary: '215 25% 18%',
    accent: '199 89% 48%',
    background: '222 47% 11%',
    foreground: '210 40% 96%',
    font: "'Inter', system-ui, sans-serif",
    radius: '0.5rem',
  },
  {
    id: 'midnight-executive',
    name: 'Midnight Executive',
    style: 'Indigo · Premium',
    isDark: true,
    primary: '240 60% 55%',
    secondary: '240 25% 18%',
    accent: '270 70% 60%',
    background: '240 40% 8%',
    foreground: '240 20% 96%',
    font: "'Manrope', system-ui, sans-serif",
    radius: '0.75rem',
  },
  {
    id: 'premium-export',
    name: 'Premium Export',
    style: 'Warm · Editorial',
    isDark: false,
    primary: '222 47% 11%',
    secondary: '40 30% 94%',
    accent: '44 70% 54%',
    background: '40 33% 98%',
    foreground: '222 47% 11%',
    font: "'Instrument Serif', Georgia, serif",
    radius: '0.5rem',
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    style: 'Minimal · Calm',
    isDark: false,
    primary: '210 30% 20%',
    secondary: '210 20% 94%',
    accent: '200 70% 50%',
    background: '210 20% 98%',
    foreground: '210 30% 15%',
    font: "'Work Sans', system-ui, sans-serif",
    radius: '0.5rem',
  },
];

// ---------- Font options ----------
const FONT_PRESETS = [
  { value: "'Instrument Serif', Georgia, serif", label: 'Instrument Serif', category: 'Serif' },
  { value: "'Playfair Display', Georgia, serif", label: 'Playfair Display', category: 'Serif' },
  { value: "'Cormorant Garamond', Georgia, serif", label: 'Cormorant Garamond', category: 'Serif' },
  { value: "'Inter', system-ui, sans-serif", label: 'Inter', category: 'Sans' },
  { value: "'Work Sans', system-ui, sans-serif", label: 'Work Sans', category: 'Sans' },
  { value: "'Montserrat', system-ui, sans-serif", label: 'Montserrat', category: 'Sans' },
  { value: "'Manrope', system-ui, sans-serif", label: 'Manrope', category: 'Sans' },
  { value: "'DM Sans', system-ui, sans-serif", label: 'DM Sans', category: 'Sans' },
  { value: "'Plus Jakarta Sans', system-ui, sans-serif", label: 'Plus Jakarta Sans', category: 'Sans' },
];

const RADIUS_PRESETS = [
  { value: '0', label: 'Sharp', visual: 0 },
  { value: '0.25rem', label: 'Subtle', visual: 4 },
  { value: '0.5rem', label: 'Smooth', visual: 8 },
  { value: '0.75rem', label: 'Rounded', visual: 12 },
  { value: '1rem', label: 'Soft', visual: 16 },
  { value: '1.5rem', label: 'Pillow', visual: 22 },
];

const SHADOW_PRESETS = [
  { value: 'none', label: 'None' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

// ---------- Color utilities ----------
const hslToHex = (hsl: string): string => {
  try {
    const [h, s, l] = hsl.split(' ').map((v) => parseFloat(v));
    const sN = s / 100;
    const lN = l / 100;
    const c = (1 - Math.abs(2 * lN - 1)) * sN;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lN - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
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

// ---------- Visual color card ----------
interface ColorCardProps {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}
const ColorCard = ({ label, description, value, onChange }: ColorCardProps) => {
  const hex = hslToHex(value);
  return (
    <label className="group relative flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/60 hover:ring-foreground/20 transition cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">{label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        </div>
        <div
          className="relative h-12 w-12 rounded-xl ring-1 ring-black/5 shadow-sm shrink-0 overflow-hidden"
          style={{ backgroundColor: `hsl(${value})` }}
        >
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(hexToHsl(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">HEX</span>
        <input
          value={hex}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(v)) onChange(hexToHsl(v));
          }}
          className="flex-1 bg-transparent text-xs font-mono tracking-wide focus:outline-none"
        />
      </div>
    </label>
  );
};

// ---------- Section header ----------
const Section = ({
  step, title, subtitle, icon, children,
}: {
  step: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/70">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
            {step}
          </span>
          <span className="h-px flex-1 bg-border/60" />
        </div>
        <h3 className="text-base font-semibold tracking-tight mt-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="pl-0">{children}</div>
  </section>
);

// ---------- Main dialog ----------
export const ThemeBuilderDialog = ({
  open, onOpenChange, mode, formData, setFormData, onSave,
}: ThemeBuilderDialogProps) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const apply = (patch: Partial<ThemeFormData>) =>
    setFormData({ ...formData, ...patch });

  const applyPreset = (p: typeof PRESETS[number]) => {
    setActivePresetId(p.id);
    setFormData({
      ...formData,
      isDark: p.isDark,
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      accentColor: p.accent,
      backgroundColor: p.background,
      foregroundColor: p.foreground,
      fontFamily: p.font,
      borderRadius: p.radius,
    });
  };

  const titleText =
    mode === 'create' ? 'Yangi mavzu yaratish' :
    mode === 'clone'  ? 'Mavzuni nusxalash'    :
                        'Mavzuni tahrirlash';

  const deviceWidth =
    device === 'desktop' ? 'w-full'       :
    device === 'tablet'  ? 'w-[420px]'    :
                           'w-[260px]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[1240px] w-[96vw] h-[94vh] p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-[hsl(0_0%_98%)]"
      >
        {/* ===== Sticky Header ===== */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-black/[0.06] px-8 py-5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-foreground to-foreground/70 flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-background" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold tracking-tight leading-tight truncate">
                {titleText}
              </h2>
              <p className="text-[13px] text-muted-foreground leading-tight">
                Brendingiz uchun professional dizayn tizimini yarating
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-5 h-10 text-sm"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={onSave}
              className="rounded-full px-6 h-10 text-sm bg-foreground text-background hover:bg-foreground/90 shadow-sm"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Saqlash
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              className="ml-1 h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center text-muted-foreground"
              aria-label="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ===== Body grid ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(380px,38%)] overflow-hidden" style={{ height: 'calc(94vh - 81px)' }}>
          {/* ===== LEFT — Controls ===== */}
          <div className="overflow-y-auto px-8 py-8 space-y-12 bg-[hsl(0_0%_98%)]">
            {/* Section 1 — Presets */}
            <Section
              step="01 · Preset"
              title="Tayyor mavzular"
              subtitle="Bir bosishda professional dizayn tizimini qo'llang"
              icon={<Wand2 className="h-4 w-4" />}
            >
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {PRESETS.map((p) => {
                  const isActive = activePresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={cn(
                        'group relative text-left rounded-2xl overflow-hidden bg-white ring-1 transition-all duration-200',
                        isActive
                          ? 'ring-2 ring-foreground shadow-lg -translate-y-0.5'
                          : 'ring-border/60 hover:ring-foreground/30 hover:shadow-md hover:-translate-y-0.5',
                      )}
                    >
                      {/* color band */}
                      <div className="flex h-14">
                        {[p.primary, p.secondary, p.accent, p.background, p.foreground].map((c, i) => (
                          <div key={i} className="flex-1" style={{ backgroundColor: `hsl(${c})` }} />
                        ))}
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold leading-tight truncate">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.style}</p>
                          </div>
                          {isActive && (
                            <div className="h-5 w-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Section 2 — Theme info */}
            <Section
              step="02 · Identity"
              title="Mavzu ma'lumotlari"
              subtitle="Nom va asosiy rejim"
              icon={<Palette className="h-4 w-4" />}
            >
              <div className="rounded-2xl bg-white ring-1 ring-border/60 p-5 space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Mavzu nomi
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => apply({ name: e.target.value })}
                    placeholder="Masalan: NazirovSholding Premium"
                    className="h-12 text-[15px] bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground px-0"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[hsl(0_0%_98%)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white ring-1 ring-border flex items-center justify-center">
                      {formData.isDark
                        ? <Moon className="h-4 w-4" />
                        : <Sun className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium">Qorong'i rejim</p>
                      <p className="text-xs text-muted-foreground">Mavzu turini belgilash</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isDark}
                    onCheckedChange={(c) => apply({ isDark: c })}
                  />
                </div>
              </div>
            </Section>

            {/* Section 3 — Colors */}
            <Section
              step="03 · Palette"
              title="Ranglar tizimi"
              subtitle="Brend ranglaringizni sozlang — har bir o'zgarish darhol ko'rinadi"
              icon={<Palette className="h-4 w-4" />}
            >
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                <ColorCard
                  label="Asosiy rang"
                  description="Tugmalar, linklar, brend"
                  value={formData.primaryColor}
                  onChange={(v) => apply({ primaryColor: v })}
                />
                <ColorCard
                  label="Ikkinchi darajali"
                  description="Kartalar, fonlar"
                  value={formData.secondaryColor}
                  onChange={(v) => apply({ secondaryColor: v })}
                />
                <ColorCard
                  label="Urg'u rang"
                  description="CTA va aksent"
                  value={formData.accentColor}
                  onChange={(v) => apply({ accentColor: v })}
                />
                <ColorCard
                  label="Orqa fon"
                  description="Sahifa fon rangi"
                  value={formData.backgroundColor}
                  onChange={(v) => apply({ backgroundColor: v })}
                />
                <ColorCard
                  label="Matn rangi"
                  description="Asosiy matn rangi"
                  value={formData.foregroundColor}
                  onChange={(v) => apply({ foregroundColor: v })}
                />
              </div>
            </Section>

            {/* Section 4 — Typography */}
            <Section
              step="04 · Type"
              title="Tipografiya"
              subtitle="Brendingizga mos shrift tanlang"
              icon={<TypeIcon className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FONT_PRESETS.map((f) => {
                  const isActive = formData.fontFamily === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => apply({ fontFamily: f.value })}
                      className={cn(
                        'group text-left rounded-2xl p-5 bg-white ring-1 transition-all',
                        isActive
                          ? 'ring-2 ring-foreground shadow-md'
                          : 'ring-border/60 hover:ring-foreground/30',
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                          {f.category}
                        </span>
                        {isActive && (
                          <div className="h-5 w-5 rounded-full bg-foreground text-background flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <p
                        className="text-2xl leading-tight font-semibold"
                        style={{ fontFamily: f.value }}
                      >
                        {f.label}
                      </p>
                      <p
                        className="text-xs text-muted-foreground mt-1"
                        style={{ fontFamily: f.value }}
                      >
                        Aa Bb Cc · 123 — Premium dizayn tizimi
                      </p>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Section 5 — Component styles */}
            <Section
              step="05 · Shape"
              title="Komponent uslublari"
              subtitle="Burchak va soya darajasini tanlang"
              icon={<Layers className="h-4 w-4" />}
            >
              <div className="space-y-4">
                {/* Radius */}
                <div className="rounded-2xl bg-white ring-1 ring-border/60 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Burchak radiusi</p>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {formData.borderRadius}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {RADIUS_PRESETS.map((r) => {
                      const isActive = formData.borderRadius === r.value;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => apply({ borderRadius: r.value })}
                          className={cn(
                            'flex flex-col items-center gap-2 p-3 rounded-xl ring-1 transition-all',
                            isActive
                              ? 'ring-2 ring-foreground bg-foreground/[0.03]'
                              : 'ring-border/60 hover:ring-foreground/30',
                          )}
                        >
                          <div
                            className="h-9 w-9 bg-foreground/80"
                            style={{ borderRadius: `${r.visual}px` }}
                          />
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {r.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shadow */}
                <div className="rounded-2xl bg-white ring-1 ring-border/60 p-5 space-y-3">
                  <p className="text-sm font-medium">Soya darajasi</p>
                  <div className="grid grid-cols-4 gap-2">
                    {SHADOW_PRESETS.map((s) => {
                      const isActive = formData.shadowLevel === s.value;
                      const shadowStyle =
                        s.value === 'none'   ? 'none' :
                        s.value === 'light'  ? '0 2px 8px rgba(0,0,0,0.06)' :
                        s.value === 'medium' ? '0 8px 24px rgba(0,0,0,0.10)' :
                                               '0 16px 40px rgba(0,0,0,0.18)';
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => apply({ shadowLevel: s.value })}
                          className={cn(
                            'flex flex-col items-center gap-3 p-4 rounded-xl ring-1 transition-all bg-[hsl(0_0%_98%)]',
                            isActive
                              ? 'ring-2 ring-foreground'
                              : 'ring-border/60 hover:ring-foreground/30',
                          )}
                        >
                          <div
                            className="h-10 w-10 rounded-lg bg-white"
                            style={{ boxShadow: shadowStyle }}
                          />
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {s.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Section>

            <div className="h-8" />
          </div>

          {/* ===== RIGHT — Live preview ===== */}
          <aside className="hidden lg:flex flex-col border-l border-black/[0.06] bg-[hsl(0_0%_96%)] overflow-hidden">
            {/* Preview toolbar */}
            <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white/60 backdrop-blur">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Jonli ko'rinish</span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-full bg-black/[0.04]">
                {[
                  { id: 'desktop', icon: Monitor },
                  { id: 'tablet',  icon: Tablet  },
                  { id: 'mobile',  icon: Smartphone },
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setDevice(id as any)}
                    className={cn(
                      'h-7 w-7 rounded-full flex items-center justify-center transition',
                      device === id
                        ? 'bg-white shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Preview canvas */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
              <div
                className={cn(
                  'transition-all duration-300 mx-auto rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-xl',
                  deviceWidth,
                )}
                style={{
                  backgroundColor: `hsl(${formData.backgroundColor})`,
                  color: `hsl(${formData.foregroundColor})`,
                  fontFamily: formData.fontFamily,
                }}
              >
                {/* Nav */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b"
                  style={{ borderColor: `hsl(${formData.secondaryColor})` }}
                >
                  <span
                    className="font-bold tracking-tight text-[15px]"
                    style={{ color: `hsl(${formData.foregroundColor})` }}
                  >
                    NazirovSholding
                  </span>
                  <div className="hidden sm:flex items-center gap-4 text-[11px] opacity-70">
                    <span>Bosh</span><span>Katalog</span><span>Aloqa</span>
                  </div>
                  <button
                    className="text-[11px] font-semibold px-3 py-1.5"
                    style={{
                      backgroundColor: `hsl(${formData.primaryColor})`,
                      color: `hsl(${formData.backgroundColor})`,
                      borderRadius: formData.borderRadius,
                    }}
                  >
                    Bog'lanish
                  </button>
                </div>

                {/* Hero */}
                <div className="px-5 py-6 space-y-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                    Premium kolleksiya
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight leading-[1.05]">
                    Sizning brendingiz,<br />
                    <span style={{ color: `hsl(${formData.accentColor})` }}>premium ko'rinishda</span>
                  </h1>
                  <p className="text-xs opacity-70 leading-relaxed max-w-[90%]">
                    Har bir tafsilot mukammal. Rang, shrift va shakl bir butun bo'lib jaranglaydi.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      className="text-[11px] font-semibold px-4 py-2"
                      style={{
                        backgroundColor: `hsl(${formData.primaryColor})`,
                        color: `hsl(${formData.backgroundColor})`,
                        borderRadius: formData.borderRadius,
                      }}
                    >
                      Katalogni ko'rish
                    </button>
                    <button
                      className="text-[11px] font-semibold px-4 py-2"
                      style={{
                        backgroundColor: 'transparent',
                        color: `hsl(${formData.foregroundColor})`,
                        border: `1px solid hsl(${formData.foregroundColor} / 0.2)`,
                        borderRadius: formData.borderRadius,
                      }}
                    >
                      Batafsil
                    </button>
                  </div>
                </div>

                {/* Cards */}
                <div className="px-5 pb-5 grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="overflow-hidden"
                      style={{
                        backgroundColor: `hsl(${formData.secondaryColor})`,
                        borderRadius: formData.borderRadius,
                      }}
                    >
                      <div
                        className="aspect-square flex items-center justify-center"
                        style={{ backgroundColor: `hsl(${formData.secondaryColor})` }}
                      >
                        <span
                          className="text-[9px] font-semibold uppercase tracking-wider px-2 py-1"
                          style={{
                            backgroundColor: `hsl(${formData.primaryColor})`,
                            color: `hsl(${formData.backgroundColor})`,
                            borderRadius: formData.borderRadius,
                          }}
                        >
                          Yangi
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-semibold leading-tight truncate">Mahsulot {i}</p>
                        <p className="text-[10px] opacity-60">1 250 000 so'm</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <div
                  className="px-5 py-5 border-t space-y-2"
                  style={{ borderColor: `hsl(${formData.secondaryColor})` }}
                >
                  <p className="text-[10px] opacity-60">Email</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value="sample@email.com"
                      className="flex-1 text-[11px] px-3 py-2 bg-transparent focus:outline-none"
                      style={{
                        border: `1px solid hsl(${formData.foregroundColor} / 0.15)`,
                        borderRadius: formData.borderRadius,
                        color: `hsl(${formData.foregroundColor})`,
                      }}
                    />
                    <button
                      className="text-[11px] font-semibold px-3 py-2"
                      style={{
                        backgroundColor: `hsl(${formData.accentColor})`,
                        color: `hsl(${formData.backgroundColor})`,
                        borderRadius: formData.borderRadius,
                      }}
                    >
                      Yuborish
                    </button>
                  </div>
                  <div className="flex gap-1.5 pt-2">
                    {['Chegirma', 'Yangi', 'Tavsiya'].map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-semibold uppercase tracking-wider px-2 py-1"
                        style={{
                          backgroundColor: `hsl(${formData.secondaryColor})`,
                          color: `hsl(${formData.foregroundColor})`,
                          borderRadius: formData.borderRadius,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="px-5 py-3 text-[10px] opacity-60 border-t"
                  style={{ borderColor: `hsl(${formData.secondaryColor})` }}
                >
                  © 2026 NazirovSholding · Premium dizayn tizimi
                </div>
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-black/[0.06] bg-white/60 backdrop-blur text-[11px] text-muted-foreground">
              O'zgarishlar avtomatik ko'rinishda yangilanadi
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
};
