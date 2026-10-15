# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# DIGITAL HERITAGE PASSPORT — HỘ CHIẾU DI SẢN SỐ VIỆT NAM

**Phiên bản:** 1.0  
**Trạng thái:** Ready for Implementation  
**Loại sản phẩm:** Responsive Web Application / Mobile-first Webapp  
**Đối tượng triển khai:** AI Coding Agent + Product Owner  
**Ngôn ngữ giao diện:** Tiếng Việt và tiếng Anh

---

# 1. TỔNG QUAN SẢN PHẨM

## 1.1. Tên sản phẩm

Digital Heritage Passport — Hộ chiếu di sản số Việt Nam.

Tên thương hiệu chính thức sẽ được quyết định sau. Trong quá trình phát triển, sử dụng tên tạm thời này trong code và tài liệu.

## 1.2. Mô tả sản phẩm

Digital Heritage Passport là nền tảng kết hợp quà lưu niệm vật lý với trải nghiệm khám phá văn hóa trên nền tảng số.

Người dùng sở hữu một chiếc pin lưu niệm có mã QR riêng. Khi quét mã, họ có thể khám phá câu chuyện văn hóa của địa điểm tương ứng, mở khóa địa điểm trong hộ chiếu số cá nhân, xem hành trình trên bản đồ Việt Nam và lưu ảnh kỷ niệm.

Nền tảng hỗ trợ hai ngôn ngữ Việt – Anh và có một cộng đồng nhỏ để người dùng chia sẻ những địa điểm, câu chuyện và trải nghiệm du lịch của mình.

## 1.3. Tầm nhìn sản phẩm

Biến mỗi món quà lưu niệm thành một dấu mốc trong hành trình khám phá văn hóa Việt Nam, kết hợp giá trị vật lý, nội dung di sản và trải nghiệm sưu tầm cá nhân.

## 1.4. Vấn đề cần giải quyết

Quà lưu niệm truyền thống thường có giá trị thẩm mỹ và cảm xúc nhưng thiếu trải nghiệm số gắn liền với sản phẩm.

Mặt khác, các ứng dụng bản đồ và du lịch có thể cung cấp thông tin địa điểm nhưng không nhất thiết tạo ra một bộ sưu tập cá nhân gắn với những món quà mà du khách đã mua.

Sản phẩm hướng đến việc kết nối hai trải nghiệm này:

- Quà lưu niệm có giá trị độc lập về thiết kế.
- QR mở ra nội dung văn hóa có chọn lọc.
- Hộ chiếu số lưu giữ các địa điểm đã mở khóa.
- Cơ chế sưu tầm tạo động lực khám phá thêm địa điểm.
- Cộng đồng cho phép chia sẻ trải nghiệm và cảm nhận.

Các lợi ích trên là giả thuyết sản phẩm cần được kiểm chứng với người dùng thực tế.

## 1.5. Định vị sản phẩm

Một nền tảng hộ chiếu di sản số gắn với quà lưu niệm vật lý, dành cho khách du lịch và những người yêu thích khám phá văn hóa.

Không định vị sản phẩm như một mạng xã hội du lịch tổng quát, một ứng dụng dẫn đường hoặc một hệ thống xác minh khách du lịch đã đến địa điểm.

---

# 2. MỤC TIÊU VÀ CHỈ SỐ THÀNH CÔNG

## 2.1. Mục tiêu MVP

MVP phải chứng minh được một vòng trải nghiệm hoàn chỉnh:

**Quét QR → Xem câu chuyện di sản → Đăng nhập → Mở khóa địa điểm → Lưu vào hộ chiếu → Xem trên bản đồ → Lưu ảnh kỷ niệm.**

Ngoài ra, MVP cần có một phiên bản cộng đồng tối giản để người dùng đăng và tương tác với nội dung của nhau.

## 2.2. Chỉ số đánh giá prototype

- Tỷ lệ quét QR dẫn đến đúng địa điểm.
- Tỷ lệ người dùng hoàn thành quy trình mở khóa.
- Tỷ lệ người dùng quay lại xem hộ chiếu.
- Tỷ lệ người dùng mở khóa địa điểm thứ hai.
- Tỷ lệ người dùng lưu ảnh kỷ niệm.
- Tỷ lệ người dùng tạo bài đăng cộng đồng.
- Số lỗi phát sinh trong các kịch bản kiểm thử.

