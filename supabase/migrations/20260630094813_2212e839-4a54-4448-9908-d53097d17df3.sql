
-- Deactivate all existing themes
UPDATE public.themes SET is_active = false;

-- Insert/upsert the new Corporate Light theme
INSERT INTO public.themes (name, slug, color_palette, typography, component_styles, layout_settings, is_active, is_dark)
VALUES (
  'Corporate Executive Light',
  'corporate-executive-light',
  '{
    "background": "44 25% 97%",
    "foreground": "220 22% 17%",
    "card": "0 0% 100%",
    "cardForeground": "220 22% 17%",
    "popover": "0 0% 100%",
    "popoverForeground": "220 22% 17%",
    "primary": "44 65% 52%",
    "primaryForeground": "222 47% 11%",
    "secondary": "222 47% 11%",
    "secondaryForeground": "0 0% 100%",
    "muted": "44 20% 93%",
    "mutedForeground": "220 14% 40%",
    "accent": "44 65% 52%",
    "accentForeground": "222 47% 11%",
    "destructive": "0 70% 50%",
    "destructiveForeground": "0 0% 100%",
    "border": "220 13% 88%",
    "input": "220 13% 88%",
    "ring": "44 65% 52%",
    "warmCream": "44 25% 97%",
    "warmBeige": "44 30% 90%",
    "warmBrown": "220 22% 17%",
    "darkWood": "222 47% 11%",
    "goldAccent": "44 65% 52%",
    "sageGreen": "140 55% 32%"
  }'::jsonb,
  '{
    "fontSans": "Inter, system-ui, sans-serif",
    "fontSerif": "Instrument Serif, Georgia, serif",
    "fontHeading": "Instrument Serif, Georgia, serif"
  }'::jsonb,
  '{
    "borderRadius": "0.5rem",
    "buttonRadius": "0.5rem",
    "cardRadius": "1.25rem",
    "shadowSm": "0 1px 2px 0 rgb(15 23 42 / 0.04)",
    "shadowMd": "0 6px 20px -8px rgb(15 23 42 / 0.10)",
    "shadowLg": "0 24px 50px -20px rgb(15 23 42 / 0.18)"
  }'::jsonb,
  '{
    "containerMaxWidth": "1440px",
    "sectionSpacing": "7rem",
    "cardPadding": "2rem"
  }'::jsonb,
  true,
  false
)
ON CONFLICT (slug) DO UPDATE
SET
  color_palette = EXCLUDED.color_palette,
  typography = EXCLUDED.typography,
  component_styles = EXCLUDED.component_styles,
  layout_settings = EXCLUDED.layout_settings,
  is_active = true,
  is_dark = false;
