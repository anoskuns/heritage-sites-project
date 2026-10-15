import { supabase } from '../../services/supabase/client'

export interface MapSiteItem {
  id: string
  slug: string
  nameVi: string
  nameEn: string
  descriptionVi: string | null
  descriptionEn: string | null
  latitude: number
  longitude: number
  coverImageUrl: string
  isUnlocked: boolean
  unlockedAt?: string
  collectionNameVi?: string
  collectionNameEn?: string
  areaId?: string | null
  areaSlug?: string
  areaNameVi?: string
  areaNameEn?: string
  regionSlug?: string
  address?: string
}

export interface MapDataResult {
  sites: MapSiteItem[]
  unlockedCount: number
  totalCount: number
}

export interface AreaItem {
  id: string
  regionId: string
  slug: string
  nameVi: string
  nameEn: string
  centerLat: number
  centerLng: number
  defaultZoom: number
  isActive: boolean
  orderIndex: number
  siteCount: number
  unlockedCount: number
}

export interface RegionItem {
  id: string
  slug: 'bac' | 'trung' | 'nam' | string
  nameVi: string
  nameEn: string
  descriptionVi: string | null
  descriptionEn: string | null
  orderIndex: number
  siteCount: number
  unlockedCount: number
  areas: AreaItem[]
}

