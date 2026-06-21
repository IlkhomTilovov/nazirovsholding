import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Activity, ShoppingBag, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useSEO } from '@/hooks/useSEO';

interface Stats {
  total_visits: number;
  today_visits: number;
  online_now: number;
  total_product_views: number;
  total_orders: number;
  last_7_days: { date: string; visits: number }[];
  top_pages: { path: string; views: number }[];
}

function StatCard({ title, value, icon: Icon, hint }: { title: string; value: string | number; icon: any; hint?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Sayt statistikasi | TILLA KAMILOV',
    description: 'TILLA KAMILOV saytining ochiq statistikasi: tashriflar, onlayn foydalanuvchilar va eng mashhur sahifalar.',
  });

  const load = async () => {
    const { data, error } = await supabase.rpc('get_public_analytics_stats');
    if (!error && data) setStats(data as unknown as Stats);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-wide">
            Sayt statistikasi
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            TILLA KAMILOV saytidagi tashriflar va faollik haqida ochiq ma'lumotlar.
            Hech qanday shaxsiy ma'lumot saqlanmaydi.
          </p>
        </div>

        {loading || !stats ? (
          <div className="text-center text-muted-foreground py-20">Yuklanmoqda...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard title="Hozir onlayn" value={stats.online_now} icon={Activity} hint="Oxirgi 5 daqiqa" />
              <StatCard title="Bugungi tashriflar" value={stats.today_visits} icon={Eye} />
              <StatCard title="Jami tashriflar" value={stats.total_visits} icon={Users} />
              <StatCard title="Mahsulot ko'rishlar" value={stats.total_product_views} icon={ShoppingBag} />
              <StatCard title="Buyurtmalar" value={stats.total_orders} icon={ShoppingCart} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>So'nggi 7 kun tashriflari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.last_7_days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [value, 'Tashriflar']} labelFormatter={(label) => `Sana: ${label}`} />
                      <Line type="monotone" dataKey="visits" name="Tashriflar" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eng mashhur sahifalar (30 kun)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {stats.top_pages.length === 0 ? (
                    <li className="text-muted-foreground text-sm">Ma'lumot yo'q</li>
                  ) : (
                    stats.top_pages.map((p) => {
                      const labelMap: Record<string, string> = {
                        '/': 'Bosh sahifa',
                        '/catalog': 'Katalog',
                        '/about': 'Portfolio',
                        '/contact': 'Aloqa',
                        '/faq': 'Savol-javoblar',
                        '/cart': 'Savatcha',
                        '/checkout': 'Buyurtma berish',
                        '/thank-you': 'Rahmat sahifasi',
                        '/stats': 'Sayt statistikasi',
                      };
                      let label = labelMap[p.path];
                      if (!label) {
                        if (p.path.startsWith('/product/')) label = 'Mahsulot: ' + p.path.replace('/product/', '');
                        else if (p.path.startsWith('/brand/')) label = 'Brend: ' + p.path.replace('/brand/', '');
                        else if (p.path.startsWith('/catalog')) label = 'Katalog';
                        else label = p.path;
                      }
                      return (
                        <li
                          key={p.path}
                          className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                        >
                          <span className="text-sm truncate">{label}</span>
                          <span className="text-sm text-muted-foreground whitespace-nowrap ml-3">{p.views} ko'rish</span>
                        </li>
                      );
                    })
                  )}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
