import { useCallback, useEffect, useRef } from 'react';

import {
  JUSO_ERROR_MESSAGE_TYPE,
  JUSO_POPUP_BRIDGE_PATH,
  JUSO_SELECT_MESSAGE_TYPE,
} from './jusoAddressConstants';

/**
 * =============================================================================
 * JUSO 주소검색 버튼 컴포넌트 사용 가이드
 * =============================================================================
 *
 * [무엇을 제공하는가]
 * - 버튼 클릭 시 백엔드 브리지(`/api/v1/juso/popup/bridge`) 팝업을 열어 주소검색을 진행한다.
 * - 주소 선택이 완료되면 부모 화면으로 표준 payload를 전달한다.
 * - 실패 케이스(팝업 차단/콜백 누락/브리지 오류)는 onError(Error)로 전달한다.
 *
 * [부모 화면에서 반드시 해야 하는 일]
 * 1) onSelect에서 payload.zipNo/baseAddress/detailAddress를 화면 상태에 반영한다.
 * 2) 상세주소 입력칸은 사용자가 수동 수정할 수 있도록 별도 입력값으로 관리한다.
 * 3) onError에서 사용자 안내(알림/토스트)와 로그를 함께 처리한다.
 *
 * [권장 사용 예시]
 * ```jsx
 * const [address, setAddress] = useState({
 *   zipNo: '',
 *   baseAddress: '',
 *   detailAddress: '',
 *   roadFullAddress: '',
 *   raw: {},
 * });
 *
 * const handleSelectAddress = (payload) => {
 *   setAddress({
 *     zipNo: payload.zipNo,
 *     baseAddress: payload.baseAddress,
 *     detailAddress: payload.detailAddress,
 *     roadFullAddress: payload.roadFullAddress,
 *     raw: payload.raw,
 *   });
 * };
 *
 * const handleAddressError = (error) => {
 *   console.error('[JUSO] 주소검색 실패:', error);
 *   window.alert(error.message);
 * };
 *
 * <JusoAddressSearchButton
 *   onSelect={handleSelectAddress}
 *   onError={handleAddressError}
 *   buttonText="우편번호 검색"
 * />
 * ```
 *
 * [주의할 점]
 * - 이 컴포넌트는 주소를 "저장"하지 않는다. 저장 API 호출은 부모 화면 책임이다.
 * - 팝업 메시지는 보안상 `origin + requestId`를 모두 검증하므로, 임의 메시지는 무시된다.
 * - BASE_URL/VITE_API_CONTEXT 조합으로 브리지 URL을 만들기 때문에 환경변수 규칙이 깨지면 팝업이 실패할 수 있다.
 */

/**
 * @typedef {Object} JusoAddressPayload
 * @property {string} zipNo 우편번호(도로명 API zipNo)
 * @property {string} baseAddress 기본주소(도로명 API roadAddrPart1)
 * @property {string} detailAddress 상세주소(도로명 API addrDetail)
 * @property {string} roadFullAddress 전체 도로명 주소(도로명 API roadFullAddr)
 * @property {Record<string, string>} raw as-is 원본 필드 전체
 */

/**
 * @typedef {Object} JusoAddressSearchButtonProps
 * @property {(payload: JusoAddressPayload) => void} onSelect 주소 선택 성공 콜백
 * @property {(error: Error) => void} [onError] 주소 선택 실패 콜백
 * @property {string} [buttonText] 버튼 라벨
 * @property {string} [className] 버튼 클래스명
 * @property {boolean} [disabled] 버튼 비활성화 여부
 */

const createRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const buildBridgeUrl = (requestId) => {
  // 왜 필요한지(의도): 프론트는 `/home-dev`, `/home`처럼 베이스 경로가 환경마다 달라 하드코딩 URL이 쉽게 깨진다.
  // 무엇을 하는지(동작): BASE_URL + API_CONTEXT + 브리지 path를 조합해 현재 실행 환경에 맞는 절대 URL을 생성한다.
  // 주의할 점(예외/부작용): BASE_URL이나 VITE_API_CONTEXT에 슬래시가 중복되면 URL이 깨질 수 있어 정규화가 필수다.
  const baseWithoutTrailingSlash = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const apiContext = (import.meta.env.VITE_API_CONTEXT || '').replace(/^\/?/, '/');
  const apiBase = `${baseWithoutTrailingSlash}${apiContext}`.replace(/\/+$/, '');
  const popupPath = `${apiBase}${JUSO_POPUP_BRIDGE_PATH}`.replace(/\/{2,}/g, '/');
  const popupUrl = new URL(popupPath, window.location.origin);

  popupUrl.searchParams.set('requestId', requestId);
  popupUrl.searchParams.set('parentOrigin', window.location.origin);

  return popupUrl.toString();
};

const isValidPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const hasZipNo = typeof payload.zipNo === 'string' && payload.zipNo.trim() !== '';
  const hasBaseAddress =
    typeof payload.baseAddress === 'string' && payload.baseAddress.trim() !== '';
  const hasRaw = payload.raw && typeof payload.raw === 'object';

  return hasZipNo && hasBaseAddress && hasRaw;
};

/**
 * 공용 주소검색 버튼 컴포넌트
 *
 * [onSelect payload 매핑 기준]
 * - zipNo: 우편번호 입력칸
 * - baseAddress: 기본주소 입력칸(읽기전용 권장)
 * - detailAddress: 상세주소 입력 초기값(사용자 수정 가능)
 * - roadFullAddress: 표시/저장용 전체주소(선택)
 * - raw: 원본 전체 필드(추가 가공/백오피스 전달 시 사용)
 *
 * @param {JusoAddressSearchButtonProps} props
 */
const JusoAddressSearchButton = ({
  onSelect,
  onError,
  buttonText = '우편번호 검색',
  className = 'krds-btn secondary small',
  disabled = false,
}) => {
  const pendingRequestIdRef = useRef(null);

  const emitError = useCallback(
    (errorOrMessage) => {
      if (typeof onError !== 'function') {
        return;
      }
      const error =
        errorOrMessage instanceof Error
          ? errorOrMessage
          : new Error(String(errorOrMessage || '주소검색 처리 중 오류가 발생했습니다.'));
      onError(error);
    },
    [onError],
  );

  useEffect(() => {
    // 왜 필요한지(의도): 동일 탭에서 다른 팝업/프레임이 보낸 postMessage가 섞이면 주소값 오염이 발생할 수 있다.
    // 무엇을 하는지(동작): origin과 requestId가 모두 일치하는 메시지만 수용하고, 처리 완료 후 대기 requestId를 제거한다.
    // 주의할 점(예외/부작용): requestId 검증이 없으면 이전 팝업 결과가 현재 입력칸을 덮어써 예측 불가 상태가 될 수 있다.
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data;
      if (!data || typeof data !== 'object') {
        return;
      }

      const pendingRequestId = pendingRequestIdRef.current;
      if (!pendingRequestId || data.requestId !== pendingRequestId) {
        return;
      }

      if (data.type === JUSO_SELECT_MESSAGE_TYPE) {
        pendingRequestIdRef.current = null;
        if (!isValidPayload(data.payload)) {
          emitError('주소검색 결과 형식이 올바르지 않습니다.');
          return;
        }

        if (typeof onSelect === 'function') {
          onSelect(data.payload);
        }
        return;
      }

      if (data.type === JUSO_ERROR_MESSAGE_TYPE) {
        pendingRequestIdRef.current = null;
        emitError(data.errorMessage || '주소검색 처리 중 오류가 발생했습니다.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [emitError, onSelect]);

  const handleOpenPopup = useCallback(() => {
    // 왜 필요한지(의도): 브라우저 팝업 차단/중복 클릭 상황에서 요청 식별이 꼬이면 잘못된 결과가 반영될 수 있다.
    // 무엇을 하는지(동작): 클릭마다 신규 requestId를 발급해 현재 요청을 식별하고, 팝업 차단 시 즉시 정리한다.
    // 주의할 점(예외/부작용): requestId를 재사용하거나 정리를 누락하면 이전 요청 결과가 뒤늦게 수신될 수 있다.
    const requestId = createRequestId();
    pendingRequestIdRef.current = requestId;

    const popup = window.open(
      buildBridgeUrl(requestId),
      'juso-address-popup',
      'width=570,height=420,scrollbars=yes,resizable=yes',
    );

    if (!popup) {
      pendingRequestIdRef.current = null;
      emitError('브라우저에서 팝업이 차단되어 주소검색 창을 열지 못했습니다.');
      return;
    }

    popup.focus?.();
  }, [emitError]);

  return (
    <button type="button" className={className} disabled={disabled} onClick={handleOpenPopup}>
      {buttonText}
    </button>
  );
};

export default JusoAddressSearchButton;
