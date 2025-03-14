import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import Link from 'next/link';
import PageLayout from '@/components/common/layout/PageLayout';
import ContentCard from '@/components/common/layout/ContentCard';
import ButtonGrid from '@/components/common/navigation/ButtonGrid';
import NavButton from '@/components/common/navigation/NavButton';
import MaintenanceCard from '@/components/maintenance/MaintenanceCard';
import LoadingState from '@/components/common/ui/LoadingState';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV, MaintenanceRecord } from '@/types/models';

/**
 * Maintenance Index Page - Main navigation for Maintenance section
 * 
 * Features:
 * - Card-based navigation with three buttons
 * - Access to create new maintenance records and view history
 * - Back navigation to dashboard
 * - Maintenance summary with counts
 * - Upcoming and recent maintenance records
 */
export default function MaintenanceIndex() {
  const router = useRouter();
  const { user } = useAuthenticator();
  
  const [rv, setRV] = useState<RV | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
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
          
          setRV(typedRV);
          
          // Fetch maintenance records for this RV
          await fetchMaintenanceRecords(rvItem.id);
        } else {
          setRV(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching RV data:', error);
        setError(handleApiError(error));
        setLoading(false);
      }
    }
    
    fetchRV();
  }, [user]);
  
  // Fetch maintenance records for the RV
  const fetchMaintenanceRecords = async (rvId: string) => {
    try {
      // List maintenance records for the RV
      const recordsData = await client.models.MaintenanceRecord.list({
        filter: { rvId: { eq: rvId } }
      });
      
      if (recordsData.data && recordsData.data.length > 0) {
        // Map the raw records to typed records
        const typedRecords = recordsData.data
          .filter(record => record.rvId) // Filter out records with null rvId
          .map(record => ({
            id: record.id,
            title: record.title,
            date: record.date,
            type: record.type,
            notes: record.notes || '',
            rvId: record.rvId as string, // Type assertion to ensure it's a string
            photos: record.photos as string[] || [],
          }));
        
        // Sort by date (newest first)
        typedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setMaintenanceRecords(typedRecords as MaintenanceRecord[]);
      } else {
        setMaintenanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };
  
  // Get counts for maintenance summary
  const getMaintenanceCounts = () => {
    const today = new Date();
    
    const completed = maintenanceRecords.filter(record => 
      record.type.toLowerCase().includes('completed')
    ).length;
    
    const overdue = maintenanceRecords.filter(record => 
      !record.type.toLowerCase().includes('completed') && 
      new Date(record.date) < today
    ).length;
    
    const upcoming = maintenanceRecords.filter(record => 
      !record.type.toLowerCase().includes('completed') && 
      new Date(record.date) >= today
    ).length;
    
    return { completed, overdue, upcoming };
  };
  
  // Get upcoming maintenance records
  const getUpcomingRecords = () => {
    const today = new Date();
    
    return maintenanceRecords
      .filter(record => 
        !record.type.toLowerCase().includes('completed') && 
        new Date(record.date) >= today
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2); // Get the first 2 upcoming records
  };
  
  // Get overdue maintenance records
  const getOverdueRecords = () => {
    const today = new Date();
    
    return maintenanceRecords
      .filter(record => 
        !record.type.toLowerCase().includes('completed') && 
        new Date(record.date) < today
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2); // Get the first 2 overdue records
  };
  
  // Get recent completed maintenance records
  const getRecentCompletedRecords = () => {
    return maintenanceRecords
      .filter(record => record.type.toLowerCase().includes('completed'))
      .slice(0, 2); // Get the first 2 completed records
  };
  
  // Handle view details
  const handleViewDetails = (record: MaintenanceRecord) => {
    // Navigate to the maintenance history page with the record ID
    router.push(`/maintenance/history?id=${record.id}`);
  };
  
  // Handle complete maintenance
  const handleComplete = (record: MaintenanceRecord) => {
    // Navigate to the maintenance page to mark as complete
    router.push(`/maintenance/new?id=${record.id}&complete=true`);
  };
  
  // Show loading state
  if (loading) {
    return (
      <PageLayout title="Maintenance">
        <LoadingState message="Loading maintenance data..." />
      </PageLayout>
    );
  }
  
  // Get maintenance counts
  const counts = getMaintenanceCounts();
  
  // Get records for display
  const upcomingRecords = getUpcomingRecords();
  const overdueRecords = getOverdueRecords();
  const recentCompletedRecords = getRecentCompletedRecords();
  
  return (
    <PageLayout title="Maintenance">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Navigation Section */}
      <ButtonGrid columns={3}>
        {/* New Maintenance Button */}
        <NavButton
          href="/maintenance/new"
          label="New Record"
          isPrimary
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
        
        {/* History Button */}
        <NavButton
          href="/maintenance/history"
          label="History"
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        {/* Back to Dashboard Button */}
        <NavButton
          href="/"
          label="Back to Dashboard"
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        />
      </ButtonGrid>
      
      {/* Maintenance Summary */}
      <div className="content-section-spacing">
        <ContentCard title="Maintenance Summary">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-700">{counts.completed}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-yellow-700">{counts.upcoming}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-700">{counts.overdue}</p>
            </div>
          </div>
        </ContentCard>
      </div>
      
      {/* Upcoming Maintenance */}
      <div className="content-section-spacing">
        <ContentCard
          title="Upcoming Maintenance"
          actions={<Link href="/maintenance/history?filter=upcoming" className="text-blue-600 text-sm">View All</Link>}
        >
          {upcomingRecords.length > 0 ? (
            <div className="space-y-3">
              {upcomingRecords.map(record => (
                <MaintenanceCard
                  key={record.id}
                  record={record}
                  onView={() => handleViewDetails(record)}
                  onComplete={() => handleComplete(record)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming maintenance records.</p>
          )}
        </ContentCard>
      </div>
      
      {/* Overdue Maintenance */}
      {overdueRecords.length > 0 && (
        <div className="content-section-spacing">
          <ContentCard
            title="Overdue Maintenance"
            actions={<Link href="/maintenance/history?filter=overdue" className="text-blue-600 text-sm">View All</Link>}
          >
            <div className="space-y-3">
              {overdueRecords.map(record => (
                <MaintenanceCard
                  key={record.id}
                  record={record}
                  onView={() => handleViewDetails(record)}
                  onComplete={() => handleComplete(record)}
                />
              ))}
            </div>
          </ContentCard>
        </div>
      )}
      
      {/* Recent Maintenance History */}
      <div className="content-section-spacing">
        <ContentCard
          title="Recent Maintenance"
          actions={<Link href="/maintenance/history?filter=completed" className="text-blue-600 text-sm">View All</Link>}
        >
          {recentCompletedRecords.length > 0 ? (
            <div className="space-y-3">
              {recentCompletedRecords.map(record => (
                <MaintenanceCard
                  key={record.id}
                  record={record}
                  onView={() => handleViewDetails(record)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No completed maintenance records.</p>
          )}
        </ContentCard>
      </div>
    </PageLayout>
  );
}
