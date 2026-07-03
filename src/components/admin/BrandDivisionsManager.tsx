import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toWebP } from '@/lib/imageOptimizer';
import { getTranslated } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguages } from '@/hooks/useLanguages';
import { useDivisions, type BusinessDivision } from '@/hooks/useDivisions';
import { TranslatedInput } from '@/components/admin/translated/TranslatedInput';
import { TranslatedTextarea } from '@/components/admin/translated/TranslatedTextarea';
import { TranslatedListField } from '@/components/admin/translated/TranslatedListField';
import { LanguageTabsProvider } from '@/components/admin/translated/LanguageTabsProvider';
import { LanguageTabBar } from '@/components/admin/translated/LanguageTabBar';

interface Props {
  brandId: string;
}

const translitMap: Record<string, string> = {
  'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'x','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya','ў':'o','қ':'q','ғ':'g','ҳ':'h',
};
const slugify = (n: string) =>
  n.toLowerCase().split('').map((c) => translitMap[c] ?? c).join('')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

interface DivFormData {
  name: Record<string, string>;
  slug: string;
  description: Record<string, string>;
  benefits: Record<string, string>;
  icon: string;
  cover_image: string;
  banner: string;
  hero_image: string;
  meta_title: Record<string, string>;
  meta_description: Record<string, string>;
  meta_keywords: string;
  is_active: boolean;
  sort_order: number;
}

const empty: DivFormData = {
  name: {}, slug: '',
  description: {}, benefits: {},
  icon: '', cover_image: '', banner: '', hero_image: '',
  meta_title: {}, meta_description: {}, meta_keywords: '',
  is_active: true, sort_order: 0,
};

