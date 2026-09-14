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

/**
 * Rotates an image Data URL by specified degrees (e.g. 90, -90, 180, 270)
 */
export async function rotateImage(
  base64DataUrl: string,
  degrees: number,
  quality = 0.9
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const normalizedDeg = ((degrees % 360) + 360) % 360;
      const rad = (normalizedDeg * Math.PI) / 180;
      const is90or270 = normalizedDeg === 90 || normalizedDeg === 270;

      canvas.width = is90or270 ? img.height : img.width;
      canvas.height = is90or270 ? img.width : img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context error'));
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const mimeType = 'image/jpeg';
      const base64 = canvas.toDataURL(mimeType, quality);
      resolve({ base64, mimeType });
    };
    img.onerror = (err) => reject(new Error('이미지 회전 실패: ' + err));
    img.src = base64DataUrl;
  });
}

/**
 * Flips an image horizontally (좌우 반전) or vertically (상하 반전)
 */
export async function flipImage(
  base64DataUrl: string,
  direction: 'horizontal' | 'vertical',
  quality = 0.9
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context error'));
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      if (direction === 'horizontal') {
        ctx.scale(-1, 1);
        ctx.drawImage(img, -img.width, 0);
      } else {
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, -img.height);
      }
      ctx.restore();

      const mimeType = 'image/jpeg';
      const base64 = canvas.toDataURL(mimeType, quality);
      resolve({ base64, mimeType });
    };
    img.onerror = (err) => reject(new Error('이미지 반전 실패: ' + err));
    img.src = base64DataUrl;
  });
}

/**
 * Automatically detects image orientation using AI and straightens it upright
 */
export async function autoDetectAndStraightenImage(
  base64DataUrl: string,
  mimeType = 'image/jpeg'
): Promise<{ base64: string; mimeType: string; rotationApplied: number; description?: string }> {
  try {
    const res = await fetch('/api/auto-orient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64DataUrl, mimeType }),
    });

    if (!res.ok) {
      throw new Error('AI 방향 감지 서버 응답 오류');
    }

    const data = await res.json();
    const rotationDegrees = typeof data.rotationDegrees === 'number' ? data.rotationDegrees : 0;

    if (rotationDegrees === 0) {
      return {
        base64: base64DataUrl,
        mimeType,
        rotationApplied: 0,
        description: data.description || '이미 정방향으로 바르게 서 있습니다.',
      };
    }

    // Apply rotation
    const rotated = await rotateImage(base64DataUrl, rotationDegrees);
    return {
      base64: rotated.base64,
      mimeType: rotated.mimeType,
      rotationApplied: rotationDegrees,
      description: data.description || `${rotationDegrees}° 회전하여 똑바로 맞췄습니다.`,
    };
  } catch (err: any) {
    console.error('Auto straighten error:', err);
    throw err;
  }
}

