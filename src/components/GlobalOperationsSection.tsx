import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';
import cinematicPort from '@/assets/global-cinematic-port.jpg';
import projectGermany from '@/assets/project-germany-textile.jpg';
import projectKazakhstan from '@/assets/project-kazakhstan-agro.jpg';
import projectUae from '@/assets/project-uae-industrial.jpg';

// ─────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '+', duration = 1.8, start }: { to: number; suffix?: string; duration?: number; start: boolean; }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0; let t0: number | null = null;
    const tick = (t: number) => {
      if (t0 === null) t0 = t;
      const p = Math.min((t - t0) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick); else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to, duration]);
  return <span className="tabular-nums">{val}<span className="text-primary/70">{suffix}</span></span>;
}


// ─────────────────────────────────────────────────────────
// Main section
// ─────────────────────────────────────────────────────────
export function GlobalOperationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const portY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const portScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });

  const mapRef = useRef<HTMLDivElement>(null);
  void mapRef;

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const } }),
  };

  return (
    <section ref={sectionRef} className="relative bg-[#0d0d0d] text-foreground overflow-hidden">
      {/* ───────── BLOCK 1 — CINEMATIC SHOWCASE ───────── */}
      <div className="relative h-[80vh] min-h-[560px] w-full overflow-hidden">
        <motion.div style={{ y: portY, scale: portScale }} className="absolute inset-0">
          <EditableImage
            contentKey="bozorlar.hero.image"
            fallbackSrc={cinematicPort}
            alt="NazirovSholding global port operations"
            section="bozorlar-hero"
            wrapperClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/90 via-[#0d0d0d]/40 to-[#0d0d0d]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(13,13,13,0.7)_100%)]" />

        <div className="relative h-full max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col justify-end pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-[#c9a84c]" />
              <EditableText contentKey="bozorlar.hero.eyebrow" fallback="Global Operations" section="bozorlar-hero" className="text-[#c9a84c] text-[11px] tracking-[0.45em] uppercase font-medium" />
            </div>
            <EditableText as="h2" contentKey="bozorlar.hero.title" fallback="Biz natijalar orqali gapiramiz" section="bozorlar-hero" className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-white" />
            <EditableText as="p" multiline contentKey="bozorlar.hero.desc" fallback="NazirovSholding xalqaro savdo, eksport, logistika va strategik hamkorliklar orqali global bozorlarda faoliyat yuritadi. Bizning yondashuvimiz ishonch, natija va uzoq muddatli hamkorlikka asoslangan." section="bozorlar-hero" className="mt-7 text-base md:text-lg text-white/70 max-w-2xl leading-relaxed" />
          </motion.div>
        </div>
      </div>

      {/* ───────── BLOCK 2 — CORPORATE MESSAGE ───────── */}
      <div className="relative py-28 md:py-40 border-y border-[#c9a84c]/15 bg-[#0d0d0d]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-end">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[#c9a84c] font-serif italic text-lg">—  01</span>
              <EditableText contentKey="bozorlar.msg.eyebrow" fallback="Corporate Message" section="bozorlar-msg" className="text-white/40 text-[11px] tracking-[0.4em] uppercase" />
            </div>
            <EditableText as="h3" multiline contentKey="bozorlar.msg.title" fallback="Connecting Uzbekistan To Global Markets" section="bozorlar-msg" className="font-serif text-4xl md:text-6xl lg:text-[5.5rem] leading-[1.02] text-white" />
          </motion.div>
          <motion.div
            variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            className="lg:col-span-5 lg:pb-6"
          >
            <EditableText as="p" multiline contentKey="bozorlar.msg.desc" fallback="NazirovSholding creates strategic connections between manufacturers, suppliers, international buyers and emerging markets through export, logistics and investment partnerships." section="bozorlar-msg" className="text-white/70 text-lg leading-[1.8]" />
            <div className="mt-10 h-px w-24 bg-[#c9a84c]/60" />
          </motion.div>
        </div>
      </div>

      {/* ───────── BLOCK 3 — BUSINESS STATISTICS ───────── */}
      <div ref={statsRef} className="relative py-28 md:py-36 bg-[#0d0d0d]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
            className="flex items-center gap-3 mb-16"
          >
            <span className="text-[#c9a84c] font-serif italic text-lg">—  02</span>
            <EditableText contentKey="bozorlar.stats.eyebrow" fallback="Performance Indicators" section="bozorlar-stats" className="text-white/40 text-[11px] tracking-[0.4em] uppercase" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#c9a84c]/10 border border-[#c9a84c]/10">
            {[
              { valueKey: 'bozorlar.stat.markets.value',   valueFallback: '25+',  labelKey: 'bozorlar.stat.markets',   fallback: 'International Markets', k: '01' },
              { valueKey: 'bozorlar.stat.shipments.value', valueFallback: '500+', labelKey: 'bozorlar.stat.shipments', fallback: 'Successful Shipments',  k: '02' },
              { valueKey: 'bozorlar.stat.partners.value',  valueFallback: '100+', labelKey: 'bozorlar.stat.partners',  fallback: 'Strategic Partners',    k: '03' },
              { valueKey: 'bozorlar.stat.years.value',     valueFallback: '15+',  labelKey: 'bozorlar.stat.years',     fallback: 'Years Of Experience',   k: '04' },
            ].map((s, i) => (
              <motion.div
                key={s.k}
                variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
                className="group relative bg-[#0d0d0d] p-10 md:p-12 transition-all duration-500 hover:bg-[#1a1a1a]"
              >
                <div className="absolute top-6 right-6 text-[#c9a84c]/30 text-xs tracking-[0.3em] font-mono">{s.k}</div>
                <div className="absolute left-0 top-0 h-full w-px bg-[#c9a84c] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-700" />
                <EditableText
                  as="div"
                  contentKey={s.valueKey}
                  fallback={s.valueFallback}
                  section="bozorlar-stats"
                  className="font-serif text-6xl md:text-7xl text-[#c9a84c] leading-none mb-6 group-hover:[text-shadow:0_0_30px_rgba(201,168,76,0.4)] transition-all duration-500"
                />
                <div className="h-px w-10 bg-[#c9a84c]/40 mb-4 group-hover:w-16 transition-all duration-500" />
                <EditableText contentKey={s.labelKey} fallback={s.fallback} section="bozorlar-stats" className="text-[11px] tracking-[0.3em] uppercase text-white/60 font-medium" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      {/* ───────── FEATURED GLOBAL PROJECTS ───────── */}
      <div className="relative py-28 md:py-36 bg-[#0d0d0d]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
            className="mb-16 max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#c9a84c] font-serif italic text-lg">—  04</span>
              <EditableText contentKey="bozorlar.cases.eyebrow" fallback="Case Studies" section="bozorlar-cases" className="text-white/40 text-[11px] tracking-[0.4em] uppercase" />
            </div>
            <EditableText as="h3" contentKey="bozorlar.cases.title" fallback="Featured Global Projects" section="bozorlar-cases" className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05]" />
          </motion.div>

          <div className="space-y-6">
            {[
              { id: 'de', img: projectGermany,    flag: '🇩🇪', country: 'Germany',    title: 'Germany Textile Export',       industry: 'Textile Manufacturing',  result: '120 Containers Delivered',     year: '2024' },
              { id: 'kz', img: projectKazakhstan, flag: '🇰🇿', country: 'Kazakhstan', title: 'Kazakhstan Trade Partnership', industry: 'Agricultural Products',  result: 'Strategic Distribution Network',year: '2024' },
              { id: 'ae', img: projectUae,        flag: '🇦🇪', country: 'UAE',        title: 'UAE Supply Project',           industry: 'Industrial Products',    result: 'Long-Term Supply Agreement',   year: '2025' },
            ].map((p, i) => (
              <motion.article
                key={p.id}
                variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
                className="group relative grid grid-cols-1 md:grid-cols-12 gap-0 border border-[#c9a84c]/15 bg-[#0f0f0f] overflow-hidden hover:border-[#c9a84c]/50 transition-all duration-700 hover:shadow-[0_0_60px_-20px_rgba(201,168,76,0.35)]"
              >
                <div className="md:col-span-5 relative aspect-[16/10] md:aspect-auto overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0f0f0f]" />
                  <div className="absolute top-5 left-5 bg-[#0d0d0d]/80 backdrop-blur-sm px-3 py-1.5 text-xs tracking-[0.3em] uppercase text-white/90 border border-[#c9a84c]/30 flex items-center gap-2">
                    <span className="text-base leading-none">{p.flag}</span>
                    <EditableText contentKey={`bozorlar.case.${p.id}.country`} fallback={p.country} section="bozorlar-cases" />
                  </div>
                </div>

                <div className="md:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-between gap-8">
                  <div>
                    <EditableText contentKey={`bozorlar.case.${p.id}.industry`} fallback={p.industry} section="bozorlar-cases" className="block text-[#c9a84c] text-[11px] tracking-[0.35em] uppercase mb-4" />
                    <EditableText as="h4" contentKey={`bozorlar.case.${p.id}.title`} fallback={p.title} section="bozorlar-cases" className="font-serif text-3xl md:text-4xl text-white leading-tight mb-6 group-hover:text-[#c9a84c] transition-colors duration-500" />
                    <div className="h-px w-16 bg-[#c9a84c]/40 group-hover:w-28 transition-all duration-700" />
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div>
                      <EditableText contentKey="bozorlar.case.label.result" fallback="Result" section="bozorlar-cases" className="block text-[10px] tracking-[0.4em] uppercase text-white/40 mb-2" />
                      <EditableText contentKey={`bozorlar.case.${p.id}.result`} fallback={p.result} section="bozorlar-cases" className="block font-serif text-xl text-white" />
                    </div>
                    <div>
                      <EditableText contentKey="bozorlar.case.label.year" fallback="Year" section="bozorlar-cases" className="block text-[10px] tracking-[0.4em] uppercase text-white/40 mb-2" />
                      <EditableText contentKey={`bozorlar.case.${p.id}.year`} fallback={p.year} section="bozorlar-cases" className="block font-serif text-xl text-[#c9a84c]" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 h-px bg-[#c9a84c] w-0 group-hover:w-full transition-all duration-1000 ease-out" />
              </motion.article>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

export default GlobalOperationsSection;
