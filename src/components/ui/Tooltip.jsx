import React, { useState, useRef, useEffect } from "react";

const Tooltip = ({
  children,
  tooltipText,
  disabled = false,
  className = "",
  vertical = true,
  box = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [positionClass, setPositionClass] = useState("");
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);
  const uniqueId = useRef(`tooltip-${Math.random().toString(36).substring(2, 9)}`);

  const isMobile = () => window.innerWidth <= 768;

  const calculatePosition = () => {
    if (!buttonRef.current || !tooltipRef.current) return;

    const tooltipGap = 12;
    const { clientHeight: tooltipHeight, clientWidth: tooltipWidth } = tooltipRef.current;
    const { top: itemTop, left: itemLeft, right: itemRight, height: itemHeight, width: itemWidth } = buttonRef.current.getBoundingClientRect();
    const halfWindowWidth = window.innerWidth / 2;
    const halfWindowHeight = window.innerHeight / 2;

    let tooltipTop;
    let tooltipLeft;
    let classes = [];

    const isVertical = isMobile() || box || vertical;
    const mobileSmall = window.innerWidth <= 420;

    if (isVertical) {
      // 상하 위치
      if (itemTop + itemHeight > halfWindowHeight) {
        tooltipTop = itemTop - tooltipHeight - tooltipGap;
        classes.push("top");
      } else {
        tooltipTop = itemTop + itemHeight + tooltipGap;
        classes.push("bottom");
      }

      // 좌우 위치
      if (itemLeft + itemWidth > halfWindowWidth) {
        tooltipLeft = itemRight - tooltipWidth;
        classes.push("right");
        if (window.innerWidth - (itemLeft + itemWidth) > tooltipWidth / 2) {
          tooltipLeft = itemLeft + (itemWidth - tooltipWidth) / 2;
          classes = classes.filter(c => c !== "right");
        }
      } else {
        tooltipLeft = itemLeft + (itemWidth - tooltipWidth) / 2;
        if (tooltipLeft < 0) {
          tooltipLeft = itemLeft;
          classes.push("left");
        }
      }

      if (mobileSmall) {
        tooltipLeft = "50%";
      }
    } else {
      // 가로형
      tooltipTop = itemTop + (itemHeight - tooltipHeight) / 2;
      if (itemLeft + itemWidth > halfWindowWidth) {
        tooltipLeft = itemLeft - tooltipWidth - tooltipGap;
        classes.push("right");
      } else {
        tooltipLeft = itemRight + tooltipGap;
      }
    }

    setPosition({ top: tooltipTop, left: tooltipLeft });
    setPositionClass(classes.join(" "));
  };

  const showTooltip = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
    setPositionClass("");
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        hideTooltip();
      }
    };

    const handleScroll = () => {
      hideTooltip();
    };

    const handleResize = () => {
      hideTooltip();
    };

    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const tooltipClasses = [
    "krds-tooltip-popover",
    isVisible && "active",
    positionClass,
    box && "tooltip-box",
    vertical && "tooltip-vertical"
  ].filter(Boolean).join(" ");

  const buttonClasses = [
    "krds-tooltip",
    box && "tooltip-box",
    vertical && "tooltip-vertical",
    className
  ].filter(Boolean).join(" ");

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className={buttonClasses}
        aria-labelledby={uniqueId.current}
        disabled={disabled}
        onMouseOver={showTooltip}
        onMouseOut={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </button>
      <div
        ref={tooltipRef}
        id={uniqueId.current}
        className={tooltipClasses}
        aria-hidden={!isVisible}
        style={{
          top: typeof position.top === 'number' ? `${position.top}px` : position.top,
          left: typeof position.left === 'number' ? `${position.left}px` : position.left
        }}
      >
        <span className="sr-only">{typeof children === 'string' ? children : ''}</span>
        {tooltipText}
      </div>
    </>
  );
};

export default Tooltip;
