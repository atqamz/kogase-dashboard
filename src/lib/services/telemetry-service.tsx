import apiClient from '../api-client';
import { 
  TelemetryEvent, 
  EventDefinition, 
  PlaySession, 
  MetricAggregate,
  CreateEventDefinitionRequest,
  TrackEventRequest
} from '../types';

/**
 * Service for telemetry operations
 * Matches with EventDefinitionsController, TelemetryEventsController,
 * PlaySessionsController, and MetricAggregatesController
 */
const telemetryService = {
  // Event Definitions - Matching EventDefinitionsController
  /**
   * Get all event definitions for a project
   */
  async getEventDefinitions(projectId: string): Promise<EventDefinition[]> {
    return apiClient.getReq<EventDefinition[]>(`telemetry/projects/${projectId}/event-definitions`);
  },
  
  /**
   * Get event definition by ID
   */
  async getEventDefinition(eventDefinitionId: string): Promise<EventDefinition> {
    return apiClient.getReq<EventDefinition>(`telemetry/event-definitions/${eventDefinitionId}`);
  },
  
  /**
   * Create a new event definition
   */
  async createEventDefinition(
    projectId: string, 
    eventDefinition: CreateEventDefinitionRequest
  ): Promise<EventDefinition> {
    return apiClient.postReq<EventDefinition>(
      `telemetry/projects/${projectId}/event-definitions`, 
      eventDefinition
    );
  },
  
  /**
   * Update an event definition
   */
  async updateEventDefinition(
    eventDefinitionId: string, 
    eventDefinition: Partial<EventDefinition>
  ): Promise<EventDefinition> {
    return apiClient.putReq<EventDefinition>(
      `telemetry/event-definitions/${eventDefinitionId}`, 
      eventDefinition
    );
  },
  
  /**
   * Delete an event definition
   */
  async deleteEventDefinition(eventDefinitionId: string): Promise<void> {
    await apiClient.deleteReq(`telemetry/event-definitions/${eventDefinitionId}`);
  },
  
  // Telemetry Events - Matching TelemetryEventsController
  /**
   * Track a telemetry event
   */
  async trackEvent(
    projectId: string, 
    playSessionId: string, 
    event: TrackEventRequest
  ): Promise<TelemetryEvent> {
    return apiClient.postReq<TelemetryEvent>(
      `telemetry/projects/${projectId}/sessions/${playSessionId}/events`, 
      event
    );
  },
  
  /**
   * Get telemetry events for a play session
   */
  async getSessionEvents(projectId: string, playSessionId: string): Promise<TelemetryEvent[]> {
    return apiClient.getReq<TelemetryEvent[]>(
      `telemetry/projects/${projectId}/sessions/${playSessionId}/events`
    );
  },
  
  /**
   * Get all events for a project
   */
  async getProjectEvents(projectId: string, filters?: any): Promise<TelemetryEvent[]> {
    let endpoint = `telemetry/projects/${projectId}/events`;
    
    // Add filters as query params if provided
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      
      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }
    
    return apiClient.getReq<TelemetryEvent[]>(endpoint);
  },
  
  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<TelemetryEvent> {
    return apiClient.getReq<TelemetryEvent>(`telemetry/events/${eventId}`);
  },
  
  // Play Sessions - Matching PlaySessionsController
  /**
   * Get play sessions for a project
   */
  async getPlaySessions(
    projectId: string, 
    filters?: any
  ): Promise<PlaySession[]> {
    let endpoint = `telemetry/projects/${projectId}/sessions`;
    
    // Add filters as query params if provided
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      
      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }
    
    return apiClient.getReq<PlaySession[]>(endpoint);
  },
  
  /**
   * Get play session by ID
   */
  async getPlaySession(sessionId: string): Promise<PlaySession> {
    return apiClient.getReq<PlaySession>(`telemetry/sessions/${sessionId}`);
  },
  
  /**
   * Start a new play session
   */
  async startPlaySession(
    projectId: string, 
    deviceId: string, 
    userId?: string
  ): Promise<PlaySession> {
    return apiClient.postReq<PlaySession>(`telemetry/projects/${projectId}/sessions`, {
      deviceId,
      userId,
      startedAt: new Date().toISOString(),
      platform: navigator.platform || 'web',
      appVersion: '1.0.0' // Frontend version
    });
  },
  
  /**
   * End a play session
   */
  async endPlaySession(sessionId: string): Promise<PlaySession> {
    return apiClient.putReq<PlaySession>(`telemetry/sessions/${sessionId}/end`, {
      endedAt: new Date().toISOString()
    });
  },
  
  /**
   * Get all play sessions across all projects
   */
  async getAllPlaySessions(filters?: any): Promise<PlaySession[]> {
    let endpoint = `telemetry/sessions`;
    
    // Add filters as query params if provided
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      
      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }
    
    return apiClient.getReq<PlaySession[]>(endpoint);
  },
  
  // Metrics - Matching MetricAggregatesController
  /**
   * Get metrics for a project
   */
  async getMetrics(
    projectId: string, 
    params: {
      metricName: string,
      period: string,
      startDate: string,
      endDate: string,
      dimension?: string,
      dimensionValue?: string
    }
  ): Promise<MetricAggregate[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    
    const endpoint = `telemetry/projects/${projectId}/metrics?${queryParams.toString()}`;
    
    return apiClient.getReq<MetricAggregate[]>(endpoint);
  },
  
  /**
   * Get available metrics for a project
   */
  async getAvailableMetrics(projectId: string): Promise<string[]> {
    return apiClient.getReq<string[]>(`telemetry/projects/${projectId}/metrics/available`);
  },
  
  /**
   * Get available dimensions for a metric
   */
  async getAvailableDimensions(projectId: string, metricName: string): Promise<string[]> {
    return apiClient.getReq<string[]>(`telemetry/projects/${projectId}/metrics/${metricName}/dimensions`);
  }
};

export default telemetryService;