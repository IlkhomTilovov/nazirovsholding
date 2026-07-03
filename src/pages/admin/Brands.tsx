import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Image as ImageIcon, Search, Globe,
  AlertTriangle, Package, ExternalLink, X, Loader2, Upload, Award, Settings2,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLanguages } from '@/hooks/useLanguages';
import { TranslatedInput } from '@/components/admin/translated/TranslatedInput';
import { TranslatedTextarea } from '@/components/admin/translated/TranslatedTextarea';

interface Brand {
  id: string;
  name: Record<string, string>;
  slug: string;
  logo: string | null;
  banner: string | null;
  description: Record<string, string>;
  website: string | null;
  is_active: boolean;
  sort_order: number;
  meta_title: Record<string, string>;
  meta_description: Record<string, string>;
  meta_keywords: string | null;
  is_indexed: boolean;
  is_followed: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: Record<string, string>;
  slug: string;
  logo: string;
  banner: string;
  description: Record<string, string>;
  website: string;
  is_active: boolean;
  sort_order: number;
  meta_title: Record<string, string>;
  meta_description: Record<string, string>;
  meta_keywords: string;
  is_indexed: boolean;
  is_followed: boolean;
}

const initialFormData: FormData = {
  name: {}, slug: '',
  logo: '', banner: '',
  description: {},
  website: '',
  is_active: true, sort_order: 0,
  meta_title: {}, meta_description: {},
  meta_keywords: '',
  is_indexed: true, is_followed: true,
};

const translitMap: Record<string, string> = {
  'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'x','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya','ў':'o','қ':'q','ғ':'g','ҳ':'h',
};

const generateSlug = (name: string) =>
  name.toLowerCase().split('').map(c => translitMap[c] ?? c).join('')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();

