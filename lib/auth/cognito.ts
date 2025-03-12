import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react";

// Helper function to get the current authenticated user
export const getAuthenticatedUser = async () => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
};

// Helper function to sign out the current user
export const signOutUser = async () => {
  try {
    await signOut();
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};

// Custom hook to get user authentication state and methods
export const useAuth = () => {
  const auth = useAuthenticator();
  
  return {
    isAuthenticated: auth.authStatus === "authenticated",
    currentUser: auth.user,
    handleSignOut: auth.signOut,
    // Return the auth object without spreading to avoid property conflicts
    auth
  };
};