// 7 Iconic Heritage Sites in TP. Hồ Chí Minh
export const HCM_HERITAGE_SITES: MapSiteItem[] = [
  {
    id: 'b1b2c3d4-0005-4000-b000-000000000005',
    slug: 'dinh-doc-lap',
    nameVi: 'Dinh Độc Lập',
    nameEn: 'Independence Palace',
    descriptionVi: 'Di tích lịch sử cấp Quốc gia đặc biệt. Chứng nhân lịch sử ngày đại thắng mùa xuân 30/4/1975, mang kiến trúc giao thoa truyền thống và hiện đại do KTS Ngô Viết Thụ thiết kế.',
    descriptionEn: 'Special National Historical Relic. Symbol of the historic reunification on April 30, 1975, designed by master architect Ngo Viet Thu.',
    latitude: 10.776944,
    longitude: 106.695278,
    coverImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
    isUnlocked: false,
    areaSlug: 'tp-ho-chi-minh',
    regionSlug: 'nam',
    areaNameVi: 'TP. Hồ Chí Minh',
    areaNameEn: 'Ho Chi Minh City',
    collectionNameVi: 'Di sản Sài Gòn — TP. Hồ Chí Minh',
    collectionNameEn: 'Saigon — Ho Chi Minh City Heritage',
    address: '135 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1',
  },
  {
    id: 'b1b2c3d4-0006-4000-b000-000000000006',
    slug: 'buu-dien-trung-tam-sai-gon',
    nameVi: 'Bưu điện Trung tâm Sài Gòn',
    nameEn: 'Saigon Central Post Office',
    descriptionVi: 'Công trình kiến trúc Phục Hưng Pháp kết hợp Gothic hơn 130 năm tuổi tại Công xã Paris, với vòm trần nguy nga và hệ thống bản đồ lịch sử vẽ tay độc bản.',
    descriptionEn: 'Over 130-year-old French Renaissance and Gothic masterpiece at Paris Commune Square, renowned for its majestic arches and historic hand-painted maps.',
    latitude: 10.779778,
    longitude: 106.699972,
    coverImageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
    isUnlocked: false,
    areaSlug: 'tp-ho-chi-minh',
    regionSlug: 'nam',
    areaNameVi: 'TP. Hồ Chí Minh',
    areaNameEn: 'Ho Chi Minh City',
    collectionNameVi: 'Di sản Sài Gòn — TP. Hồ Chí Minh',
    collectionNameEn: 'Saigon — Ho Chi Minh City Heritage',
    address: '02 Công xã Paris, Phường Bến Nghé, Quận 1',
  },
  {
    id: 'b1b2c3d4-0007-4000-b000-000000000007',
    slug: 'nha-tho-duc-ba',
    nameVi: 'Nhà thờ Đức Bà Sài Gòn',
    nameEn: 'Notre-Dame Cathedral Basilica of Saigon',
    descriptionVi: 'Vương cung thánh đường Chính tòa Đức Mẹ Vô nhiễm Nguyên tội khánh thành năm 1880 với gạch ngói Marseille đỏ thắm và đôi tháp chuông cao 58m vươn lên giữa trời xanh.',
    descriptionEn: 'Inaugurated in 1880 with Marseille red bricks and twin 58-meter bell towers, a monumental Romanesque basilica at the heart of Saigon.',
    latitude: 10.779722,
    longitude: 106.699,
    coverImageUrl: 'https://images.unsplash.com/photo-1583417658763-8a3854db2471?auto=format&fit=crop&w=1200&q=80',
    isUnlocked: false,
    areaSlug: 'tp-ho-chi-minh',
    regionSlug: 'nam',
    areaNameVi: 'TP. Hồ Chí Minh',
    areaNameEn: 'Ho Chi Minh City',
    collectionNameVi: 'Di sản Sài Gòn — TP. Hồ Chí Minh',
    collectionNameEn: 'Saigon — Ho Chi Minh City Heritage',
    address: '01 Công xã Paris, Phường Bến Nghé, Quận 1',
  },
  {
    id: 'b1b2c3d4-0008-4000-b000-000000000008',
    slug: 'nha-hat-thanh-pho',
    nameVi: 'Nhà hát Thành phố',
    nameEn: 'Saigon Opera House',
    descriptionVi: 'Nhà hát mang phong cách Flamboyant Pháp khánh thành năm 1900, trung tâm biểu diễn nghệ thuật hàn lâm với phù điêu đắp nổi và tượng nữ thần tinh xảo.',
    descriptionEn: 'Inaugurated in 1900 on Dong Khoi Street, this French Flamboyant opera house is the pinnacle of classical arts and theater in Ho Chi Minh City.',
    latitude: 10.776667,
    longitude: 106.703167,
    coverImageUrl: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200&q=80',
    isUnlocked: false,
    areaSlug: 'tp-ho-chi-minh',
    regionSlug: 'nam',
    areaNameVi: 'TP. Hồ Chí Minh',
    areaNameEn: 'Ho Chi Minh City',
    collectionNameVi: 'Di sản Sài Gòn — TP. Hồ Chí Minh',
    collectionNameEn: 'Saigon — Ho Chi Minh City Heritage',
    address: '07 Công trường Lam Sơn, Phường Bến Nghé, Quận 1',
  },
  {
    id: 'b1b2c3d4-0009-4000-b000-000000000009',
    slug: 'ben-nha-rong',
    nameVi: 'Bến Nhà Rồng',
    nameEn: 'Dragon Wharf (Ho Chi Minh Museum)',
    descriptionVi: 'Di tích lịch sử thiêng liêng bên dòng sông Sài Gòn, nơi Bác Hồ bắt đầu hành trình bôn ba tìm đường cứu nước ngày 5/6/1911.',
    descriptionEn: 'The historic waterfront where President Ho Chi Minh embarked on his journey for national liberation on June 5, 1911.',
    latitude: 10.768333,
    longitude: 106.706944,
    coverImageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    isUnlocked: false,
    areaSlug: 'tp-ho-chi-minh',
    regionSlug: 'nam',
    areaNameVi: 'TP. Hồ Chí Minh',
    areaNameEn: 'Ho Chi Minh City',
    collectionNameVi: 'Di sản Sài Gòn — TP. Hồ Chí Minh',
    collectionNameEn: 'Saigon — Ho Chi Minh City Heritage',
    address: '01 Nguyễn Tất Thành, Phường 12, Quận 4',
  },
  {
    id: 'b1b2c3d4-0010-4000-b000-000000000010',
    slug: 'cho-ben-thanh',
    nameVi: 'Chợ Bến Thành',
    nameEn: 'Ben Thanh Market',
    descriptionVi: 'Biểu tượng giao thương sầm uất hơn 100 năm tuổi của Sài Gòn, với tháp đồng hồ 4 mặt huyền thoại và nhịp sống văn hóa ẩm thực rực rỡ.',
    descriptionEn: 'The century-old vibrant heart of commerce in Saigon, famous for its four-sided clock tower and rich street food culture.',
    latitude: 10.7725,
    longitude: 106.698056,
    coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    isUnlocked: false,
    areaSlug: 'tp-ho-chi-minh',
    regionSlug: 'nam',
    areaNameVi: 'TP. Hồ Chí Minh',
    areaNameEn: 'Ho Chi Minh City',
    collectionNameVi: 'Di sản Sài Gòn — TP. Hồ Chí Minh',
    collectionNameEn: 'Saigon — Ho Chi Minh City Heritage',
    address: 'Đường Lê Lợi, Phường Bến Thành, Quận 1',
  },
  {
    id: 'b1b2c3d4-0011-4000-b000-000000000011',
    slug: 'bao-tang-chung-tich-chien-tranh',
    nameVi: 'Bảo tàng Chứng tích Chiến tranh',
    nameEn: 'War Remnants Museum',
    descriptionVi: 'Bảo tàng lưu giữ những tư liệu hiện vật chân thực về chiến tranh Việt Nam, lan tỏa thông điệp sâu sắc về hòa bình và nhân loại.',
    descriptionEn: 'World-renowned museum exhibiting poignant artifacts of the Vietnam War with an enduring call for peace and reconciliation.',
    latitude: 10.779444,
    longitude: 106.692222,
    coverImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    isUnlocked: false,
    areaSlug: 'tp-ho-chi-minh',
    regionSlug: 'nam',
    areaNameVi: 'TP. Hồ Chí Minh',
    areaNameEn: 'Ho Chi Minh City',
    collectionNameVi: 'Di sản Sài Gòn — TP. Hồ Chí Minh',
    collectionNameEn: 'Saigon — Ho Chi Minh City Heritage',
    address: '28 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3',
  },
]

