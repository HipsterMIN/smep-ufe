import { useEffect, useMemo, useState } from 'react';
import { Link, useMatches, useNavigate, useSearchParams } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
// import UI_USR_L_142 from '@pages/policy-info/UI_USR_R_142.jsx';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import Pagination from '@components/ui/Pagination';
import {api as apiClient} from "@lib/apiClient.js";
import {appendListSearchToPath, getNumberSearchParam, getSearchParam, setQueryParam} from "@utils/listNavigation.js";

//import { api as apiClient } from '@lib/apiClient.js';
//import { formatNumberWithCommas } from '@utils/numberUtils.js';
//import { appendListSearchToPath, getNumberSearchParam, getSearchParam, setQueryParam } from '@utils/listNavigation.js';

const BBS_CONFIG = {
    tax: '70',
};

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const UI_USR_L_141 = () => {
    const matches = useMatches();
    const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '';
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'range';
    const isPage141 = tab === 'range';
    const isPage142 = tab === 'tax';
    const [boardDetail, setBoardDetail] = useState(null);
    const navigate = useNavigate();
    const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
    const [postList, setPostList] = useState([]);
    const [searchType, setSearchType] = useState(() => getSearchParam(location.search, 'searchType', 'TITLE'));
    const [searchKeyword, setSearchKeyword] = useState(() => getSearchParam(location.search, 'searchKeyword', ''));
    const [appliedSearchType, setAppliedSearchType] = useState(() => getSearchParam(location.search, 'searchType', 'TITLE'));
    const [appliedSearchKeyword, setAppliedSearchKeyword] = useState(() => getSearchParam(location.search, 'searchKeyword', ''));

    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(() => getNumberSearchParam(location.search, 'size', 10));
    const [currentPage, setCurrentPage] = useState(() => Math.max(0, getNumberSearchParam(location.search, 'page', 1) - 1));
    const sidebarData = getSideNavigationData();
    const depth1Menu = getDepth1Parent();



    const buildListSearchParams = () => {
        const params = new URLSearchParams();
        params.set("tab", tab);
        setQueryParam(params, 'page', currentPage + 1, 1);
        setQueryParam(params, 'size', pageSize, 10);
        setQueryParam(params, 'searchType', appliedSearchType, 'TITLE');
        setQueryParam(params, 'searchKeyword', appliedSearchKeyword);
        return params;
    };

    const bbsNo = useMemo(() => {
        return BBS_CONFIG[tab] || null;
    }, [tab]);


    useEffect(() => {
        window.scrollTo(0, 0);
        let isMounted = true;

        const fetchBoardDetail = async () => {
            if (bbsNo == null || bbsNo === '') {
                if (!isMounted) return;
                setBoardDetail(null);
                return;
            }

            try {
                const response = await apiClient.get(`/api/v1/board/${bbsNo}`);
                if (!isMounted) return;
                setBoardDetail(response?.data ?? null);
            } catch (error) {
                if (!isMounted) return;
                setBoardDetail(null);
            }
        };

        fetchBoardDetail();

        return () => {
            isMounted = false;
        };
    }, [bbsNo]);

    useEffect(() => {
        let isMounted = true;

        const fetchPostList = async () => {
            if (!bbsNo) return;

            try {
                if (!isMounted) return;
                setLoading(true);

                const params = new URLSearchParams({
                    page: String(currentPage + 1),
                    size: String(pageSize),
                });

                if (appliedSearchKeyword.trim()) {
                    params.append('searchType', appliedSearchType);
                    params.append('searchKeyword', appliedSearchKeyword.trim());
                }

                setSearchParams(buildListSearchParams(), { replace: true });

                const response = await apiClient.get(`/api/v1/board/${bbsNo}/posts/list?${params.toString()}`);
                const data = response?.data || {};

                if (!isMounted) return;
                setPostList(Array.isArray(data?.content) ? data.content : []);
                setTotalElements(data?.totalElements || 0);
                setTotalPages(data?.totalPages || 0);
            } catch (error) {
                if (!isMounted) return;
                setPostList([]);
                setTotalElements(0);
                setTotalPages(0);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPostList();

        return () => {
            isMounted = false;
        };
    }, [bbsNo, currentPage, pageSize, appliedSearchType, appliedSearchKeyword, tab]);


    const handleSearch = () => {
        setAppliedSearchType(searchType);
        setAppliedSearchKeyword(searchKeyword);
        setCurrentPage(0);
    };

    const isExternalUrl = (value) => /^https?:\/\//i.test(String(value || ''));

    const buildPostLink = (item) => {
        const link = String(item?.pstCn || '').trim();
        return link || '#';
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page - 1);
        window.scrollTo(0, 0);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setCurrentPage(0);
    };
    const moveToDetail = (pstNo) => {
        if (pstNo == null) return;
        const currentBbsNo = BBS_CONFIG[tab];
        const search = buildListSearchParams();

        if (currentBbsNo && !search.has('bbsNo')) {
            search.set('bbsNo', currentBbsNo);
        }

        navigate(appendListSearchToPath(`${pstNo}`, search.toString()));
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
          <h2 className="h-tit">{pageTitle}</h2>
        </div>

        <div className="PrintArea">
            <div className="krds-tab-area" style={{ marginBottom: "2rem" }}>
                <div className="tab line full">
                    <ul role="tablist" className="krds-tab">
                        <li role="tab" aria-selected={tab === 'range'} className={tab === 'range' ? "active" : ""}>
                            <Link className="btn-tab" to="?tab=range">중소기업범위기준</Link>
                        </li>
                        <li role="tab" aria-selected={tab === 'tax'} className={tab === 'tax' ? "active" : ""}>
                            <Link className="btn-tab" to="?tab=tax&bbsNo=70">중소기업·조세지원 해설</Link>
                        </li>
                    </ul>
                </div>
            </div>
            {isPage141 && (
                <>
                    <div className="info-box">
                        <h5 className="tit"><i className="svg-icon ico-check-tit"></i>중소기업범위기준</h5>
                        <div className="txt">
                            <i className="svg-icon pure circle-check"></i>
                            <p>2026년 개정판 알기쉽게 풀어 쓴 중소기업 범위해설</p>
                        </div>
                        <div className="btn-box gap-4">
                        <a href="https://www.mss.go.kr/common/files/Download.do?cfIdx=CF01000282&cfGroup=COMMON&cfRename=06c9f4c6-d4df-4c5f-af22-bc82eb7f3dd8.pdf" className="krds-btn primary" target="_blank" title="2026년 개정판 알기쉽게 풀어 쓴 중소기업 범위해설 파일 내려받기">내려받기<span className="svg-icon ico-down"></span></a>
                        <a href="https://www.mss.go.kr/site/docView.do?cfIdx=CF01000282&cfGroup=COMMON&cfRename=06c9f4c6-d4df-4c5f-af22-bc82eb7f3dd8.pdf" className="krds-btn" target="_blank" title="2026년 개정판 알기쉽게 풀어 쓴 중소기업 범위해설 새창열림">바로가기<span className="svg-icon ico-go"></span></a>
                    </div>
                </div>
                <ul className="info-list">
                    <li>
                        <p className="info-title">중소기업 범위기준(중소기업기본법 제2조 및 같은 법 시행령 제3조)</p>
                        <p>중소기업 기준은 영리기업 또는 비영리 사회적기업을 대상으로 적용하며, 규모기준과 독립성기준을 모두 충족해야 중소기업에 해당합니다.</p>
                    </li>
                    <li>
                        <p className="info-title">업종별 규모기준</p>
                        <ul className="krds-info-list decimal">
                            <li>주된 업종의 3년 평균 매출액 기준을 충족할 것</li>
                            <li>&lt;주된 업종별 평균 매출액 기준 (중소기업기본법 시행령 별표1,3)&gt;</li>
                        </ul>
                        <div className="krds-table-wrap" style={{marginTop: "3rem"}}>
                            <table className="tbl col data border">
                                <caption>
                                    중소기업 범위기준 - 주된 업종별 평균 매출액 기준 표입니다.
                                </caption>
                                <colgroup>
                                <col style={{width: "13%"}} />
                                <col />
                                <col style={{width: "11%"}} />
                                <col style={{width: "18%"}} />
                                <col style={{width: "18%"}} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th colSpan="2" scope="col">해당 기업의 주된 업종</th>
                                        <th scope="col">분류부호</th>
                                        <th scope="col">중소기업(평균매출액)</th>
                                        <th scope="col">소기업(평균매출액)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-left" rowSpan="13">제조업<br />(13개업종)</td>
                                        <td className="text-left">펄프, 종이 및 종이제품 제조업</td>
                                        <td className="border-right">C17</td>
                                        <td rowSpan="3">1,800억원 이하</td>
                                        <td>80억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">1차 금속 제조업</td>
                                        <td className="border-right">C24</td>
                                        <td>140억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">전기장비 제조업</td>
                                        <td className="border-right">C28</td>
                                        <td>120억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">의복, 의복 액세서리 및 모피제품 제조업</td>
                                        <td className="border-right">C14</td>
                                        <td rowSpan="3">1,500억원 이하</td>
                                        <td rowSpan="3">120억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">가죽, 가방 및 신발 제조업</td>
                                        <td className="border-right">C15</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">가구 제조업</td>
                                        <td className="border-right">C32</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">식료품 제조업</td>
                                        <td className="border-right">C10</td>
                                        <td rowSpan="9">1,200억원 이하</td>
                                        <td rowSpan="2">120억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">화학물질 및 화학제품 제조업(의약품 제조업은 제외한다)</td>
                                        <td className="border-right">C20</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">고무 및 플라스틱제품 제조업</td>
                                        <td className="border-right">C22</td>
                                        <td>80억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">금속가공제품 제조업(기계 및 가구 제조업은 제외한다)</td>
                                        <td className="border-right">C25</td>
                                        <td rowSpan="3">120억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">기타 기계 및 장비 제조업</td>
                                        <td className="border-right">C29</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">자동차 및 트레일러 제조업</td>
                                        <td className="border-right">C30</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">기타 운송장비 제조업</td>
                                        <td className="border-right">C31</td>
                                        <td rowSpan="2">80억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">건설업</td>
                                        <td className="border-right">F</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">도매 및 소매업</td>
                                        <td className="border-right">G</td>
                                        <td>60억원</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">농업, 임업 및 어업</td>
                                        <td className="border-right">A</td>
                                        <td rowSpan="12">1,000억원 이하</td>
                                        <td rowSpan="5">80억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">광업</td>
                                        <td className="border-right">B</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" rowSpan="6">제조업<br />(6개 업종)</td>
                                        <td className="text-left">담배 제조업</td>
                                        <td className="border-right">C12</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">섬유제품 제조업(의복 제조업은 제외한다)</td>
                                        <td className="border-right">C13</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">목재 및 나무제품 제조업(가구 제조업은 제외한다)</td>
                                        <td className="border-right">C16</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">코크스, 연탄 및 석유정제품 제조업</td>
                                        <td className="border-right">C19</td>
                                        <td>140억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">전자부품, 컴퓨터, 영상, 음향 및 통신장비 제조업</td>
                                        <td className="border-right">C26</td>
                                        <td>120억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">기타 제품 제조업</td>
                                        <td className="border-right">C33</td>
                                        <td>80억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">전기, 가스, 증기 및 공기조절 공급업</td>
                                        <td className="border-right">D</td>
                                        <td rowSpan="2">120억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">수도업</td>
                                        <td className="border-right">E36</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">운수 및 창고업</td>
                                        <td className="border-right">H</td>
                                        <td>100억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">정보통신업</td>
                                        <td className="border-right">J</td>
                                        <td>50억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" rowSpan="5">제조업<br />(5개 업종)</td>
                                        <td className="text-left">음료 제조업</td>
                                        <td className="border-right">C11</td>
                                        <td rowSpan="7">800억원이하</td>
                                        <td>120억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">인쇄 및 기록매체 복제업</td>
                                        <td className="border-right">C18</td>
                                        <td>80억원이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">의료용 물질 및 의약품 제조업</td>
                                        <td className="border-right">C21</td>
                                        <td rowSpan="2">120억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">비금속 광물제품 제조업</td>
                                        <td className="border-right">C23</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left">의료, 정밀, 광학기기 및 시계 제조업</td>
                                        <td className="border-right">C27</td>
                                        <td>80억원이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">수도, 하수 및 폐기물 처리, 원료 재생업 (수도업은 제외한다)</td>
                                        <td className="border-right">E<br />(E36 제외)</td>
                                        <td>40억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">사업시설 관리, 사업 지원 및 임대 서비스업(임대업은 제외한다)</td>
                                        <td className="border-right">N<br />(N76 제외)</td>
                                        <td>30억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">산업용 기계 및 장비 수리업</td>
                                        <td className="border-right">C34</td>
                                        <td rowSpan="5">600억원이하</td>
                                        <td>15억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">전문, 과학 및 기술 서비스업</td>
                                        <td className="border-right">M</td>
                                        <td>30억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">보건업 및 사회복지 서비스업</td>
                                        <td className="border-right">Q</td>
                                        <td>15억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">예술, 스포츠 및 여가관련 서비스업</td>
                                        <td className="border-right">R</td>
                                        <td>30억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">수리 및 기타 개인 서비스업(협회 및 단체는 제외한다)</td>
                                        <td className="border-right">S<br />(S94 제외)</td>
                                        <td>15억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">숙박 및 음식점업</td>
                                        <td className="border-right">I</td>
                                        <td rowSpan="5">400억원 이하</td>
                                        <td>15억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">금융 및 보험업</td>
                                        <td className="border-right">K</td>
                                        <td>100억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">부동산업</td>
                                        <td className="border-right">L</td>
                                        <td>40억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">임대업(부동산 임대업은 제외한다)</td>
                                        <td className="border-right">N76</td>
                                        <td>30억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">교육 서비스업</td>
                                        <td className="border-right">P</td>
                                        <td>15억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="5">※비고 : 아래의 경우에는 예외적으로 별도의 기준에 따름</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">자동차용 신품 의자 제조업</td>
                                        <td className="border-right">C30393</td>
                                        <td rowSpan="3">1,500억원 이하</td>
                                        <td rowSpan="3">120억원 이하</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">철도 차량 부품 및 관련 장치물 제조업 중 <br />철도 차량용 의자 제조업</td>
                                        <td className="border-right">C31202</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left" colSpan="2">항공기용 부품제조업 중 항공기용 의자 제조업</td>
                                        <td className="border-right">C31322</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </li>
                    <li>
                        <p className="info-title">상한기준</p>
                        <p>업종에 관계없이 자산총액 5,000억 원 미만일 것</p>
                    </li>
                    <li>
                        <p className="info-title">독립성기준(계열관계에 따른 판단기준)</p>
                        <ul className="krds-info-list decimal">
                            <li>
                                다음 3가지 중 어느 하나에도 해당하지 아니할 것
                                <ul className="krds-info-list custom number">
                                    <li data-icon="1">공시대상기업집단에 속하는 회사</li>
                                    <li data-icon="2">자산총액 5,000억 원 이상인 법인(외국법인 포함,비영리법인 등 제외)이 주식등의 30% 이상을 직접적 또는 간접적으로 소유하면서 최다출자자인 기업</li>
                                    <li data-icon="3">관계기업에 속하는 기업의 경우에는 출자 비율에 해당하는 평균매출액등을 합산하여 업종별 규모기준을 미충족하는 기업</li>
                                </ul>
                                <ul className="krds-info-list custom">
                                    <li data-icon="※">관계기업 : 외부감사 대상이 되는 기업이 기업 간의 주식등 출자로 지배·종속 관계에 있는 기업의 집단</li>
                                    <li data-icon="※">단, 비영리 사회적기업 및 협동조합(연합회)은 관계기업제도 적용하지 않음</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <p className="info-title">2015년 이후 달라진 점</p>
                        <ul className="krds-info-list decimal">
                            <li>
                                다음 3가지 중 어느 하나에도 해당하지 아니할 것
                                <ul className="krds-info-list custom number">
                                    <li data-icon="1">업종별 규모기준 : (종전) 상시 근로자 수, 자본금/매출액 중 하나만 충족 → (개정) 매출액 단일 기준</li>
                                    <li data-icon="2">
                                        대상확대
                                        <ul className="krds-info-list dash">
                                            <li>중소기업 범위에 사회적 협동조합 및 사회적협동조합연합회, 이종(異種)협동조합연합회, 중소기업협동조합 추가 (중소기업기본법 제2조제1항제3호)</li>
                                            <li>자산총액 5천억원 이상인 비영리법인이 최대출자자인 기업의 경우에도 요건에 충족하면 중소기업에 포함 (중소기업기본법 시행령 제3조제1항제2호나목)</li>
                                        </ul>
                                    </li>
                                    <li data-icon="3">
                                        유예 제외 조항에서 삭제(유예가능으로 변경)
                                        <ul className="krds-info-list dash">
                                            <li>자산총액이 5천억원 이상인 법인이 최대출자자로서 중소기업의 주식 등의 100분의 30 이상을 인수한 경우에도 3년간 피인수기업을 중소기업에 포함(중소기업기본법 시행령 제9조제2호)</li>
                                            <li>중소기업이 유예기간에 있는 중소기업을 흡수 합병한 경우 잔여 유예기간 인정 (중소기업기본법 시행령 제9조 제1호)</li>
                                        </ul>
                                    </li>
                                    <li data-icon="4">
                                        관계기업 판단시점
                                        <ul className="krds-info-list dash">
                                            <li>관계기업으로 인해 중소기업에서 제외된 기업 중, 직전 사업연도 말일 이후 주식 등의 소유현황 변경으로 중소기업에 해당하게 된 경우에는 주식 등의 소유현황의 변경일을 기준으로 관계기업 여부 판단 (중소기업기본법 시행령 제3조의2제2항제2호)</li>
                                        </ul>
                                    </li>
                                    <li data-icon="5">
                                        공시대상기업집단에 속하는 회사 제외
                                        <ul className="krds-info-list dash">
                                            <li>기존 상호출자제한기업진단에 속하는 회사만 중소기업자에서 제외하였으나, 상호출자제한기업집단 기준이 상향조정됨에 따라 공시대상기업집단에 속하는 회사 제외(중소기업기본법 제2조 단서)</li>
                                        </ul>
                                    </li>
                                    <li data-icon="6">
                                        중소기업 졸업 유예기간 확대
                                        <ul className="krds-info-list dash">
                                            <li>기존 3년간 적용되던 중소기업 졸업 유예기간을 5년으로 확대 (중소기업기본법 제2조제3항)</li>
                                        </ul>
                                    </li>
                                    <li data-icon="7">
                                        중소기업 업종별 평균매출액 기준 일부 상향
                                        <ul className="krds-info-list dash">
                                            <li>중소기업 44개 업종 중 16개 업종 대상 평균매출액 기준 200~300억원 상향, 소기업 43개 업종 중 12개 업종 대상 평균매출액 기준 5~20억원 상향 (중소기업기본법 시행령 별표1, 별표3)</li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
            </>
            )}

            {isPage142 && (
                <>
                    {/* 검색 영역 */}
                    <div className="search-top-box">
                        <div className="sch-form-wrap">
                            <select
                                className="krds-form-select medium"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                            >
                                <option value="TITLE">제목</option>
                                <option value="CONTENT">내용</option>
                            </select>
                            <div className="sch-input">
                                <input
                                    type="text"
                                    className="krds-input medium"
                                    placeholder="검색어를 입력하세요"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                />
                                <button type="button" className="krds-btn medium icon ico-search" onClick={handleSearch}>
                                    <span className="sr-only">검색</span>
                                    <i className="svg-icon ico-sch"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 목록 상단 */}
                    <div className="search-list-top">
                        <ul className="sch-info" aria-live="polite">
                            <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>개</li>
                        </ul>
                        <ul className="sch-sort">
                            <li>
                                <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
                                <select
                                    className="krds-form-select-sort"
                                    id="search_result_count"
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                >
                                    <option value={10}>10개</option>
                                    <option value={20}>20개</option>
                                    <option value={30}>30개</option>
                                </select>
                            </li>
                        </ul>
                    </div>

                    {/* 테이블 영역 */}
                    <div className="krds-table-wrap">
                        <table className="tbl col data t-block">
                            <caption>중소기업·조세지원 해설 표. 번호, 제목, 출처, 등록일, 조회수 정보가 제공됨.</caption>
                            <colgroup>
                                <col style={{width: '10px'}}/>
                                <col style={{width: '340px'}}/>
                                <col style={{width: '15%'}}/>
                                <col style={{width: '80px'}}/>
                                <col style={{width: '10px'}}/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th scope="col" className="ac">번호</th>
                                <th scope="col" className="ac">제목</th>
                                <th scope="col" className="ac">출처</th>
                                {/*<th scope="col" className="ac">첨부</th>*/}
                                <th scope="col" className="ac">등록일</th>
                                <th scope="col" className="ac">조회</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="ac">로딩 중입니다.</td></tr>
                            ) : postList.length === 0 ? (
                                <tr><td colSpan={5} className="ac">조회된 데이터가 없습니다.</td></tr>
                            ) : (
                                postList.map((item, index) => {
                                const postLink = buildPostLink(item);
                                const external = isExternalUrl(postLink);
                                return(
                                    <tr key={item.pstNo}>
                                        <td className="ac">{totalElements - (currentPage * pageSize + index)}</td>
                                        <td className="al">
                                            <a href={postLink} target={external ? '_blank' : undefined}
                                               rel={external ? 'noreferrer' : undefined} onClick={(e) => { e.preventDefault(); moveToDetail(item.pstNo); }}>
                                                {item.pstTtl}
                                            </a>
                                        </td>
                                        <td className="ac">{item?.pstSrcCn || '-'}</td>
                                        {/*<td className="ac">*/}
                                        {/*    {item.hasFile && <i className="svg-icon ico-file"></i>}*/}
                                        {/*</td>*/}
                                        <td className="ac">{formatDate(item?.pstRegDt ?? item?.regDt)}</td>
                                        <td className="ac">{item.inqCnt}</td>
                                    </tr>
                            );
                            })
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* 페이징 */}
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage + 1}
                        onPageChange={handlePageChange}
                        syncUrl
                    />
                </>
            )}
		</div>
      </div>
    </>
  );
};

export default UI_USR_L_141;
