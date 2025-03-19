'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import authService from './auth-service';
import { LoginRequest, RegisterUserRequest, User } from './types';
import { useToast } from '@/components/ui/use-toast';
import { ApiError } from './api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterUserRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Initialize - check if user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.getToken()) {
          try {
            // Verify the token is still valid
            const isValid = await authService.verifyToken();
            if (isValid) {
              setUser(currentUser);
            } else {
              // If token is invalid, clear auth data
              authService.clearAuthData();
              // Only show toast if not on auth pages
              if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
                toast({
                  title: 'Session expired',
                  description: 'Your session has expired. Please log in again.',
                  variant: 'destructive',
                });
              }
            }
          } catch (error) {
            console.error('Token verification failed:', error);
            // If token verification fails, clear auth data
            authService.clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [toast, pathname]);

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${loggedInUser.firstName}!`,
      });
      
      router.push('/dashboard/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login';
      
      if (error instanceof ApiError) {
        errorMessage = error.message || 'Invalid credentials';
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterUserRequest) => {
    try {
      setIsLoading(true);
      const newUser = await authService.register(userData);
      setUser(newUser);
      
      toast({
        title: "Registration successful",
        description: `Welcome to Kogase, ${newUser.firstName}!`,
      });
      
      router.push('/dashboard/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'An error occurred during registration';
      
      if (error instanceof ApiError) {
        errorMessage = error.message || 'Registration failed';
        
        // Handle validation errors
        if (error.status === 400 && error.data?.errors) {
          const errors = error.data.errors;
          errorMessage = Object.values(errors).flat().join('. ');
        }
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Always clear local auth data even if API call fails
      authService.clearAuthData();
      setUser(null);
      
      toast({
        title: "Logout",
        description: "You have been logged out.",
      });
      
      router.push('/login');
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    try {
      if (!user?.id) return;
      
      const updatedUser = await authService.getUserData(user.id);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      
      // If unauthorized, log out
      if (error instanceof ApiError && error.status === 401) {
        logout();
      }
    }
  };

  // Listen for auth-related errors
  useEffect(() => {
    const handleAuthError = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.error?.requiresLogin) {
        toast({
          title: "Authentication required",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        
        logout();
      }
    };

    // Add event listener
    window.addEventListener('auth-error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [toast]);

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}