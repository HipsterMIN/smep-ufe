import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TIMEOUT_MS = 2000;
const RETRY_QUERY_KEY = '_retry';

const normalizeSource = (value) => String(value ?? '').trim();

const normalizeRetryCount = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return DEFAULT_MAX_RETRIES;
  return Math.floor(parsed);
};

const normalizeTimeoutMs = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_TIMEOUT_MS;
  return parsed;
};

const isNonRetriableSource = (source) => /^(?:data|blob):/i.test(source);

const appendRetryQuery = (source, attempt, nonce) => {
  if (!source || attempt <= 0 || isNonRetriableSource(source)) return source;

  const retryToken = `${attempt}-${nonce}`;

  try {
    const isAbsoluteUrl = /^[a-z][a-z0-9+.-]*:/i.test(source);
    const url = new URL(source, window.location.href);
    url.searchParams.set(RETRY_QUERY_KEY, retryToken);
    return isAbsoluteUrl ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const hashIndex = source.indexOf('#');
    const pathAndSearch = hashIndex >= 0 ? source.slice(0, hashIndex) : source;
    const hash = hashIndex >= 0 ? source.slice(hashIndex) : '';
    const separator = pathAndSearch.includes('?') ? '&' : '?';
    return `${pathAndSearch}${separator}${RETRY_QUERY_KEY}=${encodeURIComponent(retryToken)}${hash}`;
  }
};

/**
 * 원본 이미지 요청이 멈춘 경우 timeout으로 제한 재시도 후 fallback을 렌더링한다.
 */
const RetryImage = ({
  src,
  fallbackSrc,
  alt = '',
  maxRetries = DEFAULT_MAX_RETRIES,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onLoad,
  onError,
  ...imageProps
}) => {
  const source = useMemo(() => normalizeSource(src), [src]);
  const fallbackSource = useMemo(() => normalizeSource(fallbackSrc), [fallbackSrc]);
  const retryLimit = useMemo(() => normalizeRetryCount(maxRetries), [maxRetries]);
  const normalizedTimeoutMs = useMemo(() => normalizeTimeoutMs(timeoutMs), [timeoutMs]);
  const [imageState, setImageState] = useState(() => ({
    status: normalizeSource(src) ? 'loading' : 'fallback',
    attempt: 0,
    nonce: 0,
  }));

  useEffect(() => {
    setImageState({
      status: source ? 'loading' : 'fallback',
      attempt: 0,
      nonce: 0,
    });
  }, [source]);

  const requestRetryOrFallback = useCallback(() => {
    setImageState((current) => {
      if (current.status !== 'loading') return current;
      if (current.attempt >= retryLimit || isNonRetriableSource(source)) {
        return {
          ...current,
          status: 'fallback',
        };
      }

      return {
        status: 'loading',
        attempt: current.attempt + 1,
        nonce: Date.now(),
      };
    });
  }, [retryLimit, source]);

  useEffect(() => {
    if (!source || imageState.status !== 'loading') return undefined;

    // 이유: 브라우저 이미지 요청이 pending 상태로 멈추면 error 이벤트 없이도 재요청이 필요하다.
    const timeoutId = window.setTimeout(() => {
      requestRetryOrFallback();
    }, normalizedTimeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    imageState.attempt,
    imageState.nonce,
    imageState.status,
    normalizedTimeoutMs,
    requestRetryOrFallback,
    source,
  ]);

  const renderedSrc = imageState.status === 'fallback'
    ? fallbackSource
    : appendRetryQuery(source, imageState.attempt, imageState.nonce);

  const handleLoad = (event) => {
    const image = event.currentTarget;
    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      requestRetryOrFallback();
      return;
    }

    setImageState((current) => (
      current.status === 'loading'
        ? {
          ...current,
          status: 'loaded',
        }
        : current
    ));

    if (typeof onLoad === 'function') {
      onLoad(event);
    }
  };

  const handleError = (event) => {
    if (imageState.status === 'fallback') {
      if (typeof onError === 'function') {
        onError(event);
      }
      return;
    }

    requestRetryOrFallback();
  };

  return (
    <img
      {...imageProps}
      src={renderedSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default RetryImage;
