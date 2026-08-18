'use client';

import liff from '@line/liff';
import { Order } from '@/types';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

let isInitialized = false;

function getCleanLiffId(): string {
  const raw = process.env.NEXT_PUBLIC_LINE_LIFF_ID || '2011161264-4eQlRIAS';
  return raw.trim().replace(/[\r\n\t\s]/g, '');
}

/**
 * ตรวจสอบว่า URL ปัจจุบันคือหน้าที่ LINE redirect กลับมาหลัง OAuth หรือไม่
 * (มี liff.state หรือ code param ใน URL = เพิ่งกลับจาก LINE auth)
 */
function isLiffAuthCallback(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  return (
    params.has('liff.state') ||
    params.has('code') ||
    hash.includes('liff.state') ||
    hash.includes('access_token')
  );
}

/** รอ N ms แบบ async */
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Initialize LINE LIFF SDK
 * - ถ้าอยู่ใน LINE App และยังไม่ได้ login → เรียก liff.login() อัตโนมัติ (redirect)
 * - ถ้าอยู่ใน browser ปกติและยังไม่ได้ login → เรียก liff.login() เพื่อ OAuth flow
 * - ถ้า login แล้ว → ดึง profile มาเลย
 *
 * Fix: หลัง LINE redirect กลับมา (auth callback), isLoggedIn() อาจคืน false
 * ชั่วคราวก่อนที่ access token จะถูก process → รอ settle ก่อนตัดสินใจ login ซ้ำ
 */
export async function initLiff(): Promise<{ success: boolean; profile?: LiffProfile; isInClient: boolean; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, isInClient: false };
  }

  const liffId = getCleanLiffId();

  try {
    if (!isInitialized) {
      await liff.init({ liffId });
      isInitialized = true;
    }

    const isInClient = liff.isInClient();

    // ถ้าเพิ่งกลับจาก LINE auth callback: รอให้ LIFF SDK process token ก่อน
    if (isLiffAuthCallback() && !liff.isLoggedIn()) {
      await wait(300);
    }

    if (!liff.isLoggedIn()) {
      // ถ้าเปิดในแอป LINE ให้เรียก liff.login() แบบ native (ไม่ต้องใส่ redirectUri เพื่อไม่ให้ค้างบน iOS)
      // ถ้าเปิดใน Safari/Chrome ภายนอก ให้ใส่ redirectUri
      try {
        if (isInClient) {
          liff.login();
        } else {
          const redirectUri = `${window.location.origin}/login`;
          liff.login({ redirectUri });
        }
      } catch (loginErr) {
        console.warn('liff.login call error:', loginErr);
      }
      return { success: false, isInClient };
    }

    // Login แล้ว → ดึงโปรไฟล์ LINE
    try {
      const profile = await liff.getProfile();
      return {
        success: true,
        isInClient,
        profile: {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
        },
      };
    } catch (profileErr: any) {
      console.warn('Failed to get LIFF profile, trying decoded ID token:', profileErr);
      try {
        const idToken = liff.getDecodedIDToken();
        if (idToken?.sub) {
          return {
            success: true,
            isInClient,
            profile: {
              userId: idToken.sub,
              displayName: idToken.name || 'ผู้ใช้งาน LINE',
              pictureUrl: idToken.picture,
            },
          };
        }
      } catch (tokenErr) {}
    }

    return { success: true, isInClient };
  } catch (error: any) {
    console.warn('LIFF Initialization Warning:', error);
    return { success: false, isInClient: false, error: error?.message || 'LIFF Init Failed' };
  }
}

/**
 * Trigger LINE Login redirect
 */
export async function loginWithLiff(): Promise<void> {
  if (typeof window === 'undefined') return;

  const liffId = getCleanLiffId();

  try {
    if (!isInitialized) {
      await liff.init({ liffId });
      isInitialized = true;
    }

    if (!liff.isLoggedIn()) {
      const redirectUri = `${window.location.origin}/login`;
      liff.login({ redirectUri });
    }
  } catch (error) {
    console.error('LIFF login error:', error);
  }
}

/**
 * Logout from LINE LIFF
 */
export function logoutLiff() {
  if (typeof window !== 'undefined' && isInitialized && liff.isLoggedIn()) {
    liff.logout();
  }
}

/**
 * Generate Minimalist Receipt Flex Message for LINE Chat
 */
