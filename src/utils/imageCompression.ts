import imageCompression from 'browser-image-compression';

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const IMAGE_EXTENSION_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const detectMimeFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension) return '';
  return IMAGE_EXTENSION_TO_MIME[extension] || '';
};

export const isSupportedImageMimeType = (mimeType: string): boolean =>
  SUPPORTED_IMAGE_TYPES.has((mimeType || '').toLowerCase());

export const normalizeImageFileForUpload = (file: File): File => {
  const resolvedType = file.type || detectMimeFromFileName(file.name);

  if (!resolvedType || !isSupportedImageMimeType(resolvedType)) {
    throw new Error('Format image non supporte. Utilisez JPG, PNG ou WebP.');
  }

  if (file.type === resolvedType) {
    return file;
  }

  return new File([file], file.name, {
    type: resolvedType,
    lastModified: file.lastModified,
  });
};

export const compressImageForUpload = async (file: File): Promise<File> => {
  const normalizedFile = normalizeImageFileForUpload(file);

  try {
    const compressed = await imageCompression(normalizedFile, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8,
      fileType: normalizedFile.type,
    });

    const compressedType = isSupportedImageMimeType(compressed.type)
      ? compressed.type
      : normalizedFile.type;

    return new File([compressed], compressed.name || normalizedFile.name, {
      type: compressedType,
      lastModified: Date.now(),
    });
  } catch {
    // Fall back to original file if compression fails.
    return normalizedFile;
  }
};

export const createMultipartDataPayload = (data: unknown): FormData => {
  const formData = new FormData();
  const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  formData.append('data', jsonBlob);
  return formData;
};
