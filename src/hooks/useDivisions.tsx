import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessDivision {
  id: string;
  brand_id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz: string | null;
  description_ru: string | null;
  icon: string | null;
  cover_image: string | null;
  banner: string | null;
  hero_image: string | null;
  gallery: string[];
  benefits_uz: string[];
  benefits_ru: string[];
  meta_title_uz: string | null;
  meta_title_ru: string | null;
  meta_description_uz: string | null;
  meta_description_ru: string | null;
  meta_keywords: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useDivisions(brandId?: string | null, activeOnly = false) {
  const [divisions, setDivisions] = useState<BusinessDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDivisions = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('business_divisions').select('*').order('sort_order', { ascending: true });
      if (brandId) q = q.eq('brand_id', brandId);
      if (activeOnly) q = q.eq('is_active', true);
      const { data, error: e } = await q;
      if (e) throw e;
      setDivisions(((data || []) as any[]).map((d) => ({
        ...d,
        gallery: Array.isArray(d.gallery) ? d.gallery : [],
        benefits_uz: Array.isArray(d.benefits_uz) ? d.benefits_uz : [],
        benefits_ru: Array.isArray(d.benefits_ru) ? d.benefits_ru : [],
      })) as BusinessDivision[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed'));
    } finally {
      setLoading(false);
    }
  }, [brandId, activeOnly]);

  useEffect(() => {
    if (brandId === null) {
      setDivisions([]);
      setLoading(false);
      return;
    }
    fetchDivisions();
  }, [fetchDivisions, brandId]);

  return { divisions, loading, error, refetch: fetchDivisions };
}

export interface BrandStats {
  divisions: number;
  categories: number;
  products: number;
  publishedProducts: number;
  draftProducts: number;
}

export function useBrandStats(brandId: string | null | undefined) {
  const [stats, setStats] = useState<BrandStats>({
    divisions: 0,
    categories: 0,
    products: 0,
    publishedProducts: 0,
    draftProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!brandId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [divRes, catRes, prodRes] = await Promise.all([
        supabase.from('business_divisions').select('id', { count: 'exact', head: true }).eq('brand_id', brandId),
        supabase.from('categories').select('id', { count: 'exact', head: true }).contains('brand_ids', [brandId]),
        supabase.from('products').select('id, is_active').eq('brand_id', brandId),
      ]);
      const products = (prodRes.data || []) as { is_active: boolean }[];
      setStats({
        divisions: divRes.count || 0,
        categories: catRes.count || 0,
        products: products.length,
        publishedProducts: products.filter((p) => p.is_active).length,
        draftProducts: products.filter((p) => !p.is_active).length,
      });
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, loading, refetch };
}
