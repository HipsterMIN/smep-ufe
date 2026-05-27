import { useCallback } from 'react';

import { useNiceIdAuth } from '../../hooks/useNiceIdAuth';

/**
 * NICE ID 인증 시작 버튼이다.
 *
 * <p>업무 화면이 자체 버튼을 유지해야 하면 이 컴포넌트 대신 useNiceIdAuth 또는 openNiceIdAuth를 직접 사용한다.
 *
 * @param {Object} props 버튼 속성
 * @param {string[]} props.svcTypes NICE 인증수단 코드 목록(M/F/I/U)
 * @param {(result: Object) => void} [props.onSuccess] 인증 성공 콜백
 * @param {(error: Object) => void} [props.onError] 인증 실패 콜백
 * @param {string} [props.children] 버튼 라벨
 * @param {string} [props.className] 버튼 클래스명
 * @param {boolean} [props.disabled] 버튼 비활성화 여부
 */
const NiceIdAuthButton = ({
  svcTypes,
  onSuccess,
  onError,
  children = 'NICE 본인인증',
  className = 'krds-btn primary',
  disabled = false,
}) => {
  const { authenticate, loading } = useNiceIdAuth();

  const handleClick = useCallback(async () => {
    const result = await authenticate({ svcTypes });

    if (result.success) {
      onSuccess?.(result);
      return;
    }

    onError?.(result);
  }, [authenticate, onError, onSuccess, svcTypes]);

  return (
    <button type="button" className={className} disabled={disabled || loading} onClick={handleClick}>
      {children}
    </button>
  );
};

export default NiceIdAuthButton;
