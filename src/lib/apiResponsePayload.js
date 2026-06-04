const isObjectPayload = (value) => value !== null && typeof value === 'object';

/**
 * smep-be 공통 ApiResponse 래핑 응답과 raw 응답을 같은 payload 형태로 맞춘다.
 *
 * @param {unknown} response apiClient가 반환한 응답 본문
 * @returns {object} 업무 화면이 사용할 실제 payload
 */
export function unwrapApiResponseData(response) {
  // 이유: 일반 REST API는 { success, data }로 감싸질 수 있지만 일부 기존 화면과 테스트는 raw payload도 사용한다.
  if (isObjectPayload(response?.data)) {
    return response.data;
  }

  return isObjectPayload(response) ? response : {};
}
