# ĐẶC TẢ ĐỊNH DẠNG NỘI DUNG MÃ QR & THUẬT TOÁN TRÍCH XUẤT TOKEN
# DIGITAL HERITAGE PASSPORT — QR SPECIFICATION V1.0

**Mã tài liệu:** DHP-QR-SPEC-01  
**Mục đích:** Quy định chi tiết các định dạng nội dung được mã hóa bên trong mã QR của Pin lưu niệm di sản, cơ chế trích xuất token an toàn và các bước xác thực mở khóa trên hệ thống.

---

## MỤC LỤC
1. [TỔNG QUAN NGUYÊN LÝ](#1-tổng-quan-nguyên-lý)
2. [5 ĐỊNH DẠNG MÃ QR ĐƯỢC HỆ THỐNG HỖ TRỢ](#2-5-định-dạng-mã-qr-được-hệ-thống-hỗ-trợ)
3. [THUẬT TOÁN TRÍCH XUẤT TOKEN (PARSER ALGORITHM)](#3-thuật-toán-trích-xuất-token-parser-algorithm)
4. [QUY TẮC ĐẶT TÊN TOKEN CHUẨN (TOKEN NAMING CONVENTION)](#4-quy-tắc-đặt-tên-token-chuẩn-token-naming-convention)
5. [LUỒNG XÁC THỰC & MÃ LỖI HỆ THỐNG](#5-luồng-xác-thực--mã-lỗi-hệ-thống)

---

# 1. TỔNG QUAN NGUYÊN LÝ

Hệ thống Digital Heritage Passport cho phép người dùng mở khóa di sản bằng hai cách:
1. **Quét bằng Camera mặc định của điện thoại (iOS / Android Camera):**
   - Khi quét bằng ứng dụng máy ảnh gốc của điện thoại, mã QR phải là một **đường dẫn URL Web đầy đủ** (`https://...`). Trình duyệt điện thoại sẽ tự động mở trang web và kích hoạt luồng mở khóa.
2. **Quét bằng Trình quét tích hợp trong Webapp (`/unlock`):**
   - Sử dụng thư viện `html5-qrcode` hỗ trợ quét camera trực tiếp hoặc tải ảnh chụp từ thư viện máy.
   - Trình quét tích hợp bộ giải mã **Universal Extractor** có khả năng tự động bóc tách token bí mật từ bất kỳ định dạng nào (URL, Query Parameter, Deep-link, JSON hoặc chuỗi ký tự thô).

```
[Mã QR được quét] ───> [Universal Extractor] ───> [Raw Token (e.g. HUE-2026-VIP01)]
                                                             │
                                                             ▼
                                                    [RPC: preview_qr_token]
                                                             │
                                                             ▼
                                                    [RPC: unlock_heritage_site]
                                                             │
                                                             ▼
                                                    [Đóng dấu vào Hộ Chiếu]
```

---

# 2. 5 ĐỊNH DẠNG MÃ QR ĐƯỢC HỆ THỐNG HỖ TRỢ

Hệ thống nhận diện và trích xuất thành công 5 cấu trúc dữ liệu sau:

### Định dạng 1: URL Chuyển Hướng Trực Tiếp (Khuyến nghị cho in ấn thực tế)
Đây là định dạng chuẩn nhất để in lên mặt sau pin lưu niệm vì tương thích 100% với camera mặc định của mọi smartphone:
```text
https://heritage.vn/qr/DHP-HUE-2026-TEST03
hoặc
https://heritage-passport.vercel.app/qr/DHP-DINHDOCLAP-2026-TEST05
```
* **Cơ chế:** Khi camera mở link này, route `/qr/:token` sẽ đón nhận, tự động kiểm tra đăng nhập và kích hoạt mở khóa.

---

### Định dạng 2: Web URL với Query Parameter (`?token=`)
Định dạng web tiêu chuẩn có gắn tham số:
```text
https://heritage.vn/unlock?token=DHP-THANGLONG-2026-TEST01
```
* **Cơ chế:** Trình quét tự động trích xuất giá trị nằm sau `token=` và điền vào ô xác thực.

---

### Định dạng 3: Deep Link Ứng Dụng Di Động
Dành cho ứng dụng di động native hoặc PWA cài đặt trên màn hình:
```text
heritage://qr/DHP-HOIAN-2026-TEST02
hoặc
heritage://unlock/DHP-HALONG-2026-TEST04
```

---

### Định dạng 4: Chuỗi Ký Tự Thô (Raw Alphanumeric Token)
Mã in dưới đáy pin hoặc thẻ bảo hành để người dùng gõ tay:
```text
DHP-THANGLONG-2026-TEST01
HUE-2026-VIP01
SG-DINH-DOC-LAP-88
```

---

### Định dạng 5: Chuỗi Cấu Trúc JSON (Dành cho Smart Pin / NFC / Thiết bị IOT)
```json
{
  "app": "dhp",
  "version": "1.0",
  "site": "dai-noi-hue",
  "token": "DHP-HUE-2026-TEST03"
}
```
* **Cơ chế:** Trình bóc tách JSON tìm kiếm các khóa `token`, `rawToken`, hoặc `qr_token`.

---

# 3. THUẬT TOÁN TRÍCH XUẤT TOKEN (PARSER ALGORITHM)

Thuật toán `extractTokenFromQrString` được triển khai tại [`src/features/qr-unlock/qrService.ts`](file:///c:/Users/Lenovo/Documents/3.Project/00.Heritage%20%C4%90MST/src/features/qr-unlock/qrService.ts):

```typescript
export function extractTokenFromQrString(rawValue: string): string {
  if (!rawValue) return ''
  const trimmed = rawValue.trim()

  // Bước 1: Xử lý định dạng JSON payload
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed.token) return String(parsed.token).trim()
      if (parsed.rawToken) return String(parsed.rawToken).trim()
      if (parsed.qr_token) return String(parsed.qr_token).trim()
    } catch {
      // Bỏ qua lỗi cú pháp JSON và chuyển bước tiếp theo
    }
  }

  // Bước 2: Bóc tách tham số Query (?token=XYZ hoặc &token=XYZ)
  if (trimmed.includes('token=')) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://dummy.com/${trimmed}`)
      const token = url.searchParams.get('token')
      if (token) return token.trim()
    } catch {
      const match = trimmed.match(/[?&]token=([^&#\s]+)/)
      if (match && match[1]) return decodeURIComponent(match[1]).trim()
    }
  }

  // Bước 3: Bóc tách đường dẫn URL (/qr/XYZ hoặc /unlock/XYZ)
  if (trimmed.includes('/qr/')) {
    const parts = trimmed.split('/qr/')
    if (parts.length > 1) {
      const sub = parts[1].split(/[?#&]/)[0]
      if (sub) return decodeURIComponent(sub).trim()
    }
  }
  if (trimmed.includes('/unlock/')) {
    const parts = trimmed.split('/unlock/')
    if (parts.length > 1) {
      const sub = parts[1].split(/[?#&]/)[0]
      if (sub) return decodeURIComponent(sub).trim()
    }
  }

  // Bước 4: Bóc tách Deep Link (heritage://qr/XYZ)
  const deepMatch = trimmed.match(/heritage:\/\/(?:qr|unlock)\/([^?&#\s]+)/i)
  if (deepMatch && deepMatch[1]) {
    return decodeURIComponent(deepMatch[1]).trim()
  }

  // Bước 5: Mặc định coi chuỗi nhận được là Raw Token
  return trimmed
}
```

---

# 4. QUY TẮC ĐẶT TÊN TOKEN CHUẨN

Để đảm bảo tính duy nhất và khả năng nhận diện xuất xưởng, chuỗi token in lên Pin khuyến nghị tuân theo cấu trúc:

$$\text{[TIỀN TỐ] - [MÃ ĐỊA DANH] - [NĂM] - [MÃ SỐ BẢO MẬT]}$$

* **Ví dụ:**
  - `DHP-HUE-2026-A0001` (Pin di tích Cố đô Huế, đợt sản xuất 2026, mã số A0001)
  - `DHP-HOIAN-2026-B0052` (Pin Phố cổ Hội An, mã B0052)
  - `DHP-THANGLONG-2026-C0120` (Pin Hoàng Thành Thăng Long)

### Quy chuẩn chuỗi ký tự:
- **Ký tự cho phép:** Chữ hoa `A-Z`, số `0-9`, dấu gạch ngang `-`.
- **Độ dài tối ưu:** Từ 12 đến 24 ký tự (giúp mã QR có mật độ điểm ảnh thưa, dễ quét trên bề mặt kim loại nhỏ).

---

# 5. LUỒNG XÁC THỰC & MÃ LỖI HỆ THỐNG

Khi mã token được trích xuất thành công, hệ thống gọi 2 hàm PL/pgSQL trên Supabase:

1. **`preview_qr_token(raw_token)` (Xem trước thông tin - Không cần đăng nhập):**
   - Trả về thông tin di tích (`site`), mẫu pin (`design`), và trạng thái đã mở khóa hay chưa (`is_unlocked`).
2. **`unlock_heritage_site(raw_token)` (Mở khóa chính thức - Bắt buộc đăng nhập):**
   - Tạo bản ghi trong `passport_entries` và trả về `newly_unlocked = true`.

### Bảng Mã Lỗi Trả Về:

| Mã lỗi (`error_code`) | Ý nghĩa nghiệp vụ | Thông điệp hiển thị cho người dùng |
| :--- | :--- | :--- |
| **`INVALID_TOKEN`** | Token không tồn tại trong bảng `pin_items` hoặc bị sai cú pháp. | Mã QR hoặc mã PIN không hợp lệ. Vui lòng kiểm tra lại. |
| **`REVOKED_TOKEN`** | Token đã bị đánh dấu thu hồi (`status = 'revoked'`) do lỗi sản xuất hoặc mất cắp. | Mã lưu niệm này đã bị thu hồi bởi ban quản trị. |
| **`SITE_UNPUBLISHED`**| Di tích liên quan đang ở trạng thái bảo trì hoặc chưa công bố. | Di tích thuộc mã pin này hiện chưa được công bố. |
| **`UNAUTHORIZED`** | Người dùng chưa đăng nhập khi bấm nút Mở Khóa. | Vui lòng đăng nhập để lưu di tích vào Hộ chiếu số. |
| **`NETWORK_ERROR`** | Mất kết nối Internet hoặc lỗi dịch vụ Supabase. | Không thể kết nối đến máy chủ. Vui lòng thử lại sau. |

---
*Tài liệu này được áp dụng cho toàn bộ các thiết bị quét mã QR và quy trình kiểm thử hệ thống Digital Heritage Passport.*

