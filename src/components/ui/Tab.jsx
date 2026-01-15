import React, { useState } from "react";

const Tab = ( { type = "fill", isFull = true, tabData = [], onTabChange } ) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabClick = (index) => {
    setActiveIndex(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

  return (
    <div className={`tab ${type} ${isFull && 'full'}`}>
      <ul role="tablist">
        {tabData.map((tabName, index) => (
          <li key={index} className={index === activeIndex ? "active" : ""}>
            <button type="button" className="btn-tab" onClick={() => handleTabClick(index)}>
              {tabName}
              {index === activeIndex && <i className="sr-only">선택됨</i>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
};

export default Tab;
