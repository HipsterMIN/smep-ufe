import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import { api } from '@lib/apiClient.js';

const FindId = () => {
  const navigate = useNavigate();
  const [memberType, setMemberType] = useState('personal');
  const [findType, setFindType] = useState('phone');
  const [form, setForm] = useState({ indvMblTelno: '', indvEmlAddr: '', brno: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const isPersonal = memberType === 'personal';
  const isCompany = memberType === 'company';

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;

    if (name === 'indvMblTelno' || name === 'brno') {
      filtered = value.replace(/[^0-9]/g, '');
    }

    setForm(prev => ({ ...prev, [name]: filtered }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError(null);

    try {
      let response;
      if (isCompany) {
        response = await api.post('/api/v1/member/common/find-id/enterprise', {
          mbrNm: form.mbrNm,
          brno: form.brno,
        });
      } else if (findType === 'phone') {
        response = await api.post('/api/v1/member/common/find-id/individual/mobile', {
          mbrNm: form.mbrNm,
          indvMblTelno: form.indvMblTelno,
        });
      } else {
        response = await api.post('/api/v1/member/common/find-id/individual/email', {
          mbrNm: form.mbrNm,
          indvEmlAddr: form.indvEmlAddr,
        });
      }
      const lgnId = response.lgnId || response.data?.lgnId;
      navigate('/service/find-id/result', { state: { lgnId } });
    } catch (err) {
      setError('일치하는 회원 정보가 없습니다.');
    }
  };

  const handleMemberTypeChange = (type) => {
    setMemberType(type);
    setForm({ mbrNm: '', indvMblTelno: '', indvEmlAddr: '', brno: '' });
    setResult(null);
    setError(null);
  };

  // ↓ 여기만 추가
  const handleFindTypeChange = (type) => {
    setFindType(type);
    setResult(null);
    setError(null);
  };

  const breadcrumbItems = [
    { label: '아이디 찾기', link: '#' },
  ];

  return (
    <div className="contents find-id-page">
      <Breadcrumb items={breadcrumbItems} />
      <div className="page-title-wrap" data-type="responsive">
        <h2 className="h-tit">아이디 찾기</h2>
      </div>
      <div className="find-form-area">
        <div className="krds-tab-area layer">
          <div className="tab fill full">
            <ul role="tablist" aria-label="회원 유형 선택">
              <li role="tab" aria-selected={isPersonal} className={isPersonal ? 'active' : ''}>
                <button type="button" className="btn-tab" onClick={() => handleMemberTypeChange('personal')}>개인회원</button>
              </li>
              <li role="tab" aria-selected={isCompany} className={isCompany ? 'active' : ''}>
                <button type="button" className="btn-tab" onClick={() => handleMemberTypeChange('company')}>기업회원</button>
              </li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {isPersonal && (
            <div className="krds-check-area gap-4">
              <span className="krds-form-check">
                {/* ↓ onChange를 handleFindTypeChange 로 교체 */}
                <input type="radio" name="findType" id="findType_01" value="phone" checked={findType === 'phone'} onChange={() => handleFindTypeChange('phone')} />
                <label htmlFor="findType_01">휴대전화번호</label>
              </span>
              <span className="krds-form-check">
                <input type="radio" name="findType" id="findType_02" value="email" checked={findType === 'email'} onChange={() => handleFindTypeChange('email')} />
                <label htmlFor="findType_02">이메일 주소</label>
              </span>
            </div>
          )}

          <div className="find-id-fields">
            {isCompany ? (
              <>
                <div className="form-group">
                  <label htmlFor="mbrNm">기업명</label>
                  <input id="mbrNm" name="mbrNm" type="text" className="krds-input" value={form.mbrNm} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="brno">사업자등록번호</label>
                  <div className="field-control">
                    <input id="brno" name="brno" type="text" className="krds-input" inputMode="numeric" maxLength={10} value={form.brno} onChange={handleChange} />
                    <p>'-'를 제외하고 입력해주세요.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="mbrNm">이름</label>
                  <input id="mbrNm" name="mbrNm" type="text" className="krds-input" value={form.mbrNm} onChange={handleChange} />
                </div>
                {findType === 'phone' ? (
                  <div className="form-group">
                    <label htmlFor="indvMblTelno">휴대전화번호</label>
                    <div className="field-control">
                      <input id="indvMblTelno" name="indvMblTelno" type="text" className="krds-input" inputMode="numeric" value={form.indvMblTelno} onChange={handleChange} />
                      <p>'-'를 제외하고 입력해주세요.</p>
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="indvEmlAddr">이메일 주소</label>
                    <input id="indvEmlAddr" name="indvEmlAddr" type="email" className="krds-input" value={form.indvEmlAddr} onChange={handleChange} />
                  </div>
                )}
              </>
            )}
          </div>

          {error && (
            <p className="error-msg" role="alert">{error}</p>
          )}

          <ul className="btn-group">
            <li>
              <button type="button" className="krds-btn large secondary btn-cancel" onClick={() => navigate('/service/login')}>취소</button>
            </li>
            <li>
              <button type="submit" className="krds-btn large primary btn-confirm">확인</button>
            </li>
          </ul>
        </form>
      </div>
    </div>
  );
};

export default FindId;