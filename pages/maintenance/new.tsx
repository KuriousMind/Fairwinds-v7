import React from 'react';
import NavBar from '@/components/common/layout/NavBar';
import ErrorBoundary from '@/components/common/ui/ErrorBoundary';

/**
 * New Maintenance Record Page - Create a new maintenance record
 * 
 * Features:
 * - Form for entering maintenance details (placeholder for Phase 3)
 * - Back navigation to maintenance index
 */
export default function MaintenanceNew() {
  return (
    <ErrorBoundary>
      <main className="container mx-auto px-2 py-3 sm:p-4">
        <NavBar 
          title="New Maintenance Record" 
          showBackButton 
          backUrl="/maintenance"
        />

        <div className="mt-8">
          <div className="card">
            <h1 className="heading mb-4">Create Maintenance Record</h1>
            <p className="text mb-4">
              This feature will be implemented in Phase 3 of the project.
            </p>
            <p className="text mb-4">
              The maintenance record form will allow you to:
            </p>
            <ul className="list-disc pl-5 mb-4 text">
              <li>Enter maintenance details (title, date, type)</li>
              <li>Add notes about the maintenance performed</li>
              <li>Upload photos of the maintenance</li>
              <li>Attach relevant documents</li>
            </ul>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text text-blue">
                This is a placeholder page. The actual implementation will be available in Phase 3.
              </p>
            </div>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
