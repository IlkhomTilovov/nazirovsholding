import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/hooks/useProducts';

export interface Brand {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  description_uz: string | null;
  description_ru: string | null;
  website: string | null;
  is_active: boolean;
  sort_order: number;
  meta_title_uz: string | null;
  meta_title_ru: string | null;
  meta_description_uz: string | null;
  meta_description_ru: string | null;
  meta_keywords: string | null;
  is_indexed: boolean;
  is_followed: boolean;
  created_at: string;
  updated_at: string;
}

export function useBrands(activeOnly = true) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('brands').select('*').order('sort_order', { ascending: true });
      if (activeOnly) query = query.eq('is_active', true);
      const { data, error: e } = await query;
      if (e) throw e;
      setBrands((data || []) as Brand[]);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(err instanceof Error ? err : new Error('Failed'));
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return { brands, loading, error, refetch: fetchBrands };
}

export function useBrand(slug: string | undefined) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const { data, error: e } = await supabase
          .from('brands')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle();
        if (e) throw e;
        setBrand(data as Brand | null);
      } catch (err) {
        console.error('Error fetching brand:', err);
        setError(err instanceof Error ? err : new Error('Failed'));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return { brand, loading, error };
}

export function useBrandById(id: string | null | undefined) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setBrand(null);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('brands')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        setBrand((data as Brand) || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { brand, loading };
}

export interface BrandCategory {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
}

export function useBrandProducts(brandId: string | null | undefined, limit = 48) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<BrandCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) {
      setProducts([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        // 1) Find categories that include this brand
        const { data: cats } = await supabase
          .from('categories')
          .select('id, name_uz, name_ru, slug, brand_ids, sort_order, is_active')
          .eq('is_active', true)
          .contains('brand_ids', [brandId])
          .order('sort_order', { ascending: true });

        const catList = (cats || []) as any[];
        setCategories(
          catList.map((c) => ({ id: c.id, name_uz: c.name_uz, name_ru: c.name_ru, slug: c.slug }))
        );

        // 2) Fetch products: either products with brand_id OR products in those categories
        const categoryIds = catList.map((c) => c.id);

        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(limit);

        if (categoryIds.length > 0) {
          query = query.or(
            `brand_id.eq.${brandId},category_id.in.(${categoryIds.join(',')})`
          );
        } else {
          query = query.eq('brand_id', brandId);
        }

        const { data } = await query;
        setProducts((data || []) as Product[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [brandId, limit]);

  return { products, categories, loading };
}
