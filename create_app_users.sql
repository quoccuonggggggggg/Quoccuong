-- ============================================================
-- TẠO BẢNG app_users ĐỂ QUẢN LÝ NGƯỜI DÙNG HỆ THỐNG WMS
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tạo bảng app_users
CREATE TABLE IF NOT EXISTS public.app_users (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL DEFAULT '',
  username  TEXT NOT NULL DEFAULT '',
  email     TEXT NOT NULL DEFAULT '',
  phone     TEXT NOT NULL DEFAULT '',
  dept      TEXT NOT NULL DEFAULT '',
  position  TEXT NOT NULL DEFAULT '',
  role      TEXT NOT NULL DEFAULT 'Staff',
  status    TEXT NOT NULL DEFAULT 'active',
  avatar    TEXT NOT NULL DEFAULT '',
  last_login TEXT NOT NULL DEFAULT 'Chưa đăng nhập',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Bật Row Level Security
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- 3. Cho phép mọi người đọc (anon + authenticated)
CREATE POLICY "allow_read_app_users"
  ON public.app_users FOR SELECT
  USING (true);

-- 4. Cho phép mọi người ghi (insert/update/delete) - dùng anon key
CREATE POLICY "allow_insert_app_users"
  ON public.app_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_update_app_users"
  ON public.app_users FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_delete_app_users"
  ON public.app_users FOR DELETE
  USING (true);

-- 5. Seed dữ liệu mẫu ban đầu
INSERT INTO public.app_users (id, name, username, email, phone, dept, position, role, status, avatar, last_login)
VALUES
  ('U001', 'Nguyễn Văn Admin', 'admin', 'admin@wms.com', '0901234567', 'Ban Giám Đốc', 'Quản trị hệ thống', 'Admin', 'active', 'NV', 'Chưa đăng nhập'),
  ('U002', 'Trần Thị Manager', 'manager01', 'manager@wms.com', '0912345678', 'Kho vận', 'Quản lý kho', 'Manager', 'active', 'TT', 'Chưa đăng nhập'),
  ('U003', 'Lê Văn Nhân viên', 'staff01', 'staff@wms.com', '0923456789', 'Kho vận', 'Nhân viên kho', 'Staff', 'active', 'LV', 'Chưa đăng nhập')
ON CONFLICT (id) DO NOTHING;

-- Xác nhận thành công
SELECT 'Tạo bảng app_users thành công! Số bản ghi: ' || COUNT(*)::TEXT FROM public.app_users;
