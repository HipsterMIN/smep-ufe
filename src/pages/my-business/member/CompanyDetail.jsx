import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

import {
  buildCompanyAddress,
  fetchCorporateMemberCodeOptions,
  fetchCorporateMemberDetail,
  fetchKsicTopLevelOptions,
  formatBusinessRegNo,
  formatCorporationRegNo,
  getCodeLabel,
  getKsicTopLevelLabel,
} from '@/pages/my-business/member/memberUtils.js';
import { formatDateTime, formatPhoneNumber, formatYmd } from '@utils/commonUtils.js';
// 로그인/store 정리 전까지 기업정보 화면은 전달된 회원번호가 없으면 임시 폴백 회원번호로 진입을 보장한다.
const UI_USR_R_450 = () => {
  const navigate = useNavigate();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const [detail, setDetail] = useState(null);
  const [codeOptions, setCodeOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  useEffect(() => {
    let active = true;

    const loadCorporateMember = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const [memberDetail, commonCodes, ksicTopLevelOptions] = await Promise.all([
          fetchCorporateMemberDetail(apiClient),
          fetchCorporateMemberCodeOptions(),
          fetchKsicTopLevelOptions(apiClient),
        ]);

        if (!active) {
          return;
        }

        setCodeOptions({
          ...commonCodes,
          KSIC_TOP_LEVEL: ksicTopLevelOptions,
        });
        setDetail(memberDetail);
      } catch (error) {
        if (!active) {
          return;
        }
        console.error('기업회원 상세 조회 실패:', error);
        setErrorMessage(error?.message || '기업회원 정보를 불러오지 못했습니다.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCorporateMember();

    return () => {
      active = false;
    };
  }, []);

  const renderValue = (value) => {
    const normalized = String(value ?? '').trim();
    return normalized || '-';
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
          <h2 className="h-tit">기업 기본정보</h2>
        </div>

        {errorMessage && (
          <div className="txt-box">
            <p className="txt-caution">{errorMessage}</p>
          </div>
        )}

        <div className="conts-wrap">
          <h3 className="sec-tit">기본정보</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data tbl-row">
              <caption>기업 기본정보 표. 기업명, 대표자이름, 사업자등록번호, 법인등록번호, 대표전화번호, 대표팩스번호, 대표이메일, 홈페이지주소, 회사주소 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="ac">기업명</th>
                  <td>{loading ? '로딩 중...' : renderValue(detail?.mbrNm)}</td>
                  <th scope="row" className="ac">대표자이름</th>
                  <td>{loading ? '로딩 중...' : renderValue(detail?.rprsvNm)}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">사업자등록번호</th>
                  <td>{loading ? '로딩 중...' : formatBusinessRegNo(detail?.brno)}</td>
                  <th scope="row" className="ac">법인등록번호</th>
                  <td>{loading ? '로딩 중...' : formatCorporationRegNo(detail?.crno)}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">대표전화번호</th>
                  <td>{loading ? '로딩 중...' : formatPhoneNumber(detail?.rprsTelno)}</td>
                  <th scope="row" className="ac">대표팩스번호</th>
                  <td>{loading ? '로딩 중...' : formatPhoneNumber(detail?.rprsFxno)}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">대표이메일</th>
                  <td>{loading ? '로딩 중...' : renderValue(detail?.emlAddr)}</td>
                  <th scope="row" className="ac">홈페이지주소</th>
                  <td>{loading ? '로딩 중...' : renderValue(detail?.hmpgAddr)}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">회사주소</th>
                  <td colSpan="3">
                    {loading ? '로딩 중...' : buildCompanyAddress(detail?.entAddr, detail?.entDaddr)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">상세정보</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data tbl-row">
              <caption>기업 상세정보 표. 기업규모, 설립일, 근로자수, 매출액, 주요사업분야, 산업구분, 소재지, 간단설명, 기업소개, 최종 수정일시 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="ac">기업규모</th>
                  <td>{loading ? '로딩 중...' : getCodeLabel(codeOptions.ENT_SCL_CD, detail?.entSclCd)}</td>
                  <th scope="row" className="ac">설립일</th>
                  <td>{loading ? '로딩 중...' : formatYmd(detail?.fndnYmd)}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">근로자수</th>
                  <td>{loading ? '로딩 중...' : getCodeLabel(codeOptions.WRKR_CNT_CLSF_CD, detail?.wrkrCntClsfCd)}</td>
                  <th scope="row" className="ac">매출액</th>
                  <td>{loading ? '로딩 중...' : getCodeLabel(codeOptions.SLS_AMT_CLSF_CD, detail?.slsAmtClsfCd)}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">주요사업분야</th>
                  <td>{loading ? '로딩 중...' : renderValue(detail?.mainBizFldNm)}</td>
                  <th scope="row" className="ac">산업구분</th>
                  <td>{loading ? '로딩 중...' : getKsicTopLevelLabel(codeOptions.KSIC_TOP_LEVEL, detail?.ksicCd)}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">소재지</th>
                  <td colSpan="3">{loading ? '로딩 중...' : detail?.stdgNm}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">간단설명</th>
                  <td colSpan="3">{loading ? '로딩 중...' : renderValue(detail?.etcExpln)}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">기업소개</th>
                  <td colSpan="3">{loading ? '로딩 중...' : renderValue(detail?.entExpln)}</td>
                </tr>
                <tr>
                  <th scope="row" className="ac">최종 수정일시</th>
                  <td colSpan="3">{loading ? '로딩 중...' : formatDateTime(detail?.mdfcnDt)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="onboard-btm-btngroup bt-0 btn-single">
          <div>
            <button
              type="button"
              className="krds-btn primary xlarge"
              onClick={() => navigate('edit')}
              disabled={loading}
            >
              상세정보 수정
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_R_450;
