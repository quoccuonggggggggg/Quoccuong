-- ═══════════════════════════════════════════════════════════
-- SQL MIGRATION FOR WAREHOUSE MANAGEMENT SYSTEM (WMS PRO)
-- Copy and paste this simplified script into your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Bảng Kho hàng (Warehouses)
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ma_kho VARCHAR(50) UNIQUE NOT NULL,
    ten_kho VARCHAR(255) NOT NULL,
    dia_chi TEXT,
    suc_chua INTEGER DEFAULT 0,
    so_khu_vuc INTEGER DEFAULT 1,
    nhiet_do VARCHAR(50),
    loai_kho VARCHAR(100),
    quan_ly VARCHAR(100),
    so_dien_thoai VARCHAR(20),
    trang_thai VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Hàng hóa (Goods)
CREATE TABLE IF NOT EXISTS public.goods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ten_hang VARCHAR(255) NOT NULL,
    ma_hang VARCHAR(100) UNIQUE NOT NULL,
    nhom_hang VARCHAR(100),
    gia_nhap NUMERIC DEFAULT 0,
    gia_ban NUMERIC DEFAULT 0,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
    vi_tri_kho VARCHAR(100),
    ngung_kinh_doanh BOOLEAN DEFAULT false,
    hinh_anh VARCHAR(10) DEFAULT '📦',
    mo_ta TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Đối tác / Nhà cung cấp (Partners)
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ten_doi_tac VARCHAR(255) NOT NULL,
    ma_doi_tac VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    so_dien_thoai VARCHAR(50),
    dia_chi TEXT,
    nguoi_lien_he VARCHAR(100),
    danh_gia INTEGER DEFAULT 5,
    cong_no NUMERIC DEFAULT 0,
    ngung_giao_dich BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Đơn hàng (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ma_phieu VARCHAR(50) UNIQUE NOT NULL,
    loai_don VARCHAR(20) NOT NULL, -- 'import' hoặc 'export'
    partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
    nguoi_xu_ly VARCHAR(100),
    trang_thai VARCHAR(20) DEFAULT 'pending',
    ngay_giao_dich DATE NOT NULL DEFAULT CURRENT_DATE,
    ghi_chu TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng Chi tiết đơn hàng (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    good_id UUID REFERENCES public.goods(id) ON DELETE RESTRICT,
    so_luong INTEGER NOT NULL CHECK (so_luong > 0),
    don_gia NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Bật RLS cho các bảng công khai
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 7. Cấp quyền truy cập đầy đủ (Public CRUD)
CREATE POLICY "Cho phép tất cả người dùng xem kho" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả người dùng quản lý kho" ON public.warehouses FOR ALL USING (true);

CREATE POLICY "Cho phép tất cả người dùng xem sản phẩm" ON public.goods FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả người dùng quản lý sản phẩm" ON public.goods FOR ALL USING (true);

CREATE POLICY "Cho phép tất cả người dùng xem đối tác" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả người dùng quản lý đối tác" ON public.partners FOR ALL USING (true);

CREATE POLICY "Cho phép tất cả người dùng xem đơn hàng" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả người dùng quản lý đơn hàng" ON public.orders FOR ALL USING (true);

CREATE POLICY "Cho phép tất cả người dùng xem chi tiết đơn hàng" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả người dùng quản lý chi tiết đơn hàng" ON public.order_items FOR ALL USING (true);


-- ═══════════════════════════════════════════════════════════
-- DỮ LIỆU MẪU BAN ĐẦU
-- ═══════════════════════════════════════════════════════════

-- Warehouses
INSERT INTO public.warehouses (id, ma_kho, ten_kho, dia_chi, suc_chua, so_khu_vuc, nhiet_do, loai_kho, quan_ly, so_dien_thoai, trang_thai) VALUES
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'WH001', 'Kho A - Điện tử', 'Quận 1, TP.HCM', 500, 5, '18-22°C', 'Kho lạnh', 'Nguyễn Văn An', '0901234567', 'active'),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'WH002', 'Kho B - Nội thất', 'Quận 7, TP.HCM', 300, 8, 'Thường', 'Kho thường', 'Trần Thị Bình', '0912345678', 'active'),
('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'WH003', 'Kho C - Văn phòng', 'Bình Dương', 250, 6, 'Thường', 'Kho thường', 'Lê Văn Cường', '0923456789', 'active')
ON CONFLICT (ma_kho) DO NOTHING;

-- Partners (Suppliers)
INSERT INTO public.partners (id, ten_doi_tac, ma_doi_tac, email, so_dien_thoai, dia_chi, nguoi_lien_he, danh_gia, cong_no, ngung_giao_dich) VALUES
('d1111111-1111-1111-1111-111111111111', 'Apple Việt Nam', 'APPLE-VN', 'supplier@apple.vn', '0281234567', 'Quận 1, TP.HCM', 'Nguyễn Minh Tuấn', 5, 0, false),
('d2222222-2222-2222-2222-222222222222', 'Dell Technologies VN', 'DELL-VN', 'partner@dell.vn', '0282345678', 'Quận 3, TP.HCM', 'Trần Thu Hương', 4, 45000000, false),
('d3333333-3333-3333-3333-333333333333', 'Sony Electronics', 'SONY-VN', 'b2b@sony.vn', '0283456789', 'Quận 5, TP.HCM', 'Phạm Văn Đức', 5, 0, false)
ON CONFLICT (ma_doi_tac) DO NOTHING;

-- Goods (Products)
INSERT INTO public.goods (id, ten_hang, ma_hang, nhom_hang, gia_nhap, gia_ban, warehouse_id, vi_tri_kho, ngung_kinh_doanh, hinh_anh, mo_ta) VALUES
('c1111111-1111-1111-1111-111111111111', 'Laptop Dell XPS 13', 'DELL-XPS13', 'Điện tử', 25000000, 29500000, 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'A-01-03', false, '💻', 'Laptop cao cấp Dell XPS 13 đời mới'),
('c2222222-2222-2222-2222-222222222222', 'iPhone 15 Pro Max', 'APPLE-IP15', 'Điện tử', 28000000, 33000000, 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'A-02-01', false, '📱', 'Điện thoại Apple iPhone 15 Pro Max 256GB'),
('c3333333-3333-3333-3333-333333333333', 'Bàn làm việc thông minh', 'DESK-01', 'Nội thất', 3500000, 4800000, 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'B-01-02', false, '🪑', 'Bàn làm việc nâng hạ thông minh tự động'),
('c4444444-4444-4444-4444-444444444444', 'Tai nghe Sony WH-1000XM5', 'SONY-WH5', 'Âm thanh', 7200000, 8900000, 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'A-03-05', false, '🎧', 'Tai nghe chụp tai chống ồn chủ động đỉnh cao Sony'),
('c5555555-5555-5555-5555-555555555555', 'Màn hình LG UltraWide 34"', 'LG-UW34', 'Điện tử', 12000000, 15500000, 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'A-04-01', false, '🖥️', 'Màn hình cong siêu rộng LG 34 inch tỷ lệ 21:9')
ON CONFLICT (ma_hang) DO NOTHING;

-- 8. Bảng Lịch sử đăng nhập (Login History)
CREATE TABLE IF NOT EXISTS public.login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    user_agent TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép xem lịch sử đăng nhập" ON public.login_history FOR SELECT USING (true);
CREATE POLICY "Cho phép thêm lịch sử đăng nhập" ON public.login_history FOR INSERT WITH CHECK (true);

-- 9. Bảng Nhật ký hoạt động (Activity Log)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    icon VARCHAR(10),
    content TEXT NOT NULL,
    actor VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép xem nhật ký hoạt động" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Cho phép thêm nhật ký hoạt động" ON public.activity_log FOR INSERT WITH CHECK (true);
