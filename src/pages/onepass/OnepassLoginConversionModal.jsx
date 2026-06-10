import React from 'react';
import modalIntegratedLoginImg from '@assets/sub/modal_integrated_login_img.png';
import styles from './OnepassLoginConversionModal.module.css';
import { onePassJoin } from '../../utils/keycloakGetAuthCode';

const noop = () => {};

export default function OnepassLoginConversionModal({
  isOpen = true,
  onConvert = noop,
  onLater = noop,
  onClose = noop,
  hasCi = true,
}) {
  if (!isOpen) {
    return null;
  }

  const handleConvertClick = () => {
    onConvert();
    onePassJoin();
  };

  const handleIntegratedLoginClick = () => {
    onLater();
  };

  // CI 없는 회원: 개인인증 유도 + "준비 중" 안내
  if (!hasCi) {
    return (
      <div id="wrap" className={styles.wrap}>
        <div
          id="popup-container"
          className={styles.popupContainer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onepassLoginConversionTitle"
        >
          <div className={styles.popupInner}>
            <h2 id="onepassLoginConversionTitle" className={styles.popupTitle}>
              통합로그인
            </h2>
            <figure className={styles.visual}>
              <img className={styles.visualImage} src={modalIntegratedLoginImg} alt="통합로그인 안내" />
            </figure>
            <div className={styles.conversionContent}>
              <p className={styles.conversionTitle}>본인인증이 필요합니다</p>
              <p className={styles.guideText}>
                <strong>통합회원 전환을 위해 본인인증이 필요합니다.</strong>
                <br />
                해당 서비스는 현재 준비 중입니다. 준비가 완료되는 대로 안내해 드리겠습니다.
              </p>
            </div>
            <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
              <span>확인</span>
              <i className={styles.iconWrap} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="wrap" className={styles.wrap}>
      <div
        id="popup-container"
        className={styles.popupContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onepassLoginConversionTitle"
      >
        <div className={styles.popupInner}>
          <h2 id="onepassLoginConversionTitle" className={styles.popupTitle}>
            통합로그인
          </h2>
          <figure className={styles.visual}>
            <img className={styles.visualImage} src={modalIntegratedLoginImg} alt="통합로그인 안내" />
          </figure>
          <div className={styles.conversionContent}>
            <p className={styles.conversionTitle}>중기 통합회원 전환</p>
            <p className={styles.guideText}>
              <strong>하나의 아이디로 중소벤처기업부 유관기관 서비스를 모두 이용해 보세요.</strong>
              <br />
              기존 계정을 통합로그인으로 전환하시면, 사이트마다 로그인할 필요 없이 더욱 편리하고 안전하게 서비스를
              이용하실 수 있습니다.
            </p>
            <button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={handleConvertClick}>
              <span>중기 통합회원 전환 바로가기</span>
              <i className={styles.iconWrap} aria-hidden="true" />
            </button>
          </div>
          <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={handleIntegratedLoginClick}>
            <span>다음에 전환하기</span>
            <i className={styles.iconWrap} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