// Accurate Regions according to 34 Official Provinces Reference
export const OFFICIAL_REGIONS: RegionItem[] = [
  {
    id: 'r1b2c3d4-0001-4000-r000-000000000001',
    slug: 'bac',
    nameVi: 'Miền Bắc',
    nameEn: 'Northern Vietnam',
    descriptionVi: 'Kinh đô ngàn năm văn hiến, nơi khởi nguồn của nền văn minh sông Hồng với những di sản kỳ vĩ.',
    descriptionEn: 'The cradle of Vietnamese civilization, home to thousand-year-old capitals and wonders.',
    orderIndex: 1,
    siteCount: 2,
    unlockedCount: 0,
    areas: [
      { id: 'p01', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'ha-noi', nameVi: 'Thành phố Hà Nội', nameEn: 'Hanoi Capital City', centerLat: 21.028511, centerLng: 105.854444, defaultZoom: 13, isActive: false, orderIndex: 1, siteCount: 1, unlockedCount: 0 },
      { id: 'p22', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'quang-ninh', nameVi: 'Tỉnh Quảng Ninh', nameEn: 'Quang Ninh Province', centerLat: 20.95, centerLng: 107.08, defaultZoom: 11, isActive: false, orderIndex: 2, siteCount: 1, unlockedCount: 0 },
      { id: 'p31', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'hai-phong', nameVi: 'Thành phố Hải Phòng', nameEn: 'Haiphong City', centerLat: 20.844912, centerLng: 106.688084, defaultZoom: 12, isActive: false, orderIndex: 3, siteCount: 0, unlockedCount: 0 },
      { id: 'p24', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'bac-ninh', nameVi: 'Tỉnh Bắc Ninh', nameEn: 'Bac Ninh Province', centerLat: 21.186096, centerLng: 106.076315, defaultZoom: 12, isActive: false, orderIndex: 4, siteCount: 0, unlockedCount: 0 },
      { id: 'p33', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'hung-yen', nameVi: 'Tỉnh Hưng Yên', nameEn: 'Hung Yen Province', centerLat: 20.646141, centerLng: 106.051119, defaultZoom: 12, isActive: false, orderIndex: 5, siteCount: 0, unlockedCount: 0 },
      { id: 'p37', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'ninh-binh', nameVi: 'Tỉnh Ninh Bình', nameEn: 'Ninh Binh Province', centerLat: 20.250614, centerLng: 105.974454, defaultZoom: 12, isActive: false, orderIndex: 6, siteCount: 0, unlockedCount: 0 },
      { id: 'p25', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'phu-tho', nameVi: 'Tỉnh Phú Thọ', nameEn: 'Phu Tho Province', centerLat: 21.322744, centerLng: 105.401948, defaultZoom: 12, isActive: false, orderIndex: 7, siteCount: 0, unlockedCount: 0 },
      { id: 'p19', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'thai-nguyen', nameVi: 'Tỉnh Thái Nguyên', nameEn: 'Thai Nguyen Province', centerLat: 21.594222, centerLng: 105.848152, defaultZoom: 12, isActive: false, orderIndex: 8, siteCount: 0, unlockedCount: 0 },
      { id: 'p20', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'lang-son', nameVi: 'Tỉnh Lạng Sơn', nameEn: 'Lang Son Province', centerLat: 21.853768, centerLng: 106.762047, defaultZoom: 12, isActive: false, orderIndex: 9, siteCount: 0, unlockedCount: 0 },
      { id: 'p04', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'cao-bang', nameVi: 'Tỉnh Cao Bằng', nameEn: 'Cao Bang Province', centerLat: 22.666479, centerLng: 106.263889, defaultZoom: 12, isActive: false, orderIndex: 10, siteCount: 0, unlockedCount: 0 },
      { id: 'p08', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'tuyen-quang', nameVi: 'Tỉnh Tuyên Quang', nameEn: 'Tuyen Quang Province', centerLat: 21.823611, centerLng: 105.218056, defaultZoom: 12, isActive: false, orderIndex: 11, siteCount: 0, unlockedCount: 0 },
      { id: 'p15', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'lao-cai', nameVi: 'Tỉnh Lào Cai', nameEn: 'Lao Cai Province', centerLat: 22.485556, centerLng: 103.970833, defaultZoom: 12, isActive: false, orderIndex: 12, siteCount: 0, unlockedCount: 0 },
      { id: 'p11', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'dien-bien', nameVi: 'Tỉnh Điện Biên', nameEn: 'Dien Bien Province', centerLat: 21.385278, centerLng: 103.018056, defaultZoom: 12, isActive: false, orderIndex: 13, siteCount: 0, unlockedCount: 0 },
      { id: 'p12', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'lai-chau', nameVi: 'Tỉnh Lai Châu', nameEn: 'Lai Chau Province', centerLat: 22.396389, centerLng: 103.468889, defaultZoom: 12, isActive: false, orderIndex: 14, siteCount: 0, unlockedCount: 0 },
      { id: 'p14', regionId: 'r1b2c3d4-0001-4000-r000-000000000001', slug: 'son-la', nameVi: 'Tỉnh Sơn La', nameEn: 'Son La Province', centerLat: 21.328056, centerLng: 103.918056, defaultZoom: 12, isActive: false, orderIndex: 15, siteCount: 0, unlockedCount: 0 },
    ],
  },
  {
    id: 'r1b2c3d4-0002-4000-r000-000000000002',
    slug: 'trung',
    nameVi: 'Miền Trung',
    nameEn: 'Central Vietnam',
    descriptionVi: 'Dải đất di sản miền Trung với cung điện triều Nguyễn, thương cảng cổ kính và bờ biển tuyệt đẹp.',
    descriptionEn: 'The heritage strip featuring royal palaces, ancient trading towns, and vibrant coastal culture.',
    orderIndex: 2,
    siteCount: 2,
    unlockedCount: 0,
    areas: [
      { id: 'p46', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'thua-thien-hue', nameVi: 'Thành phố Huế', nameEn: 'Hue City', centerLat: 16.4637, centerLng: 107.5909, defaultZoom: 13, isActive: false, orderIndex: 1, siteCount: 1, unlockedCount: 0 },
      { id: 'p48', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'quang-nam', nameVi: 'Thành phố Đà Nẵng (Đà Nẵng + Hội An)', nameEn: 'Da Nang & Hoi An Region', centerLat: 15.880058, centerLng: 108.338047, defaultZoom: 13, isActive: false, orderIndex: 2, siteCount: 1, unlockedCount: 0 },
      { id: 'p38', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'thanh-hoa', nameVi: 'Tỉnh Thanh Hoá', nameEn: 'Thanh Hoa Province', centerLat: 19.806692, centerLng: 105.785181, defaultZoom: 12, isActive: false, orderIndex: 3, siteCount: 0, unlockedCount: 0 },
      { id: 'p40', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'nghe-an', nameVi: 'Tỉnh Nghệ An', nameEn: 'Nghe An Province', centerLat: 18.673373, centerLng: 105.681335, defaultZoom: 12, isActive: false, orderIndex: 4, siteCount: 0, unlockedCount: 0 },
      { id: 'p42', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'ha-tinh', nameVi: 'Tỉnh Hà Tĩnh', nameEn: 'Ha Tinh Province', centerLat: 18.342994, centerLng: 105.905952, defaultZoom: 12, isActive: false, orderIndex: 5, siteCount: 0, unlockedCount: 0 },
      { id: 'p44', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'quang-tri', nameVi: 'Tỉnh Quảng Trị', nameEn: 'Quang Tri Province', centerLat: 16.816667, centerLng: 107.1, defaultZoom: 12, isActive: false, orderIndex: 6, siteCount: 0, unlockedCount: 0 },
      { id: 'p51', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'quang-ngai', nameVi: 'Tỉnh Quảng Ngãi', nameEn: 'Quang Ngai Province', centerLat: 15.120468, centerLng: 108.792274, defaultZoom: 12, isActive: false, orderIndex: 7, siteCount: 0, unlockedCount: 0 },
      { id: 'p52', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'gia-lai', nameVi: 'Tỉnh Gia Lai', nameEn: 'Gia Lai Province', centerLat: 13.983333, centerLng: 108.0, defaultZoom: 12, isActive: false, orderIndex: 8, siteCount: 0, unlockedCount: 0 },
      { id: 'p66', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'dak-lak', nameVi: 'Tỉnh Đắk Lắk', nameEn: 'Dak Lak Province', centerLat: 12.666667, centerLng: 108.05, defaultZoom: 12, isActive: false, orderIndex: 9, siteCount: 0, unlockedCount: 0 },
      { id: 'p56', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'khanh-hoa', nameVi: 'Tỉnh Khánh Hoà', nameEn: 'Khanh Hoa Province', centerLat: 12.25, centerLng: 109.183333, defaultZoom: 12, isActive: false, orderIndex: 10, siteCount: 0, unlockedCount: 0 },
      { id: 'p68', regionId: 'r1b2c3d4-0002-4000-r000-000000000002', slug: 'lam-dong', nameVi: 'Tỉnh Lâm Đồng', nameEn: 'Lam Dong Province', centerLat: 11.941667, centerLng: 108.438333, defaultZoom: 12, isActive: false, orderIndex: 11, siteCount: 0, unlockedCount: 0 },
    ],
  },
  {
    id: 'r1b2c3d4-0003-4000-r000-000000000003',
    slug: 'nam',
    nameVi: 'Miền Nam',
    nameEn: 'Southern Vietnam',
    descriptionVi: 'Vùng đất phương Nam năng động, giao thoa văn hóa rực rỡ với trái tim là TP. Hồ Chí Minh.',
    descriptionEn: 'The dynamic southern hub of cultural fusion, historic landmarks, centered at Ho Chi Minh City.',
    orderIndex: 3,
    siteCount: 7,
    unlockedCount: 0,
    areas: [
      { id: 'p79', regionId: 'r1b2c3d4-0003-4000-r000-000000000003', slug: 'tp-ho-chi-minh', nameVi: 'Thành phố Hồ Chí Minh', nameEn: 'Ho Chi Minh City', centerLat: 10.776944, centerLng: 106.7009, defaultZoom: 14, isActive: true, orderIndex: 1, siteCount: 7, unlockedCount: 0 },
      { id: 'p75', regionId: 'r1b2c3d4-0003-4000-r000-000000000003', slug: 'dong-nai', nameVi: 'Tỉnh Đồng Nai', nameEn: 'Dong Nai Province', centerLat: 10.957222, centerLng: 106.842778, defaultZoom: 12, isActive: false, orderIndex: 2, siteCount: 0, unlockedCount: 0 },
      { id: 'p80', regionId: 'r1b2c3d4-0003-4000-r000-000000000003', slug: 'tay-ninh', nameVi: 'Tỉnh Tây Ninh', nameEn: 'Tay Ninh Province', centerLat: 11.3, centerLng: 106.1, defaultZoom: 12, isActive: false, orderIndex: 3, siteCount: 0, unlockedCount: 0 },
      { id: 'p82', regionId: 'r1b2c3d4-0003-4000-r000-000000000003', slug: 'dong-thap', nameVi: 'Tỉnh Đồng Tháp', nameEn: 'Dong Thap Province', centerLat: 10.456667, centerLng: 105.635833, defaultZoom: 12, isActive: false, orderIndex: 4, siteCount: 0, unlockedCount: 0 },
      { id: 'p86', regionId: 'r1b2c3d4-0003-4000-r000-000000000003', slug: 'vinh-long', nameVi: 'Tỉnh Vĩnh Long', nameEn: 'Vinh Long Province', centerLat: 10.25, centerLng: 105.966667, defaultZoom: 12, isActive: false, orderIndex: 5, siteCount: 0, unlockedCount: 0 },
      { id: 'p91', regionId: 'r1b2c3d4-0003-4000-r000-000000000003', slug: 'an-giang', nameVi: 'Tỉnh An Giang', nameEn: 'An Giang Province', centerLat: 10.521584, centerLng: 105.125895, defaultZoom: 12, isActive: false, orderIndex: 6, siteCount: 0, unlockedCount: 0 },
      { id: 'p92', regionId: 'r1b2c3d4-0003-4000-r000-000000000003', slug: 'can-tho', nameVi: 'Thành phố Cần Thơ', nameEn: 'Can Tho City', centerLat: 10.033333, centerLng: 105.783333, defaultZoom: 12, isActive: false, orderIndex: 7, siteCount: 0, unlockedCount: 0 },
      { id: 'p96', regionId: 'r1b2c3d4-0003-4000-r000-000000000003', slug: 'ca-mau', nameVi: 'Tỉnh Cà Mau', nameEn: 'Ca Mau Province', centerLat: 9.176944, centerLng: 105.15, defaultZoom: 12, isActive: false, orderIndex: 8, siteCount: 0, unlockedCount: 0 },
    ],
  },
]

