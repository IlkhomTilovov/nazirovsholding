import { useState } from 'react';
import { Plus, Star, Languages as LanguagesIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguages, type LanguageDef } from '@/hooks/useLanguages';

interface FormData {
  code: string;
  name: string;
}

const emptyForm: FormData = { code: '', name: '' };

export function LanguagesManager() {
  const { allLanguages, refetch } = useLanguages();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    const code = form.code.trim().toLowerCase();
    const name = form.name.trim();
    if (!/^[a-z]{2,5}$/.test(code)) {
      toast({ variant: 'destructive', title: 'Xatolik', description: "Kod 2-5 ta lotin harfidan iborat bo'lishi kerak (masalan: en)" });
      return;
    }
    if (!name) {
      toast({ variant: 'destructive', title: 'Xatolik', description: "Til nomini kiriting" });
      return;
    }
    if (allLanguages.some((l) => l.code === code)) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Bu kod allaqachon mavjud' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('languages' as any).insert([
        { code, name, sort_order: allLanguages.length, is_active: true, is_default: false },
      ] as any);
      if (error) throw error;
      toast({ title: "Til qo'shildi" });
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (lang: LanguageDef) => {
    if (lang.isDefault) {
      toast({ variant: 'destructive', title: 'Xatolik', description: "Standart tilni faolsizlantirib bo'lmaydi" });
      return;
    }
    const { error } = await supabase.from('languages' as any).update({ is_active: !lang.isActive }).eq('id', lang.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
      return;
    }
    refetch();
  };

  const setAsDefault = async (lang: LanguageDef) => {
    if (lang.isDefault) return;
    try {
      const { error: clearError } = await supabase.from('languages' as any).update({ is_default: false }).eq('is_default', true);
      if (clearError) throw clearError;
      const { error: setError } = await supabase.from('languages' as any).update({ is_default: true, is_active: true }).eq('id', lang.id);
      if (setError) throw setError;
      toast({ title: 'Standart til yangilandi' });
      refetch();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    }
  };

  const renameLanguage = async (lang: LanguageDef, name: string) => {
    if (!name.trim() || name === lang.name) return;
    const { error } = await supabase.from('languages' as any).update({ name: name.trim() }).eq('id', lang.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
      return;
    }
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Til qo'shilgach, barcha kontent formalarida (brendlar, mahsulotlar, loyihalar va h.k.) o'sha til uchun maydon avtomatik chiqadi.
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Til qo'shish
        </Button>
      </div>

      <div className="space-y-2">
        {allLanguages.map((lang) => (
          <div key={lang.id} className="flex items-center justify-between gap-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <Badge variant="outline" className="font-mono uppercase shrink-0">{lang.code}</Badge>
              <Input
                defaultValue={lang.name}
                onBlur={(e) => renameLanguage(lang, e.target.value)}
                className="h-8 max-w-[200px] bg-background"
              />
              {lang.isDefault && (
                <Badge className="shrink-0 gap-1"><Star className="h-3 w-3" /> Standart</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {!lang.isDefault && (
                <Button variant="outline" size="sm" onClick={() => setAsDefault(lang)}>
                  Standart qilish
                </Button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Faol</span>
                <Switch checked={lang.isActive} onCheckedChange={() => toggleActive(lang)} disabled={lang.isDefault} />
              </div>
            </div>
          </div>
        ))}
        {allLanguages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
            <LanguagesIcon className="h-8 w-8" />
            <p>Hozircha tillar yo'q</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Yangi til qo'shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kod (masalan: en)</Label>
              <Input value={form.code} maxLength={5} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="en" />
            </div>
            <div className="space-y-2">
              <Label>Nomi</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="English" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleCreate} disabled={saving}>Qo'shish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
