import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Globe, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/ProductCard';
import { LazyImage } from '@/components/LazyImage';
import { useLanguage } from '@/hooks/useLanguage';
import { useSEO } from '@/hooks/useSEO';
import { useBrand, useBrandProducts } from '@/hooks/useBrands';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCaseStudies, countryFlagEmoji } from '@/hooks/useCaseStudies';

export default function BrandDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { getPrimaryDomain } = useSystemSettings();
  const { brand, loading } = useBrand(slug);
  const { products, categories, divisions, loading: productsLoading } = useBrandProducts(brand?.id, 48);
  const { caseStudies } = useCaseStudies(brand?.id, true);
  const [activeCategory, setActiveCategory] = useState<Record<string, string>>({});

  const isUz = language === 'uz';
  const name = brand ? (isUz ? brand.name_uz : brand.name_ru) : '';
  const description = brand ? (isUz ? brand.description_uz : brand.description_ru) : '';
  const metaTitle = brand ? (isUz ? brand.meta_title_uz : brand.meta_title_ru) : null;
  const metaDesc = brand ? (isUz ? brand.meta_description_uz : brand.meta_description_ru) : null;

  useSEO({
    title: metaTitle || name || undefined,
    description: metaDesc || description || undefined,
    keywords: brand?.meta_keywords || undefined,
    ogImage: brand?.banner || brand?.logo || undefined,
    noindex: brand ? !brand.is_indexed : false,
    nofollow: brand ? !brand.is_followed : false,
  });

  // JSON-LD Organization
  useEffect(() => {
    if (!brand) return;
    const url = `${getPrimaryDomain()}/brand/${brand.slug}`;
    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: name,
      url,
    };
    if (brand.logo) jsonLd.logo = brand.logo;
    if (brand.website) jsonLd.sameAs = [brand.website];
    if (description) jsonLd.description = description;

    let script = document.querySelector('script[data-brand-jsonld]') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-brand-jsonld', 'true');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
    return () => { script?.remove(); };
  }, [brand, name, description, getPrimaryDomain]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="w-full h-64 md:h-80" />
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-3/4 max-w-2xl" />
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{isUz ? 'Brend topilmadi' : 'Бренд не найден'}</h1>
          <Button asChild><Link to="/catalog">{isUz ? 'Katalogga qaytish' : 'В каталог'}</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div id="hero" className="min-h-screen">
      {/* Banner */}
      <div className="relative w-full h-screen bg-muted overflow-hidden">
        {brand.banner ? (
          <>
            <LazyImage
              src={brand.banner}
              alt={name}
              priority
              className="w-full h-full object-cover"
              wrapperClassName="absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        )}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl animate-fade-in">
              <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3 text-white/90 hover:bg-white/10 hover:text-white">
                <Link to="/catalog"><ArrowLeft className="w-4 h-4 mr-2" />{isUz ? 'Orqaga' : 'Назад'}</Link>
              </Button>

              <div className="flex items-center gap-5 mb-6">
                {brand.logo && (
                  <div className="bg-white rounded-2xl p-3 shadow-2xl ring-1 ring-white/20 shrink-0">
                    <img src={brand.logo} alt={name} className="h-16 w-16 md:h-20 md:w-20 object-contain" />
                  </div>
                )}
                <div className={brand.banner ? 'text-white' : ''}>
                  <span className="inline-block text-[11px] md:text-xs uppercase tracking-[0.25em] font-medium text-white/70 mb-2">
                    {isUz ? 'Brend' : 'Бренд'}
                  </span>
                  <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                    {name}
                  </h1>
                </div>
              </div>

              {description && (
                <p className="text-base md:text-lg leading-relaxed whitespace-pre-line text-white/85 font-light max-w-2xl">
                  {description}
                </p>
              )}

              {brand.website && (
                <a href={brand.website} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                  <Globe className="w-4 h-4" />
                  {brand.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">


        {(() => {
          const catDivisionMap = new Map(categories.map((c) => [c.id, c.division_id]));

          const renderCategoryPills = (sectionKey: string, sectionCategories: typeof categories) => {
            if (sectionCategories.length === 0) return null;
            const active = activeCategory[sectionKey] ?? 'all';
            return (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveCategory((p) => ({ ...p, [sectionKey]: 'all' }))}
                  className={`px-3 py-1.5 rounded-full text-xs tracking-wide transition-colors border ${
                    active === 'all'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:border-foreground'
                  }`}
                >
                  {isUz ? 'Barchasi' : 'Все'}
                </button>
                {sectionCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory((p) => ({ ...p, [sectionKey]: cat.id }))}
                    className={`px-3 py-1.5 rounded-full text-xs tracking-wide transition-colors border ${
                      active === cat.id
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-transparent text-muted-foreground border-border hover:border-foreground'
                    }`}
                  >
                    {isUz ? cat.name_uz : cat.name_ru}
                  </button>
                ))}
              </div>
            );
          };

          const renderProductGrid = (sectionKey: string, sectionProducts: typeof products) => {
            const active = activeCategory[sectionKey] ?? 'all';
            const filtered = active === 'all' ? sectionProducts : sectionProducts.filter((p) => p.category_id === active);
            if (productsLoading) {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-[4/3] bg-muted" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            if (filtered.length === 0) return null;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            );
          };

          const otherCategories = categories.filter((c) => !c.division_id);
          const otherProducts = products.filter((p) => {
            const div = p.category_id != null ? catDivisionMap.get(p.category_id) : null;
            return !div;
          });

          return (
            <>
              {divisions.map((division) => {
                const sectionCategories = categories.filter((c) => c.division_id === division.id);
                const catIds = new Set(sectionCategories.map((c) => c.id));
                const sectionProducts = products.filter((p) => p.category_id != null && catIds.has(p.category_id));
                const description = isUz ? division.description_uz : division.description_ru;
                const benefits = isUz ? division.benefits_uz : division.benefits_ru;
                const sectionKey = `division:${division.id}`;
                return (
                  <section key={division.id} className="mb-16">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">
                      {isUz ? division.name_uz : division.name_ru}
                    </h2>
                    {(description || benefits.length > 0) && (
                      <div className="mb-8 space-y-6">
                        {description && (
                          <div className="rounded-lg border bg-card p-6">
                            <p className="text-muted-foreground leading-relaxed">{description}</p>
                          </div>
                        )}
                        {benefits.length > 0 && (
                          <div className="rounded-lg bg-muted/40 p-6 md:p-8">
                            <h3 className="font-serif text-xl font-bold mb-5">
                              {isUz ? 'Nima olasiz' : 'Что вы получите'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                              {benefits.map((b, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                  <span>{b}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {renderCategoryPills(sectionKey, sectionCategories)}
                    {renderProductGrid(sectionKey, sectionProducts)}
                  </section>
                );
              })}

              {(divisions.length === 0 || otherProducts.length > 0) && (
                <section className="mb-16">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold">
                      {isUz ? 'Brend mahsulotlari' : 'Товары бренда'}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {otherProducts.length} {isUz ? 'ta' : 'шт'}
                    </span>
                  </div>
                  {renderCategoryPills('other', otherCategories)}
                  {renderProductGrid('other', otherProducts)}
                </section>
              )}
            </>
          );
        })()}

        {caseStudies.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-px bg-primary" />
              <span className="text-primary text-xs tracking-[0.3em] uppercase font-semibold">
                {isUz ? 'Loyihalar' : 'Проекты'}
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8">
              {isUz ? "Tanlangan xalqaro loyihalar" : 'Избранные международные проекты'}
            </h2>
            <div className="space-y-6">
              {caseStudies.map((c) => (
                <div key={c.id} className="flex flex-col md:flex-row border border-primary/30 overflow-hidden">
                  <div className="relative w-full md:w-1/2 aspect-[16/10] md:aspect-auto">
                    {c.image ? (
                      <img src={c.image} alt={isUz ? c.title_uz : c.title_ru} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-muted" />
                    )}
                    <div className="hidden md:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-background" />
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-background/90 px-2.5 py-1 text-xs font-semibold tracking-wide">
                      <span>{countryFlagEmoji(c.country_code)}</span>
                      <span>{c.country_code}</span>
                      <span className="text-muted-foreground font-normal uppercase">
                        {isUz ? c.country_name_uz : c.country_name_ru}
                      </span>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
                    <span className="text-primary text-[11px] tracking-[0.25em] uppercase font-semibold mb-3">
                      {isUz ? c.category_uz : c.category_ru}
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl text-primary font-bold mb-4">
                      {isUz ? c.title_uz : c.title_ru}
                    </h3>
                    <span className="w-12 h-px bg-primary/40 mb-6" />
                    <div className="flex items-center gap-10">
                      {(c.result_uz || c.result_ru) && (
                        <div>
                          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                            {isUz ? 'Natija' : 'Результат'}
                          </p>
                          <p className="font-medium">{isUz ? c.result_uz : c.result_ru}</p>
                        </div>
                      )}
                      {c.year && (
                        <div>
                          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                            {isUz ? 'Yil' : 'Год'}
                          </p>
                          <p className="font-medium text-primary">{c.year}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
