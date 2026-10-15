-- ==============================================================================
-- seed.sql — Digital Heritage Passport — Test Seed Data
-- ==============================================================================
--
-- RAW QR TOKENS FOR TESTING (copy these into your browser / QR scanner):
-- ┌──────────────────────────────────┬────────────────────────────────────────────────────────────────────┬──────────┐
-- │ Raw Token                        │ SHA-256 Hash (stored in pin_items.qr_token_hash)                 │ Status   │
-- ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────┼──────────┤
-- │ DHP-THANGLONG-2026-TEST01        │ dde600be2ced05bcbd97706f6776fbe5f6d4c41c90f9de2a91e9441ba651fb09 │ active   │
-- │ DHP-HOIAN-2026-TEST02            │ 3b913f720353b3bd14c31ca7e79cdee9fde43a3f280f1e76bab56dc45e112c11 │ active   │
-- │ DHP-HUE-2026-TEST03              │ 4d4ebeee341be269c7aa7c2339c3f8715be6f75758ecf4942f39ca52288d8dea │ active   │
-- │ DHP-HALONG-2026-TEST04           │ c3e5f6d5fcd387cd632b5486276e7c4545f424e351aa2bec5a1bd3d43bb076c8 │ active   │
-- │ DHP-DINHDOCLAP-2026-TEST05       │ 9ee7021229480c3e9d8aa77e6db85fb8db0346c5d707908f207b58cccb369418 │ active   │
-- │ DHP-BUUDIEN-2026-TEST07          │ 764fba704c06aa541e2ebc4130cc900d1d3c77f8b67f06b5ba17237a22d50bf2 │ active   │
-- │ DHP-DUCBASAIGON-2026-TEST08      │ 8e42b2294e3cfe73bdb38b60c7e8c552f0b0f4ec0bfe98bdd97efb0ae92c0ab3 │ active   │
-- │ DHP-NHAHATTP-2026-TEST09         │ 04ae055c2dafd7237d1d94eb642f60c2bc3769b9046347baf0344340e8fa8d01 │ active   │
-- │ DHP-BENNHARONG-2026-TEST10       │ ab9f970da2fa0415b69652114d078202968ff40a2bc173c8257d5dbe5cd25abf │ active   │
-- │ DHP-CHOBENTHANH-2026-TEST11      │ f147f5db25fb061109a3cd86b53d20e2112940a751ca0879eb1ae4ed83f6ba8d │ active   │
-- │ DHP-WARREMNANTS-2026-TEST12      │ bf057024e06c362a85c719b1bab9a1b4efc68dcb6dd79c75f093bdceb64457fd │ active   │
-- │ DHP-REVOKED-2026-TEST06          │ bac3bab753eddf77eeb3e17b68eb4f0213164e3ca85631e0c922c86216ce57c2 │ revoked  │
-- └──────────────────────────────────┴────────────────────────────────────────────────────────────────────┴──────────┘
--
-- QR URL format for testing:
--   http://localhost:5173/qr/<raw_token>
--
-- ==============================================================================

-- 1. Regions (3 Miền)
INSERT INTO public.regions (id, slug, name_vi, name_en, description_vi, description_en, order_index, is_published)
VALUES
    (
        'r1b2c3d4-0001-4000-r000-000000000001',
        'bac',
        'Miền Bắc',
        'Northern Vietnam',
        'Kinh đô ngàn năm văn hiến, nơi khởi nguồn của nền văn minh sông Hồng với những di sản kỳ vĩ.',
        'The cradle of Vietnamese civilization, home to thousand-year-old capitals and breathtaking natural wonders.',
        1,
        true
    ),
    (
        'r1b2c3d4-0002-4000-r000-000000000002',
        'trung',
        'Miền Trung',
        'Central Vietnam',
        'Dải đất di sản miền Trung với quần thể cung điện lăng tẩm triều Nguyễn và thương cảng cổ kính.',
        'The heritage strip featuring Nguyen dynasty royal palaces, ancient trading towns, and vibrant coastal culture.',
        2,
        true
    ),
    (
        'r1b2c3d4-0003-4000-r000-000000000003',
        'nam',
        'Miền Nam',
        'Southern Vietnam',
        'Vùng đất phương Nam năng động, giao thoa văn hóa Đông Tây rực rỡ với trái tim là TP. Hồ Chí Minh.',
        'The dynamic southern hub of cultural fusion, historic landmarks, and economic vibrancy centered at Ho Chi Minh City.',
        3,
        true
    )
