import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import PageLayout from '@/components/common/layout/PageLayout';
import ContentCard from '@/components/common/layout/ContentCard';
import MaintenanceForm from '@/components/maintenance/MaintenanceForm';
import LoadingState from '@/components/common/ui/LoadingState';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV, MaintenanceRecord } from '@/types/models';

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
  
  const { id, complete } = router.query;
  
  const [rv, setRV] = useState<RV | null>(null);
  const [maintenanceRecord, setMaintenanceRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch RV data and maintenance record if id is provided
  useEffect(() => {
    async function fetchData() {
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
          
          // If an ID is provided, fetch the maintenance record
          if (id && typeof id === 'string') {
            try {
              const response = await client.models.MaintenanceRecord.get({
                id: id
              });
              
              if (response.data) {
                const recordData = response.data;
                // Create a typed maintenance record
                const typedRecord = {
                  id: recordData.id,
                  title: recordData.title,
                  date: recordData.date,
                  type: complete === 'true' ? 'Completed' : recordData.type,
                  notes: recordData.notes || '',
                  rvId: recordData.rvId as string,
                  photos: recordData.photos as string[] || [],
                } as MaintenanceRecord;
                
                setMaintenanceRecord(typedRecord);
              }
            } catch (recordError) {
              console.error('Error fetching maintenance record:', recordError);
              // Don't set an error, just continue without the record
            }
          }
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
    
    fetchData();
  }, [user, id, complete]);
  
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
      <ContentCard variant="primary">
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
      </ContentCard>
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
      
      <div className="content-section-spacing">
        <ContentCard title={maintenanceRecord ? (complete === 'true' ? 'Mark Maintenance as Completed' : 'Edit Maintenance Record') : 'Add Maintenance Record'}>
          <MaintenanceForm 
            rv={rv}
            maintenanceRecord={maintenanceRecord}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            completeMode={complete === 'true'}
          />
        </ContentCard>
      </div>
    </PageLayout>
  );
}
