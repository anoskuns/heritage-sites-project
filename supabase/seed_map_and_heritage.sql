-- ==============================================================================
-- seed_map_and_heritage.sql
-- KỊCH BẢN TỔNG HỢP: KHỞI TẠO BẢN ĐỒ DI SẢN 3 MIỀN, 34 TỈNH THÀNH & DI TÍCH
-- Chạy trực tiếp 1-click trong Supabase Studio SQL Editor
-- ==============================================================================

-- 1. BẢNG REGIONS (3 MIỀN)
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE, -- 'bac', 'trung', 'nam'
    name_vi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_vi TEXT,
    description_en TEXT,
    order_index INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. BẢNG AREAS (34 TỈNH / THÀNH PHỐ MỚI THEO QUY HOẠCH)
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    name_vi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    center_lat NUMERIC(10, 7) NOT NULL,
    center_lng NUMERIC(10, 7) NOT NULL,
    default_zoom INT NOT NULL DEFAULT 12,
    is_active BOOLEAN NOT NULL DEFAULT false, -- TP.HCM = true
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. BỔ SUNG CỘT AREA_ID VÀO HERITAGE_SITES
ALTER TABLE public.heritage_sites 
ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL;

-- 4. TẠO INDEXES TỐI ƯU TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_regions_slug ON public.regions(slug);
CREATE INDEX IF NOT EXISTS idx_areas_region_id ON public.areas(region_id);
CREATE INDEX IF NOT EXISTS idx_areas_slug ON public.areas(slug);
CREATE INDEX IF NOT EXISTS idx_heritage_sites_area_id ON public.heritage_sites(area_id);

-- 5. BẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published regions" ON public.regions;
CREATE POLICY "Public can view published regions"
ON public.regions FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public can view areas of published regions" ON public.areas;
CREATE POLICY "Public can view areas of published regions"
ON public.areas FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.regions r
        WHERE r.id = areas.region_id AND r.is_published = true
    )
);

-- ==============================================================================
-- NẠP DỮ LIỆU SEED: 3 MIỀN
-- ==============================================================================
INSERT INTO public.regions (id, slug, name_vi, name_en, description_vi, description_en, order_index, is_published)
VALUES
    ('r1b2c3d4-0001-4000-r000-000000000001', 'bac', 'Miền Bắc', 'Northern Vietnam', 'Kinh đô ngàn năm văn hiến, nơi khởi nguồn của nền văn minh sông Hồng với những di sản kỳ vĩ.', 'The cradle of Vietnamese civilization, home to thousand-year-old capitals and wonders.', 1, true),
    ('r1b2c3d4-0002-4000-r000-000000000002', 'trung', 'Miền Trung', 'Central Vietnam', 'Dải đất di sản miền Trung với cung điện triều Nguyễn, thương cảng cổ kính và bờ biển tuyệt đẹp.', 'The heritage strip featuring royal palaces, ancient trading towns, and vibrant coastal culture.', 2, true),
    ('r1b2c3d4-0003-4000-r000-000000000003', 'nam', 'Miền Nam', 'Southern Vietnam', 'Vùng đất phương Nam năng động, giao thoa văn hóa rực rỡ với trái tim là TP. Hồ Chí Minh.', 'The dynamic southern hub of cultural fusion, historic landmarks, centered at Ho Chi Minh City.', 3, true)
ON CONFLICT (id) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en,
    description_vi = EXCLUDED.description_vi,
    description_en = EXCLUDED.description_en;

