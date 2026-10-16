# QUY CHUẨN SẢN XUẤT & KHẮC LASER MÃ QR LÊN PIN KIM LOẠI
# DIGITAL HERITAGE PASSPORT — QR PRODUCTION & ENGRAVING GUIDE

**Mã tài liệu:** DHP-QR-PROD-01  
**Đối tượng áp dụng:** Xưởng sản xuất kim hoàn/pin lưu niệm, Đội ngũ thiết kế bao bì và Quản trị viên hệ thống.

---

## MỤC LỤC
1. [QUY CHUẨN KÍCH THƯỚC & VÙNG AN TOÀN VẬT LÝ](#1-quy-chuẩn-kích-thước--vùng-an-toàn-vật-lý)
2. [CẤU HÌNH MÃ SỬA LỖI (ERROR CORRECTION LEVEL)](#2-cấu-hình-mã-sửa-lỗi-error-correction-level)
3. [ĐỘ TƯƠNG PHẢN & KỸ THUẬT GIA CÔNG BỀ MẶT](#3-độ-tương-phản--kỹ-thuật-gia-công-bề-mặt)
4. [QUY TRÌNH TẠO MÃ QR VECTOR (SVG / EPS / DXF)](#4-quy-trình-tạo-mã-qr-vector-svg--eps--dxf)
5. [DANH SÁCH 6 MÃ TEST SẴN TRONG CƠ SỞ DỮ LIỆU](#5-danh-sách-6-mã-test-sẵn-trong-cơ-sở-dữ-liệu)

---

# 1. QUY CHUẨN KÍCH THƯỚC & VÙNG AN TOÀN VẬT LÝ

Khi chế tác Pin cài áo kim loại (đường kính thông thường từ 30mm đến 45mm), mặt sau của pin cần dành ra một diện tích phẳng để khắc mã QR laser:

```
┌──────────────────────────────────────────────┐
│  MẶT SAU PIN KIM LOẠI (VÍ DỤ ĐK 35mm)        │
│                                              │
│                  [Đinh cài]                  │
│                                              │
│             ┌──────────────────┐             │
│             │  Quiet Zone 1mm  │             │
│             │  ┌────────────┐  │             │
│             │  │   MÃ QR    │  │             │
│             │  │ 12 x 12 mm │  │             │
│             │  └────────────┘  │             │
│             │  DHP-HUE-2026-01 │             │
│             └──────────────────┘             │
│                                              │
│               "Made in Vietnam"              │
└──────────────────────────────────────────────┘
```

| Tiêu chuẩn | Thông số kỹ thuật | Ghi chú quan trọng |
| :--- | :--- | :--- |
| **Kích thước mã QR tối thiểu** | **`10 x 10 mm`** | Không nên làm nhỏ hơn 10mm vì camera điện thoại đời cũ sẽ khó lấy nét cự ly gần (macro). |
| **Kích thước khuyến nghị** | **`12 x 12 mm` đến `15 x 15 mm`** | Tỷ lệ vàng giúp camera nhận diện tức thì trong vòng 0.2 giây. |
| **Vùng an toàn (Quiet Zone)** | **Tối thiểu `1.0 mm` (4 modules)** | Bắt buộc phải có viền trống màu nền bao quanh 4 cạnh của mã QR, không để họa tiết viền pin dính vào mã. |
| **Chuỗi text phụ trợ** | Chiều cao chữ tối thiểu `1.2 mm` | Khắc dòng mã text (VD: `HUE-2026-VIP01`) ngay bên dưới mã QR để khách có thể nhập tay nếu camera hỏng. |

---

# 2. CẤU HÌNH MÃ SỬA LỖI (ERROR CORRECTION LEVEL)

Mã QR hỗ trợ 4 cấp độ sửa lỗi theo chuẩn quốc tế ISO/IEC 18004. Đối với pin kim loại lưu niệm:

* **Mức độ khuyến nghị sử dụng:** **`Mức M (Medium — Khôi phục 15% dữ liệu)`** hoặc **`Mức Q (Quartile — Khôi phục 25% dữ liệu)`**.
* **Lý do lựa chọn:**
  - Pin cài áo bằng đồng/hợp kim trong quá trình sử dụng có thể bị cọ xát, dính vân tay hoặc xước dăm nhẹ. Cấp độ **M** hoặc **Q** đảm bảo điện thoại vẫn giải mã chính xác 100% dù bề mặt bị xước 15–25%.
  - **CẢNH BÁO:** Không nên dùng mức cao nhất **H (High - 30%)** vì sẽ làm mật độ ô vuông (density) trở nên quá dày đặc, tia laser khắc trên diện tích 10-12mm dễ bị lem mực hoặc dính nét.

---

# 3. ĐỘ TƯƠNG PHẢN & KỸ THUẬT GIA CÔNG BỀ MẶT

Camera điện thoại nhận diện mã QR bằng độ chênh lệch độ sáng (Luminance Contrast) giữa ô đen và nền trắng:

1. **Khắc Laser Fiber (Khuyến nghị số 1):**
   - Bề mặt pin mạ vàng cát mờ (Matte Gold) hoặc mạ bạc xước (Brushed Silver).
   - Tia laser đốt bề mặt tạo nét đen sẫm (Dark Black Oxidation). Tỷ lệ tương phản đạt chuẩn > 4:1.
2. **Kỹ thuật Ăn mòn Axit & Đổ men đen:**
   - Ăn mòn chìm sâu `0.08mm - 0.12mm`, sau đó phủ men đen sấy nhiệt. Phương pháp này cho độ bền vĩnh cửu theo thời gian.
3. **Lưu ý chống lóa sáng (Specular Reflection):**
   - Tránh mạ bóng gương (Mirror Polish) ngay tại khu vực khắc QR vì ánh đèn flash hoặc ánh sáng mặt trời sẽ phản quang gây mù ống kính camera. Khu vực khắc QR nên được xử lý phun cát mịn (Sandblasting).

---

# 4. QUY TRÌNH TẠO MÃ QR VECTOR (SVG / EPS / DXF)

Để xưởng khắc laser có bản vẽ sắc nét vô cực, luôn xuất mã QR dưới định dạng vector:

### Bước 1: Chuẩn bị đường link URL hoàn chỉnh
```text
https://heritage.vn/qr/DHP-HUE-2026-TEST03
```

### Bước 2: Tạo tệp vector
Sử dụng công cụ tạo mã QR chuyên nghiệp hoặc câu lệnh Python / Node CLI:
- Tùy chọn: `Version: Auto`, `Error Correction: M (15%)`, `Format: SVG`.

### Bước 3: Kiểm tra trước khi khắc hàng loạt
1. In mẫu thử trên giấy decal tỷ lệ 1:1 (kích thước 12x12mm).
2. Dùng 3 điện thoại khác nhau (iPhone, Samsung, Xiaomi) mở ứng dụng quét thử ở khoảng cách 10–15cm.
3. Đảm bảo tốc độ quét phản hồi ngay dưới 0.5 giây trước khi chạy laser hàng loạt.

---

# 5. DANH SÁCH 6 MÃ TEST SẴN TRONG CƠ SỞ DỮ LIỆU

Trong cơ sở dữ liệu hiện tại của hệ thống, 6 mã token sau đã được nạp sẵn để kiểm thử:

| Số TT | Mã Token thực tế | Thuộc Di Tích | Tỉnh / Thành | Trạng thái trong DB |
| :---: | :--- | :--- | :--- | :---: |
| **01** | `DHP-THANGLONG-2026-TEST01` | Hoàng Thành Thăng Long | Hà Nội | **Hoạt động (`active`)** |
| **02** | `DHP-HOIAN-2026-TEST02` | Phố Cổ Hội An | Quảng Nam | **Hoạt động (`active`)** |
| **03** | `DHP-HUE-2026-TEST03` | Quần thể Di tích Cố đô Huế | Thừa Thiên Huế | **Hoạt động (`active`)** |
| **04** | `DHP-HALONG-2026-TEST04` | Vịnh Hạ Long | Quảng Ninh | **Hoạt động (`active`)** |
| **05** | `DHP-DINHDOCLAP-2026-TEST05`| Dinh Độc Lập | TP. Hồ Chí Minh | **Hoạt động (`active`)** |
| **06** | `DHP-REVOKED-2026-TEST06` | Mã thử nghiệm lỗi thu hồi | Hà Nội | **Đã thu hồi (`revoked`)** |

*Bạn có thể tạo mã QR chứa các chuỗi trên hoặc in link `https://[domain]/qr/[Mã_Token]` để kiểm thử thực tế ngay lập tức.*

