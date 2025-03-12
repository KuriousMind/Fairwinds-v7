import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import NavBar from "@/components/common/layout/NavBar";
import NavButton from "@/components/common/navigation/NavButton";
import LoadingState from "@/components/common/ui/LoadingState";
import ErrorBoundary from "@/components/common/ui/ErrorBoundary";
import { client, handleApiError } from "@/lib/api/amplify";

export default function Dashboard() {
  const [userRV, setUserRV] = useState<any>(null);
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
          setUserRV(rvData.data[0]);
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

        {/* RV Summary Card - Show if user has an RV */}
        {userRV ? (
          <div className="mt-8 p-4 border rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">My RV</h2>
            <p>
              <span className="font-medium">Make:</span> {userRV.make}
            </p>
            <p>
              <span className="font-medium">Model:</span> {userRV.model}
            </p>
            <p>
              <span className="font-medium">Year:</span> {userRV.year}
            </p>
            {userRV.photos && userRV.photos.length > 0 && (
              <p>
                <span className="font-medium">Photos:</span> {userRV.photos.length}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-8 p-4 border rounded-lg shadow-md bg-blue-50">
            <h2 className="text-xl font-semibold mb-2">Welcome to Fairwinds!</h2>
            <p>You haven&apos;t added your RV yet. Click on &quot;My RV&quot; to get started.</p>
          </div>
        )}
      </main>
    </ErrorBoundary>
  );
}