export function createReceiptFlexMessage(order: Order) {
  const itemsText = order.items
    .map((item) => `${item.productName} x${item.quantity} (฿${item.totalPrice})`)
    .join('\n');

  return {
    type: 'flex' as const,
    altText: `สลิปสั่งอาหารล่วงหน้า: #${order.orderCode} (${order.shopName})`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F172A',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🍱 SAPPHA PRE-ORDER',
            color: '#F59E0B',
            size: 'xs',
            weight: 'bold',
            letterSpacing: '1px',
          },
          {
            type: 'text',
            text: 'สลิปสั่งอาหารล่วงหน้า',
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
            margin: 'sm',
          },
          {
            type: 'text',
            text: 'โรงเรียนสรรพวิทยาคม',
            color: '#94A3B8',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        spacing: 'md',
        contents: [
          // Order code & pickup code box
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: '#F8FAFC',
            paddingAll: '12px',
            cornerRadius: '12px',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                flex: 1,
                contents: [
                  {
                    type: 'text',
                    text: 'รหัสออเดอร์',
                    size: 'xxs',
                    color: '#64748B',
                  },
                  {
                    type: 'text',
                    text: `#${order.orderCode}`,
                    size: 'sm',
                    weight: 'bold',
                    color: '#0F172A',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'vertical',
                flex: 1,
                alignItems: 'flex-end',
                contents: [
                  {
                    type: 'text',
                    text: 'รหัสรับของ 4 หลัก',
                    size: 'xxs',
                    color: '#64748B',
                  },
                  {
                    type: 'text',
                    text: `#${order.pickupCode4Digits}`,
                    size: 'lg',
                    weight: 'bold',
                    color: '#EA580C',
                  },
                ],
              },
            ],
          },
          // Shop & Stall Info
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            contents: [
              {
                type: 'text',
                text: `🏪 ร้านค้า: ${order.shopName}`,
                size: 'xs',
                weight: 'bold',
                color: '#1E293B',
              },
              {
                type: 'text',
                text: `📍 จุดรับอาหาร: ${order.stallName}`,
                size: 'xs',
                color: '#0284C7',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `⏰ เวลารับของ: ${order.pickupDate} (${order.pickupTimeWindow})`,
                size: 'xs',
                color: '#64748B',
              },
            ],
          },
          {
            type: 'separator',
            color: '#E2E8F0',
          },
          // Ordered Items Summary
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            contents: [
              {
                type: 'text',
                text: 'รายการอาหาร:',
                size: 'xs',
                weight: 'bold',
                color: '#475569',
              },
              {
                type: 'text',
                text: itemsText,
                size: 'xs',
                color: '#334155',
                wrap: true,
              },
            ],
          },
          {
            type: 'separator',
            color: '#E2E8F0',
          },
          // Subtotal and Status
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'ยอดชำระ PromptPay',
                size: 'xs',
                color: '#64748B',
              },
              {
                type: 'text',
                text: `฿${order.subtotal}`,
                size: 'lg',
                weight: 'bold',
                color: '#16A34A',
                align: 'end',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: '#FEF3C7',
            paddingAll: '8px',
            cornerRadius: '8px',
            contents: [
              {
                type: 'text',
                text: 'สถานะ: ⏳ รอแม่ค้าตรวจสอบสลิป',
                size: 'xs',
                weight: 'bold',
                color: '#92400E',
                align: 'center',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#06C755',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'เปิดดูตั๋ว & QR Code ในเว็บ',
              uri: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/orders`,
            },
          },
        ],
      },
    },
  };
}

/**
 * Send Receipt Flex Message to User's Chat via LIFF
 */
export async function sendReceiptToLineChat(order: Order): Promise<{ success: boolean; message: string }> {
  try {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Not in browser environment' };
    }

    const flexMsg = createReceiptFlexMessage(order);

    // If inside LINE App and has message permission
    if (liff.isInClient()) {
      await liff.sendMessages([flexMsg as any]);
      return { success: true, message: 'ส่งใบเสร็จรับอาหารเข้าห้องแชท LINE เรียบร้อยแล้ว 💬' };
    }

    // If in external browser with ShareTargetPicker available
    if (liff.isApiAvailable('shareTargetPicker')) {
      const res = await liff.shareTargetPicker([flexMsg as any]);
      if (res) {
        return { success: true, message: 'แชร์สลิปตั๋วรับอาหารไปยังแชท LINE สำเร็จแล้ว 🎉' };
      }
    }

    return {
      success: false,
      message: 'โปรดเปิดในแอป LINE หรือเปิดใช้งาน Share Target Picker เพื่อส่งข้อความเข้าแชท',
    };
  } catch (error: any) {
    console.warn('Error sending LINE message:', error);
    return {
      success: false,
      message: error?.message || 'ไม่สามารถส่งข้อความเข้าแชท LINE ได้',
    };
  }
}
