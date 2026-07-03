import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useLanguages } from '@/hooks/useLanguages';
import { useSystemSettings } from '@/hooks/useSystemSettings';

const navLinks = [
  { href: '/about', label: 'Haqimizda', num: '01' },
  { href: '/sectors', label: "Yo'nalishlar", num: '02' },
  { href: '/international', label: 'Bozorlar', num: '03' },
  { href: '/projects', label: 'Loyihalar', num: '04' },
  { href: '/contact', label: 'Aloqa', num: '05' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { languages } = useLanguages();
  const location = useLocation();
  const { settings } = useSystemSettings();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const isActive = (path: string) => location.pathname === path;
  const contactPhone = settings?.contact_phone || '+998 90 123 45 67';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-card ${
          scrolled
            ? 'border-b border-border shadow-[0_2px_20px_-10px_hsl(var(--secondary)/0.15)] py-3'
            : 'border-b border-border/60 py-5'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center group shrink-0">
              <div className="flex flex-col leading-none">
                <span
                  className="font-serif text-[20px] md:text-[22px] tracking-[0.22em] text-foreground font-normal"
                >
                  NAZIROV<span className="text-primary font-semibold">SHOLDING</span>
                </span>
                <span className="hidden md:block text-[9px] tracking-[0.45em] text-foreground/60 uppercase mt-1 font-medium">
                  International Holding Group
                </span>
              </div>
            </Link>



            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group relative px-4 py-2"
                  >
                    <span
                      className={`text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 ${
                        active ? 'text-primary' : 'text-foreground group-hover:text-primary'
                      }`}
                    >

                      {link.label}
                    </span>

                    <span
                      className={`pointer-events-none absolute left-4 right-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent transition-all duration-500 ${
                        active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-3 md:gap-5 shrink-0">
              <div className="hidden md:flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase">
                {languages.map((lang, i) => (
                  <Fragment key={lang.code}>
                    {i > 0 && <span className="text-foreground/30">/</span>}
                    <button
                      onClick={() => setLanguage(lang.code)}
                      className={`font-semibold transition-colors ${language === lang.code ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}
                    >{lang.code.toUpperCase()}</button>
                  </Fragment>
                ))}
              </div>

              <Link
                to="/contact"
                className="hidden md:inline-flex items-center gap-2 group relative overflow-hidden bg-primary hover:bg-[hsl(var(--primary)/0.92)] text-primary-foreground transition-all duration-300 px-5 py-2.5 text-[10px] font-semibold tracking-[0.25em] uppercase rounded-md shadow-[0_4px_16px_-6px_hsl(var(--primary)/0.5)] hover:shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.6)]"
              >
                <span className="relative">Hamkorlik Boshlash</span>
                <ArrowUpRight className="relative w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-45" />
              </Link>

              <button
                onClick={() => setIsOpen(true)}
                className="xl:hidden flex flex-col items-end gap-1.5 p-2 group"
                aria-label="Open menu"
              >
                <span className="w-7 h-px bg-secondary transition-all group-hover:bg-primary" />
                <span className="w-5 h-px bg-secondary transition-all group-hover:bg-primary group-hover:w-7" />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className={scrolled ? 'h-[64px]' : 'h-[80px]'} aria-hidden />

      {/* Fullscreen Mobile Menu */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-700 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.15), transparent 50%), radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.08), transparent 50%)',
          }}
        />

        <div className="relative h-full flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 lg:px-10 py-5 border-b border-foreground/5">
            <span
              className="font-serif text-xl tracking-[0.22em] text-foreground font-serif"
            >
              NAZIROV<span className="text-primary">SHOLDING</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-foreground/70 hover:text-primary transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-5 lg:px-10 py-8">
            <div className="max-w-3xl mx-auto">
              <p className="text-[10px] tracking-[0.5em] uppercase text-primary/70 mb-8">
                Menyu — Navigation
              </p>
              <ul className="space-y-1">
                {navLinks.map((link, idx) => {
                  const active = isActive(link.href);
                  return (
                    <li
                      key={link.href}
                      className="border-b border-foreground/5"
                      style={{
                        transitionDelay: `${idx * 60}ms`,
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className="group flex items-center justify-between py-5 md:py-6"
                      >
                        <div className="flex items-baseline gap-5">
                          <span className="text-[10px] tracking-[0.3em] text-primary/60">{link.num}</span>
                          <span
                            className={`font-serif text-3xl md:text-5xl font-light tracking-tight transition-colors duration-300 ${
                              active ? 'text-primary' : 'text-foreground group-hover:text-primary'
                            }`}

                          >
                            {link.label}
                          </span>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-foreground/30 group-hover:text-primary group-hover:rotate-45 transition-all duration-500" />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <div className="mt-12">
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-3 bg-primary hover:bg-[hsl(var(--primary)/0.85)] text-primary-foreground px-8 py-4 text-xs font-semibold tracking-[0.3em] uppercase transition-colors"
                >
                  So'rov Yuborish
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Contact strip */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-foreground/5">
                <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-foreground/60 hover:text-primary transition-colors text-sm">
                  <Phone className="w-4 h-4 text-primary" /> {contactPhone}
                </a>
                <a href="mailto:info@nazirovsholding.uz" className="flex items-center gap-3 text-foreground/60 hover:text-primary transition-colors text-sm">
                  <Mail className="w-4 h-4 text-primary" /> info@nazirovsholding.uz
                </a>
                <div className="flex items-center gap-3 text-foreground/60 text-sm">
                  <MapPin className="w-4 h-4 text-primary" /> Tashkent, Uzbekistan
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase">
                {languages.map((lang, i) => (
                  <Fragment key={lang.code}>
                    {i > 0 && <span className="text-foreground/20">/</span>}
                    <button
                      onClick={() => setLanguage(lang.code)}
                      className={`transition-colors ${language === lang.code ? 'text-primary' : 'text-foreground/40'}`}
                    >{lang.code.toUpperCase()}</button>
                  </Fragment>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
