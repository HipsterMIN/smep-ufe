import React, { useState } from 'react';

const Tab = ({ type = 'fill', isFull = true, tabData = [], onTabChange, activeIndex: controlledIndex }) => {
  const [internalIndex, setInternalIndex] = useState(controlledIndex ?? 0);

  // controlledIndex가 있으면 외부 값 우선 사용
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const handleTabClick = (index) => {
    setInternalIndex(index);
    if (onTabChange) onTabChange(index);
  };

  return (
    <div className={`tab ${type} ${isFull && 'full'}`}>
      <ul role="tablist">
        {tabData.map((tabName, index) => (
          <li key={index} className={index === activeIndex ? 'active' : ''}>
            <button type="button" className="btn-tab" onClick={() => handleTabClick(index)}>
              {tabName}
              {index === activeIndex && <i className="sr-only">선택됨</i>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tab;