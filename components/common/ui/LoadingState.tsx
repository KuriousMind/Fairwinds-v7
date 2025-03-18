import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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
      {/* RV Pirate Logo with softened edges */}
      <div className="relative mb-4 animate-pulse">
        <Image
          src="/rv pirate logo.png"
          alt="Loading"
          width={96}
          height={96}
          className="rounded-full shadow-lg"
          style={{ filter: 'drop-shadow(0 0 8px rgba(43, 108, 176, 0.5))' }}
        />
      </div>
        
        {/* Loading message */}
        {message && (
          <p className="text-navy font-medium text-lg">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
