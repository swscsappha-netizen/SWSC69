'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order } from '@/types';
import { Star, X, Sparkles, Shield, User, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewModalProps {
  order: Order;
  onClose: () => void;
}

const RATING_LABELS: Record<number, { emoji: string; text: string; color: string }> = {
  1: { emoji: '😞', text: 'ควรปรับปรุง', color: 'text-red-500' },
  2: { emoji: '😐', text: 'พอใช้ได้', color: 'text-amber-500' },
  3: { emoji: '🙂', text: 'รสชาติปานกลาง', color: 'text-yellow-600' },
  4: { emoji: '😋', text: 'อร่อยดี แนะนำ!', color: 'text-emerald-500' },
  5: { emoji: '🤩', text: 'อร่อยมากกก ฟินสุดๆ!', color: 'text-amber-500 font-extrabold' },
};

export default function ReviewModal({ order, onClose }: ReviewModalProps) {
  const { currentUser, addReview } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const activeRating = hoverRating || rating;
  const ratingInfo = RATING_LABELS[activeRating] || RATING_LABELS[5];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;
    setSubmitting(true);

    addReview({
      orderId: order.id,
      shopId: order.shopId,
      userId: currentUser.id,
      userName: isAnonymous ? 'นักเรียนสรรพวิทยาคม' : currentUser.name,
      userNickname: isAnonymous ? 'ไม่ระบุตัวตน' : currentUser.nickname,
      userGradeRoom: isAnonymous ? currentUser.gradeRoom.split('/')[0] || 'ม.ปลาย' : currentUser.gradeRoom,
      rating,
      comment: comment.trim() || 'อาหารอร่อย สดใหม่ บริการรวดเร็วครับ 👍',
      isAnonymous,
    });

    // Fire celebratory confetti!
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-500 via-amber-500 to-orange-500 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white text-amber-500 flex items-center justify-center shadow-lg mb-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-black text-xl text-white tracking-tight">ให้คะแนนความอร่อย ⭐</h3>
          <p className="text-xs text-amber-100 mt-0.5">
            {order.shopName} ({order.stallName})
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Star Rating Interactive Selector */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-125 active:scale-95 transition-transform group focus:outline-none"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= activeRating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-slate-200 hover:text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Dynamic Emotion Label */}
            <div className="h-6 flex items-center justify-center gap-1.5 text-sm font-bold">
              <span className="text-lg">{ratingInfo.emoji}</span>
              <span className={ratingInfo.color}>{ratingInfo.text}</span>
            </div>
          </div>

          {/* Ordered Items Preview */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              เมนูที่สั่งในออเดอร์นี้:
            </div>
            <div className="font-semibold text-slate-700">
              {order.items.map((i) => i.productName).join(', ')}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              เขียนรีวิวหรือข้อความถึงแม่ค้า (ไม่บังคับ):
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="เช่น ไก่นุ่มมาก น้ำจิ้มเด็ด แตงกวากรอบสด ให้เยอะอิ่มคุ้มราคามากครับ..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition resize-none text-xs"
            />
          </div>

          {/* Anonymous Option */}
          <label className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 cursor-pointer transition">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                {isAnonymous ? <Shield className="w-3.5 h-3.5 text-slate-700" /> : <User className="w-3.5 h-3.5 text-slate-700" />}
              </div>
              <div>
                <div className="font-bold text-slate-900">รีวิวแบบไม่ระบุตัวตน (Anonymous)</div>
                <div className="text-[10px] text-slate-500">
                  {isAnonymous ? 'ซ่อนชื่อจริง แสดงเฉพาะ "ไม่ระบุตัวตน"' : `แสดงชื่อ: ${currentUser.nickname} (${currentUser.gradeRoom})`}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
            />
          </label>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition"
            >
              ไว้ทีหลัง
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 text-white font-extrabold rounded-2xl shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'กำลังส่ง...' : 'ส่งรีวิว ⭐'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
