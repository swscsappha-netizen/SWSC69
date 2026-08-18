-- =========================================================================
-- SAPPHA PREORDER - SUPABASE POSTGRESQL DATABASE SCHEMA
-- โรงเรียนสรรพวิทยาคม (Sapphawitthayakhom School)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (นักเรียน ครู แม่ค้า แอดมิน)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  line_user_id TEXT UNIQUE,
  name TEXT NOT NULL,
  nickname TEXT,
  student_id TEXT,
  grade_room TEXT,
  phone TEXT,
  promptpay_number TEXT,
  promptpay_refund TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'TEACHER', 'MERCHANT', 'ADMIN')),
  shop_id TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. STALLS TABLE (ล็อกโรงอาหาร)
CREATE TABLE IF NOT EXISTS public.stalls (
  id TEXT PRIMARY KEY DEFAULT ('stall_' || EXTRACT(EPOCH FROM NOW())::TEXT),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SHOPS TABLE (ร้านค้าในโรงอาหาร)
CREATE TABLE IF NOT EXISTS public.shops (
  id TEXT PRIMARY KEY,
  stall_id TEXT REFERENCES public.stalls(id) ON DELETE SET NULL,
  stall_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  promptpay_no TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  total_orders_count INTEGER NOT NULL DEFAULT 0,
  cutoff_time TEXT NOT NULL DEFAULT '20:00',
  is_open BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  registration_fee_paid BOOLEAN NOT NULL DEFAULT true,
  subscription_expires_at TIMESTAMPTZ,
  banner_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS TABLE (เมนูอาหารและตัวเลือก Option Groups)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('p_' || EXTRACT(EPOCH FROM NOW())::TEXT),
  shop_id TEXT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('rice', 'noodle', 'drink', 'dessert', 'snack')),
  daily_quota INTEGER NOT NULL DEFAULT 50,
  quota_remaining INTEGER NOT NULL DEFAULT 50,
  is_available BOOLEAN NOT NULL DEFAULT true,
  option_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ORDERS TABLE (คำสั่งซื้อ & สลิปโอนเงิน)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('order_' || EXTRACT(EPOCH FROM NOW())::TEXT),
  order_code TEXT NOT NULL UNIQUE,
  pickup_code_4_digits TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_nickname TEXT,
  user_grade_room TEXT,
  user_student_id TEXT,
  user_phone TEXT,
  shop_id TEXT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  stall_name TEXT NOT NULL,
  pickup_date TEXT NOT NULL,
  pickup_time_window TEXT NOT NULL DEFAULT '06:45 - 07:45 น.',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED')),
  payment_slip JSONB,
  is_urgent_late BOOLEAN NOT NULL DEFAULT false,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  review_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. REVIEWS TABLE (คะแนนและรีวิวความพึงพอใจ 1-5 ดาว)
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT ('rev_' || EXTRACT(EPOCH FROM NOW())::TEXT),
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  shop_id TEXT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_nickname TEXT NOT NULL,
  user_grade_room TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SCHOOL HOLIDAYS TABLE (ปฏิทินวันหยุดโรงเรียน)
CREATE TABLE IF NOT EXISTS public.school_holidays (
  id TEXT PRIMARY KEY DEFAULT ('h_' || EXTRACT(EPOCH FROM NOW())::TEXT),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ANNOUNCEMENTS TABLE (แบนเนอร์ประชาสัมพันธ์)
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY DEFAULT ('ann_' || EXTRACT(EPOCH FROM NOW())::TEXT),
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  image_url TEXT NOT NULL,
  badge_text TEXT NOT NULL DEFAULT 'ข่าวประชาสัมพันธ์',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. MERCHANT FEE RECORDS TABLE (ประวัติค่าธรรมเนียม)
CREATE TABLE IF NOT EXISTS public.merchant_fee_records (
  id TEXT PRIMARY KEY DEFAULT ('fee_' || EXTRACT(EPOCH FROM NOW())::TEXT),
  shop_id TEXT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('REGISTRATION', 'MONTHLY')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 20.00,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  note TEXT
);

-- 10. SYSTEM SETTINGS TABLE (การตั้งค่ากลางของโรงเรียน)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  school_name TEXT NOT NULL DEFAULT 'โรงเรียนสรรพวิทยาคม (SorWor)',
  order_open_time TEXT NOT NULL DEFAULT '06:00',
  order_cutoff_time TEXT NOT NULL DEFAULT '20:00',
  pickup_time_window TEXT NOT NULL DEFAULT '06:45 - 07:45 น.',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  emergency_broadcast TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow Full Access for Application Client
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to shops" ON public.shops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to stalls" ON public.stalls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to school_holidays" ON public.school_holidays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to merchant_fee_records" ON public.merchant_fee_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);
