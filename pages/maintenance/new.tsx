import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import PageLayout from '@/components/common/layout/PageLayout';
import MaintenanceForm from '@/components/maintenance/MaintenanceForm';
import LoadingState from '@/components/common/ui/LoadingState';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV } from '@/types/models';

/**
 * New Maintenance Record Page - Create a new maintenance record
 * 
 * Features:
 * - Form for entering maintenance details
 * - Photo upload
 * - Back navigation to maintenance index
 */
export default function MaintenanceNew() {
  const router = useRouter();
  const { user } = useAuthenticator();
  
  const [rv, setRV] = useState<RV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Handle form submission success
  const handleFormSuccess = () => {
    router.push('/maintenance');
  };
  
  // Handle form cancel
  const handleFormCancel = () => {
    router.push('/maintenance');
  };
  
  // Show loading state
  if (loading) {
    return (
      <PageLayout 
        title="New Maintenance Record" 
        showBackButton 
        backUrl="/maintenance"
      >
        <LoadingState message="Loading RV information..." />
      </PageLayout>
    );
  }
  
  // Show message if no RV exists
  if (!rv) {
    return (
      <PageLayout 
        title="New Maintenance Record" 
        showBackButton 
        backUrl="/maintenance"
      >
        <div className="card bg-blue-50 border-blue-100">
          <h2 className="heading mb-2">No RV Found</h2>
          <p className="text mb-4">
            You need to add your RV details before you can create maintenance records.
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
      title="New Maintenance Record" 
      showBackButton 
      backUrl="/maintenance"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <MaintenanceForm 
        rv={rv}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </PageLayout>
  );
}
