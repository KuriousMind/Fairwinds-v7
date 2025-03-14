import React from 'react';
import Link from 'next/link';
import PageLayout from '@/components/common/layout/PageLayout';
import ContentCard from '@/components/common/layout/ContentCard';
import ButtonGrid from '@/components/common/navigation/ButtonGrid';
import NavButton from '@/components/common/navigation/NavButton';

/**
 * Maintenance Index Page - Main navigation for Maintenance section
 * 
 * Features:
 * - Card-based navigation with three buttons
 * - Access to create new maintenance records and view history
 * - Back navigation to dashboard
 */
export default function MaintenanceIndex() {
  return (
    <PageLayout
      title="Maintenance"
    >
      {/* Navigation Section */}
      <ButtonGrid columns={3}>
        {/* New Maintenance Button */}
        <NavButton
          href="/maintenance/new"
          label="New Record"
          isPrimary
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
        
        {/* History Button */}
        <NavButton
          href="/maintenance/history"
          label="History"
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        {/* Back to Dashboard Button */}
        <NavButton
          href="/"
          label="Back to Dashboard"
          icon={
            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        />
      </ButtonGrid>
      
      {/* Maintenance Summary */}
      <div className="content-section-spacing">
        <ContentCard title="Maintenance Summary">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-700">8</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-yellow-700">2</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-700">1</p>
            </div>
          </div>
        </ContentCard>
      </div>
      
      {/* Upcoming Maintenance */}
      <div className="content-section-spacing">
        <ContentCard
          title="Upcoming Maintenance"
          actions={<Link href="/maintenance/history" className="text-blue-600 text-sm">View All</Link>}
        >
          <div className="space-y-3">
            <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-yellow-800">Oil Change</h3>
                  <p className="text-sm text-gray-600">Due in 2 weeks (March 27, 2025)</p>
                  <p className="text-sm text-gray-500 mt-1">Regular maintenance - every 6 months</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full mb-2">Upcoming</span>
                  <button className="text-blue-600 text-sm">Complete</button>
                </div>
              </div>
            </div>
            
            <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-red-800">Tire Rotation</h3>
                  <p className="text-sm text-gray-600">Overdue by 1 week (March 6, 2025)</p>
                  <p className="text-sm text-gray-500 mt-1">Regular maintenance - every 6 months</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full mb-2">Overdue</span>
                  <button className="text-blue-600 text-sm">Complete</button>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
      
      {/* Recent Maintenance History */}
      <div className="content-section-spacing">
        <ContentCard
          title="Recent Maintenance"
          actions={<Link href="/maintenance/history" className="text-blue-600 text-sm">View All</Link>}
        >
          <div className="space-y-3">
            <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-green-800">Brake Inspection</h3>
                  <p className="text-sm text-gray-600">Completed on February 15, 2025</p>
                  <p className="text-sm text-gray-500 mt-1">Regular maintenance - every 12 months</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full mb-2">Completed</span>
                  <button className="text-blue-600 text-sm">View Details</button>
                </div>
              </div>
            </div>
            
            <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-green-800">Battery Replacement</h3>
                  <p className="text-sm text-gray-600">Completed on January 10, 2025</p>
                  <p className="text-sm text-gray-500 mt-1">Unscheduled maintenance</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full mb-2">Completed</span>
                  <button className="text-blue-600 text-sm">View Details</button>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </PageLayout>
  );
}
