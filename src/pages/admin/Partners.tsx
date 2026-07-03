import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2, Upload, Handshake, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toWebP } from '@/lib/imageOptimizer';
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

interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string | null;
  sort_order: number;
  is_active: boolean;
}

interface FormData {
  name: string;
  logo: string;
  website: string;
  sort_order: number;
  is_active: boolean;
}

const initialForm: FormData = { name: '', logo: '', website: '', sort_order: 0, is_active: true };

export default function Partners() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
    setItems((data as Partner[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
    const webpFile = await toWebP(file);
    const ext = webpFile.name.split('.').pop();
    const path = `partners/partner-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('brand-images').upload(path, webpFile, { upsert: true });
    if (error) {
      toast({ variant: 'destructive', title: 'Yuklash xatosi', description: error.message });
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('brand-images').getPublicUrl(path);
    setForm(prev => ({ ...prev, logo: publicUrl }));
    setUploading(false);
  };

  const openCreate = () => {
    setSelected(null);
    setForm({ ...initialForm, sort_order: items.length });
    setDialogOpen(true);
  };

  const openEdit = (p: Partner) => {
    setSelected(p);
    setForm({
      name: p.name,
      logo: p.logo,
      website: p.website || '',
      sort_order: p.sort_order,
      is_active: p.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.logo) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Nom va logo majburiy' });
      return;
    }
    const payload = {
      name: form.name.trim(),
      logo: form.logo,
      website: form.website.trim() || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };
    try {
      if (selected) {
        const { error } = await supabase.from('partners').update(payload).eq('id', selected.id);
        if (error) throw error;
        toast({ title: 'Yangilandi' });
      } else {
        const { error } = await supabase.from('partners').insert([payload]);
        if (error) throw error;
        toast({ title: 'Qo\'shildi' });
      }
      setDialogOpen(false);
      fetchItems();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const { error } = await supabase.from('partners').delete().eq('id', selected.id);
      if (error) throw error;
      toast({ title: "O'chirildi" });
      setDeleteOpen(false);
      fetchItems();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    }
  };

  const toggleActive = async (p: Partner) => {
    await supabase.from('partners').update({ is_active: !p.is_active }).eq('id', p.id);
    fetchItems();
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
            <Handshake className="h-6 w-6" /> Hamkorlar
          </h1>
          <p className="text-muted-foreground">Bosh sahifadagi hamkor logolari karuseli</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Yangi hamkor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Barcha hamkorlar ({items.length})</span>
            <Badge variant="outline" className="font-normal">
              {items.filter(p => p.is_active).length} faol
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Logo</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Vebsayt</TableHead>
                <TableHead className="w-24 text-center">Tartib</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.logo ? (
                      <img src={p.logo} alt={p.name} className="h-12 w-16 object-contain rounded border bg-white p-1" />
                    ) : (
                      <div className="h-12 w-16 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    {p.website ? (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline text-sm">
                        Ochish <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell className="text-center">{p.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? 'default' : 'secondary'}>
                      {p.is_active ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelected(p); setDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Handshake className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Hozircha hamkorlar yo'q</p>
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
            <DialogTitle>{selected ? 'Hamkorni tahrirlash' : 'Yangi hamkor'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nomi *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Kompaniya nomi" />
            </div>

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
                    onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                  />
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full">
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploading ? 'Yuklanmoqda...' : 'Logo yuklash'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG/SVG (shaffof fonli) — eng yaxshi natija</p>
                </div>
              </div>
              {form.logo && (
                <Input value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} placeholder="yoki URL" className="text-xs" />
              )}
            </div>

            <div className="space-y-2">
              <Label>Vebsayt</Label>
              <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tartib</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Holat</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
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
            <AlertDialogTitle>Hamkorni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              "{selected?.name}" haqiqatan o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.
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
