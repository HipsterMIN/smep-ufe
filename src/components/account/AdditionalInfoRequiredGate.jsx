import JusoAddressSearchButton from '@components/ui/JusoAddressSearchButton';
import { api as apiClient } from '@lib/apiClient.js';
import {
  fetchCorporateMemberDetail,
  fetchIndividualMemberDetail,
  fetchMemberInfoReceptionAgreements,
  normalizeDigits,
  updateCorporateMemberInfo,
  updateIndividualMemberInfo,
} from '@pages/my-business/member/memberUtils.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import {
  keepDigitsOnly,
  removeDigits,
  removeKoreanCharacters,
  renderManagerPhoneNumber,
} from '@utils/commonUtils.js';
import { useEffect, useState } from 'react';
import styles from './AdditionalInfoRequiredGate.module.css';

const MISSING_FIELD_LOGIN_ID = 'LOGIN_ID';
const REASON_INITIAL_PASSWORD_CHANGE = 'INITIAL_PASSWORD_CHANGE'; // ENT 전용 — IND는 백엔드에서 gate 제외
const LOGIN_ID_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;
const PASSWORD_ALLOWED_PATTERN = /^[A-Za-z0-9!@#$%^&*()=_+-]+$/;
const PASSWORD_DIGIT_PATTERN = /\d/;
const PASSWORD_SPECIAL_PATTERN = /[!@#$%^&*()=_+-]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIVIDUAL_EMAIL_MAX_LENGTH = 108;
const CORPORATE_EMAIL_MAX_LENGTH = 320;
const PHONE_MAX_LENGTH = 30;
const FAX_MAX_LENGTH = 20;
const NAME_MAX_LENGTH = 100;
const ZIP_MAX_LENGTH = 5;
const ADDRESS_MAX_LENGTH = 200;
const HOMEPAGE_MAX_LENGTH = 2000;

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
  mbrNm: '',
  brno: '',
  crno: '',
  rprsvNm: '',
  indvMblTelno: '',
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

const PHONE_AREA_OPTIONS = [
  ['02', '02'],
  ['051', '051'],
  ['053', '053'],
  ['032', '032'],
  ['062', '062'],
  ['042', '042'],
  ['052', '052'],
  ['044', '044'],
  ['031', '031'],
  ['033', '033'],
  ['043', '043'],
  ['041', '041'],
  ['063', '063'],
  ['061', '061'],
  ['054', '054'],
  ['055', '055'],
  ['064', '064'],
  ['070', '070'],
  ['060', '060'],
  ['050', '050'],
  ['010', '010'],
];

const EMAIL_DOMAIN_OPTIONS = [
  ['naver.com', 'naver'],
  ['daum.net', 'daum'],
  ['gmail.com', 'gmail'],
  ['hotmail.com', 'hotmail'],
  ['nate.com', 'nate'],
  ['yahoo.com', 'yahoo'],
];

const splitPhoneNumber = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return ['', '', ''];
  }

  if (raw.includes('-')) {
    const parts = raw.split('-');

    // 하이픈이 1개인 경우: "010-12345678" → ["010", "1234", "5678"]
    if (parts.length === 2) {
      const area = parts[0] || '';
      const rest = normalizeDigits(parts[1]);
      if (rest.length === 8) return [area, rest.slice(0, 4), rest.slice(4)];
      if (rest.length === 7) return [area, rest.slice(0, 3), rest.slice(3)];
      return [area, rest, ''];
    }

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

const splitEmail = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return ['', ''];
  }

  const [localPart, ...domainParts] = raw.split('@');
  return [localPart || '', domainParts.join('@') || ''];
};

const joinPhoneNumberParts = (parts) =>
  parts.map((part) => String(part ?? '').trim()).filter(Boolean).join('-');

const joinEmailParts = (localPart, domainPart) => {
  const local = String(localPart ?? '').trim();
  const domain = String(domainPart ?? '').trim();
  return local && domain ? `${local}@${domain}` : '';
};

const hasConsecutiveChars = (value) => {
  for (let i = 0; i < value.length - 2; i++) {
    const c1 = value.charCodeAt(i);
    const c2 = value.charCodeAt(i + 1);
    const c3 = value.charCodeAt(i + 2);
    if (c1 === c2 && c2 === c3) return true;           // aaa, 111
    if (c2 === c1 + 1 && c3 === c1 + 2) return true;  // abc, 123
    if (c2 === c1 - 1 && c3 === c1 - 2) return true;  // cba, 321
  }
  return false;
};

const validatePasswordPolicy = (value, loginId) => {
  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    window.alert(`비밀번호는 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자여야 합니다.`);
    return false;
  }
  if (!PASSWORD_ALLOWED_PATTERN.test(value)) {
    window.alert('비밀번호는 영문, 숫자, 특수문자(!@#$%^&*()=_+-)만 사용할 수 있습니다.');
    return false;
  }
  if (!PASSWORD_DIGIT_PATTERN.test(value)) {
    window.alert('비밀번호에 숫자를 포함해야 합니다.');
    return false;
  }
  if (!PASSWORD_SPECIAL_PATTERN.test(value)) {
    window.alert('비밀번호에 특수문자(!@#$%^&*()=_+-)를 포함해야 합니다.');
    return false;
  }
  if (hasConsecutiveChars(value)) {
    window.alert('비밀번호에 연속된 문자(예: abc, 123, aaa)를 3개 이상 사용할 수 없습니다.');
    return false;
  }
  const trimmedLoginId = loginId ? loginId.trim() : '';
  if (trimmedLoginId && value.toLowerCase().includes(trimmedLoginId.toLowerCase())) {
    window.alert('비밀번호에 로그인 ID를 포함할 수 없습니다.');
    return false;
  }
  return true;
};

