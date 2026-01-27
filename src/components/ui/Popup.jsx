import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Popup = ({ 
    isOpen, 
    onClose, 
    title, 
    size, // "large"(default) || "small" || "medium"
    children, 
    footer, 
    noBottomBtn = false,
    noCloseBtn = false, //상단 닫기 버튼 여부
}) => {
  const popupRef = useRef(null);
  const previousFocus = useRef(null);

  // 스크롤, ESC, 포커스 복원
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement; //팝업 열기 버튼 저장
      document.body.style.overflow = 'hidden';
    } else {
      previousFocus.current?.focus(); //열었던 버튼으로 포커스
      document.body.style.overflow = '';
    }

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // 팝업이 DOM에 그려진 "직후"에 포커스를 잡음
  useEffect(() => {
    if (isOpen) {
      const timer = requestAnimationFrame(() => {
        popupRef.current?.focus();
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <section 
      className={`krds-modal fade in shown ${noBottomBtn ? "no-bottom-btn" : ""}`} 
      role="dialog" 
      aria-modal="true"
      ref={popupRef}
      tabIndex="-1"
    >
      <div className={`modal-dialog 
        ${
          size === "small" ? "modal-sm" : 
          size === "medium" ? "modal-md" : ""
        }`}
      >
        <div className="modal-content">
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
          </div>

          <div className="modal-conts">
            <div className="conts-area">
              {children}
            </div>
          </div>

          {!noBottomBtn && footer && (
            <div className="modal-btn btn-wrap">
              {footer}
            </div>
          )}

          {!noCloseBtn && 
            (
              <button 
              type="button" 
              className="btn-close close-modal" 
              onClick={onClose}
              >
                <span className="sr-only">닫기</span>
                <i className="svg-icon ico-del"></i>
              </button>
            )
          }
        </div>
      </div>
      
      <div className="modal-back in" onClick={onClose}></div>
    </section>,
    document.body
  );
};

export default Popup;