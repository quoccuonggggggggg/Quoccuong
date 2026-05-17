-- Create goods table
CREATE TABLE IF NOT EXISTS public.goods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ma_hang TEXT UNIQUE NOT NULL,
    ten_hang TEXT NOT NULL,
    nhom_hang TEXT,
    don_vi_tinh TEXT,
    quy_cach TEXT,
    vi_tri TEXT,
    ngung_kinh_doanh BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id)
);

-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ma_doi_tac TEXT UNIQUE NOT NULL,
    ten_doi_tac TEXT NOT NULL,
    phan_loai TEXT CHECK (phan_loai IN ('Nhà cung cấp', 'Khách hàng')),
    so_dien_thoai TEXT,
    dia_chi TEXT,
    ma_so_thue TEXT,
    ngung_giao_dich BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ma_phieu TEXT NOT NULL,
    loai_giao_dich TEXT CHECK (loai_giao_dich IN ('Nhập', 'Xuất')) NOT NULL,
    ngay_giao_dich DATE NOT NULL,
    so_luong NUMERIC NOT NULL CHECK (so_luong > 0),
    don_gia NUMERIC NOT NULL DEFAULT 0,
    good_id UUID REFERENCES public.goods(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Enable read access for authenticated users on goods" ON public.goods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users on goods" ON public.goods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users on goods" ON public.goods FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users on goods" ON public.goods FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users on partners" ON public.partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users on partners" ON public.partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users on partners" ON public.partners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users on partners" ON public.partners FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users on transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users on transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users on transactions" ON public.transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users on transactions" ON public.transactions FOR DELETE TO authenticated USING (true);
