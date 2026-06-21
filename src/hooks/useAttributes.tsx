import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'textarea';

export interface AttributeOption {
  id: string;
  attribute_id: string;
  label_uz: string;
  label_ru: string;
  value: string;
  sort_order: number;
}

export interface Attribute {
  id: string;
  group_id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  field_type: FieldType;
  unit: string | null;
  placeholder_uz: string | null;
  placeholder_ru: string | null;
  is_required: boolean;
  is_filterable: boolean;
  show_in_card: boolean;
  sort_order: number;
  is_active: boolean;
  options?: AttributeOption[];
}

export interface AttributeGroup {
  id: string;
  category_id: string | null;
  name_uz: string;
  name_ru: string;
  slug: string;
  icon?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  is_collapsible?: boolean;
  seo_visible?: boolean;
  json_ld_visible?: boolean;
  filter_visible?: boolean;
  sort_order: number;
  is_active: boolean;
  attributes?: Attribute[];
}

export interface ProductAttributeValue {
  id: string;
  product_id: string;
  attribute_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_json: any;
}

export async function fetchCategoryAttributes(categoryId: string): Promise<AttributeGroup[]> {
  const { data: gs, error: groupsError } = await supabase
    .from('attribute_groups' as any)
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('sort_order');

  if (groupsError) throw groupsError;

  const groupList = (gs || []) as any[];
  if (groupList.length === 0) return [];

  const groupIds = groupList.map((g) => g.id);
  const { data: attrs, error: attrsError } = await supabase
    .from('attributes' as any)
    .select('*')
    .in('group_id', groupIds)
    .eq('is_active', true)
    .order('sort_order');

  if (attrsError) throw attrsError;

  const attrList = (attrs || []) as any[];
  const attrIds = attrList.map((a) => a.id);

  const optionsByAttr: Record<string, AttributeOption[]> = {};
  if (attrIds.length > 0) {
    const { data: opts, error: optsError } = await supabase
      .from('attribute_options' as any)
      .select('*')
      .in('attribute_id', attrIds)
      .order('sort_order');

    if (optsError) throw optsError;

    for (const o of (opts || []) as any[]) {
      (optionsByAttr[o.attribute_id] ||= []).push(o);
    }
  }

  return groupList.map((g) => ({
    ...g,
    attributes: attrList
      .filter((a) => a.group_id === g.id)
      .map((a) => ({ ...a, options: optionsByAttr[a.id] || [] })),
  })) as AttributeGroup[];
}

/** Fetch full attribute schema (groups + attributes + options) for a category. */
export function useCategoryAttributes(categoryId: string | null | undefined) {
  const query = useQuery({
    queryKey: ['category-attributes', categoryId],
    queryFn: () => fetchCategoryAttributes(categoryId as string),
    enabled: !!categoryId,
    staleTime: 30_000,
  });

  return {
    groups: categoryId ? query.data || [] : [],
    loading: !!categoryId && (query.isLoading || query.isFetching),
    refetch: query.refetch,
  };
}

