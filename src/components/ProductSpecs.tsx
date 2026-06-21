import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Minus } from 'lucide-react';

interface Props {
  productId: string;
  categoryId: string | null;
  compact?: boolean;
}

interface SpecAttr {
  id: string;
  group_id: string;
  name_uz: string;
  name_ru: string;
  field_type: string;
  unit: string | null;
  sort_order: number;
}

interface SpecGroup {
  id: string;
  name_uz: string;
  name_ru: string;
  sort_order: number;
}

interface SpecOption {
  attribute_id: string;
  label_uz: string;
  label_ru: string;
  value: string;
}

interface SpecValue {
  attribute_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_json: any;
}

export function ProductSpecs({ productId, categoryId, compact = false }: Props) {
  const { language } = useLanguage();
  const [groups, setGroups] = useState<SpecGroup[]>([]);
  const [attrs, setAttrs] = useState<SpecAttr[]>([]);
  const [options, setOptions] = useState<SpecOption[]>([]);
  const [values, setValues] = useState<SpecValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      setLoading(true);
      try {
        // 1) Saqlangan qiymatlar
        const { data: vals } = await supabase
          .from('product_attribute_values' as any)
          .select('*')
          .eq('product_id', productId);
        const valList = (vals || []) as any as SpecValue[];
        setValues(valList);

        // 2) Kategoriya uchun barcha atribut guruhlari
        let groupList: SpecGroup[] = [];
        if (categoryId) {
          const { data: gData } = await supabase
            .from('attribute_groups' as any)
            .select('id, name_uz, name_ru, sort_order')
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .order('sort_order');
          groupList = (gData || []) as any;
        }
        setGroups(groupList);

        // 3) Shu guruhlardagi barcha atributlar + qiymatlari saqlanganlar (boshqa kategoriya bo'lsa ham)
        const groupIds = groupList.map((g) => g.id);
        const valueAttrIds = valList.map((v) => v.attribute_id);

        let attrList: SpecAttr[] = [];
        if (groupIds.length > 0 || valueAttrIds.length > 0) {
          const orFilter: string[] = [];
          if (groupIds.length > 0) orFilter.push(`group_id.in.(${groupIds.join(',')})`);
          if (valueAttrIds.length > 0) orFilter.push(`id.in.(${valueAttrIds.join(',')})`);
          const { data: aData } = await supabase
            .from('attributes' as any)
            .select('*')
            .eq('is_active', true)
            .or(orFilter.join(','))
            .order('sort_order');
          attrList = (aData || []) as any;
        }
        setAttrs(attrList);

        // Saqlangan qiymatlar guruhlari ichida bo'lmasa ham ko'rsatish uchun guruhlarni qo'shish
        const missingGroupIds = Array.from(new Set(attrList.map((a) => a.group_id)))
          .filter((gid) => !groupList.some((g) => g.id === gid));
        if (missingGroupIds.length > 0) {
          const { data: extraGroups } = await supabase
            .from('attribute_groups' as any)
            .select('id, name_uz, name_ru, sort_order')
            .in('id', missingGroupIds);
          setGroups([...groupList, ...((extraGroups || []) as any)]);
        }

        // 4) Select/multiselect variantlari
        const selectAttrIds = attrList
          .filter((a) => a.field_type === 'select' || a.field_type === 'multiselect')
          .map((a) => a.id);
        if (selectAttrIds.length > 0) {
          const { data: oData } = await supabase
            .from('attribute_options' as any)
            .select('attribute_id, label_uz, label_ru, value')
            .in('attribute_id', selectAttrIds);
          setOptions((oData || []) as any);
        } else {
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, categoryId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (attrs.length === 0) return null;

  const optLabel = (attrId: string, val: string) => {
    const o = options.find((x) => x.attribute_id === attrId && x.value === val);
    return o ? (language === 'uz' ? o.label_uz : o.label_ru) : val;
  };

  const emptyMark = <span className="text-muted-foreground/60">—</span>;

  const renderValue = (a: SpecAttr, v: SpecValue | undefined) => {
    if (a.field_type === 'boolean') {
      if (!v || v.value_boolean === null) return emptyMark;
      return v.value_boolean
        ? <span className="inline-flex items-center gap-1 text-green-600 font-medium"><Check className="w-4 h-4" />{language === 'uz' ? 'Bor' : 'Есть'}</span>
        : <span className="inline-flex items-center gap-1 text-muted-foreground"><Minus className="w-4 h-4" />{language === 'uz' ? "Yo'q" : 'Нет'}</span>;
    }
    if (a.field_type === 'number') {
      if (!v || v.value_number === null || v.value_number === undefined) return emptyMark;
      return <span>{v.value_number}{a.unit ? ` ${a.unit}` : ''}</span>;
    }
    if (a.field_type === 'select') {
      if (!v || !v.value_text) return emptyMark;
      return <span>{optLabel(a.id, v.value_text)}</span>;
    }
    if (a.field_type === 'multiselect') {
      const arr: string[] = v && Array.isArray(v.value_json) ? v.value_json : [];
      if (arr.length === 0) return emptyMark;
      return (
        <div className="flex flex-wrap gap-1.5 justify-end">
          {arr.map((val) => (
            <span key={val} className="px-2 py-0.5 rounded-md bg-muted text-xs">{optLabel(a.id, val)}</span>
          ))}
        </div>
      );
    }
    if (!v || !v.value_text) return emptyMark;
    return <span className="whitespace-pre-line">{v.value_text}{a.unit ? ` ${a.unit}` : ''}</span>;
  };

  // Group attributes
  const attrsByGroup = new Map<string, SpecAttr[]>();
  for (const a of attrs) {
    if (!attrsByGroup.has(a.group_id)) attrsByGroup.set(a.group_id, []);
    attrsByGroup.get(a.group_id)!.push(a);
  }
  for (const arr of attrsByGroup.values()) arr.sort((x, y) => x.sort_order - y.sort_order);

  const valueByAttr = new Map(values.map((v) => [v.attribute_id, v]));

  // Order groups by their stored sort_order
  const orderedGroups = groups.filter((g) => attrsByGroup.has(g.id));

  return (
    <section className={compact ? 'mt-6' : 'mt-16'}>
      <div className={`flex items-end justify-between mb-${compact ? '4' : '6'} border-b pb-3`}>
        <h2 className={`font-serif font-bold tracking-tight ${compact ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
          {language === 'uz' ? 'Texnik xususiyatlar' : 'Технические характеристики'}
        </h2>
        {!compact && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            {language === 'uz' ? 'Rasmiy parametrlar' : 'Официальные параметры'}
          </span>
        )}
      </div>

      <div className={compact ? 'space-y-4' : 'grid md:grid-cols-2 gap-6'}>
        {orderedGroups.map((g) => {
          const groupAttrs = attrsByGroup.get(g.id) || [];
          if (groupAttrs.length === 0) return null;
          return (
            <div key={g.id} className="rounded-2xl border bg-card overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-muted/50 border-b">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/80">
                  {language === 'uz' ? g.name_uz : g.name_ru}
                </h3>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {groupAttrs.map((a, idx) => {
                    const v = valueByAttr.get(a.id);
                    return (
                      <tr
                        key={a.id}
                        className={`${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'} hover:bg-muted/40 transition-colors`}
                      >
                        <td className="px-5 py-3 text-muted-foreground align-top w-1/2 border-b last:border-0">
                          {language === 'uz' ? a.name_uz : a.name_ru}
                          {a.unit && <span className="text-xs text-muted-foreground/70 ml-1">({a.unit})</span>}
                        </td>
                        <td className="px-5 py-3 font-medium text-foreground text-right align-top border-b last:border-0">
                          {renderValue(a, v)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </section>
  );
}
