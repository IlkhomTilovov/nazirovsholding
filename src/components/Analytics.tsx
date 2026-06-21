import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { configureAnalytics, trackPageView, trackClickPhone, trackClickTelegram } from '@/lib/analytics';

/**
 * Mounts analytics: configures providers from system_settings and tracks page_view
 * on each public route change. Does not track admin pages.
 */
export function Analytics() {
  const { settings } = useSystemSettings();
  const location = useLocation();
  const lastPathRef = useRef<string>('');
  const debounceRef = useRef<number | null>(null);

  // Configure providers when settings load/change
  useEffect(() => {
    const s: any = settings || {};
    configureAnalytics({
      internalEnabled: s.internal_analytics_enabled ?? true,
      ga4Enabled: !!s.ga4_enabled && !!s.ga4_measurement_id,
      ga4MeasurementId: s.ga4_measurement_id || null,
      clarityEnabled: !!s.clarity_enabled && !!s.clarity_project_id,
      clarityProjectId: s.clarity_project_id || null,
    });
  }, [settings]);

  // Track page_view on route change (debounced, dedup)
  useEffect(() => {
    const path = location.pathname + location.search;
    if (path === lastPathRef.current) return;
    if (path.startsWith('/admin')) {
      lastPathRef.current = path;
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      lastPathRef.current = path;
      trackPageView();
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [location.pathname, location.search]);

  // Global click listener for tel: and Telegram (t.me) links — public pages only
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (window.location.pathname.startsWith('/admin')) return;
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('tel:')) trackClickPhone();
      else if (/(^|\/\/)(t\.me\/|telegram\.me\/)/i.test(href) || href.startsWith('tg:')) trackClickTelegram();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
