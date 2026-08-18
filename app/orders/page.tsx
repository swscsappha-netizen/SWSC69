'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import TicketCard from '@/components/TicketCard';
import ReviewModal from '@/components/ReviewModal';
import { Order } from '@/types';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export default function OrdersPage() {
  const { orders, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [simulateLate, setSimulateLate] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);

  // Filter orders for current user or all mock orders
  const userOrders = orders;

  const activeOrders = userOrders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );
  const historyOrders = userOrders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'CANCELLED'
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Page Title & Simulator Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ตั๋วรับอาหารของฉัน (My Tickets)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            นำตั๋วนี้ไปยื่นรับอาหารที่หน้าร้านในโรงอาหารสรรพวิทยาคม (06:45 - 07:45 น.)
          </p>
        </div>

        {/* Simulation button for testing late notification */}
        <button
          onClick={() => setSimulateLate(!simulateLate)}
          className={`self-start sm:self-auto px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            simulateLate
              ? 'bg-red-50 text-red-700 border-red-300 shadow-sm'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{simulateLate ? '🔴 จำลอง: เลยเวลา 07:45 น. (เปิดอยู่)' : '⏱️ ทดสอบจำลองเลยเวลารับ'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'active'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ตั๋วรอรับวันพรุ่งนี้ ({activeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>ประวัติย้อนหลัง ({historyOrders.length})</span>
        </button>
      </div>

      {/* List of Tickets */}
      {displayedOrders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <div className="font-bold text-slate-700 text-base">
              {activeTab === 'active' ? 'ไม่มีตั๋วรับอาหารที่กำลังรอรับ' : 'ไม่มีประวัติคำสั่งซื้อ'}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'active'
                ? 'คุณสามารถเลือกสั่งอาหารจากโรงอาหารสรรพวิทยาคมล่วงหน้าได้เลยตอนนี้!'
                : 'เมื่อคุณรับอาหารเรียบร้อยแล้ว รายการจะถูกบันทึกไว้ที่นี่'}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all"
          >
            <span>ไปสั่งอาหารที่ตลาดโรงอาหาร</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map((order) => (
            <TicketCard
              key={order.id}
              order={{ ...order, isUrgentLate: simulateLate || order.isUrgentLate }}
              showFullDetails={true}
              onOpenReview={(o) => setReviewingOrder(o)}
            />
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingOrder && (
        <ReviewModal
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
        />
      )}
    </div>
  );
}
