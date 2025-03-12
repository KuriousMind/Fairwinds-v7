import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import NavBar from "@/components/common/layout/NavBar";
import NavButton from "@/components/common/navigation/NavButton";
import LoadingState from "@/components/common/ui/LoadingState";
import ErrorBoundary from "@/components/common/ui/ErrorBoundary";
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
    <ErrorBoundary>
      <main className="container mx-auto p-4">
        <NavBar title="Fairwinds RV Dashboard">
          <button 
            onClick={signOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign out
          </button>
        </NavBar>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-6">
          {/* Main Navigation Cards */}
          <NavButton 
            href="/rv"
            label="My RV"
            isPrimary
          />
          
          <NavButton 
            href="/maintenance"
            label="Maintenance"
          />
          
          <NavButton 
            href="/settings"
            label="Settings"
          />
        </div>

        {/* RV Summary Card */}
        <div className="mt-8">
          <RVSummaryCard rv={userRV} />
        </div>
      </main>
    </ErrorBoundary>
  );
}
