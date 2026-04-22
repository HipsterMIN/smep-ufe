import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useEffect, useState } from 'react';
import { useMatches } from 'react-router-dom';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import {
  fetchCorporateMemberDetail,
  normalizeDigits,
} from './company/companyMemberUtils.js';

const EMPTY_FORM_VALUES = {
  loginId: '',
  mbrNm: '',
  brno: '',
  crno: '',
  rprsvNm: '',
  rprsTelnoParts: ['', '', ''],
  rprsFxnoParts: ['', '', ''],
  emailLocal: '',
  emailDomain: '',
  zip: '',
  entAddr: '',
  entDaddr: '',
  hmpgAddr: '',
};

// JWT payload를 디코딩해 회원번호와 로그인 아이디 claim을 읽는다.
const decodeJwtPayload = (token) => {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - normalizedPayload.length % 4) % 4),
      '=',
    );

    return JSON.parse(atob(paddedPayload));
  } catch (error) {
    console.warn('Failed to decode access token payload.', error);
    return null;
  }
};

// 전화번호 문자열을 화면의 세 칸 입력값으로 분리한다.
const splitPhoneNumber = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return ['', '', ''];
  }

  if (raw.includes('-')) {
    const parts = raw.split('-');
    return [parts[0] || '', parts[1] || '', parts.slice(2).join('-') || ''];
  }

  const digits = normalizeDigits(raw);
  if (digits.length === 9) {
    return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5)];
  }
  if (digits.length === 10) {
    if (digits.startsWith('02')) {
      return [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6)];
    }
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)];
  }
  if (digits.length === 11) {
    return [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7)];
  }

  return [raw, '', ''];
};

// 이메일 문자열을 아이디와 도메인 입력값으로 분리한다.
const splitEmail = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return ['', ''];
  }

  const [localPart, ...domainParts] = raw.split('@');
  return [localPart || '', domainParts.join('@') || ''];
};

// 회원 상세 응답을 화면 입력값 상태로 변환한다.
const buildFormValues = (detail, tokenPayload) => {
  const [emailLocal, emailDomain] = splitEmail(detail?.emlAddr);
  return {
    ...EMPTY_FORM_VALUES,
    loginId: tokenPayload?.login_id || '',
    mbrNm: detail?.mbrNm || '',
    brno: detail?.brno || '',
    crno: detail?.crno || '',
    rprsvNm: detail?.rprsvNm || '',
    rprsTelnoParts: splitPhoneNumber(detail?.rprsTelno),
    rprsFxnoParts: splitPhoneNumber(detail?.rprsFxno),
    emailLocal,
    emailDomain,
    zip: detail?.zip || '',
    entAddr: detail?.entAddr || '',
    entDaddr: detail?.entDaddr || '',
    hmpgAddr: detail?.hmpgAddr || '',
  };
};

