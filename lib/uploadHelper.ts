/**
 * Helper to upload image (File or Base64) to Google Drive via /api/drive/upload
 */
export async function uploadImage(
  fileOrBase64: File | string,
  fileName?: string
): Promise<{ success: boolean; fileUrl: string; message: string }> {
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
      }),
    });

    if (!res.ok) {
      throw new Error(`Upload API returned status ${res.status}`);
    }

    const data = await res.json();
    return {
      success: data.success !== false,
      fileUrl: data.fileUrl || base64Data,
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
