import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Shield, Ruler, Gem, Truck, Star, Paintbrush, Users, ChevronRight, Phone, Send, FileText, Briefcase, Factory, Ship, Globe2, TrendingUp, Building2, Handshake, Award, BadgeCheck, ScrollText, Quote, MapPin, Target } from 'lucide-react';
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
import imgQuality from '@/assets/quality-control.jpg';
import imgTransparency from '@/assets/transparency-handshake.jpg';
import imgTeamwork from '@/assets/teamwork.jpg';
import imgLeadership from '@/assets/leadership.jpg';

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
  Shield, Ruler, Gem, Truck, Star, Paintbrush, Users, FileText, Briefcase, Factory, Ship, Globe2, TrendingUp, Building2, Handshake, Award, BadgeCheck, ScrollText, Target,
};

// Animated counter that runs once when section enters viewport
function useCountUp(target: number, isVisible: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, isVisible, duration]);
  return value;
}

function StatCounter({ value, suffix = '+', label, isVisible, delay = 0 }: { value: number; suffix?: string; label: string; isVisible: boolean; delay?: number; }) {
  const n = useCountUp(value, isVisible);
  return (
    <div
      className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary leading-none mb-3 tabular-nums">
        {n}<span className="text-primary/70">{suffix}</span>
      </div>
      <div className="h-px w-10 bg-primary/40 mx-auto mb-4" />
      <div className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground font-medium">
        {label}
      </div>
    </div>
  );
}

