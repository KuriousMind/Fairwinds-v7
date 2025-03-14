import { uploadData, getUrl, remove } from 'aws-amplify/storage';

/**
 * Uploads a file to S3 and returns the key
 * 
 * @param file - The file or blob to upload
 * @param path - The path prefix for the file in S3
 * @returns The S3 key of the uploaded file
 */
export const uploadToS3 = async (file: File | Blob, path: string): Promise<string> => {
  try {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const key = `${path}/${filename}`;
    
    await uploadData({
      key,
      data: file,
      options: {
        contentType: file instanceof File ? file.type : 'image/jpeg',
      }
    });
    
    return key;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Gets a signed URL for an S3 object
 * 
 * @param key - The S3 key of the object
 * @returns A signed URL for the S3 object
 */
export const getS3Url = async (key: string): Promise<string> => {
  try {
    const result = await getUrl({
      key,
      options: {
        expiresIn: 3600 // URL expires in 1 hour
      }
    });
    return result.url.toString();
  } catch (error) {
    console.error('Error getting S3 URL:', error);
    throw error;
  }
};

/**
 * Deletes an object from S3
 * 
 * @param key - The S3 key of the object to delete
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    await remove({ key });
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};
