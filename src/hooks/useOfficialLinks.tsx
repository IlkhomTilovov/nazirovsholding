import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OfficialLink {
  id: string;
  name: Record<string, string>;
  logo: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useOfficialLinks(activeOnly = false) {
  const [links, setLinks] = useState<OfficialLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('official_links' as any).select('*').order('sort_order', { ascending: true });
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) console.error('Failed to load official links:', error.message);
    setLinks((data || []) as unknown as OfficialLink[]);
    setLoading(false);
  }, [activeOnly]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return { links, loading, refetch: fetchLinks };
}
