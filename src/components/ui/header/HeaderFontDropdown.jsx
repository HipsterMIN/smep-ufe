import { useState, useRef, useEffect } from "react";

const FONT_SIZES = [
  { label: "작게", iconSize: "sm" },
  { label: "보통", iconSize: "md" },
  { label: "조금 크게", iconSize: "lg" },
  { label: "크게", iconSize: "xl" },
  { label: "가장 크게", iconSize: "xxl" },
];

export default function HeaderFontDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const containerRef = useRef(null);

  // 바깥 영역 클릭할때랑 사용자가 scroll할때 닫히게
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setIsOpen(false);
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setSelectedIndex(null);
  };

  return (
    <div ref={containerRef} className="font-setting krds-drop-wrap">
      {/* 트리거 버튼 */}
      <button
        type="button"
        className={`krds-btn small text open-modal font-setting-trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <i className="svg-icon ico-view-mode" />
         글자 설정
        <i className={`svg-icon ico-angle  ${isOpen ? "up" : ""}`} />
      </button>

      {/* 드롭다운 리스트 */}
      {isOpen && (
        <div className="drop-menu">
          <div className="drop-in">
            <ul
              role="listbox"
              aria-label="글자 크기 선택"
              className="drop-list"
            >
              {FONT_SIZES.map((item, index) => {
                const isSelected = selectedIndex === index;

                return (
                  <li
                    key={index}
                    role="option"
                    aria-selected={isSelected}
                    className="font-setting-item"
                  >
                    <button
                      type="button"
                      className={`${isSelected ? "is-selected" : ""} font-setting-button ${item.iconSize}`}
                      onClick={() => handleSelect(index)}
                    >
                      <span className="font-setting-icon">
                      </span>
                      <span className="font-setting-label">
                        <span className="sr-only">글자 설정</span>{item.label}
                      </span>
                    </button>
                  </li>
                );
              })}

              {/* 구분선 */}
              <li className="font-setting-divider" role="separator">
                <hr />
              </li>

              {/* 초기화 버튼 */}
              <li>
                <button
                  type="button"
                  className="font-setting-reset krds-btn large text"
                  onClick={handleReset}
                >
                  <i className="svg-icon ico-reset" />
                  초기화
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
