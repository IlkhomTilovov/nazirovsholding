import { useSEO } from '@/hooks/useSEO';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBrands } from '@/hooks/useBrands';
import { useLanguage } from '@/hooks/useLanguage';
import { useLanguages } from '@/hooks/useLanguages';
import { getTranslated } from '@/lib/i18n';
import { EditableText } from '@/components/EditableText';



export default function Sectors() {
  useSEO({ title: "Faoliyat yo'nalishlari — NazirovSholding" });
  const { language } = useLanguage();
  const { defaultLanguage } = useLanguages();
  const { brands, loading: brandsLoading } = useBrands(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative pt-24 pb-20 border-b border-foreground/5">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.12), transparent 60%)' }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
          <EditableText
            contentKey="sectors.hero.eyebrow"
            fallback="03 — Faoliyat"
            as="p"
            className="text-[10px] tracking-[0.5em] uppercase text-primary mb-6"
            section="sectors-hero"
          />
          <h1
            className="text-5xl md:text-7xl font-light tracking-tight max-w-4xl leading-[1.05] font-serif"
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
            className="mt-8 max-w-2xl text-foreground/60 text-lg leading-relaxed block"
            section="sectors-hero"
          />

        </div>
      </section>


      {/* Brands */}
      <section className="py-24 border-t border-foreground/5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, hsl(var(--primary) / 0.10), transparent 60%)' }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <EditableText
                contentKey="sectors.brands.eyebrow"
                fallback="— 04 Bizning Brendlar"
                as="p"
                className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4"
                section="sectors-brands"
              />
              <h2
                className="text-4xl md:text-5xl font-light max-w-2xl leading-[1.1] font-serif"
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
              className="text-foreground/50 text-sm max-w-md leading-relaxed block"
              section="sectors-brands"
            />

          </div>

          {brandsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-foreground/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-background aspect-[4/5] animate-pulse" />
              ))}
            </div>
          ) : brands.length === 0 ? null : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-foreground/5">
              {brands.map((b, i) => {
                const name = getTranslated(b.name, language, defaultLanguage);
                const description = getTranslated(b.description, language, defaultLanguage);
                return (
                  <Link
                    key={b.id}
                    to={`/brand/${b.slug}`}
                    className="group relative bg-background hover:bg-muted transition-colors duration-500 p-6 flex flex-col justify-between aspect-[4/5]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] tracking-[0.3em] text-foreground/30">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-foreground/20 group-hover:text-primary group-hover:rotate-0 -rotate-12 transition-all duration-500" />
                    </div>

                    <div className="flex-1 flex items-center justify-center py-6">
                      {b.logo ? (
                        <img
                          src={b.logo}
                          alt={name}
                          className="max-h-16 max-w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      ) : (
                        <div
                          className="text-3xl font-light text-foreground/80 group-hover:text-primary transition-colors text-center font-serif"
                        >
                          {name}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="h-px bg-gradient-to-r from-[hsl(var(--primary))]/0 via-[hsl(var(--primary))]/40 to-[hsl(var(--primary))]/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left mb-4" />
                      {b.logo ? (
                        <h4 className="text-sm font-light tracking-wide text-foreground/70 group-hover:text-foreground transition-colors">
                          {name}
                        </h4>
                      ) : null}
                      {description && (
                        <p className="text-[11px] text-foreground/40 mt-1 line-clamp-2 leading-relaxed">
                          {description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-foreground/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <EditableText
              contentKey="sectors.cta.eyebrow"
              fallback="Strategik Hamkorlik"
              as="p"
              className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4"
              section="sectors-cta"
            />
            <h2 className="text-4xl md:text-5xl font-light max-w-2xl leading-tight font-serif">
              <EditableText
                contentKey="sectors.cta.title"
                fallback="Bizning sohalardan birida hamkorlikni o‘rganamizmi?"
                multiline
                section="sectors-cta"
              />
            </h2>
          </div>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 bg-primary hover:bg-[hsl(var(--primary)/0.85)] text-primary-foreground px-8 py-4 text-xs font-semibold tracking-[0.3em] uppercase transition-colors"
          >
            <EditableText
              contentKey="sectors.cta.button"
              fallback="So'rov Yuborish"
              section="sectors-cta"
            />
            <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </Link>

        </div>
      </section>
    </div>
  );
}
