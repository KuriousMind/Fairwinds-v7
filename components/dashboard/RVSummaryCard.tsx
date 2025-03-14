import React from 'react';
import Link from 'next/link';
import { RV } from '@/types/models';

interface RVSummaryCardProps {
  rv: RV | null;
}

/**
 * RVSummaryCard component for displaying a summary of the user's RV on the dashboard
 * 
 * Features:
 * - Displays RV information (make, model, year)
 * - Shows photo count if available
 * - Provides quick links to RV profile and photos
 */
const RVSummaryCard: React.FC<RVSummaryCardProps> = ({ rv }) => {
  if (!rv) {
    return (
      <div className="card bg-blue-50 border-blue-100">
        <h2 className="heading mb-2">Welcome to Fairwinds!</h2>
        <p className="text mb-3">
          You haven&apos;t added your RV yet. Get started by adding your RV details.
        </p>
        <Link 
          href="/rv/profile?edit=true" 
          className="btn-primary inline-block rounded-lg px-3 py-2 text-center w-full sm:w-auto"
        >
          Add RV Details
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-1">
        <h2 className="heading">
          My RV
        </h2>
        <Link 
          href="/rv" 
          className="text-blue hover:text-orange transition-colors text-sm"
        >
          Manage RV
        </Link>
      </div>
      
      <div className="mb-4">
        <h3 className="heading mb-2">
          {rv.year} {rv.make} {rv.model}
        </h3>
        <div className="space-y-1 text">
          <p><span className="font-medium">Make:</span> {rv.make}</p>
          <p><span className="font-medium">Model:</span> {rv.model}</p>
          <p><span className="font-medium">Year:</span> {rv.year}</p>
        </div>
      </div>
      
      {/* Photo preview */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="heading text-lg">Photos</h4>
          <Link 
            href="/rv/photos" 
            className="text-blue hover:text-orange transition-colors text-sm"
          >
            View All
          </Link>
        </div>
        
        {rv.photos && rv.photos.length > 0 ? (
          <div className="photo-grid grid-cols-3 max-w-full">
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
              <div className="photo-container flex items-center justify-center text-navy font-medium">
                +{rv.photos.length - 3} more
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No photos added yet.</p>
        )}
      </div>
      
      {/* Quick links */}
      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Link 
          href="/rv/profile" 
          className="btn-secondary text-sm py-2"
        >
          View Profile
        </Link>
        <Link 
          href="/rv/photos" 
          className="btn-secondary text-sm py-2"
        >
          Manage Photos
        </Link>
      </div>
    </div>
  );
};

export default RVSummaryCard;
