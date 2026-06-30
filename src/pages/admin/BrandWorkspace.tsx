import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, Loader2, Upload, X, Image as ImageIcon,
  Settings as SettingsIcon, Globe, Layers, FileImage, BarChart3, Sliders, Award,
  Package, FolderTree, CheckCircle2, FileEdit,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBrandStats } from '@/hooks/useDivisions';
import { BrandDivisionsManager } from '@/components/admin/BrandDivisionsManager';

interface BrandRecord {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz: string | null;
  description_ru: string | null;
  website: string | null;
  is_active: boolean;
  sort_order: number;
  logo: string | null;
  banner: string | null;
  light_logo: string | null;
  dark_logo: string | null;
  thumbnail: string | null;
  cover_image: string | null;
  hero_banner: string | null;
  meta_title_uz: string | null;
  meta_title_ru: string | null;
  meta_description_uz: string | null;
  meta_description_ru: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  og_image: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  show_in_navigation: boolean;
  show_on_homepage: boolean;
  is_featured: boolean;
  default_sort: string;
}

export default function BrandWorkspace() {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brand, setBrand] = useState<BrandRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const [uploadField, setUploadField] = useState<string | null>(null);
  const { stats, loading: statsLoading, refetch: refetchStats } = useBrandStats(brandId);

  useEffect(() => {
    if (!brandId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('brands').select('*').eq('id', brandId).maybeSingle();
      if (error) toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
      setBrand(data as any);
      setLoading(false);
    })();
  }, [brandId, toast]);

  const update = (patch: Partial<BrandRecord>) => setBrand((b) => (b ? { ...b, ...patch } : b));

  const handleSave = async () => {
    if (!brand) return;
    setSaving(true);
    try {
      const { id, ...payload } = brand;
      const { error } = await supabase.from('brands').update(payload as any).eq('id', id);
      if (error) throw error;
      toast({ title: 'Saqlandi', description: 'Brend yangilandi' });
      refetchStats();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File, field: keyof BrandRecord) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Maksimum 10MB' });
      return;
    }
    setUploadField(field as string);
    try {
      const ext = file.name.split('.').pop();
      const path = `brand-${brandId}/${String(field)}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('brand-images').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('brand-images').getPublicUrl(path);
      update({ [field]: publicUrl } as any);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: e.message });
    } finally {
      setUploadField(null);
    }
  };

  const ImageDrop = ({ field, label, aspect = 'aspect-square' }: { field: keyof BrandRecord; label: string; aspect?: string }) => {
    const ref = useRef<HTMLInputElement>(null);
    const value = brand?.[field] as string | null;
    return (
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
        <div
          onClick={() => ref.current?.click()}
          className={`border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-muted/50 transition-all bg-muted/20 ${aspect} flex items-center justify-center relative overflow-hidden group`}
        >
          {value ? (
            <>
              <img src={value} alt="" className="w-full h-full object-contain p-3" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); update({ [field]: null } as any); }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : uploadField === field ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-center text-muted-foreground p-3">
              <Upload className="h-5 w-5 mx-auto mb-1.5" />
              <p className="text-xs">Yuklash</p>
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
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!brand) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground mb-4">Brend topilmadi</p>
        <Button asChild variant="outline"><Link to="/admin/brands"><ArrowLeft className="h-4 w-4 mr-2" />Brendlarga qaytish</Link></Button>
      </div>
    );
  }

  const tabs = [
    { v: 'general', label: 'Asosiy', icon: SettingsIcon },
    { v: 'seo', label: 'SEO', icon: Globe },
    { v: 'divisions', label: "Bo'limlar", icon: Layers },
    { v: 'media', label: 'Media', icon: FileImage },
    { v: 'stats', label: 'Statistika', icon: BarChart3 },
    { v: 'settings', label: 'Sozlamalar', icon: Sliders },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/brands" className="hover:text-foreground">Brendlar</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{brand.name_uz}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b">
        <div className="flex items-center gap-4">
          {brand.logo ? (
            <img src={brand.logo} alt="" className="h-16 w-16 rounded-xl object-contain bg-white p-1 border" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
              <Award className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{brand.name_uz}</h1>
              <Badge variant={brand.is_active ? 'default' : 'secondary'}>
                {brand.is_active ? 'Faol' : 'Nofaol'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{brand.name_ru} · /brand/{brand.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/brands')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Orqaga
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Saqlash
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-6 h-auto p-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.v} value={t.v} className="gap-2">
              <t.icon className="h-4 w-4" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>Asosiy ma'lumotlar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nomi (UZ) *</Label>
                  <Input value={brand.name_uz} onChange={(e) => update({ name_uz: e.target.value })} /></div>
                <div className="space-y-2"><Label>Nomi (RU) *</Label>
                  <Input value={brand.name_ru} onChange={(e) => update({ name_ru: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Slug (URL)</Label>
                <Input value={brand.slug} onChange={(e) => update({ slug: e.target.value })} />
                <p className="text-xs text-muted-foreground">/brand/{brand.slug}</p></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Qisqa tavsif (UZ)</Label>
                  <Textarea rows={3} value={brand.description_uz || ''} onChange={(e) => update({ description_uz: e.target.value })} /></div>
                <div className="space-y-2"><Label>Qisqa tavsif (RU)</Label>
                  <Textarea rows={3} value={brand.description_ru || ''} onChange={(e) => update({ description_ru: e.target.value })} /></div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2"><Label>Veb-sayt</Label>
                  <Input type="url" value={brand.website || ''} onChange={(e) => update({ website: e.target.value })} placeholder="https://..." /></div>
                <div className="space-y-2"><Label>Tartib raqami</Label>
                  <Input type="number" value={brand.sort_order} onChange={(e) => update({ sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={brand.is_active} onCheckedChange={(v) => update({ is_active: v })} />
                <Label>Brend faol</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>SEO sozlamalari</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>SEO Title (UZ)</Label>
                  <Input value={brand.meta_title_uz || ''} onChange={(e) => update({ meta_title_uz: e.target.value })} /></div>
                <div className="space-y-2"><Label>SEO Title (RU)</Label>
                  <Input value={brand.meta_title_ru || ''} onChange={(e) => update({ meta_title_ru: e.target.value })} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Meta Description (UZ)</Label>
                  <Textarea rows={3} value={brand.meta_description_uz || ''} onChange={(e) => update({ meta_description_uz: e.target.value })} /></div>
                <div className="space-y-2"><Label>Meta Description (RU)</Label>
                  <Textarea rows={3} value={brand.meta_description_ru || ''} onChange={(e) => update({ meta_description_ru: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Keywords</Label>
                <Input value={brand.meta_keywords || ''} onChange={(e) => update({ meta_keywords: e.target.value })} placeholder="kalit, soz, lar" /></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Canonical URL</Label>
                  <Input value={brand.canonical_url || ''} onChange={(e) => update({ canonical_url: e.target.value })} placeholder="https://..." /></div>
                <ImageDrop field="og_image" label="OpenGraph rasm" aspect="aspect-video" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Divisions */}
        <TabsContent value="divisions" className="mt-6">
          <Card><CardContent className="pt-6">
            <BrandDivisionsManager brandId={brand.id} />
          </CardContent></Card>
        </TabsContent>

        {/* Media */}
        <TabsContent value="media" className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>Brend rasmlari</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ImageDrop field="logo" label="Logo" />
                <ImageDrop field="light_logo" label="Yorug' logo" />
                <ImageDrop field="dark_logo" label="Qorong'u logo" />
                <ImageDrop field="thumbnail" label="Thumbnail" />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <ImageDrop field="hero_banner" label="Hero Banner" aspect="aspect-video" />
                <ImageDrop field="cover_image" label="Cover Image" aspect="aspect-video" />
              </div>
              <div className="mt-6">
                <ImageDrop field="banner" label="Banner" aspect="aspect-[3/1]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard icon={Layers} label="Bo'limlar" value={stats.divisions} loading={statsLoading} color="bg-blue-500/10 text-blue-600" />
            <StatCard icon={FolderTree} label="Toifalar" value={stats.categories} loading={statsLoading} color="bg-purple-500/10 text-purple-600" />
            <StatCard icon={Package} label="Mahsulotlar" value={stats.products} loading={statsLoading} color="bg-amber-500/10 text-amber-600" />
            <StatCard icon={CheckCircle2} label="Faol" value={stats.publishedProducts} loading={statsLoading} color="bg-emerald-500/10 text-emerald-600" />
            <StatCard icon={FileEdit} label="Qoralama" value={stats.draftProducts} loading={statsLoading} color="bg-gray-500/10 text-gray-600" />
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>Brend ranglari</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <ColorField label="Primary" value={brand.primary_color} onChange={(v) => update({ primary_color: v })} />
                <ColorField label="Secondary" value={brand.secondary_color} onChange={(v) => update({ secondary_color: v })} />
                <ColorField label="Accent" value={brand.accent_color} onChange={(v) => update({ accent_color: v })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ko'rinish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <SettingRow label="Bosh sahifada featured" checked={brand.is_featured} onChange={(v) => update({ is_featured: v })} />
              <SettingRow label="Navigatsiyada ko'rsatish" checked={brand.show_in_navigation} onChange={(v) => update({ show_in_navigation: v })} />
              <SettingRow label="Bosh sahifada ko'rsatish" checked={brand.show_on_homepage} onChange={(v) => update({ show_on_homepage: v })} />
              <div className="space-y-2 pt-2">
                <Label>Default tartiblash</Label>
                <select
                  value={brand.default_sort}
                  onChange={(e) => update({ default_sort: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="sort_order">Tartib raqami</option>
                  <option value="created_desc">Eng yangi</option>
                  <option value="price_asc">Narx (oshib)</option>
                  <option value="price_desc">Narx (kamayib)</option>
                  <option value="name_asc">Nom (A-Z)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, loading, color }: {
  icon: any; label: string; value: number; loading: boolean; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`inline-flex items-center justify-center h-10 w-10 rounded-lg mb-3 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : value}
        </p>
      </CardContent>
    </Card>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 rounded-md border cursor-pointer"
        />
        <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
      </div>
    </div>
  );
}

function SettingRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <Label className="cursor-pointer">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
