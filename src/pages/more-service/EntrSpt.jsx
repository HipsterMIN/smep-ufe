import React, { useEffect, useRef, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import Tab from '@components/ui/Tab';
import { api as apiClient, apiBaseUrl } from '@lib/apiClient.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { useNavigate } from 'react-router-dom';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import YouthAwardSection from '@components/entrSpt/YouthAward/YouthAwardSection.jsx';
import EntrepreneurshipAwardSection from '@components/entrSpt/EntreContest/EntrepreneurshipAwardSection.jsx';
import EntrepreneurshipContestSection
  from '@components/entrSpt/EntrepreneurshipContest/EntrepreneurshipContestSection.jsx';

const NOTICE_BBS_NO = '15';
const PRESS_BBS_NO = '21';
const NOTICE_PAGE_SIZE_OPTIONS = [20, 30, 40];
const PUBLISH_PAGE_SIZE_OPTIONS = [12, 24, 36];

const createBoardTabState = () => ({
  boardDetail: null,
  searchType: 'TITLE',
  searchKeyword: '',
  appliedSearchType: 'TITLE',
  appliedSearchKeyword: '',
  postList: [],
  loading: false,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 20,
});

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const normalized = String(dateString).trim();
  const digits = normalized.replace(/\D/g, '');

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const stripHtmlTags = (value) => {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, '').trim();
};

const isExternalUrl = (value) => /^https?:\/\//i.test(String(value || ''));

const buildPostLink = (item) => {
  const link = String(item?.pstCn || '').trim();
  return link || '#';
};

const buildAttachmentDownloadUrl = (item) => {
  const firstAttachment = Array.isArray(item?.atchFiles) ? item.atchFiles[0] : null;
  const atchFileId = String(
    firstAttachment?.atchFileId ?? item?.atchFileId ?? '',
  ).trim();
  const atchFileSn = firstAttachment?.atchFileSn ?? item?.atchFileSn;

  if (!atchFileId || atchFileSn === null || atchFileSn === undefined || atchFileSn === '') {
    return '';
  }

  return `${apiBaseUrl}/api/v1/files/download/${encodeURIComponent(atchFileId)}/${encodeURIComponent(
    String(atchFileSn),
  )}`;
};

const getDisplayNumber = (boardState, index) => {
  const number =
    boardState.totalElements - boardState.currentPage * boardState.pageSize - index;
  return number > 0 ? number : index + 1;
};


