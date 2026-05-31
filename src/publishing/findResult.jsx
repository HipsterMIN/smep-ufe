import React, { useRef, useState } from "react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";

const FindPwd = () => {
  const breadcrumbItems = [
    { label: "아이디 찾기 완료", link: "#" },
  ];

  return (
    <>

    <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">아이디 찾기 완료</h2>
        </div>
        <div className="find-form-area find-result">
            <p>
                회원님의 아이디는<br />
                <strong className="primary">Larble</strong> 로 등록되어 있습니다.<br />
                비밀번호가 기억나지 않으실 경우 <button type="button" className="krds-btn text primary">[비밀번호 찾기]</button>에서 확인하시기 바랍니다.
            </p>
            <ul className="btn-group">
                <li><button type="submit" className="krds-btn large primary btn-confirm">로그안</button></li>
                <li><button type="button" className="krds-btn large secondary btn-cancel">비밀번호 찾기</button></li>
            </ul>
        </div>
    </div>
    </>
  );
};
export default FindPwd;