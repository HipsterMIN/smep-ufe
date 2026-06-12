import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/useAuthStore.jsx';

const PASSWORD_CHANGE_PATH = '/mb/mbr/UI_USR_R_420';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 2050,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.6rem',
};

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
};

const dialogStyle = {
  position: 'relative',
  zIndex: 1,
  width: '48rem',
  maxWidth: 'calc(100% - 3.2rem)',
  background: 'var(--krds-light-color-surface-white-subtler, #ffffff)',
  borderRadius: '0.8rem',
  boxShadow: '0 1.2rem 3.2rem rgba(0,0,0,0.18)',
  padding: '3.2rem',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.2rem 0.8rem',
  borderRadius: '10rem',
  background: '#fef3cd',
  color: '#856404',
  fontSize: '1.2rem',
  fontWeight: 700,
  marginBottom: '1.2rem',
};

const titleStyle = {
  margin: '0 0 1.2rem',
  fontSize: '2rem',
  fontWeight: 700,
  color: 'var(--krds-light-color-text-primary, #101828)',
  letterSpacing: '-0.03em',
};

const bodyStyle = {
  margin: '0 0 0.8rem',
  fontSize: '1.4rem',
  lineHeight: 1.65,
  color: 'var(--krds-light-color-text-basic, #344054)',
};

const noteStyle = {
  margin: '0 0 2.4rem',
  fontSize: '1.3rem',
  lineHeight: 1.6,
  color: 'var(--krds-light-color-text-subtler, #667085)',
  paddingLeft: '1.2rem',
  borderLeft: '3px solid var(--krds-light-color-border-subtler, #e4e7ec)',
};

const btnGroupStyle = {
  display: 'flex',
  gap: '0.8rem',
  justifyContent: 'flex-end',
};

const InitialPasswordNoticeModal = () => {
  const isLogin = useAuthStore((state) => state.isLogin);
  const initialPassword = useAuthStore((state) => state.initialPassword);
  const additionalInfoRequired = useAuthStore((state) => state.additionalInfoRequired);
  const dismissed = useAuthStore((state) => state.initialPasswordNoticeDismissed);
  const dismissInitialPasswordNotice = useAuthStore((state) => state.dismissInitialPasswordNotice);
  const navigate = useNavigate();

  // ENT 회원은 AdditionalInfoRequiredGate에서 강제 변경하므로 여기서는 IND(비강제) 대상만 표시한다.
  const shouldShow = isLogin && initialPassword && !additionalInfoRequired && !dismissed;

  if (!shouldShow) {
    return null;
  }

  const handleChangeNow = () => {
    dismissInitialPasswordNotice();
    navigate(PASSWORD_CHANGE_PATH);
  };

  const handleLater = () => {
    dismissInitialPasswordNotice();
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="init-pwd-notice-title">
      <div style={backdropStyle} onClick={handleLater} aria-hidden="true" />
      <div style={dialogStyle}>
        <div style={badgeStyle}>
          <span>⚠</span>
          <span>초기 비밀번호 사용 중</span>
        </div>
        <h2 id="init-pwd-notice-title" style={titleStyle}>
          비밀번호 변경을 권장합니다
        </h2>
        <p style={bodyStyle}>
          현재 자동 발급된 초기 비밀번호를 사용하고 있습니다.
          <br />
          안전한 서비스 이용을 위해 비밀번호를 변경해 주세요.
        </p>
        <p style={noteStyle}>
          초기 비밀번호를 모르시는 경우, 회원 가입 시 발송된 SMS 또는 이메일을 확인해 주세요.
        </p>
        <div style={btnGroupStyle}>
          <button
            type="button"
            className="krds-btn medium outline"
            onClick={handleLater}
          >
            나중에 변경
          </button>
          <button
            type="button"
            className="krds-btn medium primary"
            onClick={handleChangeNow}
          >
            지금 변경하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialPasswordNoticeModal;
