import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * AI 채팅 팝업을 열고 데이터를 전송하는 훅 (Sender)
 */
export const useAiChatPopup = () => {
  const sendPayloadToPopup = useCallback((popup, payload, payloadId) => {
    if (!popup) return;
    
    const targetOrigin = window.location.origin;
    const message = {
      type: 'ai-chat-payload',
      payload,
      payloadId,
    };

    // 1. 즉시 전송
    popup.postMessage(message, targetOrigin);

    // 2. 수신 확인(ACK)될 때까지 주기적 재전송 (최대 20회)
    let attempts = 0;
    const maxAttempts = 20;
    
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        window.removeEventListener('message', handleAck);
        return;
      }
      popup.postMessage(message, targetOrigin);
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(timer);
        window.removeEventListener('message', handleAck);
      }
    }, 300);

    const handleAck = (event) => {
      if (event.origin !== targetOrigin) return;
      
      // 팝업이 준비되었다고 신호를 보내면 즉시 전송
      if (event.data?.type === 'ai-chat-request-payload') {
        event.source?.postMessage(message, targetOrigin);
        return;
      }
      
      // 팝업이 데이터를 잘 받았다고 확인(ACK)하면 타이머 종료
      if (event.data?.type === 'ai-chat-payload-ack' && event.data.payloadId === payloadId) {
        clearInterval(timer);
        window.removeEventListener('message', handleAck);
      }
    };

    window.addEventListener('message', handleAck);
  }, []);

  const openChat = useCallback((payload) => {
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const payloadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    // 1. SessionStorage 백업 (팝업 차단/새로고침 대비)
    try {
      sessionStorage.setItem(`ai-chat-payload:${payloadId}`, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to store ai-chat payload in sessionStorage', e);
    }

    // 2. 팝업 오픈
    const screenWidth = window.screen?.availWidth || 1200;
    const screenHeight = window.screen?.availHeight || 900;
    const popup = window.open(
      `${baseUrl}/service/ai-chat?payloadId=${payloadId}`,
      'ai-consultant',
      `popup=yes,width=${screenWidth},height=${screenHeight},top=0,left=0,location=no,toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    // 3. 팝업 설정 및 데이터 전송
    if (popup) {
      try {
        popup.moveTo(0, 0);
        popup.resizeTo(screenWidth, screenHeight);
      } catch (e) {
        // Ignore browser restrictions
      }
      popup.focus();
      sendPayloadToPopup(popup, payload, payloadId);
    } else {
      // 팝업 차단 시 현재 창 이동
      window.location.href = `${baseUrl}/service/ai-chat?payloadId=${payloadId}`;
    }
  }, [sendPayloadToPopup]);

  return { openChat };
};

/**
 * AI 채팅 팝업에서 데이터를 수신하는 훅 (Receiver)
 */
export const useAiChatPayload = () => {
  const [payload, setPayload] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  // URL 파라미터 파싱
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const encodedPayload = searchParams.get('payload');
  const payloadId = searchParams.get('payloadId');

  useEffect(() => {
    const parsePayload = (raw) => {
      if (!raw) return null;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      return raw;
    };

    // 1. URL 직접 전달된 payload 확인 (Legacy)
    if (encodedPayload) {
      try {
        const decoded = decodeURIComponent(encodedPayload);
        const json = decodeURIComponent(escape(atob(decoded)));
        const parsed = JSON.parse(json);
        setPayload(parsed);
        setIsReady(true);
        return;
      } catch (e) {
        console.error('Failed to decode payload', e);
      }
    }

    // 2. SessionStorage 확인 (백업 데이터)
    if (payloadId) {
      try {
        const raw = sessionStorage.getItem(`ai-chat-payload:${payloadId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPayload(parsed);
          setIsReady(true);
          // 읽은 후 삭제 (일회성) - 필요에 따라 주석 처리 가능
          sessionStorage.removeItem(`ai-chat-payload:${payloadId}`);
        }
      } catch (e) {
        // ignore
      }
    }

    // 3. postMessage 수신 대기 (실시간 데이터)
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'ai-chat-payload') return;
      
      const parsed = parsePayload(event.data.payload);
      if (parsed) {
        setPayload(parsed);
        setIsReady(true);
        
        // 수신 확인(ACK) 전송
        if (event.data.payloadId) {
          event.source?.postMessage(
            { type: 'ai-chat-payload-ack', payloadId: event.data.payloadId },
            event.origin
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // 4. 부모 창에 데이터 요청 신호 발송
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'ai-chat-request-payload' }, window.location.origin);
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [encodedPayload, payloadId]);

  return { payload, isReady };
};
