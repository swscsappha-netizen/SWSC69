/**
 * Helper to upload image (File or Base64) to Google Drive via /api/drive/upload
 * Supports nested subfolders: Root ➜ [Shop Name] ➜ [Category] ➜ [YYYY-MM-DD]
 */
export async function uploadImage(
  fileOrBase64: File | string,
  fileName?: string,
  options?: {
    shopName?: string;
    category?: 'สลิปชำระเงิน' | 'สลิปคืนเงิน' | 'รูปเมนูอาหาร' | 'สลิปค่าแรกเข้า' | 'ทดสอบระบบ' | string;
    includeDate?: boolean;
  }
): Promise<{ success: boolean; fileUrl: string; folderPath?: string; message: string }> {
  try {
    let base64Data = '';
    let name = fileName || `img_${Date.now()}.jpg`;

    if (typeof fileOrBase64 === 'string') {
      base64Data = fileOrBase64;
    } else {
      name = fileName || fileOrBase64.name || `file_${Date.now()}.jpg`;
      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64);
      });
    }

    const res = await fetch('/api/drive/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data,
        fileName: name,
        shopName: options?.shopName,
        category: options?.category,
        includeDate: options?.includeDate,
      }),
    });

    if (!res.ok) {
      throw new Error(`Upload API returned status ${res.status}`);
    }

    const data = await res.json();
    return {
      success: data.success !== false,
      fileUrl: data.fileUrl || base64Data,
      folderPath: data.folderPath,
      message: data.message || 'อัปโหลดภาพสำเร็จ',
    };
  } catch (error: any) {
    console.warn('Upload helper fallback:', error);
    return {
      success: false,
      fileUrl: typeof fileOrBase64 === 'string' ? fileOrBase64 : '',
      message: error?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ',
    };
  }
}