export function BrandDivisionsManager({ brandId }: Props) {
  const { divisions, loading, refetch } = useDivisions(brandId);
  const { languages, defaultLanguage } = useLanguages();
  const [dialog, setDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selected, setSelected] = useState<BusinessDivision | null>(null);
  const [form, setForm] = useState<DivFormData>(empty);
  const [tab, setTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [uploadField, setUploadField] = useState<string | null>(null);
  const { toast } = useToast();

  const openCreate = () => {
    setSelected(null);
    setForm({ ...empty, sort_order: divisions.length });
    setTab('general');
    setDialog(true);
  };

  const openEdit = (d: BusinessDivision) => {
    setSelected(d);
    const benefits: Record<string, string> = {};
    for (const lang of languages) benefits[lang.code] = (d.benefits?.[lang.code] || []).join('\n');
    setForm({
      name: d.name || {}, slug: d.slug,
      description: d.description || {},
      benefits,
      icon: d.icon || '', cover_image: d.cover_image || '',
      banner: d.banner || '', hero_image: d.hero_image || '',
      meta_title: d.meta_title || {}, meta_description: d.meta_description || {},
      meta_keywords: d.meta_keywords || '',
      is_active: d.is_active, sort_order: d.sort_order,
    });
    setTab('general');
    setDialog(true);
  };

  const uploadImage = async (file: File, field: keyof DivFormData) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Maksimum 10MB' });
      return;
    }
    setUploadField(field as string);
    try {
      const webpFile = await toWebP(file);
      const ext = webpFile.name.split('.').pop();
      const path = `divisions/${brandId}/${field}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('brand-images').upload(path, webpFile, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('brand-images').getPublicUrl(path);
      setForm((p) => ({ ...p, [field]: publicUrl }));
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: e.message });
    } finally {
      setUploadField(null);
    }
  };

  const handleSubmit = async () => {
    const hasAllNames = languages.every((lang) => form.name[lang.code]?.trim());
    if (!hasAllNames) {
      toast({ variant: 'destructive', title: 'Xatolik', description: "Barcha tillar uchun nomni to'ldiring" });
      return;
    }
    const baseName = form.name[defaultLanguage] || Object.values(form.name)[0] || '';
    const slug = form.slug || slugify(baseName);
    const benefits: Record<string, string[]> = {};
    for (const lang of languages) benefits[lang.code] = (form.benefits[lang.code] || '').split('\n').map((s) => s.trim()).filter(Boolean);
    setSaving(true);
    try {
      const payload = {
        brand_id: brandId,
        name: form.name,
        slug,
        description: form.description,
        benefits,
        icon: form.icon || null,
        cover_image: form.cover_image || null,
        banner: form.banner || null,
        hero_image: form.hero_image || null,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        meta_keywords: form.meta_keywords || null,
        is_active: form.is_active,
        sort_order: form.sort_order,
      };
      if (selected) {
        const { error } = await supabase.from('business_divisions').update(payload).eq('id', selected.id);
        if (error) throw error;
        toast({ title: 'Yangilandi', description: 'Bo\'lim yangilandi' });
      } else {
        const { error } = await supabase.from('business_divisions').insert([payload] as any);
        if (error) throw error;
        toast({ title: 'Yaratildi', description: 'Yangi bo\'lim qo\'shildi' });
      }
      setDialog(false);
      refetch();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const { error } = await supabase.from('business_divisions').delete().eq('id', selected.id);
      if (error) throw error;
      toast({ title: 'O\'chirildi', description: 'Bo\'lim o\'chirildi' });
      setConfirmDelete(false);
      refetch();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: e.message });
    }
  };

  const toggleActive = async (d: BusinessDivision) => {
    await supabase.from('business_divisions').update({ is_active: !d.is_active }).eq('id', d.id);
    refetch();
  };

  const ImageUpload = ({ field, label }: { field: keyof DivFormData; label: string }) => {
    const ref = useRef<HTMLInputElement>(null);
    const value = form[field] as string;
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div
          onClick={() => ref.current?.click()}
          className="border-2 border-dashed rounded-xl p-4 cursor-pointer hover:border-primary transition-colors min-h-[140px] flex items-center justify-center bg-muted/30"
        >
          {value ? (
            <div className="relative w-full">
              <img src={value} alt="" className="max-h-32 mx-auto object-contain rounded" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, [field]: '' })); }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : uploadField === field ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="text-center text-muted-foreground">
              <Upload className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs">{label} yuklash</p>
            </div>
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], field)}
        />
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bo'limlar (Business Divisions)</h3>
          <p className="text-sm text-muted-foreground">Brendning ichki bo'limlari</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Yangi bo'lim</Button>
      </div>

      {divisions.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <p className="mb-4">Hozircha bo'limlar yo'q</p>
          <Button variant="outline" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Birinchi bo'limni qo'shing</Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {divisions.map((d) => {
            const name = getTranslated(d.name, defaultLanguage, defaultLanguage);
            return (
              <Card key={d.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  {d.cover_image ? (
                    <img src={d.cover_image} alt="" className="h-14 w-14 object-cover rounded-lg" />
                  ) : (
                    <div className="h-14 w-14 bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{name}</p>
                    <p className="text-sm text-muted-foreground truncate">/{d.slug}</p>
                  </div>
                  <Badge variant={d.is_active ? 'default' : 'secondary'}>
                    {d.is_active ? 'Faol' : 'Nofaol'}
                  </Badge>
                  <Switch checked={d.is_active} onCheckedChange={() => toggleActive(d)} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { setSelected(d); setConfirmDelete(true); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? 'Bo\'limni tahrirlash' : 'Yangi bo\'lim'}</DialogTitle>
          </DialogHeader>
          <LanguageTabsProvider languages={languages} defaultLanguage={defaultLanguage}>
          <LanguageTabBar />
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Asosiy</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <TranslatedInput
                label="Nomi"
                required
                value={form.name}
                onChange={(name) => {
                  const baseName = name[defaultLanguage] || '';
                  const prevBaseName = form.name[defaultLanguage] || '';
                  setForm((p) => ({
                    ...p,
                    name,
                    slug: !p.slug || p.slug === slugify(prevBaseName) ? slugify(baseName) : p.slug,
                  }));
                }}
              />
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} placeholder="avtomatik" />
              </div>
              <TranslatedTextarea
                label="Qisqa tavsif"
                value={form.description}
                onChange={(description) => setForm((p) => ({ ...p, description }))}
              />
              <TranslatedListField
                label="Nima olasiz"
                hint="har bir qator alohida band"
                value={form.benefits}
                onChange={(benefits) => setForm((p) => ({ ...p, benefits }))}
                placeholder={{ uz: 'Tez va aniq diagnostika\nTajribali mutaxassislar bilan konsultatsiya', ru: 'Быстрая и точная диагностика\nКонсультация опытных специалистов' }}
              />
              <div className="grid grid-cols-2 gap-4">
                <ImageUpload field="icon" label="Ikonka" />
                <ImageUpload field="cover_image" label="Cover Image" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tartib raqami</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="flex items-end gap-3 pb-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
                  <Label>Faol</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <TranslatedInput
                label="Meta Title"
                value={form.meta_title}
                onChange={(meta_title) => setForm((p) => ({ ...p, meta_title }))}
              />
              <TranslatedTextarea
                label="Meta Description"
                value={form.meta_description}
                onChange={(meta_description) => setForm((p) => ({ ...p, meta_description }))}
              />
              <div className="space-y-2"><Label>Keywords</Label>
                <Input value={form.meta_keywords} onChange={(e) => setForm((p) => ({ ...p, meta_keywords: e.target.value }))} placeholder="kalit, soz, lar" /></div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <ImageUpload field="banner" label="Banner" />
                <ImageUpload field="hero_image" label="Hero Image" />
              </div>
            </TabsContent>
          </Tabs>
          </LanguageTabsProvider>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Bekor qilish</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {selected ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bo'limni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              "{selected ? getTranslated(selected.name, defaultLanguage, defaultLanguage) : ''}" bo'limi o'chiriladi. Bog'liq kategoriyalardan bog'lanish olib tashlanadi. Davom etilsinmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
