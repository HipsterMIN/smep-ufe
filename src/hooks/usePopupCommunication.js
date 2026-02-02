import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * 팝업 통신을 위한 Custom Hook
 * Sender(부모창)와 Receiver(자식창) 로직을 모두 포함합니다.
 */

// Sender Hook (부모창용)
export const usePopupSender = () => {
  const timerRef = useRef(null);

  const openPopup = useCallback((path, payload, windowFeatures) => {
    const payloadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const targetUrl = `${baseUrl}${path}?payloadId=${payloadId}`;
    
    // 1. 팝업 열기
    const popup = window.open(targetUrl, 'ai-consultant', windowFeatures);

    if (!popup) {
      // 팝업 차단 시 폴백: sessionStorage 저장 후 이동
      try {
        sessionStorage.setItem(`ai-chat-payload:${payloadId}`, JSON.stringify(payload));
        window.location.href = targetUrl;
      } catch (e) {
        console.warn('Failed to use sessionStorage fallback', e);
      }
      return null;
    }

    // 2. PostMessage 전송 루프 (팝업이 로드될 때까지)
    const targetOrigin = window.location.origin;
    const message = {
      type: 'ai-chat-payload',
      payload,
      payloadId,
    };

    let attempts = 0;
    const maxAttempts = 50; // 약 15초 (300ms * 50)

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timerRef.current);
        return;
      }
      popup.postMessage(message, targetOrigin);
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(timerRef.current);
      }
    }, 300);

    // 3. ACK 수신 리스너
    const handleMessage = (event) => {
      if (event.origin !== targetOrigin) return;
        
      // 자식창이 데이터 요청 시 즉시 전송
      if (event.data?.type === 'ai-chat-request-payload') {
        popup.postMessage(message, targetOrigin);
      }
        
      // 자식창이 데이터 수신 확인(ACK) 시 루프 종료
      if (event.data?.type === 'ai-chat-payload-ack' && event.data.payloadId === payloadId) {
        clearInterval(timerRef.current);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // 팝업 객체 반환 (필요 시 focus 등에 사용)
    return popup;
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { openPopup };
};

// Receiver Hook (자식창용)
export const usePopupReceiver = (onPayloadReceived) => {
  const [isReady, setIsReady] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const payloadId = params.get('payloadId');
    const encodedPayload = params.get('payload');
    const origin = window.location.origin;

    const processPayload = (payloadData) => {
      if (processedRef.current) return;
      if (!payloadData) return;
            
      processedRef.current = true;
      onPayloadReceived(payloadData);
      setIsReady(true);
    };

    // 1. URL Encoded Payload 확인 (레거시 지원)
    if (encodedPayload) {
      try {
        const json = decodeURIComponent(escape(atob(decodeURIComponent(encodedPayload))));
        processPayload(JSON.parse(json));
        return;
      } catch (e) {
        console.error('Failed to decode payload', e);
      }
    }

    // 2. SessionStorage 확인 (폴백 데이터)
    if (payloadId) {
      try {
        const key = `ai-chat-payload:${payloadId}`;
        const raw = sessionStorage.getItem(key);
        if (raw) {
          sessionStorage.removeItem(key); // 1회성 사용 후 삭제
          processPayload(JSON.parse(raw));
          return;
        }
      } catch (e) {
        console.warn('SessionStorage read failed', e);
      }
    }

    // 3. PostMessage 리스너 등록
    const handleMessage = (event) => {
      if (event.origin !== origin) return;
      if (event.data?.type !== 'ai-chat-payload') return;
            
      const payload = event.data.payload;
      if (payload) {
        processPayload(payload);
        // ACK 전송
        if (event.data.payloadId) {
          event.source?.postMessage({
            type: 'ai-chat-payload-ack',
            payloadId: event.data.payloadId,
          }, event.origin);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // 4. 부모창에 데이터 요청 (역방향 요청)
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'ai-chat-request-payload' }, origin);
    }

    // 5. 타임아웃 처리 (데이터 수신 실패 시)
    const timer = setTimeout(() => {
      if (!processedRef.current) {
        // 필요 시 에러 상태 처리 가능
        console.warn('Payload receive timeout');
      }
    }, 5000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, [onPayloadReceived]);

  return { isReady };
};
