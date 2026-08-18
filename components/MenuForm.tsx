'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Product, OptionGroup, OptionItem } from '@/types';
import { Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES: { value: Product['category']; label: string; emoji: string }[] = [
  { value: 'rice', label: 'ข้าว/อาหารจานหลัก', emoji: '🍚' },
  { value: 'noodle', label: 'ก๋วยเตี๋ยว/เส้น', emoji: '🍜' },
  { value: 'drink', label: 'เครื่องดื่ม/ชานม', emoji: '🧋' },
  { value: 'snack', label: 'ของทอด/ของกินเล่น', emoji: '🍟' },
  { value: 'dessert', label: 'ของหวาน/ขนม', emoji: '🍡' },
];

interface MenuFormProps {
  initialProduct?: Product;
  shopId: string;
  mode: 'new' | 'edit';
}

export default function MenuForm({ initialProduct, shopId, mode }: MenuFormProps) {
  const router = useRouter();
  const { addProduct, updateProduct } = useApp();

  const [name, setName] = useState(initialProduct?.name || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [basePrice, setBasePrice] = useState(initialProduct?.basePrice ?? 0);
  const [category, setCategory] = useState<Product['category']>(initialProduct?.category || 'rice');
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || '');
  const [dailyQuota, setDailyQuota] = useState(initialProduct?.dailyQuota ?? 30);
  const [isAvailable, setIsAvailable] = useState(initialProduct?.isAvailable ?? true);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>(
    initialProduct?.optionGroups || []
  );
  const [saving, setSaving] = useState(false);

  // ─── Option Group helpers ────────────────────────────────────────────────
  const addOptionGroup = () => {
    setOptionGroups((prev) => [
      ...prev,
      {
        id: `og_${Date.now()}`,
        title: '',
        isRequired: false,
        minSelect: 0,
        maxSelect: 1,
        options: [{ id: `oi_${Date.now()}`, name: '', priceDelta: 0 }],
      },
    ]);
  };

  const removeOptionGroup = (groupId: string) => {
    setOptionGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const updateGroupField = (groupId: string, field: keyof OptionGroup, value: unknown) => {
    setOptionGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, [field]: value } : g))
    );
  };

  const addOptionItem = (groupId: string) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: [...g.options, { id: `oi_${Date.now()}`, name: '', priceDelta: 0 }] }
          : g
      )
    );
  };

  const removeOptionItem = (groupId: string, itemId: string) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== itemId) } : g
      )
    );
  };

  const updateOptionItem = (groupId: string, itemId: string, field: keyof OptionItem, value: unknown) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) =>
                o.id === itemId ? { ...o, [field]: value } : o
              ),
            }
          : g
      )
    );
  };

  const moveGroupUp = (index: number) => {
    if (index === 0) return;
    setOptionGroups((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveGroupDown = (index: number) => {
    if (index >= optionGroups.length - 1) return;
    setOptionGroups((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      shopId,
      name,
      description,
      basePrice: Number(basePrice),
      imageUrl,
      category,
      dailyQuota: Number(dailyQuota),
      quotaRemaining: Number(dailyQuota),
      isAvailable,
      optionGroups,
    };

    setTimeout(() => {
      if (mode === 'new') {
        addProduct(productData);
      } else if (initialProduct) {
        updateProduct(initialProduct.id, productData);
      }
      setSaving(false);
      router.push('/merchant/menu');
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/merchant/menu"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {mode === 'new' ? '🍽️ เพิ่มเมนูอาหารใหม่' : `✏️ แก้ไขเมนู: ${initialProduct?.name}`}
          </h1>
          <p className="text-xs text-slate-500">กรอกข้อมูลเมนูให้ครบถ้วน แล้วกดบันทึก</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Section 1: Basic Info ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100">
            <h2 className="font-extrabold text-sm text-slate-800">ข้อมูลเมนูอาหาร</h2>
          </div>
          <div className="p-6 space-y-4 text-xs">
            {/* Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                ชื่อเมนู <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ข้าวมันไก่ตอน (ปกติ)"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-400 transition font-bold text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">คำอธิบายเมนู</label>
              <textarea
                rows={2} value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น ข้าวมันไก่ตอนนุ่มเด้ง น้ำซุปใส ราดน้ำพริกเจ้าอร่อย"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-400 transition resize-none"
              />
            </div>

            {/* Price + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ราคาเริ่มต้น (บาท) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">฿</span>
                  <input
                    type="number" required min={0} step={0.5} value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-400 transition font-bold text-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  หมวดหมู่อาหาร <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Product['category'])}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-400 transition"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image URL & File Upload */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-slate-400" />
                  รูปภาพอาหาร (อัปโหลดเข้าไดรฟ์ หรือระบุ URL)
                </span>
                <label className="cursor-pointer px-3 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-brand-600 font-extrabold text-[11px] border border-orange-200 transition-all flex items-center gap-1">
                  <span>📁 อัปโหลดรูปจากเครื่อง</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const { uploadImage } = await import('@/lib/uploadHelper');
                        const res = await uploadImage(file, `menu_${Date.now()}.jpg`);
                        setImageUrl(res.fileUrl);
                      }
                    }}
                  />
                </label>
              </label>
              <div className="flex gap-3 items-start">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... หรือกดปุ่มอัปโหลดรูปจากเครื่อง"
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-400 transition text-[11px] font-mono"
                />
                {imageUrl && (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Quota + Availability */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  โควตารายวัน (จาน/วัน) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" required min={1} max={999} value={dailyQuota}
                  onChange={(e) => setDailyQuota(parseInt(e.target.value) || 1)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-400 transition font-bold text-lg text-center"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">สถานะเมนู</label>
                <button
                  type="button"
                  onClick={() => setIsAvailable((v) => !v)}
                  className={`w-full p-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                    isAvailable
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                      : 'bg-red-50 border-red-300 text-red-600'
                  }`}
                >
                  {isAvailable ? '🟢 เปิดรับออเดอร์' : '🔴 ปิดชั่วคราว'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Option Groups ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-sm text-slate-800">ตัวเลือกเพิ่มเติม (Option Groups)</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">เช่น ขนาด, ระดับความหวาน, ท็อปปิ้งเพิ่มเติม</p>
            </div>
            <button
              type="button"
              onClick={addOptionGroup}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่มกลุ่มตัวเลือก
            </button>
          </div>

          {optionGroups.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-xs">
              <div className="text-3xl mb-2">🍽️</div>
              ยังไม่มีกลุ่มตัวเลือก — กดปุ่ม &ldquo;เพิ่มกลุ่มตัวเลือก&rdquo; เพื่อเพิ่ม
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {optionGroups.map((group, gi) => (
                <div key={group.id} className="p-5 space-y-3 text-xs">
                  {/* Group Header Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <button type="button" onClick={() => moveGroupUp(gi)} disabled={gi === 0} className="p-0.5 text-slate-400 disabled:opacity-20 hover:text-slate-700">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => moveGroupDown(gi)} disabled={gi === optionGroups.length - 1} className="p-0.5 text-slate-400 disabled:opacity-20 hover:text-slate-700">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text" required value={group.title}
                      onChange={(e) => updateGroupField(group.id, 'title', e.target.value)}
                      placeholder="ชื่อกลุ่มตัวเลือก เช่น ขนาด, ท็อปปิ้ง"
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-400 transition font-bold"
                    />
                    <button
                      type="button" onClick={() => removeOptionGroup(group.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Group Settings Row */}
                  <div className="flex flex-wrap items-center gap-3 pl-8 text-[11px] text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox" checked={group.isRequired}
                        onChange={(e) => updateGroupField(group.id, 'isRequired', e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-brand-500"
                      />
                      <span className="font-semibold">บังคับเลือก</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className="text-slate-400">เลือกได้สูงสุด:</span>
                      <input
                        type="number" min={1} max={10} value={group.maxSelect}
                        onChange={(e) => updateGroupField(group.id, 'maxSelect', parseInt(e.target.value) || 1)}
                        className="w-10 p-1 text-center border border-slate-200 rounded-lg bg-slate-50 font-bold"
                      />
                      <span className="text-slate-400">รายการ</span>
                    </label>
                  </div>

                  {/* Option Items */}
                  <div className="pl-8 space-y-2">
                    {group.options.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="text" required value={item.name}
                          onChange={(e) => updateOptionItem(group.id, item.id, 'name', e.target.value)}
                          placeholder="ชื่อตัวเลือก เช่น พิเศษ, เพิ่มไข่ดาว"
                          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-400 transition"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-slate-400">+฿</span>
                          <input
                            type="number" min={0} step={0.5} value={item.priceDelta}
                            onChange={(e) => updateOptionItem(group.id, item.id, 'priceDelta', parseFloat(e.target.value) || 0)}
                            className="w-16 p-2.5 text-center border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-400 transition font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOptionItem(group.id, item.id)}
                          disabled={group.options.length <= 1}
                          className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOptionItem(group.id)}
                      className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600 rounded-xl transition text-[11px] font-semibold w-full justify-center"
                    >
                      <Plus className="w-3 h-3" /> เพิ่มตัวเลือก
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Submit Button ── */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href="/merchant/menu"
            className="px-6 py-3 rounded-2xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-brand-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {saving ? (
              <span className="animate-spin text-base leading-none">⟳</span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving
              ? 'กำลังบันทึก...'
              : mode === 'new'
              ? 'เพิ่มเมนูอาหาร'
              : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </form>
    </div>
  );
}
