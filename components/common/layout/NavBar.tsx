import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
 * - App logo
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
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-navy"
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
              </button>
            )}
            
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/rv pirate logo.png"
                alt="Fairwinds RV Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="ml-2 text-xl font-semibold text-brown">
                {title || 'Fairwinds RV'}
              </span>
            </Link>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