const UI_USR_W_411 = () => {

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const authToken = useAuthStore((state) => state.token);
  const [formValues, setFormValues] = useState(EMPTY_FORM_VALUES);

  // 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  const matches = useMatches();
  const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '회원정보변경';

  useEffect(() => {
    const tokenPayload = decodeJwtPayload(authToken);
    const mbrNo = tokenPayload?.member_no || tokenPayload?.sub;

    if (!mbrNo) {
      setFormValues((currentValues) => ({
        ...currentValues,
        loginId: tokenPayload?.login_id || '',
      }));
      return;
    }

    let active = true;

    // 회원번호로 기업회원 상세정보를 조회한다.
    const loadCorporateMemberDetail = async () => {
      try {
        const detail = await fetchCorporateMemberDetail(apiClient, mbrNo);
        if (!active) {
          return;
        }
        setFormValues(buildFormValues(detail, tokenPayload));
      } catch (error) {
        console.error('Failed to load corporate member detail:', error);
      }
    };

    loadCorporateMemberDetail();

    return () => {
      active = false;
    };
  }, [authToken]);

  // 입력값 상태를 단일 필드 기준으로 갱신한다.
  const setFormValue = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  // 전화번호와 팩스번호 입력값을 지정한 칸만 갱신한다.
  const setPhonePartValue = (field, index, value) => {
    setFormValues((currentValues) => {
      const nextParts = [...currentValues[field]];
      nextParts[index] = value;
      return {
        ...currentValues,
        [field]: nextParts,
      };
    });
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
          <h2 className="h-tit">{pageTitle}</h2>
        </div>

        <p className="guide-txt">
          <span className="guide-txt-check">
            <i className="svg-icon ico-checkbox"></i>
          </span>
          회원정보는 개인정보처리방침에 따라 안전하게 보호되며, 회원님의 명백한 동의 없이 공개 또는 제 3자에게 제공되지 않습니다.</p>

        <div className="conts-wrap mt-64">
          <div className="on-form-register">
            <h3 className="form-title">회원정보 변경</h3>
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">이름</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">{formValues.loginId}</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_01">기업명</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input type="text" id="input_01" className="krds-input small" value={formValues.mbrNm} disabled></input>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_02">사업자등록번호</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input type="text" id="input_02" className="krds-input small" value={formValues.brno} disabled></input>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_03">법인등록번호</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input type="text" id="input_03" className="krds-input small" value={formValues.crno} disabled></input>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_04">대표자 이름</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input type="text" id="input_04" className="krds-input small" value={formValues.rprsvNm} onChange={(event) => setFormValue('rprsvNm', event.target.value)} />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="select_01">대표 전화</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper row-small">
                    <select className="krds-form-select small w-120" id="select_01" value={formValues.rprsTelnoParts[0]} onChange={(event) => setPhonePartValue('rprsTelnoParts', 0, event.target.value)}>
                      <option value={formValues.rprsTelnoParts[0]}>{formValues.rprsTelnoParts[0] || '선택'}</option>
                    </select>
                    <span>-</span>
                    <input type="text" className="krds-input small w-120" placeholder="0000" title="대표전화 중간번호 입력" value={formValues.rprsTelnoParts[1]} onChange={(event) => setPhonePartValue('rprsTelnoParts', 1, event.target.value)} />
                    <span>-</span>
                    <input type="text" className="krds-input small w-120" placeholder="0000" title="대표전화 끝번호 입력" value={formValues.rprsTelnoParts[2]} onChange={(event) => setPhonePartValue('rprsTelnoParts', 2, event.target.value)} />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="select_02">팩스 번호</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper row-small">
                    <select className="krds-form-select small w-120" id="select_02" value={formValues.rprsFxnoParts[0]} onChange={(event) => setPhonePartValue('rprsFxnoParts', 0, event.target.value)}>
                      <option value={formValues.rprsFxnoParts[0]}>{formValues.rprsFxnoParts[0] || '선택'}</option>
                    </select>
                    <span>-</span>
                    <input type="text" className="krds-input small w-120" placeholder="0000" title="팩스번호 중간번호 입력" value={formValues.rprsFxnoParts[1]} onChange={(event) => setPhonePartValue('rprsFxnoParts', 1, event.target.value)} />
                    <span>-</span>
                    <input type="text" className="krds-input small w-120" placeholder="0000" title="팩스번호 끝번호 입력" value={formValues.rprsFxnoParts[2]} onChange={(event) => setPhonePartValue('rprsFxnoParts', 2, event.target.value)} />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_05">이메일</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper row-small">
                    <input type="text" id="input_05" className="krds-input small w-140" placeholder="0000" title="이메일 아이디 입력" value={formValues.emailLocal} onChange={(event) => setFormValue('emailLocal', event.target.value)}/>
                    <span>@</span>
                    <input type="text" className="krds-input small w-140" placeholder="0000" title="이메일 도메인 입력" value={formValues.emailDomain} onChange={(event) => setFormValue('emailDomain', event.target.value)} />
                    <span>-</span>
                    <select className="krds-form-select small w-140" title="이메일 선택">
                      <option value="">직접입력</option>
                    </select>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label flex-start">
                  <label htmlFor="input_06">회사주소</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper row-small">
                    <input type="text" id="input_06" className="krds-input small w-150" placeholder="-" value={formValues.zip} onChange={(event) => setFormValue('zip', event.target.value)} />
                    <button type="button" className="krds-btn secondary small">우편번호 검색</button>
                  </div>
                  <div className="form-wrapper">
                    <input type="text" className="krds-input small w-460" placeholder="-" value={formValues.entAddr} onChange={(event) => setFormValue('entAddr', event.target.value)} />
                  </div>
                  <div className="form-wrapper">
                    <input type="text" className="krds-input small w-460" placeholder="상세 주소 입력" value={formValues.entDaddr} onChange={(event) => setFormValue('entDaddr', event.target.value)} />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_07">홈페이지 주소</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <input type="text" id="input_07" className="krds-input small w-220" placeholder='-' value={formValues.hmpgAddr} onChange={(event) => setFormValue('hmpgAddr', event.target.value)} />
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 기업관리자 정보 */}
        <div className="conts-wrap mt-64">
          <div className="on-form-register">
            <h3 className="form-title">기업관리자 정보</h3>
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">아이디</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">{formValues.loginId}</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">휴대전화번호</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">--</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">유선전화</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">--</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">이메일</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">--</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">부서명</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">경영지원팀</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">직위</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">대표</span>
                </dd>
              </div>
            </dl>
          </div>
          <ul className="info-list-point">
            <li><i className="svg-icon ico-checkbox"></i>기업관리자 정보변경은 개인회원 마이페이지에서 변경이 가능합니다.</li>
          </ul>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit3">관심 분야 설정</h3>
          <div className="flex-between center">
            <p className="cont-desc">관심을 갖고 있는 분야를 선택하시면, 빠르고 정확한 지원사업 검색이 가능합니다.</p>
            <button type="button" className="krds-btn secondary small">인증키 신청</button>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit3">알림 수신 동의</h3>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">중소벤처24의 알림을 받으시겠습니까?</li>
            <li role="listitem">중소벤처24의 알림은 이메일과 SMS 또는 알림톡으로 발송되며, 정책자금 상담, Q&A, 민원 등의 처리현황정보가 발송됩니다.</li>
          </ul>
          <div className="on-form-register mt-16">
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="receive-label">수신방법</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="receive-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="receive"
                          id="message"
                        />
                        <label htmlFor="message">문자</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="receive"
                          id="kakaotalk"
                        />
                        <label htmlFor="kakaotalk">알림톡(카카오톡)</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="emailreceive-label">이메일 수신</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="emailreceive-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="receive"
                          id="email_on"
                        />
                        <label htmlFor="email_on">예</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="receive"
                          id="email_off"
                        />
                        <label htmlFor="email_off">아니오</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit3">맞춤 알림 서비스 선택</h3>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">중소벤처24의 정책금융 상품, 사업공고, 증명서 발급 현황 등의 맞춤형 알림 서비스를 받아 보실 수 있습니다. 알림 수신 방법은 알림 수신 동의에서 선택하신 방법으로 발송됩니다.</li>
          </ul>
          <div className="on-form-register mt-16">
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="business-label">사업공고</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="business-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="business"
                          id="business_on"
                        />
                        <label htmlFor="business_on">받기</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="business"
                          id="business_off"
                        />
                        <label htmlFor="business_off">끄기</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>

              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="policy-label">정책금융 상품</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="policy-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="policy"
                          id="policy_on"
                        />
                        <label htmlFor="policy_on">받기</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="policy"
                          id="policy_off"
                        />
                        <label htmlFor="policy_off">끄기</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>

              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="certificate-label">증명서 발급</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="certificate-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="certificate"
                          id="certificate_on"
                        />
                        <label htmlFor="certificate_on">받기</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="certificate"
                          id="certificate_off"
                        />
                        <label htmlFor="certificate_off">끄기</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
          <ul className="info-list-point">
            <li><i className="svg-icon ico-checkbox"></i>정보변경은 법인 공동인증서 인증 후 변경이 가능합니다.</li>
          </ul>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge">
              취소
            </button>
          </div>
          <div>
            <button type="button" className="krds-btn primary xlarge">
              저장
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default UI_USR_W_411;
