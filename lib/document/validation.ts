/**
 * Document validation utilities
 * 
 * This module provides functions for validating document files:
 * - File type validation (PDF, DOC, DOCX, etc.)
 * - File size validation
 */

// Allowed document file types
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/rtf',
];

// File type to display name mapping
export const DOCUMENT_TYPE_NAMES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'text/plain': 'TXT',
  'application/rtf': 'RTF',
};

/**
 * Validates if a file is a document and within size limits
 * 
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 * @returns True if the file is valid, false otherwise
 */
export const validateDocumentFile = (file: File, maxSizeMB = 10): boolean => {
  // Check if the file type is allowed
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return false;
  }
  
  // Check if the file size is within limits
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return false;
  }
  
  return true;
};

/**
 * Gets a human-readable file type name from a MIME type
 * 
 * @param mimeType - The MIME type of the file
 * @returns A human-readable file type name
 */
export const getDocumentTypeName = (mimeType: string): string => {
  return DOCUMENT_TYPE_NAMES[mimeType] || 'Document';
};

/**
 * Gets a file size in a human-readable format
 * 
 * @param bytes - The file size in bytes
 * @returns A human-readable file size (e.g., "1.5 MB")
 */
export const getFormattedFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
