INSERT INTO public.themes (name, slug, is_active, is_dark, color_palette, typography, component_styles, layout_settings)
VALUES (
  'MIR MEXA Default',
  'mir-mexa-default',
  true,
  false,
  '{
    "background": "0 0% 100%",
    "foreground": "20 14% 12%",
    "card": "0 0% 100%",
    "cardForeground": "20 14% 12%",
    "popover": "0 0% 100%",
    "popoverForeground": "20 14% 12%",
    "primary": "20 50% 25%",
    "primaryForeground": "40 30% 96%",
    "secondary": "35 25% 92%",
    "secondaryForeground": "20 14% 12%",
    "muted": "35 20% 95%",
    "mutedForeground": "20 10% 40%",
    "accent": "38 60% 50%",
    "accentForeground": "20 14% 12%",
    "destructive": "0 70% 45%",
    "destructiveForeground": "0 0% 100%",
    "border": "30 15% 88%",
    "input": "30 15% 88%",
    "ring": "20 50% 25%",
    "warmCream": "40 35% 96%",
    "warmBeige": "35 30% 88%",
    "warmBrown": "25 30% 35%",
    "darkWood": "20 25% 18%",
    "goldAccent": "38 65% 52%",
    "sageGreen": "120 15% 45%"
  }'::jsonb,
  '{
    "fontSans": "Inter, system-ui, sans-serif",
    "fontSerif": "Playfair Display, Georgia, serif",
    "fontHeading": "Playfair Display, Georgia, serif"
  }'::jsonb,
  '{
    "borderRadius": "0.5rem",
    "buttonRadius": "0.5rem",
    "cardRadius": "0.75rem",
    "shadowSm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "shadowMd": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "shadowLg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  }'::jsonb,
  '{
    "containerMaxWidth": "1280px",
    "sectionSpacing": "5rem",
    "cardPadding": "1.5rem"
  }'::jsonb
);