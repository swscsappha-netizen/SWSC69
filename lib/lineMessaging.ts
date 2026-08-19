import { Order } from '@/types';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const DEFAULT_LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID || '2011161264-4eQlRIAS';

export const isLineMessagingConfigured = Boolean(
  LINE_CHANNEL_ACCESS_TOKEN && !LINE_CHANNEL_ACCESS_TOKEN.includes('placeholder')
);

/**
 * Generate official LINE LIFF URL for Flex Messages
 * Format: https://liff.line.me/{LIFF_ID}/{path}
 */
export function getLiffAppUrl(path: string = '/orders'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `https://liff.line.me/${DEFAULT_LIFF_ID.trim()}${cleanPath}`;
}

/**
 * Send Push Message via LINE Messaging API
 */
export async function sendLinePushMessage(
  toLineUserId: string,
  messages: any[]
): Promise<{ success: boolean; message: string }> {
  if (!isLineMessagingConfigured) {
    return {
      success: false,
      message: 'LINE_CHANNEL_ACCESS_TOKEN is not configured in .env.local',
    };
  }

  if (!toLineUserId || toLineUserId.startsWith('user_') || toLineUserId.length < 10) {
    return {
      success: false,
      message: 'Invalid LINE User ID',
    };
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: toLineUserId,
        messages,
      }),
    });

    if (res.ok) {
      return { success: true, message: 'ส่งการแจ้งเตือน LINE สำเร็จแล้ว 🔔' };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errData.message || `LINE API error: status ${res.status}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ LINE Messaging API',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Flex Message: แจ้งเตือนแม่ค้าเมื่อมีออเดอร์ใหม่เข้ามา
// ─────────────────────────────────────────────────────────────────────────────
export function buildNewOrderMerchantFlex(order: Order, appUrl: string = 'https://swsc69.vercel.app') {
  const itemsText = order.items
    .map((it) => `• ${it.productName} x${it.quantity}`)
    .join('\n');

  return {
    type: 'flex',
    altText: `🔔 มีออเดอร์ใหม่! #${order.orderCode} ยอด ฿${order.subtotal}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#EA580C',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '🔔 ออเดอร์ใหม่เข้าแล้ว!',
            weight: 'bold',
            color: '#FFFFFF',
            size: 'lg',
          },
          {
            type: 'text',
            text: `${order.shopName} (${order.stallName})`,
            color: '#FED7AA',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'รหัสออเดอร์:',
                size: 'xs',
                color: '#64748B',
                flex: 2,
              },
              {
                type: 'text',
                text: `#${order.orderCode}`,
                size: 'xs',
                weight: 'bold',
                color: '#0F172A',
                align: 'end',
                flex: 3,
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'ผู้สั่งซื้อ:',
                size: 'xs',
                color: '#64748B',
                flex: 2,
              },
              {
                type: 'text',
                text: `${order.userName} (${order.userGradeRoom || 'นักเรียน'})`,
                size: 'xs',
                weight: 'bold',
                color: '#0F172A',
                align: 'end',
                flex: 3,
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'เวลารับอาหาร:',
                size: 'xs',
                color: '#64748B',
                flex: 2,
              },
              {
                type: 'text',
                text: `${order.pickupDate} (${order.pickupTimeWindow})`,
                size: 'xs',
                weight: 'bold',
                color: '#EA580C',
                align: 'end',
                flex: 3,
              },
            ],
          },
          { type: 'separator', color: '#F1F5F9' },
          {
            type: 'text',
            text: 'รายการอาหาร:',
            size: 'xs',
            weight: 'bold',
            color: '#334155',
          },
          {
            type: 'text',
            text: itemsText,
            size: 'xs',
            color: '#475569',
            wrap: true,
          },
          { type: 'separator', color: '#F1F5F9' },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'ยอดรวมทั้งสิ้น:',
                weight: 'bold',
                size: 'sm',
                color: '#0F172A',
              },
              {
                type: 'text',
                text: `฿${order.subtotal}`,
                weight: 'bold',
                size: 'lg',
                color: '#16A34A',
                align: 'end',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#EA580C',
            action: {
              type: 'uri',
              label: '🔎 ตรวจสลิป & จัดการออเดอร์',
              uri: getLiffAppUrl('/merchant'),
            },
          },
        ],
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Flex Message: แจ้งเตือนนักเรียนเมื่อแม่ค้าอนุมัติสลิปแล้ว (CONFIRMED)
// ─────────────────────────────────────────────────────────────────────────────
export function buildOrderConfirmedStudentFlex(order: Order, appUrl: string = 'https://swsc69.vercel.app') {
  return {
    type: 'flex',
    altText: `✅ สลิปถูกต้อง! แม่ค้ายืนยันออเดอร์ #${order.orderCode} แล้ว`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0284C7',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '✅ สลิปถูกต้อง ยืนยันออเดอร์แล้ว',
            weight: 'bold',
            color: '#FFFFFF',
            size: 'md',
          },
          {
            type: 'text',
            text: `${order.shopName} กำลังเตรียมอาหารสำหรับพรุ่งนี้เช้า`,
            color: '#BAE6FD',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F0F9FF',
            cornerRadius: '16px',
            paddingAll: '12px',
            alignItems: 'center',
            contents: [
              {
                type: 'text',
                text: 'รหัสรับอาหารของคุณ',
                size: 'xxs',
                color: '#0369A1',
                weight: 'bold',
              },
              {
                type: 'text',
                text: order.pickupCode4Digits || '0000',
                size: 'xxl',
                weight: 'bold',
                color: '#0284C7',
                margin: 'xs',
              },
              {
                type: 'text',
                text: `แจ้งรหัส 4 หลักนี้ที่ ${order.stallName}`,
                size: 'xxs',
                color: '#64748B',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'เวลารับอาหาร:',
                size: 'xs',
                color: '#64748B',
                flex: 2,
              },
              {
                type: 'text',
                text: `${order.pickupDate} (${order.pickupTimeWindow})`,
                size: 'xs',
                weight: 'bold',
                color: '#0F172A',
                align: 'end',
                flex: 3,
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#0284C7',
            action: {
              type: 'uri',
              label: '🎟️ เปิดดูตั๋วรับอาหาร',
              uri: getLiffAppUrl('/orders'),
            },
          },
        ],
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Flex Message: แจ้งเตือนนักเรียนเมื่ออาหารปรุงเสร็จพร้อมรับแล้ว (READY)
// ─────────────────────────────────────────────────────────────────────────────
export function buildOrderReadyStudentFlex(order: Order, appUrl: string = 'https://swsc69.vercel.app') {
  return {
    type: 'flex',
    altText: `🟢 อาหารพร้อมรับแล้ว! รหัสรับของ: ${order.pickupCode4Digits} ที่ ${order.stallName}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#16A34A',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '🟢 อาหารพร้อมรับแล้ว!',
            weight: 'bold',
            color: '#FFFFFF',
            size: 'lg',
          },
          {
            type: 'text',
            text: `เชิญรับอาหารได้ที่ ${order.stallName}`,
            color: '#BBF7D0',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#DCFCE7',
            cornerRadius: '16px',
            paddingAll: '14px',
            alignItems: 'center',
            contents: [
              {
                type: 'text',
                text: 'แสดงรหัสนี้ให้แม่ค้าหน้าร้าน',
                size: 'xs',
                color: '#15803D',
                weight: 'bold',
              },
              {
                type: 'text',
                text: order.pickupCode4Digits || '0000',
                size: '3xl',
                weight: 'bold',
                color: '#16A34A',
                margin: 'sm',
              },
              {
                type: 'text',
                text: `${order.shopName} - #${order.orderCode}`,
                size: 'xxs',
                color: '#64748B',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#16A34A',
            action: {
              type: 'uri',
              label: '🎟️ เปิดตั๋วรับอาหารหน้าร้าน',
              uri: getLiffAppUrl('/orders'),
            },
          },
        ],
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Flex Message: แจ้งเตือนเมื่อออเดอร์ถูกปฏิเสธ/คืนเงิน (CANCELLED)
// ─────────────────────────────────────────────────────────────────────────────
export function buildOrderCancelledStudentFlex(
  order: Order,
  reason: string,
  appUrl: string = 'https://swsc69.vercel.app'
) {
  return {
    type: 'flex',
    altText: `❌ ออเดอร์ #${order.orderCode} ถูกยกเลิก: ${reason}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#DC2626',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '❌ ออเดอร์ถูกปฏิเสธ / คืนเงิน',
            weight: 'bold',
            color: '#FFFFFF',
            size: 'md',
          },
          {
            type: 'text',
            text: `${order.shopName} (${order.stallName})`,
            color: '#FECACA',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: 'สาเหตุการยกเลิก:',
            size: 'xs',
            weight: 'bold',
            color: '#64748B',
          },
          {
            type: 'text',
            text: reason || 'สลิปไม่ถูกต้อง หรือวัตถุดิบหมด',
            size: 'sm',
            weight: 'bold',
            color: '#DC2626',
            wrap: true,
          },
          {
            type: 'text',
            text: 'แม่ค้าจะทำการโอนเงินคืนเข้าบัญชีพร้อมเพย์ที่ท่านระบุไว้',
            size: 'xxs',
            color: '#64748B',
            margin: 'sm',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#475569',
            action: {
              type: 'uri',
              label: 'ตรวจสอบรายละเอียดตั๋ว',
              uri: getLiffAppUrl('/orders'),
            },
          },
        ],
      },
    },
  };
}
