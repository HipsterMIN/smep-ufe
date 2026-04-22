import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Datepicker from '@components/ui/Datepicker.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import {
  fetchCorporateMemberCodeOptions,
  fetchCorporateMemberDetail,
  fetchKsicTopLevelOptions,
  extractTopLevelKsicCd,
  updateCorporateMemberDetail,
} from '@/pages/my-business/member/memberUtils.js';
import {
  parseDateFromYmd,
  toYmd,
  decodeJwtPayload,
} from '@utils/commonUtils.js';

// 로그인/store 정리 전까지 기업정보 수정 화면은 전달된 회원번호가 없으면 임시 폴백 회원번호를 그대로 사용한다.
const TEMP_FALLBACK_MBR_NO = '2025120500136492';

const UI_USR_W_452 = () => {
  const authToken = useAuthStore((state) => state.token);
  const tokenPayload = decodeJwtPayload(authToken);
  const navigate = useNavigate();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const memberNo = tokenPayload?.member_no || TEMP_FALLBACK_MBR_NO;
  const [codeOptions, setCodeOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [initialKsicCd, setInitialKsicCd] = useState('');
  const [form, setForm] = useState({
    entSclCd: '',
    fndnDate: null,
    wrkrCntClsfCd: '',
    slsAmtClsfCd: '',
    mainBizFldNm: '',
    ksicCd: '',
    stdgCtpvCd: '',
    stdgSggCd: '',
    etcExpln: '',
    entExpln: '',
  });
  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [sigunguLoading, setSigunguLoading] = useState(false);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  useEffect(() => {
    let active = true;

    const loadCorporateMember = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const [detail, commonCodes, ksicTopLevelOptions] = await Promise.all([
          fetchCorporateMemberDetail(apiClient, memberNo),
          fetchCorporateMemberCodeOptions(),
          fetchKsicTopLevelOptions(apiClient),
        ]);

        if (!active) {
          return;
        }

        setCodeOptions({
          ...commonCodes,
          KSIC_TOP_LEVEL: ksicTopLevelOptions,
        });
        const topLevelKsicCd = extractTopLevelKsicCd(detail?.ksicCd);
        setInitialKsicCd(topLevelKsicCd);
        setForm({
          entSclCd: detail?.entSclCd || '',
          fndnDate: parseDateFromYmd(detail?.fndnYmd),
          wrkrCntClsfCd: detail?.wrkrCntClsfCd || '',
          slsAmtClsfCd: detail?.slsAmtClsfCd || '',
          mainBizFldNm: detail?.mainBizFldNm || '',
          ksicCd: topLevelKsicCd,
          stdgCtpvCd: String(detail?.stdgCtpvCd || '').trim(),
          stdgSggCd: String(detail?.stdgSggCd || '').trim(),
          etcExpln: detail?.etcExpln || '',
          entExpln: detail?.entExpln || '',
        });
      } catch (error) {
        if (!active) {
          return;
        }
        console.error('기업회원 수정 정보 조회 실패:', error);
        setErrorMessage(error?.message || '기업회원 수정 정보를 불러오지 못했습니다.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCorporateMember();

    return () => {
      active = false;
    };
  }, [memberNo]);

  useEffect(() => {
    let active = true;

    const fetchSidoList = async () => {
      try {
        const response = await apiClient.get('/api/v1/stdg/sido');
        const responseData = response?.data ?? response;
        if (active) {
          setSidoList(Array.isArray(responseData) ? responseData : []);
        }
      } catch (error) {
        console.error('시도 목록 조회 실패:', error);
      }
    };

    fetchSidoList();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const stdgCtpvCd = String(form.stdgCtpvCd || '').trim();
    if (!stdgCtpvCd) {
      setSigunguList([]);
      setSigunguLoading(false);
      return undefined;
    }

    let active = true;
    const fetchSigunguList = async () => {
      setSigunguLoading(true);
      try {
        const response = await apiClient.get(
          `/api/v1/stdg/sigungu?sidoCd=${encodeURIComponent(stdgCtpvCd)}`,
        );
        const responseData = response?.data ?? response;
        if (active) {
          setSigunguList(Array.isArray(responseData) ? responseData : []);
        }
      } catch (error) {
        console.error('시군구 목록 조회 실패:', error);
        if (active) {
          setSigunguList([]);
        }
      } finally {
        if (active) {
          setSigunguLoading(false);
        }
      }
    };

    fetchSigunguList();

    return () => {
      active = false;
    };
  }, [form.stdgCtpvCd]);

  const handleFieldChange = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSidoChange = (value) => {
    setForm((prev) => ({
      ...prev,
      stdgCtpvCd: value,
      stdgSggCd: '',
    }));
  };

  const handleSigunguChange = (value) => {
    setForm((prev) => ({
      ...prev,
      stdgCtpvCd: value ? value.slice(0, 2) : prev.stdgCtpvCd,
      stdgSggCd: value ? value.slice(2, 5) : '',
    }));
  };

  const handleSave = async () => {
    if (!memberNo) {
      alert('회원번호를 확인할 수 없습니다.');
      return;
    }

    if (
      !form.entSclCd ||
      !form.fndnDate ||
      !form.wrkrCntClsfCd ||
      !form.slsAmtClsfCd ||
      !form.mainBizFldNm.trim() ||
      !form.ksicCd ||
      !form.stdgCtpvCd ||
      !form.stdgSggCd ||
      !form.etcExpln.trim()
    ) {
      alert('필수 입력 항목을 확인해주세요.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const nextKsicCd = form.ksicCd.trim();
      await updateCorporateMemberDetail(apiClient, memberNo, {
        entSclCd: form.entSclCd,
        fndnYmd: toYmd(form.fndnDate),
        wrkrCntClsfCd: form.wrkrCntClsfCd,
        slsAmtClsfCd: form.slsAmtClsfCd,
        mainBizFldNm: form.mainBizFldNm.trim(),
        // 사용자가 산업구분을 실제로 바꾼 경우에만 1레벨 코드를 보내 기존 세분류 값을 무의식적으로 축소하지 않게 한다.
        ksicCd: nextKsicCd && nextKsicCd !== initialKsicCd ? nextKsicCd : undefined,
        stdgCtpvCd: form.stdgCtpvCd,
        stdgSggCd: form.stdgSggCd,
        etcExpln: form.etcExpln.trim(),
        entExpln: form.entExpln.trim(),
      });
      alert('저장되었습니다.');
      navigate('..', { relative: 'path' });
    } catch (error) {
      console.error('기업회원 수정 저장 실패:', error);
      alert(error?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const selectedSigunguCd = form.stdgCtpvCd && form.stdgSggCd
    ? `${form.stdgCtpvCd}${form.stdgSggCd}`
    : '';
  const isSigunguDisabled = loading || saving || sigunguLoading || !form.stdgCtpvCd;

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">기업 기본정보</h2>
        </div>

        <div className="on-form-register">
          <div className="on-form-option">
            <p className="txt-caution">*표시는 필수 입력입니다.</p>
            <button
              type="button"
              className="krds-btn small secondary"
              disabled
              title="KED정보 로드 확인 대기"
            >
              KED정보 로드
            </button>
          </div>
          <dl className="on-form-row large">
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="select_01">
                  기업규모<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select
                    id="select_01"
                    className="krds-form-select small"
                    value={form.entSclCd}
                    onChange={(event) => handleFieldChange('entSclCd', event.target.value)}
                    disabled={loading || saving}
                  >
                    <option value="">선택</option>
                    {(codeOptions.ENT_SCL_CD || []).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </dd>
              <dt className="form-row-label">
                <span className="label">
                  설립일<span className="on-required"><span className="sr-only">필수입력</span></span>
                </span>
              </dt>
              <dd className="form-row-content">
                <Datepicker
                  id="datepicker"
                  selected={form.fndnDate}
                  onChange={(date) => handleFieldChange('fndnDate', date)}
                  className="ondatepicker-small"
                  title="설립일 선택"
                  disabled={loading || saving}
                />
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="select_02">
                  근로자수<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select
                    id="select_02"
                    className="krds-form-select small"
                    value={form.wrkrCntClsfCd}
                    onChange={(event) => handleFieldChange('wrkrCntClsfCd', event.target.value)}
                    disabled={loading || saving}
                  >
                    <option value="">선택</option>
                    {(codeOptions.WRKR_CNT_CLSF_CD || []).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </dd>
              <dt className="form-row-label">
                <label htmlFor="select_03">
                  매출액<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select
                    id="select_03"
                    className="krds-form-select small"
                    value={form.slsAmtClsfCd}
                    onChange={(event) => handleFieldChange('slsAmtClsfCd', event.target.value)}
                    disabled={loading || saving}
                  >
                    <option value="">선택</option>
                    {(codeOptions.SLS_AMT_CLSF_CD || []).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="input_01">주요사업분야<span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input
                    type="text"
                    id="input_01"
                    className="krds-input small"
                    placeholder="내용을 입력해주세요."
                    value={form.mainBizFldNm}
                    onChange={(event) => handleFieldChange('mainBizFldNm', event.target.value)}
                    disabled={loading || saving}
                  />
                </div>
              </dd>
              <dt className="form-row-label">
                <label htmlFor="select_04">
                  산업구분<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select
                    id="select_04"
                    className="krds-form-select small"
                    value={form.ksicCd}
                    onChange={(event) => handleFieldChange('ksicCd', event.target.value)}
                    disabled={loading || saving}
                  >
                    <option value="">선택</option>
                    {(codeOptions.KSIC_TOP_LEVEL || []).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="select_05">
                  소재지<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="select-group">
                  <div className="form-wrapper w-184">
                    <select
                      id="select_05"
                      className="krds-form-select small"
                      title="소재지 선택"
                      value={form.stdgCtpvCd}
                      onChange={(event) => handleSidoChange(event.target.value)}
                      disabled={loading || saving}
                    >
                      <option value="">시도선택</option>
                      {sidoList.map((item) => (
                        <option key={item.code} value={item.code}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-wrapper w-184">
                    <select
                      className="krds-form-select small"
                      title="상세 소재지 선택"
                      value={selectedSigunguCd}
                      onChange={(event) => handleSigunguChange(event.target.value)}
                      disabled={isSigunguDisabled}
                    >
                      <option value="">{sigunguLoading ? '조회 중' : '시군구선택'}</option>
                      {sigunguList.map((item) => (
                        <option key={item.code} value={item.code}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label flex-start">
                <label htmlFor="input_02">
                  간단설명<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <input
                    type="text"
                    id="input_02"
                    className="krds-input small"
                    placeholder="내용을 입력해주세요."
                    value={form.etcExpln}
                    onChange={(event) => handleFieldChange('etcExpln', event.target.value)}
                    disabled={loading || saving}
                  />
                </div>
                <div className="form-wrapper">
                  <div className="textarea-wrap mt-16">
                    <textarea
                      className="krds-input"
                      title="기업소개 입력"
                      placeholder="내용을 입력해주세요."
                      value={form.entExpln}
                      onChange={(event) => handleFieldChange('entExpln', event.target.value)}
                      disabled={loading || saving}
                      rows={8}
                    />
                    <p className="textarea-count">
                      <span className="count-now">{form.entExpln.length}</span><span className="count-total">/4000</span>
                    </p>
                  </div>
                </div>
              </dd>
            </div>
          </dl>
        </div>

        {errorMessage && (
          <div className="txt-box mt-24">
            <p className="txt-caution">{errorMessage}</p>
          </div>
        )}

        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button
              type="button"
              className="krds-btn tertiary xlarge"
              onClick={() => navigate('..', { relative: 'path' })}
              disabled={saving}
            >
              취소
            </button>
          </div>
          <div>
            <button
              type="button"
              className="krds-btn primary xlarge"
              onClick={handleSave}
              disabled={loading || saving}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_W_452;
