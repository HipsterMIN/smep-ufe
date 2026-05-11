// src/components/verification/VerificationResultPopup.jsx
import React from 'react';
import Popup from '@components/ui/Popup';

/**
 * 발급진위확인 결과 팝업
 * @param {boolean} isOpen - 팝업 열림 상태
 * @param {function} onClose - 팝업 닫기 콜백
 * @param {boolean} isSuccess - 진위확인 성공 여부
 * @param {object} data - 성공 시 증명서 데이터
 * @param {string} data.prdocIssuAplyNo - 문서확인번호
 * @param {string} data.regDt - 발급일시 (ISO 8601 format)
 * @param {object} data.prdocType - 증명서 종류 정보
 * @param {string} data.prdocType.code - 증명서 코드
 * @param {string} data.prdocType.name - 증명서명
 * @param {string|null} data.prdocType.linkedSystemName - 연계시스템명 (null 가능)
 * @param {string|null} data.prdocType.linkedSystemUrl - 연계시스템 URL (null 가능)
 */
const VerificationResultPopup = ({
  isOpen,
  onClose,
  isSuccess,
  data,
}) => {
  // ISO 8601 날짜를 "YYYY-MM-DD HH:mm:ss" 형식으로 변환
  const formatDateTime = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 연계 시스템명 존재 여부
  const hasLinkedSystemName = !!data?.prdocType?.linkedSystemName;
  const hasLinkedSystemUrl = !!data?.prdocType?.linkedSystemUrl;

  return (
    <Popup
      size="small"
      isOpen={isOpen}
      onClose={onClose}
      noCloseBtn
      footer={
        <button
          type="button"
          className="krds-btn tertiary medium"
          onClick={onClose}
        >
                    닫기
        </button>
      }
    >
      <div className="confirm-guide">
        <span className="sub-title">진위확인</span>

        {isSuccess ? (
          <>
            <p className="main-title">
              <i className="ico-confirm ico-success"></i>
                            발급 진위 확인이 완료되었습니다.
            </p>
            <p className="sub-desc">
              {hasLinkedSystemName ? (
                <>
                  {/* 연계 시스템명이 있는 경우 */}
                                    조회하신 {data?.prdocType?.name}는 {formatDateTime(data?.regDt)}에 <br />
                  <span className="txt-point">
                    {data.prdocType.linkedSystemName}
                    {hasLinkedSystemUrl && (
                      <>
                                                (
                        <a
                          className="on-linktxt2"
                          href={`${data.prdocType.linkedSystemUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data.prdocType.linkedSystemUrl}
                        </a>
                                                )
                      </>
                    )}
                  </span>과 연계하여 <br />
                  <span className="txt-point">
                    중소벤처24(
                    <a
                      className="on-linktxt2"
                      href="http://smes.go.kr"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      www.smes.go.kr
                    </a>
                    )
                  </span>에서 출력한 문서임을 확인합니다.
                </>
              ) : (
                <>
                  {/* 연계 시스템명이 없는 경우 */}
                                    조회하신 {data?.prdocType?.name}는 {formatDateTime(data?.regDt)}에 <br />
                  <span className="txt-point">
                    중소벤처24(
                    <a
                      className="on-linktxt2"
                      href="http://smes.go.kr"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      www.smes.go.kr
                    </a>
                    )
                  </span>에서 출력한 문서임을 확인합니다.
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <p className="main-title">
              <i className="ico-confirm ico-fail"></i>
                            발급 진위 확인에 실패하였습니다.
            </p>
            <p className="sub-desc">
                            해당 문서확인번호로 조회되는 출력내역이 없습니다.
            </p>
          </>
        )}
      </div>
    </Popup>
  );
};

export default VerificationResultPopup;
