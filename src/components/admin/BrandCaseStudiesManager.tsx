import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toWebP } from '@/lib/imageOptimizer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCaseStudies, countryFlagEmoji, type CaseStudy } from '@/hooks/useCaseStudies';

interface Props {
  brandId: string;
}

interface FormData {
  image: string;
  country_code: string;
  country_name_uz: string;
  country_name_ru: string;
  category_uz: string;
  category_ru: string;
  title_uz: string;
  title_ru: string;
  result_uz: string;
  result_ru: string;
  year: string;
  is_active: boolean;
  sort_order: number;
}

const empty: FormData = {
  image: '', country_code: '', country_name_uz: '', country_name_ru: '',
  category_uz: '', category_ru: '', title_uz: '', title_ru: '',
  result_uz: '', result_ru: '', year: '',
  is_active: true, sort_order: 0,
};

export function BrandCaseStudiesManager({ brandId }: Props) {
  const { caseStudies, loading, refetch } = useCaseStudies(brandId);
  const [dialog, setDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selected, setSelected] = useState<CaseStudy | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const openCreate = () => {
    setSelected(null);
    setForm({ ...empty, sort_order: caseStudies.length });
    setDialog(true);
  };

  const openEdit = (c: CaseStudy) => {
    setSelected(c);
    setForm({
      image: c.image || '',
      country_code: c.country_code, country_name_uz: c.country_name_uz, country_name_ru: c.country_name_ru,
      category_uz: c.category_uz, category_ru: c.category_ru,
      title_uz: c.title_uz, title_ru: c.title_ru,
      result_uz: c.result_uz || '', result_ru: c.result_ru || '',
      year: c.year || '',
      is_active: c.is_active, sort_order: c.sort_order,
    });
    setDialog(true);
  };

  const uploadImage = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Maksimum 10MB' });
      return;
    }
    setUploading(true);
    try {
      const webpFile = await toWebP(file);
      const ext = webpFile.name.split('.').pop();
      const path = `case-studies/${brandId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('brand-images').upload(path, webpFile, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('brand-images').getPublicUrl(path);
      setForm((p) => ({ ...p, image: publicUrl }));
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: e.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title_uz || !form.title_ru || !form.country_code) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Nom (UZ/RU) va davlat kodini to\'ldiring' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        brand_id: brandId,
        image: form.image || null,
        country_code: form.country_code.trim().toUpperCase(),
        country_name_uz: form.country_name_uz.trim(),
        country_name_ru: form.country_name_ru.trim(),
        category_uz: form.category_uz.trim(),
        category_ru: form.category_ru.trim(),
        title_uz: form.title_uz.trim(),
        title_ru: form.title_ru.trim(),
        result_uz: form.result_uz || null,
        result_ru: form.result_ru || null,
        year: form.year || null,
        is_active: form.is_active,
        sort_order: form.sort_order,
      };
      if (selected) {
        const { error } = await supabase.from('brand_case_studies').update(payload).eq('id', selected.id);
        if (error) throw error;
        toast({ title: 'Yangilandi' });
      } else {
        const { error } = await supabase.from('brand_case_studies').insert([payload]);
        if (error) throw error;
        toast({ title: 'Yaratildi' });
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
      const { error } = await supabase.from('brand_case_studies').delete().eq('id', selected.id);
      if (error) throw error;
      toast({ title: "O'chirildi" });
      setConfirmDelete(false);
      refetch();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: e.message });
    }
  };

  const toggleActive = async (c: CaseStudy) => {
    await supabase.from('brand_case_studies').update({ is_active: !c.is_active }).eq('id', c.id);
    refetch();
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Loyihalar (Case Studies)</h3>
          <p className="text-sm text-muted-foreground">Brend sahifasidagi "Featured Global Projects" bo'limi</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Yangi loyiha</Button>
      </div>

      {caseStudies.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <p className="mb-4">Hozircha loyihalar yo'q</p>
          <Button variant="outline" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Birinchi loyihani qo'shing</Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {caseStudies.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                {c.image ? (
                  <img src={c.image} alt="" className="h-14 w-14 object-cover rounded-lg" />
                ) : (
                  <div className="h-14 w-14 bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{countryFlagEmoji(c.country_code)} {c.title_uz}</p>
                  <p className="text-sm text-muted-foreground truncate">{c.category_uz} · {c.country_name_uz} · {c.year}</p>
                </div>
                <Badge variant={c.is_active ? 'default' : 'secondary'}>
                  {c.is_active ? 'Faol' : 'Nofaol'}
                </Badge>
                <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { setSelected(c); setConfirmDelete(true); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? 'Loyihani tahrirlash' : 'Yangi loyiha'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rasm</Label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-4 cursor-pointer hover:border-primary transition-colors min-h-[120px] flex items-center justify-center bg-muted/30"
              >
                {form.image ? (
                  <div className="relative w-full">
                    <img src={form.image} alt="" className="max-h-28 mx-auto object-contain rounded" />
                    <Button
                      type="button" size="icon" variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, image: '' })); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-xs">Rasm yuklash</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Davlat kodi (ISO-2) *</Label>
                <Input value={form.country_code} maxLength={2} placeholder="DE"
                  onChange={(e) => setForm((p) => ({ ...p, country_code: e.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-2">
                <Label>Davlat nomi (UZ)</Label>
                <Input value={form.country_name_uz} placeholder="Germaniya"
                  onChange={(e) => setForm((p) => ({ ...p, country_name_uz: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Davlat nomi (RU)</Label>
                <Input value={form.country_name_ru} placeholder="Германия"
                  onChange={(e) => setForm((p) => ({ ...p, country_name_ru: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategoriya (UZ)</Label>
                <Input value={form.category_uz} placeholder="Tekstil ishlab chiqarish"
                  onChange={(e) => setForm((p) => ({ ...p, category_uz: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Kategoriya (RU)</Label>
                <Input value={form.category_ru} placeholder="Текстильное производство"
                  onChange={(e) => setForm((p) => ({ ...p, category_ru: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sarlavha (UZ) *</Label>
                <Input value={form.title_uz} placeholder="Germaniyaga tekstil eksporti"
                  onChange={(e) => setForm((p) => ({ ...p, title_uz: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Sarlavha (RU) *</Label>
                <Input value={form.title_ru} placeholder="Экспорт текстиля в Германию"
                  onChange={(e) => setForm((p) => ({ ...p, title_ru: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Natija (UZ)</Label>
                <Input value={form.result_uz} placeholder="120 konteyner yetkazildi"
                  onChange={(e) => setForm((p) => ({ ...p, result_uz: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Natija (RU)</Label>
                <Input value={form.result_ru} placeholder="Доставлено 120 контейнеров"
                  onChange={(e) => setForm((p) => ({ ...p, result_ru: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Yil</Label>
                <Input value={form.year} placeholder="2024"
                  onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tartib raqami</Label>
                <Input type="number" value={form.sort_order}
                  onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-end gap-3 pb-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
                <Label>Faol</Label>
              </div>
            </div>
          </div>

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
            <AlertDialogTitle>Loyihani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              "{selected?.title_uz}" loyihasi o'chiriladi. Davom etilsinmi?
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
