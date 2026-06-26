import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Send, Instagram, Youtube, ArrowUpRight, MapPin } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { EditableText } from '@/components/EditableText';
import { toast } from 'sonner';

export function Footer() {
  const { language } = useLanguage();
  const { settings, getAddress } = useSystemSettings();
  const [email, setEmail] = useState('');

  const phone = settings?.contact_phone || '+998 90 123 45 67';
  const emailAddr = 'info@nazirovsholding.com';
  const address = getAddress(language) || 'Tashkent, Uzbekistan';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Murojaatingiz uchun rahmat. Tez orada bog\'lanamiz.');
    setEmail('');
  };

  const navLinks = [
    { key: 'home', label: 'Bosh sahifa', to: '/' },
    { key: 'about', label: 'Haqimizda', to: '/about' },
    { key: 'sectors', label: "Yo'nalishlar", to: '/sectors' },
    { key: 'markets', label: 'Bozorlar', to: '/international' },
    { key: 'projects', label: 'Loyihalar', to: '/projects' },
    { key: 'contact', label: 'Aloqa', to: '/contact' },
  ];

  const sectors = [
    "Yog' mahsulotlari",
    'Qandolat mahsulotlari',
    "Xo'l mevalar",
    'Mis va metall',
    'Korbamit (karbamid)',
    'Xalqaro eksport',
    'Logistika yechimlari',
  ];

  const socials = [
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Send, label: 'Telegram', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' },
  ];

  return (
    <footer className="bg-[#0D0D0D] text-[#F6F2EA]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-20 pb-10">
        {/* CTA Block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pb-16 border-b border-[#C9A469]/[0.12]">
          <div>
            <EditableText
              contentKey="footer.cta.eyebrow"
              fallback="Hamkorlik"
              section="footer-cta"
              className="text-[10px] tracking-[0.5em] uppercase text-[#C9A469] mb-6 block"
            />
            <EditableText
              as="h3"
              contentKey="footer.cta.title"
              fallback="Keling, global hamkorlikni birgalikda quramiz"
              section="footer-cta"
              className="font-serif text-3xl md:text-5xl leading-[1.1] text-[#F6F2EA] max-w-xl"
            />
            <EditableText
              as="p"
              multiline
              contentKey="footer.cta.desc"
              fallback="NazirovSholding O'zbekistondan premium mahsulotlarni xalqaro bozorlarga ishonchli logistika va strategik hamkorliklar orqali eksport qiladi."
              section="footer-cta"
              className="mt-6 text-[15px] leading-relaxed text-[#F6F2EA]/70 max-w-lg"
            />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col justify-center">
            <label className="text-[10px] tracking-[0.4em] uppercase text-[#F6F2EA]/50 mb-4">
              Biznes so'rovi
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-3 border-b border-[#C9A469]/30 pb-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@company.com"
                className="flex-1 bg-transparent outline-none text-[#F6F2EA] placeholder:text-[#F6F2EA]/30 py-3 text-base"
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-3 px-7 py-3 bg-[#C9A469] text-[#0D0D0D] text-[11px] tracking-[0.3em] uppercase font-medium hover:bg-[#d4b274] hover:shadow-[0_0_30px_rgba(201,164,105,0.4)] transition-all duration-500"
              >
                <EditableText contentKey="footer.cta.button" fallback="Hamkorlikni boshlash" section="footer-cta" />
                <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              </button>
            </div>
          </form>
        </div>

        {/* Four Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 py-16">
          {/* Column 1 — Brand */}
          <div>
            <Link to="/" className="flex flex-col leading-none">
              <span
                className="font-serif text-[22px] tracking-[0.22em] text-[#F6F2EA] font-light"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                NAZIROV<span className="text-[#C9A469] font-normal">SHOLDING</span>
              </span>
              <span className="text-[9px] tracking-[0.45em] text-[#F6F2EA]/40 uppercase mt-1">
                International Holding Group
              </span>
            </Link>
            <EditableText
              as="p"
              multiline
              contentKey="footer.brand.desc"
              fallback="NazirovSholding — eksport, ishlab chiqarish, logistika va strategik biznes hamkorliklariga ixtisoslashgan xalqaro holding kompaniyasi."
              section="footer-brand"
              className="mt-6 text-sm leading-relaxed text-[#F6F2EA]/70"
            />
            <div className="flex items-center gap-4 mt-8">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[#C9A469]/20 text-[#F6F2EA]/70 hover:text-[#C9A469] hover:border-[#C9A469] hover:scale-110 hover:shadow-[0_0_20px_rgba(201,164,105,0.35)] transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Navigation */}
          <div>
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-[#F6F2EA]/50 mb-6">Navigatsiya</h4>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.key}>
                  <Link
                    to={l.to}
                    className="text-sm text-[#F6F2EA]/80 hover:text-[#C9A469] transition-colors duration-300"
                  >
                    <EditableText contentKey={`footer.nav.${l.key}`} fallback={l.label} section="footer-nav" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Sectors */}
          <div>
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-[#F6F2EA]/50 mb-6">Yo'nalishlar</h4>
            <ul className="space-y-3">
              {sectors.map((s, i) => (
                <li key={s}>
                  <Link
                    to="/sectors"
                    className="text-sm text-[#F6F2EA]/80 hover:text-[#C9A469] transition-colors duration-300"
                  >
                    <EditableText contentKey={`footer.sector.${i}`} fallback={s} section="footer-sectors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-[#F6F2EA]/50 mb-6">Aloqa</h4>
            <div className="space-y-5 text-sm text-[#F6F2EA]/80">
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#F6F2EA]/40 mb-1">Bosh ofis</div>
                <EditableText contentKey="footer.contact.address" fallback={address} section="footer-contact" />
                <a
                  href="https://maps.google.com/?q=Tashkent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#C9A469] hover:text-[#F6F2EA] transition-colors"
                >
                  <MapPin className="w-3 h-3" /> Xaritada ko'rish
                </a>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#F6F2EA]/40 mb-1">Telefon</div>
                <a href={`tel:${phone}`} className="hover:text-[#C9A469] transition-colors">{phone}</a>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#F6F2EA]/40 mb-1">Email</div>
                <a href={`mailto:${emailAddr}`} className="hover:text-[#C9A469] transition-colors break-all">{emailAddr}</a>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#F6F2EA]/40 mb-1">Ish vaqti</div>
                <EditableText contentKey="footer.contact.hours" fallback="Dushanba – Juma · 09:00 – 18:00" section="footer-contact" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#C9A469]/[0.12] flex flex-col lg:flex-row items-center justify-between gap-6 text-[11px] tracking-[0.15em] text-[#F6F2EA]/50">
          <div>© 2026 NazirovSholding. Barcha huquqlar himoyalangan.</div>
          <div className="flex items-center gap-2 text-[11px] tracking-[0.15em]">
            <span className="text-[#F6F2EA]/50">Saytni ishlab chiqdi:</span>
            <a
              href="https://sellsoft.uz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C9A469] hover:text-[#F6F2EA] transition-colors uppercase tracking-[0.25em] font-medium"
            >
              SellSoft
            </a>
          </div>
          <div className="uppercase tracking-[0.25em] text-[10px]">
            O'zbekistonda mukammallik bilan yaratilgan
          </div>
        </div>
      </div>
    </footer>
  );
}
