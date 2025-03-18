import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import PageLayout from '@/components/common/layout/PageLayout';
import ContentCard from '@/components/common/layout/ContentCard';
import SettingsPanel from '@/components/settings/SettingsPanel';
import ProfileSettingsForm from '@/components/settings/ProfileSettingsForm';
import MaintenanceSettingsForm from '@/components/settings/MaintenanceSettingsForm';
import DisplaySettingsForm from '@/components/settings/DisplaySettingsForm';
import LoadingState from '@/components/common/ui/LoadingState';

/**
 * Settings Page - User preferences and app settings
 * 
 * Features:
 * - User profile settings (display name, notification preferences)
 * - Maintenance settings (reminder period, maintenance categories)
 * - Display preferences (units, date format)
 * - Back navigation to dashboard
 */
export default function Settings() {
  const { user } = useAuthenticator();
  const [loading, setLoading] = useState(true);
  
  // Mock settings data - in a real implementation, this would be fetched from the database
  const [settings, setSettings] = useState({
    profile: {
      displayName: '',
      notificationsEnabled: true,
    },
    maintenance: {
      reminderDays: 14,
      maintenanceTypes: [] as string[],
    },
    display: {
      units: 'miles' as 'miles' | 'kilometers',
      dateFormat: 'MM/DD/YYYY' as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD',
    }
  });
  
  // Simulate loading settings from the database
  useEffect(() => {
    // In a real implementation, this would fetch the user's settings from the database
    const loadSettings = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - in a real implementation, this would come from the API
        setSettings({
          profile: {
            displayName: user?.username || '',
            notificationsEnabled: true,
          },
          maintenance: {
            reminderDays: 14,
            maintenanceTypes: [
              'Regular Service',
              'Repair',
              'Inspection',
              'Upgrade',
              'Replacement',
              'Cleaning',
              'Completed',
              'Other'
            ],
          },
          display: {
            units: 'miles',
            dateFormat: 'MM/DD/YYYY',
          }
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [user]);
  
  // Handle settings refresh
  const handleRefreshSettings = () => {
    setLoading(true);
    // In a real implementation, this would re-fetch the user's settings
    // Use a longer timeout to ensure the success message is visible
    setTimeout(() => setLoading(false), 1500);
  };
  
  if (loading) {
    return <LoadingState fullScreen message="Loading settings..." />;
  }
  
  return (
    <PageLayout title="Settings" showBackButton backUrl="/">
      <SettingsPanel>
        <ContentCard title="User Profile">
          <ProfileSettingsForm 
            initialSettings={settings.profile}
            onSave={handleRefreshSettings}
          />
        </ContentCard>
        
        <ContentCard title="Maintenance Preferences">
          <MaintenanceSettingsForm 
            initialSettings={settings.maintenance}
            onSave={handleRefreshSettings}
          />
        </ContentCard>
        
        <ContentCard title="Display Preferences">
          <DisplaySettingsForm 
            initialSettings={settings.display}
            onSave={handleRefreshSettings}
          />
        </ContentCard>
      </SettingsPanel>
    </PageLayout>
  );
}
