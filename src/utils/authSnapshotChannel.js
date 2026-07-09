/**
 * 탭 간 인증 스냅샷 공유 (BroadcastChannel 'auth_channel').
 *
 * 새 탭은 sessionStorage(탭 격리)가 비어 있어, 다른 탭에 로그인이 살아 있어도
 * silent SSO 풀 리다이렉트(깜빡임)를 타야 했다. 이 유틸은 새 탭이 기존 탭에게
 * AUTH_SNAPSHOT_REQUEST 로 질의하고, 로그인된 탭이 AUTH_SNAPSHOT 으로 응답하면
 * 리다이렉트 없이 refresh 경로로 즉시 복구할 수 있게 한다.
 *
 * - 응답에는 access token을 포함하지 않는다(메모리 전용 원칙 유지).
 *   refreshToken + persist 대상 프로필만 전달하며, 수신 탭은 /account/refresh 로
 *   자기 access token을 새로 발급받는다.
 * - BroadcastChannel 은 same-origin 전용이라 외부로 새지 않는다.
 * - 응답 탭이 없으면 timeoutMs 후 null — 호출부는 기존 silent SSO 로 폴백한다.
 */

export const AUTH_CHANNEL_NAME = 'auth_channel';

const createId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * 다른 탭에 인증 스냅샷을 요청한다.
 *
 * @param {number} timeoutMs 응답 대기 시간(기본 250ms)
 * @returns {Promise<object|null>} 스냅샷(없으면 null)
 */
export const requestAuthSnapshot = (timeoutMs = 250) =>
  new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
      resolve(null);
      return;
    }

    let channel;
    try {
      channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    } catch {
      resolve(null);
      return;
    }

    const requestId = createId();
    let settled = false;

    const finish = (snapshot) => {
      if (settled) return;
      settled = true;
      try {
        channel.close();
      } catch {
        /* ignore */
      }
      resolve(snapshot);
    };

    const timer = setTimeout(() => finish(null), timeoutMs);

    channel.onmessage = (event) => {
      const data = event?.data;
      if (data?.type !== 'AUTH_SNAPSHOT' || data.requestId !== requestId) return;
      clearTimeout(timer);
      finish(data.snapshot || null);
    };

    try {
      channel.postMessage({ type: 'AUTH_SNAPSHOT_REQUEST', requestId });
    } catch {
      clearTimeout(timer);
      finish(null);
    }
  });
