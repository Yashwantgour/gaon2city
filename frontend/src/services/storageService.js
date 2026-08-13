import api from './api';

/**
 * Compress an image file using HTML Canvas (800px max width, 0.80 JPEG quality) before uploading.
 */
export async function compressImageFile(file, maxWidth = 1200, quality = 0.80) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
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
      URL.revokeObjectURL(url);
      reject(new Error('Failed to process image file'));
    };
    img.src = url;
  });
}

/**
 * Upload an image file to Supabase Storage via Backend API.
 * Strict Production Rule: Must fail explicitly if Supabase Storage is unavailable.
 * Never stores or returns a permanent base64 data URL.
 */
export async function uploadFile(file) {
  const compressedBase64 = await compressImageFile(file);

  const res = await api.post('/products/upload', {
    image: compressedBase64,
    name: file.name,
  });

  if (!res || !res.url) {
    throw new Error('Image upload failed. Storage did not return an object URL.');
  }

  return res.url;
}
