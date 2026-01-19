import React, { useState, createContext,  useContext, useRef } from 'react';

const AccordionContext = createContext();

// 최상위 부모
const Accordion = ({ 
    children, 
    type = 'single' 
}) => {
  const [openState, setOpenState] = useState(type === 'multi' ? [] : null);

 const toggleItem = (index) => {
    if (type === 'multi') {
      setOpenState((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenState((prev) => (prev === index ? null : index));
    }
  };

 return (
    <AccordionContext.Provider value={{ openState, toggleItem, type }}>
      <div className="krds-accordion type-line">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { index });
          }
          return child;
        })}
      </div>
    </AccordionContext.Provider>
  );
};


// 개별 아이템
const AccordionItem = ({ index, children }) => {
  const { openState, type } = useContext(AccordionContext);
  const isOpen = type === 'multi' ? openState.includes(index) : openState === index;

  return (
    <div className={`accordion-item ${isOpen ? 'active' : ''}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { index, isOpen });
        }
        return child;
      })}
    </div>
  );
};

// 헤더
const AccordionHeader = ({ index, isOpen, children }) => {
  const { toggleItem } = useContext(AccordionContext);
  const headerId = `header-${index}`;
  const panelId = `panel-${index}`;

  return (
    <h5 className="accordion-header">
      <button
        type="button"
        id={headerId}
        className={`btn-accordion ${isOpen ? '' : 'collapsed'}`}
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={() => toggleItem(index)}
      >
        {children}
      </button>
    </h5>
  );
};

// 컨텐츠 (Panel)
const AccordionPanel = ({ isOpen, children, index }) => {
  const contentRef = useRef(null);
  const headerId = `header-${index}`;
  const panelId = `panel-${index}`;

  return (
    <div
      id={panelId}
      className="accordion-collapse collapse"
      role="region"
      aria-labelledby={headerId}
      style={{
        maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}
    >
      <div className="accordion-body" ref={contentRef}>
          {children}
      </div>
    </div>
  );
};

Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;

export default Accordion;