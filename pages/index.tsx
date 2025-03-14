import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import Link from "next/link";
import PageLayout from "@/components/common/layout/PageLayout";
import ContentCard from "@/components/common/layout/ContentCard";
import ButtonGrid from "@/components/common/navigation/ButtonGrid";
import NavButton from "@/components/common/navigation/NavButton";
import LoadingState from "@/components/common/ui/LoadingState";
import RVSummaryCard from "@/components/dashboard/RVSummaryCard";
import { client, handleApiError } from "@/lib/api/amplify";
import { RV } from "@/types/models";

export default function Dashboard() {
  const [userRV, setUserRV] = useState<RV | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuthenticator();

  // Fetch the user's RV data
  useEffect(() => {
    async function fetchUserRV() {
      try {
        setLoading(true);
        
        // List RVs associated with the current user
        const rvData = await client.models.RV.list({
          filter: { userId: { eq: user?.userId } }
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
          setUserRV(typedRV);
        } else {
          setUserRV(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching RV data:", error);
        handleApiError(error);
        setLoading(false);
      }
    }

    if (user) {
      fetchUserRV();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Display loading state while fetching data
  if (loading) {
    return <LoadingState fullScreen message="Loading your dashboard..." />;
  }

  return (
    <PageLayout title="Fairwinds RV Dashboard">
      {/* Navigation Section */}
      <ButtonGrid columns={3}>
        <NavButton 
          href="/rv"
          label="My RV"
          isPrimary
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-7m-6 0a1 1 0 00-1 1v3" />
            </svg>
          }
        />
        
        <NavButton 
          href="/maintenance"
          label="Maintenance"
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        
        <NavButton 
          href="/settings"
          label="Settings"
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </ButtonGrid>
      
      {/* RV Summary Card */}
      <div className="content-section-spacing">
        <RVSummaryCard rv={userRV} />
      </div>
      
      {/* Upcoming Maintenance Section */}
      <div className="content-section-spacing">
        <ContentCard
          title="Upcoming Maintenance"
          actions={<Link href="/maintenance/history" className="text-blue-600 text-sm">View All</Link>}
        >
          <div className="space-y-2">
            {/* Sample maintenance items */}
            <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-yellow-800">Oil Change Due</h3>
                  <p className="text-sm text-gray-600">Due in 2 weeks (March 27, 2025)</p>
                </div>
                <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">Upcoming</span>
              </div>
            </div>
            
            <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-red-800">Tire Rotation</h3>
                  <p className="text-sm text-gray-600">Overdue by 1 week (March 6, 2025)</p>
                </div>
                <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">Overdue</span>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
      
      {/* Quick Stats Section */}
      <div className="content-section-spacing">
        <ContentCard title="RV Stats">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Trips</p>
              <p className="text-xl font-bold text-blue-700">12</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-xl font-bold text-green-700">8</p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Photos</p>
              <p className="text-xl font-bold text-purple-700">6</p>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-xl font-bold text-orange-700">3</p>
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Sign out button at the bottom of the page */}
      <div className="mt-auto pt-4 pb-6 flex justify-center">
        <button 
          onClick={signOut}
          className="w-auto px-4 py-3 text-base bg-blue-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 mx-auto"
        >
          Sign out
        </button>
      </div>
    </PageLayout>
  );
}
