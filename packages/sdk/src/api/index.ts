/**
 * API module - HTTP/SSE client
 *
 * This module contains the CubeIAxClient for communicating
 * with the Cube-I-AX API.
 */

export { CubeIAxClient, CubeIAxClient as default } from './client';

// API 기본값 상수 (사용자 설정 시 참조용)
export {
  DEFAULT_TOP_K,
  DEFAULT_RERANKER_TOP_K,
  DEFAULT_GROUP_BY_FIELD,
  MIN_TOKENS,
  MAX_TOKENS,
  DEFAULT_TOKENS,
} from './client';

// 에러 타입 (에러 분류용)
export {
  TimeoutError,
  AbortedError,
  ApiError,
  StreamParseError,
} from './client';
