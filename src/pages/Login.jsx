import Breadcrumb from "../components/ui/Breadcrumb";
import React from "react";
import { useNavigate } from "react-router-dom";
import {useAuthStore} from "../components/ui/useAuthStore.jsx";

const UI_USR_R_002 = () => {
    const { setBizno } = useAuthStore();
    const navigate = useNavigate();

    const breadcrumbItems = [
        { label: "로그인", link: "#" },
    ];

    const handleUcubeLogin = () => {
        setBizno(2288105280);
        navigate('/');
    };

    const handleOtherLogin = () => {
        setBizno(2);
        navigate('/');
    };

    return (
        <>
            <div className="contents">
                <Breadcrumb items={breadcrumbItems}/>
                <div className="page-title-wrap" data-type="responsive">
                    <h2 className="h-tit">로그인 방식을 선택해주세요.</h2>
                </div>
                <button type="button" className="krds-btn xsmall" onClick={handleUcubeLogin}>
                    유큐브 로그인
                    <i className="svg-icon ico-angle right"></i>
                </button>
                <br/>
                <br/>
                <button type="button" className="krds-btn xsmall" onClick={handleOtherLogin}>
                    ? 사업자 로그인
                    <i className="svg-icon ico-angle right"></i>
                </button>
                {/*<img src={CON_UI_USR_R_002} alt="컨텐츠 이미지"/>*/}
            </div>
        </>
    );
};

export default UI_USR_R_002;
