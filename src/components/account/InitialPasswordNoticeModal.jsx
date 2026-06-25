import { useAuthStore } from '@store/useAuthStore.jsx';

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

  // ENT 회원은 AdditionalInfoRequiredGate에서 강제 변경하므로 여기서는 IND(비강제) 대상만 표시한다.
  const shouldShow = isLogin && initialPassword && !additionalInfoRequired && !dismissed;

  if (!shouldShow) {
    return null;
  }

  const handleConfirm = () => {
    dismissInitialPasswordNotice();
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="init-pwd-notice-title">
      <div style={backdropStyle} onClick={handleConfirm} aria-hidden="true" />
      <div style={dialogStyle}>
        <div style={badgeStyle}>
          <span>🎉</span>
          <span>신규 회원</span>
        </div>
        <h2 id="init-pwd-notice-title" style={titleStyle}>
          통합회원 가입을 축하합니다!
        </h2>
        <p style={bodyStyle}>
          중소벤처24 통합회원으로 가입되었습니다.
          <br />
          회원정보 변경에서 연락처 등 추가 정보를 업데이트할 수 있습니다.
        </p>
        <div style={btnGroupStyle}>
          <button
            type="button"
            className="krds-btn medium primary"
            onClick={handleConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialPasswordNoticeModal;