-- ==============================================================================
-- NẠP DỮ LIỆU SEED: 34 TỈNH THÀNH CHÍNH THỨC
-- ==============================================================================
-- MIỀN BẮC (15 ĐƠN VỊ HÀNH CHÍNH)
INSERT INTO public.areas (id, region_id, slug, name_vi, name_en, center_lat, center_lng, default_zoom, is_active, order_index)
VALUES
    ('e1b2c3d4-0001-4000-a000-000000000001', 'r1b2c3d4-0001-4000-r000-000000000001', 'ha-noi', 'Thành phố Hà Nội', 'Hanoi Capital City', 21.0285110, 105.8544440, 13, false, 1),
    ('e1b2c3d4-0001-4000-a000-000000000002', 'r1b2c3d4-0001-4000-r000-000000000001', 'quang-ninh', 'Tỉnh Quảng Ninh', 'Quang Ninh Province', 20.9500000, 107.0800000, 11, false, 2),
    ('e1b2c3d4-0001-4000-a000-000000000003', 'r1b2c3d4-0001-4000-r000-000000000001', 'hai-phong', 'Thành phố Hải Phòng', 'Haiphong City', 20.8449120, 106.6880840, 12, false, 3),
    ('e1b2c3d4-0001-4000-a000-000000000004', 'r1b2c3d4-0001-4000-r000-000000000001', 'bac-ninh', 'Tỉnh Bắc Ninh', 'Bac Ninh Province', 21.1860960, 106.0763150, 12, false, 4),
    ('e1b2c3d4-0001-4000-a000-000000000005', 'r1b2c3d4-0001-4000-r000-000000000001', 'hung-yen', 'Tỉnh Hưng Yên', 'Hung Yen Province', 20.6461410, 106.0511190, 12, false, 5),
    ('e1b2c3d4-0001-4000-a000-000000000006', 'r1b2c3d4-0001-4000-r000-000000000001', 'ninh-binh', 'Tỉnh Ninh Bình', 'Ninh Binh Province', 20.2506140, 105.9744540, 12, false, 6),
    ('e1b2c3d4-0001-4000-a000-000000000007', 'r1b2c3d4-0001-4000-r000-000000000001', 'phu-tho', 'Tỉnh Phú Thọ', 'Phu Tho Province', 21.3227440, 105.4019480, 12, false, 7),
    ('e1b2c3d4-0001-4000-a000-000000000008', 'r1b2c3d4-0001-4000-r000-000000000001', 'thai-nguyen', 'Tỉnh Thái Nguyên', 'Thai Nguyen Province', 21.5942220, 105.8481520, 12, false, 8),
    ('e1b2c3d4-0001-4000-a000-000000000009', 'r1b2c3d4-0001-4000-r000-000000000001', 'lang-son', 'Tỉnh Lạng Sơn', 'Lang Son Province', 21.8537680, 106.7620470, 12, false, 9),
    ('e1b2c3d4-0001-4000-a000-000000000010', 'r1b2c3d4-0001-4000-r000-000000000001', 'cao-bang', 'Tỉnh Cao Bằng', 'Cao Bang Province', 22.6664790, 106.2638890, 12, false, 10),
    ('e1b2c3d4-0001-4000-a000-000000000011', 'r1b2c3d4-0001-4000-r000-000000000001', 'tuyen-quang', 'Tỉnh Tuyên Quang', 'Tuyen Quang Province', 21.8236110, 105.2180560, 12, false, 11),
    ('e1b2c3d4-0001-4000-a000-000000000012', 'r1b2c3d4-0001-4000-r000-000000000001', 'lao-cai', 'Tỉnh Lào Cai', 'Lao Cai Province', 22.4855560, 103.9708330, 12, false, 12),
    ('e1b2c3d4-0001-4000-a000-000000000013', 'r1b2c3d4-0001-4000-r000-000000000001', 'dien-bien', 'Tỉnh Điện Biên', 'Dien Bien Province', 21.3852780, 103.0180560, 12, false, 13),
    ('e1b2c3d4-0001-4000-a000-000000000014', 'r1b2c3d4-0001-4000-r000-000000000001', 'lai-chau', 'Tỉnh Lai Châu', 'Lai Chau Province', 22.3963890, 103.4688890, 12, false, 14),
    ('e1b2c3d4-0001-4000-a000-000000000015', 'r1b2c3d4-0001-4000-r000-000000000001', 'son-la', 'Tỉnh Sơn La', 'Son La Province', 21.3280560, 103.9180560, 12, false, 15)
ON CONFLICT (id) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en,
    center_lat = EXCLUDED.center_lat,
    center_lng = EXCLUDED.center_lng;

