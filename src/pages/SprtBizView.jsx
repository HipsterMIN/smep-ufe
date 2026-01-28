import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import captureImg2 from '../../styles/img/capture2.png';
import { useUserMenu } from '../context/UserMenuContext.jsx';
import { api as apiClient } from '../lib/apiClient.js';

const SprtBizView = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs
  const shadowTextRef1 = useRef(null);
  const shadowTextRef2 = useRef(null);

  // 토글 핸들러
  const handleToggleTextShadow1 = () => {
    shadowTextRef1.current?.classList.toggle('on');
  };

  const handleToggleTextShadow2 = () => {
    shadowTextRef2.current?.classList.toggle('on');
  };

  // 목록으로 돌아가기
  const handleGoToList = () => {
    navigate('..', { replace: false });  // 한 단계 상위로 이동
  };

  // 상세 조회
  useEffect(() => {
    let isMounted = true; // cleanup을 위한 플래그

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/api/v1/sprtBiz/${id}`);

        if (isMounted) {
          console.log('상세 데이터 조회:', response.data);
          setItem(response.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('상세 조회 실패:', err);
          setError(err.message || '데이터를 불러오는데 실패했습니다.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    window.scrollTo(0, 0);
    fetchDetail();

    // Cleanup 함수
    return () => {
      isMounted = false;
    };
  }, [id]);

  // 사이드바 데이터
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  // 로딩 중
  if (loading) {
    return (
      <>
        <SideNavigation
          pageTitle={depth1Menu?.menuNm || ''}
          menuItems={sidebarData}
        />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap">
            <p className="loading-text">데이터를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <>
        <SideNavigation
          pageTitle={depth1Menu?.menuNm || ''}
          menuItems={sidebarData}
        />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap">
            <p className="error-text">{error}</p>
            <button
              type="button"
              className="krds-btn tertiary xlarge"
              onClick={handleGoToList}
            >
                목록으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  // 데이터 없음
  if (!item) {
    return (
      <>
        <SideNavigation
          pageTitle={depth1Menu?.menuNm || ''}
          menuItems={sidebarData}
        />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap">
            <p>데이터를 찾을 수 없습니다.</p>
          </div>
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
        <div className="page-title-wrap on-btmline" data-type="responsive">
          <p className="on-p1 on-colorblue">지원사업</p>
          <h2 className="h-tit2">{item.sprtBizNm || '제목 없음'}</h2>
        </div>

        {/*        <div className="on-announcement">
          <div className="on-announcement-inner">
            <p><span dangerouslySetInnerHTML={{ __html: item.sprtCn || '내용이 없습니다.' }} /></p>
            <div className="ac">
              <Link type="button" className="krds-btn large krds-btn-shadow"
                onClick={() => alert('알림이 예약되었습니다')}>공고알림 예약하기</Link>
            </div>
          </div>
        </div>*/}

        <div className="page-title-wrap on-btmline" data-type="responsive">
          <h3 className="h-tit3">사업개요</h3>
        </div>
        <div className="def-list-wrap">
          <dl className="def-list">
            <dt>지원대상</dt>
            <dd><span dangerouslySetInnerHTML={{ __html: item.sprtTrgtCn || '-' }} /></dd>
            <dt>비지원대상</dt>
            <dd>
              {item.sprtExclTrgtCn ? (
                <>
                  <div className="onshadow-text" ref={shadowTextRef1}>
                    <span dangerouslySetInnerHTML={{ __html: item.sprtExclTrgtCn || '-' }} />
                  </div>
                  <button
                    type="button"
                    className="krds-btn tertiary xsmall ontoggle-textshadow"
                    onClick={handleToggleTextShadow1}
                  >
                        전체보기
                    <i className="svg-icon ico-angle"></i>
                  </button>
                </>
              ) : (
                '-'
              )}
            </dd>
            <dt>지원내용</dt>
            <dd>
              {item.sprtCn ? (
                <>
                  <div className="onshadow-text" ref={shadowTextRef2}>
                    <span dangerouslySetInnerHTML={{ __html: item.sprtCn || '-' }}/>
                  </div>
                  <button
                    type="button"
                    className="krds-btn tertiary xsmall ontoggle-textshadow"
                    onClick={handleToggleTextShadow2}
                  >
                        전체보기
                    <i className="svg-icon ico-angle"></i>
                  </button>
                </>
              ) : (
                '-'
              )}
            </dd>
          </dl>
        </div>

        <div className="page-title-wrap on-btmline" data-type="responsive">
          <h3 className="h-tit3">신청절차</h3>
        </div>
        <div className="def-list-wrap">
          <dl className="def-list">
            <dt>신청접수</dt>
            <dd><span dangerouslySetInnerHTML={{ __html: item.aplyMthdCn || '-' }}/></dd>
            <dt>신청시기</dt>
            <dd><span dangerouslySetInnerHTML={{ __html: item.aplyPridCn || '-' }}/></dd>
            <dt>처리절차</dt>
            <dd>
              {item.prcssPrcdrCn ? (
                <div className="on-def-imgbox">
                  <img src={captureImg2} alt="처리절차 이미지" />
                </div>
              ) : (
                '-'
              )}
            </dd>
            <dt>심사평가내용</dt>
            <dd><span dangerouslySetInnerHTML={{ __html: item.srngEvlCn || '-' }}/></dd>
          </dl>
        </div>

        <div className="page-title-wrap on-btmline" data-type="responsive">
          <h3 className="h-tit3">문의처</h3>
        </div>
        <div className="def-list-wrap">
          <dl className="def-list">
            <dt>문의처</dt>
            <dd><span dangerouslySetInnerHTML={{ __html: item.sprtBizInqplCn || '-' }}/></dd>
          </dl>
        </div>

        {/*todo 상세검색 주석처리 ( 시연으로 인한 임시주석 )*/}
        {/*<div className="page-title-wrap has-badge-type" data-type="responsive">
          <h3 className="h-tit3">진행중인 사업공고</h3>
          <span className="krds-badge bg-primary number">
            {item.announceCount || 0}건
          </span>
        </div>
*/}
        <div className="onboard-btm-btngroup">
          <div>
            <button
              type="button"
              className="krds-btn tertiary xlarge"
              onClick={handleGoToList}
            >
                목록
            </button>
          </div>
          <div>
            {/*todo 상세검색 주석처리 ( 시연으로 인한 임시주석 )*/}
            {/*<button type="button" className="krds-btn secondary xlarge">
              <i className="svg-icon ico-faq"></i>
                AI 상세 상담
            </button>
            <button type="button" className="krds-btn tertiary xlarge">
              <i className="svg-icon ico-like"></i>
                관심공고
            </button>*/}
            <button
              type="button"
              className="krds-btn tertiary xlarge"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('링크가 복사되었습니다.');
              }}
            >
              <i className="svg-icon ico-copy"></i>
                링크복사
            </button>
          </div>
        </div>

        {/*<div className="assess-question-wrap">
          <div className="assess-qu">이 페이지에 만족하시나요?</div>
          <div className="assess-an">
            <div className="krds-form-chip large">
              <input
                type="radio"
                className="radio"
                name="rdo_chip_size2"
                id="rdo_chip_lg2-1"
                defaultChecked
              />
              <label className="krds-form-chip-outline yes" htmlFor="rdo_chip_lg2-1">
                  네
                <i className="svg-icon ico-smile"></i>
              </label>
            </div>
            <div className="krds-form-chip large">
              <input
                type="radio"
                className="radio"
                name="rdo_chip_size2"
                id="rdo_chip_lg2-2"
              />
              <label className="krds-form-chip-outline no" htmlFor="rdo_chip_lg2-2">
                  아니오
                <i className="svg-icon ico-sad"></i>
              </label>
            </div>
          </div>
        </div>*/}
      </div>
    </>
  );
};

export default SprtBizView;
