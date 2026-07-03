import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2, Upload, Landmark, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toWebP } from '@/lib/imageOptimizer';
import { getTranslated } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguages } from '@/hooks/useLanguages';
import { useOfficialLinks, type OfficialLink } from '@/hooks/useOfficialLinks';
import { TranslatedInput } from '@/components/admin/translated/TranslatedInput';

interface FormData {
  name: Record<string, string>;
  logo: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

const initialForm: FormData = { name: {}, logo: '', url: '', sort_order: 0, is_active: true };

export default function OfficialLinks() {
  const { links, loading, refetch } = useOfficialLinks();
  const { languages, defaultLanguage } = useLanguages();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<OfficialLink | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadLogo = async (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Faqat rasm formatlari' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Maksimum 5MB' });
      return;
    }
    setUploading(true);
    try {
      const webpFile = await toWebP(file);
      const ext = webpFile.name.split('.').pop();
      const path = `official-links/link-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('brand-images').upload(path, webpFile, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('brand-images').getPublicUrl(path);
      setForm((p) => ({ ...p, logo: publicUrl }));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Yuklash xatosi', description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setSelected(null);
    setForm({ ...initialForm, sort_order: links.length });
    setDialogOpen(true);
  };

  const openEdit = (l: OfficialLink) => {
    setSelected(l);
    setForm({
      name: l.name || {},
      logo: l.logo, url: l.url,
      sort_order: l.sort_order, is_active: l.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const hasAllNames = languages.every((lang) => form.name[lang.code]?.trim());
    if (!hasAllNames || !form.logo || !form.url.trim()) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Barcha tillar uchun nom, logo va havola majburiy' });
      return;
    }
    const payload = {
      name: form.name,
      logo: form.logo,
      url: form.url.trim(),
      sort_order: form.sort_order,
      is_active: form.is_active,
    };
    try {
      if (selected) {
        const { error } = await supabase.from('official_links').update(payload).eq('id', selected.id);
        if (error) throw error;
        toast({ title: 'Yangilandi' });
      } else {
        const { error } = await supabase.from('official_links').insert([payload]);
        if (error) throw error;
        toast({ title: "Qo'shildi" });
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const { error } = await supabase.from('official_links').delete().eq('id', selected.id);
      if (error) throw error;
      toast({ title: "O'chirildi" });
      setDeleteOpen(false);
      refetch();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    }
  };

  const toggleActive = async (l: OfficialLink) => {
    await supabase.from('official_links').update({ is_active: !l.is_active }).eq('id', l.id);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6" /> Rasmiy havolalar
          </h1>
          <p className="text-muted-foreground">Footer'dagi rasmiy tashkilotlar (davlat saytlari) bo'limi</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Yangi havola
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Barcha havolalar ({links.length})</span>
            <Badge variant="outline" className="font-normal">
              {links.filter((l) => l.is_active).length} faol
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Logo</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Havola</TableHead>
                <TableHead className="w-24 text-center">Tartib</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((l) => {
                const name = getTranslated(l.name, defaultLanguage, defaultLanguage);
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      {l.logo ? (
                        <img src={l.logo} alt={name} className="h-12 w-16 object-contain rounded border bg-white p-1" />
                      ) : (
                        <div className="h-12 w-16 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline text-sm">
                        Ochish <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-center">{l.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={l.is_active ? 'default' : 'secondary'}>
                        {l.is_active ? 'Faol' : 'Nofaol'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch checked={l.is_active} onCheckedChange={() => toggleActive(l)} />
                        <Button variant="ghost" size="icon" onClick={() => openEdit(l)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelected(l); setDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {links.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Landmark className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Hozircha havolalar yo'q</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected ? 'Havolani tahrirlash' : 'Yangi havola'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <TranslatedInput
              label="Nomi"
              required
              languages={languages}
              value={form.name}
              onChange={(name) => setForm({ ...form, name })}
              placeholder={{ uz: 'Prezident veb-sayti', ru: 'Сайт Президента' }}
            />

            <div className="space-y-2">
              <Label>Logo *</Label>
              <div className="flex items-center gap-3">
                {form.logo ? (
                  <img src={form.logo} alt="" className="h-16 w-24 object-contain rounded border bg-white p-2" />
                ) : (
                  <div className="h-16 w-24 bg-muted rounded flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                  />
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full">
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploading ? 'Yuklanmoqda...' : 'Logo yuklash'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG/SVG (shaffof fonli) — eng yaxshi natija</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Havola (URL) *</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://president.uz" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tartib</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Holat</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <span className="text-sm">{form.is_active ? 'Faol' : 'Nofaol'}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleSubmit}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Havolani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              "{selected ? getTranslated(selected.name, defaultLanguage, defaultLanguage) : ''}" haqiqatan o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
