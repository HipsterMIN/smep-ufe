import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { fetchCorporateManagerContact } from '@/pages/my-business/member/memberUtils.js';

const EMPTY_DISPLAY_TEXT = '-';

const renderDisplayText = (value) => {
  const text = String(value ?? '').trim();
  return text || EMPTY_DISPLAY_TEXT;
};

const resolveCompanyName = ({ currentCompany, companyProfile, cmpNm }) =>
  currentCompany?.companyName ||
  companyProfile?.company_name ||
  companyProfile?.companyName ||
  companyProfile?.cmpNm ||
  cmpNm;

const UI_USR_R_440 = () => {
  const navigate = useNavigate();
  const authToken = useAuthStore((state) => state.token);
  const currentMode = useAuthStore((state) => state.currentMode);
  const currentCompany = useAuthStore((state) => state.currentCompany);
  const companyProfile = useAuthStore((state) => state.companyProfile);
  const cmpNm = useAuthStore((state) => state.cmpNm);
  const logout = useAuthStore((state) => state.logout);
  const [managerContact, setManagerContact] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  // 현재 메뉴 기준으로 사이드바와 depth1 부모 메뉴를 계산한다.
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  // 기업명은 로그인 프로필, 기업관리자는 기존 기업관리자 담당자 API를 원천으로 삼아 정적 테스트 문구를 제거한다.
  const companyName = renderDisplayText(resolveCompanyName({ currentCompany, companyProfile, cmpNm }));
  const companyManagerName = renderDisplayText(managerContact?.mbrNm);

  useEffect(() => {
    if (!authToken || currentMode !== 'CORPORATE') {
      setManagerContact(null);
      return undefined;
    }

    let active = true;

    const loadCorporateManagerContact = async () => {
      try {
        const contact = await fetchCorporateManagerContact(apiClient);
        if (!active) {
          return;
        }
        setManagerContact(contact || null);
      } catch (error) {
        if (!active) {
          return;
        }
        console.error('Failed to load withdrawal corporate manager contact:', error);
        setManagerContact(null);
      }
    };

    loadCorporateManagerContact();

    return () => {
      active = false;
    };
  }, [authToken, currentMode]);

  const handleWithdrawal = async () => {
    if (isWithdrawing) {
      return;
    }

    // 탈퇴는 되돌릴 수 없는 상태 변경이므로 API 호출 전에 사용자 최종 확인을 받는다.
    const confirmed = window.confirm('정말 탈퇴하시겠습니까?');
    if (!confirmed) {
      return;
    }

    setIsWithdrawing(true);

    try {
      // 백엔드는 Q-IM placeholder 성공 후 로컬 탈퇴, refresh token 삭제, 서버 세션 무효화를 순서대로 처리한다.
      await apiClient.post('/api/v1/member/common/me/withdrawal');

      // 프론트 인증 저장소와 세션 스토리지를 정리해 남은 access token이 화면에서 재사용되지 않게 한다.
      logout();

      alert('회원 탈퇴가 완료되었습니다.');
      navigate('/', { replace: true });
    } catch (error) {
      const message = error?.data?.message || error?.message || '회원 탈퇴 처리 중 오류가 발생했습니다.';
      alert(message);
    } finally {
      setIsWithdrawing(false);
    }
  };


  const onOnePassConfig = () => {
    const isSsoLogin = useAuthStore((state) => state.isSsoLogin);

    if(!isSsoLogin) {
      alert('통합회원 로그인 후 이용할 수 있습니다.');
      return;
    }

    // if (!isLogin || !uuid) {
    //   alert('로그인 정보가 올바르지 않거나 UUID를 찾을 수 없습니다.');
    //   return;
    // }

    if(currentMode === 'CORPORATE') {
      const onePassJoinUrl = `https://onepass.smes.go.kr/mypage-business/information?redirect_uri=https://www.smes.go.kr/home/mb/dash/UI_USR_L_510&client_id=smes-prd&uuid=${uuid}`;
      console.log('onOnePassJoin : ', onePassJoinUrl);
      window.location.href = onePassJoinUrl;
    } else {
      const onePassJoinUrl = `https://onepass.smes.go.kr/mypage-member/information?redirect_uri=https://www.smes.go.kr/home/mb/dash/UI_USR_L_510&client_id=smes-prd&uuid=${uuid}`;
      console.log('onOnePassJoin : ', onePassJoinUrl);
      window.location.href = onePassJoinUrl;
    }
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
          <h2 className="h-tit">회원 탈퇴</h2>
        </div>

        <div className="txt-box outline">
          <h4 className="outline-tit">알려드립니다.</h4>
          <ul className="check-list">
            <li>중소벤처24를 이용해 주신 회원님께 진심으로 감사드립니다.</li>
            <li>탈퇴는 중기 통합회원 마이페이지에서 진행 부탁드립니다.</li>
          </ul>
        </div>

{/* 
        <div className="krds-table-wrap mt-24">
          <table className="tbl col data tbl-row">
            <caption>회원 기업 정보. 기업명, 기업 관리자 정보가 제공됨.  </caption>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <th scope="row" className="ac">기업명</th>
                <td>{companyName}</td>
              </tr>
              <tr>
                <th scope="row"  className="ac">기업관리자</th>
                <td>{companyManagerName}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="conts-wrap certify-conts mt-64">
          <h3 className="sec-tit">회원 탈퇴 시 회원 정보 보관 안내</h3>
          <p className="conts-desc" >회원가입 시 입력하신 회원정보는 “개인정보처리방침”에 따라 아래와 같이 일정기간 저장함을 안내합니다.</p>
          <div className="krds-table-wrap mt-24">
            <table className="tbl col data">
              <caption>회원 정보 보관 안내 표. 보유기간, 수집동의, 법적근거, 비고 정보가 제공됨. </caption>
              <colgroup>
                <col style={{ width: '15.8%' }} />
                <col style={{ width: '15.8%' }}/>
                <col style={{ width: '22.6%' }}/>
                <col style={{ width: '22.6%' }}/>
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">구분</th>
                  <th scope="col" className="ac">보유기간</th>
                  <th scope="col" className="ac">수집동의</th>
                  <th scope="col" className="ac">법적근거</th>
                  <th scope="col" className="ac">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="ac bg"><span>회원정보</span></th>
                  <td className="ac br-1"><span>즉시 파기</span></td>
                  <td className="ac" rowSpan={4}><span>정보주체의 동의</span></td>
                  <td className="ac" rowSpan={4}><span>개인정보보호법 제3장<br />정보통신망 이용촉진 및 정보보호 등에 관한 법률 제27조</span></td>
                  <td className="ac" rowSpan={4}><span>보유기간이 도달하면 즉시 파기</span></td>
                </tr>
                <tr>
                  <th scope="row" className="ac bg"><span>지원사업신청이력</span></th>
                  <td className="ac br-1"><span>5년</span></td>
                </tr>
                <tr>
                  <th scope="row" className="ac bg"><span>증명서 발급 이력</span></th>
                  <td className="ac br-1"><span>180일</span></td>
                </tr>
                <tr>
                  <th scope="row" className="ac bg"><span>전자민원신청이력</span></th>
                  <td className="ac br-1"><span>180일</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> */}

        <div className="conts-wrap mt-64 certify-conts">
          <div className="certify-cont-box" style={{ border: '0px', marginTop: '-80px' }}>
            <div className="certify-cont-item">
              <button
                type="button"
                className="krds-btn medium primary"
                onClick={onOnePassConfig}
              >
                중기 통합회원 마이페이지
              </button>
            </div>
          </div>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">
              {/*탈퇴 처리 후 현재 로그인 세션은 종료되며 홈으로 이동합니다.*/}
            </li>
          </ul>
        </div>

      </div>
    </>
  );
};

export default UI_USR_R_440;
