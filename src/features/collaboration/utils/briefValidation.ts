/**
 * Brief File Upload Validation Utilities
 * Based on Collaboration Brief API Integration Guide specifications
 */

// Maximum file size in bytes (10 MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Supported MIME types as per API guide
const SUPPORTED_MIME_TYPES = [
  'application/pdf',                                                           // PDF
  'image/jpeg',                                                               // JPEG
  'image/png',                                                                // PNG
  'image/gif',                                                                // GIF
  'application/msword',                                                       // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];

/**
 * Validation result object
 */
export interface FileValidationResult {
  valid: boolean;
  file: File;
  error?: string;
}

/**
 * Validates a single file for upload to brief
 * Checks file size and MIME type
 *
 * @param file - File to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateBriefFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      file,
      error: `Le fichier "${file.name}" dépasse la taille maximale de 10 MB.`,
    };
  }

  // Check MIME type
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      file,
      error: `Le fichier "${file.name}" a un type non supporté. Types acceptés: PDF, Images (JPEG/PNG/GIF), Documents Office (Word/Excel/PowerPoint).`,
    };
  }

  return {
    valid: true,
    file,
  };
}

/**
 * Validates multiple files for batch upload
 * Returns only the valid files and collects error messages
 *
 * @param files - Files to validate
 * @returns Object with validFiles and error messages
 */
export function validateBriefFiles(
  files: File[],
): {
  validFiles: File[];
  errors: string[];
} {
  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = validateBriefFile(file);
    if (result.valid) {
      validFiles.push(result.file);
    } else if (result.error) {
      errors.push(result.error);
    }
  }

  return { validFiles, errors };
}

/**
 * Formats bytes to human-readable size string
 *
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Gets the display name for a MIME type
 *
 * @param mimeType - MIME type string
 * @returns Display name (e.g., "PDF Document")
 */
export function getMimeTypeDisplayName(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF Document',
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
  };

  return typeMap[mimeType] || 'Document';
}
