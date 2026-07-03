
-- Add a new light + blue theme (does not touch is_active on existing themes)
INSERT INTO public.themes (name, slug, color_palette, typography, component_styles, layout_settings, is_active, is_dark)
VALUES (
  'Sky Corporate',
  'sky-corporate',
  '{
    "background": "210 40% 98%",
    "foreground": "222 47% 11%",
    "card": "0 0% 100%",
    "cardForeground": "222 47% 11%",
    "popover": "0 0% 100%",
    "popoverForeground": "222 47% 11%",
    "primary": "221 83% 53%",
    "primaryForeground": "0 0% 100%",
    "secondary": "210 40% 96%",
    "secondaryForeground": "222 47% 11%",
    "muted": "210 40% 94%",
    "mutedForeground": "215 16% 47%",
    "accent": "199 89% 48%",
    "accentForeground": "0 0% 100%",
    "destructive": "0 84% 60%",
    "destructiveForeground": "0 0% 100%",
    "border": "214 32% 91%",
    "input": "214 32% 91%",
    "ring": "221 83% 53%",
    "warmCream": "210 40% 98%",
    "warmBeige": "210 40% 94%",
    "warmBrown": "222 47% 11%",
    "darkWood": "222 47% 11%",
    "goldAccent": "199 89% 48%",
    "sageGreen": "142 76% 36%"
  }'::jsonb,
  '{
    "fontSans": "Inter, system-ui, sans-serif",
    "fontSerif": "Inter, system-ui, sans-serif",
    "fontHeading": "Manrope, system-ui, sans-serif"
  }'::jsonb,
  '{
    "borderRadius": "0.5rem",
    "buttonRadius": "0.5rem",
    "cardRadius": "1rem",
    "shadowSm": "0 1px 2px 0 rgb(30 64 175 / 0.05)",
    "shadowMd": "0 8px 24px -8px rgb(30 64 175 / 0.14)",
    "shadowLg": "0 24px 50px -20px rgb(30 64 175 / 0.22)"
  }'::jsonb,
  '{
    "containerMaxWidth": "1400px",
    "sectionSpacing": "6rem",
    "cardPadding": "1.75rem"
  }'::jsonb,
  false,
  false
)
ON CONFLICT (slug) DO NOTHING;
