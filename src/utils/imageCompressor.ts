/**
 * Utility to compress and resize images on client-side before upload.
 * Reduces 10~30MB smartphone camera photos to ~500KB while preserving sharp OCR text.
 */
export async function optimizeImageForOcr(
  fileOrBase64: File | string,
  maxWidth = 2048,
  maxHeight = 2048,
  quality = 0.85
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const processImage = () => {
      let { width, height } = img;

      // Maintain aspect ratio while bounding within maxWidth x maxHeight
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context is not supported.'));
        return;
      }

      // Fill white background in case of transparent PNG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw and smooth image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = 'image/jpeg';
      const base64 = canvas.toDataURL(mimeType, quality);
      resolve({ base64, mimeType });
    };

    img.onload = processImage;
    img.onerror = (err) => reject(new Error('이미지를 불러오는 데 실패했습니다: ' + err));

    if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = (err) => reject(new Error('파일 읽기 실패: ' + err));
      reader.readAsDataURL(fileOrBase64);
    }
  });
}
