import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../styles/img/ai_chat_logo.svg';
import LngImg from '../../styles/img/lnb_img.png';


const AiChat = () => {
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  
  useEffect(() => {
    const stored = sessionStorage.getItem('ai_chat_selected_programs');
    if (stored) {
      try {
        setSelectedPrograms(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse selected programs', e);
      }
    }
  }, []);

  // 'smile', 'sad',  null (선택 없음)
  const [status, setStatus] = useState(null);
  // 리스트 더보기
  const [showList, setShowList] = useState(false);

  // 현재 상담의 메인 프로그램 (첫 번째 선택된 프로그램 또는 전체 상담 시 첫 번째)
  const mainProgram = selectedPrograms[0];

  const handleToggle = (type) => {
    // 이미 클릭된 걸 다시 누르면 선택 해제, 아니면 해당 타입으로 변경
    setStatus(prev => prev === type ? null : type);
  };

  const showMoreList = () => {
    setShowList(true);
  };
  

  return (
    <>
      <div className="ai-chat-wrap">
        {/* sidebar */}
        <div className="ai-sidebar">
          {/* 상단 로고 */}
          <div className="sidebar-logo">
            <Link to="#" className="sidebar-logo-link">
              <img src={Logo} alt="logo" />
            </Link>
          </div>
          <div className="sidebar-filter hide-scrollbar">
            <img src={LngImg} alt="" />
          </div>
          <button type="button" className="krds-btn primary medium">결과 내 재검색하기</button>
        </div>

        {/* container */}
        <div className="ai-container">
          <div className="chat-section">
            <div className="chat-box">

              {/* 질문 영역 */}
              <div className="question-wrap">
                {/* 말풍선 */}
                <div className="question-box">
                  <div className="question-bubble">
                    <span>매출 3억이면 어떤 공고 가능해?</span>
                  </div>
                </div>
                {/* 질문 case */}
                <ul className="krds-structured-list type-full small">
                  {selectedPrograms.length > 0 ? (
                    selectedPrograms.map((program) => (
                      <li key={program.id} className="structured-item">
                        <div className="in">
                          <div className="card-top">
                            <div className="krds-badge-wrap">
                              <span className="krds-badge bg-light-primary">{program.supportField}</span>
                              <span className="krds-badge bg-primary number">D-Day</span>
                            </div>
                          </div>
                          <div className="card-body">
                            <a href="#" className="c-text">
                              <p className="c-tit visited sml no-icon"><span className="span">{program.title}</span></p>
                              <p className="on-list-btm">
                                <span>
                                  <i className="svg-icon ico-building"></i>
                                  {program.agency}
                                </span>
                                <span>
                                  {program.startDate} ~ {program.endDate || '상시접수'}
                                </span>
                              </p>
                              <div className="krds-tag-wrap">
                                {program.tags?.slice(0, 3).map((tag, i) => (
                                  <span key={i} className={`krds-btn-tag ${i === 0 ? 'point' : ''}`}>#{tag}</span>
                                ))}
                                {!program.tags && (
                                  <>
                                    <span className="krds-btn-tag point">#지원사업</span>
                                    <span className="krds-btn-tag">#중소기업</span>
                                  </>
                                )}
                              </div>
                            </a>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="structured-item">
                      <div className="in">
                        <div className="card-top">
                          <div className="krds-badge-wrap">
                            <span className="krds-badge bg-light-primary">기술</span>
                            <span className="krds-badge bg-primary number">D-234</span>
                          </div>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text">
                            <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                            <p className="on-list-btm">
                              <span>
                                <i className="svg-icon ico-building"></i>
                                 중소벤처기업진흥공단
                              </span>
                              <span>
                                2025.10.24 ~ 2025.11.19
                              </span>
                            </p>
                            <div className="krds-tag-wrap">
                              <span className="krds-btn-tag point">#최대 5천만원</span>
                              <span className="krds-btn-tag">#벤처기업</span>
                              <span className="krds-btn-tag">#청년기업</span>
                              <span className="krds-btn-tag">#창업기업</span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* 답변 영역 */}
              <div className="answer-wrap">
                {/* 답변 내용 */}
                <div className="answer-box">
                  <div className="answer-title">
                    <i className="ico-answer"></i>
                    <p>{mainProgram ? mainProgram.title : 'AI 상담 중입니다.'}</p>
                  </div>
                  <div className="answer-conts-inner">
                    <div className="answer-guide-box">
                      <p>사용자는 "{mainProgram ? mainProgram.title : '선택된 지원사업'}"에 대한 정보를 찾고 있습니다.</p>
                    </div>
                    <div className="answer-content">
                      <strong className="content-title">종합 판단</strong>
                      <p className="content-desc" style={{ whiteSpace: 'pre-wrap' }}>
                        {mainProgram ? (mainProgram.aiAnalysis || '검색 결과, 해당 지원사업에 대한 공고문서가 발견되었습니다.') : '검색 결과, 해당 지원사업에 대한 공고문서가 발견되었습니다.'}
                      </p>
                      {selectedPrograms.length > 1 && (
                        <>
                          <strong className="content-title">개별 공고 안내</strong>
                          <ul className="content-list">
                            {selectedPrograms.map((program) => (
                              <li key={program.id}>
                                <strong>{program.title}</strong>
                                <p className="content-desc" style={{ whiteSpace: 'pre-wrap' }}>{program.bizOutline}</p>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                    {/* link text */}
                    {mainProgram && (
                      <div className="helper-box refer">
                        <p className="link-text">
                          {mainProgram.title}
                          <Link to={`/service/pbanc/${mainProgram.id}`} className="link-btn" target="_blank">
                            <span className="sr-only">링크 이동</span>
                            <i className="svg-icon ico-link"></i>
                          </Link>
                        </p>
                      </div>
                    )}
                    {/* 추천 질문 */}
                    <div className="recommend-question">
                      <h3 className="gradient-text">다음과 같은 질문을 해보세요</h3>
                      <ul className="question-list">
                        <li className="question-item">
                          <span>Q</span>
                          <p className="question-text">{mainProgram ? `${mainProgram.title.slice(0, 30)}... 신청 자격은?` : '지원사업 신청 자격은?'}</p>
                        </li>
                        <li className="question-item">
                          <span>Q</span>
                          <p className="question-text">신청 방법과 필요 서류는?</p>
                        </li>
                        <li className="question-item">
                          <span>Q</span>
                          <p className="question-text">지원 혜택은 무엇인가요?</p>
                        </li>
                      </ul>
                    </div>
                    {/* 아이콘 평가 */}
                    <div className="option-btn-box">
                      <button type="button" className="option-btn btn-smile" onClick={() => handleToggle('smile')}>
                        <i className={`svg-icon ico-smile ${status === 'smile' ? 'is-active' : ''}`}></i>
                      </button>
                      <button type="button" className="option-btn btn-sad" onClick={() => handleToggle('sad')}>
                        <i className={`svg-icon ico-sad ${status === 'sad' ? 'is-active' : ''}`}></i>
                      </button>
                      <button type="button" className="option-btn btn-copy"><i className="svg-icon ico-copy"></i></button>
                    </div>
                  </div>{/* answer-conts-inner */}
                </div> {/* answer-box */}

              {/* 오른쪽 추천 공고 */}
              <div className="announcement-cont" style={{ minHeight: '580px' }}>
                <div className="ai-type">
                  <div className="on-ai-type-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', backgroundColor: '#052B57', padding: '10px 16px', borderRadius: '8px' }}>
                    <span style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>추천 지원공고</span>
                  </div>
                  <ul className={`krds-structured-list type-full ${showList ? 'is-active' : ''}`}>
                    {selectedPrograms.map((program) => (
                      <li key={program.id} className="structured-item">
                        <div className="in">
                          <div className="card-top">
                            <div className="krds-badge-wrap">
                              <span className="krds-badge bg-white">{program.supportField}</span>
                              <span className="krds-badge bg-primary number">D-Day</span>
                            </div>
                          </div>
                          <div className="card-body">
                            <Link to={`/service/pbanc/${program.id}`} className="c-text">
                              <p className="c-tit visited sml no-icon"><span className="span">{program.title}</span></p>
                              <p className="on-list-btm">
                                <span>
                                  <i className="svg-icon ico-building"></i>
                                  {program.agency}
                                </span>
                                <span>
                                  {program.startDate} ~ {program.endDate || '상시접수'}
                                </span>
                              </p>
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {selectedPrograms.length > 4 && (
                    <button className="krds-btn white full medium" onClick={showMoreList}>
                      더보기
                      <i className="svg-icon ico-angle down"></i>
                    </button>
                  )}
                </div>
              </div>
              </div> {/* //answer-wrap */}
            </div> {/* //chat-box */}
          </div> {/* chat-section */}

          {/* bottom search */}
          <div className="ai-bottom-search">
            <div className="bottom-search">
              <div className="search-field-wrap">
                <div className="search-field">
                  <button type="button" className="input-btn btn-upload"><span className="sr-only">이미지 업로드</span><i className="svg-icon ico-upload"></i></button>
                  <input type="text" placeholder="사업공고와 관련된 궁금한 점을 입력해주세요" title="검색 입력" className="search-input"/>
                  <button type="button" className="input-btn btn-refresh"><span className="sr-only">새로고침</span><i className="svg-icon ico-refresh"></i></button>
                </div>
                <button type="button" className="btn-search"><span className="sr-only">ai 검색</span> <i className="svg-icon ico-sch"></i></button>
              </div>
            </div>

            <p className="ai-bottom-guide">중소기업 지원정보 중심으로 안내되며, 일반 상식이나 개인 질문에는 답변이 제한될 수 있습니다.</p>
          </div> {/* //bottom-search */}
        </div> {/* //ai-container */}

      </div> {/* //ai-chat-wrap */}
    </>
  );
};

export default AiChat;