Không đặt mục tiêu số liệu thị trường tùy ý trước khi có dữ liệu thử nghiệm. Prototype cần hỗ trợ thu thập những chỉ số trên một cách phù hợp và minh bạch.

---

# 3. ĐỐI TƯỢNG NGƯỜI DÙNG

## 3.1. Primary Persona — Khách du lịch

Người đi du lịch trong nước hoặc quốc tế, có nhu cầu mua quà lưu niệm, khám phá văn hóa và lưu giữ kỷ niệm.

Nhu cầu:
- Có một món quà lưu niệm đẹp.
- Tìm hiểu ý nghĩa văn hóa của địa điểm.
- Lưu lại những nơi đã khám phá.
- Dễ dàng xem lại hành trình.

## 3.2. Secondary Persona — Người yêu thích sưu tầm

Người thích sưu tầm pin, huy hiệu, vật phẩm du lịch hoặc các bộ sưu tập theo chủ đề.

Nhu cầu:
- Có bộ sưu tập mang tính hệ thống.
- Biết những mẫu đã sở hữu.
- Khám phá các mẫu còn thiếu.
- Lưu giữ thành quả sưu tầm.

## 3.3. Community User — Người chia sẻ trải nghiệm

Người dùng muốn đăng tải cảm nhận, hình ảnh và câu chuyện về các địa điểm đã khám phá.

Nhu cầu:
- Chia sẻ nội dung với cộng đồng.
- Khám phá địa điểm từ bài đăng của người khác.
- Tương tác thông qua lượt thích.

---

# 4. PHẠM VI SẢN PHẨM

## 4.1. In Scope — Bắt buộc trong MVP

1. Landing page giới thiệu sản phẩm.
2. Đăng ký, đăng nhập và đăng xuất.
3. Hồ sơ người dùng.
4. Chuyển đổi ngôn ngữ Việt – Anh.
5. Danh mục địa điểm di sản mẫu.
6. QR riêng cho từng vật phẩm thử nghiệm.
7. Xác thực mã QR từ backend.
8. Mở khóa địa điểm và lưu vào hộ chiếu.
9. Bản đồ Việt Nam hiển thị trạng thái các địa điểm.
10. Danh sách địa điểm đã mở khóa.
11. Trang chi tiết địa điểm với nội dung song ngữ.
12. Lưu tối đa 3 ảnh kỷ niệm cho mỗi người dùng tại mỗi địa điểm.
13. Tạo bài đăng cộng đồng.
14. Bảng tin cộng đồng theo thứ tự thời gian.
15. Thích và bỏ thích bài đăng.
16. Responsive trên desktop và điện thoại.
17. Kiểm soát quyền truy cập, dữ liệu và các trường hợp lỗi.
18. Triển khai phiên bản web có HTTPS.

## 4.2. Out of Scope — Không triển khai trong MVP

- NFC.
- AR hoặc VR.
- AI chatbot hoặc AI tạo nội dung theo thời gian thực.
- Thanh toán trực tuyến.
- Blockchain hoặc NFT.
- Theo dõi GPS liên tục.
- Xác minh chắc chắn người dùng thực sự có mặt tại địa điểm.
- Bản đồ offline.
- Tin nhắn riêng.
- Theo dõi người dùng.
- Thuật toán đề xuất nội dung phức tạp.
- Hệ thống chống giả mạo vật lý nâng cao.
- Hệ thống quản lý tồn kho, đơn hàng và vận chuyển thương mại điện tử đầy đủ.

Không tự ý bổ sung các chức năng ngoài phạm vi này nếu chưa được Product Owner chấp thuận.

---

# 5. KIẾN TRÚC VÀ CÔNG NGHỆ

## 5.1. Công nghệ bắt buộc

### Frontend
- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- Component UI có khả năng tái sử dụng.
- React Router hoặc giải pháp routing tương đương.

### Backend
- Supabase Auth.
- Supabase PostgreSQL.
- Supabase Storage.
- Supabase client SDK.
- PostgreSQL RLS.
- RPC hoặc server-side function cho nghiệp vụ cần xác thực.

### Bản đồ
- Leaflet.
- Nhà cung cấp tile phù hợp với mục đích sử dụng và chính sách của nhà cung cấp.
- Tọa độ địa lý lấy từ dữ liệu địa điểm đã được kiểm tra.

