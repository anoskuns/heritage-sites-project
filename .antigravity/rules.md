
# PROJECT RULES FOR AI AGENT
Bạn đang xây dựng dự án "Digital Heritage Passport" theo tài liệu `@docs/PRD.md`.
Trong MỌI task, bạn bắt buộc tuân thủ các quy tắc bất khả xâm phạm sau:
1. Tech stack: React + TypeScript + Vite + Tailwind CSS + React Router + Leaflet + Supabase.
2. Tuyệt đối KHÔNG dùng localStorage để lưu dữ liệu hộ chiếu, bài đăng hay ảnh kỷ niệm. Database là nguồn dữ liệu chính duy nhất.
3. Tuyệt đối KHÔNG đưa Supabase service_role key vào frontend.
4. Tuyệt đối KHÔNG tin tưởng `user_id` gửi từ frontend; mọi thao tác ghi dữ liệu nhạy cảm trên Supabase phải lấy `auth.uid()` từ session thông qua RLS hoặc hàm PostgreSQL RPC.
5. Không viết dồn logic vào `App.tsx`. Phải tách rõ ràng: `components/` (giao diện), `features/` (nghiệp vụ), `services/` (gọi Supabase/Storage), `types/` (kiểu dữ liệu), `i18n/` (đa ngôn ngữ Việt - Anh).
6. Mọi chuỗi văn bản hiển thị trên UI phải lấy từ bộ từ điển song ngữ trong `src/i18n/`, không hardcode tiếng Việt hoặc tiếng Anh trực tiếp trong JSX.
7. Sau khi hoàn thành mỗi task, hãy tự chạy `npx tsc --noEmit` trên terminal để kiểm tra và sửa hết lỗi TypeScript trước khi báo cáo hoàn thành.

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
- Không bao giờ dùng localStorage lưu trạng thái hộ chiếu.
- Mọi thao tác nhạy cảm (qr_token_hash, mở khóa hộ chiếu, giới hạn 3 ảnh) phải qua PostgreSQL RPC / Trigger + RLS, không xử lý chay ở Frontend.
- Luôn tách biệt UI, hook/business logic và services/supabase.