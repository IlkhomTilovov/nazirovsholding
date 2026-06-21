ALTER TABLE public.orders ALTER COLUMN total_price TYPE numeric(14,2);
ALTER TABLE public.order_items ALTER COLUMN price_snapshot TYPE numeric(14,2);
ALTER TABLE public.products ALTER COLUMN price TYPE numeric(14,2);
ALTER TABLE public.products ALTER COLUMN original_price TYPE numeric(14,2);