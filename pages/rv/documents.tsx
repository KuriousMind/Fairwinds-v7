import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import PageLayout from '@/components/common/layout/PageLayout';
import DocumentList from '@/components/rv/DocumentList';
import DocumentUpload from '@/components/rv/DocumentUpload';
import LoadingState from '@/components/common/ui/LoadingState';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV } from '@/types/models';

/**
 * RV Documents Page - View and manage RV documents
 * 
 * Features:
 * - List of documents
 * - Document upload
 * - Document deletion
 * - Back navigation to RV index
 */
export default function RVDocuments() {
  const router = useRouter();
  const { user } = useAuthenticator();
  
  const [rv, setRV] = useState<RV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Fetch RV data
  useEffect(() => {
    async function fetchRV() {
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
    }
    
    fetchRV();
  }, [user]);
  
  // Handle document upload success
  const handleUploadSuccess = () => {
    setShowUploadForm(false);
  };
  
  // Handle document upload cancel
  const handleUploadCancel = () => {
    setShowUploadForm(false);
  };
  
  // Show loading state
  if (loading) {
    return (
      <PageLayout
        title="RV Documents"
        showBackButton
        backUrl="/rv"
      >
        <LoadingState message="Loading RV information..." />
      </PageLayout>
    );
  }
  
  // Show message if no RV exists
  if (!rv) {
    return (
      <PageLayout
        title="RV Documents"
        showBackButton
        backUrl="/rv"
      >
        <div className="card bg-blue-50 border-blue-100">
          <h2 className="heading mb-2">No RV Found</h2>
          <p className="text mb-4">
            You need to add your RV details before you can manage documents.
          </p>
          <button
            onClick={() => router.push('/rv/profile?edit=true')}
            className="btn-primary inline-block"
          >
            Add RV Details
          </button>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title="RV Documents"
      showBackButton
      backUrl="/rv"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {showUploadForm ? (
        <DocumentUpload
          rv={rv}
          onSuccess={handleUploadSuccess}
          onCancel={handleUploadCancel}
        />
      ) : (
        <DocumentList
          rv={rv}
          onAddDocument={() => setShowUploadForm(true)}
        />
      )}
    </PageLayout>
  );
}
