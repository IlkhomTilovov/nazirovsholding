import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CaseStudy {
  id: string;
  brand_id: string;
  image: string | null;
  country_code: string;
  country_name: Record<string, string>;
  category: Record<string, string>;
  title: Record<string, string>;
  result: Record<string, string>;
  year: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function countryFlagEmoji(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return code.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function useCaseStudies(brandId?: string | null, activeOnly = false) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCaseStudies = useCallback(async () => {
    if (!brandId) {
      setCaseStudies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let q = supabase.from('brand_case_studies').select('*').eq('brand_id', brandId).order('sort_order', { ascending: true });
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) console.error('Failed to load case studies:', error.message);
    setCaseStudies((data || []) as CaseStudy[]);
    setLoading(false);
  }, [brandId, activeOnly]);

  useEffect(() => {
    fetchCaseStudies();
  }, [fetchCaseStudies]);

  return { caseStudies, loading, refetch: fetchCaseStudies };
}
