import React from 'react';
import styles from './OnepassLoginConversionModal.module.css';

const ONEPASS_ORIGIN = 'https://www.smes.go.kr';
const ONEPASS_CONVERSION_PATH = '/onepass-dev/conversion/step1';
const APP_BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const ONEPASS_CLIENT_ID = 'smes-tipa-01';

function buildOnepassConversionUrl() {
  const url = new URL(ONEPASS_CONVERSION_PATH, ONEPASS_ORIGIN);
  const currentOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://www.smes-tipa.go.kr';

  // redirect_uri 등록값이 중복되지 않도록 앱 홈 경로는 trailing slash 없이 정규화한다.
  const redirectUri = `${currentOrigin}${APP_BASE_URL}`;

  url.searchParams.set('client_id', ONEPASS_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);

  return url.toString();
}

function SwitchVisual() {
  return (
    <svg viewBox="0 0 96 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 56.5H71" stroke="#1D9BF0" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M29 55V38.5C29 31.5964 34.5964 26 41.5 26H55.5C62.4036 26 68 31.5964 68 38.5V55H29Z"
        fill="#1D9BF0"
      />
      <path
        d="M33 40.5C33 36.3579 36.3579 33 40.5 33H56.5C60.6421 33 64 36.3579 64 40.5V60H33V40.5Z"
        fill="#F7FBFF"
        stroke="#1787E0"
        strokeWidth="1.5"
      />
      <path
        d="M45.5 26V20.5C45.5 18.0147 47.5147 16 50 16H50.5C52.9853 16 55 18.0147 55 20.5V26"
        stroke="#1787E0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="31" y="30" width="34" height="22" rx="11" fill="#EAF5FF" stroke="#1787E0" strokeWidth="1.5" />
      <circle cx="42" cy="41" r="1.5" fill="#1787E0" />
      <circle cx="54" cy="41" r="1.5" fill="#1787E0" />
      <path
        d="M29 48H22.5C20.567 48 19 46.433 19 44.5C19 42.567 20.567 41 22.5 41H29V48Z"
        fill="#1D9BF0"
        stroke="#1787E0"
        strokeWidth="1.5"
      />
      <path
        d="M68 41H74.5C76.433 41 78 42.567 78 44.5C78 46.433 76.433 48 74.5 48H68V41Z"
        fill="#1D9BF0"
        stroke="#1787E0"
        strokeWidth="1.5"
      />
      <path
        d="M39 52L33 60H47"
        stroke="#1787E0"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M58 52V60" stroke="#1787E0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M66 13V8" stroke="#1787E0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M63.5 10.5H68.5" stroke="#1787E0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M74 13H80" stroke="#1787E0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 39.5V53" stroke="#1787E0" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26" cy="39" r="8" fill="#1D9BF0" />
      <path
        d="M23 38.5C23 37.1193 24.1193 36 25.5 36C26.8807 36 28 37.1193 28 38.5C28 39.3555 27.5701 40.1107 26.9146 40.5619L27.5 44H23.5L24.0854 40.5619C23.4299 40.1107 23 39.3555 23 38.5Z"
        fill="#DDF1FF"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 10H15M15 10L10.5 5.5M15 10L10.5 14.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const noop = () => {};

export default function OnepassLoginConversionModal({
  isOpen = true,
  onConvert = noop,
  onLater = noop,
  onClose = noop,
}) {
  if (!isOpen) {
    return null;
  }

  const onepassConversionUrl = buildOnepassConversionUrl();
  const handleConvertClick = () => {
    if (import.meta.env.DEV) {
      console.log('[Onepass] conversion url:', onepassConversionUrl);
    }
    onConvert();
  };

  return (
    <div className={styles.page}>
      <section
        id="modal_onepass_login_conversion"
        className={styles.modalWrap}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onepassLoginConversionTitle"
      >
        <div className={styles.modalDialog}>
          <div className={styles.modalContent}>
            <div className={styles.modalBody}>
              <div className={styles.modalHeader}>
                <h1 id="onepassLoginConversionTitle" className={styles.modalTitle}>
                  중기원패스 통합로그인 전환
                </h1>
              </div>
              <figure className={styles.switchVisual}>
                <SwitchVisual />
              </figure>
              <div className={styles.modalContents}>
                <p className={styles.guideText}>
                  <strong>하나의 아이디로 중소벤처기업부 유관 기관 서비스를 이용해 보세요.</strong>
                  <br />
                  기존 계정을 통합로그인으로 전환하시면, 사이트마다 로그인할 필요 없이
                  <br />
                  더욱 편리하고 안전하게 서비스를 이용하실 수 있습니다.
                </p>
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <a
                href={onepassConversionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={handleConvertClick}
              >
                <span>중기원패스 통합로그인 전환하기</span>
                <span className={styles.iconWrap}>
                  <ArrowIcon />
                </span>
              </a>
              <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={onLater}>
                <span>나중에 전환하기</span>
                <span className={styles.iconWrap}>
                  <ArrowIcon />
                </span>
              </button>
            </div>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              <span className={styles.visuallyHidden}>닫기</span>
              <span aria-hidden="true" className={styles.closeGlyph}>
                ×
              </span>
            </button>
          </div>
        </div>
        <div className={styles.modalBackdrop} />
      </section>
    </div>
  );
}
