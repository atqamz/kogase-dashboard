import apiClient, { ApiError } from './api-client';
import { AuthDto, User, Device, LoginRequest, RegisterUserRequest } from './types';

const AUTH_TOKEN_KEY = 'kogase_token';
const REFRESH_TOKEN_KEY = 'kogase_refresh_token';
const USER_DATA_KEY = 'kogase_user';
const DEVICE_ID_KEY = 'kogase_device_id';

/**
 * Debug logging function that only logs in development
 */
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV !== 'production') {
    if (data) {
      console.log(`[Auth] ${message}`, data);
    } else {
      console.log(`[Auth] ${message}`);
    }
  }
};

/**
 * Service for authentication and user management
 * Matches with AuthController, DevicesController, and SessionsController
 */
const authService = {
  /**
   * Generate a device ID if not already stored
   */
  getOrCreateDeviceId(): string {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem(DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Generate a UUID for the device
        deviceId = crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    }
    return '';
  },

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Get the current user data
   */
  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_DATA_KEY);
      if (userData) {
        try {
          return JSON.parse(userData) as User;
        } catch (error) {
          debugLog('Error parsing user data from localStorage', error);
          return null;
        }
      }
    }
    return null;
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Save authentication data
   */
  saveAuthData(authResponse: AuthDto, userData: User): void {
    if (typeof window !== 'undefined') {
      debugLog('Saving auth data', { userId: userData.id, expires: authResponse.expiresAt });
      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  },

  /**
   * Clear authentication data
   */
  clearAuthData(): void {
    if (typeof window !== 'undefined') {
      debugLog('Clearing auth data');
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      // We don't clear device ID as it should persist between sessions
    }
  },

  /**
   * Verify token is valid - Matching AuthController verify endpoint
   */
  async verifyToken(): Promise<boolean> {
    try {
      debugLog('Verifying token validity');
      // Call the verify endpoint
      await apiClient.getReq<{ isValid: boolean }>('auth/verify', {
        skipRefresh: true // Skip token refresh to avoid infinite loop
      });
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        debugLog('Token verification failed: Unauthorized');
        // Token is invalid
        return false;
      }
      // Other errors - assume token is valid to prevent unnecessary logouts
      debugLog('Token verification error (assuming valid)', error);
      return true;
    }
  },

  /**
   * Register device with backend - Matching DevicesController
   */
  async registerDevice(projectId: string): Promise<Device> {
    // Get device information
    const deviceInfo = {
      deviceId: this.getOrCreateDeviceId(),
      deviceType: 'web',
      deviceName: navigator.userAgent,
      os: navigator.platform || 'unknown',
      osVersion: 'unknown',
      appVersion: '1.0.0', // Frontend version
      projectId
    };
    
    try {
      debugLog('Registering device', deviceInfo);
      // Register device with backend
      return await apiClient.postReq<Device>('auth/devices', deviceInfo, {
        requiresAuth: false,
      });
    } catch (error) {
      debugLog('Error registering device', error);
      // Return basic device info even if backend registration fails
      return {
        id: deviceInfo.deviceId,
        ...deviceInfo,
        lastSeen: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  /**
   * Login with email and password - Matching AuthController login endpoint
   */
  async login(credentials: LoginRequest): Promise<User> {
    try {
      // Strip deviceId from the credentials if it's provided
      // Let the backend handle deviceId to avoid foreign key constraint issues
      const { email, password } = credentials;
      const loginCredentials = { email, password };
      
      debugLog('Attempting login without deviceId', { email });
      
      try {
        // First try login without device ID
        const authResponse = await apiClient.postReq<AuthDto>('auth/login', loginCredentials, {
          requiresAuth: false,
        });
        
        debugLog('Login successful, received token', { userId: authResponse.userId });
        
        // Get user data from the auth response
        if (!authResponse.userId) {
          throw new Error('User ID missing from auth response');
        }
        
        // Get detailed user data
        const userData = await apiClient.getReq<User>(`iam/users/${authResponse.userId}`, {
          headers: { 'Authorization': `Bearer ${authResponse.token}` },
        });
        
        debugLog('User data retrieved', { userId: userData.id, name: `${userData.firstName} ${userData.lastName}` });
        
        // Save auth data
        this.saveAuthData(authResponse, userData);
        
        return userData;
      } catch (error) {
        debugLog('Login failed', error);
        throw error;
      }
    } catch (error) {
      debugLog('Login failed completely', error);
      // Convert error to be more readable
      if (error instanceof ApiError) {
        throw error;
      } else if (error instanceof Error) {
        throw new ApiError(500, error.message, error);
      } else {
        throw new ApiError(500, 'Unknown login error', error);
      }
    }
  },

  /**
   * Register a new user - Matching UsersController in IAM
   */
  async register(userData: RegisterUserRequest): Promise<User> {
    try {
      debugLog('Registering new user', { email: userData.email });
      
      // Register user
      const user = await apiClient.postReq<User>('iam/users', userData, {
        requiresAuth: false,
      });
      
      debugLog('User registered successfully, logging in');
      
      // After registration, login the user
      return this.login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      debugLog('Registration failed', error);
      throw error;
    }
  },

  /**
   * Get user data by ID - Matching UsersController in IAM
   */
  async getUserData(userId: string): Promise<User> {
    try {
      debugLog('Fetching user data', { userId });
      const userData = await apiClient.getReq<User>(`iam/users/${userId}`);
      debugLog('User data retrieved successfully');
      return userData;
    } catch (error) {
      debugLog('Error fetching user data', error);
      throw error;
    }
  },

  /**
   * Refresh authentication token - Matching AuthController refresh endpoint
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      debugLog('No refresh token available for refresh');
      return null;
    }
    
    try {
      debugLog('Attempting to refresh token');
      const authResponse = await apiClient.postReq<AuthDto>('auth/refresh-token', 
        { refreshToken }, 
        { requiresAuth: false }
      );
      
      debugLog('Token refreshed successfully', { expiresAt: authResponse.expiresAt });
      
      // Update tokens
      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
      
      return authResponse.token;
    } catch (error) {
      debugLog('Error refreshing token', error);
      this.clearAuthData();
      return null;
    }
  },

  /**
   * Logout the current user - Matching AuthController logout endpoint
   */
  async logout(): Promise<void> {
    try {
      debugLog('Logging out user');
      // Call the logout endpoint
      if (this.isAuthenticated()) {
        const deviceId = this.getOrCreateDeviceId();
        await apiClient.postReq('auth/logout', { deviceId });
        debugLog('Logout API call successful');
      }
    } catch (error) {
      debugLog('Error during logout API call', error);
      // Continue with clearing auth data even if API call fails
    } finally {
      // Clear auth data regardless of API call success
      this.clearAuthData();
    }
  },
  
  /**
   * Create a new session - Matching SessionsController
   */
  async createSession(projectId: string): Promise<any> {
    try {
      const deviceId = this.getOrCreateDeviceId();
      debugLog('Creating new session', { projectId, deviceId });
      
      const session = await apiClient.postReq<any>('auth/sessions', {
        projectId,
        deviceId
      });
      
      debugLog('Session created successfully', { sessionId: session.id });
      return session;
    } catch (error) {
      debugLog('Error creating session', error);
      throw error;
    }
  },
  
  /**
   * End a session - Matching SessionsController
   */
  async endSession(sessionId: string): Promise<any> {
    try {
      debugLog('Ending session', { sessionId });
      const result = await apiClient.putReq(`auth/sessions/${sessionId}/end`, {});
      debugLog('Session ended successfully');
      return result;
    } catch (error) {
      debugLog('Error ending session', error);
      throw error;
    }
  },
  
  /**
   * Get user sessions - Matching SessionsController
   */
  async getUserSessions(): Promise<any[]> {
    try {
      debugLog('Fetching user sessions');
      const sessions = await apiClient.getReq<any[]>('auth/sessions/user');
      debugLog('User sessions retrieved', { count: sessions.length });
      return sessions;
    } catch (error) {
      debugLog('Error fetching user sessions', error);
      return [];
    }
  },
  
  /**
   * Get user devices - Matching DevicesController
   */
  async getUserDevices(): Promise<Device[]> {
    try {
      debugLog('Fetching user devices');
      const devices = await apiClient.getReq<Device[]>('auth/devices/user');
      debugLog('User devices retrieved', { count: devices.length });
      return devices;
    } catch (error) {
      debugLog('Error fetching user devices', error);
      return [];
    }
  }
};

export default authService;