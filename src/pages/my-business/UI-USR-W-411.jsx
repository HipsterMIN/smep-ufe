import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useEffect, useState } from 'react';
import { useMatches } from 'react-router-dom';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import CorporateMemberInfo from '@pages/my-business/member/components/CorporateMemberInfo.jsx';
import IndividualMemberInfo from '@pages/my-business/member/components/IndividualMemberInfo.jsx';
import {
  fetchCorporateManagerContact,
  fetchCorporateMemberDetail,
  fetchIndividualMemberDetail,
  fetchMemberInfoReceptionAgreements,
  normalizeDigits,
  updateCorporateMemberInfo,
  updateIndividualMemberInfo,
} from '@/pages/my-business/member/memberUtils.js';
import {
  decodeJwtPayload,
} from '@utils/commonUtils.js';

const INFO_RECEPTION_MNS_CODES = {
  message: 'A211',
  email: 'A212',
  kakaotalk: 'A213',
  business: 'A214',
  policyFinance: 'A215',
  certificate: 'A216',
};

const DEFAULT_INFO_RECEPTION_AGREEMENTS = {
  [INFO_RECEPTION_MNS_CODES.message]: 'N',
  [INFO_RECEPTION_MNS_CODES.email]: 'N',
  [INFO_RECEPTION_MNS_CODES.kakaotalk]: 'N',
  [INFO_RECEPTION_MNS_CODES.business]: 'N',
  [INFO_RECEPTION_MNS_CODES.policyFinance]: 'N',
  [INFO_RECEPTION_MNS_CODES.certificate]: 'N',
};

