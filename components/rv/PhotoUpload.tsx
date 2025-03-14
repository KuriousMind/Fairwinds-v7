import React, { useState, useRef } from 'react';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV } from '@/types/models';
import { compressImage, validateImageFile } from '@/lib/image/compression';

interface PhotoUploadProps {
  rv: RV;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * PhotoUpload component for adding new photos with client-side compression
 * 
 * Features:
 * - File selection
 * - Drag and drop
 * - Image preview
 * - Client-side compression
 * - Upload to S3 (via base64)
 */
const PhotoUpload: React.FC<PhotoUploadProps> = ({ rv, onSuccess, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Maximum file size in MB
  const MAX_FILE_SIZE = 5;
  // Maximum number of photos allowed
  const MAX_PHOTOS = 12;
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      if (!validateImageFile(file, MAX_FILE_SIZE)) {
        setError(`Please select a valid image file under ${MAX_FILE_SIZE}MB.`);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type and size
      if (!validateImageFile(file, MAX_FILE_SIZE)) {
        setError(`Please select a valid image file under ${MAX_FILE_SIZE}MB.`);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Prevent default behavior for drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Handle upload button click
  const handleUpload = async () => {
    if (!selectedFile || !rv) return;
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Check if we've reached the photo limit
      if (rv.photos && rv.photos.length >= MAX_PHOTOS) {
        throw new Error(`You can only upload a maximum of ${MAX_PHOTOS} photos.`);
      }
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev + 10;
          return next > 90 ? 90 : next;
        });
      }, 300);
      
      // Compress the image
      const compressedBlob = await compressImage(selectedFile);
      
      // Convert to base64 for storage
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert image to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });
      
      const base64Data = await base64Promise;
      
      // Update the RV with the new photo
      const updatedPhotos = [...(rv.photos || []), base64Data];
      
      await client.models.RV.update({
        id: rv.id,
        photos: updatedPhotos,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Notify parent of success
      onSuccess();
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(handleApiError(error));
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-navy mb-6">Upload Photo</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* File drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          preview ? 'border-blue' : 'border-gray-300 hover:border-blue'
        } transition-colors`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {preview ? (
          <div className="flex flex-col items-center">
            <div className="photo-container mb-4 rounded" style={{ maxHeight: '200px', width: '200px' }}>
              <img
                src={preview}
                alt="Preview"
                className="photo-img"
              />
            </div>
            <p className="text-sm text-gray-500">
              Click to select a different photo
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-navy font-medium mb-1">
              Click to select or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              JPG, PNG, or GIF (max. {MAX_FILE_SIZE}MB)
            </p>
          </div>
        )}
      </div>
      
      {/* Upload progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isUploading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`px-4 py-2 rounded-md text-white transition-colors ${
            !selectedFile || isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue hover:bg-orange'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </div>
    </div>
  );
};

export default PhotoUpload;
