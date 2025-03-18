import React, { ReactNode } from 'react';
import NavBar from './NavBar';
import ErrorBoundary from '../ui/ErrorBoundary';

interface PageLayoutProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
  children: ReactNode;
}

/**
 * PageLayout component for consistent page structure across the app
 * 
 * Features:
 * - Consistent container styling
 * - NavBar integration
 * - Error boundary
 * - Responsive padding and margins
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  showBackButton = false,
  backUrl,
  children,
}) => {
  return (
    <ErrorBoundary>
      <main className="container mx-auto px-2 py-2 sm:px-4 sm:py-4 md:px-6 md:py-6 max-w-screen-md flex flex-col min-h-screen overflow-hidden">
        <NavBar 
          title={title} 
          showBackButton={showBackButton} 
          backUrl={backUrl}
        />
        <div className="content-section-spacing">
          {children}
        </div>
      </main>
    </ErrorBoundary>
  );
};

export default PageLayout;
