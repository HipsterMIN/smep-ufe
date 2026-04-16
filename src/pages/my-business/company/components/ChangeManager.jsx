import Popup from '@components/ui/Popup.jsx';

import { formatPhoneNumber } from '../companyMemberUtils.js';

const HELD_REASON_TEXT = '확인 대기';

const renderValue = (value) => {
  const normalized = String(value ?? '').trim();
  return normalized || '-';
};

const renderContactSummary = (contact) => {
  if (!contact) {
    return (
      <dl>
        <dt>-</dt>
        <dd>
          <div className="info-conts">
            <span className="info-text">-</span>
            <span className="info-text">-</span>
            <span className="info-text">-</span>
            <span className="left-auto">-</span>
          </div>
        </dd>
      </dl>
    );
  }

  return (
    <dl>
      <dt>{renderValue(contact.mbrNm)}</dt>
      <dd>
        <div className="info-conts">
          <span className="info-text">{renderValue(contact.lgnId)}</span>
          <span className="info-text">{formatPhoneNumber(contact.picMblTelno)}</span>
          <span className="info-text">{renderValue(contact.picEmlAddr)}</span>
          <span className="left-auto">
            {`${renderValue(contact.picDeptNm)} ${renderValue(contact.picJbpsNm)}`.trim()}
          </span>
        </div>
      </dd>
    </dl>
  );
};

const ChangeManager = ({
  isOpen,
  onClose,
  currentManager,
  nextManager,
  submitting = false,
  errorMessage = '',
  onSubmit,
}) => (
  <Popup
    isOpen={isOpen}
    onClose={onClose}
    title="기업관리자 변경"
    footer={(
      <>
        <button type="button" className="krds-btn tertiary medium" onClick={onClose} disabled={submitting}>취소</button>
        <button
          type="button"
          className="krds-btn primary medium"
          onClick={onSubmit}
          disabled={submitting || !nextManager}
        >
          기업관리자 변경
        </button>
      </>
    )}
  >
    <div className="conts-wrap">
      <h2 className="sec-tit">변경 전</h2>
      <div className="on-detail-list">
        {renderContactSummary(currentManager)}
      </div>
    </div>

    <div className="conts-wrap">
      <h2 className="sec-tit">변경 후</h2>
      <div className="on-detail-list">
        {renderContactSummary(nextManager)}
      </div>

      <div className="form-group row-sm mt-16">
        <div className="form-tit">
          <label htmlFor="change-manager-reason" className="form-label">변경사유</label>
        </div>
        <div className="form-conts">
          <select className="krds-form-select small" id="change-manager-reason" value={HELD_REASON_TEXT} disabled>
            <option>{HELD_REASON_TEXT}</option>
          </select>
        </div>
      </div>

      <div className="txt-box mt-16">
        <p className="txt-caution">인증 및 변경사유 연계는 현재 확인 대기 상태이며, 1차 구현에서는 인증 확인 API를 항상 통과 처리합니다.</p>
      </div>

      {errorMessage && (
        <div className="txt-box mt-16">
          <p className="txt-caution">{errorMessage}</p>
        </div>
      )}
    </div>
  </Popup>
);

export default ChangeManager;
