'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingCartBar() {
  const { cartTotalItems, cartTotalPrice } = useApp();

  if (cartTotalItems === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-0 right-0 z-30 px-4 max-w-lg mx-auto pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="pointer-events-auto"
        >
          <Link
            href="/cart"
            className="w-full bg-[#10789f] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 border-[#0d6282] flex items-center justify-between hover:bg-[#0d6282] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e3193b] flex items-center justify-center text-white shadow-md relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[#e3193b] text-[11px] font-black flex items-center justify-center shadow-sm">
                  {cartTotalItems}
                </span>
              </div>
              <div>
                <div className="text-[11px] text-[#d7eff6] font-medium tracking-wide uppercase">ตะกร้าของคุณ</div>
                <div className="text-sm font-bold text-white tracking-tight">
                  {cartTotalItems} รายการ • <span className="font-black text-amber-300">฿{cartTotalPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold font-condensed uppercase tracking-wider bg-[#e3193b] hover:bg-[#cc1433] text-white px-4 py-2.5 rounded-xl transition-all shadow-md group-hover:translate-x-0.5">
              <span>ไปชำระเงิน</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
