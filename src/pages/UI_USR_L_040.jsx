import {useNavigate} from "react-router-dom";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import CON_UI_USR_L_040 from "../assets/common/CON_UI_USR_L_040.png";

const UI_USR_L_040 = () => {

  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 검색",
        active: true,
        depth3: [
          {
            label: "AI 스마트 검색",
            link: "/main-dev/ai-smart-search",
          },
        ],
      },
      {
        depth2: "중소벤처기업부 지원사업공고",
        active: true,
        depth3: [
          {
            label: "지원사업",
            link: "/main-dev/service/UI_USR_L_010",
          },
        ],

      },
      {
        depth2: "사업공고",
        active: true,
        depth3: [
          {
            label: "사업공고",
            link: "/main-dev/service/pbanc",
          },
        ],
      },
      {
        depth2: "정책금융",
        active: true,
        depth3: [
          {
            label: "정책금융안내",
            link: "/main-dev/service/UI_USR_L_030",
          },
        ],
      },
      {
        depth2: "증명서 발급",
        active: true,
        depth3: [
          {
            label: "증명서 발급",
            link: "/main-dev/service/UI_USR_L_040",
            active: true,
          },
        ],
      },
    ],
  };

  const breadcrumbItems = [
    { label: "신청·발급", link: "#" },
    { label: "증명서 발급", link: "#" },
    { label: "증명서 발급", link: "#" },
  ];

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/service/UI_USR_L_510'); // 증명서 발급 이력 페이지 링크이동.
  };

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <img src={CON_UI_USR_L_040} alt="컨텐츠 이미지" onClick={handleClick} />
      </div> 
    </>
  );
};

export default UI_USR_L_040;
