import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api as apiClient } from '../lib/apiClient.js';

import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import Popup from '../components/ui/Popup';
import { useUserMenu } from '../context/UserMenuContext.jsx';

const UI_USR_R_041 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { prdocCd } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getFullPath } = useUserMenu();

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/v1/certificate/detail/${prdocCd}`);
        setData(response.data);
      } catch (error) {
        console.error('상세 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [prdocCd]);

  const goBack = () => {
    navigate(-1);
  };

  const handleClickPrint = () => {
    navigate(getFullPath('M_PIIO_00113')); // 증명서 발급 메뉴로 이동
  };

  if (loading) return <div>로딩 중...</div>;
  if (!data) return <div>데이터를 찾을 수 없습니다.</div>;

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap bottom-divide" data-type="responsive">
          <span className="h-sub">증명서 발급</span>
          <h2 className="h-tit2">{data.prdocTtl}</h2>
        </div>

        <div
          className="detail-list-wrap"
          dangerouslySetInnerHTML={{ __html: data.prdocExpln }}
        />

        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={goBack}>
                목록
            </button>
          </div>
          <div>
            <button type="button" className="krds-btn primary xlarge" onClick={() => setIsPopupOpen(true)}>
                증명서 발급 <i className="svg-icon ico-angle right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 팝업 */}
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="중소기업(소상공인) 확인서발급"
        closeLeftAction={
          <>
            <button
              type="button"
              className="krds-btn text small"
              //onClick={handleShare}
            >
              <i className="svg-icon ico-share"></i>
              공유
            </button>
          </>
        }
        footer={
          <>
            <button type="button" className="krds-btn primary md" onClick={() => handleClickPrint()}>발급</button>
            <button type="button" className="krds-btn tertiary md" onClick={() => setIsPopupOpen(false)}>닫기</button>
          </>
        }
      >
        <div className="txt-box outline">
          <h4 className="outline-tit">알려드립니다.</h4>
          <ul className="check-list">
            <li>중소기업현황정보시스템을 통해 중소기업임을 확인 받은 기업에 한하여 출력할 수 있습니다.</li>
            <li>신청 된 문서는 24시간 동안 출력할 수 있으며, 24시간 경과 후 삭제됩니다.</li>
            <li>아래 기업정보를 확인하신 후 출력버튼을 클릭해주세요.</li>
            <li>신규 신청버튼 클릭 시 중소기업임을 최초 확인받기 위하여 중소기업현황정보시스템으로 이동합니다.</li>
            <li>발급된 전자증명서는 정부전자문서지갑에서 확인이 가능합니다.</li>
          </ul>
        </div>

        {/* input  */}
        <div className="on-border-box">
          <div className="form-group">
            <div className="form-conts">
              <div className="form-tit">
                <label htmlFor="id_01" className="form-label">사업자등록번호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </div>
              <input type="text" id="id_01" className="krds-input small" placeholder="사업자등록번호를 입력해주세요" value="228-81-05280" disabled />
            </div>
          </div>
          <div className="form-group">
            <div className="form-conts">
              <div className="form-tit">
                <label htmlFor="id_02" className="form-label">상호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </div>
              <input type="text" id="id_02" className="krds-input small" placeholder="상호를 입력해주세요" value="주식회사 중소벤처" disabled />
            </div>
          </div>
          <div className="form-group">
            <div className="form-conts">
              <div className="form-tit">
                <label htmlFor="id_03" className="form-label">대표자명 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </div>
              <input type="text" id="id_03" className="krds-input small" placeholder="대표자명을 입력해주세요" value="홍길동" disabled />
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_R_041;
