/**
 * MainPage 전용 순수 유틸리티 함수 모음
 * 컴포넌트 상태·훅에 의존하지 않는 순수 함수만 포함
 */

const APP_BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

// ─── API 응답 정규화 ────────────────────────────────────────────────────────
export const normalizeResponse = (response) => {
  if (!response) return {};
  if (response.success !== undefined && response.data !== undefined) return response.data;
  if (response.data !== undefined) return response.data;
  return response;
};

export const resolveApiErrorMessage = (error, fallbackMessage) =>
  error?.data?.message || error?.message || fallbackMessage;

export const removeCssCharset = (cssText = '') =>
  String(cssText || '').replace(/@charset\s+["'][^"']+["'];\s*/g, '');

// ─── 날짜 ───────────────────────────────────────────────────────────────────
export const formatDate = (value, separator = '.') => {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^\d{8}$/.test(raw))
    return `${raw.slice(0, 4)}${separator}${raw.slice(4, 6)}${separator}${raw.slice(6, 8)}`;
  const datePart = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart))
    return datePart.replace(/-/g, separator);
  return raw;
};

export const formatLocalDateKey = (date = new Date(), separator = '-') =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join(separator);

export const getLocalYmd = (date = new Date()) => formatLocalDateKey(date, '');

export const parseYmd = (value) => {
  const raw = String(value || '').trim();
  if (!/^\d{8}$/.test(raw)) return null;
  const date = new Date(
    Number(raw.slice(0, 4)),
    Number(raw.slice(4, 6)) - 1,
    Number(raw.slice(6, 8)),
  );
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatCalendarDate = (value) => {
  const date = parseYmd(value);
  if (!date) return '';
  return `${date.getMonth() + 1}월 ${date.getDate()}일(${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`;
};

export const formatWeekItemDate = (value) => {
  const date = parseYmd(value);
  if (!date) return { date: '', day: '' };
  return {
    date: `${date.getMonth() + 1}.${date.getDate()}.`,
    day: `(${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`,
  };
};

export const formatWeekPeriod = () => {
  const today = new Date();
  const start = new Date(today);
  const day = today.getDay() || 7;
  start.setDate(today.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const toDot = (d) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${toDot(start)}.~${toDot(end)}`;
};

// ─── D-day ─────────────────────────────────────────────────────────────────
export const getDaysRemaining = (deadline) => {
  if (!deadline || !/^\d{8}$/.test(String(deadline))) return null;
  const raw = String(deadline);
  const target = new Date(
    Number(raw.slice(0, 4)),
    Number(raw.slice(4, 6)) - 1,
    Number(raw.slice(6, 8)),
  );
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - today.getTime()) / 86400000);
};

export const getDdayLabel = (deadline) => {
  const daysRemaining = getDaysRemaining(deadline);
  if (daysRemaining === null) return '상시';
  if (daysRemaining < 0) return '마감';
  if (daysRemaining === 0) return 'D-Day';
  return `D-${daysRemaining}`;
};

export const getDdayBadgeClass = (label) => {
  if (label === 'D-Day') return 'bg-point';
  if (!label?.startsWith('D-')) return 'bg-primary';
  const days = Number(label.replace('D-', ''));
  return Number.isFinite(days) && days <= 10 ? 'bg-point' : 'bg-primary';
};

export const isUrgentDday = (dday) => {
  if (dday === 'D-Day') return true;
  const day = Number(String(dday || '').replace('D-', ''));
  return Number.isFinite(day) && day <= 3;
};

// ─── 사업공고 ──────────────────────────────────────────────────────────────
export const getPbancStatusLabel = (item) => {
  const dday = getDdayLabel(item?.bizAplyDdlnYmd);
  if (dday === 'D-Day' || isUrgentDday(dday)) return '마감임박';
  return item?.applyStatusText || '접수중';
};

// ─── URL ───────────────────────────────────────────────────────────────────
export const buildMainImageUrl = (type, atchFileId, atchFileSn) => {
  if (!atchFileId || atchFileSn === null || atchFileSn === undefined) return null;
  return `${APP_BASE_URL}/api/v1/main/${type}/${atchFileId}/${atchFileSn}/image`.replace(
    /([^:]\/)\/+/g, '$1',
  );
};

export const buildBoardThumbnailUrl = (atchFileId, atchFileSn) => {
  if (!atchFileId || atchFileSn === null || atchFileSn === undefined) return null;
  return `${APP_BASE_URL}/api/v1/board/thumbnails/${atchFileId}/${atchFileSn}`.replace(
    /([^:]\/)\/+/g, '$1',
  );
};

export const isNewWindow = (value) => value === 'Y';

export const isAbsoluteHttpUrl = (value) => /^https?:\/\//i.test(String(value || '').trim());

export const appendQueryParam = (path, name, value) => {
  const rawPath = String(path || '#');
  if (rawPath === '#') return rawPath;
  const hashIndex = rawPath.indexOf('#');
  const pathWithoutHash = hashIndex >= 0 ? rawPath.slice(0, hashIndex) : rawPath;
  const hash = hashIndex >= 0 ? rawPath.slice(hashIndex) : '';
  const separator = pathWithoutHash.includes('?') ? '&' : '?';
  return `${pathWithoutHash}${separator}${encodeURIComponent(name)}=${encodeURIComponent(value)}${hash}`;
};

// ─── 게시판 ────────────────────────────────────────────────────────────────
export const resolveBoardTarget = (listPath, item, hasDetail = true) => {
  const fallbackTo =
    hasDetail && listPath && item?.pstNo ? `${listPath}/${item.pstNo}` : listPath || '#';
  if (!item) return { kind: 'internal', to: listPath || '#' };
  const rawUrl = String(item.pstUrlAddr ?? '').trim();
  if (isAbsoluteHttpUrl(rawUrl)) return { kind: 'external', href: rawUrl };
  return { kind: 'internal', to: fallbackTo };
};

export const stripHtmlTags = (value) => {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, '').trim();
};

// ─── 검색 ───────────────────────────────────────────────────────────────────
const parseSearchPayload = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') {
    try { return parseSearchPayload(JSON.parse(payload)); } catch { return null; }
  }
  if (payload?.data !== undefined && payload?.data !== null) {
    return parseSearchPayload(payload.data);
  }
  return payload;
};

export const extractPopularKeywords = (payload) => {
  const parsed = parseSearchPayload(payload);
  const items = Array.isArray(parsed?.result?.Item) ? parsed.result.Item : [];
  const seen = new Set();
  return items
    .map((item) => String(item?.Query || '').trim())
    .filter(Boolean)
    .filter((keyword) => { if (seen.has(keyword)) return false; seen.add(keyword); return true; });
};

export const extractAutoCompleteKeywords = (payload) => {
  const parsed = parseSearchPayload(payload);
  const groups = Array.isArray(parsed?.result) ? parsed.result : [];
  const items = groups.flatMap((group) =>
    Array.isArray(group?.items) ? group.items : [],
  );
  const seen = new Set();
  return items
    .map((item) => String(item?.keyword || '').trim())
    .filter(Boolean)
    .filter((keyword) => { if (seen.has(keyword)) return false; seen.add(keyword); return true; });
};
