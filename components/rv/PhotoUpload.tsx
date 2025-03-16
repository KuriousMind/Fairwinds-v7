import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV } from '@/types/models';
import { compressImage, validateImageFile, getFormattedFileSize } from '@/lib/image/compression';
import { uploadToS3 } from '@/lib/storage/s3';

interface PhotoUploadProps {
  rv: RV;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
  progress: number;
  error?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  s3Key?: string;
}

/**
 * PhotoUpload component for adding new photos with client-side compression
 * 
 * Features:
 * - Multiple file selection
 * - Drag and drop
 * - Image preview carousel
 * - Client-side compression
 * - Batch upload with individual progress
 * - Upload to S3
 */
const PhotoUpload: React.FC<PhotoUploadProps> = ({ rv, onSuccess, onCancel }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(12);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Maximum file size in MB
  const MAX_FILE_SIZE = 5;
  // Maximum number of photos allowed
  const MAX_PHOTOS = 12;
  
  // Calculate remaining slots
  useEffect(() => {
    if (rv && rv.photos) {
      const available = MAX_PHOTOS - rv.photos.length;
      setRemainingSlots(available > 0 ? available : 0);
    } else {
      setRemainingSlots(MAX_PHOTOS);
    }
  }, [rv]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Convert FileList to array
    const filesArray = Array.from(e.target.files);
    
    // Check if we have enough slots
    if (filesArray.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more photo${remainingSlots !== 1 ? 's' : ''}.`);
      return;
    }
    
    // Process each file
    const newFiles: FileWithPreview[] = [];
    const filePromises = filesArray.map(file => {
      return new Promise<FileWithPreview | null>((resolve) => {
        // Validate file type and size
        if (!validateImageFile(file, MAX_FILE_SIZE)) {
          resolve({
            file,
            preview: '',
            progress: 0,
            error: `${file.name}: Invalid file type or exceeds ${MAX_FILE_SIZE}MB limit`,
            status: 'error'
          });
          return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve({
              file,
              preview: e.target.result as string,
              progress: 0,
              status: 'pending'
            });
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });
    
    // Wait for all files to be processed
    Promise.all(filePromises).then(results => {
      const validFiles = results.filter(result => result !== null) as FileWithPreview[];
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setError(null);
      
      // Set active preview to the first new file
      if (validFiles.length > 0 && selectedFiles.length === 0) {
        setActivePreviewIndex(0);
      }
    });
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    
    // Convert FileList to array
    const filesArray = Array.from(e.dataTransfer.files);
    
    // Check if we have enough slots
    if (filesArray.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more photo${remainingSlots !== 1 ? 's' : ''}.`);
      return;
    }
    
    // Process each file
    const newFiles: FileWithPreview[] = [];
    const filePromises = filesArray.map(file => {
      return new Promise<FileWithPreview | null>((resolve) => {
        // Validate file type and size
        if (!validateImageFile(file, MAX_FILE_SIZE)) {
          resolve({
            file,
            preview: '',
            progress: 0,
            error: `${file.name}: Invalid file type or exceeds ${MAX_FILE_SIZE}MB limit`,
            status: 'error'
          });
          return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve({
              file,
              preview: e.target.result as string,
              progress: 0,
              status: 'pending'
            });
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });
    
    // Wait for all files to be processed
    Promise.all(filePromises).then(results => {
      const validFiles = results.filter(result => result !== null) as FileWithPreview[];
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setError(null);
      
      // Set active preview to the first new file
      if (validFiles.length > 0 && selectedFiles.length === 0) {
        setActivePreviewIndex(0);
      }
    });
  };
  
  // Prevent default behavior for drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Remove a file from the selection
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      
      // Update active preview index if needed
      if (newFiles.length === 0) {
        setActivePreviewIndex(-1);
      } else if (activePreviewIndex >= newFiles.length) {
        setActivePreviewIndex(newFiles.length - 1);
      } else if (activePreviewIndex === index && index > 0) {
        setActivePreviewIndex(index - 1);
      }
      
      return newFiles;
    });
  };
  
  // Navigate to previous preview
  const handlePrevPreview = () => {
    if (activePreviewIndex > 0) {
      setActivePreviewIndex(prev => prev - 1);
    }
  };
  
  // Navigate to next preview
  const handleNextPreview = () => {
    if (activePreviewIndex < selectedFiles.length - 1) {
      setActivePreviewIndex(prev => prev + 1);
    }
  };
  
  // Handle upload button click
  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !rv) return;
    
    // Check if we've reached the photo limit
    if (rv.photos && rv.photos.length >= MAX_PHOTOS) {
      setError(`You can only upload a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }
    
    // Check if we have enough slots
    if (selectedFiles.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more photo${remainingSlots !== 1 ? 's' : ''}.`);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    // Create a copy of the files array to update progress
    const files = [...selectedFiles];
    
    // Track uploaded S3 keys
    const uploadedKeys: string[] = [];
    
    try {
      // Process each file sequentially
      for (let i = 0; i < files.length; i++) {
        // Update file status
        files[i].status = 'uploading';
        setSelectedFiles([...files]);
        
        // Set active preview to current file
        setActivePreviewIndex(i);
        
        // Compress the image
        const compressedBlob = await compressImage(files[i].file);
        
        // Upload to S3 with progress updates
        const s3Key = await uploadToS3(compressedBlob, `rv-photos/${rv.id}`);
        
        // Update file status and progress
        files[i].status = 'success';
        files[i].progress = 100;
        files[i].s3Key = s3Key;
        setSelectedFiles([...files]);
        
        // Add to uploaded keys
        uploadedKeys.push(s3Key);
        
        // Update overall progress
        setOverallProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      // Update the RV with all the new S3 keys
      const updatedPhotos = [...(rv.photos || []), ...uploadedKeys];
      
      await client.models.RV.update({
        id: rv.id,
        photos: updatedPhotos,
      });
      
      // Notify parent of success
      onSuccess();
    } catch (error) {
      console.error('Error uploading photos:', error);
      setError(handleApiError(error));
      
      // If we have any successful uploads, we should still update the RV
      if (uploadedKeys.length > 0) {
        try {
          const updatedPhotos = [...(rv.photos || []), ...uploadedKeys];
          await client.models.RV.update({
            id: rv.id,
            photos: updatedPhotos,
          });
        } catch (updateError) {
          console.error('Error updating RV with partial uploads:', updateError);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-navy mb-4">Upload Photos</h2>
      <p className="text-sm text-gray-600 mb-4">
        You can upload up to {remainingSlots} more photo{remainingSlots !== 1 ? 's' : ''}.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* File drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          selectedFiles.length > 0 ? 'border-blue' : 'border-gray-300 hover:border-blue'
        } transition-colors`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          disabled={isUploading}
        />
        
        {selectedFiles.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Preview carousel */}
            <div className="relative w-full max-w-md mb-4">
              <div className="photo-container rounded overflow-hidden" style={{ height: '200px' }}>
                {selectedFiles[activePreviewIndex] && (
                  <Image
                    src={selectedFiles[activePreviewIndex].preview}
                    alt={`Preview ${activePreviewIndex + 1}`}
                    className="photo-img"
                    width={400}
                    height={200}
                    style={{ objectFit: 'contain', maxHeight: '200px' }}
                  />
                )}
                
                {/* File info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                  {selectedFiles[activePreviewIndex] && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="truncate mr-2">
                          {selectedFiles[activePreviewIndex].file.name}
                        </span>
                        <span>
                          {getFormattedFileSize(selectedFiles[activePreviewIndex].file.size)}
                        </span>
                      </div>
                      
                      {/* Status indicator */}
                      {selectedFiles[activePreviewIndex].status === 'uploading' && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue h-1.5 rounded-full"
                              style={{ width: `${selectedFiles[activePreviewIndex].progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {selectedFiles[activePreviewIndex].status === 'success' && (
                        <div className="text-green-400 mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Uploaded successfully
                        </div>
                      )}
                      
                      {selectedFiles[activePreviewIndex].status === 'error' && (
                        <div className="text-red-400 mt-1">
                          {selectedFiles[activePreviewIndex].error || 'Upload failed'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Navigation buttons */}
              {selectedFiles.length > 1 && (
                <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevPreview();
                    }}
                    className="bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-colors"
                    disabled={activePreviewIndex === 0 || isUploading}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextPreview();
                    }}
                    className="bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-colors"
                    disabled={activePreviewIndex === selectedFiles.length - 1 || isUploading}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Remove button */}
              {!isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(activePreviewIndex);
                  }}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Thumbnail strip */}
            {selectedFiles.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2 mb-2 w-full max-w-md">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`photo-container cursor-pointer rounded overflow-hidden ${
                      index === activePreviewIndex ? 'ring-2 ring-blue' : ''
                    }`}
                    style={{ width: '60px', height: '60px', flexShrink: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePreviewIndex(index);
                    }}
                  >
                    <Image
                      src={file.preview}
                      alt={`Thumbnail ${index + 1}`}
                      className="photo-img"
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover' }}
                    />
                    
                    {/* Status indicator */}
                    {file.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    {file.status === 'success' && (
                      <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    {file.status === 'error' && (
                      <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {!isUploading && (
              <p className="text-sm text-gray-500">
                Click to add more photos
              </p>
            )}
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
            <p className="text-sm text-gray-500 mb-1">
              JPG, PNG, or GIF (max. {MAX_FILE_SIZE}MB)
            </p>
            <p className="text-sm text-blue-600">
              You can select multiple photos at once
            </p>
          </div>
        )}
      </div>
      
      {/* Overall upload progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Uploading {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''}...</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue h-2.5 rounded-full"
              style={{ width: `${overallProgress}%` }}
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
          disabled={selectedFiles.length === 0 || isUploading}
          className={`px-4 py-2 rounded-md text-white transition-colors ${
            selectedFiles.length === 0 || isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue hover:bg-orange'
          }`}
        >
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
};

export default PhotoUpload;