const validateTextMaxLength = (value, label, maxLength) => {
  if (String(value ?? '').trim().length > maxLength) {
    window.alert(`${label}은 ${maxLength}자를 초과할 수 없습니다.`);
    return false;
  }
  return true;
};

const validatePhoneParts = ({ parts, label, maxLength, required = false }) => {
  const normalizedParts = Array.isArray(parts)
    ? parts.map((part) => String(part ?? '').trim())
    : ['', '', ''];
  const filledCount = normalizedParts.filter(Boolean).length;
  if (filledCount === 0) {
    if (required) {
      window.alert(`${label}을 입력해 주세요.`);
      return false;
    }
    return true;
  }
  if (filledCount !== normalizedParts.length) {
    window.alert(`${label}을 모두 입력하거나 모두 비워 주세요.`);
    return false;
  }
  if (joinPhoneNumberParts(normalizedParts).length > maxLength) {
    window.alert(`${label}은 ${maxLength}자를 초과할 수 없습니다.`);
    return false;
  }
  return true;
};

const validateEmailParts = ({ localPart, domainPart, label, maxLength, required = false }) => {
  const local = String(localPart ?? '').trim();
  const domain = String(domainPart ?? '').trim();
  if (!local && !domain) {
    if (required) {
      window.alert(`${label}을 입력해 주세요.`);
      return false;
    }
    return true;
  }
  if (!local || !domain) {
    window.alert(`${label} 아이디와 도메인을 모두 입력해 주세요.`);
    return false;
  }
  const email = `${local}@${domain}`;
  if (email.length > maxLength) {
    window.alert(`${label}은 ${maxLength}자를 초과할 수 없습니다.`);
    return false;
  }
  if (!EMAIL_PATTERN.test(email)) {
    window.alert(`${label} 형식이 올바르지 않습니다.`);
    return false;
  }
  return true;
};

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

const buildInfoReceptionAgreementPayload = (agreements) =>
  Object.entries(agreements).map(([infoRcptnMnsCd, infoRcptnAgreYn]) => ({
    infoRcptnMnsCd,
    infoRcptnAgreYn,
  }));

