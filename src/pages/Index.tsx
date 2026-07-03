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
import { InteractiveEarthSection } from '@/components/InteractiveEarth';
import PartnersMarquee from '@/components/PartnersMarquee';


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

  const sectionServices = useInView();
  const sectionWhyUs = useInView();
  const sectionProcess = useInView();
  const sectionProducts = useInView();
  const sectionTestimonials = useInView();
  const sectionCta = useInView();
  const sectionStats = useInView(0.2);
  const sectionSectors = useInView();
  
  const sectionStandards = useInView();
  const sectionChairman = useInView();

  const businessSectors = [
    { key: 'sector_1', icon: 'Ship', titleFallback: 'Eksport savdo', descFallback: "O'zbekiston mahsulotlarini Yevropa, MDH va Yaqin Sharqqa yetkazib berish. FOB, CIF, DAP shartlari." },
    { key: 'sector_2', icon: 'Factory', titleFallback: 'Ishlab chiqarish', descFallback: "Xalqaro standartlarga mos zamonaviy zavod va ishlab chiqarish quvvatlari." },
    { key: 'sector_3', icon: 'Truck', titleFallback: 'Logistika & ta\'minot', descFallback: "Quruqlik, dengiz va aviakargo orqali to'liq logistik zanjir va omborxona xizmatlari." },
    { key: 'sector_4', icon: 'TrendingUp', titleFallback: 'Investitsiya', descFallback: "Strategik investitsiya loyihalari va xalqaro hamkorlik ekotizimi." },
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
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ${i === heroSlide ? 'opacity-100 scale-105 z-10' : 'opacity-0 scale-100 z-0'} transition-transform`}
            >
              <EditableImage
                contentKey={`hero_slide_${i + 1}`}
                fallbackSrc={src}
                alt={`NazirovSholding hero ${i + 1}`}
                section="hero"
                wrapperClassName="absolute inset-0 w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20 z-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-20 pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20 pointer-events-none">
          <div className="max-w-2xl [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_[data-editable]]:pointer-events-auto">
            <div className="inline-flex items-center mb-7 px-4 py-2 border border-primary/50 rounded-full bg-white/10 backdrop-blur-sm animate-fade-in">
              <EditableText
                contentKey="hero_badge"
                fallback="NAZIROVSHOLDING • INTERNATIONAL HOLDING GROUP"
                as="span"
                className="text-white text-[10.5px] md:text-xs font-medium tracking-[0.32em] uppercase"
                section="hero"
              />
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-normal leading-[1.04] mb-7 animate-fade-in drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              <EditableText
                contentKey="hero_title_line1"
                fallback="Global biznes"
                as="span"
                className="block font-serif text-white"
                section="hero"
              />
              <EditableText
                contentKey="hero_title_line2"
                fallback="O'zbekistondan"
                as="span"
                className="block font-serif text-white"
                section="hero"
              />
              <EditableText
                contentKey="hero_title_line3"
                fallback="dunyoga"
                as="span"
                className="block font-serif text-accent italic"
                section="hero"
              />
            </h1>
            <p className="mb-10 leading-[1.8] text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]" style={{ maxWidth: '650px' }}>
              <EditableText
                contentKey="hero_subtitle"
                fallback="NazirovSholding — O'zbekistondan xalqaro bozorlarga mahsulot eksport qiluvchi biznes guruhi. Biz oziq-ovqat, xomashyo va sanoat mahsulotlarini sifat nazorati, logistika va ishonchli hamkorlik asosida dunyo bozorlariga yetkazib beramiz."
                as="span"
                className="text-base md:text-lg"
                section="hero"
                multiline
              />
            </p>
            <div className="flex flex-wrap gap-4 mb-14">
              <Button asChild size="lg" className="group bg-primary text-primary-foreground hover:bg-[hsl(var(--primary)/0.85)] rounded-sm px-8 tracking-[0.18em] text-xs uppercase h-14 font-semibold shadow-[0_0_0_hsl(var(--primary) / 0)] hover:shadow-[0_14px_40px_-12px_hsl(var(--primary) / 0.55)] hover:-translate-y-0.5 transition-all duration-300">
                <Link to="/catalog">
                  <EditableText contentKey="hero_cta_primary" fallback={language === 'ru' ? 'Смотреть каталог' : "MAHSULOTLARNI KO'RISH"} as="span" section="hero" />
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border border-white/50 bg-transparent text-white hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-sm px-8 tracking-[0.18em] text-xs uppercase h-14 font-semibold transition-all duration-300">
                <Link to="/contact">
                  <EditableText contentKey="hero_cta_secondary" fallback={language === 'ru' ? 'Начать сотрудничество' : "HAMKORLIK BOSHLASH"} as="span" section="hero" />
                </Link>
              </Button>
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
              className={`h-1 transition-all duration-500 ${i === heroSlide ? 'w-12 bg-primary' : 'w-6 bg-foreground/30 hover:bg-foreground/50'}`}
            />
          ))}
        </div>
      </section>

      {/* BIZ HAQIMIZDA */}
      <section className="relative py-24 md:py-32 bg-background text-foreground border-b border-foreground/5 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 30%, hsl(var(--primary) / 0.14), transparent 60%)' }}
        />
        <div className="relative max-w-[1320px] mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-px bg-primary" />
              <EditableText
                contentKey="home_about_eyebrow"
                fallback="BIZ HAQIMIZDA"
                as="span"
                className="text-primary text-[11px] tracking-[0.4em] uppercase font-semibold"
                section="home-about"
              />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-8">
              <EditableText
                contentKey="home_about_title_1"
                fallback="O'zbekistondan"
                as="span"
                className="block text-foreground"
                section="home-about"
              />
              <EditableText
                contentKey="home_about_title_2"
                fallback="global bozorlarga"
                as="span"
                className="block text-primary italic"
                section="home-about"
              />
            </h2>
            <EditableText
              contentKey="home_about_desc"
              fallback="NazirovSholding International Holding Group — eksport, ishlab chiqarish, logistika va strategik investitsiya yo'nalishlarida faoliyat yurituvchi diversifikatsiyalashgan xalqaro holding. O'n yildan ortiq tajriba, 25+ hamkor mamlakat va 8 strategik sohani yagona qiymat zanjirida birlashtiramiz."
              as="p"
              multiline
              className="text-foreground/65 leading-[1.85] text-base md:text-lg mb-10 block max-w-xl"
              section="home-about"
            />

            <div className="grid grid-cols-3 gap-px bg-foreground/5 mb-10 max-w-xl">
              {[
                { k: 'exp', v: '12+', l: 'Yillik tajriba' },
                { k: 'cnt', v: '25', l: 'Hamkor davlat' },
                { k: 'sec', v: '8', l: 'Yo\'nalish' },
              ].map((s) => (
                <div key={s.k} className="bg-background p-6">
                  <EditableText
                    contentKey={`home_about_stat_${s.k}_v`}
                    fallback={s.v}
                    as="div"
                    className="font-serif text-3xl md:text-4xl text-primary mb-2 block"
                    section="home-about"
                  />
                  <EditableText
                    contentKey={`home_about_stat_${s.k}_l`}
                    fallback={s.l}
                    as="p"
                    className="text-[10px] tracking-[0.25em] uppercase text-foreground/50"
                    section="home-about"
                  />
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="group inline-flex items-center gap-3 bg-primary hover:bg-[hsl(var(--primary)/0.85)] text-primary-foreground px-8 h-14 text-xs font-semibold tracking-[0.22em] uppercase transition-all duration-300 hover:-translate-y-0.5"
            >
              <EditableText
                contentKey="home_about_cta"
                fallback="Batafsil ma'lumot"
                as="span"
                section="home-about"
              />
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 border border-primary/20 rounded-sm pointer-events-none" />
            <EditableImage
              contentKey="home_about_image"
              fallbackSrc={imgLeadership}
              alt="NazirovSholding"
              className="relative w-full h-[460px] md:h-[560px] object-cover rounded-sm"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-background/85 backdrop-blur-sm border border-primary/25 p-6">
              <EditableText
                contentKey="home_about_quote"
                fallback="“Biz O'zbekiston brendini global savdoda professional, ishonchli va uzoq muddatli sherik sifatida shakllantiramiz.”"
                as="p"
                multiline
                className="font-serif italic text-foreground text-base md:text-lg leading-relaxed block"
                section="home-about"
              />
            </div>
          </div>
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

      {/* PARTNERS — Infinite logo marquee */}
      <PartnersMarquee />


      {/* GLOBAL PRESENCE — Interactive Earth */}
      <InteractiveEarthSection />




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
                    className={`group relative flex flex-col overflow-hidden rounded-sm border border-primary/10 bg-gradient-to-b from-card/80 to-card/40 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_50px_-15px_hsl(var(--primary)/0.4)] hover:-translate-y-1 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
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
                      {/* Number badge */}
                      <span className="absolute top-4 left-4 font-serif text-3xl text-primary/80 font-normal tracking-wider">
                        {item.num}
                      </span>
                      {/* Icon badge */}
                      <div className="absolute bottom-4 right-4 w-11 h-11 flex items-center justify-center border border-primary/40 bg-background/90 rounded-sm">
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


