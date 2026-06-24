import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import { api } from '../lib/apiClient';
import { unwrapApiResponseData } from '../lib/apiResponsePayload';
import {
  PASSWORD_FIND_SEND_OPTIONS,
  SEND_TYPE_LABELS,
  createResponseShapeMarker,
  resolvePasswordFindErrorMessage,
} from '../lib/passwordFindDelivery';

const EMPTY_CHANNELS = {};

const getInitialSendType = (defaultSendType, channels) => {
  const defaultOption = PASSWORD_FIND_SEND_OPTIONS.find(
    (option) => option.type === defaultSendType && channels?.[option.channelKey]?.available,
  );

  if (defaultOption) {
    return defaultOption.type;
  }

  return (
    PASSWORD_FIND_SEND_OPTIONS.find((option) => channels?.[option.channelKey]?.available)?.type ||
    PASSWORD_FIND_SEND_OPTIONS[0].type
  );
};

const FindPasswordSend = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};
  const findKey = routeState.findKey || '';
  const channels = routeState.channels || EMPTY_CHANNELS;
  const [selectedSendType, setSelectedSendType] = useState(() =>
    getInitialSendType(routeState.defaultSendType, channels),
  );
  const [isSendingTemporaryPassword, setIsSendingTemporaryPassword] = useState(false);

  useEffect(() => {
    if (findKey) {
      return;
    }

    // 이유: findKey는 임시비밀번호 발송 권한이므로 URL/storage에 보존하지 않고, 새로고침으로 state가 사라지면 재인증을 요구한다.
    window.alert('본인 인증 정보가 만료되었습니다. 비밀번호 찾기를 다시 진행해주세요.');
    navigate('/service/find-password', { replace: true });
  }, [findKey, navigate]);

  const getSendTypeOption = (sendType) =>
    PASSWORD_FIND_SEND_OPTIONS.find((option) => option.type === sendType) || PASSWORD_FIND_SEND_OPTIONS[0];

  const getChannel = (sendType) => {
    const { channelKey } = getSendTypeOption(sendType);
    return channels?.[channelKey] || { available: false, maskedAddress: null };
  };

  const isSelectedSendTypeAvailable = () => Boolean(getChannel(selectedSendType).available);

  const availableSendOptionCount = useMemo(
    () => PASSWORD_FIND_SEND_OPTIONS.filter((option) => channels?.[option.channelKey]?.available).length,
    [channels],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!findKey) {
      alert('본인 인증을 완료해주세요.');
      return;
    }

    if (!isSelectedSendTypeAvailable()) {
      alert('임시비밀번호를 받을 수 있는 발송 방법을 선택해주세요.');
      return;
    }

    setIsSendingTemporaryPassword(true);

    try {
      const sendResponse = await api.post('/api/v1/account/password-find/send', {
        findKey,
        sendType: selectedSendType,
      });
      const sendPayload = unwrapApiResponseData(sendResponse);

      const sendTypeLabel = SEND_TYPE_LABELS[sendPayload?.sendType] || SEND_TYPE_LABELS[selectedSendType];
      const maskedAddress = sendPayload?.maskedAddress ? ` (${sendPayload.maskedAddress})` : '';
      alert(`${sendTypeLabel}${maskedAddress}로 임시비밀번호가 발송되었습니다. 로그인해 주세요.`);
      navigate('/service/login', { replace: true });
    } catch (error) {
      alert(resolvePasswordFindErrorMessage(error));
    } finally {
      setIsSendingTemporaryPassword(false);
    }
  };

  const breadcrumbItems = [
    { label: '비밀번호 찾기', link: '/service/find-password' },
    { label: '임시비밀번호 발급', link: '#' },
  ];

  if (!findKey) {
    return null;
  }

  return (
    <div className="contents">
      <Breadcrumb items={breadcrumbItems} />
      <div className="page-title-wrap" data-type="responsive">
        <h2 className="h-tit">임시비밀번호 발급</h2>
      </div>
      <div className="find-form-area find-pw">
        <form onSubmit={handleSubmit}>
          <div className="conts-wrap form-confirm">
            <h3 className="sec-tit">임시비밀번호 발급</h3>
            <ul className="krds-info-list decimal" role="list">
              <li role="listitem">본인 인증이 완료되었습니다. 임시비밀번호를 받을 방법을 선택해 주세요.</li>
              <li role="listitem">발급된 임시비밀번호로 로그인한 뒤 비밀번호를 변경해 주세요.</li>
            </ul>
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label flex-start">
                  <span>발송 방법</span>
                </dt>
                <dd className="form-row-content">
                  <div className="krds-check-area gap-4">
                    {PASSWORD_FIND_SEND_OPTIONS.map((option) => {
                      const channel = getChannel(option.type);
                      const optionId = `temporaryPasswordSend${option.type}`;
                      const channelLabel = channel.maskedAddress
                        ? ` (${channel.maskedAddress})`
                        : ` (${option.unavailableLabel})`;

                      return (
                        <span className="krds-form-check" key={option.type}>
                          <input
                            type="radio"
                            name="temporaryPasswordSendType"
                            id={optionId}
                            value={option.type}
                            checked={selectedSendType === option.type}
                            onChange={() => setSelectedSendType(option.type)}
                            disabled={!channel.available || isSendingTemporaryPassword}
                          />
                          <label htmlFor={optionId}>
                            {option.label}
                            {channelLabel}
                          </label>
                        </span>
                      );
                    })}
                  </div>
                  <p className="form-hint point">선택한 방법으로 임시비밀번호가 발송됩니다.</p>
                </dd>
              </div>
            </dl>
            <div className="onboard-btm-btngroup bt-0 btn-single">
              <button
                type="submit"
                className="krds-btn large primary"
                disabled={
                  isSendingTemporaryPassword ||
                  !isSelectedSendTypeAvailable() ||
                  availableSendOptionCount === 0
                }
              >
                {isSendingTemporaryPassword ? '발송 중...' : '임시비밀번호 발송'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FindPasswordSend;
