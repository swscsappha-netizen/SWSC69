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
  mockUsers,
  initialUsers,
  initialSystemSettings,
  initialShops,
  initialProducts,
  initialStalls,
  initialHolidays,
  initialAnnouncements,
  initialOrders,
  initialFeeRecords,
  initialReviews,
} from '@/lib/mockData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: UserProfile;
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
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUserProfile);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stalls, setStalls] = useState<StallLocation[]>(initialStalls);
  const [holidays, setHolidays] = useState<SchoolHoliday[]>(initialHolidays);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [feeRecords, setFeeRecords] = useState<MerchantFeeRecord[]>(initialFeeRecords);
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings);
  const [reviews, setReviews] = useState<ShopReview[]>(initialReviews);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load from localStorage if available
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('sappha_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedCart = localStorage.getItem('sappha_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedShops = localStorage.getItem('sappha_shops');
      if (savedShops) setShops(JSON.parse(savedShops));

      const savedStalls = localStorage.getItem('sappha_stalls');
      if (savedStalls) setStalls(JSON.parse(savedStalls));

      const savedProducts = localStorage.getItem('sappha_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedUsers = localStorage.getItem('sappha_users');
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedSettings = localStorage.getItem('sappha_settings');
      if (savedSettings) setSystemSettings(JSON.parse(savedSettings));

      const savedReviews = localStorage.getItem('sappha_reviews');
      if (savedReviews) setReviews(JSON.parse(savedReviews));

      const savedAuth = localStorage.getItem('sappha_auth_user');
      const savedLoggedIn = localStorage.getItem('sappha_is_logged_in') === 'true';
      if (savedAuth && savedLoggedIn) {
        setCurrentUser(JSON.parse(savedAuth));
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }

    // Load Live Data from Supabase Cloud
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase) {
        // 1. Fetch Shops
        supabase.from('shops').select('*').then(({ data }) => {
          if (data && data.length > 0) {
            setShops(
              data.map((s: any) => ({
                id: s.id,
                name: s.name,
                ownerName: s.owner_name,
                stallId: s.stall_id || 'stall_1',
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
                subscriptionExpiresAt: s.subscription_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                rating: Number(s.rating) || 5.0,
                totalOrdersCount: Number(s.total_orders_count) || 0,
              }))
            );
          }
        });

        // 2. Fetch Products
        supabase.from('products').select('*').then(({ data }) => {
          if (data && data.length > 0) {
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
        supabase.from('stalls').select('*').then(({ data }) => {
          if (data && data.length > 0) {
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
          if (data && data.length > 0) {
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
          if (data && data.length > 0) {
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

        // Realtime Subscription on orders and reviews
        const channel = supabase
          .channel('schema-db-changes')
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
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }).catch(() => {});

    // Auto initialize LINE LIFF if in LINE Browser or LIFF configured
    import('@/lib/liff').then(({ initLiff }) => {
      initLiff().then((res) => {
        if (res.success && res.profile) {
          const isLineAdmin = res.profile.userId === 'U203ff66b7e535c901dfbfa86d93eef46';
          setCurrentUser((prev) => ({
            ...prev,
            name: res.profile!.displayName || prev.name,
            avatarUrl: res.profile!.pictureUrl || prev.avatarUrl,
            lineUserId: res.profile!.userId,
            role: isLineAdmin ? 'ADMIN' : prev.role,
            isLoggedIn: true,
          }));
        }
      });
    }).catch(() => {});
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('sappha_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('sappha_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('sappha_shops', JSON.stringify(shops));
    } catch (e) {}
  }, [shops]);

  useEffect(() => {
    try {
      localStorage.setItem('sappha_stalls', JSON.stringify(stalls));
    } catch (e) {}
  }, [stalls]);

  useEffect(() => {
    try {
      localStorage.setItem('sappha_products', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('sappha_users', JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('sappha_settings', JSON.stringify(systemSettings));
    } catch (e) {}
  }, [systemSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('sappha_reviews', JSON.stringify(reviews));
    } catch (e) {}
  }, [reviews]);

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

  const switchRole = (role: UserRole) => {
    if (role === 'STUDENT') setCurrentUser(mockUsers.student);
    else if (role === 'MERCHANT') setCurrentUser(mockUsers.merchant);
    else if (role === 'ADMIN') setCurrentUser(mockUsers.admin);
    showToast('info', 'สลับบทบาทสำเร็จ', `คุณกำลังใช้งานในมุมมอง: ${role}`);
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...profile, isLoggedIn: true };
      try {
        localStorage.setItem('sappha_auth_user', JSON.stringify(updated));
        localStorage.setItem('sappha_is_logged_in', 'true');
      } catch (e) {}
      return updated;
    });
    showToast('success', 'บันทึกข้อมูลสำเร็จ', 'อัปเดตโปรไฟล์เรียบร้อยแล้ว');
  };

  const logout = () => {
    try {
      localStorage.removeItem('sappha_auth_user');
      localStorage.removeItem('sappha_is_logged_in');
    } catch (e) {}
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
          slipUrl: so.slipUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
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

    // Decrease product quotas & Save to Supabase
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

    showToast('success', 'อนุมัติสลิปสำเร็จ', `ยืนยันออเดอร์เรียบร้อยแล้ว พร้อมเตรียมอาหาร`);
  };

  const rejectOrderSlip = (orderId: string, reason: string, refundSlipUrl?: string) => {
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
                    refundSlipUrl: refundSlipUrl || 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?auto=format&fit=crop&w=600&q=80',
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

    showToast('warning', 'ปฏิเสธและคืนเงินแล้ว', `แนบสลิปคืนเงินให้ออเดอร์เรียบร้อยแล้ว`);
  };

  const markOrderReady = (orderId: string) => {
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

    showToast('success', 'ส่งมอบสินค้าสำเร็จ', 'บันทึกการรับอาหารเรียบร้อยแล้ว');
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
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isOpen: !s.isOpen } : s))
    );
    const shop = shops.find((s) => s.id === shopId);
    showToast(
      'info',
      'อัปเดตสถานะร้านค้า',
      `ร้าน ${shop?.name} ตอนนี้ ${!shop?.isOpen ? 'เปิดรับออเดอร์แล้ว 🟢' : 'ปิดรับชั่วคราว 🔴'}`
    );
  };

  const approveShop = (shopId: string) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isApproved: true } : s))
    );
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
    }

    // Sync to Supabase if configured
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
        if (updates.bannerUrl) payload.banner_url = updates.bannerUrl;
        if (updates.imageUrl) payload.image_url = updates.imageUrl;

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
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const id = `p_${product.shopId}_${Date.now()}`;
    setProducts((prev) => [...prev, { ...product, id }]);
    showToast('success', 'เพิ่มเมนูอาหารสำเร็จ', `เพิ่ม ${product.name} เข้าระบบแล้ว`);
  };

  const updateProduct = (productId: string, updates: Partial<Omit<Product, 'id'>>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    showToast('success', 'อัปเดตเมนูสำเร็จ', 'ข้อมูลเมนูอาหารได้รับการปรับปรุงเรียบร้อย');
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('info', 'ลบเมนูแล้ว', 'ลบรายการเมนูออกจากระบบเรียบร้อย');
  };

  // Stalls
  const addStall = (stall: Omit<StallLocation, 'id'>) => {
    const id = `stall_${Date.now()}`;
    setStalls((prev) => [...prev, { ...stall, id }]);
    showToast('success', 'เพิ่มล็อกโรงอาหารแล้ว', `เพิ่ม ${stall.name} สำเร็จ`);
  };

  const deleteStall = (stallId: string) => {
    setStalls((prev) => prev.filter((s) => s.id !== stallId));
    showToast('info', 'ลบล็อกโรงอาหารแล้ว', 'ลบข้อมูลล็อกออกจากระบบเรียบร้อย');
  };

  // Holidays
  const addHoliday = (holiday: Omit<SchoolHoliday, 'id'>) => {
    const id = `h_${Date.now()}`;
    setHolidays((prev) => [...prev, { ...holiday, id }]);
    showToast('warning', 'ตั้งค่าวันหยุดโรงเรียนแล้ว', `ระบบจะปิดรับออเดอร์ในวันที่ ${holiday.date}`);
  };

  const deleteHoliday = (holidayId: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id'>) => {
    const id = `ann_${Date.now()}`;
    setAnnouncements((prev) => [{ ...ann, id }, ...prev]);
    showToast('success', 'เผยแพร่ประกาศแล้ว', 'ประกาศใหม่จะแสดงบนหน้าแรกทันที');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
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

    showToast('success', 'บันทึกการชำระเงินสำเร็จ', `บันทึกยอด 20 บาทสำหรับร้าน ${shop.name} เรียบร้อยแล้ว`);
  };

  // User Management
  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.isActive === false ? true : false;
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

  // System Settings
  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...settings }));
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

    showToast(
      'success',
      'ขอบคุณสำหรับคะแนนรีวิว! ⭐',
      `รีวิวของคุณถูกบันทึกและส่งกำลังใจให้ทางร้านค้าเรียบร้อยแล้ว`
    );
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
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
