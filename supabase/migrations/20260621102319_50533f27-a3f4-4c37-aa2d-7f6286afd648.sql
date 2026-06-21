
INSERT INTO public.themes (name, slug, color_palette, typography, component_styles, layout_settings, is_active, is_dark)
VALUES (
  'Noir & Gold Export',
  'noir-gold-export',
  '{
    "background": "0 0% 5%",
    "foreground": "40 40% 95%",
    "card": "0 0% 8%",
    "cardForeground": "40 40% 95%",
    "popover": "0 0% 8%",
    "popoverForeground": "40 40% 95%",
    "primary": "42 55% 54%",
    "primaryForeground": "0 0% 5%",
    "secondary": "0 0% 12%",
    "secondaryForeground": "40 40% 95%",
    "muted": "0 0% 12%",
    "mutedForeground": "40 15% 65%",
    "accent": "44 70% 70%",
    "accentForeground": "0 0% 5%",
    "destructive": "0 70% 50%",
    "destructiveForeground": "0 0% 100%",
    "border": "0 0% 18%",
    "input": "0 0% 15%",
    "ring": "42 55% 54%",
    "warmCream": "40 30% 92%",
    "warmBeige": "40 20% 80%",
    "warmBrown": "30 25% 25%",
    "darkWood": "0 0% 8%",
    "goldAccent": "42 60% 55%",
    "sageGreen": "120 15% 45%"
  }'::jsonb,
  '{
    "fontSans": "Work Sans, system-ui, sans-serif",
    "fontSerif": "Instrument Serif, Georgia, serif",
    "fontHeading": "Instrument Serif, Georgia, serif"
  }'::jsonb,
  '{
    "borderRadius": "0.25rem",
    "buttonRadius": "0.25rem",
    "cardRadius": "0.5rem",
    "shadowSm": "0 1px 2px 0 rgb(0 0 0 / 0.4)",
    "shadowMd": "0 4px 12px -2px rgb(0 0 0 / 0.5)",
    "shadowLg": "0 20px 40px -10px rgb(0 0 0 / 0.6)"
  }'::jsonb,
  '{
    "containerMaxWidth": "1400px",
    "sectionSpacing": "6rem",
    "cardPadding": "1.5rem"
  }'::jsonb,
  true,
  true
);
