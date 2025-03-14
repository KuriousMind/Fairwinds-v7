import React from 'react';
import Link from 'next/link';
import PageLayout from '@/components/common/layout/PageLayout';
import ContentCard from '@/components/common/layout/ContentCard';
import ButtonGrid from '@/components/common/navigation/ButtonGrid';
import NavButton from '@/components/common/navigation/NavButton';

/**
 * RV Index Page - Main navigation for RV section
 * 
 * Features:
 * - Card-based navigation with three buttons
 * - Access to RV profile and photos
 * - Back navigation to dashboard
 */
export default function RVIndex() {
  return (
    <PageLayout
      title="My RV"
    >
      {/* Navigation Section */}
      <ButtonGrid columns={4}>
        {/* Profile Button */}
        <NavButton
          href="/rv/profile"
          label="RV Profile"
          isPrimary
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        
        {/* Photos Button */}
        <NavButton
          href="/rv/photos"
          label="RV Photos"
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        
        {/* Documents Button */}
        <NavButton
          href="/rv/documents"
          label="Documents"
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        
        {/* Back to Dashboard Button */}
        <NavButton
          href="/"
          label="Back"
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        />
      </ButtonGrid>
      
      {/* RV Profile Preview */}
      <div className="content-section-spacing">
        <ContentCard
          title="2014 Airstream Flying Cloud"
          actions={<Link href="/rv/profile?edit=true" className="text-blue-600 text-sm">Edit</Link>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="heading mb-2">Details</h3>
              <div className="space-y-1 text">
                <p><span className="font-medium">Make:</span> Airstream</p>
                <p><span className="font-medium">Model:</span> Flying Cloud</p>
                <p><span className="font-medium">Year:</span> 2014</p>
                <p><span className="font-medium">Length:</span> 23 ft</p>
                <p><span className="font-medium">VIN:</span> 1ZT200F24E3000123</p>
              </div>
            </div>
            <div>
              <h3 className="heading mb-2">Specifications</h3>
              <div className="space-y-1 text">
                <p><span className="font-medium">Sleeps:</span> 4</p>
                <p><span className="font-medium">Fresh Water:</span> 30 gal</p>
                <p><span className="font-medium">Gray Water:</span> 21 gal</p>
                <p><span className="font-medium">Black Water:</span> 18 gal</p>
                <p><span className="font-medium">GVWR:</span> 6,000 lbs</p>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
      
      {/* Photo Gallery Preview */}
      <div className="content-section-spacing">
        <ContentCard
          title="Photos"
          actions={<Link href="/rv/photos" className="text-blue-600 text-sm">View All</Link>}
        >
          <div className="photo-grid grid-cols-3 max-w-full">
            {/* Sample photos */}
            <div className="photo-container bg-gray-200"></div>
            <div className="photo-container bg-gray-300"></div>
            <div className="photo-container bg-gray-200"></div>
            <div className="photo-container flex items-center justify-center text-navy font-medium">
              +3 more
            </div>
          </div>
        </ContentCard>
      </div>
      
      {/* Documents Preview */}
      <div className="content-section-spacing">
        <ContentCard
          title="Documents"
          actions={<Link href="/rv/documents" className="text-blue-600 text-sm">View All</Link>}
        >
          <div className="space-y-2">
            <div className="p-2 border border-gray-200 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded mr-2">
                  <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Owner&apos;s Manual</p>
                  <p className="text-xs text-gray-500">PDF • 3.2 MB</p>
                </div>
              </div>
              <button className="text-blue-600 text-sm">View</button>
            </div>
            
            <div className="p-2 border border-gray-200 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded mr-2">
                  <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Insurance Policy</p>
                  <p className="text-xs text-gray-500">PDF • 1.8 MB</p>
                </div>
              </div>
              <button className="text-blue-600 text-sm">View</button>
            </div>
          </div>
        </ContentCard>
      </div>
    </PageLayout>
  );
}
