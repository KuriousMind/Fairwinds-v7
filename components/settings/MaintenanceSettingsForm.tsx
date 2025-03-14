import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { client, handleApiError } from '@/lib/api/amplify';

// Default maintenance types from MaintenanceForm.tsx
const DEFAULT_MAINTENANCE_TYPES = [
  'Regular Service',
  'Repair',
  'Inspection',
  'Upgrade',
  'Replacement',
  'Cleaning',
  'Completed',
  'Other'
];

interface MaintenanceSettingsFormProps {
  initialSettings?: {
    reminderDays?: number;
    maintenanceTypes?: string[];
  };
  onSave?: () => void;
}

/**
 * MaintenanceSettingsForm component - Form for maintenance preferences
 * 
 * Features:
 * - Default reminder period selection
 * - Maintenance categories customization
 * - Save functionality
 */
const MaintenanceSettingsForm: React.FC<MaintenanceSettingsFormProps> = ({ 
  initialSettings = {}, 
  onSave 
}) => {
  const { user } = useAuthenticator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    reminderDays: initialSettings.reminderDays || 7,
    maintenanceTypes: initialSettings.maintenanceTypes || [...DEFAULT_MAINTENANCE_TYPES],
  });
  
  // New maintenance type input
  const [newType, setNewType] = useState('');
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'reminderDays' ? parseInt(value) : value 
    });
  };
  
  // Handle adding a new maintenance type
  const handleAddType = () => {
    if (newType.trim() && !formData.maintenanceTypes.includes(newType.trim())) {
      setFormData({
        ...formData,
        maintenanceTypes: [...formData.maintenanceTypes, newType.trim()]
      });
      setNewType('');
    }
  };
  
  // Handle removing a maintenance type
  const handleRemoveType = (index: number) => {
    const updatedTypes = [...formData.maintenanceTypes];
    updatedTypes.splice(index, 1);
    setFormData({
      ...formData,
      maintenanceTypes: updatedTypes
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
      //   maintenancePreferences: JSON.stringify({
      //     reminderDays: formData.reminderDays,
      //     maintenanceTypes: formData.maintenanceTypes
      //   })
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success message
      setSuccessMessage('Maintenance settings saved successfully');
      
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving maintenance settings:', error);
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
      
      {/* Reminder days field */}
      <div className="mb-4">
        <label htmlFor="reminderDays" className="block text-navy font-medium mb-1">
          Default Reminder Period
        </label>
        <select
          id="reminderDays"
          name="reminderDays"
          value={formData.reminderDays}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
        >
          <option value={7}>1 week before</option>
          <option value={14}>2 weeks before</option>
          <option value={21}>3 weeks before</option>
          <option value={30}>1 month before</option>
          <option value={60}>2 months before</option>
          <option value={90}>3 months before</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">
          When to send reminders for upcoming maintenance tasks.
        </p>
      </div>
      
      {/* Maintenance types field */}
      <div className="mb-4">
        <label className="block text-navy font-medium mb-1">
          Maintenance Categories
        </label>
        
        <div className="mb-2 flex flex-wrap gap-2">
          {formData.maintenanceTypes.map((type, index) => (
            <div 
              key={index}
              className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
            >
              <span className="mr-2">{type}</span>
              <button
                type="button"
                onClick={() => handleRemoveType(index)}
                className="text-gray-500 hover:text-red-500"
                aria-label={`Remove ${type}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue"
            placeholder="Add new category"
          />
          <button
            type="button"
            onClick={handleAddType}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
          >
            Add
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Customize maintenance categories for your RV.
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
              'Save Maintenance Settings'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default MaintenanceSettingsForm;
