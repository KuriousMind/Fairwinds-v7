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
 * - Displays basic RV information (year, make, model)
 * - Provides a link to view RV details
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
          href="/rv?edit=true" 
          className="btn-primary inline-block rounded-lg px-3 py-2 text-center w-full sm:w-auto"
        >
          Add RV Details
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-3">
        <h2 className="heading">
          My RV
        </h2>
      </div>
      
      <div className="mb-4">
        <h3 className="heading mb-2">
          {rv.year} {rv.make} {rv.model}
        </h3>
      </div>
      
      {/* Quick links */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <Link 
          href="/rv" 
          className="btn-secondary text-sm py-2 block text-center"
        >
          View RV Details
        </Link>
      </div>
    </div>
  );
};

export default RVSummaryCard;