### QR
- QR chứa URL HTTPS dẫn đến route xử lý mã.
- Có thể dùng thư viện QR mã nguồn mở để sinh mã.
- Hỗ trợ mở URL bằng camera mặc định của điện thoại.
- Nếu triển khai scanner bên trong webapp, dùng thư viện quét QR tương thích với các trình duyệt mục tiêu.

### Version control và triển khai
- Git và GitHub.
- Triển khai frontend trên dịch vụ hỗ trợ HTTPS.
- Database và Storage sử dụng Supabase.

## 5.2. Nguyên tắc kiến trúc

- Sử dụng modular monolith ở tầng frontend; không xây microservices.
- Tách giao diện, nghiệp vụ, truy cập dữ liệu và kiểu dữ liệu.
- Database là nguồn dữ liệu chính.
- Không sử dụng localStorage làm nguồn dữ liệu chính cho hộ chiếu.
- Không để toàn bộ logic trong một file App.tsx.
- Không đặt dữ liệu giả rải rác trong các component.
- Không cho frontend tự quyết định quyền sở hữu dữ liệu.
- Không đưa secret key hoặc Supabase service-role key vào frontend.
- Các thao tác quan trọng phải có xử lý lỗi và trạng thái loading.
- Các thao tác ghi dữ liệu quan trọng phải xử lý việc gửi yêu cầu lặp lại an toàn.

## 5.3. Cấu trúc thư mục đề xuất

src/
- app/
  - router
  - providers
- components/
  - ui
  - layout
  - map
  - qr
  - heritage
  - passport
  - community
- pages/
  - landing
  - auth
  - passport
  - map
  - heritage-detail
  - community
  - create-post
  - profile
- features/
  - authentication
  - heritage
  - qr-unlock
  - passport
  - memories
  - community
- services/
  - supabase
  - storage
- hooks/
- i18n/
- types/
- utils/

supabase/
- migrations/
- seed.sql
- tests/

Cấu trúc thực tế có thể điều chỉnh nếu có lý do kỹ thuật rõ ràng, nhưng phải duy trì sự phân tách trách nhiệm giữa các module.

---

# 6. YÊU CẦU CHỨC NĂNG

## FR-01. Landing Page

Mục tiêu: Giới thiệu giá trị sản phẩm và hướng dẫn người dùng bắt đầu.

Yêu cầu:
- Hero section với thông điệp sản phẩm.
- Hình ảnh minh họa pin lưu niệm.
- Giới thiệu cơ chế quét QR và hộ chiếu số.
- Giới thiệu các địa điểm mẫu.
- CTA đăng ký hoặc khám phá.
- Hỗ trợ Việt – Anh.
- Responsive.

Không cần tích hợp thanh toán hoặc bán hàng trong MVP.

## FR-02. Authentication

Yêu cầu:
- Đăng ký tài khoản bằng email và mật khẩu.
- Đăng nhập.
- Đăng xuất.
- Khôi phục phiên đăng nhập.
- Xử lý lỗi xác thực.
- Bảo vệ các trang yêu cầu đăng nhập.
- Sau đăng nhập, quay lại địa điểm mà người dùng đang mở nếu họ bắt đầu từ QR.

Dữ liệu hộ chiếu phải được tải từ backend sau khi xác thực.

Không được tin tưởng user_id do frontend tự gửi lên nếu thao tác yêu cầu danh tính người dùng hiện tại.

## FR-03. User Profile

Thông tin tối thiểu:
- ID tài khoản.
- Tên hiển thị.
- Ảnh đại diện tùy chọn.
- Ngôn ngữ ưu tiên.
- Thời điểm tạo tài khoản.

Người dùng được cập nhật các trường hồ sơ được cho phép.

Không cho người dùng sửa ID tài khoản hoặc quyền quản trị.

## FR-04. Heritage Sites

Mỗi địa điểm có:
- ID.
- Slug duy nhất.
- Tên tiếng Việt.
- Tên tiếng Anh.
- Câu chuyện tiếng Việt.
- Câu chuyện tiếng Anh.
- Tọa độ latitude/longitude.
- Ảnh đại diện.
- Nội dung mô tả.
- Audio URL tùy chọn.
- Trạng thái xuất bản.
- Ngày tạo và cập nhật.

