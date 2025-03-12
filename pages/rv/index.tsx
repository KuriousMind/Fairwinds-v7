import React from 'react';
import { useRouter } from 'next/router';
import NavBar from '@/components/common/layout/NavBar';
import NavButton from '@/components/common/navigation/NavButton';
import ErrorBoundary from '@/components/common/ui/ErrorBoundary';

/**
 * RV Index Page - Main navigation for RV section
 * 
 * Features:
 * - Card-based navigation with three buttons
 * - Access to RV profile and photos
 * - Back navigation to dashboard
 */
export default function RVIndex() {
  const router = useRouter();

  return (
    <ErrorBoundary>
      <main className="container mx-auto p-4">
        <NavBar 
          title="My RV" 
          showBackButton 
          backUrl="/dashboard"
        />

        <div className="mt-8">
          <h1 className="text-2xl font-semibold text-navy mb-6">
            RV Management
          </h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 mb-6">
              Manage your RV details and photos. Keep track of important information about your vehicle.
            </p>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Profile Button */}
              <NavButton
                href="/rv/profile"
                label="RV Profile"
                isPrimary
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              
              {/* Photos Button */}
              <NavButton
                href="/rv/photos"
                label="RV Photos"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              
              {/* Back to Dashboard Button */}
              <NavButton
                href="/dashboard"
                label="Back to Dashboard"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
