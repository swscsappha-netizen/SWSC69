import { google } from 'googleapis';
import { Readable } from 'stream';

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

export const isGoogleDriveConfigured = Boolean(
  clientEmail &&
  privateKey &&
  folderId &&
  !clientEmail.includes('placeholder')
);

/**
 * Upload a Base64 image file to Google Drive folder using Service Account
 */
export async function uploadImageToGoogleDrive(
  base64Data: string,
  fileName: string
): Promise<{ success: boolean; fileUrl?: string; fileId?: string; message: string }> {
  if (!isGoogleDriveConfigured) {
    return {
      success: false,
      message: 'Google Drive is not configured in .env.local (fallback to cloud storage)',
    };
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Clean Base64 format
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const rawData = matches ? matches[2] : base64Data;
    const buffer = Buffer.from(rawData, 'base64');

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = res.data.id;
    // Set permission to public read
    if (fileId) {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const directImageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
      return {
        success: true,
        fileId,
        fileUrl: directImageUrl,
        message: 'อัปโหลดภาพเข้าสู่ Google Drive เรียบร้อยแล้ว 📁',
      };
    }

    return {
      success: false,
      message: 'ไม่สามารถสร้างไฟล์ใน Google Drive ได้',
    };
  } catch (error: any) {
    console.warn('Google Drive Upload Error:', error);
    return {
      success: false,
      message: error?.message || 'เกิดข้อผิดพลาดในการอัปโหลดเข้า Google Drive',
    };
  }
}
