import { useEffect, useRef, useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useBrands } from '@/hooks/useBrands';
import { useLanguage } from '@/hooks/useLanguage';
import { EditableText } from '@/components/EditableText';
import { LazyImage } from '@/components/LazyImage';
import { Skeleton } from '@/components/ui/skeleton';

export const BrandsSection = memo(function BrandsSection() {
  const { language } = useLanguage();
  const { brands, loading } = useBrands(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplayRef = useRef<number | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Autoplay
  useEffect(() => {
    if (!emblaApi) return;
    const start = () => {
      stop();
      autoplayRef.current = window.setInterval(() => emblaApi.scrollNext(), 5500);
    };
    const stop = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
    start();
    return stop;
  }, [emblaApi]);

  if (!loading && brands.length === 0) return null;

  return (
    <section className="relative bg-background" aria-labelledby="brands-section-title">
      {/* Heading */}
      <div className="container mx-auto px-4 lg:px-8 pt-20 md:pt-28 pb-10 md:pb-14 text-center">
        <EditableText
          contentKey="brands_label"
          fallback={language === 'ru' ? 'Бренды' : 'Brendlar'}
          as="span"
          className="text-primary text-xs tracking-[0.4em] uppercase font-semibold"
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
            className="font-serif"
            section="brands"
          />
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-2xl mx-auto">
          <EditableText
            contentKey="brands_subtitle"
            fallback={
              language === 'ru'
                ? 'Премиальные бренды, которым мы доверяем'
                : 'Biz ishonadigan premium brendlar'
            }
            as="span"
            section="brands"
          />
        </p>
      </div>

      {/* Fullscreen carousel */}
      {loading ? (
        <Skeleton className="w-full h-[80vh]" />
      ) : (
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {brands.map((brand) => (
                <BrandSlide key={brand.id} brand={brand} language={language} />
              ))}
            </div>
          </div>

          {/* Controls */}
          {brands.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                aria-label="Previous"
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-background/40 hover:bg-primary border border-foreground/20 text-foreground flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next"
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-background/40 hover:bg-primary border border-foreground/20 text-foreground flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {brands.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-[3px] transition-all duration-500 ${
                      i === selectedIndex ? 'w-10 bg-primary' : 'w-5 bg-foreground/40 hover:bg-foreground/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
});

const BrandSlide = memo(function BrandSlide({
  brand,
  language,
}: {
  brand: any;
  language: 'uz' | 'ru';
}) {
  const name = language === 'uz' ? brand.name_uz : brand.name_ru;
  const description = language === 'uz' ? brand.description_uz : brand.description_ru;
  const ctaLabel = language === 'ru' ? 'Подробнее' : "Ko'rish";
  const image = brand.banner || brand.logo;

  return (
    <div className="relative shrink-0 grow-0 basis-full">
      <div className="relative w-full h-[100vh] overflow-hidden bg-background">
        {image ? (
          <LazyImage
            src={image}
            alt={name}
            priority
            className="w-full h-full object-cover"
            wrapperClassName="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 bg-secondary" />
        )}

        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full container mx-auto px-6 lg:px-12 flex items-center">
          <div className="max-w-xl text-white">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-accent" />
              <span className="text-accent text-xs tracking-[0.4em] uppercase font-semibold">
                Brend
              </span>
            </div>
            <h3 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              {name}
            </h3>
            {description && (
              <p className="text-white/85 text-base md:text-lg leading-relaxed mb-8 max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
                {description}
              </p>
            )}
            <Link
              to={`/brand/${brand.slug}`}
              className="inline-flex items-center gap-3 px-7 py-3.5 bg-primary text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:bg-primary/90 transition-all group"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});
