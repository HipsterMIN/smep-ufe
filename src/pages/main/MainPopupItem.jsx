import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { buildMainImageUrl, isNewWindow } from './mainUtils.js';

// 5px보다 작으면 손떨림으로 보고 링크 click을 유지한다. 값을 키우면 drag 시작이 둔해지고 줄이면 오클릭 위험이 커진다.
const CONTENT_DRAG_THRESHOLD_PX = 5;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const resolveViewportBounds = (viewportWidth, viewportHeight, popupWidth, popupHeight) => {
  const remainingWidth = viewportWidth - popupWidth;
  const remainingHeight = viewportHeight - popupHeight;

  // viewport보다 큰 팝업은 음수 위치까지 허용해야 반대쪽 끝도 끌어와 볼 수 있다.
  return {
    minLeft: Math.min(0, remainingWidth),
    maxLeft: Math.max(0, remainingWidth),
    minTop: Math.min(0, remainingHeight),
    maxTop: Math.max(0, remainingHeight),
  };
};

/**
 * 메인 팝업 한 개를 표시하고 본문 콘텐츠의 link click과 Pointer Events drag를 구분한다.
 * 하단 액션 버튼은 drag 영역 밖에 두어 기존 클릭 동작을 유지한다.
 *
 * @param {object} props 컴포넌트 속성
 * @param {object} props.popup 메인 API가 반환한 팝업 정보
 * @param {boolean} props.isActive 다른 팝업보다 앞에 표시할지 여부
 * @param {Function} props.onActivate 사용자가 팝업을 누를 때 호출할 함수
 * @param {Function} props.onClose 팝업 닫기 함수
 * @param {Function} props.onHideToday 오늘 하루 보지 않기 함수
 * @returns {JSX.Element} 화면에 고정되는 메인 팝업
 */
const MainPopupItem = ({ popup, isActive, onActivate, onClose, onHideToday }) => {
  const popupRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const keepWithinViewport = useCallback(() => {
    const popupElement = popupRef.current;
    if (!popupElement) return;

    const rect = popupElement.getBoundingClientRect();
    const bounds = resolveViewportBounds(
      window.innerWidth,
      window.innerHeight,
      rect.width,
      rect.height,
    );
    const nextLeft = clamp(rect.left, bounds.minLeft, bounds.maxLeft);
    const nextTop = clamp(rect.top, bounds.minTop, bounds.maxTop);

    setOffset((current) => {
      const next = {
        x: current.x + nextLeft - rect.left,
        y: current.y + nextTop - rect.top,
      };
      return next.x === current.x && next.y === current.y ? current : next;
    });
  }, []);

  useLayoutEffect(() => {
    keepWithinViewport();
    window.addEventListener('resize', keepWithinViewport);
    return () => window.removeEventListener('resize', keepWithinViewport);
  }, [keepWithinViewport]);

  const handlePointerDown = useCallback((event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;

    const popupElement = popupRef.current;
    if (!popupElement) return;

    const rect = popupElement.getBoundingClientRect();
    const captureElement = event.target;
    // 링크 안에서 실제로 누른 요소가 capture를 가져야 무이동 click의 대상도 링크 내부에 남는다.
    suppressClickRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      captureElement,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
      width: rect.width,
      height: rect.height,
      hasDragged: false,
    };

    captureElement.setPointerCapture?.(event.pointerId);
  }, [offset.x, offset.y]);

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    // 작은 손떨림까지 drag로 처리하면 링크 click이 깨지므로 임계값을 넘기 전에는 팝업을 이동하지 않는다.
    if (!drag.hasDragged && Math.hypot(deltaX, deltaY) < CONTENT_DRAG_THRESHOLD_PX) return;

    if (!drag.hasDragged) {
      drag.hasDragged = true;
      setIsDragging(true);
    }
    event.preventDefault();

    const bounds = resolveViewportBounds(
      window.innerWidth,
      window.innerHeight,
      drag.width,
      drag.height,
    );
    const nextLeft = clamp(
      drag.startLeft + deltaX,
      bounds.minLeft,
      bounds.maxLeft,
    );
    const nextTop = clamp(
      drag.startTop + deltaY,
      bounds.minTop,
      bounds.maxTop,
    );

    setOffset({
      x: drag.startOffsetX + nextLeft - drag.startLeft,
      y: drag.startOffsetY + nextTop - drag.startTop,
    });
  }, []);

  const finishDrag = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    suppressClickRef.current = drag.hasDragged;
    dragRef.current = null;
    if (drag.captureElement.hasPointerCapture?.(event.pointerId)) {
      drag.captureElement.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  }, []);

  const handleContentClick = useCallback((event) => {
    if (!suppressClickRef.current) return;

    // drag 직후 발생하는 anchor click만 취소해 의도하지 않은 페이지 이동을 막고, 일반 click은 그대로 통과시킨다.
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const imageSrc = buildMainImageUrl(
    'popups',
    popup.imgAtchFileId,
    popup.imgAtchFileSn,
  );
  const href = popup.imgLnkgUrlAddr || '#';
  const external = isNewWindow(popup.imgLnkgNpagYn);

  return (
    <div
      ref={popupRef}
      className="main-popup-item"
      onPointerDown={onActivate}
      style={{
        position: 'fixed',
        top: `${popup.upendPstnNvl || 120}px`,
        left: `${popup.lfsdPstnNvl || 40}px`,
        width: `${popup.wdthLen || 360}px`,
        height: `${popup.vrtcLen || 420}px`,
        zIndex: isActive ? 1001 : 1000,
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        backgroundColor: '#fff',
        border: '1px solid #d8d8d8',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.18)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="main-popup-content-drag-area"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
        onClickCapture={handleContentClick}
        style={{
          flex: 1,
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          draggable={false}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            cursor: 'inherit',
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={popup.imgSbstTxtCn || popup.popupTtl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
            >
              {popup.imgSbstTxtCn || popup.popupTtl}
            </div>
          )}
        </a>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderTop: '1px solid #eee',
        }}
      >
        {popup.vwngStopUseYn === 'Y' ? (
          <button
            type="button"
            className="krds-btn tertiary small"
            onClick={() => onHideToday(popup.popupId)}
          >
            오늘 하루 보지 않기
          </button>
        ) : (
          <span></span>
        )}
        <button
          type="button"
          className="krds-btn secondary small"
          onClick={() => onClose(popup.popupId)}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default MainPopupItem;
