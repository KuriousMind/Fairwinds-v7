import React, { ReactNode } from 'react';
import Link from 'next/link';

// Props for the NavButton component
interface NavButtonProps {
  href: string;
  label: string;
  icon?: ReactNode;
  isPrimary?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

/**
 * NavButton component for consistent navigation buttons across the app
 * 
 * Features:
 * - Consistent styling
 * - Optional icon
 * - Primary/secondary styling
 * - Disabled state
 */
const NavButton: React.FC<NavButtonProps> = ({
  href,
  label,
  icon,
  isPrimary = false,
  isDisabled = false,
  onClick,
}) => {
  // Base classes for the button
  const baseClasses = "flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Classes based on primary/secondary and disabled state
  const stateClasses = isDisabled
    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
    : isPrimary
      ? "bg-blue text-white hover:bg-orange focus:ring-blue"
      : "bg-white text-navy border border-gray-300 hover:bg-gray-50 focus:ring-navy";
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${stateClasses}`;
  
  // If the button is disabled, render a div instead of a link
  if (isDisabled) {
    return (
      <div className={buttonClasses}>
        {icon && <span className="mr-2">{icon}</span>}
        <span>{label}</span>
      </div>
    );
  }
  
  // If there's an onClick handler, use a button element
  if (onClick) {
    return (
      <button onClick={onClick} className={buttonClasses}>
        {icon && <span className="mr-2">{icon}</span>}
        <span>{label}</span>
      </button>
    );
  }
  
  // Otherwise, use a Link component
  return (
    <Link href={href} className={buttonClasses}>
      {icon && <span className="mr-2">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
};

export default NavButton;
