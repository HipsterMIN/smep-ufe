/**
 * Core module - Types and utilities
 *
 * This module contains shared types and utility functions
 * used across api, react, and data modules.
 */

// Utility functions
export { getSourceField } from './types';

// Types
export type {
  CubeIAxConfig,
  UserProfile,
  ChatRequest,
  ChatResponse,
  SearchRequest,
  SearchResponse,
  SearchResult,
  Source,
  StreamEvent,
  StreamEventType,
  StreamCallbacks,
  SearchStreamCallbacks,
} from './types';
