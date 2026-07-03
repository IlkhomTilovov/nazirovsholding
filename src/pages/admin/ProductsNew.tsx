import { useEffect, useState, useRef } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Image as ImageIcon, 
  X, 
  Upload, 
  Globe,
  Search,
  Star,
  Package,
  GripVertical,
  RefreshCw,
  Video
} from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useLanguages } from '@/hooks/useLanguages';
import { getTranslated } from '@/lib/i18n';
import { useBrands } from '@/hooks/useBrands';
import { useDivisions } from '@/hooks/useDivisions';
import { AddMediaModal, MediaItem } from '@/components/admin/AddMediaModal';
import { MediaGrid } from '@/components/admin/MediaGrid';
import { DynamicAttributesForm } from '@/components/admin/DynamicAttributesForm';
import { saveProductAttributeValues, fetchCategoryAttributes, type Attribute } from '@/hooks/useAttributes';
import { TranslatedInput } from '@/components/admin/translated/TranslatedInput';
import { TranslatedTextarea } from '@/components/admin/translated/TranslatedTextarea';
import { LanguageTabsProvider, useLanguageTabs } from '@/components/admin/translated/LanguageTabsProvider';
import { LanguageTabBar } from '@/components/admin/translated/LanguageTabBar';

interface Category {
  id: string;
  name: Record<string, string>;
}

interface Product {
  id: string;
  name: Record<string, string>;
  slug: string | null;
  description: Record<string, string>;
  full_description: Record<string, string>;
  category_id: string | null;
  brand_id: string | null;
  price: number | null;
  original_price: number | null;
  images: string[];
  materials: string[];
  sizes: string[];
  colors: string[];
  is_negotiable: boolean;
  in_stock: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  meta_title: Record<string, string>;
  meta_description: Record<string, string>;
  meta_keywords: string | null;
  is_indexed: boolean;
  is_followed: boolean;
  target_keyword: string | null;
  keyword_variations: string[] | null;
  keyword: Record<string, string> | null;
  variants: Record<string, string[]> | null;
}

interface FormData {
  name: Record<string, string>;
  slug: string;
  description: Record<string, string>;
  full_description: Record<string, string>;
  category_id: string;
  brand_id: string;
  price: string;
  original_price: string;
  images: string[];
  is_negotiable: boolean;
  in_stock: boolean;
  is_featured: boolean;
  is_active: boolean;
  meta_title: Record<string, string>;
  meta_description: Record<string, string>;
  meta_keywords: string;
  is_indexed: boolean;
  is_followed: boolean;
  target_keyword: string;
  keyword_variations: string[];
  keyword: Record<string, string>;
  variants: Record<string, string[]>;
}

const emptyForm: FormData = {
  name: {},
  slug: '',
  description: {},
  full_description: {},
  category_id: '',
  brand_id: '',
  price: '',
  original_price: '',
  images: [],
  is_negotiable: false,
  in_stock: true,
  is_featured: false,
  is_active: true,
  meta_title: {},
  meta_description: {},
  meta_keywords: '',
  is_indexed: true,
  is_followed: true,
  target_keyword: '',
  keyword_variations: [],
  keyword: {},
  variants: {},
};

function SeoPreview({ formData }: { formData: FormData }) {
  const { activeLang } = useLanguageTabs();
  const title = formData.meta_title[activeLang] || formData.keyword[activeLang] || formData.name[activeLang];
  const desc = formData.meta_description[activeLang] || formData.description[activeLang] || (activeLang === 'ru' ? 'Мета описание...' : 'Meta tavsif...');
  if (!title) return null;
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-base">📋 Google qidiruv ko'rinishi</h3>
      <div className="bg-card border rounded-lg p-4 space-y-1 max-w-md">
        <p className="text-primary text-lg truncate">{title}</p>
        <p className="text-emerald-600 text-sm">nazirovsholding.lovable.app/product/{formData.slug || 'slug'}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>
      </div>
    </div>
  );
}

