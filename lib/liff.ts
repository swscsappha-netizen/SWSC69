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

/**
 * Initialize LINE LIFF SDK
 */
export async function initLiff(): Promise<{ success: boolean; profile?: LiffProfile; isInClient: boolean }> {
  const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;

  if (!liffId || liffId.includes('placeholder') || liffId === 'your-line-liff-id') {
    return {
      success: false,
      isInClient: false,
    };
  }

  try {
    if (!isInitialized) {
      await liff.init({ liffId });
      isInitialized = true;
    }

    const isInClient = liff.isInClient();

    if (liff.isLoggedIn()) {
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
    } else if (isInClient) {
      liff.login();
    }

    return { success: true, isInClient };
  } catch (error) {
    console.warn('LIFF Initialization Warning:', error);
    return { success: false, isInClient: false };
  }
}

/**
 * Trigger LINE Login redirect
 */
export async function loginWithLiff(): Promise<void> {
  if (typeof window === 'undefined') return;

  const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID || '2011161264-4eQlRIAS';

  try {
    if (!isInitialized) {
      await liff.init({ liffId });
      isInitialized = true;
    }

    if (!liff.isLoggedIn()) {
      liff.login({
        redirectUri: window.location.origin + '/login',
      });
    }
  } catch (error) {
    console.error('LIFF login error:', error);
    // Fallback direct LINE OAuth URL if SDK fails
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const clientId = liffId.split('-')[0] || liffId;
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=profile%20openid&state=sappha_${Date.now()}`;
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
