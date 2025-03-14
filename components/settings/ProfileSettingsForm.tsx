import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { client, handleApiError } from '@/lib/api/amplify';

interface ProfileSettingsFormProps {
  initialSettings?: {
    displayName?: string;
    notificationsEnabled?: boolean;
  };
  onSave?: () => void;
}

/**
 * ProfileSettingsForm component - Form for user profile settings
 * 
 * Features:
 * - Display name input
 * - Notification preferences toggle
 * - Save functionality
 */
const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({ 
  initialSettings = {}, 
  onSave 
}) => {
  const { user } = useAuthenticator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: initialSettings.displayName || '',
    notificationsEnabled: initialSettings.notificationsEnabled !== undefined 
      ? initialSettings.notificationsEnabled 
      : true,
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };
  
  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // In a real implementation, this would update the user's settings in the database
      // For now, we'll just simulate a successful save
      
      // Example of how this would be implemented:
      // await client.models.User.update({
      //   id: user?.userId,
      //   displayName: formData.displayName,
      //   notificationPreferences: JSON.stringify({
      //     enabled: formData.notificationsEnabled
      //   })
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success message
      setSuccessMessage('Profile settings saved successfully');
      
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving profile settings:', error);
      setError(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Display name field */}
      <div className="mb-4">
        <label htmlFor="displayName" className="block text-navy font-medium mb-1">
          Display Name
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
          placeholder="Enter your display name"
        />
      </div>
      
      {/* Notifications toggle */}
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="notificationsEnabled"
            name="notificationsEnabled"
            checked={formData.notificationsEnabled}
            onChange={handleChange}
            className="h-4 w-4 text-blue focus:ring-blue border-gray-300 rounded"
          />
          <label htmlFor="notificationsEnabled" className="ml-2 block text-navy">
            Enable maintenance notifications
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Receive notifications about upcoming and overdue maintenance tasks.
        </p>
      </div>
      
      {/* Form actions */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end">
          {/* Success message - positioned near the button */}
          {successMessage && (
            <div className="mb-3 sm:mb-0 sm:mr-4 p-2 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center animate-fade-in">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          )}
          
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              successMessage 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue hover:bg-orange'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Profile Settings'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileSettingsForm;
