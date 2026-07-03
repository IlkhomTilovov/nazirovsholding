import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight, X,
  Shield, Cpu, Battery, Wifi, Lock, Settings, Ruler, Wrench,
  Zap, Thermometer, Droplet, Layers, Box, Package, Tag, Star,
  Info, Eye, Search, Filter as FilterIcon, Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useLanguages } from '@/hooks/useLanguages';
import { getTranslated } from '@/lib/i18n';
import { useCategoryAttributes, type FieldType, type Attribute, type AttributeGroup, type AttributeOption } from '@/hooks/useAttributes';
import { TranslatedInput } from '@/components/admin/translated/TranslatedInput';
import { TranslatedTextarea } from '@/components/admin/translated/TranslatedTextarea';
import { LanguageTabsProvider, useLanguageTabs } from '@/components/admin/translated/LanguageTabsProvider';
import { LanguageTabBar } from '@/components/admin/translated/LanguageTabBar';

const ICON_MAP: Record<string, any> = {
  Shield, Cpu, Battery, Wifi, Lock, Settings, Ruler, Wrench,
  Zap, Thermometer, Droplet, Layers, Box, Package, Tag, Star, Sparkles, Info,
};
const ICON_OPTIONS = Object.keys(ICON_MAP);

function GroupIcon({ name, className }: { name?: string | null; className?: string }) {
  const Cmp = name ? ICON_MAP[name] : null;
  if (!Cmp) return <Layers className={className} />;
  return <Cmp className={className} />;
}

interface Category { id: string; name: Record<string, string>; }

