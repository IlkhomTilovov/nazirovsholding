import { useSEO } from '@/hooks/useSEO';
import { useLanguage } from '@/hooks/useLanguage';
import { GlobalOperationsSection } from '@/components/GlobalOperationsSection';

export default function About() {
  const { t } = useLanguage();
  useSEO({ title: t.about.title });

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <GlobalOperationsSection />
    </div>
  );
}
