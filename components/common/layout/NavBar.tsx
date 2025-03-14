import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import NavButton from '../navigation/NavButton';

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
              <NavButton
                href={backUrl || ''}
                label="Back"
                onClick={handleBack}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ width: '10px', height: '10px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={0.75}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                }
              />
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
