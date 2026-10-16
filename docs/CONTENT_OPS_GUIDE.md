# CẨM NANG BÀN GIAO & HƯỚNG DẪN VẬN HÀNH DỮ LIỆU
# QUẢN TRỊ NỘI DUNG DI SẢN & BẢN ĐỒ TRÊN SUPABASE (ZERO-CODE CONTENT OPS)

**Tài liệu:** DHP-OPS-GUIDE-V1  
**Mục đích:** Hướng dẫn đội ngũ quản trị thêm mới Tỉnh/Thành phố, Địa danh Di tích, Mẫu Pin và Mã QR lên hệ thống hoàn toàn qua cơ sở dữ liệu Supabase mà **KHÔNG CẦN CHẠM VÀO CODE FRONTEND**.

---

## MỤC LỤC
1. [NGUYÊN LÝ VẬN HÀNH KHÔNG CHẠM CODE](#1-nguyên-lý-vận-hành-không-chạm-code)
2. [HƯỚNG DẪN THAO TÁC TRỰC QUAN TRÊN SUPABASE DASHBOARD](#2-hướng-dẫn-thao-tác-trực-quan-trên-supabase-dashboard)
3. [HƯỚNG DẪN QUẢN LÝ HÌNH ẢNH TRÊN SUPABASE STORAGE](#3-hướng-dẫn-quản-lý-hình-ảnh-trên-supabase-storage)
4. [BỘ LỆNH SQL MẪU THÊM NHANH TỈNH & DI TÍCH (COPY & RUN)](#4-bộ-lệnh-sql-mẫu-thêm-nhanh-tỉnh--di-tích)
5. [QUY TRÌNH TẠO MÃ QR PIN LƯU NIỆM XUẤT XƯỞNG](#5-quy-trình-tạo-mã-qr-pin-lưu-niệm-xuất-xưởng)
6. [QUY TRÌNH KIỂM THỬ & NGHIỆM THU HIỂN THỊ](#6-quy-trình-kiểm-thử--nghiệm-thu-hiển-thị)
7. [BẢNG TRA CỨU TỌA ĐỘ 10 TỈNH THÀNH DU LỊCH TIÊU BIỂU](#7-bảng-tra-cứu-tọa-độ-10-tỉnh-thành-du-lịch-tiêu-biểu)

---

# 1. NGUYÊN LÝ VẬN HÀNH KHÔNG CHẠM CODE

Hệ thống **Digital Heritage Passport** được thiết kế theo kiến trúc cơ sở dữ liệu hướng dịch vụ (Data-driven Architecture). Mọi thành phần trên giao diện người dùng đều được nạp động từ Supabase:

```
[public.regions] ────────> [public.areas] ────────> [public.heritage_sites]
 (Bắc, Trung, Nam)        (Tỉnh/Thành/Khu vực)        (Địa danh/Di tích cụ thể)
        │                          │                             │
        ▼                          ▼                             ▼
 Tabs chọn Miền              Dropdown Tỉnh                 Marker trên Bản đồ
 trên Bản đồ (/map)         Tự động Zoom tâm               Thẻ trên Trang chủ
```

* **Không cần sửa code:** Khi bạn thêm một bản ghi vào bảng `heritage_sites`, marker của di tích đó sẽ **ngay lập tức xuất hiện trên bản đồ `/map`**, kèm thẻ thông tin trên trang chủ `/` và trang chi tiết `/heritage/[slug]`.
* **Toàn vẹn quan hệ (Integrity):** Mỗi di tích bắt buộc phải thuộc về một Tỉnh/Thành (`area_id`), và mỗi Tỉnh/Thành bắt buộc phải thuộc về một Miền (`region_id`).

---

# 2. HƯỚNG DẪN THAO TÁC TRỰC QUAN TRÊN SUPABASE DASHBOARD

Dành cho người quản trị không chuyên về kỹ thuật, thao tác trực tiếp trên giao diện đồ họa **Supabase Studio (Table Editor)**:

### Bước 1: Đăng nhập vào Supabase Project
1. Truy cập [https://supabase.com/dashboard](https://supabase.com/dashboard) và chọn Project của bạn.
2. Trên thanh menu bên trái, nhấp vào biểu tượng **Table Editor** (Bảng dữ liệu).

---

### Bước 2: Thêm Tỉnh / Thành phố mới (Bảng `areas`)
Nếu di tích bạn sắp thêm thuộc về một tỉnh chưa có trên hệ thống (VD: Ninh Bình, Thừa Thiên Huế, Quảng Nam...):

1. Chọn bảng **`areas`** trong danh sách bảng.
2. Nhấp vào nút **Insert row** (Thêm hàng mới) ở góc trên bên phải.
3. Điền các trường thông tin:
   - **`region_id`**: Chọn hoặc dán `id` của Miền tương ứng (Bắc, Trung, hoặc Nam lấy từ bảng `regions`).
   - **`slug`**: Nhập chuỗi định danh không dấu viết thường, nối bằng dấu gạch ngang (VD: `thua-thien-hue`, `ninh-binh`, `quang-nam`).
   - **`name_vi`**: Tên tiếng Việt (VD: `Thừa Thiên Huế`).
   - **`name_en`**: Tên tiếng Anh (VD: `Thua Thien Hue Province`).
   - **`center_lat`**: Vĩ độ tâm của tỉnh (VD: `16.4637`).
   - **`center_lng`**: Kinh độ tâm của tỉnh (VD: `107.5909`).
   - **`default_zoom`**: Độ phóng to bản đồ khi chọn tỉnh (khuyến nghị: `12` hoặc `13`).
   - **`is_active`**: Đánh dấu tích `true` (Cho phép kích hoạt trên bản đồ).
   - **`order_index`**: Số thứ tự ưu tiên (VD: `1`, `2`, `3`...).
4. Nhấp **Save** để lưu.

---

### Bước 3: Thêm Địa danh / Di tích mới (Bảng `heritage_sites`)

1. Chọn bảng **`heritage_sites`** trong danh sách bảng.
2. Nhấp vào nút **Insert row** (Thêm hàng mới).
3. Điền các trường thông tin quan trọng:
   - **`area_id`**: Chọn `id` của Tỉnh/Thành phố vừa tạo ở Bước 2.
   - **`slug`**: Chuỗi định danh URL duy nhất (VD: `dai-noi-hue`, `chua-thien-mu`, `pho-co-hoi-an`).
   - **`name_vi`**: Tên tiếng Việt của di tích (VD: `Đại Nội Huế`).
   - **`name_en`**: Tên tiếng Anh (VD: `The Imperial Citadel of Hue`).
   - **`latitude`**: Vĩ độ chính xác của địa điểm (VD: `16.4698`). *(Cách lấy: Mở Google Maps, nhấp chuột phải vào địa điểm và chọn copy tọa độ)*.
   - **`longitude`**: Kinh độ chính xác của địa điểm (VD: `107.5786`).
   - **`cover_image_url`**: Đường dẫn ảnh bìa chất lượng cao (Xem Mục 3 để biết cách lấy link Supabase Storage hoặc dùng link CDN ngoài).
   - **`story_vi`**: Nội dung câu chuyện văn hóa, lịch sử và giá trị kiến trúc chi tiết bằng tiếng Việt.
   - **`story_en`**: Nội dung câu chuyện bằng tiếng Anh.
   - **`description_vi` / `description_en`**: Tóm tắt 1-2 câu ngắn gọn hiển thị trên thẻ xem trước.
   - **`is_published`**: Đánh dấu tích `true` để hiển thị lên trang web.
4. Nhấp **Save**. Ngay sau khi lưu, di tích này sẽ tự động xuất hiện trên bản đồ và hệ thống.

---

# 3. HƯỚNG DẪN QUẢN LÝ HÌNH ẢNH TRÊN SUPABASE STORAGE

Để hình ảnh hiển thị sắc nét và tải nhanh, khuyến nghị tải ảnh trực tiếp lên **Supabase Storage**:

1. Vào mục **Storage** (Biểu tượng thùng chứa trên menu trái Supabase).
2. Chọn bucket **`post_images`** hoặc tạo một bucket mới tên là **`heritage_covers`** (đặt ở chế độ **Public**).
3. Nhấp **Upload files** và chọn hình ảnh di tích từ máy tính của bạn (định dạng JPG hoặc WebP, độ phân giải tối ưu `1920x1080px`, dung lượng < 2MB).
4. Sau khi tải xong, nhấp vào dấu 3 chấm `...` bên cạnh tệp ảnh, chọn **Copy URL**.
5. Dán đường link vừa sao chép vào trường `cover_image_url` trong bảng `heritage_sites`.

---

# 4. BỘ LỆNH SQL MẪU THÊM NHANH TỈNH & DI TÍCH

Nếu bạn muốn thêm nhanh hàng loạt địa danh mà không cần click từng dòng trên giao diện, hãy mở mục **SQL Editor** trong Supabase, dán đoạn script bên dưới và nhấn **Run**:

```sql
-- ==============================================================================
-- KỊCH BẢN THÊM NHANH DI TÍCH: CỐ ĐÔ HUẾ & PHỐ CỔ HỘI AN
-- ==============================================================================

DO $$
DECLARE
    v_region_trung_id UUID;
    v_area_hue_id UUID;
    v_area_quangnam_id UUID;
BEGIN
    -- 1. Lấy ID của Miền Trung từ bảng regions
    SELECT id INTO v_region_trung_id FROM public.regions WHERE slug = 'trung' LIMIT 1;

    -- 2. Thêm tỉnh Thừa Thiên Huế vào bảng areas
    INSERT INTO public.areas (region_id, slug, name_vi, name_en, center_lat, center_lng, default_zoom, is_active, order_index)
    VALUES (v_region_trung_id, 'thua-thien-hue', 'Thừa Thiên Huế', 'Thua Thien Hue Province', 16.463713, 107.590866, 13, true, 20)
    ON CONFLICT (slug) DO UPDATE SET is_active = true
    RETURNING id INTO v_area_hue_id;

    -- 3. Thêm tỉnh Quảng Nam vào bảng areas
    INSERT INTO public.areas (region_id, slug, name_vi, name_en, center_lat, center_lng, default_zoom, is_active, order_index)
    VALUES (v_region_trung_id, 'quang-nam', 'Quảng Nam', 'Quang Nam Province', 15.880058, 108.338047, 13, true, 21)
    ON CONFLICT (slug) DO UPDATE SET is_active = true
    RETURNING id INTO v_area_quangnam_id;

    -- 4. Thêm di tích Đại Nội Huế vào bảng heritage_sites
    INSERT INTO public.heritage_sites (
        area_id, slug, name_vi, name_en, 
        latitude, longitude, cover_image_url, 
        description_vi, description_en, 
        story_vi, story_en, is_published
    )
    VALUES (
        v_area_hue_id,
        'dai-noi-hue',
        'Đại Nội Huế — Hoàng Thành Triều Nguyễn',
        'The Imperial City of Hue',
        16.469833, 107.578611,
        'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?q=80&w=1200&auto=format&fit=crop',
        'Quần thể di tích Cố đô Huế, trung tâm chính trị triều Nguyễn suốt 143 năm.',
        'The historic imperial citadel serving as the capital of the Nguyen Dynasty for 143 years.',
        'Đại Nội Huế là vòng thành thứ hai bên trong Kinh thành Huế, nơi ở và làm việc của 13 vị vua triều Nguyễn cùng hoàng gia. Công trình là đỉnh cao của nghệ thuật kiến trúc cung đình Việt Nam thế kỷ 19, được UNESCO công nhận là Di sản Văn hóa Thế giới năm 1993.',
        'The Imperial City is an expansive fortress and palace complex constructed in the early 19th century under Emperor Gia Long. It stands as a UNESCO World Heritage site showcasing classical Vietnamese royal architecture.',
        true
    )
    ON CONFLICT (slug) DO UPDATE SET 
        name_vi = EXCLUDED.name_vi,
        cover_image_url = EXCLUDED.cover_image_url;

    -- 5. Thêm di tích Phố Cổ Hội An vào bảng heritage_sites
    INSERT INTO public.heritage_sites (
        area_id, slug, name_vi, name_en, 
        latitude, longitude, cover_image_url, 
        description_vi, description_en, 
        story_vi, story_en, is_published
    )
    VALUES (
        v_area_quangnam_id,
        'pho-co-hoi-an',
        'Đô Thị Cổ Hội An',
        'Hoi An Ancient Town',
        15.877700, 108.326200,
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1200&auto=format&fit=crop',
        'Thương cảng quốc tế thế kỷ 16-17 với những nếp nhà mái ngói rêu phong và đèn lồng lung linh.',
        'An exceptionally well-preserved example of a South-East Asian trading port dating from the 15th to the 19th century.',
        'Hội An từng là thương cảng sầm uất bậc nhất Đông Nam Á, nơi giao thoa của các thương nhân Nhật Bản, Trung Hoa và phương Tây. Đô thị cổ giữ được gần như nguyên vẹn quần thể kiến trúc truyền thống gồm nhà phố, hội quán, chùa miếu và cầu ngói.',
        'Hoi An Ancient Town is an exceptionally well-preserved example of a traditional Asian trading port. Its buildings display a unique blend of indigenous and foreign influences.',
        true
    )
    ON CONFLICT (slug) DO UPDATE SET 
        name_vi = EXCLUDED.name_vi,
        cover_image_url = EXCLUDED.cover_image_url;

    RAISE NOTICE 'Đã nạp thành công Thừa Thiên Huế, Quảng Nam và các di tích mới vào hệ thống!';
END $$;
```

---

# 5. QUY TRÌNH TẠO MÃ QR PIN LƯU NIỆM XUẤT XƯỞNG

Khi sản xuất một lô Pin lưu niệm vật lý mới cho một địa danh (VD: Đại Nội Huế):

```sql
-- 1. Tạo mẫu thiết kế Pin mới cho di tích Đại Nội Huế
INSERT INTO public.pin_designs (site_id, name, image_url)
SELECT id, 'Pin Cung Đình Huế Hoàng Kim', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375'
FROM public.heritage_sites WHERE slug = 'dai-noi-hue'
LIMIT 1;

-- 2. Sinh 3 mã Pin cụ thể để in lên vật phẩm lưu niệm thực tế
-- Chuỗi token mẫu: 'HUE-2026-VIP01', 'HUE-2026-VIP02', 'HUE-2026-VIP03'
INSERT INTO public.pin_items (design_id, qr_token_hash, status)
SELECT 
    pd.id, 
    encode(digest('HUE-2026-VIP01', 'sha256'), 'hex'), -- Băm SHA256 an toàn
    'active'
FROM public.pin_designs pd
JOIN public.heritage_sites hs ON hs.id = pd.site_id
WHERE hs.slug = 'dai-noi-hue'
LIMIT 1;
```

* **Khắc lên Pin:** Bạn in QR code trỏ đến đường dẫn: `https://[ten-mien-cua-ban]/qr/HUE-2026-VIP01`.
* **Nhập tay:** Khách có thể nhập trực tiếp chuỗi mã `HUE-2026-VIP01` trên trang `/unlock`.

---

# 6. QUY TRÌNH KIỂM THỬ & NGHIỆM THU HIỂN THỊ

Sau khi nạp dữ liệu vào Supabase, hãy thực hiện kiểm tra theo checklist 4 bước sau trên trình duyệt:

| Bước kiểm tra | Thao tác thực hiện | Kết quả mong đợi |
| :--- | :--- | :--- |
| **1. Kiểm tra Bản đồ số** | Truy cập `http://localhost:5173/map`, bấm chọn tab **Miền Trung**, chọn tỉnh **Thừa Thiên Huế**. | Bản đồ tự động lướt đến Huế, xuất hiện Marker pin di sản tại vị trí Đại Nội Huế. Nhấp vào Marker hiển thị popup ảnh và tên chính xác. |
| **2. Kiểm tra Trang chủ** | Truy cập `http://localhost:5173/`, cuộn xuống phần **Di Sản Tiêu Biểu**. | Thẻ tranh khắc mộc bản của di tích mới tự động hiển thị trong danh sách. |
| **3. Kiểm tra Trang Chi tiết** | Nhấp vào thẻ di tích hoặc truy cập `http://localhost:5173/heritage/dai-noi-hue`. | Tải đầy đủ ảnh bìa, toàn bộ câu chuyện lịch sử song ngữ và nút mở khóa Hộ chiếu. |
| **4. Kiểm thử Mở khóa QR** | Vào `http://localhost:5173/unlock`, nhập mã pin `HUE-2026-VIP01`. | Hệ thống thông báo chúc mừng mở khóa thành công, đóng dấu đỏ vào trang Hộ chiếu (`/passport`). |

---

# 7. BẢNG TRA CỨU TỌA ĐỘ 10 TỈNH THÀNH DU LỊCH TIÊU BIỂU

Bảng tọa độ chuẩn được đo đạc sẵn, bạn có thể copy trực tiếp vào trường `center_lat` và `center_lng` của bảng `areas`:

| Tỉnh / Thành phố | Thuộc Miền | Vĩ độ (`center_lat`) | Kinh độ (`center_lng`) | Zoom khuyến nghị |
| :--- | :--- | :--- | :--- | :--- |
| **Hà Nội** | Miền Bắc | `21.028511` | `105.854167` | 13 |
| **Quảng Ninh** (Hạ Long) | Miền Bắc | `20.950453` | `107.073364` | 12 |
| **Ninh Bình** (Tràng An) | Miền Bắc | `20.250614` | `105.974457` | 13 |
| **Thừa Thiên Huế** | Miền Trung | `16.463713` | `107.590866` | 13 |
| **Đà Nẵng** | Miền Trung | `16.054407` | `108.202167` | 13 |
| **Quảng Nam** (Hội An) | Miền Trung | `15.880058` | `108.338047` | 13 |
| **Khánh Hòa** (Nha Trang)| Miền Trung | `12.238791` | `109.196749` | 13 |
| **Lâm Đồng** (Đà Lạt) | Miền Trung | `11.940419` | `108.458313` | 13 |
| **TP. Hồ Chí Minh** | Miền Nam | `10.776889` | `106.700897` | 13 |
| **Cần Thơ** | Miền Nam | `10.045162` | `105.746857` | 13 |

---
*Tài liệu này được biên soạn cho đội ngũ vận hành nội dung Digital Heritage Passport. Mọi thắc mắc kỹ thuật vui lòng đối chiếu cùng tài liệu `docs/PRD_after.md`.*

