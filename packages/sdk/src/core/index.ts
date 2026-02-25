/**
 * Core module - Types and utilities
 *
 * This module contains shared types and utility functions
 * used across api, react, and data modules.
 */

// Utility functions
export { getSourceField } from './types';

// Constants
export { Domain } from './types';

// Types
export type { DomainType } from './types';
export type {
  CubeIAxConfig,
  UserProfile,
  ChatRequest,
  ChatResponse,
  Message,
  SearchRequest,
  SearchResponse,
  SearchResult,
  Source,
  StreamEvent,
  StreamEventType,
  StreamCallbacks,
  SearchStreamCallbacks,
  QueryAnalysis,
  ItemDetail,
  GetDocumentRequest,
  DocumentSection,
  DocumentResponse,
} from './types';
