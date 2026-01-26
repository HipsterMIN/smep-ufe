import { useNavigate } from 'react-router-dom';
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import CON_UI_USR_L_010 from "../assets/common/CON_UI_USR_L_010.png";

const UI_USR_L_010 = () => {

  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 검색",
        active: true,
        depth3: [
          {
            label: "AI 스마트 검색",
            link: "/req/ai/ai-smart-search",
          },
        ],
      },
      {
        depth2: "중소벤처기업부 지원사업공고",
        active: true,
        depth3: [
          {
            label: "지원사업",
            link: "/service/UI_USR_L_010",
            active: true,
          },
        ],

      },
      {
        depth2: "사업공고",
        active: true,
        depth3: [
          {
            label: "사업공고",
            link: "/service/pbanc",
          },
        ],
      },
      {
        depth2: "정책금융",
        active: true,
        depth3: [
          {
            label: "정책금융안내",
            link: "/service/UI_USR_L_030",
          },
        ],
      },
      {
        depth2: "증명서 발급",
        active: true,
        depth3: [
          {
            label: "증명서 발급",
            link: "/service/UI_USR_L_040",
          },
        ],
      },
    ],
  };

  const breadcrumbItems = [
    { label: "신청·발급", link: "#" },
    { label: "중소벤처기업부 지원사업 소개", link: "#" },
  ];

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/service/UI_USR_R_011'); // 지원사업 상세 이미지 페이지 링크
  };

  return (
      <>
        <SideNavigation
            pageTitle={navigationData.depth1Title}
            depth={navigationData.depth}
        />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap" data-type="responsive">
            <h2 className="h-tit">중소벤처기업부 지원사업 소개</h2>
          </div>
          <img src={CON_UI_USR_L_010} alt="컨텐츠 이미지" onClick={handleClick} />
        </div>
      </>
  );
};

export default UI_USR_L_010;
