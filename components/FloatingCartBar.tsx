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
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          className="pointer-events-auto"
        >
          <Link
            href="/cart"
            className="w-full bg-[#451400] text-white p-3.5 sm:p-4 rounded-xs shadow-2xl border border-[#000000] flex items-center justify-between hover:bg-[#52200c] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xs bg-[#b68207] flex items-center justify-center text-white shadow-xs relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-xs bg-white text-[#451400] text-[11px] font-black flex items-center justify-center shadow-xs">
                  {cartTotalItems}
                </span>
              </div>
              <div>
                <div className="text-[11px] text-[#dec2b4] font-bold tracking-wider uppercase">รายการสั่งซื้อของคุณ</div>
                <div className="text-sm font-bold text-white tracking-tight">
                  {cartTotalItems} รายการ • <span className="font-black text-[#facc15]">฿{cartTotalPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-[#b68207] hover:bg-[#976500] text-white px-4 py-2.5 rounded-xs transition-all shadow-xs group-hover:translate-x-0.5 font-black">
              <span>ไปชำระเงิน</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
