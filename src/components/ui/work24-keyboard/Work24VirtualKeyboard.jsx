import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import './Work24VirtualKeyboard.css';
import './work24Hangul.js';

const KEYBOARD_LAYOUT = {
  koNormal: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '<-'],
    ['TAB', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', '[', ']', '\\'],
    ['한/영', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ', ';', '\'', 'enter'],
    ['shift', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', ',', '.', '?', 'shift'],
    ['space'],
  ],
  koShift: [
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '<-'],
    ['TAB', 'ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅒ', 'ㅖ', '{', '}', '|'],
    ['한/영', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ', ':', '"', 'enter'],
    ['shift', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '<', '>', '/', 'shift'],
    ['space'],
  ],
  enNormal: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '<-'],
    ['TAB', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['한/영', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'enter'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?', 'shift'],
    ['space'],
  ],
  enShift: [
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '<-'],
    ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
    ['한/영', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', 'enter'],
    ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '/', 'shift'],
    ['space'],
  ],
};

const resolveKeyClassName = (keyText, sizeOption, shiftActive) => {
  if (keyText === 'space') {
    return `HM_Key HM_KSZ_${sizeOption} HM_space HM_FTSZ_FK_${sizeOption}`;
  }

  if (keyText === 'shift') {
    const activeClass = shiftActive ? ' HM_shift-active' : '';
    return `HM_Key HM_KSZ_${sizeOption} HM_FTSZ_FK_${sizeOption}${activeClass}`;
  }

  if (keyText === '한/영' || keyText === 'TAB' || keyText === 'enter') {
    return `HM_Key HM_KSZ_${sizeOption} HM_FTSZ_FK_${sizeOption}`;
  }

  return `HM_Key HM_KSZ_${sizeOption} HM_FTSZ_NK_${sizeOption}`;
};

const disassembleValue = (hangul, value) => {
  if (hangul?.disassemble) return hangul.disassemble(String(value || ''));
  return Array.from(String(value || ''));
};

const assembleValue = (hangul, charList) => {
  if (hangul?.assemble) return hangul.assemble(charList);
  return charList.join('');
};