/** Fetch saved values for a product. */
export function useProductAttributeValues(productId: string | null | undefined) {
  const [values, setValues] = useState<ProductAttributeValue[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!productId) {
      setValues([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('product_attribute_values' as any)
        .select('*')
        .eq('product_id', productId);
      setValues((data || []) as any);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { values, loading, refetch: fetch };
}

/** Convert a saved value row + attribute to a form-ready value. */
export function valueFromRow(attr: Attribute, row?: ProductAttributeValue): any {
  if (!row) {
    if (attr.field_type === 'boolean') return false;
    if (attr.field_type === 'multiselect') return [];
    return '';
  }
  switch (attr.field_type) {
    case 'number':
      return row.value_number ?? '';
    case 'boolean':
      return !!row.value_boolean;
    case 'multiselect':
      return Array.isArray(row.value_json) ? row.value_json : [];
    default:
      return row.value_text ?? '';
  }
}

/** Save attribute values for a product (upsert by product+attribute). */
export async function saveProductAttributeValues(
  productId: string,
  attrs: Attribute[],
  values: Record<string, any>
) {
  // Safety: agar atributlar yuklanmagan bo'lsa, mavjud qiymatlarni o'chirib yubormaslik kerak.
  if (!attrs || attrs.length === 0) {
    console.warn('[attrs] save skipped: no attributes loaded — keeping existing values');
    return;
  }

  const rows = attrs
    .map((a) => {
      const v = values[a.id];
      const row: any = {
        product_id: productId,
        attribute_id: a.id,
        value_text: null,
        value_number: null,
        value_boolean: null,
        value_json: null,
      };
      switch (a.field_type) {
        case 'number': {
          if (v === '' || v === null || v === undefined) return null;
          const num = Number(v);
          if (!Number.isFinite(num)) return null;
          row.value_number = num;
          break;
        }
        case 'boolean':
          row.value_boolean = !!v;
          break;
        case 'multiselect':
          if (!Array.isArray(v) || v.length === 0) return null;
          row.value_json = v;
          break;
        default:
          if (v === '' || v === null || v === undefined) return null;
          row.value_text = String(v);
      }
      return row;
    })
    .filter(Boolean);

  const rowAttrIds = new Set(rows.map((row: any) => row.attribute_id));
  const emptyAttrIds = attrs
    .map((a) => a.id)
    .filter((id) => !rowAttrIds.has(id));

  // Faqat bo'sh qilingan atributlarni o'chirish — qolgan qiymatlar upsert orqali saqlanadi.
  if (emptyAttrIds.length > 0) {
    const { error: delErr } = await supabase
      .from('product_attribute_values' as any)
      .delete()
      .eq('product_id', productId)
      .in('attribute_id', emptyAttrIds);
    if (delErr) {
      console.error('[attrs] delete failed', delErr);
      throw delErr;
    }
  }

  if (rows.length > 0) {
    const { error: upsertErr } = await supabase
      .from('product_attribute_values' as any)
      .upsert(rows as any, { onConflict: 'product_id,attribute_id' });
    if (upsertErr) {
      console.error('[attrs] upsert failed', upsertErr, rows);
      throw upsertErr;
    }
  }
}

/** Save only values the user touched; useful when category schema is still loading. */
export async function saveTouchedProductAttributeValues(
  productId: string,
  attrs: Attribute[],
  values: Record<string, any>,
  touchedIds: string[]
) {
  const touched = new Set(touchedIds);
  if (touched.size === 0) return;

  const touchedAttrs = attrs.filter((a) => touched.has(a.id));
  if (touchedAttrs.length === 0) {
    console.warn('[attrs] touched save skipped: no matching touched attributes loaded');
    return;
  }

  await saveProductAttributeValues(productId, touchedAttrs, values);
}

/** Replace all values for the loaded category schema. */
export async function replaceProductAttributeValues(
  productId: string,
  attrs: Attribute[],
  values: Record<string, any>
) {
  if (!attrs || attrs.length === 0) {
    console.warn('[attrs] replace skipped: no attributes loaded — keeping existing values');
    return;
  }

  const rows = attrs
    .map((a) => {
      const v = values[a.id];
      const row: any = {
        product_id: productId,
        attribute_id: a.id,
        value_text: null,
        value_number: null,
        value_boolean: null,
        value_json: null,
      };
      switch (a.field_type) {
        case 'number': {
          if (v === '' || v === null || v === undefined) return null;
          const num = Number(v);
          if (!Number.isFinite(num)) return null;
          row.value_number = num;
          break;
        }
        case 'boolean':
          row.value_boolean = !!v;
          break;
        case 'multiselect':
          if (!Array.isArray(v) || v.length === 0) return null;
          row.value_json = v;
          break;
        default:
          if (v === '' || v === null || v === undefined) return null;
          row.value_text = String(v);
      }
      return row;
    })
    .filter(Boolean);

  // Faqat shu yuklangan atributlar bo'yicha o'chirish — boshqalarga tegmaslik.
  const attrIds = attrs.map((a) => a.id);
  const { error: delErr } = await supabase
    .from('product_attribute_values' as any)
    .delete()
    .eq('product_id', productId)
    .in('attribute_id', attrIds);
  if (delErr) {
    console.error('[attrs] delete failed', delErr);
    throw delErr;
  }

  if (rows.length > 0) {
    const { error: insErr } = await supabase
      .from('product_attribute_values' as any)
      .insert(rows as any);
    if (insErr) {
      console.error('[attrs] insert failed', insErr, rows);
      throw insErr;
    }
  }
}
