import { useSEO } from '@/hooks/useSEO';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Target, Eye, Gem, Shield, Award, Globe2 } from 'lucide-react';

const stats = [
  { value: '12+', label: 'Yillik tajriba' },
  { value: '25', label: 'Hamkor mamlakat' },
  { value: '500+', label: 'Yetkazib berilgan konteyner' },
  { value: '8', label: 'Strategik yo‘nalish' },
];

const values = [
  {
    icon: Shield,
    title: 'Ishonch',
    desc: 'Har bir bitim shaffof shartnoma, aniq muddat va kafolatlangan sifat asosida tuziladi.',
  },
  {
    icon: Gem,
    title: 'Sifat',
    desc: 'Xalqaro standartlar (ISO, HACCP) va qat’iy ichki nazorat — har bir mahsulot uchun.',
  },
  {
    icon: Globe2,
    title: 'Global qarash',
    desc: 'Yevropa, MDH, Yaqin Sharq va Osiyo bozorlariga moslashgan eksport strategiyasi.',
  },
  {
    icon: Award,
    title: 'Mas’uliyat',
    desc: 'Hamkorlar, xodimlar va mahalliy iqtisodiyot oldidagi uzoq muddatli majburiyatlar.',
  },
];

const timeline = [
  { year: '2013', title: 'Asos solinishi', desc: 'Toshkentda mahalliy savdo kompaniyasi sifatida faoliyat boshlandi.' },
  { year: '2017', title: 'Birinchi eksport', desc: 'Qozog‘iston va Rossiya bozorlariga muntazam yetkazib berishlar yo‘lga qo‘yildi.' },
  { year: '2020', title: 'Holding tuzilmasi', desc: 'Bir necha yo‘nalish bo‘yicha kompaniyalar yagona holding ostida birlashtirildi.' },
  { year: '2023', title: 'Yevropa va BAA', desc: 'Germaniya va Birlashgan Arab Amirliklari bilan strategik shartnomalar imzolandi.' },
  { year: '2026', title: 'Yangi bosqich', desc: 'Ishlab chiqarish va logistika quvvatlari kengaytirilib, 8 sohaga diversifikatsiya.' },
];

export default function About() {
  useSEO({
    title: 'Haqimizda — NazirovSholding International Holding Group',
    description:
      'NazirovSholding — eksport, logistika, ishlab chiqarish, investitsiya va agrosanoat yo‘nalishlarida faoliyat yurituvchi xalqaro holding. Bizning tarix, missiya va qadriyatlarimiz.',
  });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Hero */}
      <section className="relative pt-28 pb-24 border-b border-white/5 overflow-hidden">
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.14), transparent 60%)' }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
          <p className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-6">01 — Kompaniya</p>
          <h1
            className="text-5xl md:text-7xl font-light tracking-tight max-w-5xl leading-[1.02]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            O‘n yildan ortiq <span className="italic text-[#d4af37]">global savdo</span> va sanoat tajribasi
          </h1>
          <p className="mt-10 max-w-2xl text-white/60 text-lg leading-relaxed">
            NazirovSholding International Holding Group — O‘zbekistondan boshlanib, bugun Yevropa,
            MDH, Yaqin Sharq va Osiyoda faoliyat yurituvchi diversifikatsiyalashgan holding.
            Eksport, ishlab chiqarish, logistika va strategik investitsiyalarni yagona qiymat zanjirida birlashtiramiz.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#0d0d0d] p-10">
              <div
                className="text-5xl md:text-6xl font-light text-[#d4af37] mb-3"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {s.value}
              </div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-28 border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <p className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-12">— 02 Yo‘nalish</p>
          <div className="grid md:grid-cols-2 gap-px bg-white/5">
            <div className="bg-[#0d0d0d] p-10 md:p-14">
              <Target className="w-7 h-7 text-[#d4af37] mb-8" strokeWidth={1.2} />
              <h2
                className="text-3xl md:text-4xl font-light mb-6"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Missiya
              </h2>
              <p className="text-white/60 leading-relaxed">
                O‘zbekiston ishlab chiqaruvchilarini xalqaro bozorlarga professional, ishonchli
                va uzoq muddatli sherik sifatida olib chiqish. Har bir yo‘nalishda — eksportdan
                sanoatgacha — global standartlarda qiymat yaratish.
              </p>
            </div>
            <div className="bg-[#0d0d0d] p-10 md:p-14">
              <Eye className="w-7 h-7 text-[#d4af37] mb-8" strokeWidth={1.2} />
              <h2
                className="text-3xl md:text-4xl font-light mb-6"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Vizyon
              </h2>
              <p className="text-white/60 leading-relaxed">
                2030 yilga qadar Markaziy Osiyoning yetakchi xalqaro savdo va sanoat holdinglaridan
                biriga aylanish. Eksport, ishlab chiqarish va investitsiyalarning yagona, raqamlashtirilgan
                ekotizimini qurish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-28 border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-4">— 03 Qadriyatlar</p>
              <h2
                className="text-4xl md:text-5xl font-light max-w-2xl leading-[1.1]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Holdingni <span className="italic text-[#d4af37]">harakatga keltiruvchi</span> tamoyillar
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="group bg-[#0d0d0d] p-10 hover:bg-[#141414] transition-colors duration-500">
                  <Icon className="w-7 h-7 text-[#d4af37] mb-10" strokeWidth={1.2} />
                  <h3
                    className="text-2xl font-light mb-3 group-hover:text-[#d4af37] transition-colors"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-28 border-b border-white/5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 40%, rgba(212,175,55,0.10), transparent 60%)' }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
          <p className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-4">— 04 Tarix</p>
          <h2
            className="text-4xl md:text-5xl font-light max-w-2xl leading-[1.1] mb-16"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            O‘sish <span className="italic text-[#d4af37]">bosqichlari</span>
          </h2>

          <div className="relative">
            <div className="absolute left-[88px] md:left-[120px] top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-12">
              {timeline.map((t) => (
                <div key={t.year} className="grid grid-cols-[88px_1fr] md:grid-cols-[120px_1fr] gap-8 items-start">
                  <div
                    className="text-2xl md:text-3xl text-[#d4af37] font-light"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {t.year}
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-3 w-2 h-2 rounded-full bg-[#d4af37] -translate-x-1/2" />
                    <h3
                      className="text-xl md:text-2xl font-light mb-2"
                      style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                      {t.title}
                    </h3>
                    <p className="text-sm text-white/55 leading-relaxed max-w-xl">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-4">Hamkorlik</p>
            <h2
              className="text-4xl md:text-5xl font-light max-w-2xl leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Birgalikda yangi bozorlarni o‘zlashtiramiz.
            </h2>
          </div>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 bg-[#d4af37] hover:bg-[#c9a230] text-black px-8 py-4 text-xs font-semibold tracking-[0.3em] uppercase transition-colors"
          >
            Aloqaga chiqish <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