export default function Index() {
  const { language } = useLanguage();
  useSEO({});
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(8);
  const { settings } = useSystemSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const contactPhone = settings?.contact_phone || '+998 90 123 45 67';

  const whyUsItems = [
    { key: 'whyus_1', num: '01', icon: 'Shield', image: imgQuality, titleFallback: 'SIFAT VA ISHONCH', descFallback: 'Biz har bir bosqichda yuqori xalqaro standartlarga rioya qilamiz. Xom ashyo tanlashdan to tayyor mahsulotni jo\'natishgacha.' },
    { key: 'whyus_2', num: '02', icon: 'Gem', image: imgTransparency, titleFallback: 'SHAFFOFLIK VA HALOLLIK', descFallback: 'Mijozlar bilan ochiq va halol munosabatlarni qadrlaymiz. Barcha narxlar, muddatlar va xarajatlar oldindan aniq.' },
    { key: 'whyus_3', num: '03', icon: 'Users', image: imgTeamwork, titleFallback: 'JAMOAVIY ISH', descFallback: 'Bizning kuchimiz — birlashgan professionallar jamoasida. Har biri natija uchun ishlaydi va o\'sib boradi.' },
    { key: 'whyus_4', num: '04', icon: 'Star', image: imgLeadership, titleFallback: 'YETAKCHILIK', descFallback: 'Biz yetakchilik madaniyatini qo\'llab-quvvatlaymiz. Har bir xodim mijozlar uchun eng yaxshi yechimga intiladi.' },
  ];

  const missionStats = [
    { key: 'stat_1', value: '15+', label: 'Yillik tajriba' },
    { key: 'stat_2', value: '20+', label: 'Eksport davlatlari' },
    { key: 'stat_3', value: '500+', label: 'Faol hamkorlar' },
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
    { key: 'trust_1', icon: Globe2, titleFallback: 'Xalqaro eksport', descFallback: "20+ mamlakatlarga ishonchli eksport faoliyati." },
    { key: 'trust_2', icon: BadgeCheck, titleFallback: 'Sifat nazorati', descFallback: 'Mahsulotlar eksport standartlari asosida tekshiriladi.' },
    { key: 'trust_3', icon: Ship, titleFallback: 'Logistika yechimlari', descFallback: 'FOB, CIF, FCA va DAP shartlari asosida global yetkazib berish.' },
    { key: 'trust_4', icon: Handshake, titleFallback: 'Strategik hamkorlik', descFallback: "Uzoq muddatli B2B hamkorlik va xalqaro biznes aloqalari." },
  ];

  const sectionServices = useInView();
  const sectionWhyUs = useInView();
  const sectionProcess = useInView();
  const sectionProducts = useInView();
  const sectionTestimonials = useInView();
  const sectionCta = useInView();
  const sectionStats = useInView(0.2);
  const sectionSectors = useInView();
  const sectionGlobal = useInView();
  const sectionStandards = useInView();
  const sectionChairman = useInView();

  const businessSectors = [
    { key: 'sector_1', icon: 'Ship', titleFallback: 'Eksport savdo', descFallback: "O'zbekiston mahsulotlarini Yevropa, MDH va Yaqin Sharqqa yetkazib berish. FOB, CIF, DAP shartlari." },
    { key: 'sector_2', icon: 'Factory', titleFallback: 'Ishlab chiqarish', descFallback: "Xalqaro standartlarga mos zamonaviy zavod va ishlab chiqarish quvvatlari." },
    { key: 'sector_3', icon: 'Truck', titleFallback: 'Logistika & ta\'minot', descFallback: "Quruqlik, dengiz va aviakargo orqali to'liq logistik zanjir va omborxona xizmatlari." },
    { key: 'sector_4', icon: 'TrendingUp', titleFallback: 'Investitsiya', descFallback: "Strategik investitsiya loyihalari va xalqaro hamkorlik ekotizimi." },
  ];

  const globalMarkets = [
    { key: 'mk_de', flag: '🇩🇪', name: 'Germaniya' },
    { key: 'mk_pl', flag: '🇵🇱', name: 'Polsha' },
    { key: 'mk_fr', flag: '🇫🇷', name: 'Fransiya' },
    { key: 'mk_ru', flag: '🇷🇺', name: 'Rossiya' },
    { key: 'mk_kz', flag: '🇰🇿', name: 'Qozog\'iston' },
    { key: 'mk_ae', flag: '🇦🇪', name: 'BAA' },
    { key: 'mk_sa', flag: '🇸🇦', name: 'Saudiya Arabistoni' },
    { key: 'mk_cn', flag: '🇨🇳', name: 'Xitoy' },
    { key: 'mk_tr', flag: '🇹🇷', name: 'Turkiya' },
    { key: 'mk_kg', flag: '🇰🇬', name: 'Qirg\'iziston' },
    { key: 'mk_tj', flag: '🇹🇯', name: 'Tojikiston' },
    { key: 'mk_by', flag: '🇧🇾', name: 'Belarus' },
  ];

  const standards = [
    { key: 'std_1', icon: 'BadgeCheck', titleFallback: 'ISO 9001:2015', descFallback: 'Sifat menejmenti tizimi xalqaro sertifikati.' },
    { key: 'std_2', icon: 'Shield', titleFallback: 'Sifat nazorati', descFallback: 'Har bir partiyada ko\'p bosqichli QC va lab testlari.' },
    { key: 'std_3', icon: 'ScrollText', titleFallback: 'Eksport hujjatlari', descFallback: 'CO, FSC, fitosanitar, EUR.1 va barcha zarur hujjatlar.' },
    { key: 'std_4', icon: 'Award', titleFallback: 'Compliance', descFallback: 'Xalqaro savdo qoidalari va sanksiyalarga to\'liq muvofiqlik.' },
    { key: 'std_5', icon: 'Target', titleFallback: 'Risk boshqaruvi', descFallback: 'Logistika, valyuta va kontragent risklarini boshqarish tizimi.' },
    { key: 'std_6', icon: 'Handshake', titleFallback: 'Kontrakt huquqi', descFallback: 'Incoterms 2020 va xalqaro tijorat huquqi standartlari.' },
  ];

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
              alt="NazirovSholding global operations"
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
                fallback="NAZIROVSHOLDING · INTERNATIONAL HOLDING"
                as="span"
                className="text-primary text-xs font-medium tracking-[0.3em] uppercase"
                section="hero"
              />
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-white leading-[1.05] mb-6">
              <EditableText
                contentKey="hero_title_line1"
                fallback="Global biznes"
                as="span"
                className="block font-serif"
                section="hero"
              />
              <EditableText
                contentKey="hero_title_line2"
                fallback="O'zbekistondan dunyoga"
                as="span"
                className="block font-serif text-primary italic"
                section="hero"
              />
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
              <EditableText
                contentKey="hero_subtitle"
                fallback="NazirovSholding — eksport, ishlab chiqarish, logistika, investitsiya va strategik hamkorlikni birlashtirgan xalqaro biznes holdingi. 20+ bozor, 500+ hamkor, 15+ yillik tajriba."
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

      {/* HOLDING RAQAMLARDA - animated stats */}
      <section ref={sectionStats.ref} className="py-20 md:py-28 bg-background relative overflow-hidden border-y border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 relative">
          <div className={`text-center mb-14 transition-all duration-700 ${sectionStats.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="w-10 h-px bg-primary" />
              <EditableText contentKey="stats_label" fallback="NAZIROVSHOLDING RAQAMLARDA" as="span" className="text-primary text-xs tracking-[0.4em] uppercase font-semibold" section="stats" />
              <span className="w-10 h-px bg-primary" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05]">
              <EditableText contentKey="stats_title_1" fallback="Faktlar so'zlardan" as="span" className="block" section="stats" />
              <EditableText contentKey="stats_title_2" fallback="ishonchliroq" as="span" className="block text-primary italic" section="stats" />
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6">
            <StatCounter value={20} suffix="+" label="Xalqaro bozor" isVisible={sectionStats.isVisible} delay={0} />
            <StatCounter value={500} suffix="+" label="Strategik hamkor" isVisible={sectionStats.isVisible} delay={120} />
            <StatCounter value={1000} suffix="+" label="Muvaffaqiyatli yetkazma" isVisible={sectionStats.isVisible} delay={240} />
            <StatCounter value={15} suffix="+" label="Yillik tajriba" isVisible={sectionStats.isVisible} delay={360} />
          </div>
        </div>
      </section>

      {/* BUSINESS SECTORS */}
      <section ref={sectionSectors.ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 relative">
          <div className={`mb-16 max-w-3xl transition-all duration-700 ${sectionSectors.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-primary" />
              <EditableText contentKey="sectors_label" fallback="BIZNES YO'NALISHLARIMIZ" as="span" className="text-primary text-xs tracking-[0.4em] uppercase font-semibold" section="sectors" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-6">
              <EditableText contentKey="sectors_title_1" fallback="Bir ekotizim," as="span" className="block" section="sectors" />
              <EditableText contentKey="sectors_title_2" fallback="cheksiz imkoniyatlar" as="span" className="block text-primary italic" section="sectors" />
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              <EditableText contentKey="sectors_intro" fallback="NazirovSholding International Holding Group to'rt asosiy yo'nalishni birlashtirgan: eksport, ishlab chiqarish, logistika va investitsiya. Bu — hamkorlar uchun yagona darvoza orqali to'liq B2B yechim." as="span" section="sectors" />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businessSectors.map((s, i) => {
              const IconComp = iconMap[s.icon] || Building2;
              return (
                <article
                  key={s.key}
                  className={`group relative overflow-hidden rounded-sm border border-primary/15 bg-gradient-to-br from-card/60 to-background p-8 md:p-10 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_60px_-20px_hsl(var(--primary)/0.45)] hover:-translate-y-1 ${sectionSectors.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                  <div className="relative flex items-start gap-5">
                    <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border border-primary/40 bg-primary/5 rounded-sm group-hover:bg-primary/15 transition-colors duration-500">
                      <IconComp className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-3 leading-tight">
                        <EditableText contentKey={`${s.key}_title`} fallback={s.titleFallback} as="span" section="sectors" />
                      </h3>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        <EditableText contentKey={`${s.key}_desc`} fallback={s.descFallback} as="span" section="sectors" />
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-primary via-primary/60 to-transparent group-hover:w-full transition-all duration-700" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* GLOBAL PRESENCE */}
      <section ref={sectionGlobal.ref} className="py-24 md:py-32 bg-secondary/40 relative overflow-hidden border-y border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)/0.06),transparent_50%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className={`lg:col-span-5 transition-all duration-700 ${sectionGlobal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-px bg-primary" />
                <EditableText contentKey="global_label" fallback="GLOBAL QAMROV" as="span" className="text-primary text-xs tracking-[0.4em] uppercase font-semibold" section="global" />
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-6">
                <EditableText contentKey="global_title_1" fallback="3 qit'a." as="span" className="block" section="global" />
                <EditableText contentKey="global_title_2" fallback="20+ davlat." as="span" className="block text-primary italic" section="global" />
                <EditableText contentKey="global_title_3" fallback="Bitta hamkor." as="span" className="block" section="global" />
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                <EditableText contentKey="global_intro" fallback="Yevropa Ittifoqi, MDH, Yaqin Sharq va Osiyo bozorlarida faol eksport va xalqaro hamkorlik. Har bir bozorda mahalliy hamkorlar va logistika tarmog'i." as="span" section="global" />
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Globe2 className="w-4 h-4 text-primary" /> 3 qit'a</div>
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4 text-primary" /> 20+ bozor</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Handshake className="w-4 h-4 text-primary" /> 500+ hamkor</div>
              </div>
            </div>

            <div className={`lg:col-span-7 transition-all duration-700 ${sectionGlobal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '200ms' }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {globalMarkets.map((m, i) => (
                  <div
                    key={m.key}
                    className={`group flex items-center gap-3 px-4 py-3.5 border border-primary/15 bg-card/50 backdrop-blur-sm rounded-sm hover:border-primary/50 hover:bg-card transition-all duration-500 ${sectionGlobal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    style={{ transitionDelay: `${300 + i * 50}ms` }}
                  >
                    <span className="text-2xl leading-none">{m.flag}</span>
                    <span className="text-foreground/90 text-sm font-medium tracking-wide">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* WHY US - Quality grid + Mission panel (Noir & Gold premium) */}
      <section ref={sectionWhyUs.ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
        {/* decorative ambient lights */}
        <div className="absolute -top-40 right-0 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 relative">
          {/* Section header */}
          <div className={`mb-16 md:mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 transition-all duration-700 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-px bg-primary" />
                <EditableText
                  contentKey="whyus_label"
                  fallback="BIZNING USTUVORLIKLAR"
                  as="span"
                  className="text-primary text-xs tracking-[0.4em] uppercase font-semibold"
                  section="whyus"
                />
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-foreground leading-[1.05]">
                <EditableText contentKey="whyus_title_line1" fallback="Sifat va stil" as="span" className="block" section="whyus" />
                <EditableText contentKey="whyus_title_line2" fallback="har bir tafsilotda" as="span" className="block text-primary italic" section="whyus" />
              </h2>
            </div>
            <p className="text-muted-foreground text-base max-w-md leading-relaxed">
              <EditableText
                contentKey="whyus_intro"
                fallback="NazirovSholding — xalqaro biznesda sifat, ishonch va global standartlarga sodiqlikka asoslangan to'rt ustun."
                as="span"
                section="whyus"
              />
            </p>
          </div>

          {/* Grid: 4 cards + sticky mission panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* 4 cards in 2x2 */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {whyUsItems.map((item, i) => {
                const IconComp = iconMap[item.icon] || Shield;
                return (
                  <article
                    key={item.key}
                    className={`group relative flex flex-col overflow-hidden rounded-sm border border-primary/10 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_50px_-15px_hsl(var(--primary)/0.4)] hover:-translate-y-1 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${i * 120}ms` }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.titleFallback}
                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                      {/* Number badge */}
                      <span className="absolute top-4 left-4 font-serif text-3xl text-primary/80 font-normal tracking-wider">
                        {item.num}
                      </span>
                      {/* Icon badge */}
                      <div className="absolute bottom-4 right-4 w-11 h-11 flex items-center justify-center border border-primary/40 bg-background/70 backdrop-blur-md rounded-sm">
                        <IconComp className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col p-6 pt-5">
                      <h3 className="font-sans text-[11px] tracking-[0.25em] text-primary font-semibold mb-3">
                        <EditableText contentKey={`${item.key}_title`} fallback={item.titleFallback} as="span" section="whyus" />
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                        <EditableText contentKey={`${item.key}_desc`} fallback={item.descFallback} as="span" section="whyus" />
                      </p>
                      {/* Gold hairline indicator */}
                      <div className="mt-6 h-px w-12 bg-primary/40 group-hover:w-full transition-all duration-700" />
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Mission panel */}
            <aside
              className={`lg:col-span-4 transition-all duration-700 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: '500ms' }}
            >
              <div className="lg:sticky lg:top-28 relative p-8 md:p-10 rounded-sm border border-primary/20 bg-gradient-to-br from-card/60 to-background overflow-hidden">
                {/* Corner gold accents */}
                <div className="absolute top-0 left-0 w-12 h-px bg-primary" />
                <div className="absolute top-0 left-0 w-px h-12 bg-primary" />
                <div className="absolute bottom-0 right-0 w-12 h-px bg-primary" />
                <div className="absolute bottom-0 right-0 w-px h-12 bg-primary" />

                <div className="flex items-center gap-3 mb-2">
                  <Gem className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <EditableText
                    contentKey="mission_label"
                    fallback="BIZNING MISSIYAMIZ"
                    as="span"
                    className="text-primary text-[11px] tracking-[0.3em] uppercase font-semibold"
                    section="whyus"
                  />
                </div>

                <h3 className="font-serif text-3xl md:text-4xl text-foreground leading-tight mb-6">
                  <EditableText
                    contentKey="mission_title"
                    fallback="O'zbekistondan dunyoga"
                    as="span"
                    className="block"
                    section="whyus"
                  />
                  <EditableText
                    contentKey="mission_title_2"
                    fallback="ishonch bilan"
                    as="span"
                    className="block text-primary italic"
                    section="whyus"
                  />
                </h3>

                <p className="text-muted-foreground text-base leading-relaxed mb-6">
                  <EditableText
                    contentKey="mission_desc_1"
                    fallback="O'zbekistonning eng yaxshi mahsulotlarini xalqaro bozorga olib chiqish — bizning asosiy maqsadimiz. Har bir mijoz va sherik uchun ishonchli yetkazib beruvchi bo'lish."
                    as="span"
                    section="whyus"
                  />
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 py-6 border-y border-primary/15 mb-6">
                  {missionStats.map((s) => (
                    <div key={s.key} className="text-center">
                      <div className="font-serif text-2xl md:text-3xl text-primary mb-1">
                        <EditableText contentKey={`${s.key}_value`} fallback={s.value} as="span" section="whyus" />
                      </div>
                      <div className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/80 font-medium">
                        <EditableText contentKey={`${s.key}_label`} fallback={s.label} as="span" section="whyus" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  asChild
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm tracking-wider text-xs uppercase h-12 group"
                >
                  <Link to="/about">
                    <EditableText contentKey="mission_cta" fallback="Biz haqimizda batafsil" as="span" section="whyus" />
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* GLOBAL EXPORT PROCESS — Luxury Noir & Gold */}
      <section
        ref={sectionProcess.ref}
        className="relative overflow-hidden py-24 md:py-36"
        style={{ backgroundColor: '#0D0D0D' }}
      >
        {/* Subtle luxury texture + radial gold glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(201,164,106,0.10), rgba(201,164,106,0.04) 40%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(201,164,106,0.4), transparent)',
          }}
        />

        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
          {/* Header */}
          <div
            className={`mx-auto mb-20 max-w-[820px] text-center transition-all duration-[900ms] ${
              sectionProcess.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="mb-7 flex items-center justify-center gap-4">
              <span className="h-px w-10" style={{ background: 'rgba(201,164,106,0.5)' }} />
              <span
                className="text-[11px] font-semibold uppercase"
                style={{ color: '#C9A469', letterSpacing: '0.3em' }}
              >
                <EditableText
                  contentKey="process_label"
                  fallback="GLOBAL EXPORT PROCESS"
                  as="span"
                  section="process"
                />
              </span>
              <span className="h-px w-10" style={{ background: 'rgba(201,164,106,0.5)' }} />
            </div>

            <h2
              className="font-serif font-semibold leading-[1.05] tracking-[-0.01em] text-[36px] md:text-[48px] lg:text-[56px]"
              style={{ color: '#F6F2EA' }}
            >
              <EditableText
                contentKey="process_title"
                fallback="Xalqaro hamkorlik jarayoni"
                as="span"
                section="process"
              />
            </h2>

            <p
              className="mx-auto mt-6 text-[17px] leading-[1.7]"
              style={{ color: 'rgba(246,242,234,0.8)', maxWidth: '700px' }}
            >
              <EditableText
                contentKey="process_subtitle"
                fallback="NazirovSholding xalqaro hamkorlari uchun eksport, logistika va yetkazib berish jarayonlarini professional va shaffof tarzda boshqaradi."
                as="span"
                section="process"
              />
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {steps.map((step, i) => {
              const IconComp = iconMap[step.icon] || FileText;
              return (
                <div
                  key={step.key}
                  className={`group relative transition-all ease-out ${
                    sectionProcess.isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{
                    transitionDuration: '800ms',
                    transitionDelay: `${i * 150}ms`,
                  }}
                >
                  {/* Glow halo */}
                  <div
                    className="pointer-events-none absolute -inset-4 rounded-[28px] opacity-0 blur-2xl transition-opacity duration-[350ms] ease-out group-hover:opacity-100"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(201,164,106,0.18), transparent 70%)',
                    }}
                  />

                  <div
                    className="relative h-full overflow-hidden rounded-[24px] p-10 backdrop-blur-[12px] transition-all duration-[350ms] ease-out group-hover:-translate-y-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(201,164,106,0.15)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    }}
                  >
                    {/* Hover border + shadow overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-[350ms] ease-out group-hover:opacity-100"
                      style={{
                        border: '1px solid rgba(201,164,106,0.55)',
                        boxShadow:
                          '0 30px 80px rgba(0,0,0,0.45), 0 0 60px -10px rgba(201,164,106,0.25)',
                      }}
                    />

                    {/* Number watermark */}
                    <span
                      className="pointer-events-none absolute right-6 top-4 select-none font-serif transition-all duration-[350ms] ease-out"
                      style={{
                        fontSize: '72px',
                        fontWeight: 700,
                        lineHeight: 1,
                        color: 'rgba(201,164,106,0.15)',
                      }}
                    >
                      <span className="block transition-colors duration-[350ms] ease-out group-hover:[color:#C9A469]">
                        {step.num}
                      </span>
                    </span>

                    {/* Icon */}
                    <div
                      className="relative mb-8 flex h-14 w-14 items-center justify-center rounded-[14px] transition-all duration-[350ms] ease-out group-hover:rotate-[6deg]"
                      style={{
                        border: '1px solid rgba(201,164,106,0.4)',
                        backgroundColor: 'rgba(201,164,106,0.04)',
                      }}
                    >
                      <IconComp size={28} strokeWidth={1.4} style={{ color: '#C9A469' }} />
                      <div
                        className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 blur-md transition-opacity duration-[350ms] ease-out group-hover:opacity-100"
                        style={{ background: 'rgba(201,164,106,0.35)' }}
                      />
                    </div>

                    {/* Gold divider */}
                    <div
                      className="mb-6 h-px w-12 transition-all duration-[350ms] ease-out group-hover:w-20"
                      style={{ background: 'rgba(201,164,106,0.4)' }}
                    />

                    <h3
                      className="font-serif leading-tight"
                      style={{ color: '#F6F2EA', fontSize: '32px', fontWeight: 500 }}
                    >
                      <EditableText
                        contentKey={`${step.key}_title`}
                        fallback={step.titleFallback}
                        as="span"
                        section="process"
                      />
                    </h3>

                    <p
                      className="relative mt-4"
                      style={{
                        color: 'rgba(246,242,234,0.75)',
                        fontSize: '17px',
                        lineHeight: 1.8,
                      }}
                    >
                      <EditableText
                        contentKey={`${step.key}_desc`}
                        fallback={step.descFallback}
                        as="span"
                        section="process"
                      />
                    </p>

                    {/* Bottom gold accent line */}
                    <div
                      className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-[700ms] ease-out group-hover:w-full"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(201,164,106,0.9), rgba(201,164,106,0))',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(201,164,106,0.25), transparent)',
          }}
        />
      </section>

      {/* CORPORATE STANDARDS */}
      <section ref={sectionStandards.ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.05),transparent_60%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 relative">
          <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-700 ${sectionStandards.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="w-10 h-px bg-primary" />
              <EditableText contentKey="std_label" fallback="KORPORATIV STANDARTLAR" as="span" className="text-primary text-xs tracking-[0.4em] uppercase font-semibold" section="standards" />
              <span className="w-10 h-px bg-primary" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-5">
              <EditableText contentKey="std_title_1" fallback="Xalqaro daraja —" as="span" className="block" section="standards" />
              <EditableText contentKey="std_title_2" fallback="har bir bosqichda" as="span" className="block text-primary italic" section="standards" />
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              <EditableText contentKey="std_intro" fallback="Sifat, shaffoflik va xalqaro savdo qoidalariga to'liq muvofiqlik — bizning B2B hamkorligimizning poydevori." as="span" section="standards" />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {standards.map((st, i) => {
              const IconComp = iconMap[st.icon] || BadgeCheck;
              return (
                <div
                  key={st.key}
                  className={`group relative p-7 border border-primary/15 rounded-sm bg-card/40 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:bg-card/70 hover:-translate-y-1 ${sectionStandards.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 flex items-center justify-center border border-primary/40 bg-primary/5 rounded-sm group-hover:bg-primary/15 transition-colors">
                      <IconComp className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-xl text-foreground leading-tight">
                      <EditableText contentKey={`${st.key}_title`} fallback={st.titleFallback} as="span" section="standards" />
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <EditableText contentKey={`${st.key}_desc`} fallback={st.descFallback} as="span" section="standards" />
                  </p>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-700" />
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


      {/* CHAIRMAN MESSAGE / FOUNDER STORY */}
      <section ref={sectionChairman.ref} className="py-24 md:py-32 bg-secondary/40 relative overflow-hidden border-y border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className={`lg:col-span-5 transition-all duration-700 ${sectionChairman.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden border border-primary/20">
                <img src={imgLeadership} alt="Chairman" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-primary text-[11px] tracking-[0.3em] uppercase font-semibold mb-2">
                    <EditableText contentKey="chairman_role" fallback="RAIS / TA'SISCHI" as="span" section="chairman" />
                  </div>
                  <div className="font-serif text-2xl md:text-3xl text-white leading-tight">
                    <EditableText contentKey="chairman_name" fallback="NazirovSholding International Holding Group" as="span" section="chairman" />
                  </div>
                </div>
              </div>
            </div>

            <div className={`lg:col-span-7 transition-all duration-700 ${sectionChairman.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '150ms' }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-px bg-primary" />
                <EditableText contentKey="chairman_label" fallback="RAHBAR SO'ZI" as="span" className="text-primary text-xs tracking-[0.4em] uppercase font-semibold" section="chairman" />
              </div>
              <Quote className="w-12 h-12 text-primary/30 mb-4" strokeWidth={1.2} />
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.15] mb-8">
                <EditableText contentKey="chairman_quote_1" fallback={'\u201CBizning vazifamiz — O\u2019zbekiston sifatini'} as="span" className="block" section="chairman" />
                <EditableText contentKey="chairman_quote_2" fallback={'dunyo bozoriga olib chiqish.\u201D'} as="span" className="block text-primary italic" section="chairman" />
              </h2>
              <div className="space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                <p>
                  <EditableText contentKey="chairman_p1" fallback="NazirovSholding — 15 yildan ortiq tajriba va xalqaro hamkorlik asosida shakllangan diversifikatsiyalashgan biznes ekotizim. Biz O'zbekistonni global savdo xaritasida munosib o'rinda ko'rishni o'z strategik vazifamiz deb bilamiz." as="span" section="chairman" />
                </p>
                <p>
                  <EditableText contentKey="chairman_p2" fallback="Har bir hamkor uchun shaffoflik, sifat va o'z vaqtida bajarish — bizning yagona standartimiz. Bu — bizning brendimizning poydevori." as="span" section="chairman" />
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-8 tracking-wider text-sm uppercase h-13">
                  <Link to="/about"><EditableText contentKey="chairman_cta_1" fallback="Biz haqimizda" as="span" section="chairman" /><ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary/40 text-foreground hover:bg-primary/10 hover:text-foreground rounded-sm px-8 tracking-wider text-sm uppercase h-13 bg-transparent">
                  <Link to="/contact"><EditableText contentKey="chairman_cta_2" fallback="Hamkorlik so'rovi" as="span" section="chairman" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* PARTNERSHIP CTA - editable */}
      <section ref={sectionCta.ref} className="py-24 md:py-32 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-primary/60" />
        <div className={`max-w-4xl mx-auto px-4 lg:px-8 relative z-10 text-center transition-all duration-700 ${sectionCta.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-10 h-px bg-primary" />
            <EditableText contentKey="cta_label" fallback="HAMKORLIK SO'ROVI" as="span" className="text-primary text-xs tracking-[0.4em] uppercase font-semibold" section="cta" />
            <span className="w-10 h-px bg-primary" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-[1.05]">
            <EditableText contentKey="cta_title_1" fallback="Global hamkorlik" as="span" className="block" section="cta" />
            <EditableText contentKey="cta_title_2" fallback="bir qadam narida" as="span" className="block text-primary italic" section="cta" />
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            <EditableText contentKey="cta_subtitle" fallback="Eksport, distributsiya, ishlab chiqarish yoki investitsiya — qaysi yo'nalishda hamkorlik qilishingizdan qat'iy nazar, jamoamiz 24 soat ichida bog'lanadi." as="span" section="cta" />
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-10 tracking-wider text-sm uppercase h-14 group">
              <Link to="/contact">
                <Handshake className="w-4 h-4 mr-2" />
                <EditableText contentKey="cta_btn_1" fallback="Hamkorlik so'rovi" as="span" section="cta" />
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 text-foreground hover:bg-primary/10 hover:text-foreground rounded-sm px-10 tracking-wider text-sm uppercase h-14 bg-transparent">
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`}>
                <Phone className="w-4 h-4 mr-2" />
                {contactPhone}
              </a>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs tracking-[0.2em] uppercase text-muted-foreground/80">
            <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary" /> ISO 9001</span>
            <span className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-primary" /> 20+ Bozor</span>
            <span className="flex items-center gap-2"><Handshake className="w-4 h-4 text-primary" /> 500+ Hamkor</span>
            <span className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> 15+ Yil</span>
          </div>
        </div>
      </section>


    </div>
  );
}


