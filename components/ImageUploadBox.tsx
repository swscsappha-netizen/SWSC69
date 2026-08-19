'use client';

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, RefreshCw, UploadCloud } from 'lucide-react';
import { processImageFile } from '@/lib/imageUtils';

interface ImageUploadBoxProps {
  label: string;
  value: string;
  onChange: (base64Url: string) => void;
  aspectRatio?: 'square' | 'banner' | 'avatar';
  helperText?: string;
  required?: boolean;
}

export default function ImageUploadBox({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  helperText,
  required = false,
}: ImageUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const maxDim = aspectRatio === 'banner' ? 1400 : 1000;
      const optimizedBase64 = await processImageFile(file, maxDim, 0.85);
      onChange(optimizedBase64);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsProcessing(false);
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const heightClass =
    aspectRatio === 'banner'
      ? 'h-36 sm:h-44'
      : aspectRatio === 'avatar'
      ? 'w-24 h-24 rounded-full'
      : 'h-40';

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {helperText && <span className="text-[10px] text-slate-400">{helperText}</span>}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <div
            className={`w-full ${heightClass} bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>

          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md flex items-center gap-1 hover:bg-slate-100 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>เปลี่ยนรูป</span>
            </button>

            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1 hover:bg-rose-700 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบ</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full ${heightClass} border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50/80 hover:bg-brand-50/30 rounded-2xl flex flex-col items-center justify-center p-4 transition-all text-slate-500 hover:text-brand-600 group cursor-pointer`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
              <span className="font-bold text-slate-700 text-xs">กำลังประมวลผลรูปภาพ...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand-600 group-hover:scale-110 transition-all">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-xs text-slate-700 group-hover:text-brand-600 block">
                  กดเพื่อเลือกรูปภาพจากเครื่อง 📷
                </span>
                <span className="text-[10px] text-slate-400">
                  รองรับไฟล์รูปภาพจากกล้องและอัลบั้มทุกชนิด
                </span>
              </div>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
