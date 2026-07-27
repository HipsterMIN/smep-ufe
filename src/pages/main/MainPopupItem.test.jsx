import { fireEvent, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import MainPopupItem from './MainPopupItem.jsx';

class TestPointerEvent extends MouseEvent {
  constructor(type, properties = {}) {
    super(type, properties);
    Object.defineProperties(this, {
      pointerId: { value: properties.pointerId ?? 0 },
      pointerType: { value: properties.pointerType ?? '' },
      isPrimary: { value: properties.isPrimary ?? false },
    });
  }
}

const popup = {
  popupId: 9,
  popupTtl: '테스트 팝업',
  upendPstnNvl: 120,
  lfsdPstnNvl: 40,
  wdthLen: 360,
  vrtcLen: 420,
  imgAtchFileId: 'FILE-1',
  imgAtchFileSn: 1,
  imgLnkgUrlAddr: 'https://example.com/detail',
  imgLnkgNpagYn: 'Y',
  imgSbstTxtCn: '팝업 이미지 설명',
  vwngStopUseYn: 'Y',
};

const renderPopup = (overrides = {}) => {
  const props = {
    popup,
    isActive: false,
    onActivate: vi.fn(),
    onClose: vi.fn(),
    onHideToday: vi.fn(),
    ...overrides,
  };
  const result = render(<MainPopupItem {...props} />);
  return { ...result, props };
};

const setPopupRect = (element, rect) => {
  element.getBoundingClientRect = vi.fn(() => ({
    x: rect.left,
    y: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => {},
    ...rect,
  }));
};

describe('MainPopupItem', () => {
  beforeAll(() => {
    vi.stubGlobal('PointerEvent', TestPointerEvent);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  });

  it('헤더 없이 서버 위치와 크기, 기존 링크와 하단 버튼을 표시한다', () => {
    const { container } = renderPopup();
    const popupElement = container.querySelector('.main-popup-item');
    const link = screen.getByRole('link');
    const image = screen.getByRole('img', { name: '팝업 이미지 설명' });

    expect(popupElement.style.top).toBe('120px');
    expect(popupElement.style.left).toBe('40px');
    expect(popupElement.style.width).toBe('360px');
    expect(popupElement.style.height).toBe('420px');
    expect(link.getAttribute('href')).toBe('https://example.com/detail');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.draggable).toBe(false);
    expect(image.draggable).toBe(false);
    expect(container.querySelector('strong')).toBeNull();
    expect(screen.queryByRole('button', { name: '팝업 닫기' })).toBeNull();
    expect(screen.getByRole('button', { name: '오늘 하루 보지 않기' })).toBeTruthy();
  });

  it('본문 콘텐츠를 마우스로 끌면 팝업 위치를 이동한다', () => {
    const { container, props } = renderPopup();
    const popupElement = container.querySelector('.main-popup-item');
    const contentArea = container.querySelector('.main-popup-content-drag-area');
    const image = screen.getByRole('img', { name: '팝업 이미지 설명' });
    setPopupRect(popupElement, { left: 40, top: 120, width: 360, height: 420 });

    fireEvent.pointerDown(image, {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 150,
    });
    fireEvent.pointerMove(contentArea, { pointerId: 1, clientX: 250, clientY: 300 });

    expect(popupElement.style.transform).toBe('translate3d(150px, 150px, 0)');
    expect(props.onActivate).toHaveBeenCalledTimes(1);
  });

  it('터치 포인터도 같은 드래그 계산을 사용한다', () => {
    const { container } = renderPopup();
    const popupElement = container.querySelector('.main-popup-item');
    const contentArea = container.querySelector('.main-popup-content-drag-area');
    const image = screen.getByRole('img', { name: '팝업 이미지 설명' });
    setPopupRect(popupElement, { left: 40, top: 120, width: 360, height: 420 });

    fireEvent.pointerDown(image, {
      pointerId: 2,
      pointerType: 'touch',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 150,
    });
    fireEvent.pointerMove(contentArea, { pointerId: 2, clientX: 180, clientY: 230 });

    expect(popupElement.style.transform).toBe('translate3d(80px, 80px, 0)');
  });

  it('pointerup 뒤에는 더 움직이지 않는다', () => {
    const { container } = renderPopup();
    const popupElement = container.querySelector('.main-popup-item');
    const contentArea = container.querySelector('.main-popup-content-drag-area');
    const image = screen.getByRole('img', { name: '팝업 이미지 설명' });
    setPopupRect(popupElement, { left: 40, top: 120, width: 360, height: 420 });

    fireEvent.pointerDown(image, {
      pointerId: 3,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 150,
    });
    fireEvent.pointerMove(contentArea, { pointerId: 3, clientX: 160, clientY: 210 });
    fireEvent.pointerUp(contentArea, { pointerId: 3 });
    fireEvent.pointerMove(contentArea, { pointerId: 3, clientX: 300, clientY: 350 });

    expect(popupElement.style.transform).toBe('translate3d(60px, 60px, 0)');
  });

  it('일반 팝업은 viewport 바깥으로 끌 수 없다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 });
    const { container } = renderPopup();
    const popupElement = container.querySelector('.main-popup-item');
    const contentArea = container.querySelector('.main-popup-content-drag-area');
    const image = screen.getByRole('img', { name: '팝업 이미지 설명' });
    setPopupRect(popupElement, { left: 40, top: 120, width: 360, height: 420 });

    fireEvent.pointerDown(image, {
      pointerId: 4,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 150,
    });
    fireEvent.pointerMove(contentArea, { pointerId: 4, clientX: 1000, clientY: 1000 });

    expect(popupElement.style.transform).toBe('translate3d(400px, 60px, 0)');
  });

  it('viewport보다 큰 팝업은 숨은 반대쪽 끝까지 이동할 수 있다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 });
    const { container } = renderPopup({
      popup: { ...popup, lfsdPstnNvl: 0, upendPstnNvl: 0, wdthLen: 1000, vrtcLen: 700 },
    });
    const popupElement = container.querySelector('.main-popup-item');
    const contentArea = container.querySelector('.main-popup-content-drag-area');
    const image = screen.getByRole('img', { name: '팝업 이미지 설명' });
    setPopupRect(popupElement, { left: 0, top: 0, width: 1000, height: 700 });

    fireEvent.pointerDown(image, {
      pointerId: 5,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(contentArea, { pointerId: 5, clientX: -500, clientY: -500 });

    expect(popupElement.style.transform).toBe('translate3d(-200px, -100px, 0)');
  });

  it('5px 미만의 움직임은 drag로 바꾸지 않고 링크 click을 유지한다', () => {
    const { container } = renderPopup({
      popup: { ...popup, imgLnkgUrlAddr: '#detail', imgLnkgNpagYn: 'N' },
    });
    const popupElement = container.querySelector('.main-popup-item');
    const contentArea = container.querySelector('.main-popup-content-drag-area');
    const link = screen.getByRole('link');
    const image = screen.getByRole('img', { name: '팝업 이미지 설명' });
    setPopupRect(popupElement, { left: 40, top: 120, width: 360, height: 420 });

    fireEvent.pointerDown(image, {
      pointerId: 6,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 150,
    });
    fireEvent.pointerMove(contentArea, { pointerId: 6, clientX: 103, clientY: 153 });
    fireEvent.pointerUp(contentArea, { pointerId: 6 });

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });

    expect(popupElement.style.transform).toBe('translate3d(0px, 0px, 0)');
    expect(link.dispatchEvent(clickEvent)).toBe(true);
    expect(clickEvent.defaultPrevented).toBe(false);
  });

  it('본문 콘텐츠를 drag한 뒤에는 링크 click을 취소한다', () => {
    const { container } = renderPopup();
    const popupElement = container.querySelector('.main-popup-item');
    const contentArea = container.querySelector('.main-popup-content-drag-area');
    const link = screen.getByRole('link');
    const image = screen.getByRole('img', { name: '팝업 이미지 설명' });
    setPopupRect(popupElement, { left: 40, top: 120, width: 360, height: 420 });

    fireEvent.pointerDown(image, {
      pointerId: 7,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 150,
      clientY: 250,
    });
    fireEvent.pointerMove(contentArea, { pointerId: 7, clientX: 250, clientY: 350 });
    fireEvent.pointerUp(contentArea, { pointerId: 7 });

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });

    expect(popupElement.style.transform).toBe('translate3d(100px, 100px, 0)');
    expect(link.dispatchEvent(clickEvent)).toBe(false);
    expect(clickEvent.defaultPrevented).toBe(true);
  });

  it('하단 버튼은 drag를 시작하지 않고 기존 callback을 실행한다', () => {
    const { container, props } = renderPopup();
    const popupElement = container.querySelector('.main-popup-item');
    const contentArea = container.querySelector('.main-popup-content-drag-area');
    const hideTodayButton = screen.getByRole('button', { name: '오늘 하루 보지 않기' });
    const closeButton = screen.getByRole('button', { name: '닫기' });
    setPopupRect(popupElement, { left: 40, top: 120, width: 360, height: 420 });

    fireEvent.pointerDown(hideTodayButton, {
      pointerId: 8,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 500,
    });
    fireEvent.pointerMove(contentArea, { pointerId: 8, clientX: 300, clientY: 300 });

    fireEvent.click(hideTodayButton);
    fireEvent.click(closeButton);

    expect(popupElement.style.transform).toBe('translate3d(0px, 0px, 0)');
    expect(props.onHideToday).toHaveBeenCalledWith(9);
    expect(props.onClose).toHaveBeenCalledWith(9);
  });

  it('활성 팝업만 한 단계 높은 z-index를 사용한다', () => {
    const { container } = renderPopup({ isActive: true });

    expect(container.querySelector('.main-popup-item').style.zIndex).toBe('1001');
  });

  it('컴포넌트를 다시 열면 서버 초기 위치에서 시작한다', () => {
    const first = renderPopup();
    const firstPopup = first.container.querySelector('.main-popup-item');
    const firstContentArea = first.container.querySelector('.main-popup-content-drag-area');
    const firstImage = screen.getByRole('img', { name: '팝업 이미지 설명' });
    setPopupRect(firstPopup, { left: 40, top: 120, width: 360, height: 420 });

    fireEvent.pointerDown(firstImage, {
      pointerId: 9,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 150,
    });
    fireEvent.pointerMove(firstContentArea, { pointerId: 9, clientX: 200, clientY: 250 });
    expect(firstPopup.style.transform).toBe('translate3d(100px, 100px, 0)');
    first.unmount();

    const second = renderPopup();
    expect(second.container.querySelector('.main-popup-item').style.transform)
      .toBe('translate3d(0px, 0px, 0)');
  });
});
