import { api as apiClient } from '@lib/apiClient.js';

// apiClient는 화면마다 response 또는 response.data 형태가 섞여 있어 공통 정규화가 필요하다.
const normalizeResponse = (response) => response?.data || response || {};

// 공통코드 그룹 ID 배열을 받아 그룹별 코드 목록 Map으로 반환한다.
// 우선 bulk API를 사용하고, 응답 형식이 다르거나 일부 그룹이 비어 있으면 그룹별 API로 폴백한다.
export const fetchCommonCodes = async (groups) => {
  if (!Array.isArray(groups) || groups.length === 0) {
    return {};
  }

  const params = new URLSearchParams();
  groups.forEach((group) => {
    params.append('groups', group);
  });

  const bulkResponse = normalizeResponse(
    await apiClient.get(`/api/v1/commoncode/bulk?${params.toString()}`),
  );

  const hasAllGroups = groups.every((group) => Array.isArray(bulkResponse?.[group]));
  if (hasAllGroups) {
    return bulkResponse;
  }

  const entries = await Promise.all(
    groups.map(async (group) => {
      const groupResponse = normalizeResponse(
        await apiClient.get(`/api/v1/commoncode/${group}/codes`),
      );
      return [group, Array.isArray(groupResponse) ? groupResponse : []];
    }),
  );

  return Object.fromEntries(entries);
};

// 공통코드 응답을 select, checkbox 같은 UI 옵션 형식으로 변환한다.
export const convertToMenuOptions = (codeList) => {
  if (!Array.isArray(codeList)) {
    return [];
  }

  return codeList.map((item) => ({
    value: item.comCd,
    label: item.comCdNm,
  }));
};

// 여러 그룹을 조회한 뒤 각 그룹을 { value, label } 배열로 변환해 반환한다.
// 반환 예: { BIZ_PBANC_CLSF_CD: [{ value: 'PC10', label: '금융' }] }
export const fetchAndConvertCommonCodes = async (groups) => {
  const response = await fetchCommonCodes(groups);
  return groups.reduce((acc, group) => {
    acc[group] = convertToMenuOptions(response?.[group] || []);
    return acc;
  }, {});
};
