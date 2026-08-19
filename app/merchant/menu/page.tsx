'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Product, OptionGroup } from '@/types';
import {
  ArrowLeft,
  Plus,
  Clock,
  Utensils,
  Save,
  CheckCircle2,
  Power,
  Edit2,
  Trash2,
  ShieldCheck,
  Search,
  Sliders,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import ImageUploadBox from '@/components/ImageUploadBox';

const CATEGORIES: { value: string; label: string; emoji: string }[] = [
  { value: 'all', label: 'ทั้งหมด', emoji: '🍽️' },
  { value: 'rice', label: 'ข้าว/จานหลัก', emoji: '🍚' },
  { value: 'noodle', label: 'ก๋วยเตี๋ยว/เส้น', emoji: '🍜' },
  { value: 'drink', label: 'เครื่องดื่ม', emoji: '🧋' },
  { value: 'snack', label: 'ของทานเล่น', emoji: '🍟' },
  { value: 'dessert', label: 'ของหวาน', emoji: '🍡' },
];

export default function MerchantMenuManagerPage() {
  const router = useRouter();
  const {
    shops,
    products,
    currentUser,
    updateShop,
    addProduct,
    updateProduct,
    updateProductQuota,
    toggleProductAvailability,
    deleteProduct,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form states for Modal
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState(35);
  const [formCategory, setFormCategory] = useState<'rice' | 'noodle' | 'drink' | 'snack' | 'dessert'>('rice');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDailyQuota, setFormDailyQuota] = useState(50);
  const [formOptionGroups, setFormOptionGroups] = useState<OptionGroup[]>([]);

  if (shops.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Utensils className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">ยังไม่มีร้านค้าในระบบ</h1>
        <p className="text-xs text-slate-500">กรุณาสร้างหรือเปิดร้านค้าก่อนจึงจะสามารถจัดการเมนูอาหารได้</p>
        <Link
          href={currentUser.role === 'ADMIN' ? '/admin' : '/merchant'}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-2xl text-xs font-bold"
        >
          {currentUser.role === 'ADMIN' ? 'ไปที่หน้าแอดมิน' : 'กลับแดชบอร์ด'}
        </Link>
      </div>
    );
  }

  const currentShopId = currentUser.shopId || shops[0]?.id;
  const shop = shops.find((s) => s.id === currentShopId) || shops[0];
  const shopProducts = products.filter((p) => p.shopId === shop?.id);

  // Shop Cutoff Time state
  const [cutoffTime, setCutoffTime] = useState(shop?.cutoffTime || '20:00');

  const handleSaveCutoff = () => {
    if (!shop) return;
    updateShop(shop.id, { cutoffTime });
    showToast('success', 'บันทึกเวลาตัดรอบแล้ว', `เวลาปิดรับออเดอร์ใหม่คือ ${cutoffTime} น.`);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู "${productName}"?`)) {
      deleteProduct(productId);
    }
  };

  // Open Edit Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDesc(p.description);
    setFormPrice(p.basePrice);
    setFormCategory(p.category);
    setFormImageUrl(p.imageUrl);
    setFormDailyQuota(p.dailyQuota);
    setFormOptionGroups(p.optionGroups || []);
    setIsNewModalOpen(false);
  };

  // Open New Modal
  const openNewModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormPrice(35);
    setFormCategory('rice');
    setFormImageUrl('');
    setFormDailyQuota(40);
    setFormOptionGroups([]);
    setIsNewModalOpen(true);
  };

  // Save Modal (New or Edit)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        description: formDesc.trim(),
        basePrice: Number(formPrice),
        category: formCategory,
        imageUrl: formImageUrl.trim(),
        dailyQuota: Number(formDailyQuota),
        quotaRemaining: Number(formDailyQuota),
        optionGroups: formOptionGroups,
      });
      setEditingProduct(null);
    } else {
      addProduct({
        shopId: shop.id,
        name: formName.trim(),
        description: formDesc.trim(),
        basePrice: Number(formPrice),
        category: formCategory,
        imageUrl: formImageUrl.trim(),
        dailyQuota: Number(formDailyQuota),
        quotaRemaining: Number(formDailyQuota),
        isAvailable: true,
        optionGroups: formOptionGroups,
      });
      setIsNewModalOpen(false);
    }
  };

  // Add Option Group
  const addOptionGroup = () => {
    setFormOptionGroups([
      ...formOptionGroups,
      {
        id: `og_${Date.now()}`,
        title: 'ตัวเลือกเพิ่มเติม (เช่น พิเศษ/ธรรมดา หรือ ท็อปปิ้ง)',
        isRequired: false,
        minSelect: 0,
        maxSelect: 1,
        options: [
          { id: `oi_${Date.now()}_1`, name: 'ธรรมดา', priceDelta: 0 },
          { id: `oi_${Date.now()}_2`, name: 'พิเศษ', priceDelta: 10 },
        ],
      },
    ]);
  };

  const removeOptionGroup = (idx: number) => {
    setFormOptionGroups(formOptionGroups.filter((_, i) => i !== idx));
  };

  // Filter Products
  const filteredProducts = shopProducts.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับแดชบอร์ด</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-900">{shop?.name}</span>
          <div className="text-[11px] text-slate-500">📍 {shop?.stallName}</div>
        </div>
      </div>

      {/* Top Banner Control */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900">เวลาตัดรอบรับออเดอร์ประจำวัน</div>
            <div className="text-xs text-slate-500">ระบบจะปิดรับออเดอร์สำหรับมื้อเช้าวันพรุ่งนี้ตามเวลานี้</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="time"
            value={cutoffTime}
            onChange={(e) => setCutoffTime(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs"
          />
          <button
            onClick={handleSaveCutoff}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึก</span>
          </button>
        </div>
      </div>

      {/* Product List Header & Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              จัดการเมนูอาหาร & สต็อกโควตา ({shopProducts.length} เมนู)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ปรับราคา, แก้ไขท็อปปิ้ง, ปรับจำนวนจานที่พร้อมขาย, หรือสลับเปิด-ปิดของหมด
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มเมนูใหม่</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเมนูอาหาร หรือคำอธิบาย..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.value
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
            <Utensils className="w-12 h-12 mx-auto text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">ไม่พบรายการเมนูที่ค้นหา</div>
            <p className="text-xs">กดปุ่ม &quot;+ เพิ่มเมนูใหม่&quot; เพื่อเพิ่มรายการอาหารเข้าสู่ร้านของคุณ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`p-5 bg-white rounded-3xl border transition-all shadow-sm flex flex-col justify-between gap-4 ${
                  product.isAvailable ? 'border-slate-200 hover:border-brand-300' : 'border-red-200 bg-red-50/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner relative">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Utensils className="w-8 h-8" />
                      </div>
                    )}
                    {!product.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-[10px] font-black text-white uppercase">
                        ของหมด
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-black text-base text-slate-900 truncate">{product.name}</h3>
                      <span className="text-base font-black text-emerald-600 shrink-0">฿{product.basePrice}</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                    </p>

                    {product.optionGroups && product.optionGroups.length > 0 && (
                      <div className="text-[11px] text-brand-600 font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{product.optionGroups.length} กลุ่มตัวเลือกเสริม (Toppings)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quota & Availability Controls */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  {/* Daily Quota Counter */}
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 px-1.5">โควตา:</span>
                    <button
                      onClick={() => updateProductQuota(product.id, Math.max(0, product.dailyQuota - 5))}
                      className="w-6 h-6 rounded-lg bg-white shadow-sm border border-slate-200 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-slate-900 px-1 min-w-[28px] text-center">
                      {product.dailyQuota}
                    </span>
                    <button
                      onClick={() => updateProductQuota(product.id, product.dailyQuota + 5)}
                      className="w-6 h-6 rounded-lg bg-white shadow-sm border border-slate-200 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-[10px] text-slate-400 pr-1">ที่/วัน</span>
                  </div>

                  {/* Actions: Availability, Edit, Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleProductAvailability(product.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        product.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {product.isAvailable ? '🟢 พร้อมขาย' : '🔴 ของหมด'}
                    </button>

                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="แก้ไขเมนู"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      title="ลบเมนู"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {(isNewModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">
                  {editingProduct ? `แก้ไขเมนู: ${editingProduct.name}` : 'เพิ่มเมนูอาหารใหม่'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsNewModalOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ชื่อเมนูอาหาร <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น ข้าวมันไก่ตอนสูตรพิเศษ"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ราคาขาย (บาท) <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-600 text-sm focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    โควตาจำนวนจาน/วัน <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formDailyQuota}
                    onChange={(e) => setFormDailyQuota(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">หมวดหมู่อาหาร:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="rice">🍚 ข้าว/จานหลัก</option>
                  <option value="noodle">🍜 ก๋วยเตี๋ยว/เส้น</option>
                  <option value="drink">🧋 เครื่องดื่ม</option>
                  <option value="snack">🍟 ของทานเล่น</option>
                  <option value="dessert">🍡 ของหวาน/ขนม</option>
                </select>
              </div>

              {/* Direct File Image Upload Box */}
              <ImageUploadBox
                label="รูปภาพเมนูอาหาร"
                value={formImageUrl}
                onChange={setFormImageUrl}
                aspectRatio="square"
                helperText="กดเพื่อเลือกรูปภาพจากเครื่อง หรือถ่ายรูปใหม่"
              />

              <div>
                <label className="font-bold text-slate-700 block mb-1">คำอธิบาย/ส่วนประกอบ:</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="เช่น ไก่นุ่ม น้ำจิ้มเต้าเจี้ยวสูตรเด็ด พร้อมน้ำซุปกระดูกหมูหวานกลมกล่อม"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none text-slate-800"
                />
              </div>

              {/* Option Groups (Toppings) Management */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                    <span>ตัวเลือกเสริม / Topping ({formOptionGroups.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={addOptionGroup}
                    className="text-[11px] font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>เพิ่มกลุ่มตัวเลือก</span>
                  </button>
                </div>

                {formOptionGroups.map((group, gIdx) => (
                  <div key={group.id || gIdx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={group.title}
                        onChange={(e) => {
                          const next = [...formOptionGroups];
                          next[gIdx].title = e.target.value;
                          setFormOptionGroups(next);
                        }}
                        placeholder="ชื่อกลุ่ม เช่น ท็อปปิ้งเพิ่มเติม"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionGroup(gIdx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 pl-2">
                      {group.options.map((opt, oIdx) => (
                        <div key={opt.id || oIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => {
                              const next = [...formOptionGroups];
                              next[gIdx].options[oIdx].name = e.target.value;
                              setFormOptionGroups(next);
                            }}
                            placeholder="ชื่อตัวเลือก เช่น เพิ่มไข่ดาว"
                            className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <div className="flex items-center gap-1 w-24">
                            <span className="text-[10px] text-slate-400">+฿</span>
                            <input
                              type="number"
                              value={opt.priceDelta}
                              onChange={(e) => {
                                const next = [...formOptionGroups];
                                next[gIdx].options[oIdx].priceDelta = Number(e.target.value);
                                setFormOptionGroups(next);
                              }}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-600"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...formOptionGroups];
                              next[gIdx].options = next[gIdx].options.filter((_, i) => i !== oIdx);
                              setFormOptionGroups(next);
                            }}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const next = [...formOptionGroups];
                          next[gIdx].options.push({ id: `oi_${Date.now()}`, name: 'ตัวเลือกใหม่', priceDelta: 5 });
                          setFormOptionGroups(next);
                        }}
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>เพิ่มช้อยส์ในกลุ่มนี้</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsNewModalOpen(false);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกเมนู</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
