import React, { useState, useEffect } from 'react';
import { getS3Url } from '@/lib/storage/s3';
import LoadingState from './LoadingState';

interface S3ImageProps {
  s3Key: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * S3Image component for displaying images stored in S3
 * 
 * Features:
 * - Fetches signed URL for S3 object
 * - Handles loading state
 * - Handles errors
 */
const S3Image: React.FC<S3ImageProps> = ({ 
  s3Key, 
  alt, 
  className = '',
  width,
  height
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the key is a base64 string (for backward compatibility)
  const isBase64 = s3Key?.startsWith('data:image/');

  useEffect(() => {
    async function fetchImageUrl() {
      try {
        // If it's already a base64 string, use it directly
        if (isBase64) {
          setImageUrl(s3Key);
          setLoading(false);
          return;
        }
        
        setLoading(true);
        const url = await getS3Url(s3Key);
        setImageUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error fetching image URL:', err);
        setError('Failed to load image');
      } finally {
        setLoading(false);
      }
    }

    if (s3Key) {
      fetchImageUrl();
    } else {
      setError('No image key provided');
      setLoading(false);
    }
  }, [s3Key, isBase64]);

  if (loading) {
    return <div className="flex justify-center items-center bg-gray-100 rounded">
      <LoadingState message="Loading image..." />
    </div>;
  }

  if (error || !imageUrl) {
    return <div className="flex justify-center items-center bg-gray-100 rounded p-4 text-sm text-red-500">
      {error || 'Failed to load image'}
    </div>;
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={className}
      width={width}
      height={height}
    />
  );
};

export default S3Image;
