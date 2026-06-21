import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useCategoryAttributes, type Attribute } from '@/hooks/useAttributes';
import { useLanguage } from '@/hooks/useLanguage';

const EMPTY_FIELD = '__empty__';

interface Props {
  categoryId: string | null;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  /** Called whenever the resolved attribute list for the category changes — parent can store it for save. */
  onAttributesLoaded?: (attrs: Attribute[]) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const buildDefaultValues = (attrs: Attribute[], values: Record<string, any>) => {
  return attrs.reduce<Record<string, any>>((acc, attr) => {
    const incoming = values[attr.id];
    if (incoming !== undefined) {
      acc[attr.id] = incoming;
      return acc;
    }

    if (attr.field_type === 'boolean') acc[attr.id] = false;
    else if (attr.field_type === 'multiselect') acc[attr.id] = [];
    else acc[attr.id] = '';

    return acc;
  }, {});
};

const createDynamicSchema = (attrs: Attribute[]) => {
  const shape = attrs.reduce<Record<string, z.ZodTypeAny>>((acc, attr) => {
    if (attr.field_type === 'number') {
      const numberSchema = z.preprocess(
        (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
        attr.is_required
          ? z.number({ required_error: 'Majburiy maydon' }).finite('Raqam kiriting')
          : z.number().finite('Raqam kiriting').optional(),
      );
      acc[attr.id] = numberSchema;
      return acc;
    }

    if (attr.field_type === 'boolean') {
      acc[attr.id] = attr.is_required ? z.boolean() : z.boolean().optional();
      return acc;
    }

    if (attr.field_type === 'multiselect') {
      const arraySchema = z.array(z.string());
      acc[attr.id] = attr.is_required ? arraySchema.min(1, 'Kamida bitta qiymat tanlang') : arraySchema.optional();
      return acc;
    }

    const textSchema = z.string();
    acc[attr.id] = attr.is_required ? textSchema.trim().min(1, 'Majburiy maydon') : textSchema.optional();
    return acc;
  }, {});

  return z.object(shape);
};

export function DynamicAttributesForm({ categoryId, values, onChange, onAttributesLoaded, onLoadingChange }: Props) {
  const { groups, loading } = useCategoryAttributes(categoryId);
  const { language } = useLanguage();

  const allAttrs = useMemo<Attribute[]>(
    () => groups.flatMap((g) => g.attributes || []),
    [groups]
  );

  const attrSignature = useMemo(() => allAttrs.map((attr) => attr.id).join('|'), [allAttrs]);
  const dynamicSchema = useMemo(() => createDynamicSchema(allAttrs), [allAttrs]);
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(dynamicSchema),
    mode: 'onChange',
    defaultValues: buildDefaultValues(allAttrs, values),
  });

  useEffect(() => {
    onAttributesLoaded?.(allAttrs);
  }, [allAttrs, onAttributesLoaded]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    const nextValues = buildDefaultValues(allAttrs, values);
    if (JSON.stringify(nextValues) !== JSON.stringify(form.getValues())) {
      form.reset(nextValues);
    }
  }, [attrSignature, categoryId, form, values]);

  useEffect(() => {
    const subscription = form.watch((data) => onChange(data));
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  if (!categoryId) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground border rounded-lg bg-muted/30">
        Avval "Asosiy" tabidan toifani tanlang — xususiyatlar avtomatik yuklanadi.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground border rounded-lg bg-muted/30">
        Bu toifa uchun atributlar sozlanmagan. <br />
        <a href="/admin/attributes" className="text-primary underline">Atributlar sahifasi</a>da qo'shing.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.id} className="border rounded-xl p-4 bg-card">
          <h3 className="font-semibold text-base mb-4">
            {language === 'uz' ? g.name_uz : g.name_ru}
          </h3>
          {(g.attributes || []).length === 0 && (
            <div className="text-sm text-muted-foreground bg-muted/40 border border-dashed rounded-lg p-4 text-center">
              Bu guruhda atributlar yo'q.{' '}
              <a href="/admin/attributes" className="text-primary underline font-medium">
                Atributlar sahifasi
              </a>
              dan "{language === 'uz' ? g.name_uz : g.name_ru}" guruhiga yangi atribut qo'shing
              (masalan: Balandlik, Og'irlik, Material).
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(g.attributes || []).map((a) => {
              const label = language === 'uz' ? a.name_uz : a.name_ru;
              const placeholder = (language === 'uz' ? a.placeholder_uz : a.placeholder_ru) || '';
              const error = form.formState.errors[a.id]?.message as string | undefined;

              return (
                <div key={a.id} className={`space-y-2 ${a.field_type === 'textarea' ? 'md:col-span-2' : ''}`}>
                  <Label className="flex items-center gap-2">
                    {label}
                    {a.unit && <span className="text-xs text-muted-foreground">({a.unit})</span>}
                    {a.is_required && <span className="text-destructive">*</span>}
                    {a.is_filterable && <Badge variant="outline" className="text-[10px]">filter</Badge>}
                  </Label>

                  {a.field_type === 'text' && (
                    <Input {...form.register(a.id)} placeholder={placeholder} />
                  )}

                  {a.field_type === 'number' && (
                    <div className="relative">
                      <Input
                        type="number"
                        {...form.register(a.id)}
                        placeholder={placeholder}
                        className={a.unit ? 'pr-14' : ''}
                      />
                      {a.unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          {a.unit}
                        </span>
                      )}
                    </div>
                  )}

                  {a.field_type === 'textarea' && (
                    <Textarea {...form.register(a.id)} placeholder={placeholder} rows={3} />
                  )}

                  {a.field_type === 'boolean' && (
                    <Controller
                      control={form.control}
                      name={a.id}
                      render={({ field }) => (
                        <div className="flex items-center gap-3 h-10">
                          <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          <span className="text-sm text-muted-foreground">{field.value ? 'Ha' : "Yo'q"}</span>
                        </div>
                      )}
                    />
                  )}

                  {a.field_type === 'select' && (
                    <Controller
                      control={form.control}
                      name={a.id}
                      render={({ field }) => (
                        <Select
                          value={field.value || EMPTY_FIELD}
                          onValueChange={(value) => field.onChange(value === EMPTY_FIELD ? '' : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={placeholder || 'Tanlang...'} />
                          </SelectTrigger>
                          <SelectContent>
                            {!a.is_required && (
                              <SelectItem value={EMPTY_FIELD}>Tanlanmagan</SelectItem>
                            )}
                            {(a.options || []).map((opt) => (
                              <SelectItem key={opt.id} value={opt.value}>
                                {language === 'uz' ? opt.label_uz : opt.label_ru}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}

                  {a.field_type === 'multiselect' && (
                    <Controller
                      control={form.control}
                      name={a.id}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[44px]">
                          {(a.options || []).length === 0 && (
                            <span className="text-xs text-muted-foreground">Variantlar yo'q</span>
                          )}
                          {(a.options || []).map((opt) => {
                            const arr: string[] = Array.isArray(field.value) ? field.value : [];
                            const checked = arr.includes(opt.value);
                            return (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer text-sm transition-colors ${
                                  checked ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                                }`}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(c) => {
                                    const next = c
                                      ? [...arr, opt.value]
                                      : arr.filter((x) => x !== opt.value);
                                    field.onChange(next);
                                  }}
                                  className={checked ? 'border-primary-foreground' : ''}
                                />
                                {language === 'uz' ? opt.label_uz : opt.label_ru}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    />
                  )}
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
