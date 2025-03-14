import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import PageLayout from '@/components/common/layout/PageLayout';
import RVProfile from '@/components/rv/RVProfile';
import RVProfileForm from '@/components/rv/RVProfileForm';
import LoadingState from '@/components/common/ui/LoadingState';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV } from '@/types/models';

/**
 * RV Profile Page - View and edit RV details
 * 
 * Features:
 * - Display RV information
 * - Edit RV details
 * - Create new RV if none exists
 */
export default function RVProfilePage() {
  const router = useRouter();
  const { user } = useAuthenticator();
  const { edit } = router.query;
  
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
    router.push('/rv/profile');
  };
  
  // Show loading state
  if (loading) {
    return (
      <PageLayout 
        title="RV Profile" 
        showBackButton 
        backUrl="/rv"
      >
        <LoadingState message="Loading RV information..." />
      </PageLayout>
    );
  }
  
  return (
    <PageLayout 
      title="RV Profile" 
      showBackButton 
      backUrl="/rv"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Show form if in edit mode or no RV exists */}
      {edit === 'true' || (!rv && !loading) ? (
        <RVProfileForm 
          rv={rv} 
          userId={user?.userId || ''} 
          onSuccess={handleFormSuccess} 
        />
      ) : (
        <RVProfile rv={rv} isLoading={loading} />
      )}
    </PageLayout>
  );
}