-- MIỀN TRUNG (11 ĐƠN VỊ HÀNH CHÍNH)
INSERT INTO public.areas (id, region_id, slug, name_vi, name_en, center_lat, center_lng, default_zoom, is_active, order_index)
VALUES
    ('e1b2c3d4-0002-4000-a000-000000000001', 'r1b2c3d4-0002-4000-r000-000000000002', 'thua-thien-hue', 'Thành phố Huế', 'Hue City', 16.4637000, 107.5909000, 13, false, 1),
    ('e1b2c3d4-0002-4000-a000-000000000002', 'r1b2c3d4-0002-4000-r000-000000000002', 'quang-nam', 'Thành phố Đà Nẵng (Đà Nẵng + Hội An)', 'Da Nang & Hoi An Region', 15.8800580, 108.3380470, 13, false, 2),
    ('e1b2c3d4-0002-4000-a000-000000000003', 'r1b2c3d4-0002-4000-r000-000000000002', 'thanh-hoa', 'Tỉnh Thanh Hoá', 'Thanh Hoa Province', 19.8066920, 105.7851810, 12, false, 3),
    ('e1b2c3d4-0002-4000-a000-000000000004', 'r1b2c3d4-0002-4000-r000-000000000002', 'nghe-an', 'Tỉnh Nghệ An', 'Nghe An Province', 18.6733730, 105.6813350, 12, false, 4),
    ('e1b2c3d4-0002-4000-a000-000000000005', 'r1b2c3d4-0002-4000-r000-000000000002', 'ha-tinh', 'Tỉnh Hà Tĩnh', 'Ha Tinh Province', 18.3429940, 105.9059520, 12, false, 5),
    ('e1b2c3d4-0002-4000-a000-000000000006', 'r1b2c3d4-0002-4000-r000-000000000002', 'quang-tri', 'Tỉnh Quảng Trị', 'Quang Tri Province', 16.8166670, 107.1000000, 12, false, 6),
    ('e1b2c3d4-0002-4000-a000-000000000007', 'r1b2c3d4-0002-4000-r000-000000000002', 'quang-ngai', 'Tỉnh Quảng Ngãi', 'Quang Ngai Province', 15.1204680, 108.7922740, 12, false, 7),
    ('e1b2c3d4-0002-4000-a000-000000000008', 'r1b2c3d4-0002-4000-r000-000000000002', 'gia-lai', 'Tỉnh Gia Lai', 'Gia Lai Province', 13.9833330, 108.0000000, 12, false, 8),
    ('e1b2c3d4-0002-4000-a000-000000000009', 'r1b2c3d4-0002-4000-r000-000000000002', 'dak-lak', 'Tỉnh Đắk Lắk', 'Dak Lak Province', 12.6666670, 108.0500000, 12, false, 9),
    ('e1b2c3d4-0002-4000-a000-000000000010', 'r1b2c3d4-0002-4000-r000-000000000002', 'khanh-hoa', 'Tỉnh Khánh Hoà', 'Khanh Hoa Province', 12.2500000, 109.1833330, 12, false, 10),
    ('e1b2c3d4-0002-4000-a000-000000000011', 'r1b2c3d4-0002-4000-r000-000000000002', 'lam-dong', 'Tỉnh Lâm Đồng', 'Lam Dong Province', 11.9416670, 108.4383330, 12, false, 11)
ON CONFLICT (id) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en,
    center_lat = EXCLUDED.center_lat,
    center_lng = EXCLUDED.center_lng;

-- MIỀN NAM (8 ĐƠN VỊ HÀNH CHÍNH — TRỌNG TÂM TP. HỒ CHÍ MINH)
INSERT INTO public.areas (id, region_id, slug, name_vi, name_en, center_lat, center_lng, default_zoom, is_active, order_index)
VALUES
    ('e1b2c3d4-0003-4000-a000-000000000001', 'r1b2c3d4-0003-4000-r000-000000000003', 'tp-ho-chi-minh', 'Thành phố Hồ Chí Minh', 'Ho Chi Minh City', 10.7769440, 106.7009000, 14, true, 1),
    ('e1b2c3d4-0003-4000-a000-000000000002', 'r1b2c3d4-0003-4000-r000-000000000003', 'dong-nai', 'Tỉnh Đồng Nai', 'Dong Nai Province', 10.9572220, 106.8427780, 12, false, 2),
    ('e1b2c3d4-0003-4000-a000-000000000003', 'r1b2c3d4-0003-4000-r000-000000000003', 'tay-ninh', 'Tỉnh Tây Ninh', 'Tay Ninh Province', 11.3000000, 106.1000000, 12, false, 3),
    ('e1b2c3d4-0003-4000-a000-000000000004', 'r1b2c3d4-0003-4000-r000-000000000003', 'dong-thap', 'Tỉnh Đồng Tháp', 'Dong Thap Province', 10.4566670, 105.6358330, 12, false, 4),
    ('e1b2c3d4-0003-4000-a000-000000000005', 'r1b2c3d4-0003-4000-r000-000000000003', 'vinh-long', 'Tỉnh Vĩnh Long', 'Vinh Long Province', 10.2500000, 105.9666670, 12, false, 5),
    ('e1b2c3d4-0003-4000-a000-000000000006', 'r1b2c3d4-0003-4000-r000-000000000003', 'an-giang', 'Tỉnh An Giang', 'An Giang Province', 10.5215840, 105.1258950, 12, false, 6),
    ('e1b2c3d4-0003-4000-a000-000000000007', 'r1b2c3d4-0003-4000-r000-000000000003', 'can-tho', 'Thành phố Cần Thơ', 'Can Tho City', 10.0333330, 105.7833330, 12, false, 7),
    ('e1b2c3d4-0003-4000-a000-000000000008', 'r1b2c3d4-0003-4000-r000-000000000003', 'ca-mau', 'Tỉnh Cà Mau', 'Ca Mau Province', 9.1769440, 105.1500000, 12, false, 8)
