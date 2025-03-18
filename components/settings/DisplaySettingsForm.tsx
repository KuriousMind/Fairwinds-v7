import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { client, handleApiError } from '@/lib/api/amplify';

// Array of joke messages for kilometers selection
const KILOMETER_JOKE_MESSAGES = [
  "Kilometers? What's next, driving on the left side of the road? This is America!",
  "Kilometers detected. Bald eagle disappointment imminent.",
  "Sorry, we measure distance in football fields and cheeseburgers here.",
  "Kilometers? George Washington didn't cross the Delaware in kilometers.",
  "Your request to use kilometers has been reported to the Department of Freedom.",
  "Kilometers? (Star-Spangled Banner intensifies)",
  "Warning: Your device is exhibiting signs of metric system propaganda. Prescribing miles as treatment.",
  "Kilometers? That's cute. Did you also want your temperature in Celsius and your soda in liters?",
  "According to the Constitution, Americans have the right to bear arms and use miles.",
  "Kilometers not recognized. Please input distance in 'eagles per monster truck' instead.",
  "We can put a man on the moon but we can't figure out the metric system. Choose miles.",
  "Your GPS is experiencing a freedom deficiency. Switching to miles..."
];

interface DisplaySettingsFormProps {
  initialSettings?: {
    units?: 'miles' | 'kilometers';
    dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  };
  onSave?: () => void;
}

/**
 * DisplaySettingsForm component - Form for display preferences
 * 
 * Features:
 * - Units of measurement selection (miles/kilometers)
 * - Date format selection
 * - Save functionality
 */
const DisplaySettingsForm: React.FC<DisplaySettingsFormProps> = ({ 
  initialSettings = {}, 
  onSave 
}) => {
  const { user } = useAuthenticator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    units: initialSettings.units || 'miles',
    dateFormat: initialSettings.dateFormat || 'MM/DD/YYYY',
  });
  
  // Function to get a random joke message
  const getRandomJokeMessage = () => {
    const randomIndex = Math.floor(Math.random() * KILOMETER_JOKE_MESSAGES.length);
    return KILOMETER_JOKE_MESSAGES[randomIndex];
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for kilometers selection
    if (name === 'units' && value === 'kilometers') {
      // Show joke message
      alert(getRandomJokeMessage());
      // Don't update state - keep miles selected
      return;
    }
    
    setFormData({ 
      ...formData, 
      [name]: value 
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
      //   displayPreferences: JSON.stringify({
      //     units: formData.units,
      //     dateFormat: formData.dateFormat
      //   })
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success message
      setSuccessMessage('Display settings saved successfully');
      
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving display settings:', error);
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
      
      {/* Units field */}
      <div className="mb-4">
        <label className="block text-navy font-medium mb-1">
          Units of Measurement
        </label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              id="units-miles"
              name="units"
              type="radio"
              value="miles"
              checked={formData.units === 'miles'}
              onChange={handleChange}
              className="h-4 w-4 text-blue focus:ring-blue border-gray-300"
            />
            <label htmlFor="units-miles" className="ml-2 block text-navy">
              Miles
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="units-kilometers"
              name="units"
              type="radio"
              value="kilometers"
              checked={formData.units === 'kilometers'}
              onChange={handleChange}
              className="h-4 w-4 text-blue focus:ring-blue border-gray-300"
            />
            <label htmlFor="units-kilometers" className="ml-2 block text-navy">
              Kilometers
            </label>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Choose your preferred unit of measurement for distances.
        </p>
      </div>
      
      {/* Date format field */}
      <div className="mb-4">
        <label htmlFor="dateFormat" className="block text-navy font-medium mb-1">
          Date Format
        </label>
        <select
          id="dateFormat"
          name="dateFormat"
          value={formData.dateFormat}
          onChange={handleChange}
          className="w-full px-2 py-2 sm:px-3 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 12/31/2023)</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 31/12/2023)</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2023-12-31)</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">
          Choose your preferred date format for the application.
        </p>
      </div>
      
      {/* Form actions */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end">
          {/* Success message - positioned near the button */}
          {successMessage && (
            <div className="mb-3 sm:mb-0 sm:mr-4 p-2 text-sm bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center animate-fade-in">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              'Save Display Settings'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DisplaySettingsForm;
