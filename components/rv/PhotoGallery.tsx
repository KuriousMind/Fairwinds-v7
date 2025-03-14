import React, { useState } from 'react';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV } from '@/types/models';
import LoadingState from '@/components/common/ui/LoadingState';
import S3Image from '@/components/common/ui/S3Image';
import { deleteFromS3 } from '@/lib/storage/s3';

interface PhotoGalleryProps {
  rv: RV;
  isLoading: boolean;
  onPhotoAdded?: () => void;
  onPhotoDeleted?: () => void;
}

/**
 * PhotoGallery component for displaying and managing RV photos
 * 
 * Features:
 * - Grid layout for photos
 * - Photo deletion
 * - Photo preview
 * - Upload button
 */
const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  rv,
  isLoading,
  onPhotoAdded,
  onPhotoDeleted,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Maximum number of photos allowed
  const MAX_PHOTOS = 12;
  
  // Handle photo deletion
  const handleDeletePhoto = async () => {
    if (!selectedPhoto || !rv || !rv.photos) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Filter out the selected photo
      const updatedPhotos = rv.photos.filter(photo => photo !== selectedPhoto);
      
      // Update the RV with the new photos array
      await client.models.RV.update({
        id: rv.id,
        photos: updatedPhotos,
      });
      
      // Delete from S3 if it's not a base64 string
      if (!selectedPhoto.startsWith('data:image/')) {
        try {
          await deleteFromS3(selectedPhoto);
        } catch (s3Error) {
          console.error('Error deleting from S3:', s3Error);
          // Continue even if S3 deletion fails
        }
      }
      
      // Close the preview and notify parent
      setSelectedPhoto(null);
      if (onPhotoDeleted) {
        onPhotoDeleted();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError(handleApiError(error));
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return <LoadingState message="Loading photos..." />;
  }
  
  // Render empty state if no photos
  if (!rv.photos || rv.photos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No photos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add photos of your RV to keep track of its appearance.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Photo grid */}
      <div className="photo-grid grid-cols-2 md:grid-cols-3">
        {rv.photos.map((photo, index) => (
          <div
            key={index}
            className="photo-container cursor-pointer hover:opacity-90 transition-opacity relative"
            onClick={() => setSelectedPhoto(photo)}
          >
            <S3Image
              s3Key={photo}
              alt={`RV photo ${index + 1}`}
              className="photo-img"
            />
          </div>
        ))}
        
        {/* Add photo button (if under limit) */}
        {rv.photos.length < MAX_PHOTOS && (
          <div
            className="photo-container flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
            onClick={() => onPhotoAdded && onPhotoAdded()}
          >
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="mt-2 text-sm text-gray-500">Add Photo</span>
          </div>
        )}
      </div>
      
      {/* Photo preview modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="text-lg font-medium text-navy">Photo Preview</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-2">
              <div className="photo-container" style={{ maxHeight: '60vh', width: 'auto', height: 'auto' }}>
                <S3Image
                  s3Key={selectedPhoto}
                  alt="RV photo preview"
                  className="photo-img object-contain"
                  height={600}
                />
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={handleDeletePhoto}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