const Work24VirtualKeyboard = ({
  isOpen,
  sizeOption = 'SMALL',
  triggerRef,
  inputRef,
  value,
  onValueChange,
  onEnter,
  onClose,
}) => {
  const keyboardZoneRef = useRef(null);
  const dragStartRef = useRef(null);
  const wasOpenRef = useRef(false);
  const latestValueRef = useRef(value);

  const hangul = useMemo(
    () => (typeof window !== 'undefined' ? window.Hangul : null),
    [],
  );

  const [nowLang, setNowLang] = useState('koNormal');
  const [shiftActive, setShiftActive] = useState(false);
  const [charList, setCharList] = useState(() => disassembleValue(hangul, value));
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const closeKeyboard = useCallback(({ restoreFocus = true } = {}) => {
    onClose?.();
    if (!restoreFocus) return;

    window.requestAnimationFrame(() => {
      const inputElement = inputRef?.current;
      if (inputElement?.focus) {
        inputElement.focus();
        const cursorIndex = String(latestValueRef.current || '').length;
        inputElement.setSelectionRange?.(cursorIndex, cursorIndex);
        return;
      }

      triggerRef?.current?.focus?.();
    });
  }, [inputRef, onClose, triggerRef]);

  const updatePositionFromTrigger = useCallback(() => {
    const triggerElement = triggerRef?.current;
    if (!triggerElement) return;

    const rect = triggerElement.getBoundingClientRect();
    setPosition({
      top: rect.top + rect.height + 5,
      left: rect.left,
    });
  }, [triggerRef]);

  const commitCharList = useCallback(
    (nextCharList) => {
      const nextValue = assembleValue(hangul, nextCharList);
      setCharList(nextCharList);
      onValueChange?.(nextValue);

      if (inputRef?.current) {
        window.requestAnimationFrame(() => {
          inputRef.current.focus();
          const cursorIndex = nextValue.length;
          inputRef.current.setSelectionRange(cursorIndex, cursorIndex);
        });
      }
    },
    [hangul, inputRef, onValueChange],
  );

  const handleKeyAction = useCallback(
    (keyText) => {
      if (keyText === '한/영') {
        setShiftActive(false);
        setNowLang((prevLang) =>
          prevLang.includes('ko') ? 'enNormal' : 'koNormal',
        );
        return;
      }

      if (keyText === 'shift') {
        setShiftActive((prevShiftActive) => {
          const nextShiftActive = !prevShiftActive;
          setNowLang((prevLang) => {
            if (prevLang.includes('ko')) {
              return nextShiftActive ? 'koShift' : 'koNormal';
            }
            return nextShiftActive ? 'enShift' : 'enNormal';
          });
          return nextShiftActive;
        });
        return;
      }

      if (keyText === 'enter') {
        onEnter?.();
        return;
      }

      const nextCharList = [...charList];
      if (keyText === '<-') {
        nextCharList.pop();
      } else if (keyText === 'space') {
        nextCharList.push(' ');
      } else if (keyText === 'TAB') {
        nextCharList.push('\t');
      } else {
        nextCharList.push(keyText);
      }

      commitCharList(nextCharList);
    },
    [charList, commitCharList, onEnter],
  );

  const handleToolbarMouseDown = useCallback(
    (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('.HM_Kboard_close')) return;
      event.preventDefault();

      dragStartRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        top: position.top,
        left: position.left,
      };
    },
    [position.left, position.top],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleMouseMove = (event) => {
      if (!dragStartRef.current) return;

      const nextTop = Math.max(
        0,
        dragStartRef.current.top + (event.clientY - dragStartRef.current.startY),
      );
      const nextLeft = Math.max(
        0,
        dragStartRef.current.left + (event.clientX - dragStartRef.current.startX),
      );

      setPosition({ top: nextTop, left: nextLeft });
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return undefined;
    }

    if (!wasOpenRef.current) {
      setNowLang('koNormal');
      setShiftActive(false);
      setCharList(disassembleValue(hangul, latestValueRef.current));
      wasOpenRef.current = true;
    }

    updatePositionFromTrigger();

    const handleResize = () => updatePositionFromTrigger();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [hangul, isOpen, updatePositionFromTrigger]);

  useEffect(() => {
    if (!isOpen) return;

    setCharList((prevCharList) => {
      const normalizedValue = String(value || '');
      if (assembleValue(hangul, prevCharList) === normalizedValue) {
        return prevCharList;
      }
      return disassembleValue(hangul, normalizedValue);
    });
  }, [hangul, isOpen, value]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideMouseDown = (event) => {
      const target = event.target;

      if (keyboardZoneRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains?.(target)) return;
      if (inputRef?.current?.contains?.(target)) return;

      closeKeyboard({ restoreFocus: false });
    };

    const handleEscClose = (event) => {
      if (event.key === 'Escape') closeKeyboard();
    };

    document.addEventListener('mousedown', handleOutsideMouseDown);
    document.addEventListener('keydown', handleEscClose);

    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown);
      document.removeEventListener('keydown', handleEscClose);
    };
  }, [closeKeyboard, inputRef, isOpen, triggerRef]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id="HM_keyboardzone"
      ref={keyboardZoneRef}
      className={`HM_KBSZ_${sizeOption}`}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="HM_Keyboard-container">
        <div className="HM_Ktoolbar" onMouseDown={handleToolbarMouseDown}>
          <button
            type="button"
            className="HM_Kboard_close"
            onClick={closeKeyboard}
            aria-label="가상키보드 닫기"
          >
            &#10006;
          </button>
        </div>

        {KEYBOARD_LAYOUT[nowLang].map((row, rowIndex) => (
          <div className="HM_Key-line" key={`row-${rowIndex}`}>
            {row.map((keyText, keyIndex) => (
              <button
                type="button"
                key={`key-${rowIndex}-${keyIndex}-${keyText}`}
                className={resolveKeyClassName(keyText, sizeOption, shiftActive)}
                onClick={() => handleKeyAction(keyText)}
                onTouchStart={(event) => {
                  event.preventDefault();
                  handleKeyAction(keyText);
                }}
              >
                {keyText}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
};

export default Work24VirtualKeyboard;
