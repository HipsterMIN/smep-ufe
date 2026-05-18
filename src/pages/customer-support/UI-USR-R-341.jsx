import { useEffect, useMemo, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

const OBJECTIVE_TYPES = new Set(['MLCH', 'ASCT']);
const TEXTAREA_MAX_LENGTH = 100;
const DAILY_SUBMISSION_STORAGE_PREFIX = 'survey:dailySubmitted';
const DAILY_SUBMISSION_LIMIT_MESSAGE = '이미 오늘 고객 만족도 조사를 제출하셨습니다. 내일 다시 참여해주세요.';

const normalizeResponse = (response) => response?.data ?? response ?? null;
const toQuestionKey = (qstnNo) => String(qstnNo ?? '');
const toItemKey = (qitemNo) => String(qitemNo ?? '');
const trimText = (value) => String(value ?? '').trim();

const getLocalDateKey = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getDailySubmissionStorageKey = (srvyNo) => {
  const normalizedSurveyNo = String(srvyNo ?? '').trim();
  if (!normalizedSurveyNo) return '';
  return `${DAILY_SUBMISSION_STORAGE_PREFIX}:${normalizedSurveyNo}:${getLocalDateKey()}`;
};

const hasSubmittedToday = (srvyNo) => {
  const storageKey = getDailySubmissionStorageKey(srvyNo);
  if (!storageKey || typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(storageKey) === '1';
  } catch {
    // 의도: 브라우저 저장소가 막힌 환경에서도 화면이 중단되지 않게 한다.
    // 동작: localStorage 조회 실패 시 미제출 상태로 보고 서버의 중복 제한에 맡긴다.
    // 주의: 비로그인 사용자는 이 경우 같은 브라우저 기준 차단이 적용되지 않을 수 있다.
    return false;
  }
};

const markSubmittedToday = (srvyNo) => {
  const storageKey = getDailySubmissionStorageKey(srvyNo);
  if (!storageKey || typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(storageKey, '1');
  } catch {
    // 의도: 제출 성공 후 같은 브라우저의 재제출을 막되 저장소 예외로 제출 흐름을 깨지 않는다.
    // 동작: localStorage 기록 실패는 무시하고 로그인 사용자는 서버 중복 제한에 맡긴다.
    // 주의: 비로그인 사용자는 저장소 차단/삭제 시 브라우저 기준 제한이 우회될 수 있다.
  }
};

const isDuplicateSubmissionError = (error) =>
  error?.status === 409 || error?.data?.code === 'COMMON_401';

const sortQuestions = (questions) =>
  [...(Array.isArray(questions) ? questions : [])].sort((a, b) => {
    const sortA = Number(a?.sortSeq ?? Number.MAX_SAFE_INTEGER);
    const sortB = Number(b?.sortSeq ?? Number.MAX_SAFE_INTEGER);
    if (sortA !== sortB) return sortA - sortB;
    return Number(a?.qstnNo ?? 0) - Number(b?.qstnNo ?? 0);
  });

const sortItems = (items) =>
  [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const sortA = Number(a?.sortSeq ?? Number.MAX_SAFE_INTEGER);
    const sortB = Number(b?.sortSeq ?? Number.MAX_SAFE_INTEGER);
    if (sortA !== sortB) return sortA - sortB;
    return Number(a?.qitemNo ?? 0) - Number(b?.qitemNo ?? 0);
  });

const getMaxSelection = (question) => {
  const parsed = Number(question?.ansMaxChcNocs);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
};

