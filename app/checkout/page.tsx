'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  UploadCloud,
  Store,
  MapPin,
  User,
  ShieldCheck,
  CreditCard,
  Check,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    currentUser,
    shops,
    createOrders,
    updateUserProfile,
    showToast,
  } = useApp();

  // Student profile form states
  const [name, setName] = useState(currentUser.name);
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [studentId, setStudentId] = useState(currentUser.studentId);
  const [gradeRoom, setGradeRoom] = useState(currentUser.gradeRoom);
  const [phone, setPhone] = useState(currentUser.phone);

  // Slips per shop state: Record<shopId, base64 dataUrl>
  const [slips, setSlips] = useState<Record<string, string>>({});
  const [copiedShopId, setCopiedShopId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart.length, router]);

  if (cart.length === 0) {
    return null;
  }

  // Group cart by shop
  const groupedByShop = cart.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      const shopInfo = shops.find((s) => s.id === item.shopId);
      acc[item.shopId] = {
        shopId: item.shopId,
        shopName: item.shopName,
        stallName: item.stallName,
        promptPayNo: shopInfo?.promptPayNo || '0819876543',
        promptPayName: shopInfo?.promptPayName || shopInfo?.ownerName || 'ร้านค้า',
        items: [],
        subtotal: 0,
      };
    }
    acc[item.shopId].items.push(item);
    acc[item.shopId].subtotal += item.unitPrice * item.quantity;
    return acc;
  }, {} as Record<string, { shopId: string; shopName: string; stallName: string; promptPayNo: string; promptPayName: string; items: typeof cart; subtotal: number }>);

  const shopGroups = Object.values(groupedByShop);
  const totalAmount = shopGroups.reduce((sum, g) => sum + g.subtotal, 0);

  const handleCopyPromptPay = (shopId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedShopId(shopId);
    showToast('info', 'คัดลอกแล้ว', `คัดลอกเลขพร้อมเพย์ ${text} สำเร็จ`);
    setTimeout(() => setCopiedShopId(null), 2500);
  };

  const handleSlipUpload = async (shopId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const targetShop = shops.find((s) => s.id === shopId);
      const shopName = targetShop?.name || 'ร้านค้าโรงอาหาร';
      showToast('info', 'กำลังอัปโหลดสลิป...', `กำลังส่งสลิปไปยัง Google Drive: ${shopName}`);
      const { uploadImage } = await import('@/lib/uploadHelper');
      const timestamp = Date.now().toString().slice(-6);
      const res = await uploadImage(file, `slip_${shopId.slice(0, 8)}_${timestamp}.jpg`, {
        shopName,
        category: 'สลิปชำระเงิน',
        includeDate: true,
      });
      setSlips((prev) => ({
        ...prev,
        [shopId]: res.fileUrl,
      }));
      showToast('success', 'แนบสลิปเรียบร้อย 📄', res.message);
    }
  };

  const handleSubmitOrders = () => {
    // Validate profile fields
    if (!name.trim() || !nickname.trim() || !gradeRoom.trim() || !phone.trim()) {
      showToast('error', 'กรุณากรอกข้อมูลให้ครบ', 'โปรดตรวจสอบชื่อ ชั้นเรียน และเบอร์โทรศัพท์');
      return;
    }

    // Save profile updates
    updateUserProfile({
      name,
      nickname,
      studentId,
      gradeRoom,
      phone,
      promptPayNumber: phone.replace(/[^0-9]/g, ''),
    });

    setIsSubmitting(true);

    // Prepare shop orders
    const shopOrdersPayload = shopGroups.map((g) => ({
      shopId: g.shopId,
      shopName: g.shopName,
      stallName: g.stallName,
      items: g.items,
      subtotal: g.subtotal,
      slipUrl:
        slips[g.shopId] ||
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    }));

    const created = createOrders(shopOrdersPayload);

    // Send Minimalist Receipt Flex Message to LINE Chat
    import('@/lib/liff').then(({ sendReceiptToLineChat }) => {
      created.forEach((ord) => {
        sendReceiptToLineChat(ord);
      });
    }).catch(() => {});

    // Trigger celebration confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    showToast('success', 'สั่งซื้อสำเร็จ 🎉', `สร้างตั๋วรับอาหารเรียบร้อยแล้ว (${created.length} ร้าน)`);

    setTimeout(() => {
      router.push('/orders');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ชำระเงินและแนบสลิป (Split Checkout)
          </h1>
          <p className="text-xs text-slate-500">
            โอนจ่ายตรงตาม PromptPay ของแต่ละร้านค้า และแนบสลิปเพื่อยืนยันออเดอร์
          </p>
        </div>
      </div>

      {/* Step 1: Customer Profile Details */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            ข้อมูลผู้สั่งอาหาร (สำหรับเรียกรับหน้าร้าน)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
              <span>ชื่อ-นามสกุลจริง:</span>
              <span className="text-[10px] text-emerald-700 font-bold">🔒 ทะเบียนทางการ</span>
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={name}
              className="w-full p-3 bg-slate-100/90 text-slate-700 border border-slate-300 rounded-xl cursor-not-allowed font-medium"
              placeholder="ชื่อ-นามสกุลจริง"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              ชื่อเล่น (สำหรับเรียกรับอาหาร) <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 font-bold"
              placeholder="เช่น ก้อง"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
              <span>ระดับชั้น / ห้องเรียน:</span>
              <span className="text-[10px] text-emerald-700 font-bold">🔒 ล็อค</span>
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={gradeRoom}
              className="w-full p-3 bg-slate-100/90 text-slate-700 border border-slate-300 rounded-xl cursor-not-allowed font-bold"
              placeholder="เช่น ม.5/2"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
              <span>รหัสนักเรียน (5 หลัก):</span>
              <span className="text-[10px] text-emerald-700 font-bold">🔒 ล็อคถาวร</span>
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={studentId}
              className="w-full p-3 bg-slate-100/90 text-slate-700 border border-slate-300 rounded-xl cursor-not-allowed font-mono font-bold tracking-wider"
              placeholder="เช่น 34890"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-slate-700 block mb-1">
              เบอร์โทรศัพท์ / พร้อมเพย์ (สำหรับรับเงินคืนกรณีของหมด) <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 font-mono font-bold"
              placeholder="เช่น 089-123-4567"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Split Shop Payment Cards */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">
            โอนเงินชำระและแนบสลิปแยกตามร้านค้า ({shopGroups.length} ร้านค้า)
          </h2>
        </div>

        {shopGroups.map((group, index) => {
          const hasSlip = !!slips[group.shopId];

          return (
            <div
              key={group.shopId}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden"
            >
              {/* Shop Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">{group.shopName}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      <span>{group.stallName}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">ยอดที่ต้องโอน</div>
                  <div className="text-xl sm:text-2xl font-black text-brand-400">
                    ฿{group.subtotal}
                  </div>
                </div>
              </div>

              {/* Payment Content */}
              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left: PromptPay QR and Details */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                    <QRCodeSVG
                      value={`PROMPTPAY:${group.promptPayNo}:${group.subtotal}`}
                      size={150}
                      level="H"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-800 text-sm">{group.promptPayName}</div>
                    <div className="text-slate-500">พร้อมเพย์: {group.promptPayNo}</div>
                    <div className="text-slate-500">
                      รายการ: {group.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyPromptPay(group.shopId, group.promptPayNo)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    {copiedShopId === group.shopId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกเลขพร้อมเพย์</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right: Slip Upload Dropzone */}
                <div className="space-y-3">
                  <label className="font-bold text-xs text-slate-700 block">
                    แนบรูปภาพสลิปโอนเงิน (ยอด ฿{group.subtotal}):
                  </label>

                  <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    hasSlip
                      ? 'border-emerald-400 bg-emerald-50/50'
                      : 'border-slate-300 hover:border-brand-400 bg-slate-50 hover:bg-orange-50/30'
                  }`}>
                    {hasSlip ? (
                      <div className="text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <div className="text-xs font-bold text-emerald-800">
                          แนบสลิปโอนเงินแล้ว ✅
                        </div>
                        <div className="h-20 w-20 mx-auto rounded-xl overflow-hidden border border-emerald-300 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slips[group.shopId]} alt="Slip" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] text-emerald-700 underline font-medium block">
                          คลิกเพื่อเปลี่ยนรูปสลิป
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1.5">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                        <div className="text-xs font-bold text-slate-700">
                          คลิกหรือลากรูปสลิปมาวางที่นี่
                        </div>
                        <p className="text-[11px] text-slate-400">
                          รองรับไฟล์ JPG, PNG (สามารถแคปหน้าจอโอนมาแนบได้)
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSlipUpload(group.shopId, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Total & Final Confirm Button */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xl space-y-4">
        <div className="flex justify-between items-center text-slate-700">
          <div>
            <div className="text-xs text-slate-400 font-medium">ยอดชำระรวมทั้งหมด</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ฿{totalAmount}
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>รับสินค้า: <strong>พรุ่งนี้เช้า 06:45 - 07:45 น.</strong></div>
            <div>โรงเรียนสรรพวิทยาคม</div>
          </div>
        </div>

        <button
          onClick={handleSubmitOrders}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-orange-500 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white font-extrabold text-base shadow-xl shadow-brand-500/25 hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>กำลังบันทึกออเดอร์...</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>ยืนยันการสั่งซื้อและสร้างตั๋วรับอาหาร</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
