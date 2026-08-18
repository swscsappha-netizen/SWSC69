'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  Store,
  MapPin,
  Calendar,
  DollarSign,
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Building,
  Users,
  FileSpreadsheet,
  Settings,
  ClipboardList,
  Search,
  Check,
  X,
  ExternalLink,
  Eye,
  Sliders,
  AlertTriangle,
  UserCheck,
  UserX,
  Star,
  Database,
  Sparkles,
  Edit,
  Power,
  Hash,
} from 'lucide-react';
import { OrderStatus, Shop, UserRole, UserProfile } from '@/types';

export default function AdminPortalPage() {
  const {
    currentUser,
    shops,
    addShop,
    updateShop,
    deleteShop,
    toggleShopOpen,
    orders,
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
    approveShop,
    users,
    toggleUserStatus,
    adminUpdateUser,
    systemSettings,
    updateSystemSettings,
    adminOverrideOrderStatus,
    reviews,
    deleteReview,
    switchRole,
    showToast,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'analytics' | 'orders' | 'users' | 'reviews' | 'merchants' | 'stalls' | 'holidays' | 'announcements' | 'settings' | 'fees'
  >('analytics');

  // If not admin, show restricted view with 1-click test button
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          หน้านี้สำหรับฝ่ายบริหารโรงเรียน (Admin)
        </h1>
        <p className="text-xs text-slate-500">
          คุณกำลังเข้าใช้งานในบทบาท &ldquo;{currentUser.name}&rdquo; ({currentUser.role})
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <a
            href="/"
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>← กลับสู่ตลาดโรงอาหารหน้าหลัก</span>
          </a>
        </div>
      </div>
    );
  }

  // --- Form & Filter States ---
  // Stalls
  const [newStallCode, setNewStallCode] = useState('');
  const [newStallName, setNewStallName] = useState('');
  const [newStallDesc, setNewStallDesc] = useState('');

  // Holidays
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  // Announcements
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnSubtitle, setNewAnnSubtitle] = useState('');
  const [newAnnBadge, setNewAnnBadge] = useState('ข่าวประชาสัมพันธ์');
  const [newAnnImage, setNewAnnImage] = useState(
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
  );

  // Users Filter & Management
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editStudentId, setEditStudentId] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editGradeRoom, setEditGradeRoom] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('STUDENT');
  const [editPromptPayRefund, setEditPromptPayRefund] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const openEditUserModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditStudentId(user.studentId || '');
    setEditFullName(user.name || '');
    setEditNickname(user.nickname || '');
    setEditGradeRoom(user.gradeRoom || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'STUDENT');
    setEditPromptPayRefund(user.promptPayRefund || user.phone || '');
    setEditIsActive(user.isActive !== false);
    setIsUserEditModalOpen(true);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    adminUpdateUser(editingUser.id, {
      studentId: editStudentId.trim(),
      name: editFullName.trim(),
      nickname: editNickname.trim(),
      gradeRoom: editGradeRoom.trim(),
      phone: editPhone.trim(),
      role: editRole,
      promptPayRefund: editPromptPayRefund.trim(),
      isActive: editIsActive,
    });

    setIsUserEditModalOpen(false);
    setEditingUser(null);
  };

  // Orders Audit Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [orderShopFilter, setOrderShopFilter] = useState<string>('ALL');
  const [inspectSlipUrl, setInspectSlipUrl] = useState<string | null>(null);

  // System Settings Form
  const [settingsOpenTime, setSettingsOpenTime] = useState(systemSettings?.orderOpenTime || '06:00');
  const [settingsCutoffTime, setSettingsCutoffTime] = useState(systemSettings?.orderCutoffTime || '20:00');
  const [settingsPickupWindow, setSettingsPickupWindow] = useState(systemSettings?.pickupTimeWindow || '06:45 - 07:45 น.');
  const [settingsMaintenance, setSettingsMaintenance] = useState(systemSettings?.maintenanceMode || false);
  const [settingsBroadcast, setSettingsBroadcast] = useState(systemSettings?.emergencyBroadcast || '');

  // --- Shop Management Form States ---
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [shopFormName, setShopFormName] = useState('');
  const [shopFormStallName, setShopFormStallName] = useState(stalls[0]?.name || 'ล็อก 1');
  const [shopFormDesc, setShopFormDesc] = useState('');
  const [shopFormOwnerName, setShopFormOwnerName] = useState('');
  const [shopFormPhone, setShopFormPhone] = useState('');
  const [shopFormPromptPay, setShopFormPromptPay] = useState('');
  const [shopFormCutoff, setShopFormCutoff] = useState('20:00');
  const [shopFormBanner, setShopFormBanner] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
  );
  const [shopFormImage, setShopFormImage] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
  );
  const [shopFormBindUserId, setShopFormBindUserId] = useState('');
  const [shopFormIsOpen, setShopFormIsOpen] = useState(true);
  const [shopFormIsApproved, setShopFormIsApproved] = useState(true);
  const [shopFormRegFeePaid, setShopFormRegFeePaid] = useState(true);

  const openCreateShopModal = () => {
    setEditingShopId(null);
    setShopFormName('');
    setShopFormStallName(stalls[0]?.name || 'ล็อก 1 (โซนข้าวแกง & อาหารตามสั่ง)');
    setShopFormDesc('');
    setShopFormOwnerName('');
    setShopFormPhone('');
    setShopFormPromptPay('');
    setShopFormCutoff('20:00');
    setShopFormBanner('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80');
    setShopFormImage('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80');
    setShopFormBindUserId('');
    setShopFormIsOpen(true);
    setShopFormIsApproved(true);
    setShopFormRegFeePaid(true);
    setIsShopModalOpen(true);
  };

  const openEditShopModal = (shop: Shop) => {
    setEditingShopId(shop.id);
    setShopFormName(shop.name);
    setShopFormStallName(shop.stallName);
    setShopFormDesc(shop.description || '');
    setShopFormOwnerName(shop.ownerName);
    setShopFormPhone(shop.phone);
    setShopFormPromptPay(shop.promptPayNo);
    setShopFormCutoff(shop.cutoffTime || '20:00');
    setShopFormBanner(shop.bannerUrl);
    setShopFormImage(shop.imageUrl);
    const existingOwner = users.find((u) => u.shopId === shop.id);
    setShopFormBindUserId(existingOwner?.id || '');
    setShopFormIsOpen(shop.isOpen);
    setShopFormIsApproved(shop.isApproved);
    setShopFormRegFeePaid(shop.registrationFeePaid);
    setIsShopModalOpen(true);
  };

  const handleSaveShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopFormName.trim() || !shopFormOwnerName.trim() || !shopFormPhone.trim() || !shopFormPromptPay.trim()) {
      showToast('error', 'กรุณากรอกข้อมูลให้ครบ', 'โปรดระบุชื่อร้าน ชื่อเจ้าของ และเบอร์พร้อมเพย์');
      return;
    }

    const matchingStall = stalls.find((s) => s.name === shopFormStallName);
    const resolvedStallId = matchingStall?.id || stalls[0]?.id || 'stall_1';

    if (editingShopId) {
      // Update existing shop
      updateShop(editingShopId, {
        name: shopFormName.trim(),
        stallId: resolvedStallId,
        stallName: shopFormStallName,
        description: shopFormDesc.trim(),
        ownerName: shopFormOwnerName.trim(),
        phone: shopFormPhone.trim(),
        promptPayNo: shopFormPromptPay.trim(),
        promptPayName: shopFormOwnerName.trim(),
        cutoffTime: shopFormCutoff,
        bannerUrl: shopFormBanner,
        imageUrl: shopFormImage,
        isOpen: shopFormIsOpen,
        isApproved: shopFormIsApproved,
        registrationFeePaid: shopFormRegFeePaid,
      });
      showToast('success', 'บันทึกการแก้ไขร้านค้าสำเร็จ', `อัปเดตร้าน ${shopFormName} เรียบร้อยแล้ว`);
    } else {
      // Create new shop
      addShop(
        {
          stallId: resolvedStallId,
          stallName: shopFormStallName,
          name: shopFormName.trim(),
          description: shopFormDesc.trim(),
          ownerName: shopFormOwnerName.trim(),
          phone: shopFormPhone.trim(),
          promptPayNo: shopFormPromptPay.trim(),
          promptPayName: shopFormOwnerName.trim(),
          cutoffTime: shopFormCutoff,
          isOpen: shopFormIsOpen,
          isApproved: shopFormIsApproved,
          registrationFeePaid: shopFormRegFeePaid,
          bannerUrl: shopFormBanner,
          imageUrl: shopFormImage,
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        shopFormBindUserId || undefined
      );
    }

    setIsShopModalOpen(false);
  };

  // Overall calculations
  const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const totalSchoolSales = validOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalFeeCollected = feeRecords.reduce((sum, f) => sum + f.amount, 0);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'รหัสออเดอร์',
      'วันที่สั่ง',
      'ร้านค้า',
      'ล็อกโรงอาหาร',
      'ผู้สั่ง',
      'ชื่อเล่น',
      'ชั้น/ห้อง',
      'รหัสนักเรียน',
      'เบอร์โทร',
      'รายการสินค้า',
      'ยอดเงิน (บาท)',
      'สถานะ',
    ];

    const rows = orders.map((o) => [
      o.orderCode,
      new Date(o.createdAt).toLocaleDateString('th-TH'),
      `"${o.shopName}"`,
      `"${o.stallName}"`,
      `"${o.userName}"`,
      `"${o.userNickname}"`,
      `"${o.userGradeRoom}"`,
      `"${o.userStudentId}"`,
      `"${o.userPhone}"`,
      `"${o.items.map((i) => `${i.productName} x${i.quantity}`).join('; ')}"`,
      o.subtotal,
      o.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานยอดขาย_โรงเรียนสรรพวิทยาคม_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'ดาวน์โหลดรายงานสำเร็จ', 'ส่งออกข้อมูลยอดขายเป็นไฟล์ CSV เรียบร้อยแล้ว');
  };

  const handleAddStall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStallName.trim()) return;
    addStall({
      code: newStallCode || `STALL-0${stalls.length + 1}`,
      name: newStallName,
      description: newStallDesc || 'โซนโรงอาหารทั่วไป',
    });
    setNewStallCode('');
    setNewStallName('');
    setNewStallDesc('');
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName.trim()) return;
    addHoliday({
      date: newHolidayDate,
      name: newHolidayName,
      isLocked: true,
    });
    setNewHolidayDate('');
    setNewHolidayName('');
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim()) return;
    addAnnouncement({
      title: newAnnTitle,
      subtitle: newAnnSubtitle || 'ข่าวสารโรงเรียนสรรพวิทยาคม',
      content: newAnnSubtitle,
      imageUrl: newAnnImage,
      badgeText: newAnnBadge,
      isActive: true,
    });
    setNewAnnTitle('');
    setNewAnnSubtitle('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      orderOpenTime: settingsOpenTime,
      orderCutoffTime: settingsCutoffTime,
      pickupTimeWindow: settingsPickupWindow,
      maintenanceMode: settingsMaintenance,
      emergencyBroadcast: settingsBroadcast,
    });
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.nickname.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.studentId.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.gradeRoom.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderCode.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.pickupCode4Digits.includes(orderSearch);
    const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    const matchShop = orderShopFilter === 'ALL' || o.shopId === orderShopFilter;
    return matchSearch && matchStatus && matchShop;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500 text-white uppercase tracking-wider">
              ฝ่ายบริหารงานโรงอาหาร / สภานักเรียน
            </span>
            <span className="text-xs text-blue-200">โรงเรียนสรรพวิทยาคม</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            แดชบอร์ดผู้ดูแลระบบ (School Admin Portal)
          </h1>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            ควบคุมระบบตลาดโรงอาหาร, ตรวจสอบยอดขาย, จัดการผู้ใช้งาน, อนุมัติร้านค้า และตั้งค่าระบบกลาง
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออกรายงาน CSV</span>
          </button>
          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs">
            <span className="text-blue-300 block text-[10px]">ผู้ดูแลระบบปัจจุบัน:</span>
            <span className="font-bold">{currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (8 Tabs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>สถิติ &amp; ภาพรวม</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'orders'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>ออเดอร์ทั้งหมด</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{orders.length}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'users'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดการผู้ใช้งาน</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{users.length}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('reviews')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'reviews'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>จัดการรีวิว</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{reviews.length}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('merchants')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'merchants'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>ร้านค้า &amp; สมาชิก</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('stalls')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'stalls'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>ล็อกโรงอาหาร</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('holidays')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'holidays'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>วันหยุดโรงเรียน</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('announcements')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'announcements'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>แบนเนอร์ประชาสัมพันธ์</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'settings'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>ตั้งค่าระบบกลาง</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('fees')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'fees'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>ประวัติค่าธรรมเนียม</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ANALYTICS TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>ยอดขายรวมโรงเรียน</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ฿{totalSchoolSales.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                จากทั้งหมด {validOrders.length} ออเดอร์
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>ค่าธรรมเนียมสะสม</span>
                <CreditCard className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600">
                ฿{totalFeeCollected.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">ค่าแรกเข้า 20฿ + รายเดือน 20฿</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>ร้านค้าในโรงอาหาร</span>
                <Store className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{shops.length} ร้าน</div>
              <div className="text-[11px] text-slate-500">
                เปิดบริการ {shops.filter((s) => s.isOpen).length} ร้าน
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>ผู้ใช้งานในระบบ</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{users.length} คน</div>
              <div className="text-[11px] text-purple-600 font-semibold">นักเรียน ครู และแม่ค้า</div>
            </div>
          </div>

          {/* Shop Performance Comparison */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  สถิติเปรียบเทียบยอดขายรายร้านค้า (Shop Sales Breakdown)
                </h3>
                <p className="text-xs text-slate-500">ยอดขายจริงจากการสั่งซื้อผ่าน Sappha PreOrder</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>ส่งออกข้อมูล</span>
              </button>
            </div>

            <div className="space-y-3">
              {shops.map((shop) => {
                const shopOrders = orders.filter((o) => o.shopId === shop.id && o.status !== 'CANCELLED');
                const shopRevenue = shopOrders.reduce((sum, o) => sum + o.subtotal, 0);
                const percent = totalSchoolSales > 0 ? (shopRevenue / totalSchoolSales) * 100 : 0;

                return (
                  <div key={shop.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">
                        {shop.name} <span className="text-slate-400 font-normal">({shop.stallName})</span>
                      </span>
                      <span className="text-slate-900">
                        ฿{shopRevenue.toLocaleString()} ({shopOrders.length} ออเดอร์)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ORDERS AUDIT TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                ระบบตรวจสอบออเดอร์โรงเรียน (Central Order Audit)
              </h3>
              <p className="text-xs text-slate-500">ตรวจสอบทุกคำสั่งซื้อ สลิปโอนเงิน และจัดการข้อพิพาท</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหารหัส / ชื่อผู้สั่ง..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="PENDING_APPROVAL">รอแม่ค้าตรวจสลิป</option>
                <option value="CONFIRMED">ยืนยันแล้ว / รอปรุง</option>
                <option value="READY">พร้อมรับของ</option>
                <option value="COMPLETED">รับแล้ว</option>
                <option value="CANCELLED">ยกเลิกแล้ว</option>
              </select>

              <select
                value={orderShopFilter}
                onChange={(e) => setOrderShopFilter(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">ทุกร้านค้า</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="p-3 font-extrabold">รหัสออเดอร์</th>
                  <th className="p-3 font-extrabold">ร้านค้า &amp; ล็อก</th>
                  <th className="p-3 font-extrabold">ผู้สั่ง</th>
                  <th className="p-3 font-extrabold">ยอดเงิน</th>
                  <th className="p-3 font-extrabold">สลิปโอนเงิน</th>
                  <th className="p-3 font-extrabold">สถานะ</th>
                  <th className="p-3 font-extrabold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      <div>{order.orderCode}</div>
                      <div className="text-[10px] text-slate-400 font-sans">รหัสรับ: #{order.pickupCode4Digits}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{order.shopName}</div>
                      <div className="text-[10px] text-slate-400">{order.stallName}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{order.userName} ({order.userNickname})</div>
                      <div className="text-[10px] text-slate-400">{order.userGradeRoom} • {order.userPhone}</div>
                    </td>
                    <td className="p-3 font-bold text-emerald-600">
                      ฿{order.subtotal}
                    </td>
                    <td className="p-3">
                      {order.paymentSlip?.slipUrl ? (
                        <button
                          onClick={() => setInspectSlipUrl(order.paymentSlip!.slipUrl)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 flex items-center gap-1 hover:bg-blue-100"
                        >
                          <Eye className="w-3 h-3" />
                          <span>ดูสลิป</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'READY'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status === 'PENDING_APPROVAL' && 'รอตรวจสลิป'}
                        {order.status === 'CONFIRMED' && 'ยืนยันแล้ว'}
                        {order.status === 'READY' && 'พร้อมรับ'}
                        {order.status === 'COMPLETED' && 'รับแล้ว'}
                        {order.status === 'CANCELLED' && 'ยกเลิกแล้ว'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`ต้องการยกเลิกออเดอร์ ${order.orderCode} และสั่งคืนเงินหรือไม่?`)) {
                              adminOverrideOrderStatus(order.id, 'CANCELLED', 'แอดมินสั่งยกเลิกเนื่องจากข้อพิพาท');
                            }
                          }}
                          className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold border border-red-200"
                        >
                          ยกเลิก/คืนเงิน
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. USERS MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                รายชื่อผู้ใช้งานในระบบ ({users.length} คน)
              </h3>
              <p className="text-xs text-slate-500">จัดการข้อมูลนักเรียน ครู และผู้ประกอบการโรงอาหาร</p>
            </div>

            {/* Filter Search */}
            <div className="flex items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ / รหัส / ห้อง..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="ALL">ทุกบทบาท</option>
                <option value="STUDENT">นักเรียน</option>
                <option value="TEACHER">ครู / บุคลากร</option>
                <option value="MERCHANT">แม่ค้า</option>
                <option value="ADMIN">ผู้ดูแลระบบ</option>
              </select>
            </div>
          </div>

          {/* User List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="p-3 font-extrabold">ผู้ใช้</th>
                  <th className="p-3 font-extrabold">บทบาท</th>
                  <th className="p-3 font-extrabold">รหัส / ชั้นเรียน</th>
                  <th className="p-3 font-extrabold">เบอร์โทรศัพท์</th>
                  <th className="p-3 font-extrabold">พร้อมเพย์คืนเงิน</th>
                  <th className="p-3 font-extrabold">สถานะ</th>
                  <th className="p-3 font-extrabold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                        {user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.nickname.slice(0, 1)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[10px] text-slate-500">ชื่อเล่น: {user.nickname}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.role === 'STUDENT'
                            ? 'bg-orange-100 text-orange-800'
                            : user.role === 'TEACHER'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'MERCHANT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role === 'STUDENT' && 'นักเรียน'}
                        {user.role === 'TEACHER' && 'ครู/บุคลากร'}
                        {user.role === 'MERCHANT' && 'แม่ค้า'}
                        {user.role === 'ADMIN' && 'แอดมิน'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-700">{user.gradeRoom}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {user.studentId || '-'}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{user.phone}</td>
                    <td className="p-3 font-mono font-bold text-slate-700">
                      {user.promptPayRefund || user.promptPayNumber || '-'}
                    </td>
                    <td className="p-3">
                      {user.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <Check className="w-3.5 h-3.5" /> ใช้งานปกติ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                          <X className="w-3.5 h-3.5" /> ถูกระงับ
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditUserModal(user)}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold transition border bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 flex items-center gap-1 shadow-sm"
                        >
                          <Edit className="w-3 h-3" />
                          <span>แก้ไข</span>
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(user.id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition border ${
                              user.isActive !== false
                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {user.isActive !== false ? 'ระงับบัญชี' : 'ปลดระงับ'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.5 REVIEWS MODERATION TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                ระบบจัดการและตรวจสอบรีวิว ({reviews.length} รีวิว)
              </h3>
              <p className="text-xs text-slate-500">
                ตรวจสอบความคิดเห็นของนักเรียน และลบรีวิวที่ไม่เหมาะสมหรือไม่สุภาพ
              </p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="text-3xl">⭐</div>
              <div className="font-bold text-sm text-slate-700">ยังไม่มีรีวิวในระบบ</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviews.map((rev) => {
                const shop = shops.find((s) => s.id === rev.shopId);
                return (
                  <div key={rev.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {rev.isAnonymous ? '👤 ไม่ระบุตัวตน' : `${rev.userNickname} (${rev.userName})`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {rev.userGradeRoom} • {new Date(rev.createdAt).toLocaleDateString('th-TH')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {rev.rating} ดาว
                        </span>
                      </div>

                      <div className="text-[11px] text-blue-600 font-semibold">
                        ร้าน: {shop?.name || rev.shopId} ({shop?.stallName || '-'})
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium leading-relaxed max-w-2xl">
                        &ldquo;{rev.comment}&rdquo;
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`ต้องการลบรีวิวนี้ของ ${rev.userNickname} หรือไม่?`)) {
                          deleteReview(rev.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 text-[11px] flex items-center gap-1 self-start transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบรีวิวนี้</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MERCHANTS & SUBSCRIPTIONS TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'merchants' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                รายชื่อร้านค้า &amp; จัดการร้าน ({shops.length} ร้าน)
              </h3>
              <p className="text-xs text-slate-500">
                เพิ่มร้านค้าใหม่ กำหนดล็อกโรงอาหาร แก้ไขข้อมูลร้าน สลับเปิด/ปิด และจัดการค่าบริการ 20 บาท
              </p>
            </div>
            <button
              onClick={openCreateShopModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มร้านค้าใหม่</span>
            </button>
          </div>

          {/* Pending Approval Section */}
          {shops.filter((s) => !s.isApproved).length > 0 && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>คำขอลงทะเบียนเปิดร้านค้าใหม่ รอการอนุมัติ ({shops.filter((s) => !s.isApproved).length} ร้าน)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shops
                  .filter((s) => !s.isApproved)
                  .map((pendingShop) => (
                    <div
                      key={pendingShop.id}
                      className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{pendingShop.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {pendingShop.stallName} • {pendingShop.ownerName} ({pendingShop.phone})
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => approveShop(pendingShop.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-[11px] shadow-sm hover:bg-emerald-700"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`ต้องการปฏิเสธคำขอเปิดร้าน ${pendingShop.name} หรือไม่?`)) {
                              deleteShop(pendingShop.id);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-[11px] hover:bg-red-50 hover:text-red-600"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Shop List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shops.map((shop) => {
              const expiresDate = new Date(shop.subscriptionExpiresAt);
              const isExpired = expiresDate.getTime() < Date.now();

              return (
                <div
                  key={shop.id}
                  className={`p-5 rounded-3xl border transition-all space-y-4 ${
                    shop.isOpen
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200/80 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900">{shop.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              shop.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {shop.isOpen ? '🟢 เปิดรับ' : '🔴 ปิดร้าน'}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 font-semibold mt-0.5">{shop.stallName}</div>
                        <div className="text-[10px] text-slate-400">
                          เจ้าของ: {shop.ownerName} • โทร {shop.phone} • พร้อมเพย์ {shop.promptPayNo}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          เวลาตัดรอบ: <strong>{shop.cutoffTime || '20:00'} น.</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Toggle Open/Closed switch */}
                      <button
                        onClick={() => toggleShopOpen(shop.id)}
                        title={shop.isOpen ? 'คลิกเพื่อปิดร้านชั่วคราว' : 'คลิกเพื่อเปิดร้าน'}
                        className={`p-2 rounded-xl border transition ${
                          shop.isOpen
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      {/* Edit Shop Button */}
                      <button
                        onClick={() => openEditShopModal(shop)}
                        title="แก้ไขข้อมูลร้านค้า"
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Shop Button */}
                      <button
                        onClick={() => {
                          if (window.confirm(`ต้องการลบร้าน ${shop.name} ออกจากระบบถาวรหรือไม่? เมนูอาหารทั้งหมดของร้านจะถูกลบไปด้วย`)) {
                            deleteShop(shop.id);
                          }
                        }}
                        title="ลบร้านค้านี้"
                        className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Fees & Subscriptions */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                      <div className="text-slate-400 text-[10px] font-bold">ค่าแรกเข้า (20฿)</div>
                      {shop.registrationFeePaid ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ชำระแล้ว
                        </span>
                      ) : (
                        <button
                          onClick={() => recordFeePayment(shop.id, 'REGISTRATION')}
                          className="text-blue-600 hover:underline font-bold"
                        >
                          + บันทึกชำระ 20฿
                        </button>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                      <div className="text-slate-400 text-[10px] font-bold">รายเดือน (20฿/ด.)</div>
                      <div className={`font-bold ${isExpired ? 'text-red-600' : 'text-slate-800'}`}>
                        หมดอายุ: {expiresDate.toLocaleDateString('th-TH')}
                      </div>
                      <button
                        onClick={() => recordFeePayment(shop.id, 'MONTHLY', 1)}
                        className="text-blue-600 hover:underline font-bold text-[10px]"
                      >
                        + ต่ออายุ 1 เดือน (20฿)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STALLS TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'stalls' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              ล็อกโรงอาหารทั้งหมด ({stalls.length} จุด)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stalls.map((stall) => (
                <div key={stall.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-mono font-bold text-[10px]">
                      {stall.code}
                    </span>
                    <div className="font-bold text-xs text-slate-900 mt-1">{stall.name}</div>
                    <div className="text-[10px] text-slate-500">{stall.description}</div>
                  </div>
                  <button
                    onClick={() => deleteStall(stall.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Stall Form */}
          <form onSubmit={handleAddStall} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>เพิ่มล็อกโรงอาหารใหม่</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">รหัสล็อก (Code):</label>
                <input
                  type="text"
                  placeholder="เช่น STALL-09"
                  value={newStallCode}
                  onChange={(e) => setNewStallCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อล็อก (Name):</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ล็อก 9 (โซนของหวาน)"
                  value={newStallName}
                  onChange={(e) => setNewStallName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">รายละเอียดตำแหน่ง:</label>
                <input
                  type="text"
                  placeholder="เช่น ติดกับทางออกเสาธง"
                  value={newStallDesc}
                  onChange={(e) => setNewStallDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              บันทึกจุดรับอาหารใหม่
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. HOLIDAYS TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'holidays' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              ปฏิทินวันหยุดโรงเรียน &amp; วันงดสั่งซื้อ ({holidays.length} วัน)
            </h3>
            <div className="divide-y divide-slate-100">
              {holidays.map((h) => (
                <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{h.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">วันที่: {h.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-700 font-bold rounded-full text-[10px]">
                      🔒 สั่งอาหารไม่ได้
                    </span>
                    <button
                      onClick={() => deleteHoliday(h.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Holiday Form */}
          <form onSubmit={handleAddHoliday} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>เพิ่มวันหยุดโรงเรียน</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">วันที่งดสั่งซื้อ:</label>
                <input
                  type="date"
                  required
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อวันหยุด / เหตุผล:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น วันหยุดวันพ่อแห่งชาติ / วันสอบกลางภาค"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              ล็อกวันหยุดในระบบ
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ANNOUNCEMENTS TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              แบนเนอร์ข่าวสารหน้าแรก ({announcements.length} รายการ)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                  <div className="h-28 w-full bg-slate-200 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 text-xs">
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-700 font-bold rounded-md text-[10px]">
                      {ann.badgeText}
                    </span>
                    <div className="font-bold text-slate-900 mt-1">{ann.title}</div>
                    <div className="text-[10px] text-slate-500">{ann.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Announcement Form */}
          <form onSubmit={handleAddAnnouncement} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>เพิ่มแบนเนอร์ประชาสัมพันธ์</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">หัวข้อข่าว:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สั่งอาหารล่วงหน้ารับส่วนลด 5 บาท"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">คำอธิบายย่อย:</label>
                <input
                  type="text"
                  placeholder="เช่น สิทธิพิเศษสำหรับนักเรียนโรงเรียนสรรพวิทยาคม"
                  value={newAnnSubtitle}
                  onChange={(e) => setNewAnnSubtitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">ป้ายกำกับ (Badge):</label>
                <input
                  type="text"
                  placeholder="เช่น โปรโมชั่น / ประชาสัมพันธ์"
                  value={newAnnBadge}
                  onChange={(e) => setNewAnnBadge(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">URL รูปภาพแบนเนอร์:</label>
                <input
                  type="url"
                  required
                  value={newAnnImage}
                  onChange={(e) => setNewAnnImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              เผยแพร่แบนเนอร์หน้าแรก
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SYSTEM SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'settings' && (
        <div className="max-w-3xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>ตั้งค่าระบบกลางโรงเรียน (School Global Settings)</span>
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดเวลาเปิด-ปิดรับออเดอร์กลาง, ช่วงเวลารับอาหารเช้า และประกาศข้อความด่วน
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  เวลาเปิดรับออเดอร์กลาง:
                </label>
                <input
                  type="time"
                  value={settingsOpenTime}
                  onChange={(e) => setSettingsOpenTime(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  เวลาปิดรับออเดอร์กลาง (Cutoff Time):
                </label>
                <input
                  type="time"
                  value={settingsCutoffTime}
                  onChange={(e) => setSettingsCutoffTime(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                ช่วงเวลารับอาหารตอนเช้า (แสดงบนตั๋ว):
              </label>
              <input
                type="text"
                value={settingsPickupWindow}
                onChange={(e) => setSettingsPickupWindow(e.target.value)}
                placeholder="เช่น 06:45 - 07:45 น."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                <Megaphone className="w-3.5 h-3.5 text-red-500" />
                ข้อความประกาศด่วนตัววิ่ง (Emergency Broadcast):
              </label>
              <input
                type="text"
                value={settingsBroadcast}
                onChange={(e) => setSettingsBroadcast(e.target.value)}
                placeholder="เช่น แจ้งเตือน: พรุ่งนี้มีกิจกรรมวันไหว้ครู โรงอาหารเปิดรับของตามปกติ"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">โหมดปิดปรับปรุงระบบชั่วคราว (Maintenance Mode)</div>
                <div className="text-[11px] text-slate-500">หากเปิดใช้งาน นักเรียนจะไม่สามารถกดสั่งอาหารได้</div>
              </div>
              <input
                type="checkbox"
                checked={settingsMaintenance}
                onChange={(e) => setSettingsMaintenance(e.target.checked)}
                className="w-5 h-5 rounded accent-red-600 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 transition-all"
            >
              บันทึกการตั้งค่าระบบกลาง
            </button>
          </form>

          {/* Cloud Database (Supabase) Sync Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>ฐานข้อมูลคลาวด์ (Supabase Cloud Database)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  สถานะการเชื่อมต่อ: <strong className="text-emerald-600">เชื่อมต่อเรียลไทม์ 100% 🟢 (difbkxcxwlrnrbwfkbva.supabase.co)</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const { checkSupabaseConnection } = await import('@/lib/supabaseSync');
                  showToast('info', 'กำลังตรวจสอบ...', 'กำลังทดสอบการเชื่อมต่อกับ Supabase Cloud');
                  const res = await checkSupabaseConnection();
                  if (res.success) {
                    showToast('success', 'เชื่อมต่อสำเร็จ! ⚡', res.message);
                  } else {
                    showToast('error', 'การเชื่อมต่อขัดข้อง', res.message);
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ทดสอบ Supabase</span>
              </button>
            </div>

            {/* Google Drive Status Section */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>📁 พื้นที่เก็บรูปภาพ (Google Drive Cloud Storage)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  สำหรับเก็บสลิปโอนเงิน รูปเมนูอาหาร และภาพหน้าร้านค้าเข้าโฟลเดอร์ Google Drive
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  showToast('info', 'กำลังทดสอบไดรฟ์...', 'ส่งรูปทดสอบไปยัง Google Drive API');
                  try {
                    const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                    const res = await fetch('/api/drive/upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        base64Data: testBase64,
                        fileName: `test_ping_${Date.now().toString().slice(-6)}.png`,
                        shopName: 'ส่วนกลางโรงเรียน',
                        category: 'ทดสอบระบบ',
                        includeDate: false,
                      }),
                    });
                    const data = await res.json();
                    if (data.fileId) {
                      showToast('success', 'Google Drive พร้อมใช้งาน! 📁', `อัปโหลดสำเร็จ: ${data.folderPath || 'ส่วนกลางโรงเรียน / ทดสอบระบบ'}`);
                    } else {
                      showToast('info', 'สถานะ Google Drive', data.message || 'ระบบพร้อมรับรูปภาพ (Fallback Mode)');
                    }
                  } catch (e: any) {
                    showToast('error', 'ทดสอบไม่สำเร็จ', e?.message || 'เชื่อมต่อ API ไม่สำเร็จ');
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>ทดสอบ Google Drive API</span>
              </button>
            </div>

            {/* LINE Messaging API Status Section */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>🔔 ระบบแจ้งเตือน (LINE Push Messaging API)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  ส่งการ์ด Flex Message แจ้งเตือนออเดอร์ใหม่เข้า LINE แม่ค้า และแจ้งตั๋วอาหารเข้า LINE นักเรียน
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  showToast('info', 'กำลังส่งการแจ้งเตือน...', 'ทดสอบยิง LINE Flex Message เข้าบัญชีของคุณ');
                  try {
                    const res = await fetch('/api/notify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'TEST',
                        targetLineUserId: currentUser.lineUserId || currentUser.id,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      showToast('success', 'ส่งการแจ้งเตือนสำเร็จ! 🔔', data.message || 'ส่ง Flex Message เข้า LINE เรียบร้อย');
                    } else {
                      showToast('info', 'สถานะ LINE Notification', data.message || 'ระบบพร้อมใช้งาน');
                    }
                  } catch (e: any) {
                    showToast('error', 'ทดสอบไม่สำเร็จ', e?.message || 'เชื่อมต่อ API ไม่สำเร็จ');
                  }
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>ทดสอบ LINE แจ้งเตือน</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. FEES HISTORY TAB */}
      {/* ========================================================================= */}
      {activeAdminTab === 'fees' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                ประวัติการรับชำระค่าธรรมเนียมโรงอาหาร ({feeRecords.length} รายการ)
              </h3>
              <p className="text-xs text-slate-500">บันทึกยอดเงินค่าแรกเข้าและค่าบริการรายเดือนเข้ากองทุนโรงเรียน</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">ยอดสะสม:</span>
              <div className="text-lg font-black text-emerald-600">฿{totalFeeCollected.toLocaleString()}</div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {feeRecords.map((fee) => (
              <div key={fee.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{fee.shopName}</div>
                  <div className="text-[10px] text-slate-500">{fee.note}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(fee.paidAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-emerald-600 text-sm">+฿{fee.amount}</span>
                  <div className="text-[10px] text-slate-400 font-medium">บันทึกแล้ว</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Slip Zoom Modal */}
      {inspectSlipUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setInspectSlipUrl(null)}
        >
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-900">สลิปการโอนเงิน (PromptPay Slip)</h4>
              <button onClick={() => setInspectSlipUrl(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inspectSlipUrl} alt="slip inspect" className="w-full object-contain" />
            </div>
            <button
              onClick={() => setInspectSlipUrl(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
      {/* Create / Edit Shop Modal */}
      {isShopModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsShopModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl p-6 sm:p-8 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingShopId ? 'แก้ไขข้อมูลร้านค้า' : 'เพิ่มร้านค้าใหม่ (โรงอาหารสรรพวิทยาคม)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingShopId ? 'ปรับปรุงข้อมูล ล็อก หรือเวลาตัดรอบ' : 'กรอกข้อมูลร้านค้าและผูกบัญชีแม่ค้า'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShopModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShop} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ชื่อร้านค้า <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ร้านข้าวมันไก่ &amp; ข้าวหมูกรอบ ป้าณี"
                  value={shopFormName}
                  onChange={(e) => setShopFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ล็อกโรงอาหาร <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={shopFormStallName}
                    onChange={(e) => setShopFormStallName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {stalls.map((stall) => (
                      <option key={stall.id} value={stall.name}>
                        {stall.code} - {stall.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    เวลาตัดรอบสั่งอาหาร (Cutoff Time):
                  </label>
                  <input
                    type="time"
                    required
                    value={shopFormCutoff}
                    onChange={(e) => setShopFormCutoff(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">คำอธิบายร้านค้า / จุดเด่น:</label>
                <textarea
                  rows={2}
                  placeholder="เช่น ไก่ตอนเนื้อนุ่มสูตรโบราณ น้ำจิ้มรสเด็ด น้ำซุปร้อนๆ..."
                  value={shopFormDesc}
                  onChange={(e) => setShopFormDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ชื่อเจ้าของร้าน <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ป้าณี"
                    value={shopFormOwnerName}
                    onChange={(e) => setShopFormOwnerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081-987-6543"
                    value={shopFormPhone}
                    onChange={(e) => setShopFormPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    เบอร์พร้อมเพย์รับเงิน <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0819876543"
                    value={shopFormPromptPay}
                    onChange={(e) => setShopFormPromptPay(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ผูกกับบัญชีผู้ใช้แม่ค้า (Bind User Account):
                </label>
                <select
                  value={shopFormBindUserId}
                  onChange={(e) => setShopFormBindUserId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                >
                  <option value="">-- ไม่ผูกบัญชี (สร้างเฉพาะร้านค้า) --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.nickname}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">URL รูปภาพหน้าร้าน (Logo / Image):</label>
                  <input
                    type="url"
                    required
                    value={shopFormImage}
                    onChange={(e) => setShopFormImage(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">URL รูปแบนเนอร์ (Hero Banner):</label>
                  <input
                    type="url"
                    required
                    value={shopFormBanner}
                    onChange={(e) => setShopFormBanner(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">เปิดรับออเดอร์ทันที (Open for orders):</span>
                  <input
                    type="checkbox"
                    checked={shopFormIsOpen}
                    onChange={(e) => setShopFormIsOpen(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">อนุมัติร้านค้านี้แล้ว (Approved):</span>
                  <input
                    type="checkbox"
                    checked={shopFormIsApproved}
                    onChange={(e) => setShopFormIsApproved(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">ชำระค่าแรกเข้า 20 บาทเรียบร้อย:</span>
                  <input
                    type="checkbox"
                    checked={shopFormRegFeePaid}
                    onChange={(e) => setShopFormRegFeePaid(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition"
                >
                  {editingShopId ? 'บันทึกการแก้ไขร้านค้า' : 'ยืนยันเพิ่มร้านค้าใหม่'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsShopModalOpen(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT USER / STUDENT MODAL (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isUserEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-sm">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    แก้ไขข้อมูลผู้ใช้งาน
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {editingUser.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
              {/* Student ID Lookup */}
              <div className="space-y-1.5 p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl">
                <label className="font-extrabold text-slate-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-brand-700">
                    <Hash className="w-4 h-4 text-brand-600" />
                    <span>เลขประจำตัวนักเรียน (5 หลัก)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (editStudentId.length >= 4) {
                        import('@/lib/studentsLookup').then(({ findStudentById }) => {
                          const res = findStudentById(editStudentId);
                          if (res.found && res.student) {
                            setEditFullName(res.student.fullName);
                            setEditGradeRoom(res.student.gradeRoom);
                            showToast('success', 'ดึงข้อมูลทะเบียนสำเร็จ 🎓', `${res.student.fullName} (${res.student.gradeRoom})`);
                          } else {
                            showToast('error', 'ไม่พบข้อมูล', 'ไม่พบรหัสนักเรียนนี้ในฐานข้อมูล 2,906 คน');
                          }
                        });
                      }
                    }}
                    className="text-[10px] text-brand-700 bg-white hover:bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200 font-bold transition flex items-center gap-1"
                  >
                    <span>ดึงชื่อ/ห้องอัตโนมัติ ⚡</span>
                  </button>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="เช่น 34890 หรือ 31774"
                  className="w-full p-2.5 bg-white border border-orange-300 rounded-xl font-mono font-bold text-brand-700 focus:ring-2 focus:ring-brand-500 shadow-sm"
                />
              </div>

              {/* Full Name & Grade Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ชื่อ-นามสกุลจริง <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="เช่น นายสมชาย ใจดี"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ระดับชั้น / ห้อง / กลุ่มสาระ <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={editGradeRoom}
                    onChange={(e) => setEditGradeRoom(e.target.value)}
                    placeholder="เช่น ม.5/2"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Nickname & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ชื่อเล่น (เรียกรับอาหาร) <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="เช่น ก้อง"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Role & PromptPay */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    บทบาทการใช้งาน (Role):
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="STUDENT">นักเรียน (STUDENT)</option>
                    <option value="TEACHER">ครู / บุคลากร (TEACHER)</option>
                    <option value="MERCHANT">แม่ค้า / พ่อค้า (MERCHANT)</option>
                    <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    พร้อมเพย์คืนเงิน (PromptPay):
                  </label>
                  <input
                    type="text"
                    value={editPromptPayRefund}
                    onChange={(e) => setEditPromptPayRefund(e.target.value)}
                    placeholder="0812345678"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status toggle */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">สถานะการใช้งาน (Active):</span>
                  <span className="text-[10px] text-slate-500">หากปิด บัญชีจะถูกระงับการสั่งซื้อชั่วคราว</span>
                </div>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกการแก้ไขข้อมูลผู้ใช้</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUserEditModalOpen(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
