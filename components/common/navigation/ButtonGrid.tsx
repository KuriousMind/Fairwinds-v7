import React, { ReactNode } from 'react';

interface ButtonGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

/**
 * ButtonGrid component for consistent button layouts across the app
 * 
 * Features:
 * - Responsive grid layout
 * - Configurable number of columns
 * - Consistent spacing
 */
const ButtonGrid: React.FC<ButtonGridProps> = ({
  children,
  columns = 3,
}) => {
  // Determine column classes based on the columns prop
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${columnClasses} gap-2 sm:gap-3 md:gap-4`}>
      {children}
    </div>
  );
};

export default ButtonGrid;
