import { ReactNode } from "react";
import React from "react";

// Common props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Form event types
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;
export type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>;
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type TextareaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "user";
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

// Analytics types
export interface AnalyticsData {
  labels: string[];
  values: number[];
  period?: string;
}
