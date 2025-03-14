import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';

// Props for the NavBar component
interface NavBarProps {
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
  children?: ReactNode;
}

/**
 * NavBar component for consistent navigation across the app
 * 
 * Features:
 * - Page title
 * - Optional back button
 * - Slot for navigation buttons
 */
const NavBar: React.FC<NavBarProps> = ({
  title,
  showBackButton = false,
  backUrl = '/dashboard',
  children,
}) => {
  const router = useRouter();

  // Handle back button click
  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="w-full bg-white shadow-md">
      <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4">
        <div className="py-4">
          {/* Title Section - Centered */}
          <div className="w-full text-center mb-4">
            <h1 className="heading text-lg sm:text-2xl truncate inline-block">
              {title || 'Fairwinds RV'}
            </h1>
          </div>

          {/* Navigation Buttons - Centered */}
          <div className="w-full flex justify-center items-center space-x-1 sm:space-x-2">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="btn-secondary px-3 py-1 text-sm rounded-lg flex items-center"
                aria-label="Back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-navy"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
