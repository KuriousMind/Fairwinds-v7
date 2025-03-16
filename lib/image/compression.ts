/**
 * Image compression utilities using the Canvas API
 * 
 * This module provides functions for client-side image compression:
 * - Auto-resize to max 1920px dimension (maintaining aspect ratio)
 * - JPEG compression (quality: 0.8)
 * - Uses native browser APIs only, no additional dependencies
 * - File validation and size formatting
 */

// Maximum dimension for resized images
const MAX_DIMENSION = 1920;
// JPEG compression quality (0.0 to 1.0)
const COMPRESSION_QUALITY = 0.8;

/**
 * Compresses an image file using the Canvas API
 * 
 * @param file - The image file to compress
 * @returns A Promise that resolves to a compressed Blob
 */
export const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Create an image element to load the file
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > MAX_DIMENSION) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
      
      // Create a canvas element for resizing and compression
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        COMPRESSION_QUALITY
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load the image from the file
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Converts a compressed image blob to a base64 data URL
 * 
 * @param blob - The compressed image blob
 * @returns A Promise that resolves to a base64 data URL
 */
export const blobToDataURL = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read blob'));
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Validates if a file is an image and within size limits
 * 
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns True if the file is valid, false otherwise
 */
export const validateImageFile = (file: File, maxSizeMB = 5): boolean => {
  // Check if the file is an image
  if (!file.type.startsWith('image/')) {
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
 * Formats a file size in bytes to a human-readable string
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
