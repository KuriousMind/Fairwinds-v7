import React, { useState } from 'react';
import { Document } from '@/types/models';
import { getDocumentTypeName, getFormattedFileSize } from '@/lib/document/validation';
import { getS3Url } from '@/lib/storage/s3';

interface DocumentCardProps {
  document: Document;
  onView?: () => void;
  onDelete?: () => void;
}

/**
 * DocumentCard component for displaying individual document items
 * 
 * Features:
 * - Display document details (title, type, tags)
 * - View and delete actions
 * - Document type icon
 * - Tag display
 */
const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Get document type color based on file type
  const getTypeColor = () => {
    const type = document.type.toLowerCase();
    
    if (type.includes('pdf')) {
      return 'bg-red-100 text-red-700';
    } else if (type.includes('word') || type.includes('doc')) {
      return 'bg-blue-100 text-blue-700';
    } else if (type.includes('excel') || type.includes('sheet')) {
      return 'bg-green-100 text-green-700';
    } else if (type.includes('text') || type.includes('txt')) {
      return 'bg-gray-100 text-gray-700';
    } else {
      return 'bg-purple-100 text-purple-700';
    }
  };
  
  // Handle view document
  const handleView = async () => {
    try {
      // Get the signed URL for the document
      const url = await getS3Url(document.url);
      
      // Open the document in a new tab
      window.open(url, '_blank');
      
      // Call the onView callback if provided
      if (onView) {
        onView();
      }
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };
  
  // Get tag color based on tag name
  const getTagColor = (tag: string) => {
    // Common categories with specific colors
    if (tag === 'Owner\'s Manual') return 'bg-blue-100 text-blue-700';
    if (tag === 'Insurance') return 'bg-green-100 text-green-700';
    if (tag === 'Registration') return 'bg-purple-100 text-purple-700';
    if (tag === 'Maintenance') return 'bg-yellow-100 text-yellow-700';
    if (tag === 'Warranty') return 'bg-orange-100 text-orange-700';
    if (tag === 'Purchase') return 'bg-indigo-100 text-indigo-700';
    if (tag === 'Modification') return 'bg-pink-100 text-pink-700';
    
    // Default color for other tags
    return 'bg-gray-100 text-gray-700';
  };
  
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden transition-all ${
      isExpanded ? 'shadow-md' : ''
    }`}>
      {/* Main card content */}
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center overflow-hidden">
          <div className={`p-2 rounded mr-2 ${getTypeColor()}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ maxWidth: '100%' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center">
              <p className="font-medium truncate">{document.title}</p>
              {document.tags && document.tags.length > 0 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2 text-xs text-gray-500 hover:text-blue-600"
                >
                  {isExpanded ? 'Hide tags' : `${document.tags.length} tag${document.tags.length !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {getDocumentTypeName(document.type)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleView}
            className="text-blue-600 text-sm hover:text-orange transition-colors"
          >
            View
          </button>
          {onDelete && (
            <button 
              onClick={onDelete}
              className="text-red-600 text-sm hover:text-orange transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      {/* Tags section (expanded) */}
      {isExpanded && document.tags && document.tags.length > 0 && (
        <div className="px-3 pb-3 pt-0">
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Tags:</p>
            <div className="flex flex-wrap gap-1">
              {document.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className={`text-xs px-2 py-1 rounded-full ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