const buildCorporateFormValues = (detail, fallbackUser) => {
  const [emailLocal, emailDomain] = splitEmail(detail?.emlAddr || fallbackUser?.email);
  return {
    ...EMPTY_FORM_VALUES,
    mbrNm: detail?.mbrNm || fallbackUser?.name || '',
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

const buildIndividualFormValues = (detail, fallbackUser) => {
  const [emailLocal, emailDomain] = splitEmail(detail?.indvEmlAddr || fallbackUser?.email);
  return {
    ...EMPTY_FORM_VALUES,
    mbrNm: detail?.mbrNm || fallbackUser?.name || '',
    indvMblTelno: detail?.indvMblTelno || fallbackUser?.phone || '',
    indvGnrlTelnoParts: splitPhoneNumber(detail?.indvGnrlTelno),
    emailLocal,
    emailDomain,
  };
};

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

const buildIndividualMemberInfoUpdatePayload = (values, agreements) => ({
  indvGnrlTelno: joinPhoneNumberParts(values.indvGnrlTelnoParts),
  indvEmlAddr: joinEmailParts(values.emailLocal, values.emailDomain),
  infoReceptionAgreements: buildInfoReceptionAgreementPayload(agreements),
});

export default function AdditionalInfoRequiredGate() {
  const isLogin = useAuthStore((state) => state.isLogin);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const currentMode = useAuthStore((state) => state.currentMode);
  const additionalInfoRequired = useAuthStore((state) => state.additionalInfoRequired);
  const additionalInfoReason = useAuthStore((state) => state.additionalInfoReason);
  const additionalInfoMissingFields = useAuthStore((state) => state.additionalInfoMissingFields);
  const suggestedLoginId = useAuthStore((state) => state.suggestedLoginId);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const [loginId, setLoginId] = useState('');
  const [loginIdCheckStatus, setLoginIdCheckStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [initialNewPassword, setInitialNewPassword] = useState('');
  const [initialNewPasswordConfirm, setInitialNewPasswordConfirm] = useState('');
  const [formValues, setFormValues] = useState(EMPTY_FORM_VALUES);
  const [infoReceptionAgreements, setInfoReceptionAgreements] = useState(
    DEFAULT_INFO_RECEPTION_AGREEMENTS,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailLoadError, setDetailLoadError] = useState(null);
  const [saving, setSaving] = useState(false);

  const missingFields = Array.isArray(additionalInfoMissingFields)
    ? additionalInfoMissingFields
    : [];
  const loginIdMissing = missingFields.includes(MISSING_FIELD_LOGIN_ID);
  const isInitialPasswordChange = additionalInfoReason === REASON_INITIAL_PASSWORD_CHANGE;
  const canRender = isLogin && token && additionalInfoRequired;
  const memberTypeLabel = currentMode === 'CORPORATE' ? '기업회원' : '개인회원';
  const loginIdConfirmed = loginIdCheckStatus === 'available';

  useEffect(() => {
    if (!canRender) {
      setLoginId('');
      setLoginIdCheckStatus(null);
      setPassword('');
      setPasswordConfirm('');
      setInitialNewPassword('');
      setInitialNewPasswordConfirm('');
      return;
    }
    // loginId 초기값: Q-IM 제안값 우선, 없으면 기존 loginId 사용
    const initialLoginId = loginIdMissing
      ? (suggestedLoginId || '')
      : (user?.loginId || '');
    setLoginId(initialLoginId);
    setLoginIdCheckStatus(null);
  // suggestedLoginId와 canRender 변경 시에만 재초기화
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRender, loginIdMissing, suggestedLoginId]);

  useEffect(() => {
    if (!token || !additionalInfoRequired || !currentMode) {
      setFormValues(EMPTY_FORM_VALUES);
      setInfoReceptionAgreements(DEFAULT_INFO_RECEPTION_AGREEMENTS);
      setDetailLoading(false);
      setDetailLoadError(null);
      return;
    }

    let active = true;

    const loadMemberForm = async () => {
      setDetailLoading(true);
      setDetailLoadError(null);

      try {
        const agreementsPromise = fetchMemberInfoReceptionAgreements(apiClient);
        if (currentMode === 'CORPORATE') {
          const [detail, agreements] = await Promise.all([
            fetchCorporateMemberDetail(apiClient),
            agreementsPromise,
          ]);
          if (!active) {
            return;
          }
          setFormValues(buildCorporateFormValues(detail, user));
          setInfoReceptionAgreements(buildInfoReceptionAgreements(agreements));
          return;
        }

        const [detail, agreements] = await Promise.all([
          fetchIndividualMemberDetail(apiClient),
          agreementsPromise,
        ]);
        if (!active) {
          return;
        }
        setFormValues(buildIndividualFormValues(detail, user));
        setInfoReceptionAgreements(buildInfoReceptionAgreements(agreements));
      } catch (error) {
        if (!active) {
          return;
        }
        console.error('Failed to load additional-info member form:', error);
        setFormValues(
          currentMode === 'CORPORATE'
            ? buildCorporateFormValues(null, user)
            : buildIndividualFormValues(null, user),
        );
        setInfoReceptionAgreements(DEFAULT_INFO_RECEPTION_AGREEMENTS);
        setDetailLoadError('회원정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        if (active) {
          setDetailLoading(false);
        }
      }
    };

    loadMemberForm();

    return () => {
      active = false;
    };
  }, [additionalInfoRequired, currentMode, token, user]);

  const handleInitialPasswordSubmit = async (event) => {
    event.preventDefault();
    if (!initialNewPassword || !initialNewPasswordConfirm) {
      window.alert('새 비밀번호와 새 비밀번호 확인을 입력해 주세요.');
      return;
    }
    if (!validatePasswordPolicy(initialNewPassword, user?.loginId)) {
      return;
    }
    if (initialNewPassword !== initialNewPasswordConfirm) {
      window.alert('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    try {
      setSaving(true);
      await apiClient.post(
        '/api/v1/account/password/initial',
        { newPassword: initialNewPassword, newPasswordConfirm: initialNewPasswordConfirm },
        { token },
      );
      window.alert('비밀번호가 변경되었습니다. 다시 로그인해 주세요.');
      logout();
      window.location.href = import.meta.env.BASE_URL ? `${import.meta.env.BASE_URL}service/login` : '/service/login';
    } catch (error) {
      window.alert(error?.data?.message || error?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const renderInitialPasswordChangeForm = () => (
    <div className={styles.page}>
      <section
        id="modal_initial_password_change"
        className={styles.modalWrap}
        role="dialog"
        aria-modal="true"
        aria-labelledby="initialPasswordChangeTitle"
      >
        <div className={styles.modalDialog}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <p className={styles.eyebrow}>{memberTypeLabel}</p>
              <h1 id="initialPasswordChangeTitle" className={styles.modalTitle}>
                초기 비밀번호 변경이 필요합니다.
              </h1>
              <p className={styles.guideText}>
                발급된 초기 비밀번호로 로그인하셨습니다. 안전한 서비스 이용을 위해 새 비밀번호로 변경해 주세요.
              </p>
            </div>

            <form onSubmit={handleInitialPasswordSubmit}>
              <div className="conts-wrap mt-64">
                <div className="on-form-register">
                  <dl className="on-form-row large">
                    <div className="form-row-item">
                      <dt className="form-row-label">
                        <label htmlFor="initial_login_id_display">로그인 ID</label>
                      </dt>
                      <dd className="form-row-content">
                        <span id="initial_login_id_display" className="text-value">
                          {user?.loginId || '-'}
                        </span>
                      </dd>
                    </div>
                    <div className="form-row-item">
                      <dt className="form-row-label">
                        <label htmlFor="initial_new_password">새 비밀번호</label>
                      </dt>
                      <dd className="form-row-content">
                        <div className="form-wrapper w-220">
                          <input
                            type="password"
                            id="initial_new_password"
                            className="krds-input small"
                            value={initialNewPassword}
                            disabled={saving}
                            autoComplete="new-password"
                            onChange={(event) => setInitialNewPassword(event.target.value)}
                          />
                        </div>
                      </dd>
                    </div>
                    <div className="form-row-item">
                      <dt className="form-row-label">
                        <label htmlFor="initial_new_password_confirm">새 비밀번호 확인</label>
                      </dt>
                      <dd className="form-row-content">
                        <div className="form-wrapper w-220">
                          <input
                            type="password"
                            id="initial_new_password_confirm"
                            className="krds-input small"
                            value={initialNewPasswordConfirm}
                            disabled={saving}
                            autoComplete="new-password"
                            onChange={(event) => setInitialNewPasswordConfirm(event.target.value)}
                          />
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
                <ul className="info-list-point">
                  <li>
                    <i className="svg-icon ico-checkbox" />
                    비밀번호는 8~20자이며 숫자·특수문자를 필수 포함해야 하고, 연속된 문자 3개 이상 및 로그인 ID 포함은 사용할 수 없습니다.
                  </li>
                </ul>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className="krds-btn primary"
                  disabled={saving}
                >
                  {saving ? '변경 중' : '비밀번호 변경'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className={styles.modalBackdrop} />
      </section>
    </div>
  );

  if (!canRender) {
    return null;
  }

  if (isInitialPasswordChange) {
    return renderInitialPasswordChangeForm();
  }

  const setFormValue = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

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

  const handleSelectAddress = (payload) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      zip: payload.zipNo || '',
      entAddr: payload.baseAddress || payload.roadFullAddress || '',
      entDaddr: payload.detailAddress || '',
    }));
  };

  const handleAddressSearchError = (error) => {
    console.error('Failed to search address:', error);
    window.alert(error?.message || '주소검색 중 오류가 발생했습니다.');
  };

  const validateLoadState = () => {
    if (detailLoading) {
      window.alert('회원정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return false;
    }
    if (detailLoadError) {
      window.alert(detailLoadError);
      return false;
    }
    return true;
  };

  const handleLoginIdChange = (value) => {
    setLoginId(value);
    if (loginIdMissing) {
      setLoginIdCheckStatus(null);
    }
  };

  const handleCheckLoginId = async () => {
    const trimmed = loginId.trim();
    if (!trimmed) {
      window.alert('로그인 ID를 입력해 주세요.');
      return;
    }
    if (trimmed.length > LOGIN_ID_MAX_LENGTH) {
      window.alert('로그인 ID는 50자를 초과할 수 없습니다.');
      return;
    }
    setLoginIdCheckStatus('checking');
    try {
      const res = await apiClient.get(
        `/api/v1/account/check-login-id?loginId=${encodeURIComponent(trimmed)}`,
        { token },
      );
      const data = res?.data || res;
      if (data?.available === true) {
        setLoginIdCheckStatus('available');
      } else {
        setLoginIdCheckStatus('taken');
      }
    } catch {
      setLoginIdCheckStatus(null);
      window.alert('중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const validateLoginCredentialForm = () => {
    if (!loginId.trim()) {
      window.alert('로그인 ID를 입력해 주세요.');
      return false;
    }
    if (loginId.trim().length > LOGIN_ID_MAX_LENGTH) {
      window.alert('로그인 ID는 50자를 초과할 수 없습니다.');
      return false;
    }
    if (loginIdMissing && !loginIdConfirmed) {
      window.alert('로그인 ID 중복 확인을 완료해 주세요.');
      return false;
    }
    if (!password || !passwordConfirm) {
      window.alert('비밀번호와 비밀번호 확인을 입력해 주세요.');
      return false;
    }
    if (!validatePasswordPolicy(password, loginId)) {
      return false;
    }
    if (password !== passwordConfirm) {
      window.alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return false;
    }
    return true;
  };

  const validateIndividualMemberForm = () =>
    validatePhoneParts({
      parts: formValues.indvGnrlTelnoParts,
      label: '전화번호',
      maxLength: PHONE_MAX_LENGTH,
    }) &&
    validateEmailParts({
      localPart: formValues.emailLocal,
      domainPart: formValues.emailDomain,
      label: '이메일',
      maxLength: INDIVIDUAL_EMAIL_MAX_LENGTH,
      required: true,
    });

  const validateCorporateMemberForm = () =>
    validateTextMaxLength(formValues.rprsvNm, '대표자 이름', NAME_MAX_LENGTH) &&
    validatePhoneParts({
      parts: formValues.rprsTelnoParts,
      label: '대표 전화',
      maxLength: PHONE_MAX_LENGTH,
    }) &&
    validatePhoneParts({
      parts: formValues.rprsFxnoParts,
      label: '팩스 번호',
      maxLength: FAX_MAX_LENGTH,
    }) &&
    validateEmailParts({
      localPart: formValues.emailLocal,
      domainPart: formValues.emailDomain,
      label: '이메일',
      maxLength: CORPORATE_EMAIL_MAX_LENGTH,
    }) &&
    validateTextMaxLength(formValues.zip, '우편번호', ZIP_MAX_LENGTH) &&
    validateTextMaxLength(formValues.entAddr, '회사주소', ADDRESS_MAX_LENGTH) &&
    validateTextMaxLength(formValues.entDaddr, '상세주소', ADDRESS_MAX_LENGTH) &&
    validateTextMaxLength(formValues.hmpgAddr, '홈페이지 주소', HOMEPAGE_MAX_LENGTH);

  const validateMemberForm = () => {
    if (!validateLoadState()) {
      return false;
    }
    return currentMode === 'CORPORATE'
      ? validateCorporateMemberForm()
      : validateIndividualMemberForm();
  };

  const saveMemberInfo = async () => {
    if (currentMode === 'CORPORATE') {
      const detail = await updateCorporateMemberInfo(
        apiClient,
        buildCorporateMemberInfoUpdatePayload(formValues, infoReceptionAgreements),
      );
      setFormValues(buildCorporateFormValues(detail, user));
      return;
    }
    if (currentMode === 'INDIVIDUAL') {
      const detail = await updateIndividualMemberInfo(
        apiClient,
        buildIndividualMemberInfoUpdatePayload(formValues, infoReceptionAgreements),
      );
      setFormValues(buildIndividualFormValues(detail, user));
      return;
    }
    throw new Error('지원하지 않는 회원유형입니다.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateLoginCredentialForm() || !validateMemberForm()) {
      return;
    }

    try {
      setSaving(true);
      // 회원 기본정보와 로컬 로그인정보는 서로 다른 API라, 참조 화면과 같은 member-info 저장을 먼저 끝낸 뒤 A201 ID/PW를 완성한다.
      await saveMemberInfo();
      await apiClient.post(
        '/api/v1/account/additional-info',
        {
          loginId: loginId.trim(),
          password,
          passwordConfirm,
        },
        { token },
      );
      const profileResponse = await apiClient.get('/api/v1/account/me', { token });
      const profile = profileResponse?.data || profileResponse;
      updateProfile(profile);
      if (profile?.additionalInfoRequired) {
        window.alert('추가정보 저장 후에도 누락 정보가 남아 있습니다. 입력값을 다시 확인해 주세요.');
        return;
      }
      window.alert('추가정보가 저장되었습니다.');
    } catch (error) {
      window.alert(error?.data?.message || error?.message || '추가정보 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForTest = async () => {
    const confirmed = window.confirm('팝업을 닫을경우 로그아웃됩니다. 로그아웃 하시겠습니까?');
    if (!confirmed) {
      return;
    }

    let logoutUrl = null;
    try {
      // kcIdToken: SSO callback 시 수신하여 store에 보관 중인 Keycloak id_token.
      // 서버는 HttpSession에서 id_token을 읽지 않으므로(STATELESS) body로 전달한다.
      const kcIdToken = useAuthStore.getState().kcIdToken;
      const response = await apiClient.post('/api/v1/auth/keycloak/logout', {
        idToken: kcIdToken || null,
      });
      const responseData = response?.data || response;
      logoutUrl = responseData?.logoutUrl || null;
    } catch (error) {
      console.error('Failed to fetch keycloak logout url from additional-info modal:', {
        message: error?.message ?? 'unknown-error',
        status: error?.status ?? null,
      });
    }

    // 추가정보 입력을 중단한 사용자는 모달만 닫지 않고 Header와 같은 로그아웃 흐름으로 세션을 정리한다.
    logout();
    if (logoutUrl) {
      window.location.href = logoutUrl;
      return;
    }
    window.location.href = import.meta.env.BASE_URL || '/';
  };

  const setInfoReceptionAgreement = (infoRcptnMnsCd, infoRcptnAgreYn) => {
    setInfoReceptionAgreements((currentAgreements) => ({
      ...currentAgreements,
      [infoRcptnMnsCd]: infoRcptnAgreYn,
    }));
  };

  const setInfoReceptionMethod = (selectedMethodCd) => {
    setInfoReceptionAgreements((currentAgreements) => ({
      ...currentAgreements,
      [INFO_RECEPTION_MNS_CODES.message]:
        selectedMethodCd === INFO_RECEPTION_MNS_CODES.message ? 'Y' : 'N',
      [INFO_RECEPTION_MNS_CODES.kakaotalk]:
        selectedMethodCd === INFO_RECEPTION_MNS_CODES.kakaotalk ? 'Y' : 'N',
    }));
  };

  const renderPhoneAreaOptions = () => (
    <>
      <option value="">선택</option>
      {PHONE_AREA_OPTIONS.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </>
  );

  const renderEmailDomainOptions = () => (
    <>
      <option value="">직접입력</option>
      {EMAIL_DOMAIN_OPTIONS.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </>
  );

  const renderNotificationConsentForm = () => (
    <div className="conts-wrap mt-64">
      <h3 className="sec-tit3">알림 수신 동의</h3>
      <ul className="krds-info-list decimal" role="list">
        <li role="listitem">중소벤처24의 알림을 받으시겠습니까?</li>
        <li role="listitem">
          중소벤처24의 알림은 이메일과 SMS 또는 알림톡으로 발송되며, 정책자금 상담,
          Q&amp;A, 민원 등의 처리현황정보가 발송됩니다.
        </li>
      </ul>
      <div className="on-form-register mt-16">
        <dl className="on-form-row large">
          <div className="form-row-item">
            <dt className="form-row-label">
              <span className="label-title" id="additional-receive-label">수신방법</span>
            </dt>
            <dd className="form-row-content">
              <div className="form-wrapper">
                <div
                  className="krds-check-area"
                  role="radiogroup"
                  aria-labelledby="additional-receive-label"
                >
                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalReceive"
                      id="additional_message"
                      value={INFO_RECEPTION_MNS_CODES.message}
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.message] === 'Y'}
                      disabled={saving}
                      onChange={() => setInfoReceptionMethod(INFO_RECEPTION_MNS_CODES.message)}
                    />
                    <label htmlFor="additional_message">문자</label>
                  </div>

                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalReceive"
                      id="additional_kakaotalk"
                      value={INFO_RECEPTION_MNS_CODES.kakaotalk}
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.kakaotalk] === 'Y'}
                      disabled={saving}
                      onChange={() => setInfoReceptionMethod(INFO_RECEPTION_MNS_CODES.kakaotalk)}
                    />
                    <label htmlFor="additional_kakaotalk">알림톡(카카오톡)</label>
                  </div>
                </div>
              </div>
            </dd>
          </div>
          <div className="form-row-item">
            <dt className="form-row-label">
              <span className="label-title" id="additional-emailreceive-label">이메일 수신</span>
            </dt>
            <dd className="form-row-content">
              <div className="form-wrapper">
                <div
                  className="krds-check-area"
                  role="radiogroup"
                  aria-labelledby="additional-emailreceive-label"
                >
                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalEmailReceive"
                      id="additional_email_on"
                      value="Y"
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.email] === 'Y'}
                      disabled={saving}
                      onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.email, 'Y')}
                    />
                    <label htmlFor="additional_email_on">예</label>
                  </div>

                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalEmailReceive"
                      id="additional_email_off"
                      value="N"
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.email] === 'N'}
                      disabled={saving}
                      onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.email, 'N')}
                    />
                    <label htmlFor="additional_email_off">아니오</label>
                  </div>
                </div>
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );

  const renderCustomNotificationServiceForm = () => (
    <div className="conts-wrap mt-64">
      <h3 className="sec-tit3">맞춤 알림 서비스 선택</h3>
      <ul className="krds-info-list decimal" role="list">
        <li role="listitem">
          중소벤처24의 정책금융 지원사업, 사업공고, 증명서 발급 현황 등의 맞춤형 알림 서비스를 받아
          보실 수 있습니다. 알림 수신 방법은 알림 수신 동의에서 선택하신 방법으로 발송됩니다.
        </li>
      </ul>
      <div className="on-form-register mt-16">
        <dl className="on-form-row large">
          <div className="form-row-item">
            <dt className="form-row-label">
              <span className="label-title" id="additional-business-label">사업공고</span>
            </dt>
            <dd className="form-row-content">
              <div className="form-wrapper">
                <div
                  className="krds-check-area"
                  role="radiogroup"
                  aria-labelledby="additional-business-label"
                >
                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalBusiness"
                      id="additional_business_on"
                      value="Y"
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.business] === 'Y'}
                      disabled={saving}
                      onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.business, 'Y')}
                    />
                    <label htmlFor="additional_business_on">받기</label>
                  </div>

                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalBusiness"
                      id="additional_business_off"
                      value="N"
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.business] === 'N'}
                      disabled={saving}
                      onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.business, 'N')}
                    />
                    <label htmlFor="additional_business_off">끄기</label>
                  </div>
                </div>
              </div>
            </dd>
          </div>

          <div className="form-row-item">
            <dt className="form-row-label">
              <span className="label-title" id="additional-policy-label">정책금융 지원사업</span>
            </dt>
            <dd className="form-row-content">
              <div className="form-wrapper">
                <div
                  className="krds-check-area"
                  role="radiogroup"
                  aria-labelledby="additional-policy-label"
                >
                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalPolicy"
                      id="additional_policy_on"
                      value="Y"
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.policyFinance] === 'Y'}
                      disabled={saving}
                      onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.policyFinance, 'Y')}
                    />
                    <label htmlFor="additional_policy_on">받기</label>
                  </div>

                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalPolicy"
                      id="additional_policy_off"
                      value="N"
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.policyFinance] === 'N'}
                      disabled={saving}
                      onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.policyFinance, 'N')}
                    />
                    <label htmlFor="additional_policy_off">끄기</label>
                  </div>
                </div>
              </div>
            </dd>
          </div>

          <div className="form-row-item">
            <dt className="form-row-label">
              <span className="label-title" id="additional-certificate-label">증명서 발급</span>
            </dt>
            <dd className="form-row-content">
              <div className="form-wrapper">
                <div
                  className="krds-check-area"
                  role="radiogroup"
                  aria-labelledby="additional-certificate-label"
                >
                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalCertificate"
                      id="additional_certificate_on"
                      value="Y"
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.certificate] === 'Y'}
                      disabled={saving}
                      onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.certificate, 'Y')}
                    />
                    <label htmlFor="additional_certificate_on">받기</label>
                  </div>

                  <div className="krds-form-check medium">
                    <input
                      type="radio"
                      name="additionalCertificate"
                      id="additional_certificate_off"
                      value="N"
                      checked={infoReceptionAgreements[INFO_RECEPTION_MNS_CODES.certificate] === 'N'}
                      disabled={saving}
                      onChange={() => setInfoReceptionAgreement(INFO_RECEPTION_MNS_CODES.certificate, 'N')}
                    />
                    <label htmlFor="additional_certificate_off">끄기</label>
                  </div>
                </div>
              </div>
            </dd>
          </div>
        </dl>
      </div>
      <ul className="info-list-point">
        <li>
          <i className="svg-icon ico-checkbox" />
          정보변경은 법인 공동인증서 인증 후 변경이 가능합니다.
        </li>
      </ul>
    </div>
  );

  const renderLoginIdCheckMessage = () => {
    if (!loginIdMissing) return null;
    if (loginIdCheckStatus === 'checking') {
      return <span className="form-hint">확인 중...</span>;
    }
    if (loginIdCheckStatus === 'available') {
      return <span className="form-hint success">사용 가능한 아이디입니다.</span>;
    }
    if (loginIdCheckStatus === 'taken') {
      return <span className="form-hint error">이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.</span>;
    }
    return null;
  };

  const renderLoginInfoForm = () => (
    <div className="conts-wrap mt-64">
      <div className="on-form-register">
        <h3 className="form-title">로그인 정보 입력</h3>
        <dl className="on-form-row large">
          <div className="form-row-item">
            <dt className="form-row-label">
              <label htmlFor="additional_login_id">로그인 ID</label>
            </dt>
            <dd className="form-row-content">
              <div className="form-wrapper row-small">
                <input
                  type="text"
                  id="additional_login_id"
                  className="krds-input small w-220"
                  maxLength={LOGIN_ID_MAX_LENGTH}
                  value={loginId}
                  disabled={!loginIdMissing || saving}
                  onChange={(event) => handleLoginIdChange(event.target.value)}
                />
                {loginIdMissing && (
                  <button
                    type="button"
                    className="krds-btn secondary small"
                    disabled={saving || loginIdCheckStatus === 'checking'}
                    onClick={handleCheckLoginId}
                  >
                    중복확인
                  </button>
                )}
              </div>
              {renderLoginIdCheckMessage()}
            </dd>
          </div>
          <div className="form-row-item">
            <dt className="form-row-label">
              <label htmlFor="additional_password">비밀번호</label>
            </dt>
            <dd className="form-row-content">
              <div className="form-wrapper w-220">
                <input
                  type="password"
                  id="additional_password"
                  className="krds-input small"
                  value={password}
                  disabled={saving}
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </dd>
          </div>
          <div className="form-row-item">
            <dt className="form-row-label">
              <label htmlFor="additional_password_confirm">비밀번호 확인</label>
            </dt>
            <dd className="form-row-content">
              <div className="form-wrapper w-220">
                <input
                  type="password"
                  id="additional_password_confirm"
                  className="krds-input small"
                  value={passwordConfirm}
                  disabled={saving}
                  autoComplete="new-password"
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                />
              </div>
            </dd>
          </div>
        </dl>
      </div>
      <ul className="info-list-point">
        <li>
          <i className="svg-icon ico-checkbox" />
          비밀번호는 8~20자이며 영문, 숫자, 특수문자 중 두 가지 이상을 조합해야 합니다.
        </li>
      </ul>
    </div>
  );

  const renderIndividualMemberInfoForm = () => (
    <div className="conts-wrap mt-64">
      <div className="on-form-register">
        <h3 className="form-title">회원정보 변경</h3>
        <dl className="on-form-row large">
          <div className="form-row-item">
            <dt className="form-row-label">
              <label htmlFor="additional_individual_name">이름</label>
            </dt>
            <dd className="form-row-content">
              <span id="additional_individual_name" className="text-value">
                {formValues.mbrNm || '--'}
              </span>
            </dd>
          </div>
          <div className="form-row-item">
            <dt className="form-row-label">
              <label htmlFor="additional_individual_mobile">휴대전화번호</label>
            </dt>
            <dd className="form-row-content">
              <span id="additional_individual_mobile" className="text-value">
                {renderManagerPhoneNumber(formValues.indvMblTelno)}
              </span>
            </dd>
          </div>
          <div className="form-row-item">
            <dt className="form-row-label">
              <label htmlFor="additional_individual_phone_area">전화번호</label>
            </dt>
            <dd className="form-row-content">
              <div className={`form-wrapper row-small ${styles.phoneInline}`}>
                <select
                  className="krds-form-select small w-120"
                  id="additional_individual_phone_area"
                  value={formValues.indvGnrlTelnoParts[0]}
                  onChange={(event) => setPhonePartValue('indvGnrlTelnoParts', 0, event.target.value)}
                >
                  {renderPhoneAreaOptions()}
                </select>
                <span>-</span>
                <input
                  type="text"
                  className="krds-input small w-120"
                  placeholder="0000"
                  title="전화번호 중간번호 입력"
                  maxLength={4}
                  value={formValues.indvGnrlTelnoParts[1]}
                  onChange={(event) => setPhonePartValue('indvGnrlTelnoParts', 1, keepDigitsOnly(event.target.value))}
                />
                <span>-</span>
                <input
                  type="text"
                  className="krds-input small w-120"
                  placeholder="0000"
                  title="전화번호 끝번호 입력"
                  maxLength={4}
                  value={formValues.indvGnrlTelnoParts[2]}
                  onChange={(event) => setPhonePartValue('indvGnrlTelnoParts', 2, keepDigitsOnly(event.target.value))}
                />
              </div>
            </dd>
          </div>
          <div className="form-row-item">
            <dt className="form-row-label">
              <label htmlFor="additional_individual_email_local">이메일</label>
            </dt>
            <dd className="form-row-content">
              <div className={`form-wrapper row-small ${styles.emailInline}`}>
                <input
                  type="text"
                  id="additional_individual_email_local"
                  className="krds-input small w-140"
                  title="이메일 아이디 입력"
                  maxLength={64}
                  value={formValues.emailLocal}
                  onChange={(event) => setFormValue('emailLocal', removeKoreanCharacters(event.target.value))}
                />
                <span>@</span>
                <input
                  type="text"
                  className="krds-input small w-140"
                  title="이메일 도메인 입력"
                  maxLength={255}
                  value={formValues.emailDomain}
                  onChange={(event) => setFormValue('emailDomain', removeKoreanCharacters(event.target.value))}
                />
                <span>-</span>
                <select
                  className="krds-form-select small w-140"
                  title="이메일 선택"
                  onChange={(event) => setFormValue('emailDomain', removeKoreanCharacters(event.target.value))}
                >
                  {renderEmailDomainOptions()}
                </select>
              </div>
            </dd>
          </div>
        </dl>
      </div>
      <ul className="info-list-point">
        <li>
          <i className="svg-icon ico-checkbox" />
          이름과 휴대전화번호는 본인 인증 정보 기준으로 표시됩니다.
        </li>
      </ul>
    </div>
  );

  const renderCorporateMemberInfoForm = () => (
    <>
      <div className="conts-wrap mt-64">
        <div className="on-form-register">
          <h3 className="form-title">회원정보 변경</h3>
          <dl className="on-form-row large">
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="additional_corporate_name">기업명</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input
                    type="text"
                    id="additional_corporate_name"
                    className="krds-input small"
                    maxLength={100}
                    value={formValues.mbrNm}
                    disabled
                  />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="additional_corporate_brno">사업자등록번호</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input
                    type="text"
                    id="additional_corporate_brno"
                    className="krds-input small"
                    maxLength={10}
                    value={formValues.brno}
                    disabled
                  />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="additional_corporate_crno">법인등록번호</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input
                    type="text"
                    id="additional_corporate_crno"
                    className="krds-input small"
                    maxLength={13}
                    value={formValues.crno}
                    disabled
                  />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="additional_corporate_ceo">대표자 이름</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input
                    type="text"
                    id="additional_corporate_ceo"
                    className="krds-input small"
                    maxLength={100}
                    value={formValues.rprsvNm}
                    onChange={(event) => setFormValue('rprsvNm', removeDigits(event.target.value))}
                  />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="additional_corporate_tel_area">대표 전화</label>
              </dt>
              <dd className="form-row-content">
                <div className={`form-wrapper row-small ${styles.phoneInline}`}>
                  <select
                    className="krds-form-select small w-120"
                    id="additional_corporate_tel_area"
                    value={formValues.rprsTelnoParts[0]}
                    onChange={(event) => setPhonePartValue('rprsTelnoParts', 0, event.target.value)}
                  >
                    {renderPhoneAreaOptions()}
                  </select>
                  <span>-</span>
                  <input
                    type="text"
                    className="krds-input small w-120"
                    placeholder="0000"
                    title="대표전화 중간번호 입력"
                    maxLength={4}
                    value={formValues.rprsTelnoParts[1]}
                    onChange={(event) => setPhonePartValue('rprsTelnoParts', 1, keepDigitsOnly(event.target.value))}
                  />
                  <span>-</span>
                  <input
                    type="text"
                    className="krds-input small w-120"
                    placeholder="0000"
                    title="대표전화 끝번호 입력"
                    maxLength={4}
                    value={formValues.rprsTelnoParts[2]}
                    onChange={(event) => setPhonePartValue('rprsTelnoParts', 2, keepDigitsOnly(event.target.value))}
                  />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="additional_corporate_fax_area">팩스 번호</label>
              </dt>
              <dd className="form-row-content">
                <div className={`form-wrapper row-small ${styles.phoneInline}`}>
                  <select
                    className="krds-form-select small w-120"
                    id="additional_corporate_fax_area"
                    value={formValues.rprsFxnoParts[0]}
                    onChange={(event) => setPhonePartValue('rprsFxnoParts', 0, event.target.value)}
                  >
                    {renderPhoneAreaOptions()}
                  </select>
                  <span>-</span>
                  <input
                    type="text"
                    className="krds-input small w-120"
                    placeholder="0000"
                    title="팩스번호 중간번호 입력"
                    maxLength={4}
                    value={formValues.rprsFxnoParts[1]}
                    onChange={(event) => setPhonePartValue('rprsFxnoParts', 1, keepDigitsOnly(event.target.value))}
                  />
                  <span>-</span>
                  <input
                    type="text"
                    className="krds-input small w-120"
                    placeholder="0000"
                    title="팩스번호 끝번호 입력"
                    maxLength={4}
                    value={formValues.rprsFxnoParts[2]}
                    onChange={(event) => setPhonePartValue('rprsFxnoParts', 2, keepDigitsOnly(event.target.value))}
                  />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="additional_corporate_email_local">이메일</label>
              </dt>
              <dd className="form-row-content">
                <div className={`form-wrapper row-small ${styles.emailInline}`}>
                  <input
                    type="text"
                    id="additional_corporate_email_local"
                    className="krds-input small w-140"
                    title="이메일 아이디 입력"
                    maxLength={64}
                    value={formValues.emailLocal}
                    onChange={(event) => setFormValue('emailLocal', removeKoreanCharacters(event.target.value))}
                  />
                  <span>@</span>
                  <input
                    type="text"
                    className="krds-input small w-140"
                    title="이메일 도메인 입력"
                    maxLength={255}
                    value={formValues.emailDomain}
                    onChange={(event) => setFormValue('emailDomain', removeKoreanCharacters(event.target.value))}
                  />
                  <span>-</span>
                  <select
                    className="krds-form-select small w-140"
                    title="이메일 선택"
                    onChange={(event) => setFormValue('emailDomain', removeKoreanCharacters(event.target.value))}
                  >
                    {renderEmailDomainOptions()}
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label flex-start">
                <label htmlFor="additional_corporate_zip">회사주소</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper row-small">
                  <input
                    type="text"
                    id="additional_corporate_zip"
                    className="krds-input small w-150"
                    placeholder="-"
                    maxLength={5}
                    value={formValues.zip}
                    onChange={(event) => setFormValue('zip', event.target.value)}
                    disabled
                  />
                  <JusoAddressSearchButton
                    onSelect={handleSelectAddress}
                    onError={handleAddressSearchError}
                    buttonText="우편번호 검색"
                    disabled={saving}
                  />
                </div>
                <div className="form-wrapper">
                  <input
                    type="text"
                    className="krds-input small w-460"
                    placeholder="-"
                    maxLength={200}
                    value={formValues.entAddr}
                    onChange={(event) => setFormValue('entAddr', event.target.value)}
                    disabled
                  />
                </div>
                <div className="form-wrapper">
                  <input
                    type="text"
                    className="krds-input small w-460"
                    placeholder="상세 주소 입력"
                    maxLength={200}
                    value={formValues.entDaddr}
                    onChange={(event) => setFormValue('entDaddr', event.target.value)}
                  />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="additional_corporate_homepage">홈페이지 주소</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <input
                    type="text"
                    id="additional_corporate_homepage"
                    className="krds-input small w-220"
                    placeholder="-"
                    maxLength={2000}
                    value={formValues.hmpgAddr}
                    onChange={(event) => setFormValue('hmpgAddr', event.target.value)}
                  />
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

    </>
  );

  return (
    <div className={styles.page}>
      <section
        id="modal_additional_info_required"
        className={styles.modalWrap}
        role="dialog"
        aria-modal="true"
        aria-labelledby="additionalInfoRequiredTitle"
      >
        <div className={styles.modalDialog}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <p className={styles.eyebrow}>{memberTypeLabel}</p>
              <h1 id="additionalInfoRequiredTitle" className={styles.modalTitle}>
                추가정보 입력이 필요합니다.
              </h1>
              <p className={styles.guideText}>
                서비스 이용을 계속하려면 우리 사이트에서 사용할 로그인 ID와 비밀번호를 등록해 주세요.
              </p>
            </div>

            {detailLoading && (
              <p className={styles.stateText}>회원정보를 불러오는 중입니다.</p>
            )}
            {detailLoadError && (
              <p className={styles.errorText}>{detailLoadError}</p>
            )}

            <form onSubmit={handleSubmit}>
              {renderLoginInfoForm()}
              {currentMode === 'CORPORATE'
                ? renderCorporateMemberInfoForm()
                : renderIndividualMemberInfoForm()}
              {renderNotificationConsentForm()}
              {renderCustomNotificationServiceForm()}

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className="krds-btn secondary"
                  disabled={saving}
                  onClick={handleCloseForTest}
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="krds-btn primary"
                  disabled={saving || detailLoading || (loginIdMissing && !loginIdConfirmed)}
                >
                  {saving ? '저장 중' : '저장하고 계속하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className={styles.modalBackdrop} />
      </section>
    </div>
  );
}
