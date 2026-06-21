import { useSEO } from '@/hooks/useSEO';
import { InteractiveEarthSection } from '@/components/InteractiveEarth';
import { GlobalOperationsSection } from '@/components/GlobalOperationsSection';

export default function International() {
  useSEO({ title: 'Xalqaro Faoliyat — NazirovSholding' });
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <GlobalOperationsSection />
      <InteractiveEarthSection />
    </div>
  );
}
