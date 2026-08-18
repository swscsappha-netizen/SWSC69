'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Shop,
  Product,
  CartItem,
  Order,
  OrderStatus,
  StallLocation,
  SchoolHoliday,
  Announcement,
  MerchantFeeRecord,
  UserRole,
  SystemSettings,
  ShopReview,
} from '@/types';
import {
  initialUserProfile,
  initialSystemSettings,
} from '@/lib/mockData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: UserProfile;
  isAuthReady: boolean;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalItems: number;
  cartTotalPrice: number;

  // Orders
  orders: Order[];
  createOrders: (
    shopOrders: {
      shopId: string;
      shopName: string;
      stallName: string;
      items: CartItem[];
      subtotal: number;
      slipUrl: string;
    }[]
  ) => Order[];
  cancelOrder: (orderId: string, reason?: string) => void;
  approveOrderSlip: (orderId: string) => void;
  rejectOrderSlip: (orderId: string, reason: string, refundSlipUrl?: string) => void;
  markOrderReady: (orderId: string) => void;
  markOrderCompleted: (orderId: string) => void;
  findOrderByPickupCode: (code: string) => Order | undefined;

  // Shops
  shops: Shop[];
  toggleShopOpen: (shopId: string) => void;
  approveShop: (shopId: string) => void;
  addShop: (
    shop: Omit<Shop, 'id' | 'rating' | 'totalOrdersCount'>,
    bindUserId?: string
  ) => Shop;
  updateShop: (shopId: string, updates: Partial<Shop>) => void;
  deleteShop: (shopId: string) => void;

  // Products
  products: Product[];
  updateProductQuota: (productId: string, newQuota: number) => void;
  toggleProductAvailability: (productId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, updates: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (productId: string) => void;

  // Stalls & Locations
  stalls: StallLocation[];
  addStall: (stall: Omit<StallLocation, 'id'>) => void;
  deleteStall: (stallId: string) => void;

  // Holidays & Calendar
  holidays: SchoolHoliday[];
  addHoliday: (holiday: Omit<SchoolHoliday, 'id'>) => void;
  deleteHoliday: (holidayId: string) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Fees
  feeRecords: MerchantFeeRecord[];
  recordFeePayment: (shopId: string, type: 'REGISTRATION' | 'MONTHLY', months?: number) => void;

  // Users Management (Admin)
  users: UserProfile[];
  toggleUserStatus: (userId: string) => void;
  adminUpdateUser: (userId: string, updates: Partial<UserProfile>) => void;

  // System Settings (Admin)
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;

  // Reviews & Ratings
  reviews: ShopReview[];
  addReview: (review: Omit<ShopReview, 'id' | 'createdAt'>) => void;
  deleteReview: (reviewId: string) => void;
  getShopReviews: (shopId: string) => ShopReview[];
  getShopAverageRating: (shopId: string) => { average: number; count: number };

  // Admin Order Override
  adminOverrideOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;

  // Toasts
  toasts: Toast[];
  showToast: (type: Toast['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    // Synchronously restore auth from localStorage on first render
    // This prevents AuthGuard from seeing isLoggedIn=false before the effect runs
    if (typeof window === 'undefined') return initialUserProfile;
    try {
      const savedLoggedIn = localStorage.getItem('sappha_is_logged_in') === 'true';
      const savedAuthRaw = localStorage.getItem('sappha_auth_user');
      if (savedLoggedIn && savedAuthRaw) {
        const parsed = JSON.parse(savedAuthRaw);
        if (
          parsed &&
          parsed.id &&
          !parsed.id.startsWith('user_student_') &&
          !parsed.id.startsWith('user_teacher_')
        ) {
          return { ...initialUserProfile, ...parsed, isLoggedIn: true };
        }
        if (parsed && parsed.lineUserId) {
          return { ...initialUserProfile, ...parsed, isLoggedIn: true };
        }
      }
    } catch (e) {}
    return initialUserProfile;
  });

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stalls, setStalls] = useState<StallLocation[]>([]);
  const [holidays, setHolidays] = useState<SchoolHoliday[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [feeRecords, setFeeRecords] = useState<MerchantFeeRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings);
  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load from Supabase Cloud on mount (100% Real Database)
  useEffect(() => {
    const startSyncTime = Date.now();
    const finishAuthReady = () => {
      const elapsed = Date.now() - startSyncTime;
      const minDisplayDuration = 1500; // 1.5 seconds minimum for smooth, high-end feel
      const waitTime = Math.max(0, minDisplayDuration - elapsed);
      setTimeout(() => {
        setIsAuthReady(true);
      }, waitTime);
    };

    // Check saved session in localStorage
    try {
      const savedAuth = localStorage.getItem('sappha_auth_user');
      const savedLoggedIn = localStorage.getItem('sappha_is_logged_in') === 'true';
      if (savedAuth && savedLoggedIn) {
        const parsed = JSON.parse(savedAuth);
        // Only load if not a legacy mock user
        if (parsed && parsed.id && !parsed.id.startsWith('user_student_') && !parsed.id.startsWith('user_teacher_')) {
          setCurrentUser(parsed);
        } else if (parsed && parsed.lineUserId) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load local storage auth:', e);
    }

    // Global Silent LIFF Handshake & Supabase Sync (Matching SUANKHANOM architecture)
    import('@/lib/liff').then(({ initLiff }) => {
      initLiff().then(async (res) => {
        if (res && res.success && res.profile?.userId) {
          const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
          if (isSupabaseConfigured && supabase) {
            try {
              const { data: dbUser } = await supabase
                .from('users')
                .select('*')
                .or(`line_user_id.eq.${res.profile.userId},id.eq.${res.profile.userId}`)
                .maybeSingle();

              const isAdmin = ['U203ff66b7e535c901dfbfa86d93eef46'].includes(res.profile.userId);

              if (dbUser && dbUser.nickname) {
                const effectiveRole = isAdmin ? 'ADMIN' : (dbUser.role || 'STUDENT');
                const userObj: UserProfile = {
                  id: dbUser.id,
                  name: dbUser.name || res.profile.displayName,
                  nickname: dbUser.nickname,
                  studentId: dbUser.student_id || '',
                  gradeRoom: dbUser.grade_room || '',
                  phone: dbUser.phone || '',
                  promptPayNumber: dbUser.promptpay_number || '',
                  promptPayRefund: dbUser.promptpay_refund || dbUser.promptpay_number || '',
                  role: effectiveRole,
                  shopId: dbUser.shop_id,
                  avatarUrl: res.profile.pictureUrl || dbUser.avatar_url,
                  lineUserId: res.profile.userId,
                  isActive: dbUser.is_active !== false,
                  isLoggedIn: true,
                };
                setCurrentUser(userObj);
                try {
                  localStorage.setItem('sappha_auth_user', JSON.stringify(userObj));
                  localStorage.setItem('sappha_is_logged_in', 'true');
                } catch (e) {}
              } else {
                // New user - auto create in Supabase (SUANKHANOM pattern)
                const effectiveRole = isAdmin ? 'ADMIN' : 'STUDENT';
                const newObj: UserProfile = {
                  id: res.profile.userId,
                  name: res.profile.displayName,
                  nickname: '',
                  studentId: '',
                  gradeRoom: '',
                  phone: '',
                  promptPayNumber: '',
                  promptPayRefund: '',
                  role: effectiveRole,
                  avatarUrl: res.profile.pictureUrl,
                  lineUserId: res.profile.userId,
                  isActive: true,
                  isLoggedIn: true,
                };
                setCurrentUser(newObj);
                try {
                  localStorage.setItem('sappha_auth_user', JSON.stringify(newObj));
                  localStorage.setItem('sappha_is_logged_in', 'true');
                } catch (e) {}

                supabase.from('users').upsert({
                  id: res.profile.userId,
                  line_user_id: res.profile.userId,
                  name: res.profile.displayName,
                  role: effectiveRole,
                  avatar_url: res.profile.pictureUrl,
                  is_active: true,
                }).then();
              }
            } catch (err) {
              console.warn('Silent LIFF sync error:', err);
            }
          }
        }
        finishAuthReady();
      }).catch(() => {
        finishAuthReady();
      });
    }).catch(() => {
      finishAuthReady();
    });

    // Load Live Data from Supabase Cloud
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        // 1. Fetch Shops
        supabase.from('shops').select('*').order('created_at', { ascending: true }).then(({ data }) => {
          if (data) {
            setShops(
              data.map((s: any) => ({
                id: s.id,
                name: s.name,
                ownerName: s.owner_name,
                stallId: s.stall_id || '',
                stallName: s.stall_name,
                description: s.description || '',
                imageUrl: s.image_url,
                bannerUrl: s.banner_url,
                phone: s.phone,
                promptPayNo: s.promptpay_no,
                promptPayName: s.owner_name,
                cutoffTime: s.cutoff_time || '20:00',
                isOpen: s.is_open,
                isApproved: s.is_approved,
                registrationFeePaid: s.registration_fee_paid,
                subscriptionExpiresAt: s.subscription_expires_at,
                rating: Number(s.rating) || 5.0,
                totalOrdersCount: Number(s.total_orders_count) || 0,
              }))
            );
          }
        });

        // 2. Fetch Products
        supabase.from('products').select('*').order('created_at', { ascending: true }).then(({ data }) => {
          if (data) {
            setProducts(
              data.map((p: any) => ({
                id: p.id,
                shopId: p.shop_id,
                name: p.name,
                description: p.description,
                basePrice: Number(p.base_price),
                imageUrl: p.image_url,
                category: p.category,
                dailyQuota: p.daily_quota,
                quotaRemaining: p.quota_remaining,
                isAvailable: p.is_available,
                optionGroups: Array.isArray(p.option_groups) ? p.option_groups : [],
              }))
            );
          }
        });

        // 3. Fetch Stalls
        supabase.from('stalls').select('*').order('code', { ascending: true }).then(({ data }) => {
          if (data) {
            setStalls(
              data.map((st: any) => ({
                id: st.id,
                code: st.code,
                name: st.name,
                description: st.description || '',
              }))
            );
          }
        });

        // 4. Fetch Orders
        supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) {
            setOrders(
              data.map((o: any) => ({
                id: o.id,
                orderCode: o.order_code,
                pickupCode4Digits: o.pickup_code_4_digits,
                userId: o.user_id,
                userName: o.user_name,
                userNickname: o.user_nickname,
                userGradeRoom: o.user_grade_room,
                userStudentId: o.user_student_id,
                userPhone: o.user_phone,
                shopId: o.shop_id,
                shopName: o.shop_name,
                stallName: o.stall_name,
                pickupDate: o.pickup_date,
                pickupTimeWindow: o.pickup_time_window,
                items: Array.isArray(o.items) ? o.items : [],
                subtotal: Number(o.subtotal),
                status: o.status,
                paymentSlip: o.payment_slip,
                isUrgentLate: o.is_urgent_late,
                reviewed: o.reviewed,
                reviewId: o.review_id,
                createdAt: o.created_at,
              }))
            );
          }
        });

        // 5. Fetch Reviews
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) {
            setReviews(
              data.map((r: any) => ({
                id: r.id,
                orderId: r.order_id,
                shopId: r.shop_id,
                userId: r.user_id,
                userName: r.user_name,
                userNickname: r.user_nickname,
                userGradeRoom: r.user_grade_room,
                rating: r.rating,
                comment: r.comment,
                isAnonymous: r.is_anonymous,
                createdAt: r.created_at,
              }))
            );
          }
        });

        // 6. Fetch Announcements
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) {
            setAnnouncements(
              data.map((a: any) => ({
                id: a.id,
                title: a.title,
                subtitle: a.subtitle,
                content: a.content,
                imageUrl: a.image_url,
                badgeText: a.badge_text,
                isActive: a.is_active,
              }))
            );
          }
        });

        // 7. Fetch Holidays
        supabase.from('school_holidays').select('*').order('date', { ascending: true }).then(({ data }) => {
          if (data) {
            setHolidays(
              data.map((h: any) => ({
                id: h.id,
                date: h.date,
                name: h.name,
                isLocked: h.is_locked,
              }))
            );
          }
        });

        // 8. Fetch System Settings
        supabase.from('system_settings').select('*').eq('id', 1).single().then(({ data }) => {
          if (data) {
            setSystemSettings({
              schoolName: data.school_name || 'โรงเรียนสรรพวิทยาคม (SorWor)',
              orderOpenTime: data.order_open_time || '06:00',
              orderCutoffTime: data.order_cutoff_time || '20:00',
              pickupTimeWindow: data.pickup_time_window || '06:45 - 07:45 น.',
              maintenanceMode: Boolean(data.maintenance_mode),
              emergencyBroadcast: data.emergency_broadcast || '',
            });
          }
        });

        // 9. Fetch Fee Records
        supabase.from('merchant_fee_records').select('*').order('paid_at', { ascending: false }).then(({ data }) => {
          if (data) {
            setFeeRecords(
              data.map((f: any) => ({
                id: f.id,
                shopId: f.shop_id,
                shopName: f.shop_name,
                type: f.type,
                amount: Number(f.amount),
                paidAt: f.paid_at,
                validUntil: f.valid_until,
                note: f.note,
              }))
            );
          }
        });

        // 10. Fetch Users (for admin)
        supabase.from('users').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) {
            const fetchedUsers: UserProfile[] = data.map((u: any) => ({
              id: u.id,
              name: u.name,
              nickname: u.nickname || '',
              studentId: u.student_id || '',
              gradeRoom: u.grade_room || '',
              phone: u.phone || '',
              promptPayNumber: u.promptpay_number || '',
              promptPayRefund: u.promptpay_refund || '',
              role: u.role || 'STUDENT',
              shopId: u.shop_id,
              avatarUrl: u.avatar_url,
              isActive: u.is_active,
              lineUserId: u.line_user_id,
              joinedAt: u.created_at,
            }));

            // Check if active user is in the list; if not, sync to Supabase & append
            try {
              const savedAuth = localStorage.getItem('sappha_auth_user');
              if (savedAuth) {
                const parsed = JSON.parse(savedAuth);
                if (parsed && parsed.id && parsed.isLoggedIn) {
                  const alreadyInList = fetchedUsers.some((u) => u.id === parsed.id || (parsed.lineUserId && u.lineUserId === parsed.lineUserId));
                  if (!alreadyInList) {
                    fetchedUsers.unshift(parsed);
                    supabase.from('users').upsert({
                      id: parsed.id,
                      line_user_id: parsed.lineUserId || parsed.id,
                      name: parsed.name || 'ผู้ใช้งาน',
                      nickname: parsed.nickname || '',
                      student_id: parsed.studentId || '',
                      grade_room: parsed.gradeRoom || '',
                      phone: parsed.phone || '',
                      promptpay_number: parsed.promptPayNumber || '',
                      promptpay_refund: parsed.promptPayRefund || parsed.promptPayNumber || '',
                      role: parsed.role || 'STUDENT',
                      shop_id: parsed.shopId || null,
                      avatar_url: parsed.avatarUrl || null,
                      is_active: parsed.isActive !== false,
                    }).then();
                  }
                }
              }
            } catch (e) {}

            setUsers(fetchedUsers);
          }
        });

        // Realtime Subscription on orders, reviews, shops, products, users
        const channel = supabase
          .channel('realtime-db-sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newU: any = payload.new;
                setUsers((prev) => [
                  {
                    id: newU.id,
                    name: newU.name,
                    nickname: newU.nickname || '',
                    studentId: newU.student_id || '',
                    gradeRoom: newU.grade_room || '',
                    phone: newU.phone || '',
                    promptPayNumber: newU.promptpay_number || '',
                    promptPayRefund: newU.promptpay_refund || '',
                    role: newU.role || 'STUDENT',
                    shopId: newU.shop_id,
                    avatarUrl: newU.avatar_url,
                    isActive: newU.is_active,
                    lineUserId: newU.line_user_id,
                    joinedAt: newU.created_at,
                  },
                  ...prev.filter((u) => u.id !== newU.id),
                ]);
              } else if (payload.eventType === 'UPDATE') {
                const updatedU: any = payload.new;
                setUsers((prev) =>
                  prev.map((u) =>
                    u.id === updatedU.id
                      ? {
                          ...u,
                          name: updatedU.name,
                          nickname: updatedU.nickname || u.nickname,
                          role: updatedU.role || u.role,
                          isActive: updatedU.is_active,
                          phone: updatedU.phone || u.phone,
                          avatarUrl: updatedU.avatar_url || u.avatarUrl,
                        }
                      : u
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                const oldU: any = payload.old;
                setUsers((prev) => prev.filter((u) => u.id !== oldU.id));
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newO: any = payload.new;
                setOrders((prev) => [
                  {
                    id: newO.id,
                    orderCode: newO.order_code,
                    pickupCode4Digits: newO.pickup_code_4_digits,
                    userId: newO.user_id,
                    userName: newO.user_name,
                    userNickname: newO.user_nickname,
                    userGradeRoom: newO.user_grade_room,
                    userStudentId: newO.user_student_id,
                    userPhone: newO.user_phone,
                    shopId: newO.shop_id,
                    shopName: newO.shop_name,
                    stallName: newO.stall_name,
                    pickupDate: newO.pickup_date,
                    pickupTimeWindow: newO.pickup_time_window,
                    items: Array.isArray(newO.items) ? newO.items : [],
                    subtotal: Number(newO.subtotal),
                    status: newO.status,
                    paymentSlip: newO.payment_slip,
                    isUrgentLate: newO.is_urgent_late,
                    reviewed: newO.reviewed,
                    createdAt: newO.created_at,
                  },
                  ...prev.filter((o) => o.id !== newO.id),
                ]);
              } else if (payload.eventType === 'UPDATE') {
                const updatedO: any = payload.new;
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === updatedO.id
                      ? {
                          ...o,
                          status: updatedO.status,
                          reviewed: updatedO.reviewed,
                          paymentSlip: updatedO.payment_slip,
                        }
                      : o
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                const oldO: any = payload.old;
                setOrders((prev) => prev.filter((o) => o.id !== oldO.id));
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'shops' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newS: any = payload.new;
                setShops((prev) => [
                  {
                    id: newS.id,
                    name: newS.name,
                    ownerName: newS.owner_name,
                    stallId: newS.stall_id || '',
                    stallName: newS.stall_name,
                    description: newS.description || '',
                    imageUrl: newS.image_url,
                    bannerUrl: newS.banner_url,
                    phone: newS.phone,
                    promptPayNo: newS.promptpay_no,
                    promptPayName: newS.owner_name,
                    cutoffTime: newS.cutoff_time || '20:00',
                    isOpen: newS.is_open,
                    isApproved: newS.is_approved,
                    registrationFeePaid: newS.registration_fee_paid,
                    subscriptionExpiresAt: newS.subscription_expires_at,
                    rating: Number(newS.rating) || 5.0,
                    totalOrdersCount: Number(newS.total_orders_count) || 0,
                  },
                  ...prev.filter((s) => s.id !== newS.id),
                ]);
              } else if (payload.eventType === 'UPDATE') {
                const updatedS: any = payload.new;
                setShops((prev) =>
                  prev.map((s) =>
                    s.id === updatedS.id
                      ? {
                          ...s,
                          name: updatedS.name,
                          ownerName: updatedS.owner_name,
                          stallName: updatedS.stall_name,
                          description: updatedS.description || '',
                          imageUrl: updatedS.image_url,
                          bannerUrl: updatedS.banner_url,
                          phone: updatedS.phone,
                          promptPayNo: updatedS.promptpay_no,
                          cutoffTime: updatedS.cutoff_time || '20:00',
                          isOpen: updatedS.is_open,
                          isApproved: updatedS.is_approved,
                          registrationFeePaid: updatedS.registration_fee_paid,
                          subscriptionExpiresAt: updatedS.subscription_expires_at,
                          rating: Number(updatedS.rating) || 5.0,
                        }
                      : s
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                const oldS: any = payload.old;
                setShops((prev) => prev.filter((s) => s.id !== oldS.id));
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newP: any = payload.new;
                setProducts((prev) => [
                  {
                    id: newP.id,
                    shopId: newP.shop_id,
                    name: newP.name,
                    description: newP.description,
                    basePrice: Number(newP.base_price),
                    imageUrl: newP.image_url,
                    category: newP.category,
                    dailyQuota: newP.daily_quota,
                    quotaRemaining: newP.quota_remaining,
                    isAvailable: newP.is_available,
                    optionGroups: Array.isArray(newP.option_groups) ? newP.option_groups : [],
                  },
                  ...prev.filter((p) => p.id !== newP.id),
                ]);
              } else if (payload.eventType === 'UPDATE') {
                const updatedP: any = payload.new;
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === updatedP.id
                      ? {
                          ...p,
                          name: updatedP.name,
                          description: updatedP.description,
                          basePrice: Number(updatedP.base_price),
                          imageUrl: updatedP.image_url,
                          category: updatedP.category,
                          dailyQuota: updatedP.daily_quota,
                          quotaRemaining: updatedP.quota_remaining,
                          isAvailable: updatedP.is_available,
                          optionGroups: Array.isArray(updatedP.option_groups) ? updatedP.option_groups : [],
                        }
                      : p
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                const oldP: any = payload.old;
                setProducts((prev) => prev.filter((p) => p.id !== oldP.id));
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }).catch(() => {});
  }, []);

  // Save user cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sappha_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const showToast = (type: Toast['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch role for the currently logged in user (persists in localStorage & Supabase)
  const switchRole = (role: UserRole) => {
    setCurrentUser((prev) => {
      const updated: UserProfile = { ...prev, role };
      try {
        localStorage.setItem('sappha_auth_user', JSON.stringify(updated));
      } catch (e) {}

      // Update Supabase
      import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
        if (isSupabaseConfigured && supabase && prev.id) {
          supabase.from('users').update({ role }).eq('id', prev.id).then();
        }
      }).catch(() => {});

      return updated;
    });
    showToast('info', 'สลับบทบาท', `คุณกำลังใช้งานในมุมมอง: ${role}`);
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated: UserProfile = { ...prev, ...profile, isLoggedIn: true };
      try {
        localStorage.setItem('sappha_auth_user', JSON.stringify(updated));
        localStorage.setItem('sappha_is_logged_in', 'true');
      } catch (e) {}

      // 1. Sync & Upsert to Supabase
      import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
        if (isSupabaseConfigured && supabase && updated.id) {
          supabase
            .from('users')
            .upsert({
              id: updated.id,
              line_user_id: updated.lineUserId || updated.id,
              name: updated.name || 'ผู้ใช้งาน',
              nickname: updated.nickname || '',
              student_id: updated.studentId || '',
              grade_room: updated.gradeRoom || '',
              phone: updated.phone || '',
              promptpay_number: updated.promptPayNumber || '',
              promptpay_refund: updated.promptPayRefund || updated.promptPayNumber || '',
              role: updated.role || 'STUDENT',
              shop_id: updated.shopId || null,
              avatar_url: updated.avatarUrl || null,
              is_active: updated.isActive !== false,
            })
            .then();
        }
      }).catch(() => {});

      // 2. Also update users list in state
      setUsers((prevUsers) => {
        const exists = prevUsers.some((u) => u.id === updated.id);
        if (exists) {
          return prevUsers.map((u) => (u.id === updated.id ? { ...u, ...updated } : u));
        } else {
          return [updated, ...prevUsers];
        }
      });

      return updated;
    });
    showToast('success', 'บันทึกข้อมูลสำเร็จ', 'อัปเดตโปรไฟล์เรียบร้อยแล้ว');
  };

  const logout = () => {
    try {
      localStorage.removeItem('sappha_auth_user');
      localStorage.removeItem('sappha_is_logged_in');
    } catch (e) {}
    import('@/lib/liff').then(({ logoutLiff }) => {
      logoutLiff();
    }).catch(() => {});
    setCurrentUser({
      ...initialUserProfile,
      isLoggedIn: false,
    });
    showToast('info', 'ออกจากระบบแล้ว', 'กรุณาเข้าสู่ระบบใหม่เพื่อใช้งาน');
    window.location.href = '/login';
  };

  // Cart operations
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const id = `${item.productId}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setCart((prev) => [...prev, { ...item, id }]);
    showToast('success', 'เพิ่มลงตะกร้าแล้ว', `${item.productName} (${item.quantity} รายการ)`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const triggerPushNotification = (payload: {
    type: 'NEW_ORDER' | 'ORDER_CONFIRMED' | 'ORDER_READY' | 'ORDER_CANCELLED';
    targetLineUserId: string;
    order?: Order;
    reason?: string;
  }) => {
    if (!payload.targetLineUserId) return;
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  // Orders operations
  const createOrders = (
    shopOrders: {
      shopId: string;
      shopName: string;
      stallName: string;
      items: CartItem[];
      subtotal: number;
      slipUrl: string;
    }[]
  ): Order[] => {
    const createdOrders: Order[] = shopOrders.map((so) => {
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      const orderCode = `SW-${randomCode}`;
      return {
        id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderCode,
        pickupCode4Digits: randomCode,
        userId: currentUser.id,
        userName: currentUser.name,
        userNickname: currentUser.nickname,
        userGradeRoom: currentUser.gradeRoom,
        userStudentId: currentUser.studentId,
        userPhone: currentUser.phone,
        shopId: so.shopId,
        shopName: so.shopName,
        stallName: so.stallName,
        pickupDate: 'พรุ่งนี้เช้า',
        pickupTimeWindow: '06:45 - 07:45 น.',
        subtotal: so.subtotal,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
        paymentSlip: {
          slipUrl: so.slipUrl || '',
          amount: so.subtotal,
          uploadedAt: new Date().toISOString(),
          status: 'PENDING',
        },
        items: so.items.map((ci) => ({
          id: `oi_${Math.random().toString(36).substring(2, 7)}`,
          productId: ci.productId,
          productName: ci.productName,
          quantity: ci.quantity,
          unitPrice: ci.unitPrice,
          totalPrice: ci.unitPrice * ci.quantity,
          selectedOptions: ci.selectedOptions,
          specialInstructions: ci.specialInstructions,
        })),
      };
    });

    setOrders((prev) => [...createdOrders, ...prev]);

    // Decrease product quotas & Save to Supabase & Notify Merchants
    createdOrders.forEach((order) => {
      order.items.forEach((item) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.productId
              ? { ...p, quotaRemaining: Math.max(0, p.quotaRemaining - item.quantity) }
              : p
          )
        );
      });

      // Save Order to Supabase Cloud
      import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
        if (isSupabaseConfigured && supabase) {
          supabase
            .from('orders')
            .upsert({
              id: order.id,
              order_code: order.orderCode,
              pickup_code_4_digits: order.pickupCode4Digits,
              user_id: order.userId,
              user_name: order.userName,
              user_nickname: order.userNickname,
              user_grade_room: order.userGradeRoom,
              user_student_id: order.userStudentId,
              user_phone: order.userPhone,
              shop_id: order.shopId,
              shop_name: order.shopName,
              stall_name: order.stallName,
              pickup_date: order.pickupDate,
              pickup_time_window: order.pickupTimeWindow,
              items: order.items,
              subtotal: order.subtotal,
              status: order.status,
              payment_slip: order.paymentSlip,
              is_urgent_late: order.isUrgentLate || false,
              reviewed: order.reviewed || false,
            })
            .then();
        }
      }).catch(() => {});

      // Notify Merchant via LINE Push Message
      const merchantUser = users.find(
        (u) => (u.shopId === order.shopId || u.role === 'MERCHANT') && u.lineUserId
      );
      if (merchantUser?.lineUserId) {
        triggerPushNotification({
          type: 'NEW_ORDER',
          targetLineUserId: merchantUser.lineUserId,
          order,
        });
      }
    });

    clearCart();
    return createdOrders;
  };

  const cancelOrder = (orderId: string, reason = 'ลูกค้ายกเลิกคำสั่งซื้อ') => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'CANCELLED',
              paymentSlip: order.paymentSlip
                ? {
                    ...order.paymentSlip,
                    status: 'REJECTED',
                    rejectionReason: reason,
                  }
                : undefined,
            }
          : order
      )
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', orderId).then();
      }
    }).catch(() => {});

    showToast('info', 'ยกเลิกออเดอร์แล้ว', 'ระบบได้ทำการยกเลิกคำสั่งซื้อเรียบร้อยแล้ว');
  };

  const approveOrderSlip = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'CONFIRMED',
              paymentSlip: order.paymentSlip
                ? { ...order.paymentSlip, status: 'APPROVED' }
                : undefined,
            }
          : order
      )
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('orders').update({ status: 'CONFIRMED' }).eq('id', orderId).then();
      }
    }).catch(() => {});

    // Notify Student via LINE Push Message
    if (targetOrder) {
      const studentUser = users.find(
        (u) => u.id === targetOrder.userId || u.lineUserId === targetOrder.userId
      );
      const studentLineId =
        studentUser?.lineUserId || (targetOrder.userId.startsWith('U') ? targetOrder.userId : '');
      if (studentLineId) {
        triggerPushNotification({
          type: 'ORDER_CONFIRMED',
          targetLineUserId: studentLineId,
          order: { ...targetOrder, status: 'CONFIRMED' },
        });
      }
    }

    showToast('success', 'อนุมัติสลิปสำเร็จ', `ยืนยันออเดอร์เรียบร้อยแล้ว พร้อมเตรียมอาหาร`);
  };

  const rejectOrderSlip = (orderId: string, reason: string, refundSlipUrl?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'CANCELLED',
              paymentSlip: order.paymentSlip
                ? {
                    ...order.paymentSlip,
                    status: 'REJECTED',
                    rejectionReason: reason,
                    refundSlipUrl: refundSlipUrl || '',
                    refundNote: 'โอนเงินคืนเรียบร้อยตามพร้อมเพย์ผู้สั่ง',
                  }
                : undefined,
            }
          : order
      )
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', orderId).then();
      }
    }).catch(() => {});

    // Notify Student via LINE Push Message
    if (targetOrder) {
      const studentUser = users.find(
        (u) => u.id === targetOrder.userId || u.lineUserId === targetOrder.userId
      );
      const studentLineId =
        studentUser?.lineUserId || (targetOrder.userId.startsWith('U') ? targetOrder.userId : '');
      if (studentLineId) {
        triggerPushNotification({
          type: 'ORDER_CANCELLED',
          targetLineUserId: studentLineId,
          order: { ...targetOrder, status: 'CANCELLED' },
          reason,
        });
      }
    }

    showToast('warning', 'ปฏิเสธและคืนเงินแล้ว', `แนบสลิปคืนเงินให้ออเดอร์เรียบร้อยแล้ว`);
  };

  const markOrderReady = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'READY' } : order
      )
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('orders').update({ status: 'READY' }).eq('id', orderId).then();
      }
    }).catch(() => {});

    // Notify Student via LINE Push Message
    if (targetOrder) {
      const studentUser = users.find(
        (u) => u.id === targetOrder.userId || u.lineUserId === targetOrder.userId
      );
      const studentLineId =
        studentUser?.lineUserId || (targetOrder.userId.startsWith('U') ? targetOrder.userId : '');
      if (studentLineId) {
        triggerPushNotification({
          type: 'ORDER_READY',
          targetLineUserId: studentLineId,
          order: { ...targetOrder, status: 'READY' },
        });
      }
    }

    showToast('success', 'อาหารพร้อมรับแล้ว', 'เปลี่ยนสถานะเป็น "พร้อมรับของที่หน้าร้าน"');
  };

  const markOrderCompleted = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'COMPLETED' } : order
      )
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('orders').update({ status: 'COMPLETED' }).eq('id', orderId).then();
      }
    }).catch(() => {});

    showToast('success', 'ส่งมอบอาหารแล้ว', 'เสร็จสิ้นกระบวนการออเดอร์เรียบร้อย');
  };

  const findOrderByPickupCode = (code: string) => {
    const clean = code.trim().toUpperCase().replace('SW-', '');
    return orders.find(
      (o) =>
        o.pickupCode4Digits === clean ||
        o.orderCode.toUpperCase().includes(clean)
    );
  };

  // Shop management
  const toggleShopOpen = (shopId: string) => {
    const shop = shops.find((s) => s.id === shopId);
    const nextState = !shop?.isOpen;
    
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isOpen: nextState } : s))
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('shops').update({ is_open: nextState }).eq('id', shopId).then();
      }
    }).catch(() => {});

    showToast(
      'info',
      'อัปเดตสถานะร้านค้า',
      `ร้าน ${shop?.name} ตอนนี้ ${nextState ? 'เปิดรับออเดอร์แล้ว 🟢' : 'ปิดรับชั่วคราว 🔴'}`
    );
  };

  const approveShop = (shopId: string) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isApproved: true } : s))
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('shops').update({ is_approved: true }).eq('id', shopId).then();
      }
    }).catch(() => {});

    showToast('success', 'อนุมัติร้านค้าสำเร็จ', 'ร้านค้าสามารถเริ่มเปิดขายได้ทันที');
  };

  const addShop = (
    shopData: Omit<Shop, 'id' | 'rating' | 'totalOrdersCount'>,
    bindUserId?: string
  ) => {
    const newShopId = `shop_${Date.now()}`;
    const newShop: Shop = {
      ...shopData,
      id: newShopId,
      rating: 5.0,
      totalOrdersCount: 0,
      isOpen: shopData.isOpen ?? true,
      isApproved: shopData.isApproved ?? true,
      registrationFeePaid: shopData.registrationFeePaid ?? true,
    };

    setShops((prev) => [newShop, ...prev]);

    // If a user account is selected to be bound as owner
    if (bindUserId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === bindUserId
            ? { ...u, role: 'MERCHANT', shopId: newShopId, name: newShop.ownerName || u.name }
            : u
        )
      );

      // Update Supabase user role and shop_id
      import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
        if (isSupabaseConfigured && supabase) {
          supabase.from('users').update({ role: 'MERCHANT', shop_id: newShopId }).eq('id', bindUserId).then();
        }
      }).catch(() => {});
    }

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('shops')
          .insert({
            id: newShop.id,
            stall_name: newShop.stallName,
            name: newShop.name,
            description: newShop.description,
            owner_name: newShop.ownerName,
            phone: newShop.phone,
            promptpay_no: newShop.promptPayNo,
            rating: newShop.rating,
            total_orders_count: newShop.totalOrdersCount,
            cutoff_time: newShop.cutoffTime,
            is_open: newShop.isOpen,
            is_approved: newShop.isApproved,
            registration_fee_paid: newShop.registrationFeePaid,
            banner_url: newShop.bannerUrl,
            image_url: newShop.imageUrl,
          })
          .then();
      }
    }).catch(() => {});

    showToast('success', 'เพิ่มร้านค้าใหม่สำเร็จ! 🏪', `เพิ่มร้าน ${newShop.name} ในระบบเรียบร้อย`);
    return newShop;
  };

  const updateShop = (shopId: string, updates: Partial<Shop>) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, ...updates } : s))
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        const payload: any = {};
        if (updates.name) payload.name = updates.name;
        if (updates.stallName) payload.stall_name = updates.stallName;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.ownerName) payload.owner_name = updates.ownerName;
        if (updates.phone) payload.phone = updates.phone;
        if (updates.promptPayNo) payload.promptpay_no = updates.promptPayNo;
        if (updates.cutoffTime) payload.cutoff_time = updates.cutoffTime;
        if (updates.isOpen !== undefined) payload.is_open = updates.isOpen;
        if (updates.isApproved !== undefined) payload.is_approved = updates.isApproved;
        if (updates.registrationFeePaid !== undefined) payload.registration_fee_paid = updates.registrationFeePaid;
        if (updates.bannerUrl !== undefined) payload.banner_url = updates.bannerUrl;
        if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;

        supabase.from('shops').update(payload).eq('id', shopId).then();
      }
    }).catch(() => {});

    showToast('success', 'บันทึกข้อมูลร้านค้าแล้ว', 'ข้อมูลร้านได้รับการปรับปรุงเรียบร้อย');
  };

  const deleteShop = (shopId: string) => {
    setShops((prev) => prev.filter((s) => s.id !== shopId));
    setProducts((prev) => prev.filter((p) => p.shopId !== shopId));

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('shops').delete().eq('id', shopId).then();
      }
    }).catch(() => {});

    showToast('info', 'ลบร้านค้าเรียบร้อย', 'ร้านค้าและเมนูทั้งหมดของร้านถูกนำออกจากระบบ');
  };

  // Products
  const updateProductQuota = (productId: string, newQuota: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              dailyQuota: newQuota,
              quotaRemaining: Math.min(newQuota, p.quotaRemaining),
            }
          : p
      )
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('products').update({ daily_quota: newQuota }).eq('id', productId).then();
      }
    }).catch(() => {});
  };

  const toggleProductAvailability = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const nextState = !prod?.isAvailable;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isAvailable: nextState } : p))
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('products').update({ is_available: nextState }).eq('id', productId).then();
      }
    }).catch(() => {});
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const id = `p_${product.shopId}_${Date.now()}`;
    const newProduct: Product = { ...product, id };
    
    setProducts((prev) => [...prev, newProduct]);

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('products').insert({
          id: newProduct.id,
          shop_id: newProduct.shopId,
          name: newProduct.name,
          description: newProduct.description,
          base_price: newProduct.basePrice,
          image_url: newProduct.imageUrl,
          category: newProduct.category,
          daily_quota: newProduct.dailyQuota,
          quota_remaining: newProduct.quotaRemaining,
          is_available: newProduct.isAvailable,
          option_groups: newProduct.optionGroups,
        }).then();
      }
    }).catch(() => {});

    showToast('success', 'เพิ่มเมนูอาหารสำเร็จ', `เพิ่ม ${product.name} เข้าระบบแล้ว`);
  };

  const updateProduct = (productId: string, updates: Partial<Omit<Product, 'id'>>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        const payload: any = {};
        if (updates.name) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.basePrice !== undefined) payload.base_price = updates.basePrice;
        if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
        if (updates.category) payload.category = updates.category;
        if (updates.dailyQuota !== undefined) payload.daily_quota = updates.dailyQuota;
        if (updates.quotaRemaining !== undefined) payload.quota_remaining = updates.quotaRemaining;
        if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
        if (updates.optionGroups) payload.option_groups = updates.optionGroups;

        supabase.from('products').update(payload).eq('id', productId).then();
      }
    }).catch(() => {});

    showToast('success', 'อัปเดตเมนูสำเร็จ', 'ข้อมูลเมนูอาหารได้รับการปรับปรุงเรียบร้อย');
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('products').delete().eq('id', productId).then();
      }
    }).catch(() => {});

    showToast('info', 'ลบเมนูแล้ว', 'ลบรายการเมนูออกจากระบบเรียบร้อย');
  };

  // Stalls
  const addStall = (stall: Omit<StallLocation, 'id'>) => {
    const id = `stall_${Date.now()}`;
    const newStall: StallLocation = { ...stall, id };
    setStalls((prev) => [...prev, newStall]);

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('stalls').insert({
          id: newStall.id,
          code: newStall.code,
          name: newStall.name,
          description: newStall.description,
        }).then();
      }
    }).catch(() => {});

    showToast('success', 'เพิ่มล็อกโรงอาหารแล้ว', `เพิ่ม ${stall.name} สำเร็จ`);
  };

  const deleteStall = (stallId: string) => {
    setStalls((prev) => prev.filter((s) => s.id !== stallId));

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('stalls').delete().eq('id', stallId).then();
      }
    }).catch(() => {});

    showToast('info', 'ลบล็อกโรงอาหารแล้ว', 'ลบข้อมูลล็อกออกจากระบบเรียบร้อย');
  };

  // Holidays
  const addHoliday = (holiday: Omit<SchoolHoliday, 'id'>) => {
    const id = `h_${Date.now()}`;
    const newHoliday: SchoolHoliday = { ...holiday, id };
    setHolidays((prev) => [...prev, newHoliday]);

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('school_holidays').insert({
          id: newHoliday.id,
          date: newHoliday.date,
          name: newHoliday.name,
          is_locked: newHoliday.isLocked,
        }).then();
      }
    }).catch(() => {});

    showToast('warning', 'ตั้งค่าวันหยุดโรงเรียนแล้ว', `ระบบจะปิดรับออเดอร์ในวันที่ ${holiday.date}`);
  };

  const deleteHoliday = (holidayId: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('school_holidays').delete().eq('id', holidayId).then();
      }
    }).catch(() => {});
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id'>) => {
    const id = `ann_${Date.now()}`;
    const newAnn: Announcement = { ...ann, id };
    setAnnouncements((prev) => [newAnn, ...prev]);

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('announcements').insert({
          id: newAnn.id,
          title: newAnn.title,
          subtitle: newAnn.subtitle,
          content: newAnn.content,
          image_url: newAnn.imageUrl,
          badge_text: newAnn.badgeText,
          is_active: newAnn.isActive,
        }).then();
      }
    }).catch(() => {});

    showToast('success', 'เผยแพร่ประกาศแล้ว', 'ประกาศใหม่จะแสดงบนหน้าแรกทันที');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('announcements').delete().eq('id', id).then();
      }
    }).catch(() => {});
  };

  // Fees
  const recordFeePayment = (shopId: string, type: 'REGISTRATION' | 'MONTHLY', months = 1) => {
    const shop = shops.find((s) => s.id === shopId);
    if (!shop) return;

    const currentExpire = new Date(shop.subscriptionExpiresAt || Date.now());
    const newExpire = new Date(currentExpire);
    newExpire.setMonth(newExpire.getMonth() + months);

    const newRecord: MerchantFeeRecord = {
      id: `fee_${Date.now()}`,
      shopId,
      shopName: shop.name,
      type,
      amount: 20 * (type === 'MONTHLY' ? months : 1),
      paidAt: new Date().toISOString(),
      validUntil: type === 'MONTHLY' ? newExpire.toISOString() : undefined,
      note:
        type === 'REGISTRATION'
          ? 'ชำระค่าแรกเข้าเปิดร้านค้า (20 บาท)'
          : `ต่ออายุค่าบริการรายเดือน ${months} เดือน (20 บาท/ด.)`,
    };

    setFeeRecords((prev) => [newRecord, ...prev]);

    setShops((prev) =>
      prev.map((s) =>
        s.id === shopId
          ? {
              ...s,
              registrationFeePaid: type === 'REGISTRATION' ? true : s.registrationFeePaid,
              subscriptionExpiresAt: type === 'MONTHLY' ? newExpire.toISOString() : s.subscriptionExpiresAt,
            }
          : s
      )
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('merchant_fee_records').insert({
          id: newRecord.id,
          shop_id: newRecord.shopId,
          shop_name: newRecord.shopName,
          type: newRecord.type,
          amount: newRecord.amount,
          paid_at: newRecord.paidAt,
          valid_until: newRecord.validUntil,
          note: newRecord.note,
        }).then();

        supabase.from('shops').update({
          registration_fee_paid: type === 'REGISTRATION' ? true : shop.registrationFeePaid,
          subscription_expires_at: type === 'MONTHLY' ? newExpire.toISOString() : shop.subscriptionExpiresAt,
        }).eq('id', shopId).then();
      }
    }).catch(() => {});

    showToast('success', 'บันทึกการชำระเงินสำเร็จ', `บันทึกยอดสำหรับร้าน ${shop.name} เรียบร้อยแล้ว`);
  };

  // User Management
  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.isActive === false ? true : false;

          // Sync to Supabase
          import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
            if (isSupabaseConfigured && supabase) {
              supabase.from('users').update({ is_active: newStatus }).eq('id', userId).then();
            }
          }).catch(() => {});

          showToast(
            newStatus ? 'success' : 'warning',
            'อัปเดตสถานะผู้ใช้',
            `${u.name} ตอนนี้ ${newStatus ? 'เปิดใช้งานปกติ 🟢' : 'ถูกระงับการใช้งานชั่วคราว 🔴'}`
          );
          return { ...u, isActive: newStatus };
        }
        return u;
      })
    );
  };

  const adminUpdateUser = (userId: string, updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updates };

          // If updating currently logged in user, sync current session
          if (currentUser.id === userId) {
            setCurrentUser((prevCur) => ({ ...prevCur, ...updates }));
            try {
              localStorage.setItem('sappha_auth_user', JSON.stringify({ ...currentUser, ...updates }));
            } catch (e) {}
          }

          // Sync to Supabase
          import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
            if (isSupabaseConfigured && supabase) {
              const payload: any = {};
              if (updates.name !== undefined) payload.name = updates.name;
              if (updates.nickname !== undefined) payload.nickname = updates.nickname;
              if (updates.studentId !== undefined) payload.student_id = updates.studentId;
              if (updates.gradeRoom !== undefined) payload.grade_room = updates.gradeRoom;
              if (updates.phone !== undefined) payload.phone = updates.phone;
              if (updates.promptPayRefund !== undefined) payload.promptpay_refund = updates.promptPayRefund;
              if (updates.role !== undefined) payload.role = updates.role;
              if (updates.isActive !== undefined) payload.is_active = updates.isActive;

              supabase.from('users').update(payload).eq('id', userId).then();
            }
          }).catch(() => {});

          return updated;
        }
        return u;
      })
    );

    showToast('success', 'แก้ไขข้อมูลผู้ใช้สำเร็จ 🛡️', 'ข้อมูลนักเรียน/ผู้ใช้ได้รับการอัปเดตเรียบร้อย');
  };

  // System Settings
  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...settings }));

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        const payload: any = {};
        if (settings.schoolName) payload.school_name = settings.schoolName;
        if (settings.orderOpenTime) payload.order_open_time = settings.orderOpenTime;
        if (settings.orderCutoffTime) payload.order_cutoff_time = settings.orderCutoffTime;
        if (settings.pickupTimeWindow) payload.pickup_time_window = settings.pickupTimeWindow;
        if (settings.maintenanceMode !== undefined) payload.maintenance_mode = settings.maintenanceMode;
        if (settings.emergencyBroadcast !== undefined) payload.emergency_broadcast = settings.emergencyBroadcast;

        supabase.from('system_settings').upsert({ id: 1, ...payload }).then();
      }
    }).catch(() => {});

    showToast('success', 'บันทึกการตั้งค่าระบบแล้ว', 'ข้อมูลระบบกลางของโรงเรียนได้รับการอัปเดตเรียบร้อย');
  };

  // Admin Order Override
  const adminOverrideOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              ...(status === 'CANCELLED' && note
                ? {
                    paymentSlip: o.paymentSlip
                      ? { ...o.paymentSlip, status: 'REJECTED', rejectionReason: note }
                      : undefined,
                  }
                : {}),
            }
          : o
      )
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('orders').update({ status }).eq('id', orderId).then();
      }
    }).catch(() => {});

    showToast('info', 'แอดมินปรับสถานะออเดอร์', `ออเดอร์ถูกปรับสถานะเป็น ${status}`);
  };

  // Reviews operations
  const addReview = (reviewData: Omit<ShopReview, 'id' | 'createdAt'>) => {
    const newReview: ShopReview = {
      ...reviewData,
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);

    // Mark order as reviewed
    setOrders((prev) =>
      prev.map((o) =>
        o.id === reviewData.orderId
          ? { ...o, reviewed: true, reviewId: newReview.id }
          : o
      )
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('reviews').insert({
          id: newReview.id,
          order_id: newReview.orderId,
          shop_id: newReview.shopId,
          user_id: newReview.userId,
          user_name: newReview.userName,
          user_nickname: newReview.userNickname,
          user_grade_room: newReview.userGradeRoom,
          rating: newReview.rating,
          comment: newReview.comment,
          is_anonymous: newReview.isAnonymous,
        }).then();

        if (newReview.orderId) {
          supabase.from('orders').update({ reviewed: true, review_id: newReview.id }).eq('id', newReview.orderId).then();
        }
      }
    }).catch(() => {});

    showToast(
      'success',
      'ขอบคุณสำหรับคะแนนรีวิว! ⭐',
      `รีวิวของคุณถูกบันทึกและส่งกำลังใจให้ทางร้านค้าเรียบร้อยแล้ว`
    );
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        supabase.from('reviews').delete().eq('id', reviewId).then();
      }
    }).catch(() => {});

    showToast('info', 'ลบรีวิวแล้ว', 'แอดมินได้ทำการลบรีวิวที่ไม่เหมาะสมออกจากระบบแล้ว');
  };

  const getShopReviews = (shopId: string) => {
    return reviews.filter((r) => r.shopId === shopId);
  };

  const getShopAverageRating = (shopId: string) => {
    const shopRev = reviews.filter((r) => r.shopId === shopId);
    if (shopRev.length === 0) return { average: 5.0, count: 0 };
    const sum = shopRev.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Number((sum / shopRev.length).toFixed(1)),
      count: shopRev.length,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthReady,
        switchRole,
        updateUserProfile,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalItems,
        cartTotalPrice,
        orders,
        createOrders,
        cancelOrder,
        approveOrderSlip,
        rejectOrderSlip,
        markOrderReady,
        markOrderCompleted,
        findOrderByPickupCode,
        shops,
        toggleShopOpen,
        approveShop,
        addShop,
        updateShop,
        deleteShop,
        products,
        updateProductQuota,
        toggleProductAvailability,
        addProduct,
        updateProduct,
        deleteProduct,
        stalls,
        addStall,
        deleteStall,
        holidays,
        addHoliday,
        deleteHoliday,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        feeRecords,
        recordFeePayment,
        users,
        toggleUserStatus,
        adminUpdateUser,
        systemSettings,
        updateSystemSettings,
        adminOverrideOrderStatus,
        reviews,
        addReview,
        deleteReview,
        getShopReviews,
        getShopAverageRating,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
