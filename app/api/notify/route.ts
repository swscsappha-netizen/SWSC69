import { NextRequest, NextResponse } from 'next/server';
import {
  sendLinePushMessage,
  buildNewOrderMerchantFlex,
  buildOrderConfirmedStudentFlex,
  buildOrderReadyStudentFlex,
  buildOrderCancelledStudentFlex,
  isLineMessagingConfigured,
} from '@/lib/lineMessaging';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, targetLineUserId, order, reason } = body;

    if (!type || !targetLineUserId) {
      return NextResponse.json(
        { success: false, message: 'Missing type or targetLineUserId' },
        { status: 400 }
      );
    }

    if (!isLineMessagingConfigured) {
      return NextResponse.json({
        success: true,
        message: 'LINE_CHANNEL_ACCESS_TOKEN ยังไม่ได้ตั้งค่า (ระบบจำลองการส่งการแจ้งเตือนสำเร็จ)',
      });
    }

    let flexMessage: any = null;

    if (type === 'NEW_ORDER' && order) {
      flexMessage = buildNewOrderMerchantFlex(order);
    } else if (type === 'ORDER_CONFIRMED' && order) {
      flexMessage = buildOrderConfirmedStudentFlex(order);
    } else if (type === 'ORDER_READY' && order) {
      flexMessage = buildOrderReadyStudentFlex(order);
    } else if (type === 'ORDER_CANCELLED' && order) {
      flexMessage = buildOrderCancelledStudentFlex(order, reason || 'สลิปไม่ถูกต้อง');
    } else if (type === 'TEST') {
      flexMessage = {
        type: 'flex',
        altText: '🔔 ทดสอบการแจ้งเตือนจาก Sappha PreOrder',
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#059669',
            paddingAll: '16px',
            contents: [
              {
                type: 'text',
                text: '🔔 ทดสอบการแจ้งเตือนสำเร็จ!',
                weight: 'bold',
                color: '#FFFFFF',
                size: 'md',
              },
            ],
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'ระบบ LINE Push Notification เชื่อมต่อกับ Sappha PreOrder เรียบร้อยแล้ว 🚀',
                size: 'xs',
                color: '#334155',
                wrap: true,
              },
            ],
          },
        },
      };
    }

    if (flexMessage) {
      const res = await sendLinePushMessage(targetLineUserId, [flexMessage]);
      return NextResponse.json(res);
    }

    return NextResponse.json(
      { success: false, message: 'Invalid notification payload' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Notification error' },
      { status: 500 }
    );
  }
}
