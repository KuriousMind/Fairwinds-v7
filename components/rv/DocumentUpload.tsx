import React, { useState, useRef } from 'react';
import { client, handleApiError } from '@/lib/api/amplify';
import { RV, Document } from '@/types/models';
import { validateDocumentFile, getDocumentTypeName, getFormattedFileSize, ALLOWED_DOCUMENT_TYPES } from '@/lib/document/validation';
import { uploadToS3 } from '@/lib/storage/s3';

interface DocumentUploadProps {
  rv: RV;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * DocumentUpload component for adding new documents
 * 
 * Features:
 * - File selection
 * - Drag and drop
 * - Document preview
 * - Upload to S3
 */
const DocumentUpload: React.FC<DocumentUploadProps> = ({ rv, onSuccess, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Maximum file size in MB
  const MAX_FILE_SIZE = 10;
  // Maximum number of documents allowed
  const MAX_DOCUMENTS = 20;
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      if (!validateDocumentFile(file, MAX_FILE_SIZE)) {
        setError(`Please select a valid document file under ${MAX_FILE_SIZE}MB.`);
        return;
      }
      
      setSelectedFile(file);
      
      // Set default document title from filename (without extension)
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setDocumentTitle(fileName || 'Document');
      
      setError(null);
    }
  };
  
  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type and size
      if (!validateDocumentFile(file, MAX_FILE_SIZE)) {
        setError(`Please select a valid document file under ${MAX_FILE_SIZE}MB.`);
        return;
      }
      
      setSelectedFile(file);
      
      // Set default document title from filename (without extension)
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setDocumentTitle(fileName || 'Document');
      
      setError(null);
    }
  };
  
  // Prevent default behavior for drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Handle upload button click
  const handleUpload = async () => {
    if (!selectedFile || !rv) return;
    
    // Validate document title
    if (!documentTitle.trim()) {
      setError('Please enter a document title.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Check if we've reached the document limit
      if (rv.documents && rv.documents.length >= MAX_DOCUMENTS) {
        throw new Error(`You can only upload a maximum of ${MAX_DOCUMENTS} documents.`);
      }
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev + 10;
          return next > 90 ? 90 : next;
        });
      }, 300);
      
      // Upload to S3
      const s3Key = await uploadToS3(selectedFile, `rv-documents/${rv.id}`);
      
      // Create a new document record
      const newDocument = await client.models.Document.create({
        title: documentTitle,
        type: selectedFile.type,
        url: s3Key,
        rvId: rv.id,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Notify parent of success
      onSuccess();
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(handleApiError(error));
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-navy mb-6">Upload Document</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* File drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          selectedFile ? 'border-blue' : 'border-gray-300 hover:border-blue'
        } transition-colors`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={ALLOWED_DOCUMENT_TYPES.join(',')}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="p-4 bg-blue-100 rounded-lg mb-4">
              <svg className="h-12 w-12 text-blue-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                {getDocumentTypeName(selectedFile.type)} • {getFormattedFileSize(selectedFile.size)}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Click to select a different document
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-navy font-medium mb-1">
              Click to select or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              PDF, DOC, DOCX, XLS, XLSX, TXT, RTF (max. {MAX_FILE_SIZE}MB)
            </p>
          </div>
        )}
      </div>
      
      {/* Document title input */}
      {selectedFile && (
        <div className="mt-4">
          <label htmlFor="documentTitle" className="block text-navy font-medium mb-1">
            Document Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="documentTitle"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            placeholder="Enter document title"
            required
          />
        </div>
      )}
      
      {/* Upload progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isUploading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || !documentTitle.trim() || isUploading}
          className={`px-4 py-2 rounded-md text-white transition-colors ${
            !selectedFile || !documentTitle.trim() || isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue hover:bg-orange'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
