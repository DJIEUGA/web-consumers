import imageCompression from 'browser-image-compression';

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
]);

export const compressImageForUpload = async (file: File): Promise<File> => {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return file;
  }

  try {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8,
    });
  } catch {
    // Fall back to original file if compression fails.
    return file;
  }
};

export const createMultipartDataPayload = (data: unknown): FormData => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  return formData;
};
