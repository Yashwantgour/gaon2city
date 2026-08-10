import api from './api';

/**
 * Compress an image file using HTML Canvas to reduce base64 size (800px max width, 0.75 JPEG quality).
 */
async function compressImageFile(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

/**
 * Upload a file via Backend Admin Service to Supabase Storage.
 * If backend storage is unavailable or .env credentials are missing, falls back to compressed Base64 Data URL.
 */
export async function uploadFile(file) {
  const compressedBase64 = await compressImageFile(file);

  try {
    const res = await api.post('/products/upload', {
      image: compressedBase64,
      name: file.name,
    });
    if (res && res.url) {
      return res.url;
    }
  } catch (err) {
    console.warn('Storage upload API call failed, falling back to compressed base64 data URL:', err?.message || err);
  }

  return compressedBase64;
}
