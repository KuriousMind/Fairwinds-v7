import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import PageLayout from '@/components/common/layout/PageLayout';
import ContentCard from '@/components/common/layout/ContentCard';
import MaintenanceCard from '@/components/maintenance/MaintenanceCard';
import MaintenanceCalendar from '@/components/maintenance/MaintenanceCalendar';
import LoadingState from '@/components/common/ui/LoadingState';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV, MaintenanceRecord } from '@/types/models';

/**
 * Maintenance History Page - View maintenance records history
 * 
 * Features:
 * - List of maintenance records
 * - Filter by status (all, upcoming, overdue, completed)
 * - Sort by date
 * - Back navigation to maintenance index
 */
export default function MaintenanceHistory() {
  const router = useRouter();
  const { user } = useAuthenticator();
  
  const [rv, setRV] = useState<RV | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View state
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRecords, setDateRecords] = useState<MaintenanceRecord[]>([]);
  
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
  
  // Get all records
  const getAllRecords = () => {
    return maintenanceRecords;
  };
  
  // Handle view details
  const handleViewDetails = (record: MaintenanceRecord) => {
    // For now, just show an alert with the record details
    alert(`Viewing details for: ${record.title}`);
    // In a future implementation, this would navigate to a detail page
  };
  
  // Handle complete maintenance
  const handleComplete = (record: MaintenanceRecord) => {
    // Navigate to the maintenance page to mark as complete
    router.push(`/maintenance/new?id=${record.id}&complete=true`);
  };
  
  // Handle date selection from calendar
  const handleDateSelect = (date: Date, records: MaintenanceRecord[]) => {
    setSelectedDate(date);
    setDateRecords(records);
  };
  
  // Clear date selection
  const handleClearDateSelection = () => {
    setSelectedDate(null);
    setDateRecords([]);
  };
  
  // Show loading state
  if (loading) {
    return (
      <PageLayout 
        title="Maintenance History" 
        showBackButton 
        backUrl="/maintenance"
      >
        <LoadingState message="Loading maintenance records..." />
      </PageLayout>
    );
  }
  
  // Show message if no RV exists
  if (!rv) {
    return (
      <PageLayout 
        title="Maintenance History" 
        showBackButton 
        backUrl="/maintenance"
      >
        <ContentCard variant="primary">
          <h2 className="heading mb-2">No RV Found</h2>
          <p className="text mb-4">
            You need to add your RV details before you can view maintenance records.
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
  
  // No need for filtered records anymore as we're showing all records
  
  return (
    <PageLayout 
      title="Maintenance History" 
      showBackButton 
      backUrl="/maintenance"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* View toggle */}
      <div className="content-section-spacing border-b border-gray-200">
        <div className="flex justify-end items-center pb-2">
          {/* View toggle buttons */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              className={`px-3 py-1 text-sm ${
                viewMode === 'list'
                  ? 'btn-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                setViewMode('list');
                setSelectedDate(null);
                setDateRecords([]);
              }}
            >
              List
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                viewMode === 'calendar'
                  ? 'btn-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>
      
      {/* Maintenance records display - list or calendar view */}
      <div className="content-section-spacing">
        {maintenanceRecords.length === 0 ? (
          <ContentCard>
            <div className="text-center py-8">
              <h2 className="heading mb-2">No Records Found</h2>
              <p className="text mb-4">
                You have not added any maintenance records yet.
              </p>
              <button
                onClick={() => router.push('/maintenance/new')}
                className="btn-primary inline-block"
              >
                Add Maintenance Record
              </button>
            </div>
          </ContentCard>
        ) : viewMode === 'calendar' ? (
          // Calendar view
          <div>
            <MaintenanceCalendar 
              records={getAllRecords()}
              onSelectDate={handleDateSelect}
            />
            
            {/* Selected date records */}
            {selectedDate && dateRecords.length > 0 && (
              <div className="mt-4">
                <ContentCard 
                  title={`Maintenance on ${selectedDate.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}`}
                  actions={
                    <button 
                      onClick={handleClearDateSelection}
                      className="btn-primary text-sm px-2 py-1 h-auto text-white"
                    >
                      Clear Selection
                    </button>
                  }
                >
                  <div className="space-y-3">
                    {dateRecords.map((record) => (
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
          </div>
        ) : (
          // List view
          <ContentCard title="Maintenance Records">
            <div className="space-y-3">
              {getAllRecords().map((record) => (
                <MaintenanceCard
                  key={record.id}
                  record={record}
                  onView={() => handleViewDetails(record)}
                  onComplete={() => handleComplete(record)}
                />
              ))}
            </div>
          </ContentCard>
        )}
      </div>
    </PageLayout>
  );
}