Yêu cầu:
- Chỉ địa điểm đã xuất bản mới hiển thị công khai.
- Nội dung phải được biên tập trước khi xuất bản.
- Không tự động tạo dữ liệu lịch sử bằng AI rồi coi là nội dung đã xác minh.
- Nội dung phải có nguồn tham khảo được lưu trong tài liệu biên tập hoặc metadata phù hợp.
- Có trạng thái loading, empty và error.

## FR-05. QR và Pin Items

Mỗi vật phẩm pin có:
- ID nội bộ.
- Mẫu pin liên kết.
- Token QR riêng.
- Trạng thái active/revoked.
- Thời điểm tạo.

Mỗi mẫu pin liên kết với một địa điểm và có thể thuộc một bộ sưu tập.

Quy tắc:
- Nhiều vật phẩm có thể cùng trỏ đến một địa điểm.
- Mỗi vật phẩm có token riêng.
- Token phải đủ ngẫu nhiên và không thể suy đoán bằng cách tăng số thứ tự.
- Không dùng ID tuần tự làm token bí mật.
- Có khả năng vô hiệu hóa mã.
- Token không được trả về trong các truy vấn công khai không cần thiết.
- Không cho client tự tạo, đổi trạng thái hoặc gán vật phẩm sang địa điểm khác.

Đối với prototype, khởi tạo 5–10 mã QR thử nghiệm. Chưa cần hệ thống quản lý tồn kho thương mại.

## FR-06. QR Unlock Flow

Luồng chuẩn:

1. Người dùng mở URL chứa token QR.
2. Backend xác minh token.
3. Backend kiểm tra vật phẩm tồn tại và đang hoạt động.
4. Hệ thống lấy địa điểm liên kết.
5. Hiển thị trang xem trước câu chuyện di sản.
6. Nếu chưa đăng nhập, yêu cầu đăng nhập trước khi ghi nhận hộ chiếu.
7. Sau đăng nhập, backend xác định danh tính tài khoản từ phiên xác thực.
8. Tạo passport entry nếu tài khoản chưa có địa điểm này.
9. Trả về kết quả cho frontend.
10. Hiển thị trạng thái mở khóa và liên kết đến hộ chiếu.

Các trường hợp lỗi:
- Token không tồn tại.
- Token đã bị thu hồi.
- Địa điểm chưa được xuất bản.
- Người dùng chưa đăng nhập.
- Lỗi mạng.
- Yêu cầu được gửi lặp lại.
- Địa điểm đã mở khóa trước đó.

Không được hiển thị thông báo thành công trước khi backend xác nhận.

Việc quét QR chỉ chứng minh rằng một yêu cầu mở mã đã được gửi thành công; không khẳng định người dùng đã trực tiếp đến địa điểm.

## FR-07. Digital Passport

Hộ chiếu là danh sách các địa điểm mà tài khoản đã mở khóa.

Thông tin hiển thị:
- Tổng số địa điểm đã mở khóa.
- Các địa điểm đã mở khóa.
- Ảnh đại diện địa điểm.
- Ngày mở khóa đầu tiên.
- Liên kết xem chi tiết.
- Số ảnh kỷ niệm đã lưu.
- Bộ sưu tập liên quan nếu có.

Yêu cầu:
- Dữ liệu lấy từ database.
- Đồng bộ giữa các thiết bị sau đăng nhập.
- Có trạng thái chưa có địa điểm nào.
- Có loading và error states.
- Không tạo bản ghi trùng khi tải lại hoặc quét lại QR.

Quy tắc nghiệp vụ:
- Một tài khoản chỉ có một passport entry cho mỗi địa điểm.
- Dùng UNIQUE(user_id, site_id) ở database.
- Quét lại cùng mã không tạo entry mới.
- Người dùng vẫn được xem lại nội dung và quản lý ảnh của địa điểm đã mở khóa.

## FR-08. Heritage Map

Hiển thị bản đồ Việt Nam với các địa điểm trong danh mục.

Trạng thái marker:
- Đã mở khóa.
- Chưa mở khóa.
- Đang được chọn.

Yêu cầu:
- Marker hiển thị đúng tọa độ.
- Nhấn marker mở thông tin địa điểm.
- Có thể chuyển sang danh sách địa điểm.
- Có thể lọc hoặc phân biệt địa điểm đã mở khóa và chưa mở khóa.
- Bản đồ và hộ chiếu phải dùng cùng nguồn dữ liệu.
- Có thông báo khi bản đồ không tải được.
- Không bắt buộc GPS hoặc quyền truy cập vị trí người dùng.

