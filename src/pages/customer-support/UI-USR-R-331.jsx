import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_R_331 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit2">API 문의드립니다.</h2>
        </div>
        <ul className="onboard-summary">
          <li>
            <span className="sr-only">카테고리</span>
        일반 문의
          </li>
			 <li>
            <span className="sr-only">작성일</span>
            <span>2025.12.29</span>
          </li>
          <li>
            <span>작성자 홍길동</span>
          </li>
        </ul>

        {/* 게시글 내용 */}

        <div className="onboard-conts-area">
          <p>
				중소벤처24에서 안내드립니다. <br /><br />
				2025년 10월 1일부로 중소벤처24의 새로운 기능이 출시되었습니다.<br /><br />
				1. 사업공고 캘린더를 통해 시작·마감·진행 중인 사업을 한눈에 확인하세요!
				2. 매 주 1회(월요일) 사업공고 알림을 통해 새로운 사업을 빠르게 확인해보세요!<br /><br />
				모든 내용은 모바일 기기를 통해 쉽게 확인하실 수 있습니다.
          </p>
          <br /><br />
        </div>


        {/* 하단 버튼 */} 
		  <div className="onboard-btm-btngroup">
          <div>
            <button type="button" className="krds-btn tertiary xlarge">
              목록
            </button>
          </div>
        </div>
      </div> 
    </>
  );
};

export default UI_USR_R_331;
