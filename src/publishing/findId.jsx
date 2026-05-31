import React, { useRef, useState } from "react";
//import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";

const FindId = () => {
  const [memberType, setMemberType] = useState('personal'); // personal | company
  const [findType, setFindType] = useState('phone'); // phone | email

  const isPersonal = memberType === 'personal';
  const isCompany = memberType === 'company';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isPersonal) {
      console.log('개인회원 아이디 찾기', findType);
      return;
    }

    console.log('기업회원 아이디 찾기');
  };
  const breadcrumbItems = [
    { label: "아이디 찾기", link: "#" },
  ];

  return (
    <>

    <div className="contents find-id-page">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">아이디 찾기</h2>
        </div>
        <div className="find-form-area">
            <div className="krds-tab-area layer">
                <div className="tab fill full">
                    <ul role="tablist" aria-label="회원 유형 선택">
                        <li role="tab" aria-selected={isPersonal} className={isPersonal ? 'active' : ''}>
                            <button type="button" className="btn-tab" onClick={() => setMemberType('personal')}>개인회원</button>
                        </li>
                        <li role="tab" aria-selected={isCompany} className={isCompany ? 'active' : ''}>
                            <button type="button" className="btn-tab" onClick={() => setMemberType('company')}>기업회원</button>
                        </li>
                    </ul>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {isPersonal && (
                    <>
                    <div className="krds-check-area gap-4">
                        <span className="krds-form-check">
                            <input type="radio" name="findType" id="findType_01" value="phone" checked={findType === 'phone'} onChange={() => setFindType('phone')} />
                            <label for="findType_01">휴대전화번호</label>
                        </span>
                        <span className="krds-form-check">
                            <input type="radio" name="findType" id="findType_02" value="email" checked={findType === 'email'} onChange={() => setFindType('email')} />
                            <label for="findType_02">이메일 주소</label>
                        </span>
                    </div>
                    </>
                )}
                <div className="find-id-fields">
                {isCompany ? (
                    <>
                    <div className="form-group">
                        <label htmlFor="companyName">기업명</label>
                        <input id="companyName" type="text" className="krds-input" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bizNo">사업자등록번호</label>
                        <div className="field-control">
                        <input id="bizNo" type="text" className="krds-input" inputMode="numeric" />
                        <p>‘-’를 제외하고 입력해주세요.</p>
                        </div>
                    </div>
                    </>
                ) : (
                    <>
                    <div className="form-group">
                        <label htmlFor="userName">이름</label>
                        <input id="userName" type="text" className="krds-input" />
                    </div>

                    {findType === 'phone' ? (
                        <div className="form-group">
                        <label htmlFor="phone">휴대전화번호</label>
                        <div className="field-control">
                            <input id="phone" type="text" className="krds-input" inputMode="numeric" />
                            <p>‘-’를 제외하고 입력해주세요.</p>
                        </div>
                        </div>
                    ) : (
                        <div className="form-group">
                        <label htmlFor="email">이메일 주소</label>
                        <input id="email" type="email" className="krds-input" />
                        </div>
                    )}
                    </>
                )}
                </div>
                <ul className="btn-group">
                    <li><button type="button" className="krds-btn large secondary btn-cancel">취소</button></li>
                    <li><button type="submit" className="krds-btn large primary btn-confirm">확인</button></li>
                </ul>
            </form>
        </div>
    </div>
    </>
  );
};
export default FindId;