Sử dụng màu sắc và nhãn đủ rõ ràng để trạng thái không chỉ phụ thuộc vào màu.

## FR-09. Heritage Detail

Trang chi tiết có:
- Tên địa điểm.
- Ảnh bìa.
- Câu chuyện văn hóa.
- Nội dung song ngữ.
- Audio tùy chọn.
- Trạng thái đã/chưa mở khóa.
- CTA mở khóa nếu luồng nghiệp vụ cho phép.
- Danh sách ảnh kỷ niệm của chính người dùng.
- CTA thêm ảnh nếu đủ điều kiện.

Nội dung di sản công khai phải tách biệt với dữ liệu riêng tư của người dùng.

## FR-10. Memories — Ảnh kỷ niệm

Người dùng được tải tối đa 3 ảnh cho mỗi địa điểm trong hộ chiếu của họ.

Thông tin mỗi ảnh:
- ID.
- User ID.
- Site ID.
- Storage path.
- Caption tùy chọn.
- Thời điểm tạo.

Yêu cầu:
- Tải ảnh lên Supabase Storage.
- Kiểm tra loại file và dung lượng.
- Không chỉ dựa vào thuộc tính accept của input.
- Có loading và trạng thái upload thất bại.
- Cho phép xóa ảnh của chính mình.
- Không cho đọc hoặc xóa ảnh riêng tư của tài khoản khác.
- Kiểm tra giới hạn 3 ảnh ở server-side hoặc cơ chế database transaction an toàn.
- Xử lý trường hợp hai yêu cầu tải ảnh đồng thời.
- Nếu upload thất bại, không để lại bản ghi mồ côi không được quản lý.
- Có quy trình xóa file Storage phù hợp khi người dùng xóa ảnh.

Không mặc định công khai ảnh kỷ niệm.

## FR-11. Community Feed

Bảng tin cộng đồng hiển thị bài đăng theo thời gian mới nhất trước.

Một bài đăng gồm:
- ID.
- User ID.
- Nội dung văn bản.
- Ảnh bìa tùy chọn.
- Địa điểm liên quan tùy chọn.
- Trạng thái hiển thị.
- Thời điểm tạo.

Yêu cầu:
- Xem danh sách bài đăng.
- Xem tên và ảnh đại diện tác giả.
- Xem nội dung và ảnh bài đăng.
- Mở trang địa điểm liên quan.
- Tạo bài đăng.
- Thích và bỏ thích bài đăng.
- Hiển thị trạng thái đã thích.
- Phân trang hoặc tải thêm bài viết.
- Hiển thị empty state khi chưa có bài đăng.
- Xử lý lỗi tải ảnh hoặc gửi bài.

Quy tắc:
- Chỉ người đăng được sửa hoặc xóa bài của họ, trừ quyền quản trị được định nghĩa riêng.
- Một user chỉ được thích một post một lần.
- Database cần UNIQUE(post_id, user_id).
- Không giả lập lượt thích hoặc người dùng thật.
- Không tự động công khai hộ chiếu của người dùng.

## FR-12. Create Post

Người dùng có thể:
- Nhập nội dung.
- Chọn một địa điểm liên quan nếu muốn.
- Tải lên một ảnh bìa tùy chọn.
- Đăng bài.

Yêu cầu:
- Kiểm tra nội dung bắt buộc.
- Giới hạn độ dài nội dung.
- Kiểm tra dung lượng và loại ảnh.
- Hiển thị preview ảnh.
- Có trạng thái đang gửi.
- Không gửi trùng khi người dùng nhấn nút nhiều lần.
- Có thông báo lỗi rõ ràng.
- Chỉ hiển thị bài sau khi backend xác nhận thành công.

Chưa cần bình luận, nhắn tin riêng, theo dõi tài khoản hoặc thuật toán gợi ý.

## FR-13. Localization

Hỗ trợ:
- Tiếng Việt.
- Tiếng Anh.

Yêu cầu:
- Tách chuỗi giao diện khỏi component.
- Có bộ từ điển ngôn ngữ tập trung.
- Có nút chuyển đổi ngôn ngữ.
- Lưu ngôn ngữ ưu tiên của người dùng nếu đã đăng nhập.
- Có ngôn ngữ mặc định cho người chưa đăng nhập.
- Không dịch nội dung tùy tiện ở runtime.
- Các địa điểm phải có trường nội dung tương ứng cho cả hai ngôn ngữ.
- Không để sót chuỗi giao diện chính ở một ngôn ngữ.

