import { NextRequest, NextResponse } from 'next/server';

const GAS_WEBAPP_URL =
  process.env.GOOGLE_SCRIPT_WEBAPP_URL ||
  'https://script.google.com/macros/s/AKfycbzDxTGbEUnvNyOwr4HV3YL-dx0xoId8qqFCJSxCsE-MXrMSJ2XpPn9ZTFec9EEPvkiF/exec';

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

    // 1. Primary: Upload via Google Apps Script Web App (runs as user, no service account quota limits!)
    if (GAS_WEBAPP_URL) {
      try {
        const gasRes = await fetch(GAS_WEBAPP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            base64Data,
            fileName: safeFileName,
            shopName: shopName || 'ส่วนกลางโรงเรียน',
            category: category || 'ทั่วไป',
            includeDate: includeDate !== false,
          }),
          redirect: 'follow',
        });

        if (gasRes.ok) {
          const gasData = await gasRes.json();
          if (gasData.success) {
            return NextResponse.json({
              success: true,
              fileId: gasData.fileId,
              fileUrl: gasData.fileUrl || `https://drive.google.com/thumbnail?id=${gasData.fileId}&sz=w1000`,
              folderPath: gasData.folderPath || `${shopName || 'ส่วนกลางโรงเรียน'} / ${category || 'ทั่วไป'}`,
              message: `อัปโหลดภาพเข้า Google Drive (${gasData.folderPath || shopName}) เรียบร้อยแล้ว 📁`,
            });
          } else if (gasData.message) {
            console.warn('GAS error response:', gasData.message);
          }
        }
      } catch (gasErr: any) {
        console.warn('GAS fetch error, trying fallback:', gasErr?.message);
      }
    }

    // 2. Fallback to direct Base64 cloud representation if Google Drive fails
    return NextResponse.json({
      success: true,
      fileUrl: base64Data,
      folderPath: `${shopName || 'ส่วนกลางโรงเรียน'} / ${category || 'ทั่วไป'}`,
      message: 'บันทึกรูปภาพเรียบร้อยแล้ว 📁',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