ON CONFLICT (id) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en;

-- 2. Areas (Khu vực / Tỉnh thành)
INSERT INTO public.areas (id, region_id, slug, name_vi, name_en, center_lat, center_lng, default_zoom, is_active, order_index)
VALUES
    -- Miền Bắc
    (
        'e1b2c3d4-0001-4000-e000-000000000001',
        'r1b2c3d4-0001-4000-r000-000000000001',
        'ha-noi',
        'Hà Nội',
        'Hanoi',
        21.0285110,
        105.8544440,
        13,
        false,
        1
    ),
    (
        'e1b2c3d4-0002-4000-e000-000000000002',
        'r1b2c3d4-0001-4000-r000-000000000001',
        'quang-ninh',
        'Quảng Ninh',
        'Quang Ninh',
        20.9500000,
        107.0800000,
        11,
        false,
        2
    ),
    -- Miền Trung
    (
        'e1b2c3d4-0003-4000-e000-000000000003',
        'r1b2c3d4-0002-4000-r000-000000000002',
        'thua-thien-hue',
        'Thừa Thiên Huế',
        'Thua Thien Hue',
        16.4637000,
        107.5909000,
        13,
        false,
        1
    ),
    (
        'e1b2c3d4-0004-4000-e000-000000000004',
        'r1b2c3d4-0002-4000-r000-000000000002',
        'quang-nam',
        'Quảng Nam',
        'Quang Nam',
        15.8800580,
        108.3380470,
        13,
        false,
        2
    ),
    -- Miền Nam (Trọng tâm giai đoạn này)
    (
        'e1b2c3d4-0005-4000-e000-000000000005',
        'r1b2c3d4-0003-4000-r000-000000000003',
        'tp-ho-chi-minh',
        'TP. Hồ Chí Minh',
        'Ho Chi Minh City',
        10.7769440,
        106.7009000,
        14,
        true, -- Active focus area
        1
    )
ON CONFLICT (id) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    is_active = EXCLUDED.is_active;

-- 3. Collections
INSERT INTO public.collections (id, name_vi, name_en, description_vi, description_en, cover_image_url, is_published)
VALUES
    (
        'a1b2c3d4-0001-4000-a000-000000000001',
        'Di sản Miền Bắc',
        'Northern Heritage',
        'Bộ sưu tập các di sản văn hóa tiêu biểu của miền Bắc Việt Nam, từ kinh thành Thăng Long nghìn năm lịch sử đến kỳ quan thiên nhiên Vịnh Hạ Long.',
        'A collection of iconic cultural heritage sites in Northern Vietnam, from the thousand-year-old Thang Long Imperial Citadel to Ha Long Bay.',
        '/images/collections/northern-heritage.jpg',
        true
    ),
    (
        'a1b2c3d4-0002-4000-a000-000000000002',
        'Di sản Miền Trung',
        'Central Heritage',
        'Bộ sưu tập các di sản từ phố cổ Hội An đến cố đô Huế — những dấu ấn lịch sử qua nhiều thời kỳ của Việt Nam.',
        'A collection spanning ancient Hoi An and the imperial capital of Hue.',
        '/images/collections/central-southern-heritage.jpg',
        true
    ),
    (
        'a1b2c3d4-0003-4000-a000-000000000003',
        'Di sản Sài Gòn — TP. Hồ Chí Minh',
        'Saigon — Ho Chi Minh City Heritage',
        'Bộ sưu tập các công trình kiến trúc lịch sử tiêu biểu của Hòn ngọc Viễn Đông, kết nối ký ức hơn 300 năm hình thành và phát triển.',
        'A collection celebrating the historic architecture and vibrant soul of Ho Chi Minh City across over 300 years of history.',
        '/images/collections/hcm-heritage.jpg',
        true
    )
ON CONFLICT (id) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en;

