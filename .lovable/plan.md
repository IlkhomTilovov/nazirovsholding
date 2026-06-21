## Dinamik Mahsulot Atributlari Tizimi

TILLA KAMILOV uchun to'liq dinamik, ko'p tilli, CMS-boshqariladigan atributlar tizimi qo'shiladi. Hozirgi `sizes/colors/materials` o'rniga har bir kategoriya o'z atributlariga ega bo'ladi (Zamok, Ariston, Eshik, Lesa va h.k.).

### 1. Database (migration)

Yangi jadvallar:
- **`attribute_groups`** — atribut guruhlari (Xavfsizlik, Texnik xususiyatlar, O'lchamlar...). Maydonlar: `name_uz`, `name_ru`, `slug`, `category_id` (nullable — global guruh uchun), `sort_order`, `is_active`.
- **`attributes`** — atributlar. Maydonlar: `group_id`, `name_uz`, `name_ru`, `slug`, `field_type` (`text|number|select|multiselect|boolean|textarea`), `unit`, `placeholder_uz`, `placeholder_ru`, `is_required`, `is_filterable`, `show_in_card`, `sort_order`, `is_active`.
- **`attribute_options`** — select/multiselect uchun variantlar. Maydonlar: `attribute_id`, `label_uz`, `label_ru`, `value`, `sort_order`.
- **`product_attribute_values`** — mahsulot qiymatlari. Maydonlar: `product_id`, `attribute_id`, `value_text`, `value_number`, `value_boolean`, `value_json` (multiselect uchun array).

RLS:
- SELECT — barchaga ochiq.
- ALL — `admin` yoki `editor`.

Indexlar: `attributes(group_id)`, `product_attribute_values(product_id)`, `product_attribute_values(attribute_id)`, `attribute_groups(category_id)`.

`attribute_groups` `category_id` `categories.id` ga bog'lanadi, `ON DELETE CASCADE`. Boshqa FK lar ham CASCADE.

### 2. Admin panel

**Yangi sahifa `/admin/attributes`** (`src/pages/admin/Attributes.tsx`):
- Kategoriya tanlash (dropdown).
- Tanlangan kategoriya uchun guruhlar ro'yxati (drag-sort, qo'shish/tahrirlash/o'chirish).
- Har bir guruh ichida atributlar (modal forma orqali tahrirlash, field_type'ga qarab options bo'limi paydo bo'ladi).
- Sidebar'ga "Atributlar" elementi qo'shiladi (`Brendlar` va `Toifalar` orasidan keyin).

**Mahsulot formasi (`ProductsNew.tsx`) yangilanadi:**
- Hozirgi `O'lchamlar / Ranglar / Materiallar` tab/qismi olib tashlanmaydi (legacy uchun saqlanadi), lekin yangi **"Xususiyatlar"** tab kategoriya tanlanganda dinamik atributlarni yuklaydi.
- `useCategoryAttributes(categoryId)` hook orqali guruh + atributlar olinadi.
- React Hook Form'da har bir atribut uchun `attr_<id>` field. `field_type`ga qarab to'g'ri komponent:
  - `text` → Input
  - `number` → Input type=number + unit suffix
  - `textarea` → Textarea
  - `boolean` → Switch
  - `select` → Select (shadcn)
  - `multiselect` → checkbox grid / badge selector
- Tab almashtirilganda qiymatlar saqlanadi (form state'da).
- Yuklash paytida Skeleton.
- Saqlashda `product_attribute_values` upsert qilinadi (eski qiymatlar o'chirilib qayta yoziladi yoki upsert by `(product_id, attribute_id)`).

### 3. Public — Mahsulot sahifasi

`ProductDetails.tsx` ga **"Xususiyatlar"** bloki qo'shiladi:
- Guruhlar bo'yicha akkordion / kartalar.
- Har bir atribut: nom + qiymat (number'da unit, boolean'da ✔/—, select'da label).
- Mobile responsive jadval ko'rinishi.
- Skeleton loader.

### 4. Catalog filterlari

`CatalogFilterSidebar.tsx`:
- Tanlangan kategoriya bo'lsa, `is_filterable=true` atributlar dinamik filter sifatida yuklanadi.
- `select/multiselect/boolean` → checkbox/switch.
- `number` → range slider (min/max).
- Filterlash logikasi `useProducts` hook'ida — `product_attribute_values` jadvalidan IN/range so'rov.

### 5. SEO

`ProductDetails.tsx` JSON-LD `Product` schema'siga `additionalProperty` array qo'shiladi (har bir atribut uchun `PropertyValue`). Meta description'ga asosiy texnik xususiyatlardan parcha qo'shilishi mumkin.

### 6. Hooks va types

- `src/hooks/useAttributes.tsx` — `useAttributeGroups(categoryId)`, `useAttributes(groupId?)`, `useCategoryAttributes(categoryId)` (groups + attributes + options bitta strukturada), `useProductAttributeValues(productId)`.
- `src/lib/schemas/attribute.ts` — Zod schemalari.
- TS types Supabase auto-generate.

### 7. Texnik tafsilotlar

- TanStack Query mavjud emas — loyiha `useState/useEffect` pattern'idan foydalanadi, shu pattern'ga moslashamiz (caching uchun oddiy in-memory map).
- Hech qaysi mavjud `sizes/colors/materials` ustunlari o'chirilmaydi (orqaga moslik).
- `permissions.ts` ga `attributes` moduli qo'shiladi.
- Translations'ga UZ/RU label'lar.

### Tartib

1. Migration (4 jadval + RLS + indexlar).
2. Hooks + types.
3. Admin `/admin/attributes` sahifa + sidebar + route.
4. `ProductsNew.tsx` ga dinamik atributlar tab.
5. `ProductDetails.tsx` ga xususiyatlar bloki + JSON-LD.
6. Catalog filter integratsiyasi.
7. QA.

Tasdiqlasangiz, migration'dan boshlayman.