const EntrSpt = () => {
  const navigate = useNavigate();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const tabData = useRef(['공지사항', '언론보도', '청년기업인상', '기업가정신유공자', <>기업가정신교육<br />우수사례 경진대회</>]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [noticeBoard, setNoticeBoard] = useState(() => createBoardTabState());
  const [pressBoard, setPressBoard] = useState(() => ({
    ...createBoardTabState(),
    pageSize: 12,
  }));

  useEffect(() => {
    let isMounted = true;

    const fetchBoardDetail = async (bbsNo, setBoardState) => {
      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}`);
        if (!isMounted) return;
        setBoardState((prev) => ({
          ...prev,
          boardDetail: response?.data ?? null,
        }));
      } catch (error) {
        if (!isMounted) return;
        setBoardState((prev) => ({
          ...prev,
          boardDetail: null,
        }));
      }
    };

    fetchBoardDetail(NOTICE_BBS_NO, setNoticeBoard);
    fetchBoardDetail(PRESS_BBS_NO, setPressBoard);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchNoticePosts = async () => {
      try {
        if (!isMounted) return;
        setNoticeBoard((prev) => ({ ...prev, loading: true }));

        const params = new URLSearchParams({
          page: String(noticeBoard.currentPage + 1),
          size: String(noticeBoard.pageSize),
        });

        if (noticeBoard.appliedSearchKeyword.trim()) {
          params.append('searchType', noticeBoard.appliedSearchType);
          params.append('searchKeyword', noticeBoard.appliedSearchKeyword.trim());
        }

        const response = await apiClient.get(
          `/api/v1/board/${NOTICE_BBS_NO}/posts/list?${params.toString()}`,
        );
        const data = response?.data ?? {};

        if (!isMounted) return;
        setNoticeBoard((prev) => ({
          ...prev,
          postList: Array.isArray(data?.content) ? data.content : [],
          totalElements: data?.totalElements || 0,
          totalPages: data?.totalPages || 0,
          loading: false,
        }));
      } catch (error) {
        if (!isMounted) return;
        setNoticeBoard((prev) => ({
          ...prev,
          postList: [],
          totalElements: 0,
          totalPages: 0,
          loading: false,
        }));
      }
    };

    fetchNoticePosts();

    return () => {
      isMounted = false;
    };
  }, [
    noticeBoard.currentPage,
    noticeBoard.pageSize,
    noticeBoard.appliedSearchType,
    noticeBoard.appliedSearchKeyword,
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchPressPosts = async () => {
      try {
        if (!isMounted) return;
        setPressBoard((prev) => ({ ...prev, loading: true }));

        const params = new URLSearchParams({
          page: String(pressBoard.currentPage + 1),
          size: String(pressBoard.pageSize),
        });

        if (pressBoard.appliedSearchKeyword.trim()) {
          params.append('searchType', pressBoard.appliedSearchType);
          params.append('searchKeyword', pressBoard.appliedSearchKeyword.trim());
        }

        const response = await apiClient.get(
          `/api/v1/board/${PRESS_BBS_NO}/posts/list?${params.toString()}`,
        );
        const data = response?.data ?? {};

        if (!isMounted) return;
        setPressBoard((prev) => ({
          ...prev,
          postList: Array.isArray(data?.content) ? data.content : [],
          totalElements: data?.totalElements || 0,
          totalPages: data?.totalPages || 0,
          loading: false,
        }));
      } catch (error) {
        if (!isMounted) return;
        setPressBoard((prev) => ({
          ...prev,
          postList: [],
          totalElements: 0,
          totalPages: 0,
          loading: false,
        }));
      }
    };

    fetchPressPosts();

    return () => {
      isMounted = false;
    };
  }, [
    pressBoard.currentPage,
    pressBoard.pageSize,
    pressBoard.appliedSearchType,
    pressBoard.appliedSearchKeyword,
  ]);

  const handleNoticeSearch = () => {
    setNoticeBoard((prev) => ({
      ...prev,
      appliedSearchType: prev.searchType,
      appliedSearchKeyword: prev.searchKeyword,
      currentPage: 0,
    }));
  };

  const handlePressSearch = () => {
    setPressBoard((prev) => ({
      ...prev,
      appliedSearchType: prev.searchType,
      appliedSearchKeyword: prev.searchKeyword,
      currentPage: 0,
    }));
  };

  const handleNoticeSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleNoticeSearch();
    }
  };

  const handlePressSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handlePressSearch();
    }
  };

  const handleNoticePageChange = (page) => {
    setNoticeBoard((prev) => ({
      ...prev,
      currentPage: page - 1,
    }));
    window.scrollTo(0, 0);
  };

  const handlePressPageChange = (page) => {
    setPressBoard((prev) => ({
      ...prev,
      currentPage: page - 1,
    }));
    window.scrollTo(0, 0);
  };

  const handleNoticePageSizeChange = (event) => {
    setNoticeBoard((prev) => ({
      ...prev,
      pageSize: Number(event.target.value),
      currentPage: 0,
    }));
  };

  const handlePressPageSizeChange = (event) => {
    setPressBoard((prev) => ({
      ...prev,
      pageSize: Number(event.target.value),
      currentPage: 0,
    }));
  };

  const moveToDetail = (pstNo, bbsNo) => {
    const target = String(pstNo ?? '').trim();
    const boardNo = String(bbsNo ?? '').trim();
    if (!target || !boardNo) return;
    navigate(`${target}?bbsNo=${encodeURIComponent(boardNo)}`);
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">기업가정신</h2>
        </div>

        <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>

        <div className="tab-conts-wrap mt-48">
          <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">공지사항</h3>
            </div>

            <div className="search-top-box mt-22">
              <div className="sch-form-wrap">
                <select
                  className="krds-form-select medium"
                  value={noticeBoard.searchType}
                  onChange={(event) =>
                    setNoticeBoard((prev) => ({
                      ...prev,
                      searchType: event.target.value,
                    }))
                  }
                >
                  <option value="TITLE">제목</option>
                  <option value="CONTENT">내용</option>
                </select>
                <div className="sch-input">
                  <input
                    type="text"
                    className="krds-input medium"
                    placeholder="검색어를 입력하세요"
                    title="검색어 입력"
                    value={noticeBoard.searchKeyword}
                    onChange={(event) =>
                      setNoticeBoard((prev) => ({
                        ...prev,
                        searchKeyword: event.target.value,
                      }))
                    }
                    onKeyDown={handleNoticeSearchKeyDown}
                  />
                  <button
                    type="button"
                    className="krds-btn medium icon ico-search"
                    onClick={handleNoticeSearch}
                  >
                    <span className="sr-only">검색</span>
                    <i className="svg-icon ico-sch"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="search-list-top">
              <ul className="sch-info" aria-live="polite">
                <li>
                  검색 결과 <span className="point">{formatNumberWithCommas(noticeBoard.totalElements || 0)}</span>건
                </li>
              </ul>
              <ul className="sch-sort">
                <li>
                  <strong className="sort-label">
                    <label htmlFor="notice_result_count">목록 표시 개수</label>
                  </strong>
                  <select
                    className="krds-form-select-sort"
                    id="notice_result_count"
                    value={noticeBoard.pageSize}
                    onChange={handleNoticePageSizeChange}
                  >
                    {NOTICE_PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}개
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
            </div>

            <div className="krds-table-wrap">
              <table className="tbl col data">
                <caption>
                  공지사항 목록의 번호, 제목, 작성자, 작성일, 조회수, 첨부파일 정보를 제공합니다.
                </caption>
                <colgroup>
                  <col style={{ width: '5%' }}/>
                  <col style={{ width: '43.6%' }}/>
                  <col/>
                  <col/>
                  <col/>
                  <col style={{ width: '5%' }}/>
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" className="ac">번호</th>
                    <th scope="col" className="ac">제목</th>
                    <th scope="col" className="ac">작성자</th>
                    <th scope="col" className="ac">작성일</th>
                    <th scope="col" className="ac">조회수</th>
                    <th scope="col" className="ac">첨부파일</th>
                  </tr>
                </thead>
                <tbody>
                  {noticeBoard.loading ? (
                    <tr>
                      <td className="ac" colSpan={6}>
                        <span>로딩 중입니다.</span>
                      </td>
                    </tr>
                  ) : noticeBoard.postList.length === 0 ? (
                    <tr>
                      <td className="ac" colSpan={6}>
                        <span>조회된 데이터가 없습니다.</span>
                      </td>
                    </tr>
                  ) : (
                    noticeBoard.postList.map((item, index) => {
                      const attachmentUrl = buildAttachmentDownloadUrl(item);
                      return (
                        <tr key={item?.pstNo ?? `${item?.pstTtl ?? 'notice'}-${index}`}>
                          <th scope="row" className="ac">
                            {item?.upendPstgYn === 'Y' ? (
                              <span className="krds-badge bg-light-primary">공지</span>
                            ) : (
                              <span>{getDisplayNumber(noticeBoard, index)}</span>
                            )}
                          </th>
                          <td>
                            <a
                              className="onellipsis-1"
                              style={{ cursor: 'pointer' }}
                              onClick={(event) => {
                                event.preventDefault();
                                moveToDetail(item?.pstNo, NOTICE_BBS_NO);
                              }}
                            >
                              <span>{stripHtmlTags(item?.pstTtl) || '-'}</span>
                            </a>
                          </td>
                          <td className="ac"><span>{item?.pstRgtrNm || item?.pstMdfrNm || '-'}</span></td>
                          <td className="ac"><span>{formatDate(item?.pstRegDt ?? item?.regDt)}</span></td>
                          <td className="ac"><span>{item?.inqCnt ?? 0}</span></td>
                          <td className="ac">
                            {attachmentUrl ? (
                              <a href={attachmentUrl}>
                                <span className="sr-only">첨부파일 다운로드</span>
                                <i className="svg-icon ico-file"></i>
                              </a>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!noticeBoard.loading && noticeBoard.totalPages > 0 && (
              <Pagination
                totalPages={noticeBoard.totalPages}
                currentPage={noticeBoard.currentPage + 1}
                onPageChange={handleNoticePageChange}
              />
            )}
          </section>

          <section className={`tab-conts ${activeTabIndex === 1 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">언론보도</h3>
            </div>

            <div className="search-top-box mt-22">
              <div className="sch-form-wrap">
                <div className="sch-input">
                  <input
                    type="text"
                    className="krds-input medium"
                    placeholder="검색어를 입력하세요"
                    title="검색어 입력"
                    value={pressBoard.searchKeyword}
                    onChange={(event) =>
                      setPressBoard((prev) => ({
                        ...prev,
                        searchKeyword: event.target.value,
                      }))
                    }
                    onKeyDown={handlePressSearchKeyDown}
                  />
                  <button
                    type="button"
                    className="krds-btn medium icon ico-search"
                    onClick={handlePressSearch}
                  >
                    <span className="sr-only">검색</span>
                    <i className="svg-icon ico-sch"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="search-list-top">
              <ul className="sch-info" aria-live="polite">
                <li>
                  검색 결과 <span className="point">{formatNumberWithCommas(pressBoard.totalElements || 0)}</span>건
                </li>
              </ul>
              <ul className="sch-sort">
                <li>
                  <strong className="sort-label">
                    <label htmlFor="press_result_count">목록 표시 개수</label>
                  </strong>
                  <select
                    className="krds-form-select-sort"
                    id="press_result_count"
                    value={pressBoard.pageSize}
                    onChange={handlePressPageSizeChange}
                  >
                    {PUBLISH_PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}개
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
            </div>

            <ul className="krds-structured-list small">
              {pressBoard.loading ? (
                <li className="structured-item">
                  <div className="card-body">
                    <div className="c-text">
                      <p className="c-tit no-icon">
                        <span className="span onellipsis-2">로딩 중입니다.</span>
                      </p>
                    </div>
                  </div>
                </li>
              ) : pressBoard.postList.length === 0 ? (
                <li className="structured-item">
                  <div className="card-body">
                    <div className="c-text">
                      <p className="c-tit no-icon">
                        <span className="span onellipsis-2">조회된 데이터가 없습니다.</span>
                      </p>
                    </div>
                  </div>
                </li>
              ) : (
                pressBoard.postList.map((item, index) => {
                  const postLink = buildPostLink(item);
                  const external = isExternalUrl(postLink);
                  return (
                    <li className="structured-item" key={item?.pstNo ?? `${item?.pstTtl ?? 'press'}-${index}`}>
                      <div className="card-body">
                        <div className="c-text">
                          <p className="c-tit no-icon">
                            <span className="span onellipsis-2">
                              {stripHtmlTags(item?.pstTtl) || '-'}
                            </span>
                          </p>
                          <span>{formatDate(item?.pstRegDt ?? item?.regDt)}</span>
                        </div>
                      </div>
                      <div className="bottom-link">
                        <a
                          href={postLink}
                          className={`krds-btn medium text ${postLink === '#' ? 'disabled' : ''}`}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noreferrer' : undefined}
                          title="새 창으로 이동"
                          onClick={(event) => {
                            if (postLink === '#') {
                              event.preventDefault();
                            }
                          }}
                        >
                              바로가기<i className="svg-icon ico-link"></i>
                        </a>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>

            {!pressBoard.loading && pressBoard.totalPages > 0 && (
              <Pagination
                totalPages={pressBoard.totalPages}
                currentPage={pressBoard.currentPage + 1}
                onPageChange={handlePressPageChange}
              />
            )}
          </section>

          {/* 청년기업인상 */}
          <section className={`tab-conts ${activeTabIndex === 2 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">청년기업인상</h3>
            </div>
            <YouthAwardSection/>
          </section>

          {/* 기업가 정신 유공자 */}
          <section className={`tab-conts ${activeTabIndex === 3 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">기업가 정신 유공자</h3>
            </div>
            <EntrepreneurshipAwardSection/>
          </section>

          {/* 기업가정신교육 우수사례 경진대회 */}
          <section className={`tab-conts ${activeTabIndex === 4 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">기업가정신교육 우수사례 경진대회</h3>
            </div>
            <EntrepreneurshipContestSection />
          </section>
        </div>
      </div>
    </>
  );
};

export default EntrSpt;
