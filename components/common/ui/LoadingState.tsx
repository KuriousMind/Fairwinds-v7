import React from 'react';

// Props for the LoadingState component
interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingState component for displaying loading indicators
 * 
 * Features:
 * - Spinner animation
 * - Optional loading message
 * - Can be displayed inline or full-screen
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  // Container classes based on fullScreen prop
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mb-4"></div>
        
        {/* Loading message */}
        {message && (
          <p className="text-navy font-medium text-lg">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
