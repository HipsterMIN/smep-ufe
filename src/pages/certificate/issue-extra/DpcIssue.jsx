import React, { useState, useEffect } from 'react';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Popup from '@components/ui/Popup.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const DpcIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prdocNm, prdocCd, prdocIssuGdCn } = location.state || {};

  const [productList, setProductList]         = useState([]);
  const [selectedCode, setSelectedCode]       = useState('');
  const [isFetching, setIsFetching]           = useState(true);
  const [isIneligible, setIsIneligible]       = useState(false);
  const [isLoading, setIsLoading]             = useState(false);

  const [isSurveyOpen, setIsSurveyOpen]       = useState(false);
  const [isSurveyLoading, setIsSurveyLoading] = useState(false);
  const [surveyData, setSurveyData]           = useState(null);
  const [surveyProduct, setSurveyProduct]     = useState(null);
  const [surveyAnswers, setSurveyAnswers]     = useState({});
  const [isSurveySubmitting, setIsSurveySubmitting] = useState(false);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu  = getDepth1Parent();

  const brno = '2288105280'; // TODO: 로그인 사용자 사업자번호로 교체

  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetching(true);
      try {
        const response = await apiClient.get(`/api/v1/certificate/dpc/records?brno=${brno}`);
        if (response.data.resCd === '-1') {
          setIsIneligible(true);
        } else {
          setProductList(response.data.records);
        }
      } catch (e) {
        console.error('제품목록 조회 실패:', e);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProducts();
  }, []);

  const goBack = () => navigate(-1);

  const validate = () => {
    if (!selectedCode) {
      alert('발급받을 제품을 선택해주세요.');
      return false;
    }
    return true;
  };

  const handlePrint = async () => {
    if (!validate()) return;
    if (!window.confirm('증명서를 출력하시겠습니까?')) return;
    if (!prdocCd) { alert('증명서 코드가 없습니다.'); return; }

    try {
      setIsLoading(true);
      const prdocIssuAplyNo = await apiClient.post('/api/v1/certificate/issue', {
        prdocCd,
        brno,
        prdocIssuTypeCd: 'Y301',
        extraParams: { cmpetPrductCode: selectedCode },
      });

      window.open(
        `http://e-page.smes-tipa.go.kr/markany/report?prdocCd=${prdocCd}&prdocIssuAplyNo=${prdocIssuAplyNo}`,
        '_blank',
      );

      navigate('/mb/dash/UI_USR_L_510');
    } catch (e) {
      console.error('증명서 발급 실패:', e);
      alert('증명서 발급 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletClick = async () => {
    if (!validate()) return;
    if (!window.confirm('전자증명서 발급을 신청하시겠습니까?')) return;
    if (!prdocCd) { alert('증명서 코드가 없습니다.'); return; }

    try {
      setIsLoading(true);
      await apiClient.post('/api/v1/certificate/issue', {
        prdocCd,
        brno,
        prdocIssuTypeCd: 'Y302',
        extraParams: { cmpetPrductCode: selectedCode },
      });

      navigate('/mb/dash/UI_USR_L_510');
    } catch (e) {
      console.error('증명서 발급 실패:', e);
      alert('증명서 발급 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSurvey = async (item) => {
    try {
      setSurveyProduct(item);
      setIsSurveyLoading(true);
      setSurveyAnswers({});
      const response = await apiClient.get(`/api/v1/certificate/dpc/survey?brno=${brno}`);
      setSurveyData(response.data.record);
      setIsSurveyOpen(true);
    } catch (e) {
      console.error('설문조사 항목 조회 실패:', e);
      alert('설문조사 항목 조회 중 오류가 발생했습니다.');
    } finally {
      setIsSurveyLoading(false);
    }
  };

  const handleChangeObjective = (iemSn, exSn) => {
    setSurveyAnswers((prev) => ({ ...prev, [iemSn]: exSn }));
  };

  const handleChangeSubjective = (iemSn, value) => {
    setSurveyAnswers((prev) => ({ ...prev, [iemSn]: value }));
  };

  const handleSubmitSurvey = async () => {
    if (!surveyData || !surveyProduct) {
      alert('설문조사 정보가 없습니다.');
      return;
    }
    if (!validateSurveyAnswers()) return;

    try {
      setIsSurveySubmitting(true);

      const survey = (surveyData.evlsList || []).map((question) => {
        const answer = surveyAnswers[question.iemSn];
        if (question.objctYn === 'Y') {
          return { iemSn: question.iemSn, objctChoiseInfo: String(answer) };
        }
        return { iemSn: question.iemSn, sbjctInputInfo: String(answer).trim() };
      });

      await apiClient.post('/api/v1/certificate/dpc/survey', {
        bsnmNo: brno,
        bizCrtfcSeReq: prdocCd,
        cmpetPrductCode: surveyProduct.cmpetPrductCode,
        cmpMbrId: 'ucube', // TODO: 로그인 사용자 ID로 교체
        survey,
      });

      alert('설문조사가 정상적으로 제출되었습니다.');
      setIsSurveyOpen(false);

      setProductList((prev) =>
        prev.map((item) =>
          item.cmpetPrductCode === surveyProduct.cmpetPrductCode
            ? { ...item, qustnrYn: 'Y' }
            : item,
        ),
      );

      setSurveyData(null);
      setSurveyProduct(null);
      setSurveyAnswers({});
    } catch (e) {
      console.error('설문조사 제출 실패:', e);
      const status = e?.response?.status;
      const message = e?.response?.data?.message;
      if (status === 400 && message) {
        alert(message);
      } else {
        alert('설문조사 제출 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSurveySubmitting(false);
    }
  };

  const validateSurveyAnswers = () => {
    const questions = surveyData?.evlsList || [];
    for (const question of questions) {
      const answer = surveyAnswers[question.iemSn];
      if (question.objctYn === 'Y') {
        if (!answer) {
          alert(`${question.iemNm} 문항에 응답해주세요.`);
          return false;
        }
      } else {
        if (!answer || !String(answer).trim()) {
          alert(`${question.iemNm} 문항에 응답해주세요.`);
          return false;
        }
      }
    }
    return true;
  };

  if (isFetching) return <div>로딩 중...</div>;

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">{prdocNm} 발급</h2>
        </div>

        <div className="conts-wrap">
          <div className="txt-box outline">
            <h4 className="outline-tit">알려드립니다.</h4>
            <ul className="check-list">
              {prdocIssuGdCn
                ? prdocIssuGdCn.split('\n').filter((l) => l.trim()).map((line, i) => (
                  <li key={i}>{line.trim()}</li>
                ))
                : null}
            </ul>
          </div>
        </div>

        {isIneligible ? (
          <div className="conts-wrap mt-24">
            <div className="txt-box outline">
              <p>직접생산확인증명서 발급 대상 기업이 아닙니다.</p>
            </div>
          </div>
        ) : (
          <div className="conts-wrap mt-24">
            <h3 className="sec-tit">발급선택</h3>
            <div className="txt-box bg-white small">
              <ul className="select-list">
                {productList.map((item) => (
                  <li key={item.cmpetPrductCode}>
                    <div className="krds-form-check medium">
                      <input
                        type="radio"
                        name="radiogroup"
                        id={`radio_${item.cmpetPrductCode}`}
                        value={item.cmpetPrductCode}
                        checked={selectedCode === item.cmpetPrductCode}
                        onChange={() => setSelectedCode(item.cmpetPrductCode)}
                      />
                      <label htmlFor={`radio_${item.cmpetPrductCode}`}>
                        <div className="cont-inner">
                          <span className="sub-txt">
                            <em>경쟁제품코드</em>
                            {item.cmpetPrductCode}
                          </span>
                          {item.prductNm}
                        </div>
                      </label>
                    </div>

                    {item.qustnrYn !== 'Y' && (
                      <button
                        type="button"
                        className="krds-btn small primary"
                        onClick={() => handleOpenSurvey(item)}
                        disabled={isSurveyLoading}
                      >
                                설문조사
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={goBack}>
                취소
            </button>
          </div>
          {!isIneligible && (
            <div>
              <button
                type="button"
                className="krds-btn primary xlarge"
                onClick={handleWalletClick}
                disabled={isLoading}
              >
                    전자문서지갑
              </button>
              <button
                type="button"
                className="krds-btn primary xlarge"
                onClick={handlePrint}
                disabled={isLoading}
              >
                <i className="svg-icon ico-print"></i>
                {isLoading ? '발급 중...' : '출력'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ← 발급 유형 팝업 제거 */}

      <Popup
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        title={`직접생산확인 관련 만족도 설문조사 (${surveyProduct?.prductNm || ''})`}
        footer={(
          <>
            <button
              type="button"
              className="krds-btn tertiary medium"
              onClick={() => setIsSurveyOpen(false)}
              disabled={isSurveySubmitting}
            >
                    취소
            </button>
            <button
              type="button"
              className="krds-btn primary medium"
              onClick={handleSubmitSurvey}
              disabled={isSurveySubmitting}
            >
              {isSurveySubmitting ? '제출 중...' : '완료'}
            </button>
          </>
        )}
      >
        {isSurveyLoading ? (
          <div>설문조사 항목 조회 중...</div>
        ) : (
          <>
            <div className="guide-txt">
              <ul className="krds-info-list decimal" role="list">
                <li role="listitem">
                      본 설문지는 공공구매 조달시장의 공정한 업무처리를 위하여 직접생산확인을 받은 중소기업을 대상으로 실시하고 있습니다.
                </li>
                <li role="listitem">
                      귀사에서 직접생산확인을 받는 과정에서 느끼셨던 사항에 대하여 솔직하게 기재하여 주시기 바랍니다.
                </li>
                <li role="listitem">
                      본 설문지의 작성자는 철저히 비밀이 보장되오니 적극 협조하여 주시기 바랍니다.
                </li>
                <li role="listitem">
                      문의 : 한국중소벤처기업유통원
                </li>
              </ul>
            </div>

            <div className="form-groupbox">
              {surveyData?.evlsList?.map((question, idx) => (
                <div
                  key={question.iemSn}
                  className="form-item"
                  role={question.objctYn === 'Y' ? 'group' : undefined}
                  aria-labelledby={question.objctYn === 'Y' ? `question_${question.iemSn}` : undefined}
                >
                  <p className="form-question" id={`question_${question.iemSn}`}>
                    <span>{idx + 1}.</span> {question.iemNm}
                  </p>

                  {question.objctYn === 'Y' ? (
                    <div className="krds-check-area">
                      {question.exList?.map((example) => (
                        <div className="krds-form-check medium" key={example.exSn}>
                          <input
                            name={`question_${question.iemSn}`}
                            type="radio"
                            id={`chk_${question.iemSn}_${example.exSn}`}
                            checked={surveyAnswers[question.iemSn] === example.exSn}
                            onChange={() => handleChangeObjective(question.iemSn, example.exSn)}
                          />
                          <label htmlFor={`chk_${question.iemSn}_${example.exSn}`}>
                            {example.exNm}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="textarea-wrap">
                      <textarea
                        className="krds-input"
                        placeholder="내용을 입력하세요."
                        title={`${question.iemNm} 입력`}
                        value={surveyAnswers[question.iemSn] || ''}
                        onChange={(e) => handleChangeSubjective(question.iemSn, e.target.value)}
                      />
                      <p className="textarea-count">
                        <span className="count-now">
                          {(surveyAnswers[question.iemSn] || '').length}
                        </span>
                        <span className="count-total">/100</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Popup>
    </>
  );
};

export default DpcIssue;