const UI_USR_R_341 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [submittedToday, setSubmittedToday] = useState(false);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const sortedQuestions = useMemo(
    () => sortQuestions(survey?.questions),
    [survey?.questions],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentSurvey = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setLoadError('');

        // 진행중 설문 1건 조회(없으면 null)
        const response = await apiClient.get('/api/v1/surveys/current');
        const data = normalizeResponse(response);

        if (!isMounted) return;
        setSurvey(data || null);
        setSubmittedToday(data?.srvyNo ? hasSubmittedToday(data.srvyNo) : false);
      } catch (error) {
        if (!isMounted) return;
        setSurvey(null);
        setSubmittedToday(false);
        setLoadError(error?.data?.message || error?.message || '설문 정보를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCurrentSurvey();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const getAnswerState = (qstnNo) => {
    const key = toQuestionKey(qstnNo);
    return answers[key] ?? { ansCn: '', selectedQitemNos: [] };
  };

  const setSubjectiveAnswer = (qstnNo, value) => {
    const key = toQuestionKey(qstnNo);
    const nextValue = String(value ?? '').slice(0, TEXTAREA_MAX_LENGTH);
    setAnswers((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { ansCn: '', selectedQitemNos: [] }),
        ansCn: nextValue,
      },
    }));
  };

  const toggleObjectiveItem = (qstnNo, qitemNo, maxSelection) => {
    const questionKey = toQuestionKey(qstnNo);
    const itemKey = toItemKey(qitemNo);

    setAnswers((prev) => {
      const current = prev[questionKey] ?? { ansCn: '', selectedQitemNos: [] };
      const selected = Array.isArray(current.selectedQitemNos) ? current.selectedQitemNos : [];
      const alreadySelected = selected.includes(itemKey);

      let nextSelected = selected;
      if (maxSelection <= 1) {
        // 단일선택(라디오 동작)
        nextSelected = alreadySelected ? [] : [itemKey];
      } else if (alreadySelected) {
        nextSelected = selected.filter((value) => value !== itemKey);
      } else if (selected.length >= maxSelection) {
        alert(`최대 ${maxSelection}개까지 선택할 수 있습니다.`);
        return prev;
      } else {
        nextSelected = [...selected, itemKey];
      }

      return {
        ...prev,
        [questionKey]: {
          ...current,
          selectedQitemNos: nextSelected,
        },
      };
    });
  };

  const validateBeforeSubmit = () => {
    if (!survey || sortedQuestions.length === 0) {
      alert('진행중인 설문이 없습니다.');
      return false;
    }

    for (const question of sortedQuestions) {
      const answerState = getAnswerState(question?.qstnNo);
      const isRequired = String(question?.ansEsntlYn ?? '').toUpperCase() === 'Y';
      const answerType = String(question?.qstnAnsTypeCd ?? '').toUpperCase();
      const questionTitle = question?.qstnCn || '문항';

      if (answerType === 'SBJV') {
        // 주관식 필수값 검증
        if (isRequired && trimText(answerState.ansCn) === '') {
          alert(`필수 문항에 응답해 주세요.\n${questionTitle}`);
          return false;
        }
        continue;
      }

      if (OBJECTIVE_TYPES.has(answerType)) {
        // 선택형 최대선택/유효선택/필수값 검증
        const maxSelection = getMaxSelection(question);
        const selected = Array.isArray(answerState.selectedQitemNos) ? answerState.selectedQitemNos : [];

        if (selected.length > maxSelection) {
          alert(`선택 가능한 항목 수를 초과했습니다.\n${questionTitle}`);
          return false;
        }

        const validItemSet = new Set(sortItems(question?.items).map((item) => toItemKey(item?.qitemNo)));
        const hasInvalidItem = selected.some((selectedItem) => !validItemSet.has(selectedItem));
        if (hasInvalidItem) {
          alert(`유효하지 않은 선택항목이 포함되어 있습니다.\n${questionTitle}`);
          return false;
        }

        if (isRequired && selected.length === 0) {
          alert(`필수 문항에 응답해 주세요.\n${questionTitle}`);
          return false;
        }
      }
    }

    return true;
  };

  const buildSubmitPayload = () => {
    const payload = [];

    for (const question of sortedQuestions) {
      const answerState = getAnswerState(question?.qstnNo);
      const isRequired = String(question?.ansEsntlYn ?? '').toUpperCase() === 'Y';
      const answerType = String(question?.qstnAnsTypeCd ?? '').toUpperCase();
      const qstnNo = Number(question?.qstnNo);
      if (!Number.isFinite(qstnNo)) {
        continue;
      }

      if (answerType === 'SBJV') {
        const ansCn = trimText(answerState.ansCn);
        // 비필수 주관식 공백은 전송 제외
        if (!isRequired && ansCn === '') {
          continue;
        }
        payload.push({
          qstnNo,
          ansCn,
          selectedQitemNos: [],
        });
        continue;
      }

      if (OBJECTIVE_TYPES.has(answerType)) {
        const selectedQitemNos = (Array.isArray(answerState.selectedQitemNos) ? answerState.selectedQitemNos : [])
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));

        // 비필수 선택형 미선택은 전송 제외
        if (!isRequired && selectedQitemNos.length === 0) {
          continue;
        }

        payload.push({
          qstnNo,
          ansCn: null,
          selectedQitemNos,
        });
      }
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (submittedToday || hasSubmittedToday(survey?.srvyNo)) {
      setSubmittedToday(true);
      alert(DAILY_SUBMISSION_LIMIT_MESSAGE);
      return;
    }

    if (!validateBeforeSubmit()) return;

    const payload = buildSubmitPayload();
    if (payload.length === 0) {
      alert('제출할 응답이 없습니다.');
      return;
    }

    try {
      setSubmitting(true);
      // 저장 호출은 "설문완료" 클릭 시에만 실행
      const response = await apiClient.post(`/api/v1/surveys/${survey?.srvyNo}/answers`, {
        answers: payload,
      });
      const data = normalizeResponse(response);
      const serverMessage = response?.message || data?.message;

      markSubmittedToday(survey?.srvyNo);
      setSubmittedToday(true);
      setAnswers({});
      alert(serverMessage || '설문 응답이 제출되었습니다.');
    } catch (error) {
      if (isDuplicateSubmissionError(error)) {
        markSubmittedToday(survey?.srvyNo);
        setSubmittedToday(true);
        alert(DAILY_SUBMISSION_LIMIT_MESSAGE);
        return;
      }

      alert(error?.data?.message || error?.message || '설문 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">고객 만족도 조사</h2>
        </div>

        {loading ? (
          <div className="txt-box bg-white">
            <p>설문 정보를 불러오는 중입니다.</p>
          </div>
        ) : loadError ? (
          <div className="txt-box bg-white">
            <p>{loadError}</p>
            <div className="onboard-btm-btngroup btn-single bt-0">
              <div>
                <button
                  type="button"
                  className="krds-btn tertiary medium"
                  onClick={() => setReloadKey((prev) => prev + 1)}
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        ) : !survey ? (
          <div className="txt-box bg-white">
            <p>현재 진행중인 설문이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="txt-box bg-white">
              <div className="box-cnt gap-40">
                {sortedQuestions.map((question, index) => {
                  const qstnNo = question?.qstnNo;
                  const answerState = getAnswerState(qstnNo);
                  const isRequired = String(question?.ansEsntlYn ?? '').toUpperCase() === 'Y';
                  const answerType = String(question?.qstnAnsTypeCd ?? '').toUpperCase();
                  const maxSelection = getMaxSelection(question);
                  const items = sortItems(question?.items);

                  return (
                    <div className="box-sec" key={toQuestionKey(qstnNo)}>
                      <h4 className="box-tit2">
                        {index + 1}. {question?.qstnCn || '-'}
                        {isRequired && <em className="txt-caution">(필수)</em>}
                      </h4>

                      {answerType === 'SBJV' ? (
                        <div className="form-group">
                          <div className="form-conts">
                            <div className="textarea-wrap">
                              <textarea
                                className="krds-input medium"
                                placeholder="내용을 입력해 주세요."
                                title="내용 입력"
                                value={answerState.ansCn}
                                maxLength={TEXTAREA_MAX_LENGTH}
                                onChange={(event) => setSubjectiveAnswer(qstnNo, event.target.value)}
                              />
                              <p className="textarea-count">
                                <span className="count-now">{String(answerState.ansCn ?? '').length}</span>
                                <span className="count-total">/{TEXTAREA_MAX_LENGTH}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="form-group">
                          <div className="form-conts">
                            <div className="row krds-check-area chk-column">
                              {items.map((item) => {
                                const qitemKey = toItemKey(item?.qitemNo);
                                const checked = answerState.selectedQitemNos.includes(qitemKey);
                                const inputId = `srvy-${toQuestionKey(qstnNo)}-${qitemKey}`;
                                const inputType = maxSelection <= 1 ? 'radio' : 'checkbox';
                                const label = item?.qitemNm || '-';

                                return (
                                  <div className="krds-form-check large" key={inputId}>
                                    <input
                                      type={inputType}
                                      name={`srvy-${toQuestionKey(qstnNo)}`}
                                      id={inputId}
                                      checked={checked}
                                      onChange={() => toggleObjectiveItem(qstnNo, item?.qitemNo, maxSelection)}
                                    />
                                    <label htmlFor={inputId}>{label}</label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="onboard-btm-btngroup btn-single bt-0">
              <div>
                <button
                  type="button"
                  className="krds-btn primary xlarge"
                  onClick={handleSubmit}
                  disabled={submitting || submittedToday}
                >
                  {submittedToday ? '제출 완료' : submitting ? '제출중...' : '설문완료'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UI_USR_R_341;
