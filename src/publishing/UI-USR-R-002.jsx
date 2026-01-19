import Breadcrumb from "../components/ui/Breadcrumb";
import CON_UI_USR_R_002 from "../assets/common/CON_UI_USR_R_002.png";

const UI_USR_R_002 = () => {
  const breadcrumbItems = [
    { label: "로그인", link: "#" },
  ];

  return (
    <>
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">로그인 방식을 선택해주세요.</h2>
        </div>
        <img src={CON_UI_USR_R_002} alt="컨텐츠 이미지" />
      </div> 
    </>
  );
};

export default UI_USR_R_002;
