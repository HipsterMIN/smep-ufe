import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { flush, track, trackPageDwell, trackPageView } from '@lib/behaviorTracker.js';

/**
 * 라우트 변화를 감지해 page_view 와 page_dwell(체류시간)을 수집한다.
 *
 * 기존 PageViewTracker(UV/PV 집계용, DB 저장)와는 별개 경로다. 이쪽은 JSONL WAL 로만 쌓이며
 * 체류시간·검색어 등 세밀한 행동 데이터를 AI 학습 소스로 모은다.
 *
 * 체류시간은 "직전 경로에 머문 시간"을 다음 경로 진입 시점(또는 화면 이탈 시점)에 기록한다.
 */

const EXCLUDED_PREFIXES = ['/sso', '/sso-logout', '/publishing'];

const normalizePathname = (pathname) => {
  if (!pathname) return '/';
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
};

const isExcluded = (pathname) => {
  const normalized = normalizePathname(pathname);
  return EXCLUDED_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
};

const BehaviorTracker = () => {
  const location = useLocation();
  const currentRef = useRef({ path: null, enteredAt: 0 });

  useEffect(() => {
    const path = normalizePathname(location.pathname);
    if (isExcluded(path)) {
      return undefined;
    }

    const previous = currentRef.current;
    // 직전 경로의 체류시간을 먼저 확정한 뒤 새 page_view 를 남긴다.
    if (previous.path && previous.path !== path && previous.enteredAt) {
      trackPageDwell(previous.path, Date.now() - previous.enteredAt);
    }

    currentRef.current = { path, enteredAt: Date.now() };
    trackPageView(path);

    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    // 전역 클릭 자동 수집: 링크/버튼류 클릭을 요소 메타데이터와 함께 기록한다.
    // 개별 화면 수정 없이 "모든 활동"을 커버하기 위한 캡처 단계 리스너다.
    // 텍스트는 60자로 잘라 과도한 본문/개인정보 유입을 줄인다.
    const onClickCapture = (event) => {
      try {
        if (isExcluded(window.location.pathname)) return;
        const origin = event.target instanceof Element ? event.target : null;
        const target = origin?.closest('a, button, [role="button"], input[type="submit"]');
        if (!target) return;

        const text = (target.textContent || target.getAttribute('aria-label') || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 60);
        const href = target.getAttribute('href');
        track('click', {
          refType: 'ui',
          refId: target.id || null,
          attrs: {
            tag: target.tagName.toLowerCase(),
            text: text || null,
            href: href && href !== '#' ? href.slice(0, 200) : null,
          },
        });
      } catch {
        // 수집 실패는 화면 흐름을 막지 않는다.
      }
    };

    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, []);

  useEffect(() => {
    // 탭을 닫거나 백그라운드로 보낼 때 마지막 체류시간을 기록하고 큐를 비운다.
    const finalize = () => {
      const { path, enteredAt } = currentRef.current;
      if (path && enteredAt) {
        trackPageDwell(path, Date.now() - enteredAt);
        currentRef.current = { path, enteredAt: Date.now() }; // 중복 누적 방지
      }
      flush();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') finalize();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', finalize);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', finalize);
    };
  }, []);

  return null;
};

export default BehaviorTracker;
