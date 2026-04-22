import Popup from '@components/ui/Popup.jsx';

import {
  formatPhoneNumber,
} from '@utils/commonUtils.js';

const renderValue = (value) => {
  const normalized = String(value ?? '').trim();
  return normalized || '-';
};

const JoinOwner = ({
  isOpen,
  onClose,
  searchName,
  onSearchNameChange,
  searchLgnId,
  onSearchLgnIdChange,
  candidate,
  searching = false,
  submitting = false,
  errorMessage = '',
  onSearch,
  onSubmit,
}) => (
  <Popup
    isOpen={isOpen}
    onClose={onClose}
    title="담당자 등록"
    footer={(
      <>
        <button type="button" className="krds-btn tertiary medium" onClick={onClose} disabled={submitting}>닫기</button>
        <button
          type="button"
          className="krds-btn primary medium"
          onClick={onSubmit}
          disabled={submitting || !candidate?.entPicMbrNo}
        >
          등록
        </button>
      </>
    )}
  >
    <div className="txt-box small bg-white gap-16">
      <h3 className="box-tit2">담당자 조회</h3>
      <p className="box-sub">조회하실 담당자의 개인ID를 입력하고, 필요 시 이름으로 한 번 더 좁혀 주세요.</p>
      <div className="box-cnt gap-8">
        <div className="form-group row-sm">
          <div className="form-tit">
            <label htmlFor="join-owner-name" className="form-label">이름</label>
          </div>
          <div className="form-conts">
            <input
              type="text"
              id="join-owner-name"
              className="krds-input small w-260"
              value={searchName}
              onChange={(event) => onSearchNameChange(event.target.value)}
              placeholder="담당자 이름을 입력하세요"
            />
          </div>
        </div>
        <div className="form-group row-sm">
          <div className="form-tit">
            <label htmlFor="join-owner-id" className="form-label">아이디</label>
          </div>
          <div className="form-conts">
            <div className="form-wrapper">
              <input
                type="text"
                id="join-owner-id"
                className="krds-input small w-260"
                value={searchLgnId}
                onChange={(event) => onSearchLgnIdChange(event.target.value)}
                placeholder="개인회원 아이디를 입력하세요"
              />
              <button type="button" className="krds-btn small secondary" onClick={onSearch} disabled={searching}>
                조회
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="conts-wrap">
      <h2 className="sec-tit">담당자 정보</h2>
      <div className="on-detail-list small">
        <dl>
          <dt>{renderValue(candidate?.mbrNm)}</dt>
          <dd>
            <div className="info-conts">
              <span className="info-text">{renderValue(candidate?.lgnId)}</span>
              <span className="info-text">{formatPhoneNumber(candidate?.picMblTelno)}</span>
              <span className="info-text">{renderValue(candidate?.picEmlAddr)}</span>
              <div className="info-btns">
                <button type="button" className="krds-btn small tertiary" disabled>부서명</button>
                <button type="button" className="krds-btn small tertiary" disabled>직급명</button>
              </div>
            </div>
          </dd>
        </dl>
      </div>
    </div>

    {errorMessage && (
      <div className="txt-box mt-16">
        <p className="txt-caution">{errorMessage}</p>
      </div>
    )}
  </Popup>
);

export default JoinOwner;
