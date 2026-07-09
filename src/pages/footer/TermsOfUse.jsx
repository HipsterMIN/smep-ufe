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
            <div className="conts-wrap terms-content">
                <div>
                    <div>
                        <h3 className="sec-tit">제1장 총칙</h3>
                        <ul className="krds-info-list decimal point mt-12" role="list">
                            <li role="listitem">
                                <strong className="point">제1조 (목적)</strong>
                                <p>본 약관은 중소벤처24(이하 “당 사이트”)가 제공하는 모든 서비스(이하"서비스")의 이용조건 및 절차, 이용자와 당 사이트의 권리·의무·책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                            </li>
                            <li role="listitem">
                                <strong className="point">제2조 (용어의 정의)</strong>
                                <p className="bold">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem"><span className="num">1.</span>이용자: 본 약관에 따라 사이트가 제공하는 서비스를 이용할 수 있는 자.</li>
                                    <li role="listitem"><span className="num">2.</span>회원 : 사이트에 개인정보 등 관련 정보를 제공하여 회원등록을 한 개인(재외국민, 국내거주 외국인 포함) 또는 법인으로서, 사이트가 제공하는 서비스를 이용할 수 있는 자를 의미하며, 당 사이트 전용 아이디를 사용하는 일반회원과 유관시스템 서비스 이용을 위한 통합아이디를 사용하는 중기 통합회원으로 구성.</li>
                                    <li role="listitem"><span className="num">3.</span>비회원 : 회원으로 등록하지 않고 사이트가 제공하는 서비스를 이용하는 자.</li>
                                    <li role="listitem"><span className="num">4.</span>가입 : 당 사이트가 제공하는 신청서 양식에 해당 정보를 기입하고, 본 약관에 동의하여 서비스 이용계약을 완료시키는 행위.</li>
                                    <li role="listitem"><span className="num">5.</span>아이디(ID) : 회원의 식별과 서비스 이용을 위하여 회원이 문자와 숫자의 조합으로 설정한 고유의 체계</li>
                                    <li role="listitem"><span className="num">6.</span>비밀번호 : 이용자와 아이디가 일치하는지를 확인하고 통신상의 자신의 비밀보호를 위하여 이용자 자신이 선정한 문자와 숫자의 조합.</li>
                                    <li role="listitem"><span className="num">7.</span>탈퇴 : 회원이 이용계약을 종료시키는 행위</li>
                                    <li role="listitem"><span className="num">8.</span>게시물 : 회원이 서비스를 이용함에 있어 서비스상에 게시한 부호·문자·음성·음향·화상·동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미</li>
                                    <li role="listitem"><span className="num">9.</span>본 약관에서 정의하지 않은 용어는 개별서비스에 대한 별도 약관 및 이용규정에서 정의하거나 일반적인 개념에 의합니다.</li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제3조 (약관의 효력과 변경)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem"><span className="num">1.</span>당 사이트는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
                                    <li role="listitem"><span className="num">2.</span>당 사이트는 귀하가 본 약관 내용에 동의하는 것을 조건으로 서비스를 제공하며, 귀하가 동의하는 경우 본 약관이 우선적으로 적용됩니다.</li>
                                    <li role="listitem"><span className="num">3.</span>당 사이트는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」(이하"정보통신망법") 등 관련 법령을 위반하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                                    <li role="listitem"><span className="num">4.</span>약관을 개정할 경우에는 적용일자 및 개정 사유를 명시하여 현행 약관과 함께 그 개정약관의 적용일자 30일 전부터 적용일자 전일까지 서비스 초기 화면에 공지합니다. 다만, 회원에게 불리한 약관 개정의 경우에는 공지 외에 일정 기간 전자우편, 전자쪽지, 로그인 시 동의창 등 전자적 수단을 통해 별도로 명확히 통지합니다.</li>
                                    <li role="listitem"><span className="num">5.</span>당 사이트가 전항에 따라 개정약관을 공지 또는 통지하면서, 30일 이내에 거부 의사를 표시하지 않으면 동의한 것으로 본다는 뜻을 명확히 공지하였음에도 회원이 명시적으로 거부하지 않은 경우, 회원이 개정약관에 동의한 것으로 봅니다.</li>
                                    <li role="listitem"><span className="num">6.</span>회원이 개정약관의 적용에 동의하지 않는 경우 당 사이트가 개정 약관의 내용을 적용할 수 없으며, 이 경우 회원은 이용계약을 해지할 수 있습니다. 다만, 기존 약관을 적용할 수 없는 특별한 사정이 있는 경우에는 당 사이트가 이용계약을 해지할 수 있습니다.</li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제4조 (약관 외 준칙)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem"><span className="num">1.</span>본 약관은 당 사이트가 제공하는 서비스에 관한 이용규정 및 별도 약관과 함께 적용됩니다.</li>
                                    <li role="listitem"><span className="num">2.</span>본 약관에 명시되지 않은 사항은 「전기통신기본법」, 「전기통신사업법」, 「정보통신망법」, 「개인정보 보호법」, 「정보통신 윤리강령」, 「컴퓨터프로그램 보호법」 및 기타 관련 법령의 규정에 따릅니다.</li>
                                </ol>
                            </li>
                        </ul>
                    </div>
                    <hr />
                    <div>
                        <h3 className="sec-tit">제2장 서비스 제공 및 이용</h3>
                        <ul className="krds-info-list decimal point mt-12" role="list">
                            <li role="listitem">
                                <strong className="point">제5조 (이용계약의 성립)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem"><span className="num">1.</span>이용계약은 가입신청자가 온라인으로 약관 내용에 동의한 후, 사이트가 제공하는 가입신청 양식에 요구 사항을 기록하여 가입을 완료하고, 당 사이트가 이를 승낙함으로써 성립합니다.</li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트는 가입신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 다음 각 호에 해당하는 신청에 대하여는 승낙하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                                        <ol className="calc-list krds-info-list ordered" role="list">
                                            <li role="listitem">
                                                <span className="num">①</span>
                                                가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우(단, 당 사이트의 회원 재가입 승낙을 얻은 경우는 예외로 함).
                                            </li>
                                            <li role="listitem">
                                                <span className="num">②</span>
                                                다른 사람의 명의를 사용하여 신청하였을 때.
                                            </li>
                                            <li role="listitem">
                                                <span className="num">③</span>
                                                이용계약 신청서의 내용을 허위로 기재하였거나 신청하였을 때.
                                            </li>
                                            <li role="listitem">
                                                <span className="num">④</span>
                                                사회의 안녕질서 또는 미풍양속을 저해할 목적으로 신청하였을 때.
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑤</span>
                                                다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등의 행위를 하였을 때.
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑥</span>
                                                당 사이트를 이용하여 법령과 본 약관이 금지하는 행위를 하는 경우.
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑦</span>
                                                기타 당 사이트가 정한 이용신청 요건이 미비되었을 때.
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑧</span>
                                                이용자의 귀책사유로 인하여 승인이 불가능하거나, 기타 규정한 제반 사항을 위반하며 신청하는 경우.
                                            </li>
                                        </ol>
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        당 사이트는 다음 각 호에 해당하는 경우 그 사유가 해소될 때까지 이용계약 성립을 유보할 수 있습니다.
                                        <ol className="calc-list krds-info-list ordered" role="list">
                                            <li role="listitem">
                                                <span className="num">①</span>
                                                기술상의 장애사유로 인한 서비스 중단의 경우(시스템관리자의 고의·과실 없는 디스크장애, 시스템 다운 등).
                                            </li>
                                            <li role="listitem">
                                                <span className="num">②</span>
                                                전기통신사업법에 의한 기간통신사업자가 전기통신 서비스를 중지하는 경우.
                                            </li>
                                            <li role="listitem">
                                                <span className="num">③</span>
                                                전시, 사변, 천재지변 또는 이에 준하는 국가 비상사태가 발생하거나 발생할 우려가 있는 경우.
                                            </li>
                                            <li role="listitem">
                                                <span className="num">④</span>
                                                긴급한 시스템 점검, 증설 및 교체설비의 보수 등을 위하여 부득이한 경우.
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑤</span>
                                                서비스 설비의 장애 또는 서비스 이용의 폭주 등 기타 서비스를 제공할 수 없는 사유가 발생한 경우.
                                            </li>
                                        </ol>
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        제1항에 따른 신청에 있어 당 사이트는 회원의 종류에 따라 전문기관을 통한 실명확인 및 본인인증을 요청할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">5.</span>
                                        당 사이트가 제공하는 서비스는 아래와 같으며, 변경 시 이용자에게 사전 공지합니다. 다만, 비회원에게는 서비스 중 일부만을 제공할 수 있습니다.
                                        <ol className="calc-list krds-info-list ordered" role="list">
                                            <li role="listitem">
                                                <span className="num">①</span>
                                                정책정보, 지원사업정보, 맞춤형 정보 등 중기부 대민 정보
                                            </li>
                                            <li role="listitem">
                                                <span className="num">②</span>
                                                사업신청, 증명서 발급, 민원 및 교육 신청 등
                                            </li>
                                            <li role="listitem">
                                                <span className="num">③</span>
                                                기업 지원 정책 및 사업 정보 통합 검색
                                            </li>
                                            <li role="listitem">
                                                <span className="num">④</span>
                                                게시판형 서비스
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑤</span>
                                                기타 자체 개발하거나 다른 기관과의 제휴를 통해 제공하는 일체의 서비스
                                            </li>
                                        </ol>
                                    </li>
                                    <li role="listitem">
                                        <span className="num">6.</span>
                                        이용계약의 성립 시기는 당 사이트가 가입 완료를 신청 절차상에 표시한 시점으로 합니다. 단, 일부 서비스에 대해서는 별도의 신청 및 승낙 절차가 있을 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">7.</span>
                                        당 사이트는 회원에 대해 정책에 따라 등급별로 구분하여 이용시간, 이용횟수, 서비스 메뉴 등을 세분하여 이용에 차등을 둘 수 있습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제6조 (회원정보 사용에 대한 동의)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트가 처리하는 모든 개인정보는 「개인정보 보호법」 등 관련 법령의 개인정보보호 규정을 준수하여 이용자의 개인정보 보호 및 권익을 보호합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트는 다른 법령에 특별한 규정이 있는 경우를 제외하고, 귀하가 서비스 가입 시 동의하여 제공하는 정보에 한하여 최소한으로 수집합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        당 사이트와 행정기관 타 사이트 간의 회원정보 통합관리와 관련하여 본인이 동의한 경우에는 개인정보 등 관련 정보를 행정기관 타 사이트에 제공할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        회원이 본 약관에 따라 이용신청을 하는 것은, 당 사이트가 본 약관에 따라 신청서에 기재된 회원정보를 수집·이용하는 것에 동의하는 것으로 간주됩니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">5.</span>
                                        당 사이트는 회원정보의 진위 여부 및 소속기관의 확인 등을 위하여 확인 절차를 거칠 수 있습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제7조 (사용자의 정보 보안)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        가입 신청자가 당 사이트 서비스 가입 절차를 완료하는 순간부터 귀하는 입력한 정보의 비밀을 유지할 책임이 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        회원의 아이디와 비밀번호를 제3자가 이용하도록 하여서는 안 되며, 회원의 아이디와 비밀번호를 사용하여 발생하는 모든 결과에 대한 책임은 회원 본인에게 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        아이디와 비밀번호에 관한 모든 관리의 책임은 회원에게 있으며, 부정 사용이 발견된 경우에는 즉시 운영기관에 신고하여야 합니다. 신고를 하지 않음으로 인한 모든 책임은 회원 본인에게 있습니다
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        이용자는 서비스 사용 종료 시마다 정확히 접속을 종료하도록 해야 하며, 정확히 종료하지 아니함으로써 발생하는 손해 및 손실에 대하여 당 사이트는 책임을 부담하지 아니합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">5.</span>
                                        당 사이트는 회원의 아이디가 개인정보 유출 우려가 있거나, 반사회적 또는 미풍양속에 어긋나거나, 운영자로 오인될 우려가 있는 경우 해당 아이디의 이용을 제한할 수 있습니다.</li>
                                    <li role="listitem">
                                        <span className="num">6.</span>
                                        비밀번호 분실 시 통보는 이메일 또는SMS로 안내하며, 회원의 이메일 주소 또는 휴대전화번호 기입 오류 등 본인 과실로 발생하는 문제의 책임은 회원에게 있습니다.</li>
                                    <li role="listitem">
                                        <span className="num">7.</span>
                                        이용자는 개인정보 보호 및 관리를 위하여 서비스의 개인정보관리 메뉴에서 수시로 개인정보를 수정·삭제할 수 있습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제8조 (회원정보의 통합관리)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트의 회원정보는 회원의 사전 동의를 거쳐 행정기관 타 사이트(중소벤처기업부 산하 관련 대민사이트)의 회원정보와 통합하여 관리될 수 있습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제9조 (이용자 확인)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트는 회원이 입력하는 다음 각 호의 사항이 미리 등록된 자료와 일치할 경우 서비스 이용자를 본인으로 인정하고 서비스를 제공합니다.
                                        <ol className="calc-list krds-info-list ordered" role="list">
                                            <li role="listitem">
                                                <span className="num">①</span>아이디(ID)
                                            </li>
                                            <li role="listitem">
                                                <span className="num">②</span>비밀번호
                                            </li>
                                            <li role="listitem">
                                                <span className="num">③</span>기타 별도로 부여한 정보처리 접근수단(휴대폰 인증, 아이핀, SMS 인증, 공동인증서 등)
                                            </li>
                                        </ol>
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제10조 (회원정보의 변경)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        회원은 회원정보관리 화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 다만, 서비스 관리를 위해 필요한 아이디, 고유번호 등은 수정이 불가능합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        회원은 가입신청 시 기재한 사항이 변경된 경우 온라인으로 수정하거나 전자우편 기타 방법으로 당 사이트에 대하여 그 변경사항을 알려야 합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        제2항의 변경사항을 당 사이트에 알리지 않아 발생한 불이익에 대하여 당 사이트는 책임지지 않습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제11조 (서비스의 제공 및 이용 시간)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트는 서비스를 이용 가능한 일시 및 시간을 별도로 지정할 수 있으며, 이 경우 그 내용을 사전에 공지합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        당 사이트는 컴퓨터 등 정보통신설비의 보수점검, 교체, 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있으며, 이 경우 회원에게 통지합니다. 다만, 사전에 통지할 수 없는 부득이한 사유가 있는 경우 사후에 통지할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        당 사이트는 정기점검을 실시할 수 있으며, 정기점검 시간은 서비스 제공 화면에 공지합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">5.</span>
                                        당 사이트는 운영상·기술상의 필요에 따라 제공 중인 서비스의 전부 또는 일부를 변경할 수 있으며, 변경 사유, 변경 내용 및 제공일자를 사전에 해당 서비스 초기 화면에 게시합니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제12조 (서비스의 중지 등)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        귀하는 국가 비상사태, 정전, 관리 범위 외의 서비스 설비 장애, 기타 불가항력에 의하여 메시지 등 통신 데이터가 보관되지 못하거나 삭제·손실된 경우 당 사이트가 관련 책임을 부담하지 아니한다는 점에 동의합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트가 정상적인 서비스 제공의 어려움으로 일시적으로 서비스를 중지하여야 할 경우, 서비스 중지 1주일 전 고지 후 서비스를 중지할 수 있습니다. 부득이한 사정이 있을 경우 사전 고지 기간은 단축되거나 생략될 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        서비스를 영구적으로 중단하여야 할 경우에는 1개월 전에 사전 고지합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        당 사이트는 사전 고지 후 서비스를 일시적으로 수정·변경·중단할 수 있으며, 이에 대하여 귀하 또는 제3자에게 어떠한 책임도 부담하지 아니합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">5.</span>
                                        당 사이트는 이용자가 본 약관의 내용에 위배되는 행동을 한 경우 임의로 서비스 사용을 제한 및 중지할 수 있습니다. 이 경우 당 사이트는 해당 이용자의 접속을 금지할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">6.</span>
                                        당 사이트에 3개월 이상 장기간 로그인하지 아니한 회원의 경우 이메일 또는 공지사항 등을 통한 안내 후 검토 기간을 거쳐 서비스 이용을 중지할 수 있습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제13조 (회원에 대한 통지)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트가 회원에 대한 통지를 하는 경우, 이 약관에 별도 규정이 없는 한 서비스 내 전자우편, 전자쪽지 등으로 할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트는 회원 전체에 대한 통지의 경우 7일 이상 사이트 게시판에 게시함으로써 제1항의 통지에 갈음할 수 있습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제14조 (계약해제·해지 등)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        회원은 언제든지 당 사이트의 고객센터 또는 회원탈퇴 메뉴를 통하여 이용계약 해지 신청을 할 수 있으며, 당 사이트는 관련 법령이 정하는 바에 따라 이를 즉시 처리합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        회원이 계약을 해지할 경우, 관련 법령 및 개인정보처리방침에 따라 당 사이트가 회원정보를 보유하는 경우를 제외하고는 해지 즉시 회원의 모든 데이터는 소멸됩니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        회원이 계약을 해지하는 경우, 회원이 작성한 게시물 일체는 삭제됩니다. 다만, 타인에 의해 재게시되거나 공용게시판에 등록된 게시물 등은 삭제되지 않으니 사전에 삭제 신청 후 탈퇴하시기 바랍니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        당 사이트의 개인정보의 수집·이용에 대한 동의를 2년 주기로 갱신하지 아니한 회원의 경우, 안내 이메일 또는 공지사항 발표 후 검토 기간을 거쳐 회원 정보를 삭제할 수 있습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제15조 (게시물의 저작권)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트는 「저작권법」 규정을 준수하며, 회원은 언제든지 고객센터 또는 서비스 내 관리기능을 통해 해당 게시물에 대해 삭제, 비공개 등의 조치를 취할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        귀하의 게시물이 타인의 저작권을 침해함으로써 발생하는 민·형사상의 책임은 전적으로 귀하가 부담하여야 합니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제16조 (당 사이트의 소유권)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트에서 제공하는 서비스, 소프트웨어, 이미지, 마크, 로고, 디자인, 서비스 명칭, 정보 및 상표 등과 관련된 지적재산권 및 기타 권리는 중소벤처기업부에 귀속됩니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        회원은 당 사이트가 명시적으로 승인한 경우를 제외하고는 제1항의 각 재산에 대하여 전부 또는 일부의 수정, 대여, 대출, 판매, 배포, 제작, 양도, 재라이선스, 담보권 설정행위, 상업적 이용행위를 할 수 없으며, 제3자로 하여금 이와 같은 행위를 하도록 허락할 수 없습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제17조 (게시물의 관리)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        회원의 게시물이 「정보통신망법」, 「저작권법」 등 관련 법에 위반되는 내용을 포함하는 경우, 권리자는 관련 법이 정한 절차에 따라 해당 게시물의 게시 중단 및 삭제 등을 요청할 수 있으며, 당 사이트가 관련 법에 따라 조치를 취합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트는 전항에 따른 권리자의 요청이 없는 경우라도 권리 침해가 인정될 만한 사유가 있거나 기타 운영기관 정책 및 관련 법에 위반되는 경우 해당 게시물에 대해 임시조치 등을 취할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        당 사이트에 게시된 내용을 사전 통지 없이 편집·이동할 수 있는 권리를 보유하며, 다음의 경우 사전 통지 없이 삭제할 수 있습니다.
                                        <ol className="calc-list krds-info-list ordered" role="list">
                                            <li role="listitem">
                                                <span className="num">①</span> 본 서비스 약관에 위배되거나 상용·불법·음란·저속하다고 판단되는 게시물
                                            </li>
                                            <li role="listitem">
                                                <span className="num">②</span> 다른 회원 또는 제3자를 비방하거나 명예를 손상시키는 내용
                                            </li>
                                            <li role="listitem">
                                                <span className="num">③</span> 공공질서 및 미풍양속에 위반되는 내용
                                            </li>
                                            <li role="listitem">
                                                <span className="num">④</span> 범죄적 행위에 결부된다고 인정되는 내용
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑤</span> 제3자의 저작권 등 기타 권리를 침해하는 내용
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑥</span> 기타 관계 법령에 위배되는 경우
                                            </li>
                                        </ol>
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제18조 (정보의 제공 및 홍보)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트는 회원이 서비스 이용 중 필요하다고 인정되는 다양한 정보를 공지사항, 전자우편, SMS 등의 방법으로 제공할 수 있습니다. 다만, 회원은 지원 사업신청·증명서 발급 관련 정보 및 고객문의 답변 등을 제외하고는 언제든지 수신 거절을 할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        제1항의 정보를 전송하려는 경우 회원의 사전 동의를 받아서 전송합니다. 다만, 지원 사업신청·증명서 발급 관련 정보 및 고객문의 회신은 예외로 합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        당 사이트는 서비스에 적절하다고 판단되거나 활용 가능성 있는 홍보물을 게재할 수 있습니다.
                                    </li>
                                </ol>
                            </li>
                        </ul>
                    </div>
                    <hr />
                    <div>
                        <h3 className="sec-tit">제3장 의무 및 책임</h3>
                        <ul className="krds-info-list decimal point mt-12" role="list">
                            <li role="listitem">
                                <strong className="point">제19조 (당 사이트의 의무)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트는 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 지속적·안정적으로 서비스를 제공하기 위해 노력할 의무가 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트는 서비스 제공과 관련하여 취득한 회원의 정보를 본인의 승낙 없이 타인에게 누설·배포할 수 없으며, 상업적 목적으로 사용할 수 없습니다. 다만, 전기통신관련법령 등에 의하여 관계 국가기관의 요구가 있는 경우에는 그러하지 아니합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        당 사이트는 이용자가 안전하게 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함) 보호를 위한 보안시스템을 갖추어야 합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        당 사이트는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">5.</span>
                                        당 사이트는 서비스와 관련한 이용자의 불만사항이 접수되는 경우 이를 즉시 처리하여야 하며, 즉시 처리가 곤란한 경우 이용자에게 사유와 처리 일정을 전화, 이메일, 팩스 등으로 통보하여야 합니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제20조 (회원의 의무)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        회원 가입 시 요구되는 정보는 정확하게 기입하여야 하며, 이미 제공된 정보가 정확한 정보가 되도록 유지·갱신하여야 합니다. 회원은 자신의 아이디 및 비밀번호를 제3자에게 이용하게 해서는 안 됩니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        회원은 당 사이트의 사전 승낙 없이 서비스를 이용하여 어떠한 영리행위도 할 수 없습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        회원은 당 사이트 서비스를 이용하여 얻은 정보를 당 사이트의 사전 승낙 없이 복사, 복제, 변경, 번역, 출판·방송, 기타의 방법으로 사용하거나 타인에게 제공할 수 없습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        회원은 당 사이트 서비스 이용과 관련하여 다음 각 호의 행위를 하여서는 안 됩니다.
                                        <ol className="calc-list krds-info-list ordered" role="list">
                                            <li role="listitem">
                                                <span className="num">①</span> 다른 회원의 아이디를 부정 사용하는 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">②</span> 범죄행위를 목적으로 하거나 기타 범죄행위와 관련된 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">③</span> 선량한 풍속, 기타 사회질서를 해하는 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">④</span> 당 사이트 및 타인의 명예를 훼손하거나 모욕하는 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑤</span> 당 사이트 및 타인의 저작권 등 지적재산권에 대한 권리를 침해하는 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑥</span> 해킹행위 또는 컴퓨터 바이러스의 유포 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑦</span> 타인의 의사에 반하여 광고성 정보 등을 지속적으로 전송하는 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑧</span> 서비스의 안정적인 운영에 지장을 주거나 줄 우려가 있는 일체의 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑨</span> 당 사이트에 게시된 정보를 변경하는 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑩</span> 타인의 개인정보를 수집·저장하는 행위
                                            </li>
                                            <li role="listitem">
                                                <span className="num">⑪</span> 법률, 계약에 의하여 이용할 수 없는 내용을 게시·전송하는 행위
                                            </li>
                                        </ol>
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제21조 (사용자의 행동규범, 서비스 이용제한 등)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트는 전항에도 불구하고, 주민등록법을 위반한 명의도용, 저작권법 및 컴퓨터프로그램보호법을 위반한 불법 프로그램의 제공 및 운영 방해, 정보통신망법을 위반한 불법통신 및 해킹, 악성 프로그램의 배포 등 관련 법을 위반한 경우에는 즉시 영구이용정지를 할 수 있습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        회원이 제공하는 정보의 내용이 허위인 것으로 판명되거나 그러하다고 의심할 만한 합리적인 사유가 발생할 경우, 당 사이트가 서비스 사용을 일부 또는 전부 중지할 수 있으며, 이로 인해 발생하는 불이익에 대해 책임을 부담하지 아니합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        회원이 서비스를 통하여 게시, 전송, 입수한 모든 형태의 정보에 대하여는 귀하가 모든 책임을 부담하며 당 사이트가 어떠한 책임도 부담하지 아니합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">5.</span>
                                        당 사이트는 자체 제공이 아닌 가입자 또는 기타 유관기관이 제공하는 서비스의 내용상 정확성, 완전성 및 질에 대하여 보장하지 않습니다. 따라서 당 사이트는 귀하가 위 내용을 이용함으로 인하여 입게 된 모든 종류의 손실이나 손해에 대하여 책임을 부담하지 아니합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">6.</span>
                                        본 조에 따라 서비스 이용을 제한하거나 계약을 해지하는 경우 반드시 회원에게 통지합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">7.</span>
                                        회원은 본 조에 따른 이용 제한 등에 대해 당 사이트가 정한 절차에 따라 이의신청을 할 수 있습니다. 이의가 정당하다고 인정되는 경우 즉시 서비스 이용을 재개합니다.
                                    </li>
                                </ol>
                            </li>
                        </ul>
                    </div>
                    <hr />
                    <div>
                        <h3 className="sec-tit">제4장 기타</h3>
                        <ul className="krds-info-list decimal point mt-12" role="list">
                            <li role="listitem">
                                <strong className="point">제22조 (양도금지)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        회원이 서비스의 이용권한, 기타 이용계약상 지위를 타인에게 양도·증여할 수 없으며, 이를 담보로 제공할 수 없습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제23조 (손해배상)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        당 사이트는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도, 당 사이트가 고의로 행한 범죄행위를 제외하고는 이에 대하여 책임을 부담하지 아니합니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제24조 (면책조항)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트는 제12조에 따라 서비스가 중지됨으로써 이용자에게 손해가 발생하더라도 이로 인한 책임을 부담하지 않습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        당 사이트는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여는 책임을 지지 않습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">3.</span>
                                        당 사이트는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">4.</span>
                                        당 사이트는 서비스에 표출된 어떠한 의견이나 정보에 대해 회원이나 제3자에 의해 표출된 의견을 승인·반대·수정하지 않습니다. 당 사이트가 어떠한 경우라도 회원이 서비스에 담긴 정보에 의존해 얻은 이득이나 입은 손해에 대해 책임이 없습니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">5.</span>
                                        당 사이트는 회원 간 또는 회원과 제3자 간에 서비스를 매개로 한 물품거래 혹은 금전적 거래 등과 관련하여 어떠한 책임도 부담하지 아니하고, 회원이 서비스의 이용과 관련하여 기대하는 이익에 관하여 책임을 부담하지 않습니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">제25조 (준거법 및 관할 법원)</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        당 사이트와 회원 간 제기된 소송은 대한민국 법을 준거법으로 합니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        본 서비스 이용과 관련하여 발생한 분쟁에 대해 소송이 제기될 경우 중소기업기술정보진흥원 소재지를 관할하는 법원을 관할 법원으로 합니다.
                                    </li>
                                </ol>
                            </li>
                            <li role="listitem">
                                <strong className="point">부칙</strong>
                                <ol className="calc-list krds-info-list ordered" role="list">
                                    <li role="listitem">
                                        <span className="num">1.</span>
                                        본 약관은 2026년 06월 00일부터 시행됩니다.
                                    </li>
                                    <li role="listitem">
                                        <span className="num">2.</span>
                                        본 약관에 대한 저작권은 중소기업기술정보진흥원에 귀속하며 무단 복제, 배포, 전송, 기타 저작권 침해행위를 엄금합니다.
                                    </li>
                                </ol>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default UI_USR_R_564;
