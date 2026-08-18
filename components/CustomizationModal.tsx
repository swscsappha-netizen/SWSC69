'use client';

import React, { useState, useEffect } from 'react';
import { Product, Shop, SelectedOption } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, Plus, Minus, Check, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomizationModalProps {
  product: Product | null;
  shop: Shop | null;
  onClose: () => void;
}

export default function CustomizationModal({
  product,
  shop,
  onClose,
}: CustomizationModalProps) {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize default options when product changes
  useEffect(() => {
    if (!product) {
      setSelectedOptions([]);
      setQuantity(1);
      setSpecialInstructions('');
      setValidationError(null);
      return;
    }

    const defaultOpts: SelectedOption[] = [];
    product.optionGroups.forEach((group) => {
      if (group.isRequired && group.options.length > 0) {
        const firstOpt = group.options[0];
        defaultOpts.push({
          groupId: group.id,
          groupTitle: group.title,
          itemId: firstOpt.id,
          itemName: firstOpt.name,
          priceDelta: firstOpt.priceDelta,
        });
      }
    });

    setSelectedOptions(defaultOpts);
    setQuantity(1);
    setSpecialInstructions('');
    setValidationError(null);
  }, [product]);

  if (!product || !shop) return null;

  // Option toggle handlers
  const handleSingleSelect = (
    groupId: string,
    groupTitle: string,
    itemId: string,
    itemName: string,
    priceDelta: number
  ) => {
    setSelectedOptions((prev) => [
      ...prev.filter((o) => o.groupId !== groupId),
      { groupId, groupTitle, itemId, itemName, priceDelta },
    ]);
    setValidationError(null);
  };

  const handleMultiSelect = (
    groupId: string,
    groupTitle: string,
    itemId: string,
    itemName: string,
    priceDelta: number,
    maxSelect: number
  ) => {
    const isSelected = selectedOptions.some((o) => o.groupId === groupId && o.itemId === itemId);

    if (isSelected) {
      setSelectedOptions((prev) =>
        prev.filter((o) => !(o.groupId === groupId && o.itemId === itemId))
      );
    } else {
      const currentInGroup = selectedOptions.filter((o) => o.groupId === groupId);
      if (currentInGroup.length >= maxSelect && maxSelect === 1) {
        // Replace single item
        setSelectedOptions((prev) => [
          ...prev.filter((o) => o.groupId !== groupId),
          { groupId, groupTitle, itemId, itemName, priceDelta },
        ]);
      } else if (currentInGroup.length < maxSelect) {
        setSelectedOptions((prev) => [
          ...prev,
          { groupId, groupTitle, itemId, itemName, priceDelta },
        ]);
      }
    }
  };

  // Calculate unit price and total
  const optionsExtra = selectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
  const unitPrice = product.basePrice + optionsExtra;
  const totalPrice = unitPrice * quantity;

  // Add to cart handler
  const handleAddToCart = () => {
    // Validate required options
    for (const group of product.optionGroups) {
      if (group.isRequired) {
        const selected = selectedOptions.filter((o) => o.groupId === group.id);
        if (selected.length < group.minSelect) {
          setValidationError(`กรุณาเลือก: "${group.title}"`);
          return;
        }
      }
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      shopId: shop.id,
      shopName: shop.name,
      stallName: shop.stallName,
      basePrice: product.basePrice,
      unitPrice,
      quantity,
      selectedOptions,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Modal Header with Image */}
          <div className="relative h-48 sm:h-56 w-full shrink-0 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white">
                  {shop.name}
                </span>
                <span className="text-xs text-slate-300">
                  โควตาคงเหลือ: {product.quotaRemaining} ที่
                </span>
              </div>
              <h3 className="text-xl font-bold text-white drop-shadow-md">{product.name}</h3>
              <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">{product.description}</p>
            </div>
          </div>

          {/* Scrollable Option Groups */}
          <div className="p-5 overflow-y-auto space-y-6 flex-1">
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-600 flex items-center gap-2">
                <span>⚠️ {validationError}</span>
              </div>
            )}

            {product.optionGroups.map((group) => {
              const isSingle = group.maxSelect === 1;

              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{group.title}</span>
                      {group.isRequired && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-brand-700">
                          จำเป็นต้องเลือก
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {isSingle ? 'เลือกได้ 1 ข้อ' : `สูงสุด ${group.maxSelect} ข้อ`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const isSelected = selectedOptions.some(
                        (o) => o.groupId === group.id && o.itemId === opt.id
                      );

                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (isSingle) {
                              handleSingleSelect(
                                group.id,
                                group.title,
                                opt.id,
                                opt.name,
                                opt.priceDelta
                              );
                            } else {
                              handleMultiSelect(
                                group.id,
                                group.title,
                                opt.id,
                                opt.name,
                                opt.priceDelta,
                                group.maxSelect
                              );
                            }
                          }}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-brand-50/80 border-brand-500 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-${
                                isSingle ? 'full' : 'md'
                              } flex items-center justify-center border transition-all ${
                                isSelected
                                  ? 'bg-brand-600 border-brand-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-sm font-medium text-slate-800">{opt.name}</span>
                          </div>

                          {opt.priceDelta > 0 ? (
                            <span className="text-xs font-bold text-brand-600 bg-brand-100/60 px-2 py-1 rounded-lg">
                              +{opt.priceDelta}฿
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">+0฿</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Special Instructions Note */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <span>หมายเหตุเพิ่มเติมถึงแม่ค้า (ไม่คิดเงินเพิ่ม)</span>
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="เช่น ไม่ใส่ผักโรย, เผ็ดน้อย, แยกน้ำจิ้ม..."
                rows={2}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Modal Footer (Quantity & Add to Cart) */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-4 shrink-0">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-slate-800">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.quotaRemaining, q + 1))}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button with Dynamic Price */}
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between"
            >
              <span>เพิ่มลงตะกร้า</span>
              <span className="bg-white/20 px-2.5 py-1 rounded-xl text-xs font-extrabold backdrop-blur-sm">
                ฿{totalPrice}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