-- 4. Heritage Sites (Di tích Miền Bắc, Miền Trung & 7 Di tích Tiêu biểu TP.HCM)
INSERT INTO public.heritage_sites (id, area_id, slug, name_vi, name_en, story_vi, story_en, description_vi, description_en, latitude, longitude, cover_image_url, audio_url, source_reference, is_published)
VALUES
    -- Site 1: Hoàng thành Thăng Long (Hà Nội)
    (
        'b1b2c3d4-0001-4000-b000-000000000001',
        'e1b2c3d4-0001-4000-e000-000000000001',
        'hoang-thanh-thang-long',
        'Hoàng thành Thăng Long',
        'Imperial Citadel of Thang Long',
        'Hoàng thành Thăng Long là quần thể di tích lịch sử nằm tại trung tâm Hà Nội, được xây dựng từ thế kỷ thứ 7 và là trung tâm quyền lực chính trị liên tục qua nhiều triều đại phong kiến Việt Nam suốt 13 thế kỷ.',
        'The Imperial Citadel of Thang Long is a historical complex in central Hanoi, serving as the continuous political center through multiple Vietnamese feudal dynasties for 13 centuries.',
        'Di sản Văn hóa Thế giới UNESCO (2010). Trung tâm quyền lực chính trị liên tục suốt 13 thế kỷ.',
        'UNESCO World Heritage Site (2010). A continuous political center for 13 centuries.',
        21.0340920,
        105.8400540,
        'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'UNESCO World Heritage Centre; Bộ Văn hóa, Thể thao và Du lịch Việt Nam.',
        true
    ),
    -- Site 2: Phố cổ Hội An (Quảng Nam)
    (
        'b1b2c3d4-0002-4000-b000-000000000002',
        'e1b2c3d4-0004-4000-e000-000000000004',
        'pho-co-hoi-an',
        'Phố cổ Hội An',
        'Hoi An Ancient Town',
        'Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn, thuộc tỉnh Quảng Nam. Từ thế kỷ 15 đến thế kỷ 19, Hội An là một thương cảng quốc tế sầm uất với Chùa Cầu và những mái ngói rêu phong.',
        'Hoi An Ancient Town is a well-preserved historic port city on the Thu Bon River, blending Vietnamese, Japanese, and Chinese architecture.',
        'Di sản Văn hóa Thế giới UNESCO (1999). Thương cảng quốc tế sầm uất từ thế kỷ 15.',
        'UNESCO World Heritage Site (1999). A thriving international trading port since the 15th century.',
        15.8800584,
        108.3380469,
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'UNESCO World Heritage Centre; Trung tâm Bảo tồn Di sản Văn hóa Hội An.',
        true
    ),
    -- Site 3: Quần thể di tích Cố đô Huế (Thừa Thiên Huế)
    (
        'b1b2c3d4-0003-4000-b000-000000000003',
        'e1b2c3d4-0003-4000-e000-000000000003',
        'dai-noi-hue',
        'Quần thể di tích Cố đô Huế',
        'Complex of Hue Monuments',
        'Quần thể di tích Cố đô Huế bao gồm hệ thống thành quách, cung điện, lăng tẩm và đền đài được xây dựng dưới triều Nguyễn (1802–1945) bên bờ sông Hương thơ mộng.',
        'The Complex of Hue Monuments encompasses royal citadels, palaces, and tombs built during the Nguyen Dynasty (1802–1945).',
        'Di sản Văn hóa Thế giới UNESCO (1993). Kinh đô triều Nguyễn.',
        'UNESCO World Heritage Site (1993). Capital of the Nguyen Dynasty.',
        16.4698000,
        107.5788400,
        'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'UNESCO World Heritage Centre; Trung tâm Bảo tồn Di tích Cố đô Huế.',
        true
    ),
    -- Site 4: Vịnh Hạ Long (Quảng Ninh)
    (
        'b1b2c3d4-0004-4000-b000-000000000004',
        'e1b2c3d4-0002-4000-e000-000000000002',
        'vinh-ha-long',
        'Vịnh Hạ Long',
        'Ha Long Bay',
        'Vịnh Hạ Long thuộc tỉnh Quảng Ninh, nổi tiếng toàn cầu với hàng nghìn hòn đảo đá vôi kỳ vĩ nhô lên giữa làn nước xanh ngọc bích.',
        'Ha Long Bay features thousands of towering limestone karsts emerging from emerald waters.',
        'Di sản Thiên nhiên Thế giới UNESCO (1994, 2000). Kỳ quan thiên nhiên thế giới.',
        'UNESCO World Natural Heritage Site (1994, 2000). Natural wonder of the world.',
        20.9101000,
        107.1839000,
        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'UNESCO World Heritage Centre; Ban Quản lý Vịnh Hạ Long.',
        true
    ),

    -- ================= TP. HỒ CHÍ MINH (7 DI TÍCH TIÊU BIỂU) =================

    -- Site 5: Dinh Độc Lập (Q1)
    (
        'b1b2c3d4-0005-4000-b000-000000000005',
        'e1b2c3d4-0005-4000-e000-000000000005',
        'dinh-doc-lap',
        'Dinh Độc Lập',
        'Independence Palace',
        'Dinh Độc Lập tọa lạc tại trung tâm TP.HCM, do KTS Ngô Viết Thụ thiết kế, là chứng nhân lịch sử của ngày thống nhất non sông 30/4/1975.',
        'Independence Palace (Reunification Palace) in central HCMC is an architectural masterpiece and historic symbol of Vietnam reunification in 1975.',
        'Di tích Quốc gia đặc biệt. Chứng nhân lịch sử đại thắng mùa xuân 1975.',
        'Special National Historical Relic. Historic symbol of national reunification.',
        10.7769440,
        106.6952780,
        'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'Ban Quản lý Dinh Thống Nhất, dinhdoclap.gov.vn.',
        true
    ),
    -- Site 6: Bưu điện Trung tâm Sài Gòn (Q1)
    (
        'b1b2c3d4-0006-4000-b000-000000000006',
        'e1b2c3d4-0005-4000-e000-000000000005',
        'buu-dien-trung-tam-sai-gon',
        'Bưu điện Trung tâm Sài Gòn',
        'Saigon Central Post Office',
        'Được xây dựng từ năm 1886 đến 1891 theo phong cách Gothic kết hợp kiến trúc Phục Hưng Pháp, Bưu điện Trung tâm Sài Gòn là một trong những công trình bưu chính cổ kính và đẹp nhất châu Á.',
        'Constructed between 1886 and 1891 with a blend of Renaissance and Gothic elements, the Saigon Central Post Office is one of Asia''s most beautiful historic postal landmarks.',
        'Công trình kiến trúc Pháp cổ điển hơn 130 năm tuổi tại Công xã Paris.',
        'Over 130-year-old classic French colonial masterpiece at Paris Commune Square.',
        10.7797780,
        106.6999720,
        'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'Tổng Công ty Bưu điện Việt Nam (VNPost); Sở Văn hóa và Thể thao TP.HCM.',
        true
    ),
    -- Site 7: Nhà thờ Đức Bà Sài Gòn (Q1)
    (
        'b1b2c3d4-0007-4000-b000-000000000007',
        'e1b2c3d4-0005-4000-e000-000000000005',
        'nha-tho-duc-ba',
        'Nhà thờ Đức Bà Sài Gòn',
        'Notre-Dame Cathedral Basilica of Saigon',
        'Vương cung thánh đường Chính tòa Đức Mẹ Vô nhiễm Nguyên tội được xây dựng từ năm 1877 với gạch ngói Marseille và hai tháp chuông cao 58m, là linh hồn kiến trúc của đô thị Sài Gòn.',
        'Inaugurated in 1880 with Marseille red bricks and twin 58-meter bell towers, Notre-Dame Cathedral is the spiritual and architectural icon of Saigon.',
        'Kiệt tác kiến trúc Romanesque và Gothic tuyệt đẹp giữa lòng thành phố.',
        'Stunning Romanesque and Gothic basilica masterpiece in downtown Saigon.',
        10.7797220,
        106.6990000,
        'https://images.unsplash.com/photo-1583417658763-8a3854db2471?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'Tòa Tổng Giám mục Tổng Giáo phận Sài Gòn; Hội đồng Di sản Quốc gia.',
        true
    ),
    -- Site 8: Nhà hát Thành phố (Q1)
    (
        'b1b2c3d4-0008-4000-b000-000000000008',
        'e1b2c3d4-0005-4000-e000-000000000005',
        'nha-hat-thanh-pho',
        'Nhà hát Thành phố',
        'Saigon Opera House',
        'Khánh thành năm 1900 tại đầu đường Đồng Khởi, Nhà hát Thành phố mang phong cách kiến trúc Flamboyant Pháp với những bức phù điêu, pho tượng thạch cao tinh xảo.',
        'Inaugurated in 1900 on Dong Khoi Street, the Saigon Opera House exemplifies the French Flamboyant architectural style with ornate statues and reliefs.',
        'Nhà hát cổ kính phong cách Pháp, trung tâm biểu diễn nghệ thuật hàn lâm.',
        'Historic French colonial opera house, heart of performing arts in HCMC.',
        10.7766670,
        106.7031670,
        'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'Nhà hát Giao hưởng Nhạc Vũ kịch TP.HCM; Sở Văn hóa và Thể thao TP.HCM.',
        true
    ),
    -- Site 9: Bến Nhà Rồng — Bảo tàng Hồ Chí Minh (Q4)
    (
        'b1b2c3d4-0009-4000-b000-000000000009',
        'e1b2c3d4-0005-4000-e000-000000000005',
        'ben-nha-rong',
        'Bến Nhà Rồng',
        'Dragon Wharf (Ho Chi Minh Museum)',
        'Bến Nhà Rồng ban đầu là trụ sở của hãng vận tải Hãng tàu Messageries Maritimes bên sông Sài Gòn, nơi người thanh niên Nguyễn Tất Thành ra đi tìm đường cứu nước ngày 5/6/1911.',
        'Originally the Messageries Maritimes headquarters on Saigon River, Dragon Wharf is where young Nguyen Tat Thanh embarked on his overseas journey in 1911.',
        'Di tích lịch sử thiêng liêng nơi Bác Hồ ra đi tìm đường cứu nước năm 1911.',
        'Sacred historical landmark where President Ho Chi Minh began his quest for national liberation.',
        10.7683330,
        106.7069440,
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'Bảo tàng Hồ Chí Minh — Chi nhánh TP.HCM; baotanghochiminh.vn.',
        true
    ),
    -- Site 10: Chợ Bến Thành (Q1)
    (
        'b1b2c3d4-0010-4000-b000-000000000010',
        'e1b2c3d4-0005-4000-e000-000000000005',
        'cho-ben-thanh',
        'Chợ Bến Thành',
        'Ben Thanh Market',
        'Được xây dựng từ năm 1912 đến 1914 với tháp đồng hồ 4 mặt trứ danh, Chợ Bến Thành không chỉ là trung tâm giao thương sầm uất mà còn là biểu tượng văn hóa đời sống của người dân Sài Gòn.',
        'Built between 1912 and 1914 featuring an iconic four-sided clock tower, Ben Thanh Market is the quintessential symbol of Saigon daily commerce and cuisine.',
        'Biểu tượng văn hóa thương mại và ẩm thực hơn 100 năm của TP.HCM.',
        'The 100-year-old cultural icon of commerce and street food in Ho Chi Minh City.',
        10.7725000,
        106.6980560,
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'Ban Quản lý Chợ Bến Thành; Sở Du lịch TP.HCM.',
        true
    ),
    -- Site 11: Bảo tàng Chứng tích Chiến tranh (Q3)
    (
        'b1b2c3d4-0011-4000-b000-000000000011',
        'e1b2c3d4-0005-4000-e000-000000000005',
        'bao-tang-chung-tich-chien-tranh',
        'Bảo tàng Chứng tích Chiến tranh',
        'War Remnants Museum',
        'Bảo tàng lưu giữ những tư liệu, hiện vật và hình ảnh chân thực về những năm tháng chiến tranh khốc liệt tại Việt Nam, mang thông điệp mạnh mẽ về khát vọng hòa bình và hàn gắn.',
        'The museum exhibits compelling evidence and photographs of the Vietnam War, delivering a profound global message for peace and reconciliation.',
        'Bảo tàng lịch sử thu hút du khách hàng đầu, thông điệp về hòa bình và nhân văn.',
        'Top historical museum in Vietnam promoting peace and humanitarian values.',
        10.7794440,
        106.6922220,
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
        NULL,
        'Bảo tàng Chứng tích Chiến tranh, warremnantsmuseum.com.',
        true
    )