## FR-14. Responsive UI

Giao diện phải hỗ trợ:
- Điện thoại.
- Tablet.
- Desktop.

Ưu tiên thiết kế mobile-first vì người dùng thường quét QR bằng điện thoại.

Yêu cầu:
- Điều hướng dễ sử dụng bằng một tay.
- Nút đủ lớn.
- Nội dung không tràn ngang.
- Bản đồ không che khuất thông tin.
- Form có thể sử dụng trên màn hình nhỏ.
- Có trạng thái loading, error, empty và success cho các luồng quan trọng.

---

# 7. MÔ HÌNH DỮ LIỆU

Thiết kế PostgreSQL schema tối thiểu như sau.

## 7.1. profiles

- id: UUID, liên kết với auth.users.
- display_name: text.
- avatar_url: text, nullable.
- preferred_language: vi/en.
- created_at: timestamp.
- updated_at: timestamp.

## 7.2. heritage_sites

- id: UUID.
- slug: text, unique.
- name_vi: text.
- name_en: text.
- story_vi: text.
- story_en: text.
- description_vi: text, nullable.
- description_en: text, nullable.
- latitude: numeric.
- longitude: numeric.
- cover_image_url: text.
- audio_url: text, nullable.
- source_reference: text, nullable.
- is_published: boolean.
- created_at: timestamp.
- updated_at: timestamp.

## 7.3. collections

- id: UUID.
- name_vi: text.
- name_en: text.
- description_vi: text, nullable.
- description_en: text, nullable.
- cover_image_url: text, nullable.
- is_published: boolean.

## 7.4. pin_designs

- id: UUID.
- site_id: UUID, foreign key.
- collection_id: UUID, nullable, foreign key.
- name: text.
- image_url: text, nullable.
- created_at: timestamp.

## 7.5. pin_items

- id: UUID.
- design_id: UUID, foreign key.
- qr_token_hash: text, unique.
- status: active/revoked.
- created_at: timestamp.

Không lưu token thô nếu kiến trúc có thể chỉ lưu hash và so sánh bằng quy trình xác thực phù hợp. Token phải được sinh bằng nguồn ngẫu nhiên an toàn và không thể suy đoán.

## 7.6. passport_entries

- id: UUID.
- user_id: UUID, foreign key.
- site_id: UUID, foreign key.
- first_pin_item_id: UUID, nullable, foreign key.
- unlocked_at: timestamp.

Constraint:
- UNIQUE(user_id, site_id).

## 7.7. memories

- id: UUID.
- user_id: UUID, foreign key.
- site_id: UUID, foreign key.
- image_path: text.
- caption: text, nullable.
- created_at: timestamp.

Ràng buộc tối đa 3 ảnh cho mỗi user_id và site_id phải được bảo vệ ở tầng server/database. Nếu dùng trigger hoặc RPC, phải xử lý giao dịch đồng thời đúng cách.

## 7.8. posts

- id: UUID.
- user_id: UUID, foreign key.
- site_id: UUID, nullable, foreign key.
- body: text.
- image_path: text, nullable.
- visibility: public/private, default private hoặc trạng thái không công khai cho đến khi người dùng chủ động đăng.
- status: published/hidden/deleted hoặc mô hình tương đương.
- created_at: timestamp.
- updated_at: timestamp.

## 7.9. post_likes

- post_id: UUID, foreign key.
- user_id: UUID, foreign key.
- created_at: timestamp.

Constraint:
- UNIQUE(post_id, user_id).

## 7.10. Quy tắc database

- Sử dụng UUID cho các ID nội bộ.
- Khai báo khóa ngoại đầy đủ.
- Dùng unique constraints để bảo vệ các quy tắc nghiệp vụ.
- Dùng index cho các truy vấn thường xuyên như passport entries theo user_id, posts theo created_at và memories theo user_id/site_id.
- Bật RLS cho các bảng truy cập từ client.
- Không cấp quyền ghi không cần thiết cho role public hoặc authenticated.
- Không cho client tự tạo vật phẩm pin hoặc tùy ý ghi nhận hộ chiếu.
- Các thao tác quan trọng phải có kiểm thử quyền truy cập.
- Migration phải được quản lý bằng Git và có khả năng theo dõi phiên bản.

---