const EMPTY_FORM_VALUES = {
  loginId: '',
  mbrNm: '',
  brno: '',
  crno: '',
  rprsvNm: '',
  rprsTelno: '',
  indvMblTelno: '',
  indvGnrlTelno: '',
  indvGnrlTelnoParts: ['', '', ''],
  rprsTelnoParts: ['', '', ''],
  rprsFxnoParts: ['', '', ''],
  emailLocal: '',
  emailDomain: '',
  zip: '',
  entAddr: '',
  entDaddr: '',
  hmpgAddr: '',
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

// 기업회원 상세 응답을 화면 입력값 상태로 변환한다.
const buildCorporateFormValues = (detail, tokenPayload) => {
  const [emailLocal, emailDomain] = splitEmail(detail?.emlAddr);
  return {
    ...EMPTY_FORM_VALUES,
    loginId: tokenPayload?.login_id || '',
    mbrNm: detail?.mbrNm || '',
    brno: detail?.brno || '',
    crno: detail?.crno || '',
    rprsvNm: detail?.rprsvNm || '',
    rprsTelno: detail?.rprsTelno || '',
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

// 개인회원 상세 응답을 화면 입력값 상태로 변환한다.
const buildIndividualFormValues = (detail, tokenPayload) => {
  const [emailLocal, emailDomain] = splitEmail(detail?.indvEmlAddr);
  return {
    ...EMPTY_FORM_VALUES,
    loginId: tokenPayload?.login_id || '',
    mbrNm: detail?.mbrNm || '',
    indvMblTelno: detail?.indvMblTelno || '',
    indvGnrlTelnoParts: splitPhoneNumber(detail?.indvGnrlTelno),
    emailLocal,
    emailDomain,
  };
};

// 정보수신 동의 응답을 radio 상태값으로 변환한다.
const buildInfoReceptionAgreements = (agreements) => {
  const nextAgreements = { ...DEFAULT_INFO_RECEPTION_AGREEMENTS };
  if (!Array.isArray(agreements)) {
    return nextAgreements;
  }

  agreements.forEach((agreement) => {
    const infoRcptnMnsCd = agreement?.infoRcptnMnsCd;
    if (Object.hasOwn(nextAgreements, infoRcptnMnsCd)) {
      nextAgreements[infoRcptnMnsCd] = agreement?.infoRcptnAgreYn === 'Y' ? 'Y' : 'N';
    }
  });

  return nextAgreements;
};

// 전화번호 입력칸 값을 저장용 문자열로 조합한다.
const joinPhoneNumberParts = (parts) =>
  parts.map((part) => String(part ?? '').trim()).filter(Boolean).join('-');

// 이메일 입력칸 값을 저장용 문자열로 조합한다.
const joinEmailParts = (localPart, domainPart) => {
  const local = String(localPart ?? '').trim();
  const domain = String(domainPart ?? '').trim();
  return local && domain ? `${local}@${domain}` : '';
};

// 정보수신 동의 상태를 저장 요청 목록으로 변환한다.
const buildInfoReceptionAgreementPayload = (agreements) =>
  Object.entries(agreements).map(([infoRcptnMnsCd, infoRcptnAgreYn]) => ({
    infoRcptnMnsCd,
    infoRcptnAgreYn,
  }));

// 화면 입력값을 기업회원 정보 저장 payload로 변환한다.
const buildCorporateMemberInfoUpdatePayload = (values, agreements) => ({
  rprsvNm: values.rprsvNm,
  rprsTelno: joinPhoneNumberParts(values.rprsTelnoParts),
  rprsFxno: joinPhoneNumberParts(values.rprsFxnoParts),
  emlAddr: joinEmailParts(values.emailLocal, values.emailDomain),
  zip: values.zip,
  entAddr: values.entAddr,
  entDaddr: values.entDaddr,
  hmpgAddr: values.hmpgAddr,
  infoReceptionAgreements: buildInfoReceptionAgreementPayload(agreements),
});

// 화면 입력값을 개인회원 정보 저장 payload로 변환한다.
const buildIndividualMemberInfoUpdatePayload = (values, agreements) => ({
  indvGnrlTelno: joinPhoneNumberParts(values.indvGnrlTelnoParts),
  indvEmlAddr: joinEmailParts(values.emailLocal, values.emailDomain),
  zip: values.zip,
  mbrAddr: values.mbrAddr || values.entAddr,
  mbrDaddr: values.mbrDaddr || values.entDaddr,
  infoReceptionAgreements: buildInfoReceptionAgreementPayload(agreements),
});

const UI_USR_W_411 = () => {

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const currentMode = useAuthStore((state) => state.currentMode);
  const authToken = useAuthStore((state) => state.token);
  const tokenPayload = decodeJwtPayload(authToken);
  const [formValues, setFormValues] = useState(EMPTY_FORM_VALUES);
  const [managerContact, setManagerContact] = useState(null);
  const [infoReceptionAgreements, setInfoReceptionAgreements] = useState(
    DEFAULT_INFO_RECEPTION_AGREEMENTS,
  );
  const [saving, setSaving] = useState(false);

  // 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  const matches = useMatches();
  const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '회원정보변경';

  useEffect(() => {
    const currentTokenPayload = decodeJwtPayload(authToken);

    if (!authToken || !currentMode) {
      setFormValues({
        ...EMPTY_FORM_VALUES,
        loginId: currentTokenPayload?.login_id || '',
      });
      setManagerContact(null);
      setInfoReceptionAgreements(DEFAULT_INFO_RECEPTION_AGREEMENTS);
      return;
    }

    let active = true;
    setManagerContact(null);
    setInfoReceptionAgreements(DEFAULT_INFO_RECEPTION_AGREEMENTS);

    // 회원번호로 기업회원 상세정보를 조회한다.
    const loadCorporateMemberDetail = async () => {
      try {
        const detail = await fetchCorporateMemberDetail(apiClient);
        if (!active) {
          return;
        }
        setFormValues(buildCorporateFormValues(detail, currentTokenPayload));
      } catch (error) {
        console.error('Failed to load corporate member detail:', error);
      }
    };

    // 회원번호로 개인회원 상세정보를 조회한다.
    const loadIndividualMemberDetail = async () => {
      try {
        const detail = await fetchIndividualMemberDetail(apiClient);
        if (!active) {
          return;
        }
        setFormValues(buildIndividualFormValues(detail, currentTokenPayload));
      } catch (error) {
        console.error('Failed to load individual member detail:', error);
      }
    };

    // 회원번호로 기업관리자정보를 조회한다.
    const loadCorporateManagerContact = async () => {
      try {
        const contact = await fetchCorporateManagerContact(apiClient);
        if (!active) {
          return;
        }
        setManagerContact(contact || null);
      } catch (error) {
        if (!active) {
          return;
        }
        console.error('Failed to load corporate manager contact:', error);
        setManagerContact(null);
      }
    };

    // 회원번호로 정보수신 동의값을 조회한다.
    const loadMemberInfoReceptionAgreements = async () => {
      try {
        const agreements = await fetchMemberInfoReceptionAgreements(apiClient);
        if (!active) {
          return;
        }
        setInfoReceptionAgreements(buildInfoReceptionAgreements(agreements));
      } catch (error) {
        if (!active) {
          return;
        }
        console.error('Failed to load member info reception agreements:', error);
        setInfoReceptionAgreements(DEFAULT_INFO_RECEPTION_AGREEMENTS);
      }
    };

    if (currentMode === 'CORPORATE') {
      loadCorporateMemberDetail();
      loadCorporateManagerContact();
    }
    if (currentMode === 'INDIVIDUAL') {
      loadIndividualMemberDetail();
    }
    loadMemberInfoReceptionAgreements();

    return () => {
      active = false;
    };
  }, [authToken, currentMode]);

  // 단일 정보수신 동의 radio 값을 갱신한다.
  const setInfoReceptionAgreement = (infoRcptnMnsCd, infoRcptnAgreYn) => {
    setInfoReceptionAgreements((currentAgreements) => ({
      ...currentAgreements,
      [infoRcptnMnsCd]: infoRcptnAgreYn,
    }));
  };

  // 수신방법 radio 값에 따라 문자와 알림톡 동의값을 함께 갱신한다.
  const setInfoReceptionMethod = (selectedMethodCd) => {
    setInfoReceptionAgreements((currentAgreements) => ({
      ...currentAgreements,
      [INFO_RECEPTION_MNS_CODES.message]:
        selectedMethodCd === INFO_RECEPTION_MNS_CODES.message ? 'Y' : 'N',
      [INFO_RECEPTION_MNS_CODES.kakaotalk]:
        selectedMethodCd === INFO_RECEPTION_MNS_CODES.kakaotalk ? 'Y' : 'N',
    }));
  };

  // 저장 버튼 클릭 시 현재 회원유형에 맞는 회원정보와 정보수신 동의를 저장한다.
  const handleSave = async () => {
    if (!authToken) {
      window.alert('회원번호를 확인할 수 없습니다.');
      return;
    }
    if (!currentMode) {
      window.alert('회원유형을 확인할 수 없습니다.');
      return;
    }

    setSaving(true);
    try {
      if (currentMode === 'CORPORATE') {
        const payload = buildCorporateMemberInfoUpdatePayload(formValues, infoReceptionAgreements);
        const detail = await updateCorporateMemberInfo(apiClient, payload);
        setFormValues(buildCorporateFormValues(detail, tokenPayload));
      } else if (currentMode === 'INDIVIDUAL') {
        const payload = buildIndividualMemberInfoUpdatePayload(formValues, infoReceptionAgreements);
        const detail = await updateIndividualMemberInfo(apiClient, payload);
        setFormValues(buildIndividualFormValues(detail, tokenPayload));
      } else {
        throw new Error('지원하지 않는 회원유형입니다.');
      }
      window.alert('저장되었습니다.');
    } catch (error) {
      console.error('Failed to update member info:', error);
      window.alert(error?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
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
          <h2 className="h-tit">{pageTitle}</h2>
        </div>

        <p className="guide-txt">
          <span className="guide-txt-check">
            <i className="svg-icon ico-checkbox"></i>
          </span>
          회원정보는 개인정보처리방침에 따라 안전하게 보호되며, 회원님의 명백한 동의 없이 공개 또는 제 3자에게 제공되지 않습니다.</p>
        {currentMode === 'CORPORATE' && (
          <CorporateMemberInfo
            formValues={formValues}
            setFormValues={setFormValues}
            managerContact={managerContact}
          />
        )}
        {currentMode === 'INDIVIDUAL' && (
          <IndividualMemberInfo
            formValues={formValues}
            setFormValues={setFormValues}
          />
        )}

        {/* TODO 구현예정 */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit3">관심 분야 설정</h3>
          <div className="flex-between center">
            <p className="cont-desc">관심을 갖고 있는 분야를 선택하시면, 빠르고 정확한 지원사업 검색이 가능합니다.</p>
            <button type="button" className="krds-btn secondary small">관심분야 설정</button>
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
                          value={INFO_RECEPTION_MNS_CODES.message}
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.message] === 'Y'}
                          onChange={() => setInfoReceptionMethod(INFO_RECEPTION_MNS_CODES.message)}
                        />
                        <label htmlFor="message">문자</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="receive"
                          id="kakaotalk"
                          value={INFO_RECEPTION_MNS_CODES.kakaotalk}
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.kakaotalk] === 'Y'}
                          onChange={() => setInfoReceptionMethod(INFO_RECEPTION_MNS_CODES.kakaotalk)}
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
                          name="emailReceive"
                          id="email_on"
                          value="Y"
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.email] === 'Y'}
                          onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.email, 'Y')}
                        />
                        <label htmlFor="email_on">예</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="emailReceive"
                          id="email_off"
                          value="N"
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.email] === 'N'}
                          onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.email, 'N')}
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
                          value="Y"
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.business] === 'Y'}
                          onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.business, 'Y')}
                        />
                        <label htmlFor="business_on">받기</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="business"
                          id="business_off"
                          value="N"
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.business] === 'N'}
                          onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.business, 'N')}
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
                          value="Y"
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.policyFinance] === 'Y'}
                          onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.policyFinance, 'Y')}
                        />
                        <label htmlFor="policy_on">받기</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="policy"
                          id="policy_off"
                          value="N"
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.policyFinance] === 'N'}
                          onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.policyFinance, 'N')}
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
                          value="Y"
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.certificate] === 'Y'}
                          onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.certificate, 'Y')}
                        />
                        <label htmlFor="certificate_on">받기</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="certificate"
                          id="certificate_off"
                          value="N"
                          checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.certificate] === 'N'}
                          onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.certificate, 'N')}
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
            <button type="button" className="krds-btn primary xlarge" onClick={handleSave} disabled={saving}>
              저장
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default UI_USR_W_411;
