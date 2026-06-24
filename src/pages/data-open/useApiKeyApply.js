import { useState } from 'react';
import { api as apiClient } from '@lib/apiClient.js';

export const useApiKeyApply = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [memberInfo, setMemberInfo] = useState({}); // 회원 정보를 훅에서 관리

  // ✅ 신청하기 버튼 클릭 시 실행될 함수
  const openPopupWithData = async (mbrNo) => {
    setErrorMessage('');
    try {
      // 1. 먼저 백엔드 컨트롤러(@GetMapping("/member-info/{mbrNo}")) 호출
      const res = await apiClient.get(`/api/v1/apikey/apply/member-info/${mbrNo}`);

      // 2. 받아온 정보를 상태에 저장
      setMemberInfo(res.data);

      // 3. 조회가 성공하면 그때 팝업을 연다
      setIsOpen(true);
    } catch (err) {
      alert('회원 정보를 불러올 수 없습니다.');

      // 혹시라도 열려있을지 모를 팝업을 닫힘 상태로 유지
      setIsOpen(false);
    }
  };

  const closePopup = () => setIsOpen(false);

  // 저장 로직 (POST)
  const submitApply = async (mbrNo, formData) => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        ...formData,
        indvGnrlTelno: formData.indvGnrlTelno?.replace(/-/g, '') ?? '',
      };
      await apiClient.post(`/api/v1/apikey/apply/${mbrNo}`, payload);
      alert('인증키 신청이 완료되었습니다.');
      window.location.reload();
      closePopup();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || '신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isOpen,
    submitting,
    errorMessage,
    memberInfo,      // 팝업에 넘겨줄 데이터
    openPopup: openPopupWithData, // 수정된 함수
    closePopup,
    submitApply,
  };
};