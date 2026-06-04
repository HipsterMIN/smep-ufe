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

const formatEventPeriodDate = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  const ymd = raw.match(/^(\d{4})[-./]?(\d{2})[-./]?(\d{2})$/);
  if (ymd) return `${ymd[1]}.${ymd[2]}.${ymd[3]}`;

  const datePart = raw.slice(0, 10);
  const isoDate = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) return `${isoDate[1]}.${isoDate[2]}.${isoDate[3]}`;

  return raw;
};

/*
 * 의도: 메인 화면 행사정보 탭은 백엔드 원문 기간을 그대로 보여주되, 숫자형 날짜만 사용자가 읽기 쉬운 점 구분 형식으로 통일한다.
 * 동작: 20260601, 2026-06-01, 2026.06.01, 2026/06/01 형태의 단일 날짜와 '~'로 연결된 기간을 yyyy.mm.dd 형식으로 변환한다.
 * 주의: '상시', '추후 공지' 같은 문구형 기간은 임의 해석하면 의미가 달라질 수 있으므로 원문을 유지한다.
 */
export const formatMainEventPeriod = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';

  const parts = text.split('~').map((part) => part.trim());
  if (parts.length === 2) {
    return `${formatEventPeriodDate(parts[0])} ~ ${formatEventPeriodDate(parts[1])}`;
  }

  return formatEventPeriodDate(text);
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

export const formatWeekPeriod = (startYmd, endYmd) => {
  const today = new Date();
  const start = parseYmd(startYmd) || new Date(today);
  if (!startYmd) {
    const day = today.getDay() || 7;
    start.setDate(today.getDate() - day + 1);
  }
  const end = parseYmd(endYmd) || new Date(start);
  if (!endYmd) {
    // 퍼블 기준 이번 주 공고 fallback 기간은 월~금 5영업일이다.
    end.setDate(start.getDate() + 4);
  }
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

// 메인 공고 영역은 퍼블 컨벤션에 맞춰 D-3부터 마감임박으로 표시한다.
const MAIN_PBANC_URGENT_DDAY_THRESHOLD = 3;

export const isUrgentDday = (dday) => {
  if (dday === 'D-Day') return true;
  const day = Number(String(dday || '').replace('D-', ''));
  return Number.isFinite(day) && day <= MAIN_PBANC_URGENT_DDAY_THRESHOLD;
};

// ─── 사업공고 ──────────────────────────────────────────────────────────────
export const getPbancStatusLabel = (item) => {
  const dday = getDdayLabel(item?.bizAplyDdlnYmd);
  if (dday === 'D-Day' || isUrgentDday(dday)) return '마감임박';
  if (item?.applyStatusText === '신청가능') return '접수중';
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