/**
 * Helper to compute area and region slugs from site slug
 */
function getAreaMetadata(slug: string): { areaSlug: string; regionSlug: string; areaNameVi: string; areaNameEn: string; address?: string } {
  if (slug === 'hoang-thanh-thang-long') {
    return { areaSlug: 'ha-noi', regionSlug: 'bac', areaNameVi: 'Thành phố Hà Nội', areaNameEn: 'Hanoi', address: '19C Hoàng Diệu, Quán Thánh, Ba Đình, Hà Nội' }
  }
  if (slug === 'vinh-ha-long') {
    return { areaSlug: 'quang-ninh', regionSlug: 'bac', areaNameVi: 'Tỉnh Quảng Ninh', areaNameEn: 'Quang Ninh', address: 'Thành phố Hạ Long, Quảng Ninh' }
  }
  if (slug === 'dai-noi-hue') {
    return { areaSlug: 'thua-thien-hue', regionSlug: 'trung', areaNameVi: 'Thành phố Huế', areaNameEn: 'Hue', address: 'Đường 23/8, Phường Thuận Hòa, TP. Huế' }
  }
  if (slug === 'pho-co-hoi-an') {
    return { areaSlug: 'quang-nam', regionSlug: 'trung', areaNameVi: 'Thành phố Đà Nẵng (Quảng Nam)', areaNameEn: 'Hoi An Town', address: 'Phường Minh An, TP. Hội An, Quảng Nam' }
  }
  // All others are in TP. Hồ Chí Minh
  const hcmSite = HCM_HERITAGE_SITES.find((s) => s.slug === slug)
  return {
    areaSlug: 'tp-ho-chi-minh',
    regionSlug: 'nam',
    areaNameVi: 'Thành phố Hồ Chí Minh',
    areaNameEn: 'Ho Chi Minh City',
    address: hcmSite?.address || 'Quận 1, TP. Hồ Chí Minh',
  }
}

