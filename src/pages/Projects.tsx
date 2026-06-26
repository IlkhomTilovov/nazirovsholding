import { useSEO } from '@/hooks/useSEO';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';
import projectGermany from '@/assets/project-germany-textile.jpg';
import projectKazakhstan from '@/assets/project-kazakhstan-agro.jpg';
import projectUae from '@/assets/project-uae-industrial.jpg';

const projects = [
  {
    id: 'germany',
    num: '01',
    country: 'Germaniya',
    industry: 'Toʻqimachilik Eksporti',
    title: 'Germaniya bilan strategik toʻqimachilik hamkorligi',
    objective: 'Yevropa Ittifoqi bozoriga premium toʻqimachilik mahsulotlarini muntazam yetkazib berish.',
    results: ['+€12M yillik aylanma', '4 yirik distribyutor', '120+ konteyner / yil'],
    timeline: '2021 — Hozir',
    image: projectGermany,
  },
  {
    id: 'kazakhstan',
    num: '02',
    country: 'Qozogʻiston',
    industry: 'Agro Savdo Hamkorligi',
    title: 'Qozogʻiston agro-sanoat distribyutsiya tarmogʻi',
    objective: 'MDH mintaqasi boʻylab qishloq xoʻjaligi mahsulotlarini taqsimlash tizimini qurish.',
    results: ['9 mintaqaviy markaz', '+35% yillik oʻsish', '200+ chakana nuqta'],
    timeline: '2020 — Hozir',
    image: projectKazakhstan,
  },
  {
    id: 'uae',
    num: '03',
    country: 'BAA',
    industry: 'Sanoat Yetkazib Berish',
    title: 'BAA sanoat ob’ektlari uchun yetkazib berish loyihasi',
    objective: 'Dubay va Abu-Dabidagi yirik sanoat zonalariga uzluksiz materiallar oqimini taʼminlash.',
    results: ['$8.5M shartnoma', '24/7 logistika', '99.4% oʻz vaqtida yetkazish'],
    timeline: '2022 — Hozir',
    image: projectUae,
  },
];

export default function Projects() {
  useSEO({ title: 'Loyihalar — NazirovSholding' });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Hero */}
      <section className="relative pt-24 pb-20 border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <EditableText
            contentKey="loyihalar.hero.eyebrow"
            fallback="05 — Loyihalar"
            section="loyihalar-hero"
            className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-6 block"
          />
          <EditableText
            as="h1"
            contentKey="loyihalar.hero.title"
            fallback="Natijalar orqali isbotlangan salohiyat"
            section="loyihalar-hero"
            className="text-5xl md:text-7xl font-light tracking-tight max-w-4xl leading-[1.05]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          />
          <EditableText
            as="p"
            multiline
            contentKey="loyihalar.hero.desc"
            fallback="Tanlangan xalqaro keyslar — har biri NazirovSholding’ning ishonchli ijro, strategik rejalashtirish va uzoq muddatli sheriklik qobiliyatini namoyish etadi."
            section="loyihalar-hero"
            className="mt-8 max-w-2xl text-white/60 text-lg leading-relaxed"
          />
        </div>
      </section>

      {/* Cases */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 space-y-28">
          {projects.map((p, i) => (
            <article
              key={p.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
                i % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''
              }`}
            >
              <div className="lg:col-span-7 relative overflow-hidden group">
                <EditableImage
                  contentKey={`loyihalar.case.${p.id}.image`}
                  fallbackSrc={p.image}
                  alt={p.title}
                  className="w-full h-[420px] md:h-[520px] object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1200ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-6 left-6 text-[10px] tracking-[0.4em] uppercase text-white/80 flex items-center gap-2">
                  <EditableText contentKey={`loyihalar.case.${p.id}.country`} fallback={p.country} section="loyihalar-cases" />
                  <span>·</span>
                  <EditableText contentKey={`loyihalar.case.${p.id}.industry.tag`} fallback={p.industry} section="loyihalar-cases" />
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="flex items-center gap-4 mb-6">
                  <EditableText contentKey={`loyihalar.case.${p.id}.num`} fallback={p.num} section="loyihalar-cases" className="text-[10px] tracking-[0.4em] text-[#d4af37]" />
                  <span className="h-px flex-1 bg-white/10" />
                  <EditableText contentKey={`loyihalar.case.${p.id}.timeline`} fallback={p.timeline} section="loyihalar-cases" className="text-[10px] tracking-[0.3em] text-white/40 uppercase" />
                </div>
                <EditableText
                  as="h2"
                  contentKey={`loyihalar.case.${p.id}.title`}
                  fallback={p.title}
                  section="loyihalar-cases"
                  className="text-3xl md:text-4xl font-light leading-tight mb-6"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                />
                <EditableText
                  as="p"
                  multiline
                  contentKey={`loyihalar.case.${p.id}.objective`}
                  fallback={p.objective}
                  section="loyihalar-cases"
                  className="text-white/60 leading-relaxed mb-8"
                />

                <div className="space-y-3 mb-10">
                  {p.results.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-2 border-b border-white/5">
                      <span className="w-1 h-1 rounded-full bg-[#d4af37]" />
                      <EditableText
                        contentKey={`loyihalar.case.${p.id}.result.${idx}`}
                        fallback={r}
                        section="loyihalar-cases"
                        className="text-sm text-white/80"
                      />
                    </div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-[#d4af37] hover:text-white transition-colors"
                >
                  <EditableText contentKey={`loyihalar.case.${p.id}.cta`} fallback="Hamkorlik bo‘yicha so‘rov" section="loyihalar-cases" />
                  <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
