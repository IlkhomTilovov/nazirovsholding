CREATE OR REPLACE FUNCTION public.get_public_analytics_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_visits int;
  today_visits int;
  online_now int;
  total_product_views int;
  total_orders int;
  daily jsonb;
  top_pages jsonb;
BEGIN
  SELECT COUNT(DISTINCT session_id) INTO total_visits
    FROM site_analytics_events WHERE event_name = 'page_view';

  SELECT COUNT(DISTINCT session_id) INTO today_visits
    FROM site_analytics_events
    WHERE event_name = 'page_view' AND created_at >= date_trunc('day', now());

  SELECT COUNT(DISTINCT session_id) INTO online_now
    FROM site_analytics_events
    WHERE created_at >= now() - interval '5 minutes';

  SELECT COUNT(*) INTO total_product_views
    FROM site_analytics_events WHERE event_name = 'product_view';

  SELECT COUNT(*) INTO total_orders
    FROM site_analytics_events WHERE event_name = 'order_submit';

  SELECT jsonb_agg(row_to_json(t)) INTO daily FROM (
    SELECT to_char(d::date, 'MM-DD') AS date,
      (SELECT COUNT(DISTINCT session_id) FROM site_analytics_events
        WHERE event_name = 'page_view'
          AND created_at >= d::date AND created_at < (d::date + 1)) AS visits
    FROM generate_series(now()::date - interval '6 days', now()::date, interval '1 day') AS d
  ) t;

  SELECT jsonb_agg(row_to_json(t)) INTO top_pages FROM (
    SELECT page_path AS path, COUNT(*)::int AS views
    FROM site_analytics_events
    WHERE event_name = 'page_view' AND page_path IS NOT NULL
      AND created_at >= now() - interval '30 days'
    GROUP BY page_path
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) t;

  result := jsonb_build_object(
    'total_visits', total_visits,
    'today_visits', today_visits,
    'online_now', online_now,
    'total_product_views', total_product_views,
    'total_orders', total_orders,
    'last_7_days', COALESCE(daily, '[]'::jsonb),
    'top_pages', COALESCE(top_pages, '[]'::jsonb)
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_analytics_stats() TO anon, authenticated;