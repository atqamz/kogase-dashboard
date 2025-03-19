// Base types
export interface BaseDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User Type and Status Enums
export enum UserType {
  Admin = 0,
  Developer = 1,
  Player = 2
}

export enum UserStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2
}

// IAM Types
export interface ProjectDto extends BaseDto {
  name: string;
  description: string;
  apiKey: string;
  isActive: boolean;
  ownerId: string;
}

export interface UserDto extends BaseDto {
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  isActive: boolean;
  lastLoginAt?: string;
  avatarUrl?: string;
  type: UserType;
  status: UserStatus;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  type: UserType;
}

export interface RoleDto extends BaseDto {
  name: string;
  description: string;
  permissions: string[];
}

export interface UserRoleDto extends BaseDto {
  userId: string;
  roleId: string;
  projectId: string;
}

// Auth Types
export interface DeviceDto extends BaseDto {
  deviceId: string;
  deviceType: string;
  deviceName: string;
  os: string;
  osVersion: string;
  appVersion: string;
  lastSeen: string;
  isActive: boolean;
  userId?: string;
  projectId: string;
}

export interface SessionDto extends BaseDto {
  deviceId: string;
  userId?: string;
  startedAt: string;
  endedAt?: string;
  ipAddress: string;
  location?: string;
  isActive: boolean;
  projectId: string;
}

export interface AuthDto {
  token: string;
  refreshToken: string;
  expiresAt: string;
  userId?: string;
  deviceId: string;
}

// Telemetry Types
export interface EventDefinitionDto extends BaseDto {
  name: string;
  description: string;
  category: string;
  projectId: string;
  parameters: string[];
  isActive: boolean;
}

export interface TelemetryEventDto extends BaseDto {
  eventDefinitionId: string;
  playSessionId: string;
  projectId: string;
  deviceId: string;
  userId?: string;
  timestamp: string;
  parameters: Record<string, any>;
}

export interface PlaySessionDto extends BaseDto {
  deviceId: string;
  userId?: string;
  projectId: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  sessionNumber: number;
  platform: string;
  appVersion: string;
  isActive: boolean;
}

export interface MetricAggregateDto extends BaseDto {
  projectId: string;
  metricName: string;
  dimension?: string;
  dimensionValue?: string;
  period: string;
  startDate: string;
  endDate: string;
  count: number;
  sum?: number;
  min?: number;
  max?: number;
  avg?: number;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  ownerId: string;
}

export interface CreateEventDefinitionRequest {
  name: string;
  description: string;
  category: string;
  parameters: string[];
}

export interface TrackEventRequest {
  eventDefinitionId: string;
  parameters: Record<string, any>;
}

// For frontend simplification
export type User = UserDto;
export type Project = ProjectDto;
export type Role = RoleDto;
export type UserRole = UserRoleDto;
export type Device = DeviceDto;
export type Session = SessionDto;
export type EventDefinition = EventDefinitionDto;
export type TelemetryEvent = TelemetryEventDto;
export type PlaySession = PlaySessionDto;
export type MetricAggregate = MetricAggregateDto;