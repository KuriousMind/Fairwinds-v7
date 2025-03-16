import React from 'react';
import { MaintenanceRecord } from '@/types/models';
import S3Image from '@/components/common/ui/S3Image';

interface MaintenanceCardProps {
  record: MaintenanceRecord;
  onView?: () => void;
  onComplete?: () => void;
}

/**
 * MaintenanceCard component for displaying individual maintenance records
 * 
 * Features:
 * - Display maintenance record details
 * - Status indicator (upcoming, overdue, completed)
 * - Action buttons (view details, complete)
 */
const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  record,
  onView,
  onComplete,
}) => {
  // Determine if the record is upcoming, overdue, or completed
  const getStatus = () => {
    // If the record has a completed field and it's true, it's completed
    if (record.type.toLowerCase().includes('completed')) {
      return 'completed';
    }
    
    // Check if the record is overdue
    const recordDate = new Date(record.date);
    const today = new Date();
    
    if (recordDate < today) {
      return 'overdue';
    }
    
    // Otherwise, it's upcoming
    return 'upcoming';
  };
  
  // Get status-specific styling
  const getStatusStyles = () => {
    const status = getStatus();
    
    switch (status) {
      case 'completed':
        return {
          container: 'border-green-200 bg-green-50',
          badge: 'bg-green-200 text-green-800',
          title: 'text-green-800',
        };
      case 'overdue':
        return {
          container: 'border-red-200 bg-red-50',
          badge: 'bg-red-200 text-red-800',
          title: 'text-red-800',
        };
      case 'upcoming':
      default:
        return {
          container: 'border-yellow-200 bg-yellow-50',
          badge: 'bg-yellow-200 text-yellow-800',
          title: 'text-yellow-800',
        };
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get relative time description
  const getRelativeTimeDescription = () => {
    const status = getStatus();
    const recordDate = new Date(record.date);
    const today = new Date();
    
    // Calculate difference in days
    const diffTime = Math.abs(recordDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (status === 'completed') {
      return `Completed on ${formatDate(record.date)}`;
    } else if (status === 'overdue') {
      return `Overdue by ${diffDays} ${diffDays === 1 ? 'day' : 'days'} (${formatDate(record.date)})`;
    } else {
      return `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'} (${formatDate(record.date)})`;
    }
  };
  
  const styles = getStatusStyles();
  const status = getStatus();
  
  return (
    <div className={`p-3 border rounded-lg ${styles.container}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-medium ${styles.title}`}>{record.title}</h3>
          <p className="text-sm text-gray-600">{getRelativeTimeDescription()}</p>
          <p className="text-sm text-gray-500 mt-2">{record.type}</p>
          {record.notes && <p className="text-sm text-gray-500 mt-2">{record.notes}</p>}
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 text-xs ${styles.badge} rounded-full mb-2`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <div className="space-x-2">
            {onView && (
              <button 
                onClick={onView}
                className="text-blue-600 text-sm hover:text-orange transition-colors"
              >
                View Details
              </button>
            )}
            {status !== 'completed' && onComplete && (
              <button 
                onClick={onComplete}
                className="text-blue-600 text-sm hover:text-orange transition-colors"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Photo preview if available */}
      {record.photos && record.photos.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="photo-grid grid-cols-4 max-w-full">
            {record.photos.slice(0, 3).map((photo, index) => (
              <div key={index} className="photo-container">
                <S3Image
                  s3Key={photo}
                  alt={`Maintenance photo ${index + 1}`}
                  className="photo-img"
                />
              </div>
            ))}
            {record.photos.length > 3 && (
              <div className="photo-container flex items-center justify-center text-navy font-medium">
                +{record.photos.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceCard;
