import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV, Document } from '@/types/models';
import DocumentCard from './DocumentCard';
import LoadingState from '@/components/common/ui/LoadingState';
import { deleteFromS3 } from '@/lib/storage/s3';
import { getDocumentTypeName, DOCUMENT_TYPE_NAMES } from '@/lib/document/validation';

interface DocumentListProps {
  rv: RV;
  onAddDocument?: () => void;
}

type SortOption = 'title' | 'type' | 'newest' | 'oldest';

/**
 * DocumentList component for displaying and managing RV documents
 * 
 * Features:
 * - List of documents with sorting and filtering
 * - Search functionality
 * - View document
 * - Delete document
 * - Add document button
 */
const DocumentList: React.FC<DocumentListProps> = ({
  rv,
  onAddDocument,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get unique document types from the documents
  const documentTypes = useMemo(() => {
    const types = new Set<string>();
    documents.forEach(doc => {
      if (doc.type) {
        types.add(doc.type);
      }
    });
    return Array.from(types);
  }, [documents]);
  
  // Fetch documents for the RV
  const fetchDocuments = useCallback(async () => {
    if (!rv) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // List documents for the RV
      const documentsData = await client.models.Document.list({
        filter: { rvId: { eq: rv.id } }
      });
      
      if (documentsData.data && documentsData.data.length > 0) {
        // Map the raw documents to typed documents
        const typedDocuments = documentsData.data
          .filter(doc => doc.rvId) // Filter out documents with null rvId
          .map(doc => ({
            id: doc.id,
            title: doc.title,
            type: doc.type,
            url: doc.url,
            rvId: doc.rvId as string,
            tags: doc.tags as string[] || [],
          }));
        
        setDocuments(typedDocuments as Document[]);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [rv]);
  
  // Fetch documents
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Handle document deletion
  const handleDeleteDocument = async (document: Document) => {
    if (isDeleting) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Delete from S3 if it's not a base64 string
      if (!document.url.startsWith('data:')) {
        try {
          await deleteFromS3(document.url);
        } catch (s3Error) {
          console.error('Error deleting from S3:', s3Error);
          // Continue even if S3 deletion fails
        }
      }
      
      // Delete the document record
      await client.models.Document.delete({
        id: document.id,
      });
      
      // Update the documents list
      setDocuments(documents.filter(doc => doc.id !== document.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(handleApiError(error));
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    // First, filter by type if needed
    let filtered = documents;
    if (filterType !== 'all') {
      filtered = documents.filter(doc => doc.type === filterType);
    }
    
    // Then filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) || 
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Finally, sort the documents
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'type':
          return getDocumentTypeName(a.type).localeCompare(getDocumentTypeName(b.type));
        case 'newest':
          // This assumes documents have a createdAt field, which they might not
          // In a real app, you'd want to add this field to your model
          return new Date(b.id).getTime() - new Date(a.id).getTime();
        case 'oldest':
          return new Date(a.id).getTime() - new Date(b.id).getTime();
        default:
          return 0;
      }
    });
  }, [documents, filterType, searchQuery, sortBy]);
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
  };
  
  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Render loading state
  if (loading) {
    return <LoadingState message="Loading documents..." />;
  }
  
  // Render empty state
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
          style={{ maxWidth: '100%' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add documents like owner&apos;s manuals, insurance policies, and more.
        </p>
        {onAddDocument && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onAddDocument}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue hover:bg-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Document
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="px-1">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Search and filter controls */}
      {documents.length > 0 && (
        <div className="mb-4 space-y-3">
          {/* Search input */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-blue focus:border-blue"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          {/* Filter and sort controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Document type filter */}
            <div className="w-full sm:w-1/2">
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <select
                id="filterType"
                className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-blue focus:border-blue"
                value={filterType}
                onChange={handleFilterChange}
              >
                <option value="all">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>
                    {getDocumentTypeName(type)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort options */}
            <div className="w-full sm:w-1/2">
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                id="sortBy"
                className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-blue focus:border-blue"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="title">Title (A-Z)</option>
                <option value="type">Document Type</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Results count */}
      {documents.length > 0 && (
        <div className="mb-3 text-sm text-gray-500">
          Showing {filteredAndSortedDocuments.length} of {documents.length} documents
          {searchQuery && ` matching "${searchQuery}"`}
          {filterType !== 'all' && ` of type "${getDocumentTypeName(filterType)}"`}
        </div>
      )}
      
      {/* Document list */}
      {filteredAndSortedDocuments.length === 0 && documents.length > 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No documents match your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={() => handleDeleteDocument(document)}
            />
          ))}
        </div>
      )}
      
      {onAddDocument && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onAddDocument}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Another Document
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
