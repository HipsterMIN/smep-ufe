import { apiBaseUrl } from './apiClient.js';
import { useAuthStore } from '../store/useAuthStore';

/**
 * 사용자 행동 이벤트 트래커.
 *
 * 서버(POST /api/v1/analytics/events)는 이벤트를 JSONL WAL 에 append 만 하므로 DB 부하가 없다.
 * 여기서는 이벤트를 메모리 큐에 모아 배치로 보내고, 화면 이탈(hidden/pagehide) 시 반드시 flush 한다.
 *
 * - 전송: fetch(keepalive:true) — sendBeacon 은 Authorization 헤더를 실을 수 없어 쓰지 않는다.
 * - 회원 식별: member_key 는 보내지 않는다. 서버가 Authorization JWT 에서 파생한다(위조 방지).
 * - 중복: event_id 를 클라이언트가 부여해 재전송 시 소비 측에서 dedupe 한다.
 * - 실패: 수집은 best-effort. 어떤 예외도 화면 흐름을 막지 않는다.
 */

const EVENTS_ENDPOINT = `${apiBaseUrl}/api/v1/analytics/events`;

const ANON_ID_KEY = 'smep_anon_id';
const SESSION_ID_KEY = 'smep_session_id';

// keepalive 본문은 브라우저 상한(약 64KB)이 있어 배치를 작게 유지한다.
const MAX_BATCH = 20;
const FLUSH_INTERVAL_MS = 5000;
const MAX_QUEUE = 200;

const SCHEMA_VER = 1;

let queue = [];
let flushTimer = null;
let listenersBound = false;

const createId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const safeStorage = (storage) => {
  try {
    if (typeof window === 'undefined' || !window[storage]) return null;
    return window[storage];
  } catch {
    // Safari 프라이빗 모드 등에서 접근이 막힐 수 있다.
    return null;
  }
};

const readOrCreateId = (storageName, key) => {
  const storage = safeStorage(storageName);
  if (!storage) return createId(); // 저장 불가 환경: 매 로드마다 새 ID(수집은 계속)
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const created = createId();
    storage.setItem(key, created);
    return created;
  } catch {
    return createId();
  }
};

/** 브라우저 재방문에도 유지되는 익명 식별자(개인정보 아님). */
export const getAnonId = () => readOrCreateId('localStorage', ANON_ID_KEY);

/** 탭 세션 단위 식별자. */
export const getSessionId = () => readOrCreateId('sessionStorage', SESSION_ID_KEY);

const buildEvent = (eventType, payload = {}) => ({
  event_id: createId(),
  schema_ver: SCHEMA_VER,
  ts: new Date().toISOString(),
  anon_id: getAnonId(),
  session_id: getSessionId(),
  event_type: eventType,
  page_path: payload.pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : null),
  ref_type: payload.refType ?? null,
  ref_id: payload.refId != null ? String(payload.refId) : null,
  dwell_ms: payload.dwellMs ?? null,
  attrs: payload.attrs ?? null,
});

const send = (events) => {
  if (!events.length) return;
  try {
    const token = useAuthStore.getState()?.token;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    void fetch(EVENTS_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ events }),
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => undefined);
  } catch {
    // 수집 실패는 무시한다.
  }
};

const clearTimer = () => {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
};

const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_INTERVAL_MS);
};

/** 큐에 쌓인 이벤트를 즉시 전송한다(배치 상한 단위로 쪼개서). */
export const flush = () => {
  clearTimer();
  if (!queue.length) return;
  const pending = queue;
  queue = [];
  for (let i = 0; i < pending.length; i += MAX_BATCH) {
    send(pending.slice(i, i + MAX_BATCH));
  }
};

const bindUnloadListeners = () => {
  if (listenersBound || typeof document === 'undefined') return;
  listenersBound = true;
  // pagehide + visibilitychange(hidden) 조합이 모바일 사파리 포함 가장 신뢰도가 높다.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
};

/**
 * 이벤트를 큐에 넣는다. 배치가 차면 즉시, 아니면 일정 시간 뒤 전송한다.
 *
 * @param {string} eventType page_view | page_dwell | search | search_result_click | click ...
 * @param {object} payload { pagePath, refType, refId, dwellMs, attrs }
 */
export const track = (eventType, payload = {}) => {
  if (!eventType || typeof window === 'undefined') return;
  try {
    bindUnloadListeners();
    if (queue.length >= MAX_QUEUE) {
      queue.shift(); // 폭주 시 가장 오래된 것부터 버린다(화면 성능 보호)
    }
    queue.push(buildEvent(eventType, payload));
    if (queue.length >= MAX_BATCH) {
      flush();
    } else {
      scheduleFlush();
    }
  } catch {
    // 수집 실패는 무시한다.
  }
};

// ── 자주 쓰는 헬퍼 ────────────────────────────────────────────────

/** 페이지 진입. */
export const trackPageView = (pagePath, attrs) => track('page_view', { pagePath, attrs });

/** 페이지 체류시간(ms). 라우트 이탈/언로드 시점에 호출. */
export const trackPageDwell = (pagePath, dwellMs, attrs) =>
  track('page_dwell', { pagePath, dwellMs, attrs });

/** 검색어 입력. */
export const trackSearch = (keyword, resultCount, attrs) =>
  track('search', { attrs: { keyword, result_count: resultCount ?? null, ...(attrs || {}) } });

/** 검색결과 클릭(어떤 공고를 몇 번째에서 눌렀는지). */
export const trackSearchResultClick = ({ keyword, refType = 'notice', refId, rank, attrs }) =>
  track('search_result_click', {
    refType,
    refId,
    attrs: { keyword, rank: rank ?? null, ...(attrs || {}) },
  });

/** 일반 클릭(공고 상세 진입 등). */
export const trackClick = ({ refType, refId, attrs }) => track('click', { refType, refId, attrs });

/** 스크랩(관심) 등록/해제. added=true 면 scrap_add, false 면 scrap_remove. */
export const trackScrap = ({ refType, refId, added, attrs }) =>
  track(added ? 'scrap_add' : 'scrap_remove', { refType, refId, attrs });

/** 신청 시작(신청하기 진입/외부 신청 페이지 이동). */
export const trackApplyStart = ({ refType, refId, attrs }) =>
  track('apply_start', { refType, refId, attrs });

/** 신청 제출 완료. 신청 폼 제출 성공 시점에 호출. */
export const trackApplySubmit = ({ refType, refId, attrs }) =>
  track('apply_submit', { refType, refId, attrs });

/** 첨부파일 다운로드(공고문·양식 등). */
export const trackFileDownload = ({ refType, refId, fileName, attrs }) =>
  track('file_download', {
    refType,
    refId,
    attrs: { file_name: fileName ?? null, ...(attrs || {}) },
  });

/** 목록 필터/정렬 적용(사용자가 스스로 밝힌 조건 관심사). */
export const trackFilterApply = ({ refType, refId, attrs }) =>
  track('filter_apply', { refType, refId, attrs });

/** AI 검색/챗봇 질의. 자연어 질의는 검색어보다 풍부한 의도 신호다. */
export const trackAiChatQuery = (query, attrs) =>
  track('ai_chat_query', { attrs: { query, ...(attrs || {}) } });

/** 추천 결과 클릭(맞춤 서빙 피드백 루프용 — 서빙 도입 시 사용). */
export const trackRecommendationClick = ({ refType, refId, rank, attrs }) =>
  track('recommendation_click', { refType, refId, attrs: { rank: rank ?? null, ...(attrs || {}) } });
