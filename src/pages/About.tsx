import { useSEO } from '@/hooks/useSEO';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Target, Eye, Gem, Shield, Award, Globe2 } from 'lucide-react';
import { EditableText } from '@/components/EditableText';

const stats = [
  { key: 'value', fallbackValue: '12+', fallbackLabel: 'Yillik tajriba' },
  { key: 'partners', fallbackValue: '25', fallbackLabel: 'Hamkor mamlakat' },
  { key: 'containers', fallbackValue: '500+', fallbackLabel: 'Yetkazib berilgan konteyner' },
  { key: 'sectors', fallbackValue: '8', fallbackLabel: 'Strategik yo‘nalish' },
];

const values = [
  {
    id: 'trust',
    icon: Shield,
    fallbackTitle: 'Ishonch',
    fallbackDesc: 'Har bir bitim shaffof shartnoma, aniq muddat va kafolatlangan sifat asosida tuziladi.',
  },
  {
    id: 'quality',
    icon: Gem,
    fallbackTitle: 'Sifat',
    fallbackDesc: 'Xalqaro standartlar (ISO, HACCP) va qat’iy ichki nazorat — har bir mahsulot uchun.',
  },
  {
    id: 'global',
    icon: Globe2,
    fallbackTitle: 'Global qarash',
    fallbackDesc: 'Yevropa, MDH, Yaqin Sharq va Osiyo bozorlariga moslashgan eksport strategiyasi.',
  },
  {
    id: 'responsibility',
    icon: Award,
    fallbackTitle: 'Mas’uliyat',
    fallbackDesc: 'Hamkorlar, xodimlar va mahalliy iqtisodiyot oldidagi uzoq muddatli majburiyatlar.',
  },
];

const timeline = [
  { id: '1', fallbackYear: '2013', fallbackTitle: 'Asos solinishi', fallbackDesc: 'Toshkentda mahalliy savdo kompaniyasi sifatida faoliyat boshlandi.' },
  { id: '2', fallbackYear: '2017', fallbackTitle: 'Birinchi eksport', fallbackDesc: 'Qozog‘iston va Rossiya bozorlariga muntazam yetkazib berishlar yo‘lga qo‘yildi.' },
  { id: '3', fallbackYear: '2020', fallbackTitle: 'Holding tuzilmasi', fallbackDesc: 'Bir necha yo‘nalish bo‘yicha kompaniyalar yagona holding ostida birlashtirildi.' },
  { id: '4', fallbackYear: '2023', fallbackTitle: 'Yevropa va BAA', fallbackDesc: 'Germaniya va Birlashgan Arab Amirliklari bilan strategik shartnomalar imzolandi.' },
  { id: '5', fallbackYear: '2026', fallbackTitle: 'Yangi bosqich', fallbackDesc: 'Ishlab chiqarish va logistika quvvatlari kengaytirilib, 8 sohaga diversifikatsiya.' },
];

