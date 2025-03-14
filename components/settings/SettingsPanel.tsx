import React from 'react';
import ContentCard from '@/components/common/layout/ContentCard';

interface SettingsPanelProps {
  children?: React.ReactNode;
}

/**
 * SettingsPanel component - Container for settings sections
 * 
 * This component provides a consistent layout for the settings page,
 * wrapping each settings section in a ContentCard with appropriate spacing.
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ children }) => {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
};

export default SettingsPanel;
