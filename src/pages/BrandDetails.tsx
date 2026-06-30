import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/ProductCard';
import { LazyImage } from '@/components/LazyImage';
import { useLanguage } from '@/hooks/useLanguage';
import { useSEO } from '@/hooks/useSEO';
import { useBrand, useBrandProducts } from '@/hooks/useBrands';
import { useSystemSettings } from '@/hooks/useSystemSettings';

export default function BrandDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { getPrimaryDomain } = useSystemSettings();
  const { brand, loading } = useBrand(slug);
  const { products, categories, divisions, loading: productsLoading } = useBrandProducts(brand?.id, 48);
  const [activeDivisionId, setActiveDivisionId] = useState<string | 'all'>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string | 'all'>('all');

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


        {divisions.length > 0 && (
          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
              {isUz ? 'Bo\'limlar' : 'Подразделения'}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setActiveDivisionId('all'); setActiveCategoryId('all'); }}
                className={`px-4 py-2 rounded-sm text-sm tracking-wider uppercase transition-colors border ${
                  activeDivisionId === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary'
                }`}
              >
                {isUz ? 'Barchasi' : 'Все'}
              </button>
              {divisions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { setActiveDivisionId(d.id); setActiveCategoryId('all'); }}
                  className={`px-4 py-2 rounded-sm text-sm tracking-wider uppercase transition-colors border ${
                    activeDivisionId === d.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary'
                  }`}
                >
                  {isUz ? d.name_uz : d.name_ru}
                </button>
              ))}
            </div>
          </div>
        )}

        {(() => {
          const visibleCategories =
            activeDivisionId === 'all'
              ? categories
              : categories.filter((c) => c.division_id === activeDivisionId);
          return visibleCategories.length > 0 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategoryId('all')}
                className={`px-4 py-2 rounded-sm text-sm tracking-wider uppercase transition-colors border ${
                  activeCategoryId === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary'
                }`}
              >
                {isUz ? 'Barchasi' : 'Все'}
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-sm text-sm tracking-wider uppercase transition-colors border ${
                    activeCategoryId === cat.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary'
                  }`}
                >
                  {isUz ? cat.name_uz : cat.name_ru}
                </button>
              ))}
            </div>
          ) : null;
        })()}

        {(() => {
          const divisionCategoryIds = new Set(
            (activeDivisionId === 'all'
              ? categories
              : categories.filter((c) => c.division_id === activeDivisionId)
            ).map((c) => c.id)
          );
          const filtered = products.filter((p) => {
            if (activeCategoryId !== 'all') return p.category_id === activeCategoryId;
            if (activeDivisionId === 'all') return true;
            return p.category_id ? divisionCategoryIds.has(p.category_id) : false;
          });
          return (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl md:text-3xl font-bold">
                  {isUz ? 'Brend mahsulotlari' : 'Товары бренда'}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filtered.length} {isUz ? 'ta' : 'шт'}
                </span>
              </div>

              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-[4/3] bg-muted" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  {isUz ? 'Bu brendda hozircha mahsulotlar mavjud emas' : 'Пока нет товаров этого бренда'}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
