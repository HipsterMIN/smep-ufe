import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SideNavigation from '@/components/ui/SideNavigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Popup from '@/components/ui/Popup';
import { api as apiClient } from '@lib/apiClient.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';

/** 태그로 바로 표시할 최대 품목 수 */
const ITEM_PREVIEW_COUNT = 7;

const UI_USR_R_121 = () => {
  const navigate = useNavigate();
  const { certSystmSn } = useParams();

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [certification, setCertification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          `/api/v1/product/certification/${certSystmSn}`,
        );
        setCertification(response.data);
      } catch (error) {
        console.error('상세 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (certSystmSn) {
      fetchDetail();
    }
  }, [certSystmSn]);

  const goBack = () => {
    navigate(-1);
  };

  // 인증제도 상세정보 URL 조합
  const detailUrl = certification
    ? `https://www.standard.go.kr/KSCI/crtfcSystem/searchCrtfcSystemView.do?crtfcstId=0000000${certification.certSystmId}&crtfcstReformNo=${certification.certSystmRvsnHstryNo}`
    : null;

  const items = certification?.items || [];
  const previewItems = items.slice(0, ITEM_PREVIEW_COUNT);
  const hasMoreItems = items.length > ITEM_PREVIEW_COUNT;

  if (loading) {
    return (
      <>
        <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <p className="ac">로딩 중...</p>
        </div>
      </>
    );
  }

  if (!certification) {
    return (
      <>
        <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <p className="ac">데이터를 불러올 수 없습니다.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">품목별 법정의무 인증제도</p>
          <h2 className="h-tit2">{certification.certSystmNm}</h2>
        </div>

        <ul className="onboard-summary">
          <li>
            <span>
              <span className="sr-only">조회수</span>
              <i className="svg-icon ico-pw-visible-on"></i>
              {certification.tinqCnt ?? 0}
            </span>
          </li>
        </ul>

        <div className="def-list-wrap">
          <dl className="def-list">
            <dt>분야</dt>
            <dd>{certification.certSystmFldNm || '-'}</dd>

            <dt>소관부처</dt>
            <dd>{certification.tkcgMaoNm || '-'}</dd>

            <dt>제도개요</dt>
            <dd>{certification.certSystmExplnCn || '-'}</dd>

            <dt>법적근거</dt>
            <dd>{certification.lglBssCn || '-'}</dd>

            <dt>인증제도 상세정보</dt>
            <dd>
              {detailUrl ? (
                <a
                  href={detailUrl}
                  className="krds-btn tertiary xsmall"
                  target="_blank"
                  rel="noreferrer noopener"
                  title="새 창 열림"
                >
                      바로가기
                  <i className="svg-icon ico-go"></i>
                </a>
              ) : (
                '-'
              )}
            </dd>

            <dt>대상 품목</dt>
            <dd>
              {items.length === 0 ? (
                <span>-</span>
              ) : (
                <div className="krds-tag-wrap">
                  {previewItems.map((item) => (
                    <span key={item.certSystmItemSn} className="krds-btn-tag">
                      {item.certSystmItemNm}
                    </span>
                  ))}

                  {hasMoreItems && (
                    <>
                      <button
                        type="button"
                        className="krds-btn text primary xsmall ml-8"
                        onClick={() => setIsPopupOpen(true)}
                      >
                              더보기
                        <i className="svg-icon ico-plus"></i>
                      </button>

                      {/* Popup [S] */}
                      <Popup
                        isOpen={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                        title={certification.certSystmNm}
                        noBottomBtn={true}
                      >
                        <div className="on-flexcolumn gap12">
                          <h3 className="on-p4">대상 품목 목록</h3>
                          <p className="on-colorblue2">
                                  ※ Ctrl + F키를 활용하시면 품목 검색이 가능합니다.
                          </p>
                          <div className="krds-tag-wrap bg col-3">
                            {items.map((item) => (
                              <span key={item.certSystmItemSn} className="krds-btn-tag">
                                {item.certSystmItemNm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Popup>
                      {/* Popup [E] */}
                    </>
                  )}
                </div>
              )}
            </dd>
          </dl>
        </div>

        <div className="onboard-btm-btngroup">
          <div>
            <button
              type="button"
              className="krds-btn tertiary xlarge"
              onClick={goBack}
            >
                목록
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_R_121;