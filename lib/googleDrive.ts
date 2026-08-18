import { google } from 'googleapis';
import { Readable } from 'stream';

function cleanFolderId(id: string): string {
  if (!id) return '';
  let cleaned = id.trim();
  if (cleaned.includes('/folders/')) {
    cleaned = cleaned.split('/folders/')[1];
  }
  if (cleaned.includes('?')) {
    cleaned = cleaned.split('?')[0];
  }
  return cleaned.replace(/\/+$/, '').trim();
}

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const rawFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
const rootFolderId = cleanFolderId(rawFolderId);

export const isGoogleDriveConfigured = Boolean(
  clientEmail &&
  privateKey &&
  rootFolderId &&
  !clientEmail.includes('placeholder')
);

/**
 * Cache for folder IDs to prevent unnecessary roundtrip API lookups
 */
const folderCache = new Map<string, string>();

/**
 * Search or create a subfolder inside a parent Google Drive folder
 */
async function getOrCreateSubfolder(
  drive: any,
  parentId: string,
  folderName: string
): Promise<string> {
  const cacheKey = `${parentId}::${folderName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey)!;
  }

  try {
    // Search if folder already exists
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and '${parentId}' in parents and trashed=false`;
    const searchRes = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      const existingId = searchRes.data.files[0].id;
      folderCache.set(cacheKey, existingId);
      return existingId;
    }

    // Create new folder
    const createRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });

    const newFolderId = createRes.data.id;
    folderCache.set(cacheKey, newFolderId);
    return newFolderId;
  } catch (error) {
    console.warn(`Error resolving subfolder "${folderName}":`, error);
    return parentId; // fallback to parent if folder creation fails
  }
}

/**
 * Upload a Base64 image file to Google Drive with nested folder hierarchy:
 * Root ➜ [Shop Name] ➜ [Category] ➜ [YYYY-MM-DD (optional)]
 */
export async function uploadImageToGoogleDrive(
  base64Data: string,
  fileName: string,
  options?: {
    shopName?: string;
    category?: 'สลิปชำระเงิน' | 'สลิปคืนเงิน' | 'รูปเมนูอาหาร' | 'สลิปค่าแรกเข้า' | 'ทดสอบระบบ' | string;
    includeDate?: boolean;
  }
): Promise<{ success: boolean; fileUrl?: string; fileId?: string; folderPath?: string; message: string }> {
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
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Determine target folder hierarchy
    let currentFolderId = rootFolderId;
    const pathParts: string[] = [];

    // 1. Shop Level (e.g. "ร้านข้าวมันไก่ ป้าณี" or "ส่วนกลางโรงเรียน")
    const shopName = options?.shopName?.trim() || 'ส่วนกลางโรงเรียน';
    currentFolderId = await getOrCreateSubfolder(drive, currentFolderId, shopName);
    pathParts.push(shopName);

    // 2. Category Level (e.g. "สลิปชำระเงิน", "สลิปคืนเงิน", "รูปเมนูอาหาร")
    if (options?.category) {
      const category = options.category.trim();
      currentFolderId = await getOrCreateSubfolder(drive, currentFolderId, category);
      pathParts.push(category);
    }

    // 3. Date Level (e.g. "2026-08-19" for daily slips)
    if (options?.includeDate !== false && (options?.category === 'สลิปชำระเงิน' || options?.category === 'สลิปคืนเงิน')) {
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      currentFolderId = await getOrCreateSubfolder(drive, currentFolderId, todayStr);
      pathParts.push(todayStr);
    }

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
        parents: [currentFolderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;
    if (fileId) {
      // Set public read permissions
      try {
        await drive.permissions.create({
          fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
          supportsAllDrives: true,
        });
      } catch (permErr) {}

      const directImageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
      const fullPathStr = pathParts.join(' / ');

      return {
        success: true,
        fileId,
        fileUrl: directImageUrl,
        folderPath: fullPathStr,
        message: `อัปโหลดภาพเข้า Google Drive (${fullPathStr}) เรียบร้อยแล้ว 📁`,
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
