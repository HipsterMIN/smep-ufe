import { useState, useRef, useEffect } from "react";

const FONT_SIZES = [
  { label: "작게", iconSize: "sm", zoom: 0.9 },
  { label: "보통", iconSize: "md", zoom: 1.0 },
  { label: "조금 크게", iconSize: "lg", zoom: 1.1 },
  { label: "크게", iconSize: "xl", zoom: 1.3 },
  { label: "가장 크게", iconSize: "xxl", zoom: 1.5 },
];

export default function HeaderFontDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const containerRef = useRef(null);

  // zoom 적용 함수
  const changeZoom = (value) => {
    document.body.style.zoom = value;
    localStorage.setItem("siteZoom", value);
  };

  // 초기 로딩시 zoom 유지
  useEffect(() => {
    const savedZoom = localStorage.getItem("siteZoom");
    if (savedZoom) {
      document.body.style.zoom = savedZoom;

      const index = FONT_SIZES.findIndex(
        (item) => item.zoom === Number(savedZoom)
      );
      if (index !== -1) setSelectedIndex(index);
    }
  }, []);

  // 바깥 영역 클릭 / 스크롤 닫기
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

  // 선택시 zoom 적용
  const handleSelect = (index) => {
    setSelectedIndex(index);
    changeZoom(FONT_SIZES[index].zoom);
    setIsOpen(false);
  };

  // 초기화
  const handleReset = (e) => {
    e.stopPropagation();
    setSelectedIndex(null);
    document.body.style.zoom = 1;
    localStorage.removeItem("siteZoom");
  };

  return (
    <div ref={containerRef} className="font-setting krds-drop-wrap">
      {/* 트리거 버튼 */}
      <button
        type="button"
        className={`krds-btn small text open-modal font-setting-trigger ${
          isOpen ? "is-open" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <i className="svg-icon ico-view-mode" />
        글자 설정
        <i className={`svg-icon ico-angle ${isOpen ? "up" : ""}`} />
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="drop-menu">
          <div className="drop-in">
            <ul role="listbox" aria-label="글자 크기 선택" className="drop-list">
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
                      className={`${
                        isSelected ? "is-selected" : ""
                      } font-setting-button ${item.iconSize}`}
                      onClick={() => handleSelect(index)}
                    >
                      <span className="font-setting-icon"></span>
                      <span className="font-setting-label">
                        <span className="sr-only">글자 설정</span>
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}

              {/* 구분선 */}
              <li className="font-setting-divider" role="separator">
                <hr />
              </li>

              {/* 초기화 */}
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