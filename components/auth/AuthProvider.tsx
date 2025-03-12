import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

// Define the AuthContext type
interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  signOut: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the application and provides authentication context
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { authStatus, user, signOut } = useAuthenticator();
  
  // Check if the user is authenticated
  const isAuthenticated = authStatus === 'authenticated';
  
  // Create the auth context value
  const value = {
    isAuthenticated,
    user,
    signOut,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
