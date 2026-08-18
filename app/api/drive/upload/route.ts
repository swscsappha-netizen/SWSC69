import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToGoogleDrive, isGoogleDriveConfigured } from '@/lib/googleDrive';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64Data, fileName, shopName, category, includeDate } = body;

    if (!base64Data) {
      return NextResponse.json(
        { success: false, message: 'Missing base64Data' },
        { status: 400 }
      );
    }

    const safeFileName = fileName || `file_${Date.now()}.jpg`;

    if (isGoogleDriveConfigured) {
      const result = await uploadImageToGoogleDrive(base64Data, safeFileName, {
        shopName,
        category,
        includeDate,
      });
      return NextResponse.json(result);
    } else {
      // Graceful fallback to data url
      return NextResponse.json({
        success: true,
        fileUrl: base64Data,
        message: 'Google Drive ยังไม่ได้ตั้งค่าคีย์ API (ใช้ระบบบันทึกรูปภาพ Cloud อัตโนมัติ)',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
