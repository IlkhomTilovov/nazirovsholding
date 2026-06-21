import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Shield, Ruler, Gem, Truck, Star, Paintbrush, Users, ChevronRight, Phone, Send, FileText, Briefcase, Factory, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { useFeaturedProducts, useCategories } from '@/hooks/useProducts';
import { useLanguage } from '@/hooks/useLanguage';
import { useSEO } from '@/hooks/useSEO';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';
import { BrandsSection } from '@/components/BrandsSection';
import { useState, useEffect, useRef } from 'react';

import serviceWardrobe from '@/assets/service-wardrobe.jpg';
import serviceKitchen from '@/assets/service-kitchen.jpg';
import serviceTvzone from '@/assets/service-tvzone.jpg';
import serviceBedroom from '@/assets/service-bedroom.jpg';
import heroExportFruits from '@/assets/hero-export-fruits.jpg';
import heroExportLogistics from '@/assets/hero-export-logistics.jpg';
import heroExportFactory from '@/assets/hero-export-factory.jpg';

const heroSlides = [heroExportFruits, heroExportLogistics, heroExportFactory];

const defaultServiceImages: Record<string, string> = {
  'shkaflar': serviceWardrobe,
  'oshxona-mebellari': serviceKitchen,
  'tv-zonalar': serviceTvzone,
  'yotoqxona-mebellari': serviceBedroom,
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

const iconMap: Record<string, any> = {
  Shield, Ruler, Gem, Truck, Star, Paintbrush, Users, FileText, Briefcase, Factory, Ship,
};

export default function Index() {
  const { language } = useLanguage();
  useSEO({});
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(8);
  const { settings } = useSystemSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const contactPhone = settings?.contact_phone || '+998 90 123 45 67';

  const whyUsItems = [
    { key: 'whyus_1', icon: 'Shield', image: heroExportFactory, titleFallback: 'SIFAT VA ISHONCH', descFallback: 'Biz har bir bosqichda yuqori xalqaro standartlarga rioya qilamiz. Xom ashyo tanlashdan to tayyor mahsulotni jo\'natishgacha.' },
    { key: 'whyus_2', icon: 'Gem', image: heroExportFruits, titleFallback: 'SHAFFOFLIK VA HALOLLIK', descFallback: 'Mijozlar bilan ochiq va halol munosabatlarni qadrlaymiz. Barcha narxlar, muddatlar va xarajatlar oldindan aniq.' },
    { key: 'whyus_3', icon: 'Users', image: heroExportLogistics, titleFallback: 'JAMOAVIY ISH', descFallback: 'Bizning kuchimiz — birlashgan professionallar jamoasida. Har biri natija uchun ishlaydi va o\'sib boradi.' },
    { key: 'whyus_4', icon: 'Star', image: heroExportFactory, titleFallback: 'YETAKCHILIK', descFallback: 'Biz yetakchilik madaniyatini qo\'llab-quvvatlaymiz. Har bir xodim mijozlar uchun eng yaxshi yechimga intiladi.' },
  ];

  const steps = [
    { key: 'step_1', num: '01', icon: 'FileText', titleFallback: "So'rov yuborish", descFallback: "Mijoz RFQ shakli yoki mahsulot katalogi orqali o'z ehtiyojlarini yuboradi. Talab qilinadigan mahsulot, hajm va yetkazib berish shartlari aniqlashtiriladi." },
    { key: 'step_2', num: '02', icon: 'Briefcase', titleFallback: 'Tijorat taklifi', descFallback: 'MOQ, narx, ishlab chiqarish muddati va logistika shartlari asosida individual tijorat taklifi tayyorlanadi.' },
    { key: 'step_3', num: '03', icon: 'Factory', titleFallback: 'Ishlab chiqarish', descFallback: "Mahsulot ishlab chiqariladi, sifat nazoratidan o'tkaziladi va eksport standartlariga muvofiqligi tekshiriladi." },
    { key: 'step_4', num: '04', icon: 'Ship', titleFallback: 'Yetkazib berish', descFallback: 'Mahsulot FOB, CIF, FCA yoki DAP shartlari asosida xalqaro logistika orqali mijoz manziliga yetkaziladi.' },
  ];

  const testimonials = [
    { key: 'testimonial_1', nameFallback: 'Sardor Karimov', textFallback: "BAROKAT MEBEL bilan ishlaganim uchun juda mamnunman. Sifat a'lo darajada, dizayn zamonaviy.", roleFallback: 'Mijoz' },
    { key: 'testimonial_2', nameFallback: 'Nilufar Rahimova', textFallback: "Oshxona mebelini buyurtma qildik, natija kutganimizdan ham yaxshi chiqdi. Rahmat!", roleFallback: 'Mijoz' },
    { key: 'testimonial_3', nameFallback: 'Bobur Toshmatov', textFallback: "TV zona va shkaf buyurtma qildim. Professional yondashuv va sifatli ish.", roleFallback: 'Mijoz' },
  ];

  const trustBadges = [
    { key: 'trust_1', icon: Paintbrush, fallback: 'Individual dizayn' },
    { key: 'trust_2', icon: Ruler, fallback: "Bepul o'lchov" },
    { key: 'trust_3', icon: Gem, fallback: 'Premium materiallar' },
    { key: 'trust_4', icon: Truck, fallback: 'Tez yetkazib berish' },
  ];

  const sectionServices = useInView();
  const sectionWhyUs = useInView();
  const sectionProcess = useInView();
  const sectionProducts = useInView();
  const sectionTestimonials = useInView();
  const sectionCta = useInView();

  const [heroSlide, setHeroSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative flex items-center overflow-hidden" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="absolute inset-0 z-0 bg-background">
          {heroSlides.map((src, i) => (
            <img
              key={src}
              src={src}
              alt="MIR MEXA export"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ${i === heroSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'} transition-transform`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/40 z-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20 pointer-events-none">
          <div className="max-w-2xl [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_[data-editable]]:pointer-events-auto">
            <div className="inline-block mb-6 px-4 py-1.5 border border-primary/40 rounded-sm">
              <EditableText
                contentKey="hero_badge"
                fallback="MIR MEXA · EXPORT"
                as="span"
                className="text-primary text-xs font-medium tracking-[0.3em] uppercase"
                section="hero"
              />
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-white leading-[1.05] mb-6">
              <EditableText
                contentKey="hero_title_line1"
                fallback="Premium mahsulotlar"
                as="span"
                className="block font-serif"
                section="hero"
              />
              <EditableText
                contentKey="hero_title_line2"
                fallback="dunyo bozoriga"
                as="span"
                className="block font-serif text-primary italic"
                section="hero"
              />
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-lg leading-relaxed">
              <EditableText
                contentKey="hero_subtitle"
                fallback="O'zbekistondan Yevropa va MDH davlatlariga ishonchli eksport. Sifat, shaffoflik va o'z vaqtida yetkazib berish kafolati."
                as="span"
                className="text-lg md:text-xl"
                section="hero"
              />
            </p>
            <div className="flex flex-wrap gap-4 mb-16">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-8 tracking-wider text-sm uppercase h-14">
                <Link to="/catalog">
                  <EditableText contentKey="hero_cta_primary" fallback={language === 'ru' ? 'Смотреть каталог' : "Katalogni ko'rish"} as="span" section="hero" />
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/5 hover:text-white hover:border-white/50 rounded-sm px-8 tracking-wider text-sm uppercase h-14">
                <Link to="/contact">
                  <EditableText contentKey="hero_cta_secondary" fallback={language === 'ru' ? 'Связаться с нами' : "Biz bilan bog'lanish"} as="span" section="hero" />
                </Link>
              </Button>
            </div>

            {/* Trust badges - editable */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustBadges.map((badge) => (
                <div key={badge.key} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm px-4 py-3">
                  <badge.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <EditableText
                    contentKey={badge.key}
                    fallback={badge.fallback}
                    as="span"
                    className="text-white/80 text-xs font-medium"
                    section="hero"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 right-8 z-30 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              aria-label={`Slayd ${i + 1}`}
              className={`h-1 transition-all duration-500 ${i === heroSlide ? 'w-12 bg-primary' : 'w-6 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* BRANDS - dynamic */}
      <BrandsSection />

      {/* WHY US - Quality grid + Mission panel (Noir & Gold) */}
      <section ref={sectionWhyUs.ref} className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className={`mb-16 transition-all duration-700 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal text-foreground leading-[1.1]">
              <EditableText contentKey="whyus_title_line1" fallback="SIFAT VA STIL" as="span" className="block tracking-wide" section="whyus" />
              <EditableText contentKey="whyus_title_line2" fallback="HAR BIR TAFSILOTDA" as="span" className="block text-primary italic pl-12 md:pl-32" section="whyus" />
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 4 cards in 2x2 grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {whyUsItems.map((item, i) => (
                <div
                  key={item.key}
                  className={`group relative overflow-hidden bg-card border border-primary/10 rounded-sm p-6 transition-all duration-500 hover:border-primary/40 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <h3 className="font-sans text-xs tracking-[0.2em] text-primary font-semibold mb-3">
                    <EditableText contentKey={`${item.key}_title`} fallback={item.titleFallback} as="span" section="whyus" />
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    <EditableText contentKey={`${item.key}_desc`} fallback={item.descFallback} as="span" section="whyus" />
                  </p>
                  <div className="aspect-[16/9] overflow-hidden rounded-sm">
                    <img
                      src={item.image}
                      alt={item.titleFallback}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mission panel */}
            <div className={`flex flex-col justify-center px-2 lg:pl-8 transition-all duration-700 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '400ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-sm flex items-center justify-center">
                  <Gem className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-foreground">
                  <EditableText contentKey="mission_title" fallback="BIZNING MISSIYA" as="span" section="whyus" />
                </h3>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed mb-4">
                <EditableText
                  contentKey="mission_desc_1"
                  fallback="O'zbekistonning eng yaxshi mahsulotlarini xalqaro bozorga olib chiqish — bizning asosiy maqsadimiz. Har bir mijoz va sherik uchun ishonchli yetkazib beruvchi bo'lish."
                  as="span"
                  section="whyus"
                />
              </p>
              <p className="text-muted-foreground/80 text-sm leading-relaxed italic">
                <EditableText
                  contentKey="mission_desc_2"
                  fallback="Biz bilan siz sifat, halollik va o'z vaqtida yetkazib berish kafolatiga ega bo'lasiz."
                  as="span"
                  section="whyus"
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPORT PROCESS - editable */}
      <section ref={sectionProcess.ref} className="py-20 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_70%)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 relative">
          <div className={`text-center mb-20 transition-all duration-700 ${sectionProcess.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EditableText
              contentKey="process_label"
              fallback="EKSPORT JARAYONI"
              as="span"
              className="text-primary text-xs tracking-[0.4em] uppercase font-semibold"
              section="process"
            />
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-foreground mt-5 mb-5 leading-[1.1]">
              <EditableText
                contentKey="process_title"
                fallback="Eksport jarayoni qanday ishlaydi"
                as="span"
                section="process"
              />
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              <EditableText
                contentKey="process_subtitle"
                fallback="MIR MEXA xalqaro hamkorlari uchun eksportning barcha bosqichlarini professional tarzda boshqaradi."
                as="span"
                section="process"
              />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
            {steps.map((step, i) => {
              const IconComp = iconMap[step.icon] || FileText;
              return (
                <div
                  key={step.key}
                  className={`relative group transition-all duration-700 ${sectionProcess.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="relative h-full p-7 border border-primary/15 rounded-sm bg-card/40 backdrop-blur-sm transition-all duration-500 hover:border-primary/60 hover:bg-card/60 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.4)] hover:-translate-y-1">
                    {/* Number watermark */}
                    <span className="absolute top-4 right-5 font-serif text-5xl font-normal text-primary/15 group-hover:text-primary/30 transition-colors duration-500 select-none">
                      {step.num}
                    </span>

                    {/* Icon */}
                    <div className="w-12 h-12 mb-6 flex items-center justify-center border border-primary/30 rounded-sm bg-primary/5 group-hover:bg-primary/15 group-hover:border-primary/60 transition-all duration-500">
                      <IconComp className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>

                    <h3 className="font-serif text-xl md:text-2xl font-normal text-foreground mb-3 leading-snug">
                      <EditableText
                        contentKey={`${step.key}_title`}
                        fallback={step.titleFallback}
                        as="span"
                        section="process"
                      />
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      <EditableText
                        contentKey={`${step.key}_desc`}
                        fallback={step.descFallback}
                        as="span"
                        section="process"
                      />
                    </p>

                    {/* Gold bottom accent */}
                    <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-700" />
                  </div>

                  {/* Connector arrow (desktop only, between cards) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-2 z-10 -translate-y-1/2 items-center justify-center w-4 h-4">
                      <ChevronRight className="w-4 h-4 text-primary/40" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES - editable */}
      <section ref={sectionServices.ref} className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${sectionServices.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EditableText contentKey="services_label" fallback="Xizmatlar" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="services" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4">
              <EditableText contentKey="services_title" fallback="Biz nimalar qilamiz" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="services" />
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : categories.length > 0 ? (
              categories.map((cat, i) => {
                const name = language === 'uz' ? cat.name_uz : cat.name_ru;
                const fallbackImage = defaultServiceImages[cat.slug] || serviceWardrobe;
                return (
                  <Link
                    to={`/catalog?category=${cat.slug}`}
                    key={cat.id}
                    className={`group relative aspect-[3/4] rounded-sm overflow-hidden cursor-pointer transition-all duration-700 ${sectionServices.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <img
                      src={cat.image || fallbackImage}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="font-serif text-xl font-semibold text-white mb-1">
                        {name}
                      </h3>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                {language === 'uz' ? 'Hozircha toifalar yo\'q' : 'Категорий пока нет'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section ref={sectionProducts.ref} className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4 transition-all duration-700 ${sectionProducts.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <EditableText contentKey="products_label" fallback="Katalog" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="products" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2">
                <EditableText contentKey="featured_title" fallback="Tanlangan mahsulotlar" as="span" className="font-serif text-3xl md:text-4xl font-bold" section="products" />
              </h2>
            </div>
            <Button asChild variant="outline" className="gap-2 rounded-sm border-border hover:border-primary text-sm tracking-wider uppercase">
              <Link to="/catalog">Barchasini ko'rish <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          
          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">
              Hozircha tanlangan mahsulotlar yo'q
            </p>
          )}
        </div>
      </section>

      {/* TESTIMONIALS - editable */}
      <section ref={sectionTestimonials.ref} className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${sectionTestimonials.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EditableText contentKey="testimonials_label" fallback="Fikrlar" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="testimonials" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4">
              <EditableText contentKey="testimonials_title" fallback="Mijozlarimiz nima deydi" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="testimonials" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, i) => (
              <div
                key={item.key}
                className={`p-8 border border-border rounded-sm transition-all duration-700 ${sectionTestimonials.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  "<EditableText contentKey={`${item.key}_text`} fallback={item.textFallback} as="span" className="text-sm" section="testimonials" />"
                </p>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    <EditableText contentKey={`${item.key}_name`} fallback={item.nameFallback} as="span" className="font-medium text-sm" section="testimonials" />
                  </p>
                  <p className="text-muted-foreground text-xs">
                    <EditableText contentKey={`${item.key}_role`} fallback={item.roleFallback} as="span" className="text-xs" section="testimonials" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - editable */}
      <section ref={sectionCta.ref} className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[url('/images/hero-default.jpg')] bg-cover bg-center opacity-10" />
        <div className={`container mx-auto px-4 lg:px-8 relative z-10 text-center transition-all duration-700 ${sectionCta.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            <EditableText contentKey="cta_title" fallback="Hoziroq buyurtma bering" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="cta" />
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
            <EditableText contentKey="cta_subtitle" fallback="Bepul konsultatsiya va o'lchov uchun biz bilan bog'laning" as="span" className="text-lg" section="cta" />
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-sm px-8 tracking-wider text-sm uppercase h-14">
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`}>
                <Phone className="w-4 h-4 mr-2" />
                {contactPhone}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-sm px-8 tracking-wider text-sm uppercase h-14 bg-transparent">
              <a href={settings?.social_telegram || '#'} target="_blank" rel="noopener noreferrer">
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </a>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}


