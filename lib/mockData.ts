import {
  UserProfile,
  Shop,
  Product,
  StallLocation,
  SchoolHoliday,
  Announcement,
  Order,
  MerchantFeeRecord,
  SystemSettings,
  ShopReview,
} from '@/types';

export const initialUserProfile: UserProfile = {
  id: '',
  name: '',
  nickname: '',
  studentId: '',
  gradeRoom: '',
  phone: '',
  promptPayNumber: '',
  role: 'STUDENT',
  avatarUrl: '',
  isActive: true,
  isLoggedIn: false,
};

export const initialSystemSettings: SystemSettings = {
  schoolName: 'โรงเรียนสรรพวิทยาคม (SorWor)',
  orderOpenTime: '06:00',
  orderCutoffTime: '20:00',
  pickupTimeWindow: '06:45 - 07:45 น.',
  maintenanceMode: false,
  emergencyBroadcast: '',
};

export const initialUsers: UserProfile[] = [];
export const initialStalls: StallLocation[] = [];
export const initialShops: Shop[] = [];
export const initialProducts: Product[] = [];
export const initialOrders: Order[] = [];
export const initialReviews: ShopReview[] = [];
export const initialAnnouncements: Announcement[] = [];
export const initialHolidays: SchoolHoliday[] = [];
export const initialFeeRecords: MerchantFeeRecord[] = [];