export default function Brands() {
  const { languages, defaultLanguage } = useLanguages();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [slugError, setSlugError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const upload = async (file: File, folder: 'logos' | 'banners'): Promise<string | null> => {
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Faqat rasm formatlari ruxsat etiladi' });
      return null;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Rasm hajmi 10MB dan oshmasligi kerak' });
      return null;
    }
    const webpFile = await toWebP(file);
    const ext = webpFile.name.split('.').pop();
    const path = `${folder}/brand-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('brand-images').upload(path, webpFile, { upsert: true });
    if (error) {
      toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('brand-images').getPublicUrl(path);
    return publicUrl;
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    const url = await upload(file, 'logos');
    if (url) setFormData(prev => ({ ...prev, logo: url }));
    setUploadingLogo(false);
  };

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true);
    const url = await upload(file, 'banners');
    if (url) setFormData(prev => ({ ...prev, banner: url }));
    setUploadingBanner(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('brands').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      setBrands((data || []) as unknown as Brand[]);

      const { data: products } = await supabase.from('products').select('brand_id');
      const counts: Record<string, number> = {};
      (products || []).forEach((p: any) => {
        if (p.brand_id) counts[p.brand_id] = (counts[p.brand_id] || 0) + 1;
      });
      setProductCounts(counts);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const checkSlugUnique = async (slug: string, excludeId?: string): Promise<boolean> => {
    const q = supabase.from('brands').select('id').eq('slug', slug);
    if (excludeId) q.neq('id', excludeId);
    const { data } = await q;
    return !data || data.length === 0;
  };

  const openCreate = () => {
    setSelected(null);
    setFormData({ ...initialFormData, sort_order: brands.length });
    setSlugError(''); setActiveTab('general'); setDialogOpen(true);
  };

  const openEdit = (b: Brand) => {
    setSelected(b);
    setFormData({
      name: b.name || {}, slug: b.slug,
      logo: b.logo || '', banner: b.banner || '',
      description: b.description || {},
      website: b.website || '',
      is_active: b.is_active, sort_order: b.sort_order,
      meta_title: b.meta_title || {}, meta_description: b.meta_description || {},
      meta_keywords: b.meta_keywords || '',
      is_indexed: b.is_indexed, is_followed: b.is_followed,
    });
    setSlugError(''); setActiveTab('general'); setDialogOpen(true);
  };

  const handleNameChange = (name: Record<string, string>) => {
    const baseName = name[defaultLanguage] || '';
    const prevBaseName = formData.name[defaultLanguage] || '';
    setFormData((p) => ({
      ...p,
      name,
      slug: !p.slug || p.slug === generateSlug(prevBaseName) ? generateSlug(baseName) : p.slug,
    }));
  };

  const handleSlugChange = async (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-');
    setFormData({ ...formData, slug: clean });
    if (clean) {
      const ok = await checkSlugUnique(clean, selected?.id);
      setSlugError(ok ? '' : 'Bu slug allaqachon mavjud');
    } else setSlugError('');
  };

  const handleSubmit = async () => {
    const hasAllNames = languages.every((lang) => formData.name[lang.code]?.trim());
    if (!hasAllNames) {
      toast({ variant: 'destructive', title: 'Xatolik', description: "Barcha tillar uchun brend nomini to'ldiring" });
      return;
    }
    const baseName = formData.name[defaultLanguage] || '';
    const slug = formData.slug || generateSlug(baseName);
    const ok = await checkSlugUnique(slug, selected?.id);
    if (!ok) { setSlugError('Bu slug allaqachon mavjud'); return; }

    const payload = {
      name: formData.name,
      slug,
      logo: formData.logo || null,
      banner: formData.banner || null,
      description: formData.description,
      website: formData.website || null,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      meta_keywords: formData.meta_keywords || null,
      is_indexed: formData.is_indexed,
      is_followed: formData.is_followed,
    };

    try {
      if (selected) {
        const { error } = await supabase.from('brands').update(payload).eq('id', selected.id);
        if (error) throw error;
        toast({ title: 'Muvaffaqiyat', description: 'Brend yangilandi' });
      } else {
        const { error } = await supabase.from('brands').insert([payload]);
        if (error) throw error;
        toast({ title: 'Muvaffaqiyat', description: 'Brend yaratildi' });
      }
      setDialogOpen(false);
      fetchBrands();
    } catch (err: any) {
      if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
        setSlugError('Bu slug allaqachon mavjud');
      } else toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const count = productCounts[selected.id] || 0;
    if (count > 0) {
      toast({ variant: 'destructive', title: "O'chirib bo'lmaydi", description: `Bu brendda ${count} ta mahsulot bor.` });
      setDeleteDialogOpen(false);
      return;
    }
    try {
      const { error } = await supabase.from('brands').delete().eq('id', selected.id);
      if (error) throw error;
      toast({ title: 'Muvaffaqiyat', description: "Brend o'chirildi" });
      setDeleteDialogOpen(false);
      fetchBrands();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    }
  };

  const toggleStatus = async (b: Brand) => {
    try {
      const { error } = await supabase.from('brands').update({ is_active: !b.is_active }).eq('id', b.id);
      if (error) throw error;
      fetchBrands();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: err.message });
    }
  };

  const filtered = brands.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(b.name || {}).some((n) => n.toLowerCase().includes(q)) || b.slug.toLowerCase().includes(q);
  });

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
          <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6" />Brendlar</h1>
          <p className="text-muted-foreground">Brendlar ro'yxatini boshqaring</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Yangi brend</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Brend nomi yoki slug..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Barcha brendlar ({filtered.length})</span>
            <Badge variant="outline" className="font-normal">{brands.filter(b => b.is_active).length} faol</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Logo</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Mahsulotlar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(b => {
                const count = productCounts[b.id] || 0;
                const name = getTranslated(b.name, defaultLanguage, defaultLanguage);
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      {b.logo ? (
                        <img src={b.logo} alt={name} className="h-12 w-12 object-contain rounded-lg border bg-white p-1" />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{name}</p>
                        {languages.filter((l) => l.code !== defaultLanguage).map((l) => (
                          <p key={l.code} className="text-sm text-muted-foreground">{b.name?.[l.code]}</p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">/brand/{b.slug}</code></TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1"><Package className="h-3 w-3" />{count}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.is_active ? 'default' : 'secondary'}>{b.is_active ? 'Faol' : 'Nofaol'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                          <Link to={`/admin/brands/${b.id}`}>
                            <Settings2 className="h-3.5 w-3.5" />Boshqarish
                          </Link>
                        </Button>
                        <a href={`/brand/${b.slug}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Switch checked={b.is_active} onCheckedChange={() => toggleStatus(b)} />
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelected(b); setDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Award className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Brendlar topilmadi</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? 'Brendni tahrirlash' : 'Yangi brend'}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Asosiy</TabsTrigger>
              <TabsTrigger value="seo" className="gap-2"><Globe className="h-4 w-4" />SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <TranslatedInput
                label="Nomi"
                required
                languages={languages}
                value={formData.name}
                onChange={handleNameChange}
                placeholder={{ uz: "O'zbek tilida", ru: 'На русском' }}
              />

              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input value={formData.slug} onChange={e => handleSlugChange(e.target.value)} placeholder="avtomatik" className={slugError ? 'border-destructive' : ''} />
                {slugError ? <p className="text-sm text-destructive">{slugError}</p> :
                  <p className="text-sm text-muted-foreground">URL: /brand/{formData.slug || 'slug'}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <input type="file" ref={logoRef} accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = ''; }} />
                  {formData.logo ? (
                    <div className="relative inline-block">
                      <img src={formData.logo} alt="Logo" className="h-32 w-32 object-contain rounded-lg border bg-white p-2" />
                      <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => setFormData(p => ({ ...p, logo: '' }))}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="h-32 w-32 flex flex-col items-center gap-2 border-dashed"
                      onClick={() => logoRef.current?.click()} disabled={uploadingLogo}>
                      {uploadingLogo ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Upload className="h-6 w-6" /><span className="text-xs">Logo yuklash</span></>}
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Banner</Label>
                  <input type="file" ref={bannerRef} accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); e.target.value = ''; }} />
                  {formData.banner ? (
                    <div className="relative inline-block">
                      <img src={formData.banner} alt="Banner" className="h-32 w-56 object-cover rounded-lg border" />
                      <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => setFormData(p => ({ ...p, banner: '' }))}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="h-32 w-56 flex flex-col items-center gap-2 border-dashed"
                      onClick={() => bannerRef.current?.click()} disabled={uploadingBanner}>
                      {uploadingBanner ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Upload className="h-6 w-6" /><span className="text-xs">Banner yuklash</span></>}
                    </Button>
                  )}
                </div>
              </div>

              <TranslatedTextarea
                label="Tavsif"
                languages={languages}
                value={formData.description}
                onChange={(description) => setFormData({ ...formData, description })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Veb-sayt</Label>
                  <Input type="url" placeholder="https://..." value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tartib raqami</Label>
                  <Input type="number" value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={formData.is_active} onCheckedChange={c => setFormData({ ...formData, is_active: c })} />
                <Label>Faol</Label>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <TranslatedInput
                label="Meta Title"
                languages={languages}
                value={formData.meta_title}
                onChange={(meta_title) => setFormData({ ...formData, meta_title })}
                placeholder={formData.name}
              />
              <Separator />
              <TranslatedTextarea
                label="Meta Description"
                languages={languages}
                value={formData.meta_description}
                onChange={(meta_description) => setFormData({ ...formData, meta_description })}
              />
              <Separator />
              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Input value={formData.meta_keywords} onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Switch checked={formData.is_indexed} onCheckedChange={c => setFormData({ ...formData, is_indexed: c })} />
                  <Label>Indexlash</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={formData.is_followed} onCheckedChange={c => setFormData({ ...formData, is_followed: c })} />
                  <Label>Follow</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleSubmit} disabled={!!slugError}>{selected ? 'Saqlash' : 'Yaratish'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {(productCounts[selected?.id || ''] || 0) > 0 && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              Brendni o'chirish
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(productCounts[selected?.id || ''] || 0) > 0 ? (
                <>"{selected ? getTranslated(selected.name, defaultLanguage, defaultLanguage) : ''}" brendida <strong>{productCounts[selected?.id || '']}</strong> ta mahsulot bor.</>
              ) : (
                <>Haqiqatan ham "{selected ? getTranslated(selected.name, defaultLanguage, defaultLanguage) : ''}" brendini o'chirmoqchimisiz?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            {(productCounts[selected?.id || ''] || 0) === 0 && (
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">O'chirish</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