/**
 * Fetches regions with nested areas and user unlock stats.
 * Queries Supabase database first; gracefully falls back to OFFICIAL_REGIONS if tables not yet created.
 */
export async function fetchRegionsWithAreas(userId?: string): Promise<RegionItem[]> {
  try {
    // 1. Fetch user passport unlocked sites
    const unlockedSiteIds = new Set<string>()
    if (userId) {
      const { data: entries } = await supabase
        .from('passport_entries')
        .select('site_id')
        .eq('user_id', userId)
      if (entries) {
        for (const e of entries) {
          unlockedSiteIds.add(e.site_id)
        }
      }
    }

    // 2. Try fetching dynamic regions and areas from Supabase database
    const { data: dbRegions, error: regError } = await supabase
      .from('regions')
      .select(`
        id,
        slug,
        name_vi,
        name_en,
        description_vi,
        description_en,
        order_index,
        areas (
          id,
          region_id,
          slug,
          name_vi,
          name_en,
          center_lat,
          center_lng,
          default_zoom,
          is_active,
          order_index
        )
      `)
      .eq('is_published', true)
      .order('order_index', { ascending: true })

    if (!regError && dbRegions && dbRegions.length > 0) {
      // Fetch sites to calculate accurate counts per area
      const { data: allDbSites } = await supabase
        .from('heritage_sites')
        .select('id, area_id')
        .eq('is_published', true)

      return dbRegions.map((r: any) => {
        let regionUnlocked = 0
        let regionTotal = 0
        const sortedAreas = Array.isArray(r.areas)
          ? [...r.areas].sort((a: any, b: any) => a.order_index - b.order_index)
          : []

        const mappedAreas: AreaItem[] = sortedAreas.map((a: any) => {
          const areaSites = allDbSites ? allDbSites.filter((s: any) => s.area_id === a.id) : []
          const aUnlocked = areaSites.filter((s: any) => unlockedSiteIds.has(s.id)).length
          regionUnlocked += aUnlocked
          regionTotal += areaSites.length

          return {
            id: a.id,
            regionId: a.region_id,
            slug: a.slug,
            nameVi: a.name_vi,
            nameEn: a.name_en,
            centerLat: Number(a.center_lat),
            centerLng: Number(a.center_lng),
            defaultZoom: a.default_zoom || 12,
            isActive: Boolean(a.is_active),
            orderIndex: a.order_index,
            siteCount: areaSites.length,
            unlockedCount: aUnlocked,
          }
        })

        return {
          id: r.id,
          slug: r.slug,
          nameVi: r.name_vi,
          nameEn: r.name_en,
          descriptionVi: r.description_vi,
          descriptionEn: r.description_en,
          orderIndex: r.order_index,
          siteCount: regionTotal,
          unlockedCount: regionUnlocked,
          areas: mappedAreas,
        }
      })
    }

    // 3. Fallback to OFFICIAL_REGIONS if database tables are not yet created on remote
    return OFFICIAL_REGIONS.map((r) => {
      let regionUnlocked = 0
      const mappedAreas = r.areas.map((a) => {
        let aUnlocked = 0
        if (a.slug === 'tp-ho-chi-minh') {
          aUnlocked = HCM_HERITAGE_SITES.filter((s) => unlockedSiteIds.has(s.id)).length
        } else if (a.slug === 'ha-noi') {
          aUnlocked = unlockedSiteIds.has('b1b2c3d4-0001-4000-b000-000000000001') ? 1 : 0
        } else if (a.slug === 'quang-nam') {
          aUnlocked = unlockedSiteIds.has('b1b2c3d4-0002-4000-b000-000000000002') ? 1 : 0
        } else if (a.slug === 'thua-thien-hue') {
          aUnlocked = unlockedSiteIds.has('b1b2c3d4-0003-4000-b000-000000000003') ? 1 : 0
        } else if (a.slug === 'quang-ninh') {
          aUnlocked = unlockedSiteIds.has('b1b2c3d4-0004-4000-b000-000000000004') ? 1 : 0
        }
        regionUnlocked += aUnlocked
        return { ...a, unlockedCount: aUnlocked }
      })
      return {
        ...r,
        unlockedCount: regionUnlocked,
        areas: mappedAreas,
      }
    })
  } catch (err) {
    console.warn('Error computing regions with areas:', err)
    return OFFICIAL_REGIONS
  }
}

