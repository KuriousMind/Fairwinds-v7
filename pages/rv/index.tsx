import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '@/components/common/layout/PageLayout';
import ContentCard from '@/components/common/layout/ContentCard';
import ButtonGrid from '@/components/common/navigation/ButtonGrid';
import NavButton from '@/components/common/navigation/NavButton';
import RVProfileForm from '@/components/rv/RVProfileForm';
import LoadingState from '@/components/common/ui/LoadingState';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV } from '@/types/models';

/**
 * RV Index Page - Main navigation for RV section
 * 
 * Features:
 * - Card-based navigation with three buttons
 * - Access to RV photos and documents
 * - View and edit RV details directly
 * - Back navigation to dashboard
 */
export default function RVIndex() {
  const router = useRouter();
  const { user } = useAuthenticator();
  const { edit } = router.query;
  
  const [rv, setRV] = useState<RV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(edit === 'true');
  
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
  
  // Update edit mode when query param changes
  useEffect(() => {
    setIsEditMode(edit === 'true');
  }, [edit]);
  
  // Handle form submission success
  const handleFormSuccess = () => {
    setIsEditMode(false);
    router.push('/rv');
    // Refetch RV data
    if (user) {
      setLoading(true);
      fetchRV();
    }
  };
  
  // Function to fetch RV data
  const fetchRV = async () => {
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
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false);
      router.push('/rv');
    } else {
      setIsEditMode(true);
      router.push('/rv?edit=true');
    }
  };
  
  return (
    <PageLayout
      title="My RV"
    >
      {/* Navigation Section */}
      <ButtonGrid columns={3}>
        
        {/* Photos Button */}
        <NavButton
          href="/rv/photos"
          label="RV Photos"
          isPrimary
          icon={
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        
        {/* Documents Button */}
        <NavButton
          href="/rv/documents"
          label="Documents"
          icon={
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        
        {/* Back to Dashboard Button */}
        <NavButton
          href="/"
          label="Back"
          icon={
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        />
      </ButtonGrid>
      
      {/* Show error message if any */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Show loading state */}
      {loading ? (
        <div className="content-section-spacing">
          <LoadingState message="Loading RV information..." />
        </div>
      ) : isEditMode ? (
        /* Edit Mode - Show RV Profile Form */
        <div className="content-section-spacing">
          <RVProfileForm 
            rv={rv} 
            userId={user?.userId || ''} 
            onSuccess={handleFormSuccess} 
          />
        </div>
      ) : (
        /* View Mode - Show RV Details */
        <div className="content-section-spacing">
          {!rv ? (
            /* No RV - Show welcome message */
            <ContentCard title="Welcome to Fairwinds!">
              <p className="mb-4">You haven&apos;t added your RV yet. Get started by adding your RV details.</p>
              <button 
                onClick={toggleEditMode}
                className="btn-primary inline-block"
              >
                Add RV Details
              </button>
            </ContentCard>
          ) : (
            /* RV exists - Show RV details */
            <ContentCard
              title={`${rv.year} ${rv.make} ${rv.model}`}
              actions={
                <button 
                  onClick={toggleEditMode}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="heading mb-2">Details</h3>
                  <div className="space-y-1 text">
                    <p><span className="font-medium">Make:</span> {rv.make}</p>
                    <p><span className="font-medium">Model:</span> {rv.model}</p>
                    <p><span className="font-medium">Year:</span> {rv.year}</p>
                  </div>
                </div>
              </div>
            </ContentCard>
          )}
        </div>
      )}
      
      {/* Photo Gallery Preview - Only show if RV exists */}
      {!loading && rv && (
        <div className="content-section-spacing">
          <ContentCard
            title="Photos"
            actions={<Link href="/rv/photos" className="text-blue-600 text-sm">View All</Link>}
          >
            {rv.photos && rv.photos.length > 0 ? (
              <div className="photo-grid grid-cols-3 max-w-full">
                {rv.photos.slice(0, 3).map((photo, index) => (
                  <div key={index} className="photo-container">
                    <Image 
                      src={photo} 
                      alt={`RV photo ${index + 1}`} 
                      className="photo-img"
                      width={300}
                      height={200}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
                {rv.photos.length > 3 && (
                  <div className="photo-container flex items-center justify-center text-navy font-medium">
                    +{rv.photos.length - 3} more
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No photos added yet.</p>
            )}
          </ContentCard>
        </div>
      )}
      
      {/* Documents Preview - Only show if RV exists */}
      {!loading && rv && (
        <div className="content-section-spacing">
          <ContentCard
            title="Documents"
            actions={<Link href="/rv/documents" className="text-blue-600 text-sm">View All</Link>}
          >
            {rv.documents && rv.documents.length > 0 ? (
              <div className="space-y-2">
                {rv.documents.slice(0, 2).map((doc, index) => (
                  <div key={index} className="p-2 border border-gray-200 rounded-lg flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded mr-2">
                        <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-gray-500">{doc.type}</p>
                      </div>
                    </div>
                    <Link href={doc.url} className="text-blue-600 text-sm">View</Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No documents added yet.</p>
            )}
          </ContentCard>
        </div>
      )}
    </PageLayout>
  );
}
