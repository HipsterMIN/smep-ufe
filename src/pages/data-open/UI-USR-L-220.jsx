import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply';
import { api as apiClient } from '@lib/apiClient.js'; // API 클라이언트 추가
import ApiKeyForm from './ApiKeyForm';
import ApiKeyDetailView from './ApiKeyDetailView';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { onePassGetAuthCode } from '@utils/keycloakGetAuthCode.js';
const UI_USR_L_220 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const navigate = useNavigate();
  const userInfo = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);

  const isLoggedIn = Boolean(authToken);

  const mbrNo = userInfo?.id;

  const {
    isOpen,
    submitting,
    errorMessage,
    memberInfo,
    openPopup,
    closePopup,
    submitApply,
  } = useApiKeyApply();

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const [isDetailOpen, setIsDetailOpen] = useState(false); // 상세 팝업 제어
  const [selectedDetail, setSelectedDetail] = useState(null); // 선택된 상세 데이터
  // 상태 관리
  const [historyList, setHistoryList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 기본 10개씩 보기
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('latest'); // 'latest': 최신순, 'oldest': 과거순

  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1); // 정렬 변경 시 1페이지로 리셋
  };

  const pagedRows = useMemo(() => {
    // 원본 배열 복사 후 정렬 로직 실행
    const sortedList = [...historyList].sort((a, b) => {
      // 신청일(apiAplyYmd) 기준으로 정렬 (YYYYMMDD 형식 가정)
      if (sortOrder === 'latest') {
        return b.apiAplyYmd.localeCompare(a.apiAplyYmd); // 내림차순
      } else {
        return a.apiAplyYmd.localeCompare(b.apiAplyYmd); // 오름차순
      }
    });

    const startIndex = (currentPage - 1) * pageSize;
    return sortedList.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, historyList, sortOrder]);

  // 1. 실제 데이터 호출 (useEffect)
  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        // MyApiRequestList와 동일한 엔드포인트 사용
        const res = await apiClient.get(`/api/v1/apikey/history/list?mbrNo=${mbrNo}`);
        if (!isMounted) return;
        setHistoryList(res.data || []);
      } catch (error) {
        if (!isMounted) return;
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isLoggedIn && mbrNo) {
      fetchHistory();
    } else {
      setIsLoading(false);
      setHistoryList([]); // 이력 초기화
    }

    return () => {
      isMounted = false;
    };
  }, [mbrNo, isLoggedIn]);

  // 2. 페이징 계산
  const totalElements = historyList.length;
  const totalPages = Math.ceil(totalElements / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleViewDetail = (row) => {
    setSelectedDetail(row); // 행 데이터 저장
    setIsDetailOpen(true);  // 상세 전용 팝업 열기
  };

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      requestLoginForScrap();
      return;
    }
    openPopup(mbrNo); // 로그인 되어 있으면 팝업 열기
  };

  const requestLoginForScrap = () => {
    const moveToLogin = window.confirm('로그인 후 인증키 신청이 가능합니다. 로그인 하시겠습니까?');
    if (moveToLogin) {
      // 로컬로그인 제외로 중기통합회원 이동
      // navigate('/service/login');
      onePassGetAuthCode();
    }
  };
  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap side-conts" data-type="responsive">
          <h2 className="h-tit">인증키 신청</h2>
        </div>

        <p className="guide-txt">
            중소벤처24에서는 중소벤처기업부에서 보유하고 있는 정보 및 서비스를 API를 통해 배포하고 있습니다. <br />
            Open API는 중소벤처기업부 각 기관 및 이를 서비스하고자 하는 일반을 대상으로 배포하고 있습니다.<br />
            * 다만, 해당 인증키는 신청 및 가능여부를 판단하여 제공하고 있습니다.
        </p>

        <div className="tab fill full mt-48">
          <ul>
            <li><Link to="/cs/opndata/UI_USR_L_210" className="btn-tab">API 안내</Link></li>
            <li className="active">
              <Link to="/cs/opndata/UI_USR_L_220" className="btn-tab">
                  인증키 신청<span className="sr-only">현재 페이지</span>
              </Link>
            </li>
            <li><Link to="/cs/opndata/UI_USR_L_230" className="btn-tab">API Q&A</Link></li>
          </ul>
        </div>
        <div className="conts-wrap mt-40">
          <h3 className="sec-tit side-conts">
              인증키 신청
            <button type="button" className="krds-btn secondary small" onClick={() => handleApplyClick(mbrNo)}>
                인증키 신청
            </button>
          </h3>
          <p className="conts-desc">
              중소벤처24의 Open API를 사용하시고자 하시는 기관 및 시스템 담당자께서는 인증키 신청서를 작성하여 인증키 정보를 확인하시거나, 중소벤처24 운영팀에게 문의해 주시면 담당자 확인 후 이메일로 인증키 정보를 보내드립니다.
          </p>
        </div>
        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">인증키 신청 이력</h3>

          <div className="search-list-top">
            <ul className="sch-info" aria-live="polite">
              <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건</li>
            </ul>
            <ul className="sch-sort">
              <li>
                <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
                <div className="w-sort-btn">
                  <button
                    type="button"
                    className={sortOrder === 'latest' ? 'active' : ''}
                    onClick={() => handleSortChange('latest')}
                  >
                      최신순
                    {sortOrder === 'latest' && <span className="sr-only">선택됨</span>}
                  </button>

                  <button
                    type="button"
                    className={sortOrder === 'oldest' ? 'active' : ''}
                    onClick={() => handleSortChange('oldest')}
                  >
                      과거순
                    {sortOrder === 'oldest' && <span className="sr-only">선택됨</span>}
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <div className="krds-table-wrap">
            <table className="tbl col data t-block">
              <caption>인증키 신청 이력 정보. 순번, 소속기관, 시스템명, 신청API, 신청 이메일, 신청일, 사용여부 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '8%' }}/>
                <col style={{ width: '15%' }}/>
                <col style={{ width: '15%' }}/>
                <col style={{ width: '20%' }}/>
                <col style={{ width: '17%' }}/>
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">순번</th>
                  <th scope="col" className="ac">소속기관</th>
                  <th scope="col" className="ac">시스템명</th>
                  <th scope="col" className="ac" >신청API</th>
                  <th scope="col" className="ac">신청 이메일</th>
                  <th scope="col" className="ac">신청일</th>
                  <th scope="col" className="ac">사용여부</th>
                </tr>
              </thead>
              <tbody>
                {!isLoggedIn ? (
                /* 1. 로그인이 되어 있지 않은 경우 */
                  <tr>
                    <td colSpan="7" className="ac">
                        인증키 신청 이력이 없습니다.
                    </td>
                  </tr>
                ) : isLoading ? (
                /* 2. 로그인 상태이고 데이터를 불러오는 중인 경우 */
                  <tr>
                    <td colSpan="7" className="ac">
                        데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                ) : pagedRows.length > 0 ? (
                /* 3. 로그인 상태이고 데이터가 존재하는 경우 */
                  pagedRows.map((row, index) => (
                    <tr key={index}>
                      <th scope="row" className="ac">
                        <span>{totalElements - ((currentPage - 1) * pageSize + index)}</span>
                      </th>
                      <td className="ac"><span>{row.ogdpInstNm}</span></td>
                      <td className="ac"><span>{row.siteNm}</span></td>
                      <td className="ac" onClick={() => handleViewDetail(row)} style={{ cursor: 'pointer' }}>
                        <span
                          className="on-colorblue"
                          style={{
                            textDecoration: 'underline',
                            fontWeight: '500',
                            display: 'inline-block',
                          }}
                        >
                          {row.apiNm}
                        </span>
                      </td>
                      <td className="ac"><span>{row.picEmlAddr}</span></td>
                      <td className="ac">
                        <span>{row.apiAplyYmd?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}</span>
                      </td>
                      <td className="ac"><span>{row.useYn}</span></td>
                    </tr>
                  ))
                ) : (
                /* 4. 로그인 상태이지만 신청 내역이 없는 경우 */
                  <tr>
                    <td colSpan="7" className="ac">
                        인증키 신청 이력이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          syncUrl
        />
      </div>

      <ApiKeyForm
        isOpen={isOpen}
        onClose={closePopup}
        submitting={submitting}
        errorMessage={errorMessage}
        memberInfo={memberInfo}
        mbrNo={mbrNo}
        onSubmit={(formData) => submitApply(mbrNo, formData)}
      />

      {/* 2. 상세 조회 팝업: 별도 상태로 관리 */}
      <ApiKeyDetailView
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        detailData={selectedDetail}
      />
    </>
  );
};

export default UI_USR_L_220;