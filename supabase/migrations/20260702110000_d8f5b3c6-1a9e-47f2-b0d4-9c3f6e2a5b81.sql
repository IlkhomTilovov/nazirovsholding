-- Seed 4 business divisions for the "Yog'" (oil) brand.
-- Uses a slug lookup so it works regardless of the brand's actual UUID.
INSERT INTO public.business_divisions (brand_id, name_uz, name_ru, slug, description_uz, description_ru, cover_image, sort_order, is_active)
SELECT b.id, v.name_uz, v.name_ru, v.slug, v.description_uz, v.description_ru, v.cover_image, v.sort_order, true
FROM public.brands b
CROSS JOIN (VALUES
  (
    'Kungaboqar yog''i', 'Подсолнечное масло', 'kungaboqar-yogi',
    'Yuqori sifatli, tozalangan kungaboqar yog''i — FOB va CIF shartlari asosida xalqaro bozorlarga yetkazib beriladi. Yog'' kislotasi tarkibi va tozalik darajasi xalqaro standartlarga mos.',
    'Высококачественное рафинированное подсолнечное масло — поставляется на международные рынки на условиях FOB и CIF. Состав жирных кислот и степень очистки соответствуют международным стандартам.',
    'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27640%27 height=%27360%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%27 stop-color=%27%2378350f%27/%3E%3Cstop offset=%271%27 stop-color=%27%23d97706%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%27640%27 height=%27360%27 fill=%27url(%23g)%27/%3E%3Ctext x=%2740%27 y=%27200%27 font-family=%27Georgia%2C serif%27 font-size=%2744%27 fill=%27white%27%3EKungaboqar yog%27i%3C/text%3E%3C/svg%3E',
    0
  ),
  (
    'Paxta yog''i', 'Хлопковое масло', 'paxta-yogi',
    'O''zbekiston paxta xomashyosidan ishlab chiqarilgan, sanoat va oziq-ovqat sohalari uchun mo''ljallangan yuqori sifatli paxta yog''i.',
    'Хлопковое масло высокого качества, произведённое из узбекского хлопкового сырья, предназначено для промышленного и пищевого секторов.',
    'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27640%27 height=%27360%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%27 stop-color=%27%23713f12%27/%3E%3Cstop offset=%271%27 stop-color=%27%23ca8a04%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%27640%27 height=%27360%27 fill=%27url(%23g)%27/%3E%3Ctext x=%2740%27 y=%27200%27 font-family=%27Georgia%2C serif%27 font-size=%2744%27 fill=%27white%27%3EPaxta yog%27i%3C/text%3E%3C/svg%3E',
    1
  ),
  (
    'Zaytun yog''i', 'Оливковое масло', 'zaytun-yogi',
    'Ekstra bakra zaytun yog''i — tabiiy, sovuq presslash usulida tayyorlangan, gurme va premium bozor segmenti uchun.',
    'Оливковое масло Extra Virgin — натуральное, холодного отжима, для гурманов и премиального сегмента рынка.',
    'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27640%27 height=%27360%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%27 stop-color=%27%233f6212%27/%3E%3Cstop offset=%271%27 stop-color=%27%2384cc16%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%27640%27 height=%27360%27 fill=%27url(%23g)%27/%3E%3Ctext x=%2740%27 y=%27200%27 font-family=%27Georgia%2C serif%27 font-size=%2744%27 fill=%27white%27%3EZaytun yog%27i%3C/text%3E%3C/svg%3E',
    2
  ),
  (
    'Kunjut yog''i', 'Кунжутное масло', 'kunjut-yogi',
    'Qovurilgan va xom kunjut urug''idan olingan, o''ziga xos ta''m va aromatga ega premium kunjut yog''i.',
    'Кунжутное масло премиум-класса из жареных и сырых семян кунжута с насыщенным вкусом и ароматом.',
    'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27640%27 height=%27360%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%27 stop-color=%27%237c2d12%27/%3E%3Cstop offset=%271%27 stop-color=%27%23c2410c%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%27640%27 height=%27360%27 fill=%27url(%23g)%27/%3E%3Ctext x=%2740%27 y=%27200%27 font-family=%27Georgia%2C serif%27 font-size=%2744%27 fill=%27white%27%3EKunjut yog%27i%3C/text%3E%3C/svg%3E',
    3
  )
) AS v(name_uz, name_ru, slug, description_uz, description_ru, cover_image, sort_order)
WHERE b.slug = 'yog'
ON CONFLICT (brand_id, slug) DO NOTHING;
