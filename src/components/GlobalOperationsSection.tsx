import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, FileDown, Handshake, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          <img src={cinematicPort} alt="NazirovSholding global port operations" className="w-full h-full object-cover" loading="lazy" />
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
              <span className="text-[#c9a84c] text-[11px] tracking-[0.45em] uppercase font-medium">Global Operations</span>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-white">
              Biz natijalar orqali <span className="italic text-[#c9a84c]">gapiramiz</span>
            </h2>
            <p className="mt-7 text-base md:text-lg text-white/70 max-w-2xl leading-relaxed">
              NazirovSholding xalqaro savdo, eksport, logistika va strategik hamkorliklar orqali global bozorlarda
              faoliyat yuritadi. Bizning yondashuvimiz ishonch, natija va uzoq muddatli hamkorlikka asoslangan.
            </p>
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
              <span className="text-white/40 text-[11px] tracking-[0.4em] uppercase">Corporate Message</span>
            </div>
            <h3 className="font-serif text-4xl md:text-6xl lg:text-[5.5rem] leading-[1.02] text-white">
              Connecting Uzbekistan <br />
              <span className="italic text-[#c9a84c]">To Global Markets</span>
            </h3>
          </motion.div>
          <motion.div
            variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            className="lg:col-span-5 lg:pb-6"
          >
            <p className="text-white/70 text-lg leading-[1.8]">
              NazirovSholding creates strategic connections between manufacturers, suppliers, international buyers
              and emerging markets through export, logistics and investment partnerships.
            </p>
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
            <span className="text-white/40 text-[11px] tracking-[0.4em] uppercase">Performance Indicators</span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#c9a84c]/10 border border-[#c9a84c]/10">
            {[
              { n: 25,  s: '+', label: 'International Markets',  k: '01' },
              { n: 500, s: '+', label: 'Successful Shipments',   k: '02' },
              { n: 100, s: '+', label: 'Strategic Partners',     k: '03' },
              { n: 15,  s: '+', label: 'Years Of Experience',    k: '04' },
            ].map((s, i) => (
              <motion.div
                key={s.k}
                variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
                className="group relative bg-[#0d0d0d] p-10 md:p-12 transition-all duration-500 hover:bg-[#1a1a1a]"
              >
                <div className="absolute top-6 right-6 text-[#c9a84c]/30 text-xs tracking-[0.3em] font-mono">{s.k}</div>
                <div className="absolute left-0 top-0 h-full w-px bg-[#c9a84c] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-700" />
                <div className="font-serif text-6xl md:text-7xl text-[#c9a84c] leading-none mb-6 group-hover:[text-shadow:0_0_30px_rgba(201,168,76,0.4)] transition-all duration-500">
                  <Counter to={s.n} suffix={s.s} start={statsInView} />
                </div>
                <div className="h-px w-10 bg-[#c9a84c]/40 mb-4 group-hover:w-16 transition-all duration-500" />
                <div className="text-[11px] tracking-[0.3em] uppercase text-white/60 font-medium">{s.label}</div>
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
              <span className="text-white/40 text-[11px] tracking-[0.4em] uppercase">Case Studies</span>
            </div>
            <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05]">
              Featured <span className="italic text-[#c9a84c]">Global Projects</span>
            </h3>
          </motion.div>

          <div className="space-y-6">
            {[
              { img: projectGermany,    flag: '🇩🇪', country: 'Germany',    title: 'Germany Textile Export',       industry: 'Textile Manufacturing',  result: '120 Containers Delivered',     year: '2024' },
              { img: projectKazakhstan, flag: '🇰🇿', country: 'Kazakhstan', title: 'Kazakhstan Trade Partnership', industry: 'Agricultural Products',  result: 'Strategic Distribution Network',year: '2024' },
              { img: projectUae,        flag: '🇦🇪', country: 'UAE',        title: 'UAE Supply Project',           industry: 'Industrial Products',    result: 'Long-Term Supply Agreement',   year: '2025' },
            ].map((p, i) => (
              <motion.article
                key={p.title}
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
                    <span>{p.country}</span>
                  </div>
                </div>

                <div className="md:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-between gap-8">
                  <div>
                    <div className="text-[#c9a84c] text-[11px] tracking-[0.35em] uppercase mb-4">{p.industry}</div>
                    <h4 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-6 group-hover:text-[#c9a84c] transition-colors duration-500">
                      {p.title}
                    </h4>
                    <div className="h-px w-16 bg-[#c9a84c]/40 group-hover:w-28 transition-all duration-700" />
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div>
                      <div className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-2">Result</div>
                      <div className="font-serif text-xl text-white">{p.result}</div>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-2">Year</div>
                      <div className="font-serif text-xl text-[#c9a84c]">{p.year}</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 h-px bg-[#c9a84c] w-0 group-hover:w-full transition-all duration-1000 ease-out" />
              </motion.article>
            ))}
          </div>
        </div>
      </div>

      {/* ───────── FINAL CTA ───────── */}
      <div className="relative py-28 md:py-40 bg-[#1a1a1a] border-t border-[#c9a84c]/15 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.1),transparent_60%)]" />
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#c9a84c]/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="h-px w-12 bg-[#c9a84c]" />
              <span className="text-[#c9a84c] text-[11px] tracking-[0.45em] uppercase">Partnership</span>
              <span className="h-px w-12 bg-[#c9a84c]" />
            </div>
            <h3 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-8">
              Let's Build <span className="italic text-[#c9a84c]">Long-Term Partnerships</span>
            </h3>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-14">
              NazirovSholding is ready to collaborate with international buyers, distributors, investors and
              strategic partners.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
              <Button asChild className="h-14 rounded-none bg-[#c9a84c] text-[#0d0d0d] hover:bg-[#d4b85e] text-[11px] tracking-[0.3em] uppercase font-semibold gap-2">
                <Link to="/contact"><Handshake className="w-4 h-4" /> Request Partnership</Link>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-none border-[#c9a84c]/40 bg-transparent text-white hover:bg-[#c9a84c]/10 hover:text-[#c9a84c] hover:border-[#c9a84c] text-[11px] tracking-[0.3em] uppercase gap-2">
                <Link to="/contact"><Calendar className="w-4 h-4" /> Schedule Meeting</Link>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-none border-[#c9a84c]/40 bg-transparent text-white hover:bg-[#c9a84c]/10 hover:text-[#c9a84c] hover:border-[#c9a84c] text-[11px] tracking-[0.3em] uppercase gap-2">
                <Link to="/about"><FileDown className="w-4 h-4" /> Company Profile</Link>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-none border-[#c9a84c]/40 bg-transparent text-white hover:bg-[#c9a84c]/10 hover:text-[#c9a84c] hover:border-[#c9a84c] text-[11px] tracking-[0.3em] uppercase gap-2">
                <Link to="/contact"><MessageSquare className="w-4 h-4" /> Business Dev</Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-3 text-white/40 text-xs tracking-[0.3em] uppercase">
              <span className="h-px w-8 bg-white/20" />
              <span>NazirovSholding · Tashkent → World</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default GlobalOperationsSection;
