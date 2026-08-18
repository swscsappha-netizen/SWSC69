'use client';

import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import MenuForm from '@/components/MenuForm';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function EditMenuPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { products, currentUser } = useApp();

  const product = products.find((p) => p.id === id);
  const shopId = currentUser.shopId || 'shop_1';

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h1 className="text-xl font-black text-slate-900">ไม่พบเมนูที่ต้องการแก้ไข</h1>
        <p className="text-xs text-slate-500">เมนูนี้อาจถูกลบไปแล้ว หรือ ID ไม่ถูกต้อง (ID: {id})</p>
        <Link
          href="/merchant/menu"
          className="inline-block mt-2 px-6 py-3 bg-brand-500 text-white text-xs font-bold rounded-2xl shadow-md"
        >
          กลับไปจัดการเมนู
        </Link>
      </div>
    );
  }

  return <MenuForm mode="edit" shopId={shopId} initialProduct={product} />;
}
