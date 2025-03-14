import React from 'react';
import NavBar from '@/components/common/layout/NavBar';
import ErrorBoundary from '@/components/common/ui/ErrorBoundary';

/**
 * Settings Page - User preferences and app settings
 * 
 * Features:
 * - User preferences (placeholder for Phase 3)
 * - App settings (placeholder for Phase 3)
 * - Back navigation to dashboard
 */
export default function Settings() {
  return (
    <ErrorBoundary>
      <main className="container mx-auto px-2 py-3 sm:p-4">
        <NavBar 
          title="Settings" 
          showBackButton 
          backUrl="/"
        />

        <div className="mt-8">
          <div className="card">
            <h1 className="heading mb-4">User Settings</h1>
            <p className="text mb-4">
              This feature will be implemented in Phase 3 of the project.
            </p>
            <p className="text mb-4">
              The settings page will allow you to:
            </p>
            <ul className="list-disc pl-5 mb-4 text">
              <li>Manage your user profile</li>
              <li>Configure notification preferences</li>
              <li>Set display preferences</li>
              <li>Manage account settings</li>
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