const fieldTypeLabels: Record<FieldType, string> = {
  text: 'Matn',
  number: 'Raqam',
  select: 'Tanlov',
  multiselect: "Ko'p tanlov",
  boolean: 'Switch',
  textarea: 'Katta matn',
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function OptionLabelInput({ label, onChange }: { label: Record<string, string>; onChange: (label: Record<string, string>) => void }) {
  const { activeLang } = useLanguageTabs();
  return (
    <Input
      className="col-span-4"
      placeholder={`Label (${activeLang.toUpperCase()})`}
      value={label[activeLang] || ''}
      onChange={(e) => onChange({ ...label, [activeLang]: e.target.value })}
    />
  );
}

export default function Attributes() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { languages, defaultLanguage } = useLanguages();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const { groups, loading, refetch } = useCategoryAttributes(categoryId || null);

  const [groupDialog, setGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AttributeGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: {} as Record<string, string>,
    slug: '',
    slugTouched: false,
    icon: 'Layers',
    description: {} as Record<string, string>,
    sort_order: 0,
    is_active: true,
    is_collapsible: true,
    seo_visible: true,
    json_ld_visible: true,
    filter_visible: true,
  });

  const [attrDialog, setAttrDialog] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [attrGroupId, setAttrGroupId] = useState<string>('');
  const [attrForm, setAttrForm] = useState<any>({
    name: {} as Record<string, string>, field_type: 'text' as FieldType, unit: '',
    placeholder: {} as Record<string, string>,
    is_required: false, is_filterable: false, show_in_card: false, sort_order: 0, is_active: true,
    options: [] as { id?: string; label: Record<string, string>; value: string }[],
  });

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('id, name').order('sort_order');
      setCategories((data || []) as unknown as Category[]);
    })();
  }, []);

  const openCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({
      name: {}, slug: '', slugTouched: false, icon: 'Layers',
      description: {},
      sort_order: groups.length, is_active: true,
      is_collapsible: true, seo_visible: true, json_ld_visible: true, filter_visible: true,
    });
    setGroupDialog(true);
  };

  const openEditGroup = (g: AttributeGroup) => {
    setEditingGroup(g);
    const baseName = g.name[defaultLanguage] || '';
    setGroupForm({
      name: g.name || {},
      slug: g.slug || slugify(baseName),
      slugTouched: true,
      icon: g.icon || 'Layers',
      description: g.description || {},
      sort_order: g.sort_order,
      is_active: g.is_active,
      is_collapsible: g.is_collapsible ?? true,
      seo_visible: g.seo_visible ?? true,
      json_ld_visible: g.json_ld_visible ?? true,
      filter_visible: g.filter_visible ?? true,
    });
    setGroupDialog(true);
  };

  const saveGroup = async () => {
    if (!categoryId) return;
    const hasAllNames = languages.every((lang) => groupForm.name[lang.code]?.trim());
    if (!hasAllNames) {
      toast({ variant: 'destructive', title: 'Xatolik', description: "Barcha tillar uchun nomni to'ldiring" });
      return;
    }
    const { slugTouched, ...rest } = groupForm;
    const baseName = groupForm.name[defaultLanguage] || '';
    const payload: any = {
      ...rest,
      slug: (groupForm.slug || slugify(baseName)).trim(),
      category_id: categoryId,
    };
    try {
      let savedGroupId = editingGroup?.id;
      if (editingGroup) {
        const { error } = await supabase.from('attribute_groups' as any).update(payload).eq('id', editingGroup.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('attribute_groups' as any).insert([payload]).select('id').single();
        if (error) throw error;
        savedGroupId = (data as any)?.id;
      }
      setGroupDialog(false);
      if (savedGroupId) setExpanded((prev) => new Set(prev).add(savedGroupId));
      await refetch();
      toast({ title: 'Saqlandi' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: e.message });
    }
  };

  const deleteGroup = async (g: AttributeGroup) => {
    if (!confirm(`"${getTranslated(g.name, defaultLanguage, defaultLanguage)}" guruhini o'chirish? Barcha atributlari ham o'chiriladi.`)) return;
    const { error } = await supabase.from('attribute_groups' as any).delete().eq('id', g.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
      return;
    }
    await refetch();
  };

  const openCreateAttr = (groupId: string) => {
    setEditingAttr(null);
    setAttrGroupId(groupId);
    setAttrForm({
      name: {}, field_type: 'text', unit: '',
      placeholder: {},
      is_required: false, is_filterable: false, show_in_card: false, sort_order: 0, is_active: true,
      options: [],
    });
    setAttrDialog(true);
  };

  const openEditAttr = (a: Attribute) => {
    setEditingAttr(a);
    setAttrGroupId(a.group_id);
    setAttrForm({
      name: a.name, field_type: a.field_type, unit: a.unit || '',
      placeholder: a.placeholder || {},
      is_required: a.is_required, is_filterable: a.is_filterable, show_in_card: a.show_in_card,
      sort_order: a.sort_order, is_active: a.is_active,
      options: (a.options || []).map((o) => ({ id: o.id, label: o.label || {}, value: o.value })),
    });
    setAttrDialog(true);
  };

  const saveAttr = async () => {
    const hasAllNames = languages.every((lang) => attrForm.name[lang.code]?.trim());
    if (!attrGroupId || !hasAllNames) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Maydonlarni to\'ldiring' });
      return;
    }
    const slug = slugify(attrForm.name[defaultLanguage] || '');
    const payload: any = {
      group_id: attrGroupId,
      name: attrForm.name,
      slug,
      field_type: attrForm.field_type,
      unit: attrForm.unit || null,
      placeholder: attrForm.placeholder,
      is_required: attrForm.is_required,
      is_filterable: attrForm.is_filterable,
      show_in_card: attrForm.show_in_card,
      sort_order: attrForm.sort_order,
      is_active: attrForm.is_active,
    };
    try {
      let attrId = editingAttr?.id;
      if (editingAttr) {
        const { error } = await supabase.from('attributes' as any).update(payload).eq('id', editingAttr.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('attributes' as any).insert([payload]).select('id').single();
        if (error) throw error;
        attrId = (data as any).id;
      }

      // Options sync (replace all)
      if (attrId && (attrForm.field_type === 'select' || attrForm.field_type === 'multiselect')) {
        const { error: deleteOptionsError } = await supabase.from('attribute_options' as any).delete().eq('attribute_id', attrId);
        if (deleteOptionsError) throw deleteOptionsError;
        const opts = (attrForm.options || [])
          .filter((o: any) => o.label[defaultLanguage] && o.value)
          .map((o: any, i: number) => ({
            attribute_id: attrId,
            label: o.label,
            value: o.value,
            sort_order: i,
          }));
        if (opts.length > 0) {
          const { error: insertOptionsError } = await supabase.from('attribute_options' as any).insert(opts);
          if (insertOptionsError) throw insertOptionsError;
        }
      }

      setAttrDialog(false);
      setExpanded((prev) => new Set(prev).add(attrGroupId));
      await refetch();
      toast({ title: 'Saqlandi' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: e.message });
    }
  };

  const deleteAttr = async (a: Attribute) => {
    if (!confirm(`"${getTranslated(a.name, defaultLanguage, defaultLanguage)}" atributini o'chirish?`)) return;
    const { error } = await supabase.from('attributes' as any).delete().eq('id', a.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
      return;
    }
    await refetch();
  };

  const toggleExpand = (id: string) => {
    const s = new Set(expanded);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpanded(s);
  };

  const needsOptions = attrForm.field_type === 'select' || attrForm.field_type === 'multiselect';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Atributlar</h1>
          <p className="text-muted-foreground">Har bir toifa uchun dinamik xususiyatlarni boshqaring</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1 space-y-2">
              <Label>Toifa</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Toifani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {getTranslated(c.name, language, defaultLanguage)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={openCreateGroup} disabled={!categoryId} className="gap-2">
              <Plus className="h-4 w-4" /> Yangi guruh
            </Button>
          </div>
        </CardContent>
      </Card>

      {!categoryId && (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Toifani tanlang</CardContent></Card>
      )}

      {categoryId && loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {categoryId && !loading && groups.length === 0 && (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          Bu toifa uchun guruhlar yo'q. "Yangi guruh" tugmasi orqali qo'shing.
        </CardContent></Card>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <Card key={g.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <button onClick={() => toggleExpand(g.id)} className="flex items-center gap-2 flex-1 text-left min-w-0">
                  {expanded.has(g.id) ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <GroupIcon name={g.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{getTranslated(g.name, defaultLanguage, defaultLanguage)}</CardTitle>
                      <Badge variant="outline">{(g.attributes || []).length} atribut</Badge>
                      {!g.is_active && <Badge variant="secondary">Nofaol</Badge>}
                      {g.is_collapsible === false && <Badge variant="outline" className="text-xs">Doimo ochiq</Badge>}
                    </div>
                    {getTranslated(g.description, defaultLanguage, defaultLanguage) && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{getTranslated(g.description, defaultLanguage, defaultLanguage)}</p>
                    )}
                  </div>
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openCreateAttr(g.id)} className="gap-1">
                    <Plus className="h-3 w-3" /> Atribut
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditGroup(g)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteGroup(g)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </CardHeader>
            {expanded.has(g.id) && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {(g.attributes || []).length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">Atributlar yo'q</p>
                  )}
                  {(g.attributes || []).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="font-medium shrink-0">{getTranslated(a.name, defaultLanguage, defaultLanguage)}</span>
                        <Badge variant="outline" className="text-xs shrink-0">{fieldTypeLabels[a.field_type]}</Badge>
                        {a.unit && <span className="text-xs text-muted-foreground shrink-0">({a.unit})</span>}
                        {a.is_required && <Badge variant="destructive" className="text-xs shrink-0">Majburiy</Badge>}
                        {a.is_filterable && <Badge className="text-xs shrink-0">Filter</Badge>}
                        {(a.options?.length || 0) > 0 && (
                          <span className="text-xs text-muted-foreground shrink-0">{a.options!.length} variant</span>
                        )}
                        {getTranslated(a.placeholder, defaultLanguage, defaultLanguage) && (
                          <span className="text-xs text-muted-foreground italic truncate" title={`Placeholder: ${getTranslated(a.placeholder, defaultLanguage, defaultLanguage)}`}>
                            "{getTranslated(a.placeholder, defaultLanguage, defaultLanguage)}"
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditAttr(a)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteAttr(a)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Group Dialog */}
      <Dialog open={groupDialog} onOpenChange={setGroupDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GroupIcon name={groupForm.icon} className="h-5 w-5 text-primary" />
              {editingGroup ? 'Guruhni tahrirlash' : 'Yangi atribut guruhi'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Texnik xususiyatlar guruhini sozlang. Guruh frontendda alohida bo'lim sifatida ko'rinadi.
            </p>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Section: Basic info */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asosiy</h3>
              <LanguageTabsProvider languages={languages} defaultLanguage={defaultLanguage}>
                <LanguageTabBar />
                <TranslatedInput
                  label="Nomi"
                  required
                  value={groupForm.name}
                  onChange={(name) => {
                    const baseName = name[defaultLanguage] || '';
                    setGroupForm((f) => ({
                      ...f,
                      name,
                      slug: f.slugTouched ? f.slug : slugify(baseName),
                    }));
                  }}
                  placeholder={{ uz: 'masalan: Xavfsizlik', ru: 'например: Безопасность' }}
                />
              </LanguageTabsProvider>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  placeholder="xavfsizlik"
                  value={groupForm.slug}
                  onChange={(e) => setGroupForm({ ...groupForm, slug: slugify(e.target.value), slugTouched: true })}
                />
                <p className="text-xs text-muted-foreground">URL va texnik identifikator. Avtomatik yaratiladi.</p>
              </div>
            </section>

            <Separator />

            {/* Section: Icon */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ikona</h3>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                {ICON_OPTIONS.map((name) => {
                  const Cmp = ICON_MAP[name];
                  const active = groupForm.icon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setGroupForm({ ...groupForm, icon: name })}
                      className={`aspect-square rounded-md border flex items-center justify-center transition-all hover:bg-muted ${
                        active ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30' : 'border-border'
                      }`}
                      title={name}
                    >
                      <Cmp className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </section>

            <Separator />

            {/* Section: Description */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tavsif</h3>
              <LanguageTabsProvider languages={languages} defaultLanguage={defaultLanguage}>
                <LanguageTabBar />
                <TranslatedTextarea
                  label="Tavsif"
                  rows={2}
                  value={groupForm.description}
                  onChange={(description) => setGroupForm({ ...groupForm, description })}
                  placeholder={{ uz: 'Zamok xavfsizlik funksiyalari', ru: 'Функции безопасности замка' }}
                />
              </LanguageTabsProvider>
            </section>

            <Separator />

            {/* Section: Display */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ko'rinish</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tartib</Label>
                  <Input
                    type="number"
                    value={groupForm.sort_order}
                    onChange={(e) => setGroupForm({ ...groupForm, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 pt-6">
                  <label className="flex items-center justify-between rounded-md border p-2 cursor-pointer hover:bg-muted/40">
                    <span className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-muted-foreground" /> Faol</span>
                    <Switch checked={groupForm.is_active} onCheckedChange={(c) => setGroupForm({ ...groupForm, is_active: c })} />
                  </label>
                </div>
              </div>
              <label className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-muted/40">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2"><ChevronDown className="h-4 w-4" /> Yig'iladigan</p>
                  <p className="text-xs text-muted-foreground">Frontendda akkordeon kabi ochiladi/yopiladi</p>
                </div>
                <Switch checked={groupForm.is_collapsible} onCheckedChange={(c) => setGroupForm({ ...groupForm, is_collapsible: c })} />
              </label>
            </section>

            <Separator />

            {/* Section: SEO */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> SEO va filterlar
              </h3>
              <div className="grid sm:grid-cols-3 gap-2">
                <label className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-muted/40">
                  <span className="text-sm flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /> SEO matnida</span>
                  <Switch checked={groupForm.seo_visible} onCheckedChange={(c) => setGroupForm({ ...groupForm, seo_visible: c })} />
                </label>
                <label className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-muted/40">
                  <span className="text-sm flex items-center gap-2"><Info className="h-4 w-4 text-muted-foreground" /> JSON-LD</span>
                  <Switch checked={groupForm.json_ld_visible} onCheckedChange={(c) => setGroupForm({ ...groupForm, json_ld_visible: c })} />
                </label>
                <label className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-muted/40">
                  <span className="text-sm flex items-center gap-2"><FilterIcon className="h-4 w-4 text-muted-foreground" /> Filterlarda</span>
                  <Switch checked={groupForm.filter_visible} onCheckedChange={(c) => setGroupForm({ ...groupForm, filter_visible: c })} />
                </label>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialog(false)}>Bekor</Button>
            <Button onClick={saveGroup}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Attribute Dialog */}
      <Dialog open={attrDialog} onOpenChange={setAttrDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingAttr ? 'Atributni tahrirlash' : 'Yangi atribut'}</DialogTitle></DialogHeader>
          <LanguageTabsProvider languages={languages} defaultLanguage={defaultLanguage}>
          <LanguageTabBar />
          <div className="space-y-4">
            <TranslatedInput
              label="Nomi"
              required
              value={attrForm.name}
              onChange={(name) => setAttrForm({ ...attrForm, name })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Maydon turi</Label>
                <Select value={attrForm.field_type} onValueChange={(v) => setAttrForm({ ...attrForm, field_type: v as FieldType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(fieldTypeLabels) as FieldType[]).map((t) => (
                      <SelectItem key={t} value={t}>{fieldTypeLabels[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>O'lchov birligi (ixtiyoriy)</Label><Input placeholder="masalan: kg, mm, V" value={attrForm.unit} onChange={(e) => setAttrForm({ ...attrForm, unit: e.target.value })} /></div>
            </div>
            <TranslatedInput
              label="Placeholder"
              value={attrForm.placeholder}
              onChange={(placeholder) => setAttrForm({ ...attrForm, placeholder })}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2"><Switch checked={attrForm.is_required} onCheckedChange={(c) => setAttrForm({ ...attrForm, is_required: c })} /><span className="text-sm">Majburiy</span></div>
              <div className="flex items-center gap-2"><Switch checked={attrForm.is_filterable} onCheckedChange={(c) => setAttrForm({ ...attrForm, is_filterable: c })} /><span className="text-sm">Filter</span></div>
              <div className="flex items-center gap-2"><Switch checked={attrForm.show_in_card} onCheckedChange={(c) => setAttrForm({ ...attrForm, show_in_card: c })} /><span className="text-sm">Kartada</span></div>
              <div className="flex items-center gap-2"><Switch checked={attrForm.is_active} onCheckedChange={(c) => setAttrForm({ ...attrForm, is_active: c })} /><span className="text-sm">Faol</span></div>
            </div>

            {needsOptions && (
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <Label>Variantlar</Label>
                  <Button size="sm" variant="outline" onClick={() => setAttrForm({ ...attrForm, options: [...attrForm.options, { label: {}, value: '' }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Qo'shish
                  </Button>
                </div>
                {attrForm.options.length === 0 && <p className="text-xs text-muted-foreground italic">Variant qo'shing</p>}
                <div className="space-y-2">
                  {attrForm.options.map((o: any, i: number) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <OptionLabelInput
                        label={o.label}
                        onChange={(label) => {
                          const arr = [...attrForm.options];
                          const baseName = label[defaultLanguage] || '';
                          arr[i] = { ...arr[i], label, value: arr[i].value || slugify(baseName) };
                          setAttrForm({ ...attrForm, options: arr });
                        }}
                      />
                      <Input className="col-span-7" placeholder="value" value={o.value} onChange={(e) => { const arr = [...attrForm.options]; arr[i] = { ...arr[i], value: e.target.value }; setAttrForm({ ...attrForm, options: arr }); }} />
                      <Button size="icon" variant="ghost" className="col-span-1" onClick={() => setAttrForm({ ...attrForm, options: attrForm.options.filter((_: any, idx: number) => idx !== i) })}><X className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </LanguageTabsProvider>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttrDialog(false)}>Bekor</Button>
            <Button onClick={saveAttr}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
