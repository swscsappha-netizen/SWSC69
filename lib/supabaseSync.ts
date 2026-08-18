import { supabase, isSupabaseConfigured } from './supabase';
import {
  initialShops,
  initialProducts,
  initialStalls,
  initialHolidays,
  initialAnnouncements,
  initialUsers,
  initialSystemSettings,
  initialReviews,
} from './mockData';

export async function seedInitialDataToSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    // 1. Seed Stalls
    const { error: stallErr } = await supabase.from('stalls').upsert(
      initialStalls.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        description: s.description,
      }))
    );
    if (stallErr) console.warn('Stall seed warning:', stallErr.message);

    // 2. Seed Shops
    const { error: shopErr } = await supabase.from('shops').upsert(
      initialShops.map((s) => ({
        id: s.id,
        stall_name: s.stallName,
        name: s.name,
        description: s.description,
        owner_name: s.ownerName,
        phone: s.phone,
        promptpay_no: s.promptPayNo,
        rating: s.rating,
        total_orders_count: s.totalOrdersCount,
        cutoff_time: s.cutoffTime,
        is_open: s.isOpen,
        is_approved: s.isApproved,
        registration_fee_paid: s.registrationFeePaid,
        banner_url: s.bannerUrl,
        image_url: s.imageUrl,
      }))
    );
    if (shopErr) console.warn('Shop seed warning:', shopErr.message);

    // 3. Seed Products
    const { error: prodErr } = await supabase.from('products').upsert(
      initialProducts.map((p) => ({
        id: p.id,
        shop_id: p.shopId,
        name: p.name,
        description: p.description,
        base_price: p.basePrice,
        image_url: p.imageUrl,
        category: p.category,
        daily_quota: p.dailyQuota,
        quota_remaining: p.quotaRemaining,
        is_available: p.isAvailable,
        option_groups: p.optionGroups,
      }))
    );
    if (prodErr) console.warn('Product seed warning:', prodErr.message);

    // 4. Seed Holidays
    const { error: holErr } = await supabase.from('school_holidays').upsert(
      initialHolidays.map((h) => ({
        id: h.id,
        date: h.date,
        name: h.name,
        is_locked: h.isLocked,
      }))
    );
    if (holErr) console.warn('Holiday seed warning:', holErr.message);

    // 5. Seed Announcements
    const { error: annErr } = await supabase.from('announcements').upsert(
      initialAnnouncements.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        content: a.content,
        image_url: a.imageUrl,
        badge_text: a.badgeText,
        is_active: a.isActive,
      }))
    );
    if (annErr) console.warn('Announcement seed warning:', annErr.message);

    // 6. Seed Users
    const { error: userErr } = await supabase.from('users').upsert(
      initialUsers.map((u) => ({
        id: u.id,
        name: u.name,
        nickname: u.nickname,
        student_id: u.studentId,
        grade_room: u.gradeRoom,
        phone: u.phone,
        promptpay_number: u.promptPayNumber,
        promptpay_refund: u.promptPayRefund || u.promptPayNumber,
        role: u.role,
        shop_id: u.shopId || null,
        avatar_url: u.avatarUrl || null,
        is_active: u.isActive !== false,
      }))
    );
    if (userErr) console.warn('User seed warning:', userErr.message);

    // 7. Seed Reviews
    const { error: revErr } = await supabase.from('reviews').upsert(
      initialReviews.map((r) => ({
        id: r.id,
        order_id: r.orderId,
        shop_id: r.shopId,
        user_id: r.userId,
        user_name: r.userName,
        user_nickname: r.userNickname,
        user_grade_room: r.userGradeRoom,
        rating: r.rating,
        comment: r.comment,
        is_anonymous: r.isAnonymous,
      }))
    );
    if (revErr) console.warn('Review seed warning:', revErr.message);

    return { success: true, message: 'ข้อมูลเริ่มต้นทั้งหมดถูกนำเข้าสู่ Supabase เรียบร้อยแล้ว!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล' };
  }
}
