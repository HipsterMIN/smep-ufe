import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useMatches } from 'react-router-dom';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { postPageView } from '@lib/analyticsClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';

let lastSentPageViewKey = null;

const EXCLUDED_PATHS = new Set([
  '/sso',
  '/sso-logout',
  '/service/intg-search-route-test',
]);

const createEventId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0;
    const value = char === 'x' ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
};

const trimToNull = (value) => {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizePathname = (pathname) => {
  if (!pathname || pathname === '') return '/';
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
};

const isExcludedPath = (pathname) => {
  const normalized = normalizePathname(pathname);
  return (
    EXCLUDED_PATHS.has(normalized) ||
    normalized === '/publishing' ||
    normalized.startsWith('/publishing/')
  );
};

const normalizeRoute = (pathname, params = {}) => {
  const paramEntries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => [key, String(value)]);

  if (paramEntries.length === 0) {
    return normalizePathname(pathname);
  }

  const segments = normalizePathname(pathname).split('/').map((segment) => {
    const decodedSegment = decodeURIComponent(segment);
    const found = paramEntries.find(([, value]) => value === decodedSegment);
    return found ? `:${found[0]}` : segment;
  });
  return segments.join('/') || '/';
};

const inferPageKindCd = (pathname, pageRoute, params = {}) => {
  const path = normalizePathname(pathname).toLowerCase();
  const route = normalizePathname(pageRoute).toLowerCase();
  if (path === '/') return 'MAIN';
  if (path === '/service/login' || path === '/service/loginbef' || path === '/service/sso-login') {
    return 'LOGIN';
  }
  if (path.startsWith('/service/find-id')) return 'FIND_ID';
  if (path.startsWith('/service/find-password')) return 'FIND_PASSWORD';
  if (route.endsWith('/edit')) return 'EDIT';
  if (route.endsWith('/create') || route.endsWith('/save')) return 'CREATE';
  if (route.includes('/:') || Object.keys(params).length > 0) return 'DETAIL';
  return 'LIST';
};

const detectDeviceTypeCd = () => {
  const userAgent = navigator.userAgent || '';
  const hasTouch = navigator.maxTouchPoints > 1;
  if (/ipad|tablet/i.test(userAgent) || (hasTouch && /macintosh/i.test(userAgent))) {
    return 'TABLET';
  }
  if (/mobi|android|iphone|ipod/i.test(userAgent)) {
    return 'MOBILE';
  }
  return 'PC';
};

const findNearestMenuHandle = (matches) => {
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const handle = matches[i]?.handle;
    if (handle?.menuId) {
      return handle;
    }
  }
  return null;
};

const buildPayload = ({ eventId, location, matches, menuContext }) => {
  const params = matches[matches.length - 1]?.params || {};
  const pagePath = normalizePathname(location.pathname);
  const pageRoute = normalizeRoute(pagePath, params);
  const menuHandle = findNearestMenuHandle(matches);
  const breadcrumbItems = Array.isArray(menuContext.breadcrumbItems)
    ? menuContext.breadcrumbItems
    : [];
  const depth1 = breadcrumbItems[0] || null;
  const depth2 = breadcrumbItems[1] || null;
  const depth3 = breadcrumbItems[2] || null;
  const menuId = menuHandle?.menuId || menuContext.currentMenu?.menuId || null;
  const menuNm = menuContext.currentMenu?.menuNm || menuHandle?.menuNm || null;

  return {
    eventId,
    pagePath,
    pageRoute,
    pageKindCd: inferPageKindCd(pagePath, pageRoute, params),
    menuId: trimToNull(menuId),
    menuNm: trimToNull(menuNm),
    menuPathNm: trimToNull(breadcrumbItems.map((item) => item.label).filter(Boolean).join(' > ')),
    depth1MenuId: trimToNull(depth1?.menuId),
    depth1MenuNm: trimToNull(depth1?.label),
    depth2MenuId: trimToNull(depth2?.menuId),
    depth2MenuNm: trimToNull(depth2?.label),
    depth3MenuId: trimToNull(depth3?.menuId),
    depth3MenuNm: trimToNull(depth3?.label),
    bbsNo: trimToNull(menuHandle?.bbsNo),
    deviceTypeCd: detectDeviceTypeCd(),
  };
};

const PageViewTracker = () => {
  const location = useLocation();
  const matches = useMatches();
  const menuContext = useUserMenu();
  const token = useAuthStore((state) => state.token);
  const isLogin = useAuthStore((state) => state.isLogin);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const pageViewKey = normalizePathname(location.pathname);
  const eventIdRef = useRef({ pageViewKey: null, eventId: null });
  if (eventIdRef.current.pageViewKey !== pageViewKey) {
    eventIdRef.current = { pageViewKey, eventId: createEventId() };
  }
  const eventId = eventIdRef.current.eventId;
  const payload = useMemo(
    () => buildPayload({ eventId, location, matches, menuContext }),
    [eventId, location, matches, menuContext],
  );

  useEffect(() => {
    if (isExcludedPath(location.pathname)) {
      return;
    }
    if (isLogin && refreshToken && !token) {
      return;
    }
    if (!payload.pagePath || lastSentPageViewKey === pageViewKey) {
      return;
    }

    // access token 복구가 끝난 뒤 같은 route-view를 한 번만 전송해야 SSO/menu router 재생성에서 중복 PV가 생기지 않는다.
    lastSentPageViewKey = pageViewKey;
    void postPageView(payload, { token });
  }, [isLogin, location.pathname, pageViewKey, payload, refreshToken, token]);

  return null;
};

export default PageViewTracker;
