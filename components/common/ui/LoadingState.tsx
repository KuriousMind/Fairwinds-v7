import React, { useState, useEffect } from 'react';

// Props for the LoadingState component
interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  minDisplayTime?: number; // Minimum time to display in milliseconds
  onLoadingComplete?: () => void; // Optional callback when loading is complete
}

/**
 * LoadingState component for displaying loading indicators
 * 
 * Features:
 * - Spinner animation
 * - Optional loading message
 * - Can be displayed inline or full-screen
 * - Minimum display time of 1 second
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  fullScreen = true, // Default to full-screen overlay
  minDisplayTime = 1000, // Default minimum display time: 1 second
  onLoadingComplete,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to ensure the loading state is shown for at least minDisplayTime
    const timer = setTimeout(() => {
      setVisible(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, minDisplayTime);

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [minDisplayTime, onLoadingComplete]);

  // If not visible, don't render anything
  if (!visible) return null;

  // Container classes based on fullScreen prop
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        {/* Enhanced Spinner */}
        <svg className="animate-spin h-12 w-12 text-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        
        {/* Loading message */}
        {message && (
          <p className="text-navy font-medium text-lg">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
