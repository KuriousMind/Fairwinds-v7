import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import PageLayout from '@/components/common/layout/PageLayout';
import ContentCard from '@/components/common/layout/ContentCard';
import PhotoGallery from '@/components/rv/PhotoGallery';
import PhotoUpload from '@/components/rv/PhotoUpload';
import LoadingState from '@/components/common/ui/LoadingState';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV } from '@/types/models';

/**
 * RV Photos Page - View and manage RV photos
 * 
 * Features:
 * - Display photo gallery
 * - Add new photos
 * - Delete photos
 * - Photo preview
 */
export default function RVPhotosPage() {
  const router = useRouter();
  const { user } = useAuthenticator();
  
  const [rv, setRV] = useState<RV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  
  // Fetch RV data
  const fetchRV = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // List RVs associated with the current user
      const rvData = await client.models.RV.list({
        filter: { userId: { eq: user.userId } }
      });
      
      if (rvData.data && rvData.data.length > 0) {
        // Get the raw RV item from the API response
        const rvItem = rvData.data[0];
        
        // Use a more aggressive type assertion approach
        // First, create a basic RV object without photos
        const typedRV = {
          id: rvItem.id,
          make: rvItem.make,
          model: rvItem.model,
          year: rvItem.year,
          userId: rvItem.userId,
        } as RV;
        
        // Then handle photos separately with explicit type checking
        if (rvItem.photos && Array.isArray(rvItem.photos)) {
          // Force cast to any to bypass TypeScript's type checking
          const anyPhotos = rvItem.photos as any[];
          // Filter out non-string values
          const stringPhotos = anyPhotos
            .filter(photo => typeof photo === 'string')
            .map(photo => photo as string);
            
          if (stringPhotos.length > 0) {
            typedRV.photos = stringPhotos;
          }
        }
        setRV(typedRV);
      } else {
        setRV(null);
      }
    } catch (error) {
      console.error('Error fetching RV data:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Initial data fetch
  useEffect(() => {
    fetchRV();
  }, [user, fetchRV]);
  
  // Handle photo added
  const handlePhotoAdded = () => {
    setShowUpload(true);
  };
  
  // Handle upload success
  const handleUploadSuccess = () => {
    setShowUpload(false);
    fetchRV(); // Refresh RV data to get updated photos
  };
  
  // Handle upload cancel
  const handleUploadCancel = () => {
    setShowUpload(false);
  };
  
  // Handle photo deleted
  const handlePhotoDeleted = () => {
    fetchRV(); // Refresh RV data to get updated photos
  };
  
  // Handle photos reordered
  const handlePhotosReordered = async (photos: string[]) => {
    if (!rv) return;
    
    try {
      // Update the RV with the new photo order
      await client.models.RV.update({
        id: rv.id,
        photos: photos,
      });
      
      // Update local state
      setRV({
        ...rv,
        photos: photos,
      });
    } catch (error) {
      console.error('Error updating photo order:', error);
      setError(handleApiError(error));
      fetchRV(); // Refresh RV data to get original order
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <PageLayout
        title="RV Photos"
        showBackButton
        backUrl="/rv"
      >
        <LoadingState message="Loading photos..." />
      </PageLayout>
    );
  }
  
  // Show message if no RV exists
  if (!rv) {
    return (
      <PageLayout
        title="RV Photos"
        showBackButton
        backUrl="/rv"
      >
        <ContentCard variant="primary">
          <h2 className="heading mb-2">No RV Found</h2>
          <p className="text mb-4">
            You need to add your RV details before you can manage photos.
          </p>
          <button
            onClick={() => router.push('/rv/profile?edit=true')}
            className="btn-primary inline-block"
          >
            Add RV Details
          </button>
        </ContentCard>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title="RV Photos"
      showBackButton
      backUrl="/rv"
    >
      {error && (
        <div className="content-section-spacing">
          <ContentCard variant="info">
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          </ContentCard>
        </div>
      )}
      
      {/* Show photo upload form or gallery */}
      {showUpload ? (
        <div className="content-section-spacing">
          <ContentCard title="Upload Photos">
            <PhotoUpload
              rv={rv}
              onSuccess={handleUploadSuccess}
              onCancel={handleUploadCancel}
            />
          </ContentCard>
        </div>
      ) : (
        <div className="content-section-spacing">
          <ContentCard
            title={`${rv.year} ${rv.make} ${rv.model} Photos`}
            actions={
              <button
                onClick={() => setShowUpload(true)}
                className="btn-primary w-auto flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Photo
              </button>
            }
          >
            <PhotoGallery
              rv={rv}
              isLoading={loading}
              onPhotoAdded={handlePhotoAdded}
              onPhotoDeleted={handlePhotoDeleted}
              onPhotosReordered={handlePhotosReordered}
            />
          </ContentCard>
        </div>
      )}
    </PageLayout>
  );
}