ON CONFLICT (id) DO UPDATE SET
    area_id = EXCLUDED.area_id,
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude;

-- 5. Pin Designs (Gắn huy hiệu lưu niệm cho từng di tích)
INSERT INTO public.pin_designs (id, site_id, collection_id, name, image_url)
VALUES
    -- Miền Bắc & Trung
    ('c1b2c3d4-0001-4000-c000-000000000001', 'b1b2c3d4-0001-4000-b000-000000000001', 'a1b2c3d4-0001-4000-a000-000000000001', 'Pin Hoàng thành Thăng Long', '/images/pins/pin-hoang-thanh-thang-long.png'),
    ('c1b2c3d4-0002-4000-c000-000000000002', 'b1b2c3d4-0002-4000-b000-000000000002', 'a1b2c3d4-0002-4000-a000-000000000002', 'Pin Phố cổ Hội An — Chùa Cầu', '/images/pins/pin-pho-co-hoi-an.png'),
    ('c1b2c3d4-0003-4000-c000-000000000003', 'b1b2c3d4-0003-4000-b000-000000000003', 'a1b2c3d4-0002-4000-a000-000000000002', 'Pin Đại Nội Huế — Ngọ Môn', '/images/pins/pin-dai-noi-hue.png'),
    ('c1b2c3d4-0004-4000-c000-000000000004', 'b1b2c3d4-0004-4000-b000-000000000004', 'a1b2c3d4-0001-4000-a000-000000000001', 'Pin Vịnh Hạ Long — Hòn Trống Mái', '/images/pins/pin-vinh-ha-long.png'),

    -- 7 Di tích TP.HCM
    ('c1b2c3d4-0005-4000-c000-000000000005', 'b1b2c3d4-0005-4000-b000-000000000005', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Dinh Độc Lập', '/images/pins/pin-dinh-doc-lap.png'),
    ('c1b2c3d4-0006-4000-c000-000000000006', 'b1b2c3d4-0006-4000-b000-000000000006', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Bưu điện Trung tâm Sài Gòn', '/images/pins/pin-buu-dien-tp.png'),
    ('c1b2c3d4-0007-4000-c000-000000000007', 'b1b2c3d4-0007-4000-b000-000000000007', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Nhà thờ Đức Bà Sài Gòn', '/images/pins/pin-nha-tho-duc-ba.png'),
    ('c1b2c3d4-0008-4000-c000-000000000008', 'b1b2c3d4-0008-4000-b000-000000000008', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Nhà hát Thành phố', '/images/pins/pin-nha-hat-tp.png'),
    ('c1b2c3d4-0009-4000-c000-000000000009', 'b1b2c3d4-0009-4000-b000-000000000009', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Bến Nhà Rồng', '/images/pins/pin-ben-nha-rong.png'),
    ('c1b2c3d4-0010-4000-c000-000000000010', 'b1b2c3d4-0010-4000-b000-000000000010', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Chợ Bến Thành', '/images/pins/pin-cho-ben-thanh.png'),
    ('c1b2c3d4-0011-4000-c000-000000000011', 'b1b2c3d4-0011-4000-b000-000000000011', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Bảo tàng Chứng tích Chiến tranh', '/images/pins/pin-war-remnants.png')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name;

-- 6. Pin Items (Mã QR Tokens kiểm thử)
INSERT INTO public.pin_items (id, design_id, qr_token_hash, status)
VALUES
    -- Miền Bắc & Trung
    ('d1b2c3d4-0001-4000-d000-000000000001', 'c1b2c3d4-0001-4000-c000-000000000001', 'dde600be2ced05bcbd97706f6776fbe5f6d4c41c90f9de2a91e9441ba651fb09', 'active'), -- DHP-THANGLONG-2026-TEST01
    ('d1b2c3d4-0002-4000-d000-000000000002', 'c1b2c3d4-0002-4000-c000-000000000002', '3b913f720353b3bd14c31ca7e79cdee9fde43a3f280f1e76bab56dc45e112c11', 'active'), -- DHP-HOIAN-2026-TEST02
    ('d1b2c3d4-0003-4000-d000-000000000003', 'c1b2c3d4-0003-4000-c000-000000000003', '4d4ebeee341be269c7aa7c2339c3f8715be6f75758ecf4942f39ca52288d8dea', 'active'), -- DHP-HUE-2026-TEST03
    ('d1b2c3d4-0004-4000-d000-000000000004', 'c1b2c3d4-0004-4000-c000-000000000004', 'c3e5f6d5fcd387cd632b5486276e7c4545f424e351aa2bec5a1bd3d43bb076c8', 'active'), -- DHP-HALONG-2026-TEST04

    -- 7 Di tích TP.HCM
    ('d1b2c3d4-0005-4000-d000-000000000005', 'c1b2c3d4-0005-4000-c000-000000000005', '9ee7021229480c3e9d8aa77e6db85fb8db0346c5d707908f207b58cccb369418', 'active'), -- DHP-DINHDOCLAP-2026-TEST05
    ('d1b2c3d4-0007-4000-d000-000000000007', 'c1b2c3d4-0006-4000-c000-000000000006', '764fba704c06aa541e2ebc4130cc900d1d3c77f8b67f06b5ba17237a22d50bf2', 'active'), -- DHP-BUUDIEN-2026-TEST07
    ('d1b2c3d4-0008-4000-d000-000000000008', 'c1b2c3d4-0007-4000-c000-000000000007', '8e42b2294e3cfe73bdb38b60c7e8c552f0b0f4ec0bfe98bdd97efb0ae92c0ab3', 'active'), -- DHP-DUCBASAIGON-2026-TEST08
    ('d1b2c3d4-0009-4000-d000-000000000009', 'c1b2c3d4-0008-4000-c000-000000000008', '04ae055c2dafd7237d1d94eb642f60c2bc3769b9046347baf0344340e8fa8d01', 'active'), -- DHP-NHAHATTP-2026-TEST09
    ('d1b2c3d4-0010-4000-d000-000000000010', 'c1b2c3d4-0009-4000-c000-000000000009', 'ab9f970da2fa0415b69652114d078202968ff40a2bc173c8257d5dbe5cd25abf', 'active'), -- DHP-BENNHARONG-2026-TEST10
    ('d1b2c3d4-0011-4000-d000-000000000011', 'c1b2c3d4-0010-4000-c000-000000000010', 'f147f5db25fb061109a3cd86b53d20e2112940a751ca0879eb1ae4ed83f6ba8d', 'active'), -- DHP-CHOBENTHANH-2026-TEST11
    ('d1b2c3d4-0012-4000-d000-000000000012', 'c1b2c3d4-0011-4000-c000-000000000011', 'bf057024e06c362a85c719b1bab9a1b4efc68dcb6dd79c75f093bdceb64457fd', 'active'), -- DHP-WARREMNANTS-2026-TEST12

    -- Revoked Token kiểm thử lỗi
    ('d1b2c3d4-0006-4000-d000-000000000006', 'c1b2c3d4-0001-4000-c000-000000000001', 'bac3bab753eddf77eeb3e17b68eb4f0213164e3ca85631e0c922c86216ce57c2', 'revoked')  -- DHP-REVOKED-2026-TEST06
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status;

-- 5. Pin Designs (Gắn huy hiệu lưu niệm cho từng di tích)
INSERT INTO public.pin_designs (id, site_id, collection_id, name, image_url)
VALUES
    -- Miền Bắc & Trung
    ('c1b2c3d4-0001-4000-c000-000000000001', 'b1b2c3d4-0001-4000-b000-000000000001', 'a1b2c3d4-0001-4000-a000-000000000001', 'Pin Hoàng thành Thăng Long', '/images/pins/pin-hoang-thanh-thang-long.png'),
    ('c1b2c3d4-0002-4000-c000-000000000002', 'b1b2c3d4-0002-4000-b000-000000000002', 'a1b2c3d4-0002-4000-a000-000000000002', 'Pin Phố cổ Hội An — Chùa Cầu', '/images/pins/pin-pho-co-hoi-an.png'),
    ('c1b2c3d4-0003-4000-c000-000000000003', 'b1b2c3d4-0003-4000-b000-000000000003', 'a1b2c3d4-0002-4000-a000-000000000002', 'Pin Đại Nội Huế — Ngọ Môn', '/images/pins/pin-dai-noi-hue.png'),
    ('c1b2c3d4-0004-4000-c000-000000000004', 'b1b2c3d4-0004-4000-b000-000000000004', 'a1b2c3d4-0001-4000-a000-000000000001', 'Pin Vịnh Hạ Long — Hòn Trống Mái', '/images/pins/pin-vinh-ha-long.png'),

    -- 7 Di tích TP.HCM
    ('c1b2c3d4-0005-4000-c000-000000000005', 'b1b2c3d4-0005-4000-b000-000000000005', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Dinh Độc Lập', '/images/pins/pin-dinh-doc-lap.png'),
    ('c1b2c3d4-0006-4000-c000-000000000006', 'b1b2c3d4-0006-4000-b000-000000000006', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Bưu điện Trung tâm Sài Gòn', '/images/pins/pin-buu-dien-tp.png'),
    ('c1b2c3d4-0007-4000-c000-000000000007', 'b1b2c3d4-0007-4000-b000-000000000007', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Nhà thờ Đức Bà Sài Gòn', '/images/pins/pin-nha-tho-duc-ba.png'),
    ('c1b2c3d4-0008-4000-c000-000000000008', 'b1b2c3d4-0008-4000-b000-000000000008', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Nhà hát Thành phố', '/images/pins/pin-nha-hat-tp.png'),
    ('c1b2c3d4-0009-4000-c000-000000000009', 'b1b2c3d4-0009-4000-b000-000000000009', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Bến Nhà Rồng', '/images/pins/pin-ben-nha-rong.png'),
    ('c1b2c3d4-0010-4000-c000-000000000010', 'b1b2c3d4-0010-4000-b000-000000000010', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Chợ Bến Thành', '/images/pins/pin-cho-ben-thanh.png'),
    ('c1b2c3d4-0011-4000-c000-000000000011', 'b1b2c3d4-0011-4000-b000-000000000011', 'a1b2c3d4-0003-4000-a000-000000000003', 'Pin Bảo tàng Chứng tích Chiến tranh', '/images/pins/pin-war-remnants.png')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name;

-- 6. Pin Items (Mã QR Tokens kiểm thử)
INSERT INTO public.pin_items (id, design_id, qr_token_hash, status)
VALUES
    -- Miền Bắc & Trung
    ('d1b2c3d4-0001-4000-d000-000000000001', 'c1b2c3d4-0001-4000-c000-000000000001', 'dde600be2ced05bcbd97706f6776fbe5f6d4c41c90f9de2a91e9441ba651fb09', 'active'), -- DHP-THANGLONG-2026-TEST01
    ('d1b2c3d4-0002-4000-d000-000000000002', 'c1b2c3d4-0002-4000-c000-000000000002', '3b913f720353b3bd14c31ca7e79cdee9fde43a3f280f1e76bab56dc45e112c11', 'active'), -- DHP-HOIAN-2026-TEST02
    ('d1b2c3d4-0003-4000-d000-000000000003', 'c1b2c3d4-0003-4000-c000-000000000003', '4d4ebeee341be269c7aa7c2339c3f8715be6f75758ecf4942f39ca52288d8dea', 'active'), -- DHP-HUE-2026-TEST03
    ('d1b2c3d4-0004-4000-d000-000000000004', 'c1b2c3d4-0004-4000-c000-000000000004', 'c3e5f6d5fcd387cd632b5486276e7c4545f424e351aa2bec5a1bd3d43bb076c8', 'active'), -- DHP-HALONG-2026-TEST04

    -- 7 Di tích TP.HCM
    ('d1b2c3d4-0005-4000-d000-000000000005', 'c1b2c3d4-0005-4000-c000-000000000005', '9ee7021229480c3e9d8aa77e6db85fb8db0346c5d707908f207b58cccb369418', 'active'), -- DHP-DINHDOCLAP-2026-TEST05
    ('d1b2c3d4-0007-4000-d000-000000000007', 'c1b2c3d4-0006-4000-c000-000000000006', '764fba704c06aa541e2ebc4130cc900d1d3c77f8b67f06b5ba17237a22d50bf2', 'active'), -- DHP-BUUDIEN-2026-TEST07
    ('d1b2c3d4-0008-4000-d000-000000000008', 'c1b2c3d4-0007-4000-c000-000000000007', '8e42b2294e3cfe73bdb38b60c7e8c552f0b0f4ec0bfe98bdd97efb0ae92c0ab3', 'active'), -- DHP-DUCBASAIGON-2026-TEST08
    ('d1b2c3d4-0009-4000-d000-000000000009', 'c1b2c3d4-0008-4000-c000-000000000008', '04ae055c2dafd7237d1d94eb642f60c2bc3769b9046347baf0344340e8fa8d01', 'active'), -- DHP-NHAHATTP-2026-TEST09
    ('d1b2c3d4-0010-4000-d000-000000000010', 'c1b2c3d4-0009-4000-c000-000000000009', 'ab9f970da2fa0415b69652114d078202968ff40a2bc173c8257d5dbe5cd25abf', 'active'), -- DHP-BENNHARONG-2026-TEST10
    ('d1b2c3d4-0011-4000-d000-000000000011', 'c1b2c3d4-0010-4000-c000-000000000010', 'f147f5db25fb061109a3cd86b53d20e2112940a751ca0879eb1ae4ed83f6ba8d', 'active'), -- DHP-CHOBENTHANH-2026-TEST11
    ('d1b2c3d4-0012-4000-d000-000000000012', 'c1b2c3d4-0011-4000-c000-000000000011', 'bf057024e06c362a85c719b1bab9a1b4efc68dcb6dd79c75f093bdceb64457fd', 'active'), -- DHP-WARREMNANTS-2026-TEST12

    -- Revoked Token kiểm thử lỗi
    ('d1b2c3d4-0006-4000-d000-000000000006', 'c1b2c3d4-0001-4000-c000-000000000001', 'bac3bab753eddf77eeb3e17b68eb4f0213164e3ca85631e0c922c86216ce57c2', 'revoked')  -- DHP-REVOKED-2026-TEST06
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status;

