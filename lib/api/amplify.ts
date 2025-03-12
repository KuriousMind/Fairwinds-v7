import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

// Create a client for interacting with the Amplify API
export const client = generateClient<Schema>();

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  console.error("API Error:", error);
  
  if (error.message) {
    return error.message;
  }
  
  return "An unexpected error occurred. Please try again.";
};
