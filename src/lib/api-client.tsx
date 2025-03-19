/**
 * Enhanced API client for Kogase Engine backend integration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Types for API requests
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
  skipRefresh?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Store for in-progress refresh operations
let refreshPromise: Promise<string | null> | null = null;

/**
 * Debug logging function that only logs in development
 */
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV !== 'production') {
    if (data) {
      console.log(`[API] ${message}`, data);
    } else {
      console.log(`[API] ${message}`);
    }
  }
};

/**
 * Handles API requests with authentication and error handling
 */
const apiClient = {
  /**
   * Makes a request to the API
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = true,
      skipRefresh = false,
    } = options;

    // Build request URL
    const url = `${API_BASE_URL}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;

    // Setup headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if required and available
    if (requiresAuth) {
      const token = localStorage.getItem('kogase_token');
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      } else {
        debugLog('No auth token available for authenticated request');
      }
    }

    // Create request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
    };

    // Add body if not GET request
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      // Make the request
      debugLog(`Request: ${method} ${url}`, body ? { body } : undefined);
      const response = await fetch(url, requestOptions);
      
      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => ({}));
      } else {
        data = await response.text().catch(() => '');
      }

      debugLog(`Response: ${response.status}`, data);

      // Handle 401 Unauthorized by refreshing the token (if not already refreshing)
      if (response.status === 401 && requiresAuth && !skipRefresh) {
        debugLog('Token expired, attempting to refresh...');
        
        // Only try to refresh if we're not already doing so
        if (!refreshPromise) {
          refreshPromise = this.refreshToken();
        }
        
        // Wait for the refresh to complete
        const newToken = await refreshPromise;
        refreshPromise = null;
        
        // If refresh succeeded, retry the original request
        if (newToken) {
          debugLog('Token refreshed, retrying original request');
          // Update Authorization header with new token
          requestHeaders['Authorization'] = `Bearer ${newToken}`;
          requestOptions.headers = requestHeaders;
          
          // Retry the request with the new token
          const retryResponse = await fetch(url, requestOptions);
          
          // Parse retry response
          let retryData;
          const retryContentType = retryResponse.headers.get('content-type');
          if (retryContentType && retryContentType.includes('application/json')) {
            retryData = await retryResponse.json().catch(() => ({}));
          } else {
            retryData = await retryResponse.text().catch(() => '');
          }
          
          debugLog(`Retry response: ${retryResponse.status}`, retryData);
          
          if (!retryResponse.ok) {
            throw new ApiError(
              retryResponse.status,
              typeof retryData === 'object' ? retryData.message || 'Request failed after token refresh' : 'Request failed after token refresh',
              retryData
            );
          }
          
          return retryData as T;
        }
        
        // If refresh token failed, throw an auth error
        const authError = new ApiError(
          401,
          'Authentication failed. Please log in again.',
          { requiresLogin: true }
        );
        
        // Dispatch a custom event for the auth context to handle
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-error', { 
            detail: { error: authError } 
          }));
        }
        
        throw authError;
      }
      
      // For non-auth errors, just throw the regular error
      if (!response.ok) {
        throw new ApiError(
          response.status,
          typeof data === 'object' ? data.message || `Error ${response.status}` : `Error ${response.status}`,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        // If it's already an ApiError, rethrow it
        throw error;
      }
      
      // For fetch errors (network issues, etc.)
      debugLog('Network or fetch error:', error);
      throw new ApiError(500, 'Network error or server unavailable', error);
    }
  },

  /**
   * Refresh the token using AuthController's refresh endpoint
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('kogase_refresh_token');
    if (!refreshToken) {
      debugLog('No refresh token available');
      return null;
    }

    try {
      debugLog('Attempting to refresh token');
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        debugLog(`Refresh token failed: ${response.status}`);
        // If refresh fails, clear tokens
        localStorage.removeItem('kogase_token');
        localStorage.removeItem('kogase_refresh_token');
        return null;
      }

      const data = await response.json();
      debugLog('Token refreshed successfully');
      
      // Store the new tokens
      localStorage.setItem('kogase_token', data.token);
      localStorage.setItem('kogase_refresh_token', data.refreshToken);
      
      return data.token;
    } catch (error) {
      debugLog('Error refreshing token:', error);
      localStorage.removeItem('kogase_token');
      localStorage.removeItem('kogase_refresh_token');
      return null;
    }
  },

  /**
   * GET request wrapper
   */
  getReq<T>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * POST request wrapper
   */
  postReq<T>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  },

  /**
   * PUT request wrapper
   */
  putReq<T>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  },

  /**
   * DELETE request wrapper
   */
  deleteReq<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiClient;