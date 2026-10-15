-- ==============================================================================
-- Kích hoạt tài khoản demo trực tiếp trên Supabase SQL Editor
-- ==============================================================================

-- 1. Xác nhận email cho tài khoản demo:
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now()) 
WHERE email = 'demo@heritage.vn';

-- 2. Kiểm tra trạng thái tài khoản:
SELECT id, email, email_confirmed_at, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'demo@heritage.vn';