function VariantsListEditor({ variants, onChange }: { variants: Record<string, string[]>; onChange: (variants: Record<string, string[]>) => void }) {
  const { activeLang } = useLanguageTabs();
  const list = variants[activeLang] || [];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Variantlar ({activeLang.toUpperCase()})</Label>
        <Button
          type="button" variant="outline" size="sm"
          onClick={() => onChange({ ...variants, [activeLang]: [...list, ''] })}
          className="gap-1 h-7 text-xs"
        >
          <Plus className="h-3 w-3" /> Qo'shish
        </Button>
      </div>
      {list.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={v}
            onChange={(e) => {
              const arr = [...list];
              arr[i] = e.target.value;
              onChange({ ...variants, [activeLang]: arr });
            }}
            placeholder={`Variant ${i + 1}`}
            className="text-sm"
          />
          <Button
            type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
            onClick={() => onChange({ ...variants, [activeLang]: list.filter((_, idx) => idx !== i) })}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      {list.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Hali variant qo'shilmagan</p>
      )}
    </div>
  );
}

const ADMIN_PAGE_SIZE = 20;

export default function ProductsNew() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [slugError, setSlugError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { languages, defaultLanguage } = useLanguages();
  const { brands: brandList } = useBrands(false);
  const { divisions: divisionList } = useDivisions(formData.brand_id || null, false);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');

  // Dynamic attributes state
  const [attrValues, setAttrValues] = useState<Record<string, any>>({});
  const [loadedAttrs, setLoadedAttrs] = useState<Attribute[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch, categoryFilter, statusFilter]);

  // Kategoriya tanlanganda atributlarni darhol yuklash (foydalanuvchi tabni ochmasa ham)
  useEffect(() => {
    const cid = formData.category_id;
    if (!cid) {
      setLoadedAttrs([]);
      setAttributesLoading(false);
      return;
    }
    setAttributesLoading(true);
    fetchCategoryAttributes(cid)
      .then((groups) => {
        const all = groups.flatMap((g) => g.attributes || []);
        setLoadedAttrs(all);
      })
      .catch((e) => console.error('[attrs] preload failed', e))
      .finally(() => setAttributesLoading(false));
  }, [formData.category_id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('sort_order');

      if (error) throw error;
      setCategories((data || []) as unknown as Category[]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Apply filters
      if (debouncedSearch) {
        query = query.or(`name_uz.ilike.%${debouncedSearch}%,name_ru.ilike.%${debouncedSearch}%,slug.ilike.%${debouncedSearch}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      if (statusFilter === 'active') {
        query = query.eq('is_active', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false);
      } else if (statusFilter === 'featured') {
        query = query.eq('is_featured', true);
      } else if (statusFilter === 'out_of_stock') {
        query = query.eq('in_stock', false);
      }

      // Pagination
      const from = (currentPage - 1) * ADMIN_PAGE_SIZE;
      const to = from + ADMIN_PAGE_SIZE - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setProducts((data || []) as unknown as Product[]);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
      toast({ variant: 'destructive', title: 'Xatolik', description: "Ma'lumotlarni yuklashda xatolik" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    const translitMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h'
    };
    
    return name
      .toLowerCase()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const checkSlugUnique = async (slug: string, excludeId?: string): Promise<boolean> => {
    const query = supabase.from('products').select('id').eq('slug', slug);
    if (excludeId) query.neq('id', excludeId);
    const { data } = await query;
    return !data || data.length === 0;
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '—';
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '—';
    const category = categories.find(c => c.id === categoryId);
    return category ? getTranslated(category.name, language, defaultLanguage) : '—';
  };

  // Convert images array to MediaItem array
  const parseImagesForEdit = (images: string[]): MediaItem[] => {
    return images.map(url => {
      // Check if it's a video URL (JSON format stored as string)
      try {
        const parsed = JSON.parse(url);
        if (parsed.type && parsed.url) {
          return parsed as MediaItem;
        }
      } catch {
        // Not JSON, treat as regular image URL
      }
      
      // Check for YouTube embed URL
      if (url.includes('youtube.com/embed')) {
        const videoId = url.split('/embed/')[1]?.split('?')[0];
        return {
          type: 'video' as const,
          url,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          platform: 'youtube' as const
        };
      }
      
      // Check for Instagram embed URL
      if (url.includes('instagram.com')) {
        return {
          type: 'video' as const,
          url,
          platform: 'instagram' as const
        };
      }
      
      return { type: 'image' as const, url };
    });
  };

  // Convert MediaItem array to images array for storage
  const serializeMediaItems = (items: MediaItem[]): string[] => {
    return items.map(item => {
      if (item.type === 'video') {
        return JSON.stringify(item);
      }
      return item.url;
    });
  };

  const openCreateDialog = () => {
    setSelectedProduct(null);
    setFormData(emptyForm);
    setMediaItems([]);
    setSlugError('');
    setActiveTab('basic');
    setAttrValues({});
    setLoadedAttrs([]);
    setAttributesLoading(false);
    setDialogOpen(true);
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, category_id: categoryId });
    setAttrValues({});
    setLoadedAttrs([]);
    setAttributesLoading(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    const parsedMedia = parseImagesForEdit(product.images || []);
    setMediaItems(parsedMedia);
    const keyword = product.keyword || {};
    setFormData({
      name: product.name || {},
      slug: product.slug || '',
      description: product.description || {},
      full_description: product.full_description || {},
      category_id: product.category_id || '',
      brand_id: (product as any).brand_id || '',
      price: product.price?.toString() || '',
      original_price: product.original_price?.toString() || '',
      images: product.images || [],
      is_negotiable: product.is_negotiable,
      in_stock: product.in_stock,
      is_featured: product.is_featured,
      is_active: product.is_active,
      meta_title: product.meta_title || {},
      meta_description: product.meta_description || {},
      meta_keywords: product.meta_keywords || '',
      is_indexed: product.is_indexed ?? true,
      is_followed: product.is_followed ?? true,
      target_keyword: product.target_keyword || '',
      keyword_variations: product.keyword_variations || [],
      keyword: {
        ...keyword,
        [defaultLanguage]: keyword[defaultLanguage] || product.target_keyword || '',
      },
      variants: product.variants || { [defaultLanguage]: product.keyword_variations || [] },
    });
    setSlugError('');
    setActiveTab('basic');
    setLoadedAttrs([]);
    setAttrValues({});
    setAttributesLoading(false);
    // Load saved attribute values for this product
    (async () => {
      const { data } = await supabase.from('product_attribute_values' as any).select('*').eq('product_id', product.id);
      const map: Record<string, any> = {};
      for (const row of (data || []) as any[]) {
        // Pick the first non-null typed value
        if (row.value_json !== null && row.value_json !== undefined) map[row.attribute_id] = row.value_json;
        else if (row.value_number !== null) map[row.attribute_id] = row.value_number;
        else if (row.value_boolean !== null) map[row.attribute_id] = row.value_boolean;
        else map[row.attribute_id] = row.value_text ?? '';
      }
      setAttrValues(map);
    })();
    setDialogOpen(true);
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
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
    setFormData({ ...formData, slug: cleanSlug });
    
    if (cleanSlug) {
      const isUnique = await checkSlugUnique(cleanSlug, selectedProduct?.id);
      setSlugError(isUnique ? '' : 'Bu slug allaqachon mavjud');
    } else {
      setSlugError('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedMedia: MediaItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const webpFile = await toWebP(files[i]);
        const fileExt = webpFile.name.split('.').pop();
        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, webpFile, {
            upsert: true,
            cacheControl: '31536000',
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedMedia.push({ type: 'image', url: publicUrl });
      }

      const newMediaItems = [...mediaItems, ...uploadedMedia];
      setMediaItems(newMediaItems);
      setFormData({ ...formData, images: serializeMediaItems(newMediaItems) });
      toast({ title: 'Muvaffaqiyat', description: `${uploadedMedia.length} ta rasm yuklandi` });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Rasmni yuklashda xatolik: ' + error.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddMedia = (media: MediaItem) => {
    const newMediaItems = [...mediaItems, media];
    setMediaItems(newMediaItems);
    setFormData({ ...formData, images: serializeMediaItems(newMediaItems) });
  };

  const removeMedia = (index: number) => {
    const newMediaItems = mediaItems.filter((_, i) => i !== index);
    setMediaItems(newMediaItems);
    setFormData({ ...formData, images: serializeMediaItems(newMediaItems) });
  };

  const moveMedia = (fromIndex: number, toIndex: number) => {
    const newMediaItems = [...mediaItems];
    const [movedItem] = newMediaItems.splice(fromIndex, 1);
    newMediaItems.splice(toIndex, 0, movedItem);
    setMediaItems(newMediaItems);
    setFormData({ ...formData, images: serializeMediaItems(newMediaItems) });
  };

  const handleSubmit = async () => {
    // Validate required fields
    const hasAllNames = languages.every((lang) => formData.name[lang.code]?.trim());
    if (!hasAllNames) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Barcha tillar uchun mahsulot nomini kiriting' });
      setActiveTab('basic');
      return;
    }

    // Validate category is required
    if (!formData.category_id) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Kategoriyani tanlash majburiy!' });
      setActiveTab('basic');
      return;
    }

    if (attributesLoading) {
      toast({ variant: 'destructive', title: 'Xatolik', description: 'Xususiyatlar yuklanishini kuting' });
      setActiveTab('attributes');
      return;
    }

    const baseName = formData.name[defaultLanguage] || '';
    const slug = formData.slug || generateSlug(baseName);

    const isUnique = await checkSlugUnique(slug, selectedProduct?.id);
    if (!isUnique) {
      setSlugError('Bu slug allaqachon mavjud');
      return;
    }

    const baseKeyword = formData.keyword[defaultLanguage] || '';
    const baseVariants = formData.variants[defaultLanguage] || [];
    const productData = {
      name: formData.name,
      slug,
      description: formData.description,
      full_description: formData.full_description,
      category_id: formData.category_id || null,
      brand_id: formData.brand_id || null,
      price: formData.price ? parseFloat(formData.price) : null,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      images: formData.images,
      materials: [],
      sizes: [],
      colors: [],
      is_negotiable: formData.is_negotiable,
      in_stock: formData.in_stock,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      meta_keywords: formData.meta_keywords || null,
      is_indexed: formData.is_indexed,
      is_followed: formData.is_followed,
      target_keyword: baseKeyword || formData.target_keyword || null,
      keyword_variations: baseVariants.length > 0 ? baseVariants : (formData.keyword_variations || []),
      keyword: formData.keyword,
      variants: formData.variants,
    };

    try {
      let savedId: string | null = selectedProduct?.id || null;
      if (selectedProduct) {
        const { error } = await supabase.from('products').update(productData as any).eq('id', selectedProduct.id);
        if (error) throw error;
        toast({ title: 'Muvaffaqiyat', description: 'Mahsulot yangilandi' });
      } else {
        const { data, error } = await supabase.from('products').insert([productData] as any).select('id').single();
        if (error) throw error;
        savedId = (data as any)?.id || null;
        toast({ title: 'Muvaffaqiyat', description: 'Mahsulot yaratildi' });
      }

      // Save dynamic attribute values and clear incompatible values from previous categories.
      if (savedId) {
        try {
          console.log('[attrs:save]', { loadedAttrs: loadedAttrs.map(a => ({id:a.id, name:a.name?.[defaultLanguage], type:a.field_type})), attrValues });
          await saveProductAttributeValues(savedId, loadedAttrs, attrValues);
        } catch (err: any) {
          console.error('Attribute save error:', err);
          toast({ variant: 'destructive', title: 'Xususiyatlarni saqlashda xatolik', description: err?.message || String(err) });
        }
      }

      setDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        setSlugError('Bu slug allaqachon mavjud');
      } else {
        toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', selectedProduct.id);
      if (error) throw error;
      toast({ title: 'Muvaffaqiyat', description: "Mahsulot o'chirildi" });
      setDeleteDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !product.is_featured })
        .eq('id', product.id);

      if (error) throw error;
      fetchProducts();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Xatolik', description: error.message });
    }
  };

  const getSeoStatus = (product: Product) => {
    const hasTitle = Object.values(product.meta_title || {}).some(Boolean);
    const hasDescription = Object.values(product.meta_description || {}).some(Boolean);
    
    if (hasTitle && hasDescription) return { status: 'complete', label: 'SEO tayyor' };
    if (hasTitle || hasDescription) return { status: 'partial', label: 'SEO qisman' };
    return { status: 'missing', label: 'SEO yoq' };
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / ADMIN_PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mahsulotlar</h1>
          <p className="text-muted-foreground">Barcha mahsulotlarni boshqaring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchProducts}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yangilash
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi mahsulot
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mahsulot nomi yoki slug bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toifa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha toifalar</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {getTranslated(cat.name, language, defaultLanguage)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="active">Faol</SelectItem>
                <SelectItem value="inactive">Nofaol</SelectItem>
                <SelectItem value="featured">Tanlangan</SelectItem>
                <SelectItem value="out_of_stock">Tugagan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Barcha mahsulotlar ({totalCount})</span>
            <div className="flex gap-2">
              <Badge variant="outline">{products.filter(p => p.is_active).length} faol</Badge>
              <Badge variant="secondary">{products.filter(p => p.is_featured).length} tanlangan</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rasm</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Toifa</TableHead>
                <TableHead>Narxi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SEO</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const seoStatus = getSeoStatus(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={getTranslated(product.name, defaultLanguage, defaultLanguage)} className="h-12 w-12 object-cover rounded-lg border" />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getTranslated(product.name, language, defaultLanguage)}</p>
                        {product.slug && (
                          <code className="text-xs text-muted-foreground">/{product.slug}</code>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(product.category_id)}</TableCell>
                    <TableCell>
                      {product.is_negotiable ? (
                        <Badge variant="outline">Kelishiladi</Badge>
                      ) : (
                        <div>
                          <p className="font-medium">{formatPrice(product.price)}</p>
                          {product.original_price && product.original_price > (product.price || 0) && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.original_price)}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Faol' : 'Nofaol'}
                        </Badge>
                        {product.in_stock ? (
                          <Badge variant="outline" className="text-green-600 border-green-200">Mavjud</Badge>
                        ) : (
                          <Badge variant="destructive">Tugagan</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={seoStatus.status === 'complete' ? 'default' : seoStatus.status === 'partial' ? 'secondary' : 'outline'}
                        className={seoStatus.status === 'missing' ? 'text-muted-foreground' : ''}
                      >
                        {seoStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleFeatured(product)}
                          title={product.is_featured ? "Tanlanganlardan olib tashlash" : "Tanlanganlarga qo'shish"}
                        >
                          <Star className={`h-4 w-4 ${product.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setSelectedProduct(product); setPreviewDialogOpen(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setSelectedProduct(product); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Mahsulotlar topilmadi</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Oldingi
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Keyingi
            </Button>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</DialogTitle>
          </DialogHeader>

          <LanguageTabsProvider languages={languages} defaultLanguage={defaultLanguage}>
          <LanguageTabBar />
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Asosiy</TabsTrigger>
              <TabsTrigger value="description">Tavsif</TabsTrigger>
              <TabsTrigger value="images">Rasmlar</TabsTrigger>
              <TabsTrigger value="attributes">Xususiyatlar</TabsTrigger>
              <TabsTrigger value="seo" className="gap-1">
                <Globe className="h-3 w-3" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <TranslatedInput
                label="Nomi"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder={{ uz: "O'zbek tilida", ru: 'На русском' }}
              />

              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="avtomatik yaratiladi"
                  className={slugError ? 'border-destructive' : ''}
                />
                {slugError ? (
                  <p className="text-sm text-destructive">{slugError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    URL: /product/{formData.slug || 'slug'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Brend</Label>
                <Select
                  value={formData.brand_id || '__none__'}
                  onValueChange={(value) => {
                    setFormData({ ...formData, brand_id: value === '__none__' ? '' : value, category_id: '' });
                    setSelectedDivisionId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Brendni tanlang (ixtiyoriy)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Brendsiz —</SelectItem>
                    {brandList.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {getTranslated(b.name, language, defaultLanguage)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bo'lim (Business Division)</Label>
                <Select
                  value={selectedDivisionId || '__none__'}
                  onValueChange={(v) => { setSelectedDivisionId(v === '__none__' ? '' : v); setFormData((p) => ({ ...p, category_id: '' })); }}
                  disabled={!formData.brand_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.brand_id ? "Bo'limni tanlang" : "Avval brendni tanlang"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Barchasi —</SelectItem>
                    {divisionList.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {getTranslated(d.name, language, defaultLanguage)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Toifa</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toifani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat: any) => {
                        if (selectedDivisionId) return cat.division_id === selectedDivisionId;
                        if (formData.brand_id) {
                          const bids: string[] = (cat as any).brand_ids || [];
                          return bids.length === 0 || bids.includes(formData.brand_id);
                        }
                        return true;
                      })
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {getTranslated(cat.name, language, defaultLanguage)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Narxi</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Eski narxi</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_negotiable}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_negotiable: checked })}
                  />
                  <Label>Kelishiladi</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                  />
                  <Label>Mavjud</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label>Tanlangan</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Faol</Label>
                </div>
              </div>
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-4 mt-4">
              <TranslatedTextarea
                label="Qisqa tavsif"
                rows={3}
                value={formData.description}
                onChange={(description) => setFormData({ ...formData, description })}
                placeholder={{ uz: 'Mahsulot haqida qisqacha...', ru: 'Краткое описание...' }}
              />
              <Separator />
              <TranslatedTextarea
                label="To'liq tavsif"
                rows={6}
                value={formData.full_description}
                onChange={(full_description) => setFormData({ ...formData, full_description })}
                placeholder={{ uz: 'Batafsil tavsif...', ru: 'Подробное описание...' }}
              />
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="images" className="space-y-4 mt-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Add Media Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Media fayllari
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Rasmlar va videolarni qo'shing
                  </p>
                </div>
                <Button onClick={() => setMediaModalOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Media qo'shish
                </Button>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                    <span>Rasmlar yuklanmoqda...</span>
                  </div>
                </div>
              )}

              {/* Media Grid */}
              <MediaGrid 
                items={mediaItems}
                onRemove={removeMedia}
                onMove={moveMedia}
              />

              {/* Media count */}
              {mediaItems.length > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Jami: {mediaItems.length} ta media 
                    ({mediaItems.filter(m => m.type === 'image').length} rasm, {mediaItems.filter(m => m.type === 'video').length} video)
                  </span>
                  <span>Birinchi media asosiy rasm sifatida ko'rsatiladi</span>
                </div>
              )}
            </TabsContent>

            {/* Attributes Tab */}
            <TabsContent value="attributes" className="space-y-6 mt-4">
              <DynamicAttributesForm
                categoryId={formData.category_id || null}
                values={attrValues}
                onChange={setAttrValues}
                onAttributesLoaded={setLoadedAttrs}
                onLoadingChange={setAttributesLoading}
              />
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6 mt-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Asosiy kalit so'z asosida SEO Title, H1 va Slug avtomatik yaratiladi. 
                  Har bir til uchun alohida kalit so'z va variantlarini kiriting.
                </p>
              </div>

              {/* Target Keyword */}
              <div className="space-y-3">
                <h3 className="font-medium text-base">🎯 Asosiy kalit so'z</h3>
                <p className="text-xs text-muted-foreground">
                  Bu so'z SEO Title, H1 sarlavha va URL slug uchun ishlatiladi
                </p>
                <TranslatedInput
                  label="Asosiy kalit so'z"
                  value={formData.keyword}
                  onChange={(keyword) => {
                    const changedLang = languages.find((l) => keyword[l.code] !== formData.keyword[l.code])?.code || defaultLanguage;
                    const value = keyword[changedLang] || '';
                    setFormData((p) => {
                      const next: FormData = { ...p, keyword };
                      if (changedLang === defaultLanguage && value && (!p.slug || p.slug === generateSlug(p.keyword[defaultLanguage] || ''))) {
                        next.slug = generateSlug(value);
                      }
                      if (value && !p.meta_title[changedLang]) {
                        const autoTitle = value.charAt(0).toUpperCase() + value.slice(1);
                        if (autoTitle.length <= 60) {
                          const withName = autoTitle + (p.name[changedLang] ? ` | ${p.name[changedLang]}` : '');
                          next.meta_title = { ...p.meta_title, [changedLang]: withName.length > 60 ? autoTitle : withName };
                        }
                      }
                      return next;
                    });
                  }}
                  placeholder={{ uz: 'Masalan: shkaf buyurtma asosida', ru: 'Например: шкаф на заказ' }}
                />
              </div>

              <Separator />

              {/* Keyword Variants */}
              <div className="space-y-3">
                <h3 className="font-medium text-base">🔄 Kalit so'z variantlari</h3>
                <p className="text-xs text-muted-foreground">
                  Variantlar tavsif va rasm alt teglarida tabiiy ravishda ishlatiladi
                </p>
                <VariantsListEditor
                  variants={formData.variants}
                  onChange={(variants) => setFormData({ ...formData, variants })}
                />
              </div>

              <Separator />

              {/* Meta Title */}
              <div className="space-y-3">
                <h3 className="font-medium text-base">📝 Meta Title</h3>
                <TranslatedInput
                  label="Meta Title"
                  value={formData.meta_title}
                  onChange={(meta_title) => setFormData({ ...formData, meta_title })}
                  placeholder={formData.keyword[defaultLanguage] ? formData.keyword : formData.name}
                />
              </div>

              <Separator />

              {/* Meta Description */}
              <div className="space-y-3">
                <h3 className="font-medium text-base">📄 Meta Description</h3>
                <TranslatedTextarea
                  label="Meta Description"
                  rows={3}
                  value={formData.meta_description}
                  onChange={(meta_description) => setFormData({ ...formData, meta_description })}
                  placeholder={{ uz: 'Mahsulot haqida qisqa tavsif...', ru: 'Краткое описание товара...' }}
                />
              </div>

              <Separator />

              <SeoPreview formData={formData} />

              <Separator />

              {/* Index/Follow Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_indexed}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_indexed: checked })}
                  />
                  <div>
                    <Label>Indexlash</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.is_indexed ? 'Google indeksida' : 'Noindex'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_followed}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_followed: checked })}
                  />
                  <div>
                    <Label>Follow</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.is_followed ? 'Havolalar kuzatiladi' : 'Nofollow'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          </LanguageTabsProvider>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleSubmit} disabled={!!slugError || attributesLoading}>
              {selectedProduct ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mahsulot ko'rinishi</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {selectedProduct.images?.[0] && (
                <img
                  src={selectedProduct.images[0]}
                  alt={getTranslated(selectedProduct.name, defaultLanguage, defaultLanguage)}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div>
                <h2 className="text-xl font-bold">{getTranslated(selectedProduct.name, language, defaultLanguage)}</h2>
              </div>
              {getTranslated(selectedProduct.description, language, defaultLanguage) && (
                <p>{getTranslated(selectedProduct.description, language, defaultLanguage)}</p>
              )}
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{formatPrice(selectedProduct.price)}</span>
                {selectedProduct.is_negotiable && (
                  <Badge>Kelishiladi</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mahsulotni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Haqiqatan ham "{selectedProduct ? getTranslated(selectedProduct.name, defaultLanguage, defaultLanguage) : ''}" mahsulotini o'chirmoqchimisiz?
              Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Media Modal */}
      <AddMediaModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onAddMedia={handleAddMedia}
        onUploadImages={() => fileInputRef.current?.click()}
        uploading={uploading}
      />
    </div>
  );
}
