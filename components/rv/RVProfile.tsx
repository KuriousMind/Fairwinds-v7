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
      <div className="card bg-blue-50 border-blue-100">
        <h2 className="heading mb-2">No RV Added Yet</h2>
        <p className="text mb-4">
          Add information about your RV to get started.
        </p>
        <Link 
          href="/rv/profile?edit=true" 
          className="btn-primary inline-block"
        >
          Add RV Details
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <h2 className="heading text-2xl">
          {rv.year} {rv.make} {rv.model}
        </h2>
        <Link 
          href="/rv/profile?edit=true" 
          className="btn-primary py-1 px-3 text-sm inline-block"
        >
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="heading text-lg mb-2">Details</h3>
          <div className="space-y-2 text">
            <p><span className="font-medium">Make:</span> {rv.make}</p>
            <p><span className="font-medium">Model:</span> {rv.model}</p>
            <p><span className="font-medium">Year:</span> {rv.year}</p>
          </div>
        </div>
      </div>

      {/* Photo preview section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="heading text-lg">Photos</h3>
          <Link 
            href="/rv/photos" 
            className="text-blue hover:text-orange transition-colors text-sm"
          >
            View All
          </Link>
        </div>
        
        {rv.photos && rv.photos.length > 0 ? (
          <div className="photo-grid grid-cols-3">
            {rv.photos.slice(0, 3).map((photo, index) => (
              <div key={index} className="photo-container">
                <img 
                  src={photo} 
                  alt={`RV photo ${index + 1}`} 
                  className="photo-img"
                />
              </div>
            ))}
            {rv.photos.length > 3 && (
              <Link 
                href="/rv/photos" 
                className="photo-container flex items-center justify-center text-navy font-medium"
              >
                +{rv.photos.length - 3} more
              </Link>
            )}
          </div>
        ) : (
          <p className="text text-gray-500">No photos added yet.</p>
        )}
      </div>
    </div>
  );
};

export default RVProfile;
