import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Calendar as CalendarIcon, Users, Eye, ShoppingCart, CreditCard, ShoppingBag, TrendingUp, Activity } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

type Range = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

interface EventRow {
  event_name: string;
  page_path: string | null;
  product_id: string | null;
  product_slug: string | null;
  product_name: string | null;
  session_id: string;
  referrer: string | null;
  created_at: string;
}

function getRange(range: Range, customFrom?: Date, customTo?: Date): { from: Date; to: Date } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  if (range === 'today') return { from: startOfDay(now), to: endOfDay(now) };
  if (range === 'yesterday') {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { from: startOfDay(y), to: endOfDay(y) };
  }
  if (range === '7d') {
    const f = new Date(now); f.setDate(f.getDate() - 6);
    return { from: startOfDay(f), to: endOfDay(now) };
  }
  if (range === '30d') {
    const f = new Date(now); f.setDate(f.getDate() - 29);
    return { from: startOfDay(f), to: endOfDay(now) };
  }
  return {
    from: customFrom ? startOfDay(customFrom) : startOfDay(now),
    to: customTo ? endOfDay(customTo) : endOfDay(now),
  };
}

function unique<T>(arr: T[]) { return Array.from(new Set(arr)); }

function StatCard({ title, value, icon: Icon, hint }: { title: string; value: string | number; icon: any; hint?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [range, setRange] = useState<Range>('7d');
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [todayEvents, setTodayEvents] = useState<EventRow[]>([]);
  const [onlineSessions, setOnlineSessions] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const { from, to } = useMemo(() => getRange(range, customFrom, customTo), [range, customFrom, customTo]);

  // Fetch range data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('site_analytics_events')
        .select('event_name,page_path,product_id,product_slug,product_name,session_id,referrer,created_at')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: false })
        .limit(20000);
      if (cancelled) return;
      if (error) console.error(error);
      setEvents((data as EventRow[]) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [from, to]);

  // Today + online (refresh every 30s)
  useEffect(() => {
    let cancelled = false;
    const fetchLive = async () => {
      const t = getRange('today');
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const [todayRes, onlineRes] = await Promise.all([
        supabase
          .from('site_analytics_events')
          .select('event_name,session_id,product_id,page_path,created_at')
          .gte('created_at', t.from.toISOString())
          .lte('created_at', t.to.toISOString())
          .limit(20000),
        supabase
          .from('site_analytics_events')
          .select('session_id')
          .gte('created_at', fiveMinAgo)
          .limit(5000),
      ]);
      if (cancelled) return;
      setTodayEvents((todayRes.data as EventRow[]) || []);
      setOnlineSessions(unique((onlineRes.data || []).map((r: any) => r.session_id)).length);
    };
    fetchLive();
    const iv = setInterval(fetchLive, 30000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // ---- Aggregations ----
  const todayVisits = useMemo(
    () => unique(todayEvents.filter(e => e.event_name === 'page_view').map(e => e.session_id)).length,
    [todayEvents]
  );
  const productViewsToday = useMemo(() => todayEvents.filter(e => e.event_name === 'product_view').length, [todayEvents]);
  const addToCartToday = useMemo(() => todayEvents.filter(e => e.event_name === 'add_to_cart').length, [todayEvents]);
  const checkoutToday = useMemo(() => todayEvents.filter(e => e.event_name === 'begin_checkout').length, [todayEvents]);
  const ordersToday = useMemo(() => todayEvents.filter(e => e.event_name === 'order_submit').length, [todayEvents]);

  // Range-based unique sessions and conversion
  const visitSessions = useMemo(
    () => unique(events.filter(e => e.event_name === 'page_view').map(e => e.session_id)),
    [events]
  );
  const orderSessions = useMemo(
    () => unique(events.filter(e => e.event_name === 'order_submit').map(e => e.session_id)),
    [events]
  );
  const conversionRate = visitSessions.length > 0
    ? ((orderSessions.length / visitSessions.length) * 100).toFixed(2)
    : '0.00';

  // Last 7 days line chart
  const last7Days = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const days: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = format(d, 'yyyy-MM-dd');
      days.push({ key, label: format(d, 'MM-dd') });
      map.set(key, new Set());
    }
    events.forEach(e => {
      if (e.event_name !== 'page_view') return;
      const k = e.created_at.slice(0, 10);
      map.get(k)?.add(e.session_id);
    });
    return days.map(d => ({ date: d.label, visits: map.get(d.key)?.size || 0 }));
  }, [events]);

  // Most viewed pages
  const topPages = useMemo(() => {
    const m = new Map<string, { views: number; sessions: Set<string> }>();
    events.filter(e => e.event_name === 'page_view' && e.page_path).forEach(e => {
      const key = e.page_path!;
      if (!m.has(key)) m.set(key, { views: 0, sessions: new Set() });
      const v = m.get(key)!;
      v.views++;
      v.sessions.add(e.session_id);
    });
    return Array.from(m.entries())
      .map(([path, v]) => ({ path, views: v.views, unique: v.sessions.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [events]);

  // Most viewed products
  const topProducts = useMemo(() => {
    const m = new Map<string, { name: string; slug: string; views: number; carts: number; orders: number }>();
    events.filter(e => e.event_name === 'product_view' && e.product_id).forEach(e => {
      const k = e.product_id!;
      if (!m.has(k)) m.set(k, { name: e.product_name || '', slug: e.product_slug || '', views: 0, carts: 0, orders: 0 });
      m.get(k)!.views++;
    });
    events.filter(e => e.event_name === 'add_to_cart' && e.product_id).forEach(e => {
      const k = e.product_id!;
      if (!m.has(k)) m.set(k, { name: e.product_name || '', slug: e.product_slug || '', views: 0, carts: 0, orders: 0 });
      m.get(k)!.carts++;
    });
    return Array.from(m.values()).sort((a, b) => b.views - a.views).slice(0, 10);
  }, [events]);

  // Traffic sources
  const trafficSources = useMemo(() => {
    const m = new Map<string, number>();
    let total = 0;
    events.filter(e => e.event_name === 'page_view').forEach(e => {
      let host = 'Direct';
      if (e.referrer) {
        try { host = new URL(e.referrer).hostname || 'Direct'; } catch { host = 'Direct'; }
      }
      m.set(host, (m.get(host) || 0) + 1);
      total++;
    });
    return Array.from(m.entries())
      .map(([referrer, visits]) => ({ referrer, visits, pct: total ? ((visits / total) * 100).toFixed(1) : '0.0' }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  }, [events]);

  // Funnel
  const funnel = useMemo(() => {
    const visits = visitSessions.length;
    const productViews = unique(events.filter(e => e.event_name === 'product_view').map(e => e.session_id)).length;
    const carts = unique(events.filter(e => e.event_name === 'add_to_cart').map(e => e.session_id)).length;
    const checkouts = unique(events.filter(e => e.event_name === 'begin_checkout').map(e => e.session_id)).length;
    const orders = orderSessions.length;
    const arr = [
      { stage: 'Tashriflar', count: visits },
      { stage: "Mahsulot ko'rishlar", count: productViews },
      { stage: "Savatga qo'shish", count: carts },
      { stage: 'Checkout boshlandi', count: checkouts },
      { stage: 'Buyurtmalar', count: orders },
    ];
    return arr.map((s, i) => ({
      ...s,
      pct: i === 0 ? 100 : visits ? Math.round((s.count / visits) * 100) : 0,
    }));
  }, [events, visitSessions, orderSessions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Sayt tashriflari va konversiya statistikasi</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList>
              <TabsTrigger value="today">Bugun</TabsTrigger>
              <TabsTrigger value="yesterday">Kecha</TabsTrigger>
              <TabsTrigger value="7d">7 kun</TabsTrigger>
              <TabsTrigger value="30d">30 kun</TabsTrigger>
              <TabsTrigger value="custom">Tanlash</TabsTrigger>
            </TabsList>
          </Tabs>
          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {customFrom ? format(customFrom, 'PP') : 'Boshi'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {customTo ? format(customTo, 'PP') : 'Oxiri'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customTo} onSelect={setCustomTo} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bugungi tashriflar" value={todayVisits} icon={Eye} />
        <StatCard title="Hozir onlayn" value={onlineSessions} icon={Activity} hint="Oxirgi 5 daqiqa" />
        <StatCard title="Mahsulot ko'rishlar (bugun)" value={productViewsToday} icon={ShoppingBag} />
        <StatCard title="Savatga qo'shildi (bugun)" value={addToCartToday} icon={ShoppingCart} />
        <StatCard title="Checkout (bugun)" value={checkoutToday} icon={CreditCard} />
        <StatCard title="Buyurtmalar (bugun)" value={ordersToday} icon={CreditCard} />
        <StatCard title="Konversiya darajasi" value={`${conversionRate}%`} icon={TrendingUp} hint="Buyurtma / tashrif (tanlangan davr)" />
        <StatCard title="Unikal tashriflar" value={visitSessions.length} icon={Users} hint="Tanlangan davr" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>So'nggi 7 kun tashriflari</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Konversiya voronkasi</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Eng ko'p ko'rilgan mahsulotlar</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Eng ko'p ko'rilgan sahifalar</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sahifa</TableHead>
                  <TableHead className="text-right">Ko'rishlar</TableHead>
                  <TableHead className="text-right">Unikal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Ma'lumot yo'q</TableCell></TableRow>
                ) : topPages.map(p => (
                  <TableRow key={p.path}>
                    <TableCell className="font-mono text-xs">{p.path}</TableCell>
                    <TableCell className="text-right">{p.views}</TableCell>
                    <TableCell className="text-right">{p.unique}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Trafik manbalari</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manba</TableHead>
                  <TableHead className="text-right">Tashrif</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficSources.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Ma'lumot yo'q</TableCell></TableRow>
                ) : trafficSources.map(s => (
                  <TableRow key={s.referrer}>
                    <TableCell>{s.referrer}</TableCell>
                    <TableCell className="text-right">{s.visits}</TableCell>
                    <TableCell className="text-right">{s.pct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Eng ko'p ko'rilgan mahsulotlar</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Ko'rish</TableHead>
                  <TableHead className="text-right">Savatga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Ma'lumot yo'q</TableCell></TableRow>
                ) : topProducts.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell>{p.name || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{p.slug || '—'}</TableCell>
                    <TableCell className="text-right">{p.views}</TableCell>
                    <TableCell className="text-right">{p.carts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Voronka tafsilotlari</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bosqich</TableHead>
                  <TableHead className="text-right">Soni</TableHead>
                  <TableHead className="text-right">Ulush</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funnel.map(f => (
                  <TableRow key={f.stage}>
                    <TableCell>{f.stage}</TableCell>
                    <TableCell className="text-right">{f.count}</TableCell>
                    <TableCell className="text-right">{f.pct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Yuklanmoqda…</p>}
    </div>
  );
}
