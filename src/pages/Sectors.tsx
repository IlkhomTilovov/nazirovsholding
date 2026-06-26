import { useSEO } from '@/hooks/useSEO';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBrands } from '@/hooks/useBrands';
import { EditableText } from '@/components/EditableText';



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
          <EditableText
            contentKey="sectors.hero.eyebrow"
            fallback="03 — Faoliyat"
            as="p"
            className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-6"
            section="sectors-hero"
          />
          <h1
            className="text-5xl md:text-7xl font-light tracking-tight max-w-4xl leading-[1.05]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            <EditableText
              contentKey="sectors.hero.title"
              fallback="Diversifikatsiyalashgan biznes ekotizimi"
              multiline
              section="sectors-hero"
            />
          </h1>
          <EditableText
            contentKey="sectors.hero.subtitle"
            fallback="NazirovSholding — bir nechta strategik sohalarda faoliyat yurituvchi xalqaro holding. Har bir yo‘nalish kompaniyaning yagona qiymat zanjiri va global qamroviga integratsiyalashgan."
            as="p"
            multiline
            className="mt-8 max-w-2xl text-white/60 text-lg leading-relaxed block"
            section="sectors-hero"
          />

        </div>
      </section>


      {/* Brands */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(212,175,55,0.10), transparent 60%)' }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <EditableText
                contentKey="sectors.brands.eyebrow"
                fallback="— 04 Bizning Brendlar"
                as="p"
                className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-4"
                section="sectors-brands"
              />
              <h2
                className="text-4xl md:text-5xl font-light max-w-2xl leading-[1.1]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                <EditableText
                  contentKey="sectors.brands.title"
                  fallback="Holding tarkibidagi strategik brendlar"
                  multiline
                  section="sectors-brands"
                />
              </h2>
            </div>
            <EditableText
              contentKey="sectors.brands.subtitle"
              fallback="Har bir brend o'z sohasida yetakchi mavqega ega bo'lib, NazirovSholding global eksport infratuzilmasi orqali xalqaro bozorlarga chiqariladi."
              as="p"
              multiline
              className="text-white/50 text-sm max-w-md leading-relaxed block"
              section="sectors-brands"
            />

          </div>

          {brandsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-[#0d0d0d] aspect-[4/5] animate-pulse" />
              ))}
            </div>
          ) : brands.length === 0 ? null : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/5">
              {brands.map((b, i) => (
                <Link
                  key={b.id}
                  to={`/brand/${b.slug}`}
                  className="group relative bg-[#0d0d0d] hover:bg-[#141414] transition-colors duration-500 p-6 flex flex-col justify-between aspect-[4/5]"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] tracking-[0.3em] text-white/30">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-[#d4af37] group-hover:rotate-0 -rotate-12 transition-all duration-500" />
                  </div>

                  <div className="flex-1 flex items-center justify-center py-6">
                    {b.logo ? (
                      <img
                        src={b.logo}
                        alt={b.name_uz}
                        className="max-h-16 max-w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    ) : (
                      <div
                        className="text-3xl font-light text-white/80 group-hover:text-[#d4af37] transition-colors text-center"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                      >
                        {b.name_uz}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="h-px bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/40 to-[#d4af37]/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left mb-4" />
                    {b.logo ? (
                      <h4 className="text-sm font-light tracking-wide text-white/70 group-hover:text-white transition-colors">
                        {b.name_uz}
                      </h4>
                    ) : null}
                    {b.description_uz && (
                      <p className="text-[11px] text-white/40 mt-1 line-clamp-2 leading-relaxed">
                        {b.description_uz}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
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
