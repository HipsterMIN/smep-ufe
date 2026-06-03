import React, { useRef, useState } from "react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";

const FindPwdAction = () => {
  const breadcrumbItems = [
    { label: "임시 비밀번호 발송", link: "#" },
  ];

  return (
    <>

    <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">임시 비밀번호 발송</h2>
        </div>
        <div className="find-form-area find-result">
            <p>
                <strong className="primary">이정주</strong>님의 이메일(<span className="primary">larb*e@*ave*.com</span>)으로 임시 비밀번호가 발송되었습니다.<br />
                임시 비밀번호로 로그인 후 <button type="button" className="krds-btn text primary">[회원정보관리]</button> 메뉴에서 새로운 비밀번호로 변경하시기 바랍니다.
            </p>
            <ul className="btn-group">
                <li><button type="submit" className="krds-btn large primary btn-confirm">로그인</button></li>
            </ul>
        </div>
    </div>
    </>
  );
};
export default FindPwdAction;