ON CONFLICT (id) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en,
    center_lat = EXCLUDED.center_lat,
    center_lng = EXCLUDED.center_lng,
    is_active = EXCLUDED.is_active;

-- ==============================================================================
-- NẠP DỮ LIỆU SEED: 7 DI TÍCH TIÊU BIỂU TẠI TP. HỒ CHÍ MINH (GẮN AREA_ID)
-- ==============================================================================
INSERT INTO public.heritage_sites (
    id, area_id, slug, name_vi, name_en, 
    story_vi, story_en, description_vi, description_en, 
    latitude, longitude, cover_image_url, is_published
)
VALUES
    -- 1. Dinh Độc Lập
    (
        'b1b2c3d4-0005-4000-b000-000000000005',
        'e1b2c3d4-0003-4000-a000-000000000001',
        'dinh-doc-lap',
        'Dinh Độc Lập',
        'Independence Palace',
        'Dinh Độc Lập là Di tích lịch sử cấp Quốc gia đặc biệt. Đây là chứng nhân lịch sử của ngày đại thắng mùa xuân 30/4/1975, mang kiến trúc giao thoa truyền thống và hiện đại do Kiến trúc sư Ngô Viết Thụ thiết kế.',
        'Special National Historical Relic. Symbol of the historic reunification on April 30, 1975, designed by master architect Ngo Viet Thu.',
        'Chứng nhân lịch sử ngày đại thắng mùa xuân 30/4/1975, kiến trúc kết hợp truyền thống phương Đông và hiện đại.',
        'Historic site of the April 30, 1975 reunification, blending Eastern philosophy with modern architecture.',
        10.7769440, 106.6952780,
        'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
        true
    ),
    -- 2. Bưu điện Trung tâm Sài Gòn
    (
        'b1b2c3d4-0006-4000-b000-000000000006',
        'e1b2c3d4-0003-4000-a000-000000000001',
        'buu-dien-trung-tam-sai-gon',
        'Bưu điện Trung tâm Sài Gòn',
        'Saigon Central Post Office',
        'Công trình kiến trúc Phục Hưng Pháp kết hợp Gothic hơn 130 năm tuổi tại Công xã Paris, với vòm trần nguy nga và hệ thống bản đồ lịch sử vẽ tay độc bản.',
        'Over 130-year-old French Renaissance and Gothic masterpiece at Paris Commune Square, renowned for its majestic arches and historic hand-painted maps.',
        'Kiến trúc Pháp cổ kính xây dựng từ năm 1886-1891, biểu tượng bưu chính văn hóa Sài Gòn.',
        'Classic French colonial architecture built in 1886-1891, a timeless cultural icon.',
        10.7797780, 106.6999720,
        'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
        true
    ),
    -- 3. Nhà thờ Đức Bà Sài Gòn
    (
        'b1b2c3d4-0007-4000-b000-000000000007',
        'e1b2c3d4-0003-4000-a000-000000000001',
        'nha-tho-duc-ba',
        'Nhà thờ Đức Bà Sài Gòn',
        'Notre-Dame Cathedral Basilica of Saigon',
        'Vương cung thánh đường Chính tòa Đức Mẹ Vô nhiễm Nguyên tội khánh thành năm 1880 với gạch ngói Marseille đỏ thắm và đôi tháp chuông cao 58m vươn lên giữa trời xanh.',
        'Inaugurated in 1880 with Marseille red bricks and twin 58-meter bell towers, a monumental Romanesque basilica at the heart of Saigon.',
        'Vương cung thánh đường hơn 140 năm tuổi với kiến trúc Romanesque kết hợp Gothic độc đáo.',
        'Over 140-year-old Romanesque and Gothic cathedral, the spiritual centerpiece of the city.',
        10.7797220, 106.6990000,
        'https://images.unsplash.com/photo-1583417658763-8a3854db2471?auto=format&fit=crop&w=1200&q=80',
        true
    ),
    -- 4. Nhà hát Thành phố
    (
        'b1b2c3d4-0008-4000-b000-000000000008',
        'e1b2c3d4-0003-4000-a000-000000000001',
        'nha-hat-thanh-pho',
        'Nhà hát Thành phố',
        'Saigon Opera House',
        'Nhà hát mang phong cách Flamboyant Pháp khánh thành năm 1900, trung tâm biểu diễn nghệ thuật hàn lâm với phù điêu đắp nổi và tượng nữ thần tinh xảo.',
        'Inaugurated in 1900 on Dong Khoi Street, this French Flamboyant opera house is the pinnacle of classical arts and theater in Ho Chi Minh City.',
        'Công trình nghệ thuật mang phong cách Gothic và Phục hưng Pháp khánh thành năm 1900.',
        'Gothic and French Renaissance municipal theater opened in 1900 on historic Dong Khoi street.',
        10.7766670, 106.7031670,
        'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200&q=80',
        true
    ),
    -- 5. Bến Nhà Rồng
    (
        'b1b2c3d4-0009-4000-b000-000000000009',
        'e1b2c3d4-0003-4000-a000-000000000001',
        'ben-nha-rong',
        'Bến Nhà Rồng',
        'Dragon Wharf (Ho Chi Minh Museum)',
        'Di tích lịch sử thiêng liêng bên dòng sông Sài Gòn, nơi Bác Hồ bắt đầu hành trình bôn ba tìm đường cứu nước ngày 5/6/1911.',
        'The historic waterfront where President Ho Chi Minh embarked on his journey for national liberation on June 5, 1911.',
        'Nơi Chủ tịch Hồ Chí Minh ra đi tìm đường cứu nước năm 1911, hiện là Bảo tàng Hồ Chí Minh.',
        'The historic wharf from which President Ho Chi Minh departed in 1911, now a major museum.',
        10.7683330, 106.7069440,
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
        true
    ),
    -- 6. Chợ Bến Thành
    (
        'b1b2c3d4-0010-4000-b000-000000000010',
        'e1b2c3d4-0003-4000-a000-000000000001',
        'cho-ben-thanh',
        'Chợ Bến Thành',
        'Ben Thanh Market',
        'Ngôi chợ biểu tượng của Sài Gòn hơn 110 năm tuổi với tháp đồng hồ 4 mặt nổi tiếng, điểm giao thoa thương mại và ẩm thực đặc trưng Nam Bộ.',
        'Iconic 110-year-old market with its celebrated four-faced clock tower, the bustling epicenter of Southern Vietnamese commerce and cuisine.',
        'Biểu tượng giao thương và văn hóa ẩm thực hơn 100 năm tuổi của người dân TP.HCM.',
        'Centuries-old market famous for its iconic clock tower, handicrafts, and local street cuisine.',
        10.7725000, 106.6980560,
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
        true
    ),
    -- 7. Bảo tàng Chứng tích Chiến tranh
    (
        'b1b2c3d4-0011-4000-b000-000000000011',
        'e1b2c3d4-0003-4000-a000-000000000001',
        'bao-tang-chung-tich-chien-tranh',
        'Bảo tàng Chứng tích Chiến tranh',
        'War Remnants Museum',
        'Bảo tàng lưu giữ những tư liệu hiện vật chân thực về chiến tranh Việt Nam, lan tỏa thông điệp sâu sắc về hòa bình và nhân loại.',
        'World-renowned museum exhibiting poignant artifacts of the Vietnam War with an enduring call for peace and reconciliation.',
        'Một trong những bảo tàng được ghé thăm nhiều nhất Việt Nam, truyền tải thông điệp hòa bình.',
        'One of the most visited museums in Vietnam, conveying a powerful message of peace.',
        10.7794440, 106.6922220,
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
        true
    )
ON CONFLICT (id) DO UPDATE SET
    area_id = EXCLUDED.area_id,
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en,
    story_vi = EXCLUDED.story_vi,
    story_en = EXCLUDED.story_en,
    description_vi = EXCLUDED.description_vi,
    description_en = EXCLUDED.description_en,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    cover_image_url = EXCLUDED.cover_image_url,
    is_published = EXCLUDED.is_published;

-- GẮN DI TÍCH MIỀN BẮC & MIỀN TRUNG VÀO AREA TƯƠNG ỨNG
UPDATE public.heritage_sites SET area_id = 'e1b2c3d4-0001-4000-a000-000000000001' WHERE slug = 'hoang-thanh-thang-long';
UPDATE public.heritage_sites SET area_id = 'e1b2c3d4-0001-4000-a000-000000000002' WHERE slug = 'vinh-ha-long';
UPDATE public.heritage_sites SET area_id = 'e1b2c3d4-0002-4000-a000-000000000001' WHERE slug = 'dai-noi-hue';
UPDATE public.heritage_sites SET area_id = 'e1b2c3d4-0002-4000-a000-000000000002' WHERE slug = 'pho-co-hoi-an';

-- HOÀN TẤT!

