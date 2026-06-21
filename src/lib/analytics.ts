// Analytics module: GA4 + internal Supabase analytics + session id
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'tilla_session_id';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

// ---------- Session ----------
export function getSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = (crypto as any)?.randomUUID?.() ?? `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `s-${Date.now()}`;
  }
}

// ---------- Device parsing ----------
function parseUA(ua: string) {
  const lower = ua.toLowerCase();
  const device_type = /mobile|android|iphone|ipad/.test(lower)
    ? (/ipad|tablet/.test(lower) ? 'tablet' : 'mobile')
    : 'desktop';
  const browser =
    /edg\//i.test(ua) ? 'Edge' :
    /chrome|crios/i.test(ua) ? 'Chrome' :
    /firefox|fxios/i.test(ua) ? 'Firefox' :
    /safari/i.test(ua) ? 'Safari' :
    'Other';
  const os =
    /windows/i.test(ua) ? 'Windows' :
    /android/i.test(ua) ? 'Android' :
    /iphone|ipad|ios/i.test(ua) ? 'iOS' :
    /mac/i.test(ua) ? 'macOS' :
    /linux/i.test(ua) ? 'Linux' :
    'Other';
  return { device_type, browser, os };
}

// ---------- GA4 ----------
let ga4Loaded = false;
export function loadGA4(measurementId: string) {
  if (ga4Loaded || !measurementId || measurementId === 'G-XXXXXXXXXX') return;
  ga4Loaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
}

export function ga4Event(name: string, params: Record<string, any> = {}) {
  if (!window.gtag) return;
  try { window.gtag('event', name, params); } catch {}
}

// ---------- Microsoft Clarity ----------
let clarityLoaded = false;
export function loadClarity(projectId: string) {
  if (clarityLoaded || !projectId || projectId === 'CLARITY_PROJECT_ID') return;
  clarityLoaded = true;
  try {
    (function (c: any, l: Document, a: string, r: string, i: string) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://www.clarity.ms/tag/' + i;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode?.insertBefore(t, y);
    })(window, document, 'clarity', 'script', projectId);
  } catch {}
}

// ---------- Internal tracking ----------
export type AnalyticsEventName =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'order_submit'
  | 'click_phone'
  | 'click_telegram';

export interface TrackPayload {
  event_name: AnalyticsEventName;
  product_id?: string | null;
  product_slug?: string | null;
  product_name?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  metadata?: Record<string, any>;
}

let internalEnabled = true;
let ga4Id: string | null = null;
let clarityId: string | null = null;
let ga4Enabled = false;
let clarityEnabled = false;

export function configureAnalytics(opts: {
  internalEnabled?: boolean;
  ga4Enabled?: boolean;
  ga4MeasurementId?: string | null;
  clarityEnabled?: boolean;
  clarityProjectId?: string | null;
}) {
  if (typeof opts.internalEnabled === 'boolean') internalEnabled = opts.internalEnabled;
  if (typeof opts.ga4Enabled === 'boolean') ga4Enabled = opts.ga4Enabled;
  if (typeof opts.clarityEnabled === 'boolean') clarityEnabled = opts.clarityEnabled;
  ga4Id = opts.ga4MeasurementId ?? ga4Id;
  clarityId = opts.clarityProjectId ?? clarityId;

  if (ga4Enabled && ga4Id) loadGA4(ga4Id);
  if (clarityEnabled && clarityId) loadClarity(clarityId);
}

function isAdminPath() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
}

export async function track(payload: TrackPayload) {
  // Never track admin pages
  if (isAdminPath()) return;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const { device_type, browser, os } = parseUA(ua);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const referrer = typeof document !== 'undefined' ? document.referrer || null : null;
  const session_id = getSessionId();

  // GA4 forward (safe params only)
  if (ga4Enabled) {
    ga4Event(payload.event_name, {
      page_path: path,
      product_id: payload.product_id ?? undefined,
      product_slug: payload.product_slug ?? undefined,
      category: payload.category_name ?? undefined,
      ...payload.metadata,
    });
  }

  if (!internalEnabled) return;

  try {
    const row = {
      event_name: payload.event_name,
      page_url: url,
      page_path: path,
      product_id: payload.product_id || null,
      product_slug: payload.product_slug || null,
      product_name: payload.product_name || null,
      category_id: payload.category_id || null,
      category_name: payload.category_name || null,
      session_id,
      referrer,
      user_agent: ua,
      device_type,
      browser,
      os,
      metadata: payload.metadata || {},
    };
    // Fire-and-forget; never block
    supabase.from('site_analytics_events').insert(row as any).then(({ error }) => {
      if (error && import.meta.env.DEV) console.warn('[analytics] insert failed', error);
    });
  } catch {
    // silent
  }
}

// Convenience helpers
export const trackPageView = () => track({ event_name: 'page_view' });
export const trackProductView = (p: { id?: string; slug?: string; name?: string; category_id?: string; category_name?: string }) =>
  track({
    event_name: 'product_view',
    product_id: p.id,
    product_slug: p.slug,
    product_name: p.name,
    category_id: p.category_id,
    category_name: p.category_name,
  });
export const trackAddToCart = (p: { id?: string; slug?: string; name?: string; category_name?: string; quantity?: number; price?: number }) =>
  track({
    event_name: 'add_to_cart',
    product_id: p.id,
    product_slug: p.slug,
    product_name: p.name,
    category_name: p.category_name,
    metadata: { quantity: p.quantity, price: p.price },
  });
export const trackBeginCheckout = (m: { cart_items_count?: number; cart_total?: number }) =>
  track({ event_name: 'begin_checkout', metadata: m });
export const trackOrderSubmit = (m: { order_id?: string; order_total?: number; items_count?: number }) =>
  track({ event_name: 'order_submit', metadata: m });
export const trackClickPhone = () => track({ event_name: 'click_phone' });
export const trackClickTelegram = () => track({ event_name: 'click_telegram' });
