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
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-md">
        <h2 className="text-xl font-semibold text-navy mb-2">Welcome to Fairwinds!</h2>
        <p className="text-gray-700 mb-4">
          You haven&apos;t added your RV yet. Get started by adding your RV details.
        </p>
        <Link 
          href="/rv/profile?edit=true" 
          className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-orange transition-colors inline-block"
        >
          Add RV Details
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-navy">
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
        <h3 className="text-lg font-medium text-navy mb-2">
          {rv.year} {rv.make} {rv.model}
        </h3>
        <div className="space-y-1 text-gray-700">
          <p><span className="font-medium">Make:</span> {rv.make}</p>
          <p><span className="font-medium">Model:</span> {rv.model}</p>
          <p><span className="font-medium">Year:</span> {rv.year}</p>
        </div>
      </div>
      
      {/* Photo preview */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-navy">Photos</h4>
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
              <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-navy font-medium">
                +{rv.photos.length - 3} more
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No photos added yet.</p>
        )}
      </div>
      
      {/* Quick links */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
        <Link 
          href="/rv/profile" 
          className="px-3 py-1 bg-gray-100 text-navy rounded hover:bg-gray-200 transition-colors text-sm"
        >
          View Profile
        </Link>
        <Link 
          href="/rv/photos" 
          className="px-3 py-1 bg-gray-100 text-navy rounded hover:bg-gray-200 transition-colors text-sm"
        >
          Manage Photos
        </Link>
      </div>
    </div>
  );
};

export default RVSummaryCard;
