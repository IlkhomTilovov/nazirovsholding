import { useEffect, useRef, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useBrands } from '@/hooks/useBrands';
import { useLanguage } from '@/hooks/useLanguage';
import { EditableText } from '@/components/EditableText';
import { LazyImage } from '@/components/LazyImage';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

export const BrandsSection = memo(function BrandsSection() {
  const { language } = useLanguage();
  const { brands, loading } = useBrands(true);
  const { ref, isVisible } = useInView();
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [emblaRef] = useEmblaCarousel({ loop: false, align: 'start', dragFree: true });

  useEffect(() => {
    if (brands.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('brand_id')
        .eq('is_active', true)
        .in('brand_id', brands.map((b) => b.id));
      if (!data) return;
      const counts: Record<string, number> = {};
      data.forEach((p: any) => {
        if (p.brand_id) counts[p.brand_id] = (counts[p.brand_id] || 0) + 1;
      });
      setProductCounts(counts);
    })();
  }, [brands]);

  if (!loading && brands.length === 0) return null;

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 bg-background"
      aria-labelledby="brands-section-title"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <EditableText
            contentKey="brands_label"
            fallback={language === 'ru' ? 'Бренды' : 'Brendlar'}
            as="span"
            className="text-primary text-xs tracking-[0.3em] uppercase font-medium"
            section="brands"
          />
          <h2
            id="brands-section-title"
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4"
          >
            <EditableText
              contentKey="brands_title"
              fallback={language === 'ru' ? 'Наши бренды' : 'Bizning brendlarimiz'}
              as="span"
              className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold"
              section="brands"
            />
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-2xl mx-auto">
            <EditableText
              contentKey="brands_subtitle"
              fallback={
                language === 'ru'
                  ? 'Премиальные бренды, которым мы доверяем'
                  : "Biz ishonadigan premium brendlar"
              }
              as="span"
              section="brands"
            />
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-sm" />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile single column */}
            <div className="md:hidden grid grid-cols-1 gap-6">
              {brands.map((brand, i) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  count={productCounts[brand.id] || 0}
                  language={language}
                  index={i}
                  isVisible={isVisible}
                />
              ))}
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {brands.map((brand, i) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  count={productCounts[brand.id] || 0}
                  language={language}
                  index={i}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
});

interface BrandCardProps {
  brand: any;
  count: number;
  language: 'uz' | 'ru';
  index: number;
  isVisible: boolean;
}

const BrandCard = memo(function BrandCard({ brand, count, language, index, isVisible }: BrandCardProps) {
  const name = language === 'uz' ? brand.name_uz : brand.name_ru;
  const description = language === 'uz' ? brand.description_uz : brand.description_ru;
  const ctaLabel = language === 'ru' ? 'Подробнее' : "Ko'rish";
  const productsLabel = language === 'ru' ? 'товаров' : 'mahsulot';

  return (
    <Link
      to={`/brand/${brand.slug}`}
      className={`group relative block rounded-sm overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-700 hover:-translate-y-1 hover:shadow-xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      aria-label={name}
    >
      {/* Banner / image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {brand.logo || brand.banner ? (
          <LazyImage
            src={brand.logo || brand.banner}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            wrapperClassName="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Award className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Count badge */}
        {count > 0 && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-sm">
            {count} {productsLabel}
          </div>
        )}
      </div>


      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {name}
        </h3>
        {description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{description}</p>
        )}
        <div className="flex items-center gap-2 text-primary text-xs tracking-wider uppercase font-medium group-hover:gap-3 transition-all">
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
});
