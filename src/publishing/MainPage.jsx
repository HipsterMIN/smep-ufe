import React, { useRef } from "react";
import Header from "../components/ui/Header.jsx";
import Footer from "../components/ui/Footer.jsx";

const MainPage = () => {

  return (
    <div id="wrap">
        <Header />{ /* 임시 해더 */}
        <div id="container">
          { /*컨텐츠 영역 */}
          <div className="main-totallayout">
            <div className="inner">
              <p className="main-total-p">“중소벤처24”와 “기업마당”이 통합되어 더 편리해진 서비스</p>
              <h2 className="main-total-tit">중소기업을 위한 모든 것<span>중소기업 통합플랫폼</span></h2>
              <div className="main-totalbox">
                <div className="main-totalbox-left">
                  <h3>중소기업에 딱 맞는 정보를 검색<span>AI 통합검색</span></h3>
                  <div className="main-totalbox-input">
                    <input type="text" placeholder='기업 조건에 맞는 지원사업 공고를 찾아줘'/> <button type="button" className="main-totalbox-button" ><span className="sr-only">선택됨</span></button>
                  </div>

                  {/*로그인 전 상태   
                  <p><span>로그인</span> 후, 나에게 맞는 추천 검색어를 받아보세요</p> 
                  */}

                  {/*로그인 후 */}
                  <div className="main-totalbox-word">
                    <h3>AI 추천검색어</h3>
                    <ul>
                      <li><button type="button" className="word-bu">소상공인지원</button></li>
                      <li><button type="button" className="word-bu">초기창업</button></li>
                      <li><button type="button" className="word-bu">창업지원포털</button></li>
                      <li><button type="button" className="word-bu">지원사업공고</button></li>
                      <li><button type="button" className="word-bu">AP소재정보</button></li>
                      <li><button type="button" className="word-bu">맞춤서비스</button></li>
                    </ul>
                  </div>
                </div>
                <div className="main-totalbox-right">
                  <h3>인기검색어</h3>
                  <ul>
                    <li className="up"><button type="button" className="mtr-bu"><span className="mtr-num">1.</span><span className="mtr-name">소상공인지원</span><span className="mtr-rank"><span className="mtr-rank-icon"></span> <span>1</span></span></button></li>
                    <li><button type="button" className="mtr-bu"><span className="mtr-num">2.</span><span className="mtr-name">초기창업</span><span className="mtr-rank"> <span>21</span></span></button></li>
                    <li className="down"><button type="button" className="mtr-bu"><span className="mtr-num">3.</span><span className="mtr-name">증명서발급</span><span className="mtr-rank"><span className="mtr-rank-icon"></span> <span>1</span></span></button></li>
                    <li><button type="button" className="mtr-bu"><span className="mtr-num">4.</span><span className="mtr-name">플랫폼교육</span><span className="mtr-rank"> <span>88</span></span></button></li>
                    <li><button type="button" className="mtr-bu"><span className="mtr-num">5.</span><span className="mtr-name">지원사업</span><span className="mtr-rank"> <span>1</span></span></button></li>
                  </ul>
                </div>
              </div>
              <div className="main-totallistbox">
                <div className="inner">
                  <h3>통합플랫폼 주요 메뉴<span>많이 찾는 메뉴로 바로 이동합니다.</span></h3>
                  <ul>
                    <li><button type="button" className="mtlist-bu">
                        <span className="main-totalbox-img"><img src="../src/assets/main/mainIcon_01.svg" alt="" /></span>
                        <span className="main-totalbox-tit">사업공고</span>
                        <span className="main-totalbox-txt">지원사업<br/>조회,신청</span>
                      </button></li>
                      <li><button type="button" className="mtlist-bu">
                        <span className="main-totalbox-img"><img src="../src/assets/main/mainIcon_02.svg" alt="" /></span>
                        <span className="main-totalbox-tit">사업공고 캘린더</span>
                        <span className="main-totalbox-txt">일자별<br/>사업공고 조회</span>
                      </button></li>
                      <li><button type="button" className="mtlist-bu">
                        <span className="main-totalbox-img"><img src="../src/assets/main/mainIcon_03.svg" alt="" /></span>
                        <span className="main-totalbox-tit">증명서 발급</span>
                        <span className="main-totalbox-txt">각종 증명서<br/>발급 및 출력</span>
                      </button></li>
                      <li><button type="button" className="mtlist-bu">
                        <span className="main-totalbox-img"><img src="../src/assets/main/mainIcon_04.svg" alt="" /></span>
                        <span className="main-totalbox-tit">정책금융</span>
                        <span className="main-totalbox-txt">금융정책상품<br/>안내</span>
                      </button></li>
                      <li><button type="button" className="mtlist-bu">
                        <span className="main-totalbox-img"><img src="../src/assets/main/mainIcon_05.svg" alt="" /></span>
                        <span className="main-totalbox-tit">행사정보</span>
                        <span className="main-totalbox-txt">각종<br/>행사정보 안내</span>
                      </button></li>
                      <li><button type="button" className="mtlist-bu">
                        <span className="main-totalbox-img"><img src="../src/assets/main/mainIcon_06.svg" alt="" /></span>
                        <span className="main-totalbox-tit">입법·행정예고/고시</span>
                        <span className="main-totalbox-txt">법령,정책, 제도 등<br/>안내</span>
                      </button></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="main-newsebox">
            <div className="inner">
              <img src="../src/assets/main/mainNews.png" alt="" />
            </div>
          </div>
          <div className="main-quickbox">
            <div className="inner">
              <img src="../src/assets/main/mainCer.png" alt="" />
            </div>
          </div>
          <div className="main-noticebox">
            <div className="inner">
              <img src="../src/assets/main/mainNotice.png" alt="" />
            </div>
          </div>
          { /*컨텐츠 영역 */}
        </div>
        <Footer />{ /* 임시 푸터 */}
      </div>
  );
};

export default MainPage;
