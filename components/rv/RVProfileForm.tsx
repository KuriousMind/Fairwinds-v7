import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { RV } from '@/types/models';
import { client, handleApiError } from '@/lib/api/amplify';
import LoadingState from '@/components/common/ui/LoadingState';

// Common RV makes for auto-complete
const RV_MAKES = [
  'Airstream', 'Coachmen', 'Dutchmen', 'Entegra', 'Fleetwood', 
  'Forest River', 'Grand Design', 'Gulf Stream', 'Heartland', 
  'Jayco', 'Keystone', 'KZ', 'Newmar', 'Northwood', 'Thor', 
  'Tiffin', 'Winnebago'
];

// Generate years from 1970 to current year
const YEARS = Array.from(
  { length: new Date().getFullYear() - 1969 },
  (_, i) => (new Date().getFullYear() - i).toString()
);

interface RVProfileFormProps {
  rv?: RV | null;
  userId: string;
  onSuccess?: () => void;
}

/**
 * RVProfileForm component for adding/editing RV information
 * 
 * Features:
 * - Form for entering RV details
 * - Auto-complete for make
 * - Year selection
 * - Validation
 * - Create/update functionality
 */
const RVProfileForm: React.FC<RVProfileFormProps> = ({ rv, userId, onSuccess }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    vin: '',
    notes: '',
  });
  
  // Filtered makes for auto-complete
  const [filteredMakes, setFilteredMakes] = useState<string[]>([]);
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  
  // Initialize form with existing RV data if available
  useEffect(() => {
    if (rv) {
      setFormData({
        make: rv.make || '',
        model: rv.model || '',
        year: rv.year?.toString() || new Date().getFullYear().toString(),
        vin: '', // Add VIN field if needed in the future
        notes: '', // Add notes field if needed in the future
      });
    }
  }, [rv]);
  
  // Handle make input change with auto-complete
  const handleMakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, make: value });
    
    if (value.length > 0) {
      const filtered = RV_MAKES.filter(make => 
        make.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMakes(filtered);
      setShowMakeDropdown(true);
    } else {
      setFilteredMakes([]);
      setShowMakeDropdown(false);
    }
  };
  
  // Select a make from the dropdown
  const selectMake = (make: string) => {
    setFormData({ ...formData, make });
    setShowMakeDropdown(false);
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.make || !formData.model || !formData.year) {
        throw new Error('Please fill in all required fields');
      }
      
      // Create or update RV
      if (rv) {
        // Update existing RV
        await client.models.RV.update({
          id: rv.id,
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          // Keep existing photos
          photos: rv.photos || [],
        });
      } else {
        // Create new RV
        await client.models.RV.create({
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          userId: userId,
          photos: [],
        });
      }
      
      // Success - redirect or callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/rv');
      }
    } catch (error) {
      console.error('Error saving RV:', error);
      setError(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel button
  const handleCancel = () => {
    router.push('/rv');
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-navy mb-6">
        {rv ? 'Edit RV Details' : 'Add Your RV'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Make field with auto-complete */}
        <div className="mb-4 relative">
          <label htmlFor="make" className="block text-navy font-medium mb-1">
            Make <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="make"
            name="make"
            value={formData.make}
            onChange={handleMakeChange}
            onFocus={() => formData.make && setShowMakeDropdown(true)}
            onBlur={() => setTimeout(() => setShowMakeDropdown(false), 200)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            required
          />
          {showMakeDropdown && filteredMakes.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredMakes.map((make) => (
                <div
                  key={make}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => selectMake(make)}
                >
                  {make}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Model field */}
        <div className="mb-4">
          <label htmlFor="model" className="block text-navy font-medium mb-1">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            required
          />
        </div>
        
        {/* Year field */}
        <div className="mb-4">
          <label htmlFor="year" className="block text-navy font-medium mb-1">
            Year <span className="text-red-500">*</span>
          </label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            required
          >
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue text-white rounded-md hover:bg-orange transition-colors"
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
              'Save RV Details'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RVProfileForm;
