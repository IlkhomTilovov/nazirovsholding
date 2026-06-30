
# Brand Management — Enterprise CMS Redesign

NazirovSholding admin paneli uchun **Brand → Business Division → Category → Product** ko'p darajali korporativ ierarxiya joriy qilinadi.

## 1. Database (migration)

Yangi jadval va o'zgarishlar:

**`business_divisions`** (yangi):
- `brand_id` (FK → `brands.id`, ON DELETE CASCADE)
- `name_uz`, `name_ru`, `slug`, `description_uz`, `description_ru`
- `icon`, `cover_image`, `banner`, `hero_image`
- `gallery` (jsonb array)
- `meta_title_uz`, `meta_title_ru`, `meta_description_uz`, `meta_description_ru`, `meta_keywords`
- `is_active`, `sort_order`
- UNIQUE (`brand_id`, `slug`)

**`brands` jadvaliga qo'shish:**
- `light_logo`, `dark_logo`, `thumbnail`, `cover_image`, `hero_banner`
- `gallery` (jsonb)
- `canonical_url`, `og_image`
- `primary_color`, `secondary_color`, `accent_color`
- `show_in_navigation`, `show_on_homepage`, `is_featured`, `default_sort`

**`categories` jadvaliga qo'shish:**
- `division_id` (FK → `business_divisions.id`, ON DELETE SET NULL — nullable, orqaga moslik uchun)

RLS/GRANTS: barchaga SELECT (faol bo'lsa), admin/editor uchun ALL.

## 2. Hooks

- `src/hooks/useDivisions.tsx` — `useDivisions(brandId?)`, `useDivision(id)`, `useDivisionStats(id)`.
- `useBrands.tsx` ga `useBrandStats(brandId)` qo'shiladi (divisions/categories/products soni).
- `useCategories.tsx` ga `divisionId` filter.

## 3. Admin sahifalar

**`/admin/brands`** (mavjud) — Brand'lar ro'yxati, "Manage" tugmasi har bir brendni alohida workspace'ga olib boradi.

**`/admin/brands/:brandId`** — yangi tabbed workspace:
- **General** — nom, slug, tavsif, veb-sayt, status, tartib
- **SEO** — title, description, keywords, OG image, canonical URL
- **Business Divisions** — divisions CRUD (yangi)
- **Media** — logo, light/dark logo, hero banner, cover, thumbnail, gallery (drag & drop)
- **Statistics** — dashboard kartalar: divisions/categories/products/published/draft soni
- **Settings** — primary/secondary/accent rang, navigation/homepage flag'lari, default sorting

**`/admin/brands/:brandId/divisions/:divisionId`** — Division edit modal/sahifa:
- General (name, slug, icon, cover, status, sort)
- SEO (title, description, keywords)
- Media (banner, hero, gallery)

## 4. Bog'liq formalar yangilanishi

**Categories** (`/admin/categories`):
- Yangi **Division** dropdown qo'shiladi.
- Brand tanlanganda — divisions dynamic yuklanadi.

**ProductsNew** (`/admin/products/new`, `/admin/products/:id/edit`):
- Brand → Division → Category dependent dropdownlar.
- Brand tanlanganda divisions filtrlanadi, division tanlanganda categories filtrlanadi.

## 5. UX talablar

- Premium spacing, rounded cards, soft shadows
- Skeleton loaderlar
- Breadcrumb: `Brendlar / [Brand Name] / Divisions / [Division Name]`
- Drag & drop tartiblash (divisions, gallery)
- Live qidiruv, bulk action, confirmation dialog
- Empty state komponentlari
- Mobil moslashgan

## 6. Texnik tartib

1. **Migration** (business_divisions + brands/categories field qo'shimchalari + RLS + GRANT)
2. Hooks (`useDivisions`, brand stats, category filterlari)
3. Brand workspace tabbed sahifa
4. Divisions CRUD UI
5. Categories form yangilash (division dropdown)
6. ProductsNew dependent dropdownlar
7. Public sayt (BrandDetails) divisions ko'rsatishi (ixtiyoriy — keyingi bosqich)

## 7. Orqaga moslik

- `categories.division_id` nullable — eski kategoriyalar buzilmaydi.
- Eski `categories.brand_ids` saqlanib qoladi.
- Eski mahsulotlar bevosita brand+category orqali ishlay beradi.

---

Tasdiqlasangiz, **migration**dan boshlayman. Migration tasdiqlangach types yangilanadi va keyin UI qismi ketma-ket qo'shiladi.
