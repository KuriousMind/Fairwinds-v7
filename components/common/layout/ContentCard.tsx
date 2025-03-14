import React, { ReactNode } from 'react';

interface ContentCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode; // New prop for card actions
  variant?: 'default' | 'primary' | 'info'; // Optional styling variants
}

/**
 * ContentCard component for consistent content display across the app
 * 
 * Features:
 * - Consistent card styling
 * - Optional title and description
 * - Support for card actions in the header
 * - Multiple styling variants (default, primary, info)
 * - Flexible content area
 */
const ContentCard: React.FC<ContentCardProps> = ({
  title,
  description,
  children,
  actions,
  variant = 'default',
}) => {
  // Determine card styling based on variant
  const cardClasses = {
    default: "card",
    primary: "card bg-blue-50 border-blue-100",
    info: "card bg-gray-50 border-gray-100",
  }[variant];

  return (
    <div className={cardClasses}>
      {/* Card header with title and optional actions */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-1">
          {title && <h1 className="heading text-2xl">{title}</h1>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      
      {description && (
        <p className="text mb-6">
          {description}
        </p>
      )}
      
      {children}
    </div>
  );
};

export default ContentCard;