export default function About() {
  useSEO({
    title: 'Haqimizda — NazirovSholding International Holding Group',
    description:
      'NazirovSholding — eksport, logistika, ishlab chiqarish, investitsiya va agrosanoat yo‘nalishlarida faoliyat yurituvchi xalqaro holding.',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative pt-28 pb-24 border-b border-foreground/5 overflow-hidden">
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.14), transparent 60%)' }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
          <EditableText
            contentKey="about.hero.eyebrow"
            fallback="01 — Kompaniya"
            as="p"
            className="text-[10px] tracking-[0.5em] uppercase text-primary mb-6"
            section="about-hero"
          />
          <h1
            className="text-5xl md:text-7xl font-light tracking-tight max-w-5xl leading-[1.02]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            <EditableText
              contentKey="about.hero.title"
              fallback="O‘n yildan ortiq global savdo va sanoat tajribasi"
              multiline
              section="about-hero"
            />
          </h1>
          <EditableText
            contentKey="about.hero.subtitle"
            fallback="NazirovSholding International Holding Group — O‘zbekistondan boshlanib, bugun Yevropa, MDH, Yaqin Sharq va Osiyoda faoliyat yurituvchi diversifikatsiyalashgan holding. Eksport, ishlab chiqarish, logistika va strategik investitsiyalarni yagona qiymat zanjirida birlashtiramiz."
            as="p"
            multiline
            className="mt-10 max-w-2xl text-foreground/60 text-lg leading-relaxed block"
            section="about-hero"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-foreground/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/5">
          {stats.map((s) => (
            <div key={s.key} className="bg-background p-10">
              <EditableText
                contentKey={`about.stats.${s.key}.value`}
                fallback={s.fallbackValue}
                as="div"
                className="text-5xl md:text-6xl font-light text-primary mb-3 block"
                section="about-stats"
              />
              <EditableText
                contentKey={`about.stats.${s.key}.label`}
                fallback={s.fallbackLabel}
                as="p"
                className="text-[11px] tracking-[0.3em] uppercase text-foreground/50"
                section="about-stats"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-28 border-b border-foreground/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <EditableText
            contentKey="about.mv.eyebrow"
            fallback="— 02 Yo‘nalish"
            as="p"
            className="text-[10px] tracking-[0.5em] uppercase text-primary mb-12"
            section="about-mv"
          />
          <div className="grid md:grid-cols-2 gap-px bg-foreground/5">
            <div className="bg-background p-10 md:p-14">
              <Target className="w-7 h-7 text-primary mb-8" strokeWidth={1.2} />
              <h2 className="text-3xl md:text-4xl font-light mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
                <EditableText contentKey="about.mission.title" fallback="Missiya" section="about-mv" />
              </h2>
              <EditableText
                contentKey="about.mission.desc"
                fallback="O‘zbekiston ishlab chiqaruvchilarini xalqaro bozorlarga professional, ishonchli va uzoq muddatli sherik sifatida olib chiqish. Har bir yo‘nalishda — eksportdan sanoatgacha — global standartlarda qiymat yaratish."
                as="p"
                multiline
                className="text-foreground/60 leading-relaxed block"
                section="about-mv"
              />
            </div>
            <div className="bg-background p-10 md:p-14">
              <Eye className="w-7 h-7 text-primary mb-8" strokeWidth={1.2} />
              <h2 className="text-3xl md:text-4xl font-light mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
                <EditableText contentKey="about.vision.title" fallback="Vizyon" section="about-mv" />
              </h2>
              <EditableText
                contentKey="about.vision.desc"
                fallback="2030 yilga qadar Markaziy Osiyoning yetakchi xalqaro savdo va sanoat holdinglaridan biriga aylanish. Eksport, ishlab chiqarish va investitsiyalarning yagona, raqamlashtirilgan ekotizimini qurish."
                as="p"
                multiline
                className="text-foreground/60 leading-relaxed block"
                section="about-mv"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-28 border-b border-foreground/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <EditableText
                contentKey="about.values.eyebrow"
                fallback="— 03 Qadriyatlar"
                as="p"
                className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4"
                section="about-values"
              />
              <h2
                className="text-4xl md:text-5xl font-light max-w-2xl leading-[1.1]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                <EditableText
                  contentKey="about.values.title"
                  fallback="Holdingni harakatga keltiruvchi tamoyillar"
                  multiline
                  section="about-values"
                />
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/5">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.id} className="group bg-background p-10 hover:bg-muted transition-colors duration-500">
                  <Icon className="w-7 h-7 text-primary mb-10" strokeWidth={1.2} />
                  <h3
                    className="text-2xl font-light mb-3 group-hover:text-primary transition-colors"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    <EditableText
                      contentKey={`about.values.${v.id}.title`}
                      fallback={v.fallbackTitle}
                      section="about-values"
                    />
                  </h3>
                  <EditableText
                    contentKey={`about.values.${v.id}.desc`}
                    fallback={v.fallbackDesc}
                    as="p"
                    multiline
                    className="text-sm text-foreground/50 leading-relaxed block"
                    section="about-values"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-28 border-b border-foreground/5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 40%, rgba(212,175,55,0.10), transparent 60%)' }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
          <EditableText
            contentKey="about.timeline.eyebrow"
            fallback="— 04 Tarix"
            as="p"
            className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4"
            section="about-timeline"
          />
          <h2
            className="text-4xl md:text-5xl font-light max-w-2xl leading-[1.1] mb-16"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            <EditableText
              contentKey="about.timeline.title"
              fallback="O‘sish bosqichlari"
              multiline
              section="about-timeline"
            />
          </h2>

          <div className="relative">
            <div className="absolute left-[88px] md:left-[120px] top-0 bottom-0 w-px bg-foreground/10" />
            <div className="space-y-12">
              {timeline.map((t) => (
                <div key={t.id} className="grid grid-cols-[88px_1fr] md:grid-cols-[120px_1fr] gap-8 items-start">
                  <div
                    className="text-2xl md:text-3xl text-primary font-light"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    <EditableText
                      contentKey={`about.timeline.${t.id}.year`}
                      fallback={t.fallbackYear}
                      section="about-timeline"
                    />
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-3 w-2 h-2 rounded-full bg-primary -translate-x-1/2" />
                    <h3
                      className="text-xl md:text-2xl font-light mb-2"
                      style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                      <EditableText
                        contentKey={`about.timeline.${t.id}.title`}
                        fallback={t.fallbackTitle}
                        section="about-timeline"
                      />
                    </h3>
                    <EditableText
                      contentKey={`about.timeline.${t.id}.desc`}
                      fallback={t.fallbackDesc}
                      as="p"
                      multiline
                      className="text-sm text-foreground/55 leading-relaxed max-w-xl block"
                      section="about-timeline"
                    />
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
            <EditableText
              contentKey="about.cta.eyebrow"
              fallback="Hamkorlik"
              as="p"
              className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4"
              section="about-cta"
            />
            <h2
              className="text-4xl md:text-5xl font-light max-w-2xl leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              <EditableText
                contentKey="about.cta.title"
                fallback="Birgalikda yangi bozorlarni o‘zlashtiramiz."
                multiline
                section="about-cta"
              />
            </h2>
          </div>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 bg-primary hover:bg-[hsl(var(--primary)/0.85)] text-primary-foreground px-8 py-4 text-xs font-semibold tracking-[0.3em] uppercase transition-colors"
          >
            <EditableText
              contentKey="about.cta.button"
              fallback="Aloqaga chiqish"
              section="about-cta"
            />
            <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