/**
 * Fetches heritage sites with coordinates, dynamic area relation, and fallback safety.
 */
export async function fetchMapSites(userId?: string, areaSlug?: string): Promise<MapDataResult> {
  // 1. Fetch user's unlocked passport entries
  const unlockedMap = new Map<string, string>()
  if (userId) {
    const { data: entries } = await supabase
      .from('passport_entries')
      .select('site_id, unlocked_at')
      .eq('user_id', userId)

    if (entries) {
      for (const entry of entries) {
        unlockedMap.set(entry.site_id, entry.unlocked_at)
      }
    }
  }

  // 2. Fetch published sites from database
  let sitesData: any[] | null = null

  // Try fetching with areas relation first
  const { data: dynamicData, error: dynError } = await supabase
    .from('heritage_sites')
    .select(`
      id,
      area_id,
      slug,
      name_vi,
      name_en,
      description_vi,
      description_en,
      latitude,
      longitude,
      cover_image_url,
      is_published,
      areas (
        id,
        slug,
        name_vi,
        name_en,
        regions (
          slug
        )
      ),
      pin_designs (
        id,
        collections (
          id,
          name_vi,
          name_en
        )
      )
    `)
    .eq('is_published', true)
    .order('name_vi', { ascending: true })

  if (!dynError && dynamicData) {
    sitesData = dynamicData
  } else {
    // Safe fallback if areas table / area_id column not yet present on remote DB
    const { data: fallbackData } = await supabase
      .from('heritage_sites')
      .select(`
        id,
        slug,
        name_vi,
        name_en,
        description_vi,
        description_en,
        latitude,
        longitude,
        cover_image_url,
        is_published,
        pin_designs (
          id,
          collections (
            id,
            name_vi,
            name_en
          )
        )
      `)
      .eq('is_published', true)
      .order('name_vi', { ascending: true })

    sitesData = fallbackData
  }

  const sites: MapSiteItem[] = []
  const loadedSlugs = new Set<string>()

  if (sitesData && sitesData.length > 0) {
    for (const site of sitesData) {
      loadedSlugs.add(site.slug)
      let collectionNameVi: string | undefined
      let collectionNameEn: string | undefined

      if (Array.isArray(site.pin_designs) && site.pin_designs.length > 0) {
        const coll = site.pin_designs[0]?.collections
        if (coll) {
          collectionNameVi = coll.name_vi
          collectionNameEn = coll.name_en
        }
      }

      const isUnlocked = unlockedMap.has(site.id)
      const unlockedAt = unlockedMap.get(site.id)

      // Use database relation if available, otherwise fallback to static metadata
      let itemAreaSlug: string
      let itemRegionSlug: string
      let itemAreaNameVi: string
      let itemAreaNameEn: string
      let itemAddress: string | undefined

      if (site.areas) {
        itemAreaSlug = site.areas.slug
        itemRegionSlug = site.areas.regions?.slug || 'nam'
        itemAreaNameVi = site.areas.name_vi
        itemAreaNameEn = site.areas.name_en
      } else {
        const meta = getAreaMetadata(site.slug)
        itemAreaSlug = meta.areaSlug
        itemRegionSlug = meta.regionSlug
        itemAreaNameVi = meta.areaNameVi
        itemAreaNameEn = meta.areaNameEn
        itemAddress = meta.address
      }

      sites.push({
        id: site.id,
        slug: site.slug,
        nameVi: site.name_vi,
        nameEn: site.name_en,
        descriptionVi: site.description_vi,
        descriptionEn: site.description_en,
        latitude: Number(site.latitude),
        longitude: Number(site.longitude),
        coverImageUrl: site.cover_image_url,
        isUnlocked,
        unlockedAt,
        collectionNameVi,
        collectionNameEn,
        areaSlug: itemAreaSlug,
        regionSlug: itemRegionSlug,
        areaNameVi: itemAreaNameVi,
        areaNameEn: itemAreaNameEn,
        address: itemAddress,
      })
    }
  }

  // 3. Always ensure all 7 HCMC sites are present
  for (const hcm of HCM_HERITAGE_SITES) {
    if (!loadedSlugs.has(hcm.slug)) {
      sites.push({
        ...hcm,
        isUnlocked: unlockedMap.has(hcm.id),
        unlockedAt: unlockedMap.get(hcm.id),
      })
    } else {
      // Enrich existing site with address if missing
      const existing = sites.find((s) => s.slug === hcm.slug)
      if (existing && !existing.address) {
        existing.address = hcm.address
      }
    }
  }

  // 4. Filter by areaSlug if requested
  const resultSites = areaSlug ? sites.filter((s) => s.areaSlug === areaSlug) : sites
  const unlockedCount = resultSites.filter((s) => s.isUnlocked).length

  return {
    sites: resultSites,
    unlockedCount,
    totalCount: resultSites.length,
  }
}
