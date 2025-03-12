import React from 'react';
import { RV } from '@/types/models';
import Link from 'next/link';

interface RVProfileProps {
  rv: RV | null;
  isLoading: boolean;
}

/**
 * RVProfile component to display RV details
 * 
 * Features:
 * - Displays RV information (make, model, year)
 * - Shows placeholder if no RV exists
 * - Provides edit button
 */
const RVProfile: React.FC<RVProfileProps> = ({ rv, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      </div>
    );
  }

  if (!rv) {
    return (
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h2 className="text-xl font-semibold text-navy mb-2">No RV Added Yet</h2>
        <p className="text-gray-700 mb-4">
          Add information about your RV to get started.
        </p>
        <Link 
          href="/rv/profile?edit=true" 
          className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-orange transition-colors"
        >
          Add RV Details
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-semibold text-navy">
          {rv.year} {rv.make} {rv.model}
        </h2>
        <Link 
          href="/rv/profile?edit=true" 
          className="px-3 py-1 bg-blue text-white rounded hover:bg-orange transition-colors text-sm"
        >
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-lg font-medium text-navy mb-2">Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Make:</span> {rv.make}</p>
            <p><span className="font-medium">Model:</span> {rv.model}</p>
            <p><span className="font-medium">Year:</span> {rv.year}</p>
          </div>
        </div>
      </div>

      {/* Photo preview section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-navy">Photos</h3>
          <Link 
            href="/rv/photos" 
            className="text-blue hover:text-orange transition-colors text-sm"
          >
            View All
          </Link>
        </div>
        
        {rv.photos && rv.photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {rv.photos.slice(0, 3).map((photo, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                <img 
                  src={photo} 
                  alt={`RV photo ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {rv.photos.length > 3 && (
              <Link 
                href="/rv/photos" 
                className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-navy font-medium"
              >
                +{rv.photos.length - 3} more
              </Link>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No photos added yet.</p>
        )}
      </div>
    </div>
  );
};

export default RVProfile;
