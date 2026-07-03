-- Seed sample partners for the homepage "Hamkorlar" carousel (placeholder data,
-- editable/replaceable via the admin panel). Logos are inline SVG data URIs so no
-- external image hosting is required.
INSERT INTO public.partners (name, logo, website, sort_order, is_active)
VALUES
  ('Global Trade Alliance',
   'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%2780%27%3E%3Crect width=%27160%27 height=%2780%27 fill=%27%231e3a8a%27/%3E%3Ctext x=%2780%27 y=%2746%27 font-family=%27Arial%2C sans-serif%27 font-size=%2220%27 fill=%27white%27 text-anchor=%27middle%27%3EGTA%3C/text%3E%3C/svg%3E',
   NULL, 0, true),
  ('EuroLogistics Group',
   'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%2780%27%3E%3Crect width=%27160%27 height=%2780%27 fill=%27%230f766e%27/%3E%3Ctext x=%2780%27 y=%2746%27 font-family=%27Arial%2C sans-serif%27 font-size=%2220%27 fill=%27white%27 text-anchor=%27middle%27%3EELG%3C/text%3E%3C/svg%3E',
   NULL, 1, true),
  ('Silk Road Partners',
   'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%2780%27%3E%3Crect width=%27160%27 height=%2780%27 fill=%27%23b45309%27/%3E%3Ctext x=%2780%27 y=%2746%27 font-family=%27Arial%2C sans-serif%27 font-size=%2220%27 fill=%27white%27 text-anchor=%27middle%27%3ESRP%3C/text%3E%3C/svg%3E',
   NULL, 2, true),
  ('Continental Export Co.',
   'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%2780%27%3E%3Crect width=%27160%27 height=%2780%27 fill=%27%236d28d9%27/%3E%3Ctext x=%2780%27 y=%2746%27 font-family=%27Arial%2C sans-serif%27 font-size=%2220%27 fill=%27white%27 text-anchor=%27middle%27%3ECEC%3C/text%3E%3C/svg%3E',
   NULL, 3, true),
  ('Trans Asia Ventures',
   'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%2780%27%3E%3Crect width=%27160%27 height=%2780%27 fill=%27%23be123c%27/%3E%3Ctext x=%2780%27 y=%2746%27 font-family=%27Arial%2C sans-serif%27 font-size=%2220%27 fill=%27white%27 text-anchor=%27middle%27%3ETAV%3C/text%3E%3C/svg%3E',
   NULL, 4, true),
  ('Nordic Supply Chain',
   'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%2780%27%3E%3Crect width=%27160%27 height=%2780%27 fill=%27%23334155%27/%3E%3Ctext x=%2780%27 y=%2746%27 font-family=%27Arial%2C sans-serif%27 font-size=%2220%27 fill=%27white%27 text-anchor=%27middle%27%3ENSC%3C/text%3E%3C/svg%3E',
   NULL, 5, true);
