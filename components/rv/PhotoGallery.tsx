import React, { useState, useRef, useEffect } from 'react';
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
  onPhotosReordered?: (photos: string[]) => void;
}

/**
 * PhotoGallery component for displaying and managing RV photos
 * 
 * Features:
 * - Grid layout for photos
 * - Photo deletion
 * - Enhanced photo preview with navigation
 * - Photo reordering with drag and drop
 * - Zoom functionality
 * - Upload button
 */
const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  rv,
  isLoading,
  onPhotoAdded,
  onPhotoDeleted,
  onPhotosReordered,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(-1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs for drag and drop
  const dragSourceIndex = useRef<number | null>(null);
  const dragTargetIndex = useRef<number | null>(null);
  
  // Maximum number of photos allowed
  const MAX_PHOTOS = 12;
  
  // Initialize photos from rv.photos
  useEffect(() => {
    if (rv.photos) {
      setPhotos([...rv.photos]);
    }
  }, [rv.photos]);
  
  // Handle photo selection
  const handleSelectPhoto = (photo: string, index: number) => {
    setSelectedPhoto(photo);
    setSelectedPhotoIndex(index);
    setZoomLevel(1); // Reset zoom level when selecting a new photo
  };
  
  // Handle photo deletion
  const handleDeletePhoto = async () => {
    if (!selectedPhoto || !rv || !photos.length) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Filter out the selected photo
      const updatedPhotos = photos.filter(photo => photo !== selectedPhoto);
      
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
      
      // Update local photos state
      setPhotos(updatedPhotos);
      
      // Close the preview and notify parent
      setSelectedPhoto(null);
      setSelectedPhotoIndex(-1);
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
  
  // Navigate to previous photo
  const handlePrevPhoto = () => {
    if (!photos.length || selectedPhotoIndex <= 0) return;
    
    const newIndex = selectedPhotoIndex - 1;
    setSelectedPhotoIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
    setZoomLevel(1); // Reset zoom level
  };
  
  // Navigate to next photo
  const handleNextPhoto = () => {
    if (!photos.length || selectedPhotoIndex >= photos.length - 1) return;
    
    const newIndex = selectedPhotoIndex + 1;
    setSelectedPhotoIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
    setZoomLevel(1); // Reset zoom level
  };
  
  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)); // Min zoom 0.5x
  };
  
  // Handle zoom reset
  const handleZoomReset = () => {
    setZoomLevel(1);
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, photo: string, index: number) => {
    setIsDragging(true);
    setDraggedPhoto(photo);
    dragSourceIndex.current = index;
    
    // Required for Firefox
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Make the dragged item semi-transparent
    if (e.currentTarget.style) {
      e.currentTarget.style.opacity = '0.4';
    }
  };
  
  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setDraggedPhoto(null);
    setDraggedOverIndex(null);
    dragSourceIndex.current = null;
    
    // Reset opacity
    if (e.currentTarget.style) {
      e.currentTarget.style.opacity = '1';
    }
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedPhoto === null) return;
    
    setDraggedOverIndex(index);
    dragTargetIndex.current = index;
  };
  
  // Handle drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    
    if (draggedPhoto === null || dragSourceIndex.current === null) return;
    
    // Don't do anything if dropped on the same item
    if (dragSourceIndex.current === index) {
      setIsDragging(false);
      setDraggedPhoto(null);
      setDraggedOverIndex(null);
      dragSourceIndex.current = null;
      dragTargetIndex.current = null;
      return;
    }
    
    // Create a new array with the reordered photos
    const newPhotos = [...photos];
    const [movedPhoto] = newPhotos.splice(dragSourceIndex.current, 1);
    newPhotos.splice(index, 0, movedPhoto);
    
    // Update the local state
    setPhotos(newPhotos);
    setIsDragging(false);
    setDraggedPhoto(null);
    setDraggedOverIndex(null);
    
    // Save the new order to the database
    await savePhotoOrder(newPhotos);
  };
  
  // Save the new photo order to the database
  const savePhotoOrder = async (newPhotos: string[]) => {
    if (!rv) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Update the RV with the new photos array
      await client.models.RV.update({
        id: rv.id,
        photos: newPhotos,
      });
      
      // Notify parent of reordering
      if (onPhotosReordered) {
        onPhotosReordered(newPhotos);
      }
    } catch (error) {
      console.error('Error saving photo order:', error);
      setError(handleApiError(error));
      
      // Revert to original order on error
      if (rv.photos) {
        setPhotos([...rv.photos]);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevPhoto();
          break;
        case 'ArrowRight':
          handleNextPhoto();
          break;
        case 'Escape':
          setSelectedPhoto(null);
          setSelectedPhotoIndex(-1);
          break;
        case '+':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleZoomReset();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhoto, selectedPhotoIndex, photos]);
  
  // Render loading state
  if (isLoading) {
    return <LoadingState message="Loading photos..." />;
  }
  
  // Render empty state if no photos
  if (!photos || photos.length === 0) {
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
      
      {isSaving && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
          Saving photo order...
        </div>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
        <p className="text-sm">
          <strong>Tip:</strong> Drag and drop photos to reorder them. Click on a photo to view it in full size.
        </p>
      </div>
      
      {/* Photo grid */}
      <div className="photo-grid grid-cols-2 md:grid-cols-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`photo-container cursor-pointer hover:opacity-90 transition-opacity relative ${
              draggedOverIndex === index ? 'border-2 border-blue-500' : ''
            }`}
            onClick={() => handleSelectPhoto(photo, index)}
            draggable
            onDragStart={(e) => handleDragStart(e, photo, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <S3Image
              s3Key={photo}
              alt={`RV photo ${index + 1}`}
              className="photo-img"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center">
              {index + 1}
            </div>
          </div>
        ))}
        
        {/* Add photo button (if under limit) */}
        {photos.length < MAX_PHOTOS && (
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
      
      {/* Enhanced photo preview modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 flex justify-between items-center border-b">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-navy">
                  Photo {selectedPhotoIndex + 1} of {photos.length}
                </h3>
                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 rounded-full hover:bg-gray-200"
                    title="Zoom out"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <button
                    onClick={handleZoomReset}
                    className="p-1 rounded-full hover:bg-gray-200"
                    title="Reset zoom"
                  >
                    <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 rounded-full hover:bg-gray-200"
                    title="Zoom in"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPhoto(null);
                  setSelectedPhotoIndex(-1);
                }}
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
            
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-900 p-2 relative">
              {/* Previous button */}
              {selectedPhotoIndex > 0 && (
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Photo container with zoom */}
              <div 
                className="photo-container overflow-auto" 
                style={{ 
                  maxHeight: '60vh', 
                  width: 'auto', 
                  height: 'auto',
                  cursor: 'move'
                }}
              >
                <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}>
                  <S3Image
                    s3Key={selectedPhoto}
                    alt={`RV photo ${selectedPhotoIndex + 1}`}
                    className="photo-img object-contain"
                    height={600}
                  />
                </div>
              </div>
              
              {/* Next button */}
              {selectedPhotoIndex < photos.length - 1 && (
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Use arrow keys to navigate, + and - to zoom
              </div>
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
