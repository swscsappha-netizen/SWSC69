export type UserRole = 'STUDENT' | 'TEACHER' | 'MERCHANT' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  studentId: string;
  gradeRoom: string; // e.g. "ม.5/2" or "ครู/บุคลากร"
  phone: string;
  promptPayNumber: string;
  promptPayRefund?: string; // PromptPay for receiving refund
  role: UserRole;
  avatarUrl?: string;
  shopId?: string; // If merchant
  isActive?: boolean;
  joinedAt?: string;
}

export interface SystemSettings {
  schoolName: string;
  orderOpenTime: string; // e.g. "06:00"
  orderCutoffTime: string; // e.g. "20:00"
  pickupTimeWindow: string; // e.g. "06:45 - 07:45 น."
  maintenanceMode: boolean;
  emergencyBroadcast?: string;
}

export interface StallLocation {
  id: string;
  name: string; // e.g. "ล็อก 3 (โรงอาหารฝั่งเสาธง)"
  code: string; // e.g. "STALL-03"
  description: string;
}

export interface OptionItem {
  id: string;
  name: string;
  priceDelta: number; // e.g. +10, +0
}

export interface OptionGroup {
  id: string;
  title: string; // e.g. "ขนาด", "ระดับความหวาน", "ท็อปปิ้งเพิ่มเติม"
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: OptionItem[];
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  category: 'rice' | 'noodle' | 'drink' | 'snack' | 'dessert';
  dailyQuota: number;
  quotaRemaining: number;
  isAvailable: boolean;
  optionGroups: OptionGroup[];
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  stallId: string;
  stallName: string; // e.g. "ล็อก 3 (โซนอาหารจานด่วน)"
  description: string;
  imageUrl: string;
  bannerUrl: string;
  phone: string;
  promptPayNo: string;
  promptPayName: string;
  cutoffTime: string; // e.g. "20:00"
  isOpen: boolean; // Merchant toggle
  isApproved: boolean; // Admin approval
  registrationFeePaid: boolean; // 20 THB
  subscriptionExpiresAt: string; // ISO Date String (20 THB/month)
  rating: number;
  totalOrdersCount: number;
}

export interface SelectedOption {
  groupId: string;
  groupTitle: string;
  itemId: string;
  itemName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  shopId: string;
  shopName: string;
  stallName: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  selectedOptions: SelectedOption[];
  specialInstructions?: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'  // รอแนบสลิป
  | 'PENDING_APPROVAL' // แนบสลิปแล้ว รอแม่ค้าตรวจ
  | 'CONFIRMED'        // แม่ค้ายืนยันสลิปแล้ว (กำลังเตรียมของ)
  | 'READY'            // พร้อมรับของที่หน้าร้าน
  | 'COMPLETED'        // รับอาหารเรียบร้อยแล้ว
  | 'CANCELLED';       // ยกเลิกแล้ว (หรือแม่ค้าปฏิเสธ)

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions: SelectedOption[];
  specialInstructions?: string;
}

export interface PaymentSlip {
  slipUrl: string;
  amount: number;
  uploadedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  refundSlipUrl?: string;
  refundNote?: string;
}

export interface ShopReview {
  id: string;
  orderId: string;
  shopId: string;
  userId: string;
  userName: string;
  userNickname: string;
  userGradeRoom: string;
  rating: number; // 1 - 5
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderCode: string; // e.g. "SW-4089"
  pickupCode4Digits: string; // e.g. "4089"
  userId: string;
  userName: string;
  userNickname: string;
  userGradeRoom: string;
  userStudentId: string;
  userPhone: string;
  shopId: string;
  shopName: string;
  stallName: string;
  pickupDate: string; // e.g. "2026-08-18"
  pickupTimeWindow: string; // e.g. "06:45 - 07:45 น."
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  createdAt: string;
  paymentSlip?: PaymentSlip;
  isUrgentLate?: boolean;
  reviewed?: boolean;
  reviewId?: string;
}

export interface SchoolHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  isLocked: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  badgeText: string;
  linkUrl?: string;
  isActive: boolean;
}

export interface MerchantFeeRecord {
  id: string;
  shopId: string;
  shopName: string;
  type: 'REGISTRATION' | 'MONTHLY';
  amount: number; // 20 THB
  paidAt: string;
  validUntil?: string;
  note: string;
}
