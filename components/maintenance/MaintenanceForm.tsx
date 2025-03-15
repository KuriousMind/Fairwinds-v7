import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV, MaintenanceRecord } from '@/types/models';
import { compressImage, validateImageFile } from '@/lib/image/compression';
import { uploadToS3, deleteFromS3 } from '@/lib/storage/s3';
import LoadingState from '@/components/common/ui/LoadingState';
import S3Image from '@/components/common/ui/S3Image';

// Maintenance types for dropdown selection
const MAINTENANCE_TYPES = [
  'Regular Service',
  'Repair',
  'Inspection',
  'Upgrade',
  'Replacement',
  'Cleaning',
  'Completed',
  'Other'
];

interface MaintenanceFormProps {
  maintenanceRecord?: MaintenanceRecord | null;
  rv: RV;
  onSuccess?: () => void;
  onCancel?: () => void;
  completeMode?: boolean;
}

/**
 * MaintenanceForm component for adding/editing maintenance records
 * 
 * Features:
 * - Form for entering maintenance details
 * - Date selection
 * - Type selection from predefined options
 * - Notes field
 * - Photo upload (reusing existing functionality)
 * - Create/update functionality
 * - Complete mode for marking maintenance as completed
 */
const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  maintenanceRecord,
  rv,
  onSuccess,
  onCancel,
  completeMode = false,
}) => {
  const router = useRouter();
  const { user } = useAuthenticator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    type: completeMode ? 'Completed' : MAINTENANCE_TYPES[0],
    notes: '',
  });
  
  // Photo upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Maximum file size in MB
  const MAX_FILE_SIZE = 5;
  // Maximum number of photos allowed
  const MAX_PHOTOS = 5;
  
  // Initialize form with existing maintenance record data if available
  useEffect(() => {
    if (maintenanceRecord) {
      setFormData({
        title: maintenanceRecord.title || '',
        date: new Date(maintenanceRecord.date).toISOString().split('T')[0],
        type: completeMode ? 'Completed' : (maintenanceRecord.type || MAINTENANCE_TYPES[0]),
        notes: maintenanceRecord.notes || '',
      });
      
      if (maintenanceRecord.photos && maintenanceRecord.photos.length > 0) {
        setPhotos(maintenanceRecord.photos);
      }
    }
  }, [maintenanceRecord, completeMode]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
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
  
  // Handle photo upload
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    
    try {
      // Check if we've reached the photo limit
      if (photos.length >= MAX_PHOTOS) {
        setError(`You can only upload a maximum of ${MAX_PHOTOS} photos.`);
        return;
      }
      
      // Compress the image
      const compressedBlob = await compressImage(selectedFile);
      
      // Upload to S3
      const s3Key = await uploadToS3(compressedBlob, `maintenance-photos/${rv.id}`);
      
      // Add the S3 key to the photos array
      setPhotos([...photos, s3Key]);
      
      // Clear the selected file and preview
      setSelectedFile(null);
      setPreview(null);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(handleApiError(error));
    }
  };
  
  // Handle photo deletion
  const handleDeletePhoto = async (index: number) => {
    const photoToDelete = photos[index];
    
    // Delete from S3 if it's not a base64 string
    if (photoToDelete && !photoToDelete.startsWith('data:image/')) {
      try {
        await deleteFromS3(photoToDelete);
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error);
        // Continue even if S3 deletion fails
      }
    }
    
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.title || !formData.date || !formData.type) {
        throw new Error('Please fill in all required fields');
      }
      
      // Create or update maintenance record
      if (maintenanceRecord) {
        // Update existing maintenance record
        await client.models.MaintenanceRecord.update({
          id: maintenanceRecord.id,
          title: formData.title,
          date: new Date(formData.date).toISOString(),
          type: formData.type,
          notes: formData.notes,
          photos: photos,
          rvId: rv.id,
        });
      } else {
        // Create new maintenance record
        await client.models.MaintenanceRecord.create({
          title: formData.title,
          date: new Date(formData.date).toISOString(),
          type: formData.type,
          notes: formData.notes,
          photos: photos,
          rvId: rv.id,
        });
      }
      
      // Success - redirect or callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/maintenance/history');
      }
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      setError(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel button
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/maintenance');
    }
  };
  
  return (
    <div>
      {completeMode && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          <p className="font-medium">You are marking this maintenance record as completed.</p>
          <p>Update any details if needed and click "Save" to confirm completion.</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Title field */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-navy font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            required
          />
        </div>
        
        {/* Date field */}
        <div className="mb-4">
          <label htmlFor="date" className="block text-navy font-medium mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            required
          />
        </div>
        
        {/* Type field */}
        <div className="mb-4">
          <label htmlFor="type" className="block text-navy font-medium mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            required
            disabled={completeMode}
          >
            {MAINTENANCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {completeMode && (
            <input type="hidden" name="type" value="Completed" />
          )}
        </div>
        
        {/* Notes field */}
        <div className="mb-4">
          <label htmlFor="notes" className="block text-navy font-medium mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            placeholder={completeMode ? "Add any completion notes here..." : ""}
          />
        </div>
        
        {/* Photo upload section */}
        <div className="mb-6">
          <label className="block text-navy font-medium mb-1">
            Photos ({photos.length}/{MAX_PHOTOS})
          </label>
          
          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="photo-grid grid-cols-3 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="photo-container relative">
                  <S3Image
                    s3Key={photo}
                    alt={`Maintenance photo ${index + 1}`}
                    className="photo-img"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    aria-label="Delete photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Photo upload input */}
          {photos.length < MAX_PHOTOS && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="photo"
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300"
                >
                  Select Photo
                </label>
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={!selectedFile}
                  className={`px-3 py-2 rounded-md text-white ${
                    !selectedFile
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue hover:bg-orange'
                  }`}
                >
                  Upload Photo
                </button>
              </div>
              
              {/* Preview */}
              {preview && (
                <div className="mt-2">
                  <div className="photo-container" style={{ maxHeight: '150px', width: '150px' }}>
                    <Image
                      src={preview}
                      alt="Preview"
                      className="photo-img"
                      width={150}
                      height={150}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              completeMode 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue hover:bg-orange'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx={"12"} cy={"12"} r={"10"} stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              completeMode ? 'Mark as Completed' : 'Save Maintenance Record'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
