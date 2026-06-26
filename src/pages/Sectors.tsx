import { useSEO } from '@/hooks/useSEO';
import { ArrowUpRight, Ship, Factory, Wheat, TrendingUp, Hammer, Globe2, Truck, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBrands } from '@/hooks/useBrands';

const sectors = [
  { icon: Ship, num: '01', title: 'Eksport', desc: 'Xalqaro bozorlarga sifatli mahsulot yetkazib berish va savdo aloqalarini rivojlantirish.' },
  { icon: Globe2, num: '02', title: 'Xalqaro Savdo', desc: 'Yevropa, MDH va Yaqin Sharq mintaqalarida B2B savdo va distribyutsiya.' },
  { icon: Truck, num: '03', title: 'Logistika', desc: 'DAP, FCA va CIF shartlari asosida xalqaro yuk tashish va omborxona xizmatlari.' },
  { icon: Factory, num: '04', title: 'Ishlab Chiqarish', desc: 'Mahalliy va xalqaro brendlar uchun yuqori sifatli sanoat ishlab chiqarish.' },
  { icon: Hammer, num: '05', title: "Qurilish", desc: 'Yirik infratuzilma loyihalari va sanoat ob’ektlarini bunyod etish.' },
  { icon: Wheat, num: '06', title: 'Agrosanoat', desc: 'Qishloq xo‘jaligi mahsulotlarini yetishtirish, qayta ishlash va eksport qilish.' },
  { icon: TrendingUp, num: '07', title: 'Investitsiya', desc: 'Strategik sektorlarga uzoq muddatli kapital qo‘yish va sheriklik dasturlari.' },
  { icon: Briefcase, num: '08', title: 'Biznes Rivojlantirish', desc: 'Yangi bozorlarni o‘zlashtirish, strategik konsalting va korporativ rivojlanish.' },
];

export default function Sectors() {
  useSEO({ title: "Faoliyat yo'nalishlari — NazirovSholding" });
  const { brands, loading: brandsLoading } = useBrands(true);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Hero */}
      <section className="relative pt-24 pb-20 border-b border-white/5">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,0.12), transparent 60%)' }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
          <p className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-6">03 — Faoliyat</p>
          <h1
            className="text-5xl md:text-7xl font-light tracking-tight max-w-4xl leading-[1.05]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Diversifikatsiyalashgan <span className="italic text-[#d4af37]">biznes ekotizimi</span>
          </h1>
          <p className="mt-8 max-w-2xl text-white/60 text-lg leading-relaxed">
            NazirovSholding — bir nechta strategik sohalarda faoliyat yurituvchi xalqaro holding.
            Har bir yo‘nalish kompaniyaning yagona qiymat zanjiri va global qamroviga integratsiyalashgan.
          </p>
        </div>
      </section>

      {/* Sectors grid */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {sectors.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className="group relative bg-[#0d0d0d] p-8 hover:bg-[#141414] transition-colors duration-500"
                >
                  <div className="flex items-start justify-between mb-10">
                    <Icon className="w-7 h-7 text-[#d4af37]" strokeWidth={1.2} />
                    <span className="text-[10px] tracking-[0.3em] text-white/30">{s.num}</span>
                  </div>
                  <h3
                    className="text-2xl font-light mb-3 group-hover:text-[#d4af37] transition-colors"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
                  <div className="mt-8 h-px bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/40 to-[#d4af37]/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-4">Strategik Hamkorlik</p>
            <h2 className="text-4xl md:text-5xl font-light max-w-2xl leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Bizning sohalardan birida hamkorlikni o‘rganamizmi?
            </h2>
          </div>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 bg-[#d4af37] hover:bg-[#c9a230] text-black px-8 py-4 text-xs font-semibold tracking-[0.3em] uppercase transition-colors"
          >
            So'rov Yuborish <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
