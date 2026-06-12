-- ═══════════════════════════════════════════════════════════
-- SQL MIGRATION FOR USERS (PROFILES) TABLE
-- Copy and paste this script into your Supabase SQL Editor and run it
-- ═══════════════════════════════════════════════════════════

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    dept TEXT,
    position TEXT,
    role TEXT NOT NULL DEFAULT 'Staff',
    status TEXT NOT NULL DEFAULT 'active',
    last_login TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public CRUD for now)
DROP POLICY IF EXISTS "Cho phép tất cả người dùng xem hồ sơ" ON public.profiles;
DROP POLICY IF EXISTS "Cho phép tất cả người dùng quản lý hồ sơ" ON public.profiles;
CREATE POLICY "Cho phép tất cả người dùng xem hồ sơ" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả người dùng quản lý hồ sơ" ON public.profiles FOR ALL USING (true);

-- Insert initial seed users
INSERT INTO public.profiles (id, username, name, email, phone, role, dept, position, status, last_login, avatar) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin', 'Admin Hệ Thống', 'admin@wms.vn', '0901111111', 'Admin', 'IT', 'System Administrator', 'active', '12/06/2026 08:30', 'AH'),
('a0000000-0000-0000-0000-000000000002', 'nthilan', 'Nguyễn Thị Lan', 'nthilan@wms.vn', '0902222222', 'Manager', 'Kho', 'Trưởng phòng kho', 'active', '12/06/2026 07:45', 'NL'),
('a0000000-0000-0000-0000-000000000003', 'tmkhoa', 'Trần Minh Khoa', 'tmkhoa@wms.vn', '0903333333', 'Staff', 'Kho A', 'Nhân viên kho', 'active', '11/06/2026 17:20', 'TK'),
('a0000000-0000-0000-0000-000000000004', 'ltha', 'Lê Thu Hà', 'ltha@wms.vn', '0904444444', 'Accountant', 'Kế toán', 'Kế toán viên', 'active', '12/06/2026 09:10', 'LH'),
('a0000000-0000-0000-0000-000000000005', 'pvbinh', 'Phạm Văn Bình', 'pvbinh@wms.vn', '0905555555', 'WarehouseStaff', 'Kho B', 'Thủ kho', 'inactive', '07/06/2026 15:30', 'PB'),
('a0000000-0000-0000-0000-000000000006', 'hatuan', 'Hoàng Anh Tuấn', 'hatuan@wms.vn', '0906666666', 'Staff', 'Kho C', 'Nhân viên xuất kho', 'active', '12/06/2026 06:55', 'HT')
ON CONFLICT (email) DO NOTHING;
