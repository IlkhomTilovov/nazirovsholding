import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EditableText } from '@/components/EditableText';

interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string | null;
}

export default function PartnersMarquee() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('partners')
        .select('id, name, logo, website')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setPartners((data as Partner[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading || partners.length === 0) {
    return (
      <section className="py-24 md:py-32 bg-background relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="w-10 h-px bg-primary" />
              <EditableText contentKey="partners_label" fallback="ISHONCHLI HAMKORLAR" as="span" className="text-primary text-xs tracking-[0.4em] uppercase font-semibold" section="partners" />
              <span className="w-10 h-px bg-primary" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05]">
              <EditableText contentKey="partners_title_1" fallback="Global hamkorlar" as="span" className="block" section="partners" />
              <EditableText contentKey="partners_title_2" fallback="bilan birga" as="span" className="block text-primary italic" section="partners" />
            </h2>
          </div>
          {loading && (
            <div className="flex gap-12 justify-center opacity-30">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 w-32 bg-muted rounded animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Duplicate the list for seamless loop
  const loopList = [...partners, ...partners];

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 relative mb-14">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-10 h-px bg-primary" />
            <EditableText contentKey="partners_label" fallback="ISHONCHLI HAMKORLAR" as="span" className="text-primary text-xs tracking-[0.4em] uppercase font-semibold" section="partners" />
            <span className="w-10 h-px bg-primary" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-5">
            <EditableText contentKey="partners_title_1" fallback="Global hamkorlar" as="span" className="block" section="partners" />
            <EditableText contentKey="partners_title_2" fallback="bilan birga" as="span" className="block text-primary italic" section="partners" />
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            <EditableText contentKey="partners_intro" fallback="NazirovSholding xalqaro brendlar va yetakchi kompaniyalar bilan strategik hamkorlik qiladi." as="span" section="partners" />
          </p>
        </div>
      </div>

      {/* Marquee */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div
          className="flex w-max gap-16 md:gap-24 animate-marquee hover:[animation-play-state:paused]"
          style={{ animationDuration: `${Math.max(20, partners.length * 5)}s` }}
        >
          {loopList.map((p, i) => {
            const inner = (
              <img
                src={p.logo}
                alt={p.name}
                loading="lazy"
                className="h-14 md:h-20 w-auto max-w-[200px] object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              />
            );
            return (
              <div key={`${p.id}-${i}`} className="flex items-center justify-center shrink-0 px-2">
                {p.website ? (
                  <a href={p.website} target="_blank" rel="noopener noreferrer" aria-label={p.name}>
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
