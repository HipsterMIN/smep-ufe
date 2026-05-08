import Header from '@components/ui/Header.jsx';
import React, {useEffect} from 'react';
import Footer from '@components/ui/Footer.jsx';
import { useMatches } from 'react-router-dom';

const UI_USR_R_564 = () => {
  const matches = useMatches();
  const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '이용약관';
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div id="wrap">
      <Header/>
      <div id="container" className="sub-container">
        <div className="inner in-between">
          <div className="contents">
            <div className="page-title-wrap" data-type="responsive">
              <h2 className="h-tit">{pageTitle}</h2>
            </div>
            <div className="conts-wrap">
              <h3 className="sec-tit">제1 장 총칙</h3>
              <ul className="krds-info-list decimal point mt-12" role="list">
                <li role="listitem">
                  <strong className="point">제1 조 (목적)</strong>
                  <p>본 약관은 중소벤처24 (이하 당 사이트)가 제공하는 모든 서비스(이하 서비스)의 이용조건 및 절차, 이용자와 당 사이트의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                </li>
                <li role="listitem">
                  <strong className="point">제2 조 (용어의 정의)</strong>
                  <p className="bold">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
                  <ol className="calc-list krds-info-list ordered" role="list">
                    <li role="listitem"><span className="num">1.</span>이용자 : 본 약관에 따라 당 사이트가 제공하는 서비스를 이용할 수 있는 자.</li>
                    <li role="listitem"><span className="num">2.</span>가입 : 당 사이트가 제공하는 신청서 양식에 해당 정보를 기입하고, 본 약관에 동의하여 서비스 이용계약을 완료시키는 행위</li>
                    <li role="listitem"><span className="num">3.</span>회원 : 당 사이트에 개인정보 등 관련 정보를 제공하여 회원등록을 한 개인(재외국민, 국내거주 외국인 포함)또는 법인으로서 당 사이트의 정보를 제공 받으며, 당 사이트가 제공하는 서비스를 이용할 수 있는 자.</li>
                    <li role="listitem"><span className="num">4.</span>아이디(ID) : 회원의 식별과 서비스 이용을 위하여 회원이 문자와 숫자의 조합으로 설정한 고유의 체계</li>
                    <li role="listitem"><span className="num">5.</span>비밀번호 : 이용자와 아이디가 일치하는지를 확인하고 통신상의 자신의 비밀보호를 위하여 이용자 자신이 선정한 문자와 숫자의 조합.</li>
                    <li role="listitem"><span className="num">6.</span>탈퇴 : 회원이 이용계약을 종료시키는 행위</li>
                    <li role="listitem"><span className="num">7.</span>게시물 : 회원이 서비스를 이용함에 있어 서비스상에 게시한 부호·문자·음성·음향·화상·동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미</li>
                    <li role="listitem"><span className="num">8.</span>본 약관에서 정의하지 않은 용어는 개별서비스에 대한 별도 약관 및 이용규정에서 정의하거나 일반적인 개념에 의합니다.</li>
                  </ol>
                </li>
                <li role="listitem">
                  <strong className="point">제4 조 (약관 외 준칙)</strong>
                  <ol className="calc-list krds-info-list ordered" role="list">
                    <li role="listitem"><span className="num">1.</span>본 약관은 당 사이트가 제공하는 서비스에 관한 이용규정 및 별도 약관과 함께 적용됩니다.</li>
                    <li role="listitem"><span className="num">2.</span>본 약관에 명시되지 않은 사항은 전기통신기본법, 전기통신사업법, 정보통신윤리위원회심의규정, 정보통신 윤리강령, 컴퓨터 프로그램보호법 및 기타 관련 법령의 규정에 따릅니다.</li>
                  </ol>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default UI_USR_R_564;
