import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default User Object for safe fallback
  const getDefaultUser = (email: string = 'user@example.com'): User => ({
    id: '1',
    email,
    name: email.split('@')[0],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
  });

  // Safe JSON parser
  const safeParseUser = (str: string | null): User | null => {
    if (!str) return null;
    try {
      const parsed = JSON.parse(str);
      // Validate required fields
      if (parsed && typeof parsed === 'object' && parsed.id && parsed.email && parsed.name) {
        return parsed as User;
      }
      return getDefaultUser(parsed?.email || 'user@example.com');
    } catch (e) {
      console.error('Failed to parse user from storage:', e);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('ridecast_user');
      const sessionUser = sessionStorage.getItem('ridecast_user');
      
      const userFromStorage = safeParseUser(storedUser) || safeParseUser(sessionUser);
      if (userFromStorage) {
        setUser(userFromStorage);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email
      };
      
      setUser(mockUser);
      
      if (rememberMe) {
        localStorage.setItem('ridecast_user', JSON.stringify(mockUser));
      } else {
        sessionStorage.setItem('ridecast_user', JSON.stringify(mockUser));
      }
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email,
        name,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email
      };
      
      setUser(mockUser);
      localStorage.setItem('ridecast_user', JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ridecast_user');
    sessionStorage.removeItem('ridecast_user');
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password reset email sent to:', email);
      return true;
    } catch (error) {
      console.error('Forgot password failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        forgotPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
