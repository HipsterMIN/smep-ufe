const AiChatAccordionButton = ({ btnName, isOpen, onSelect }) => {
  return (
    <>
      <div className={`accordionBox ${isOpen && 'open'}`}>
        <button className={`accordionButton ${isOpen && 'active'}`}>
          <h4 style={{ color : isOpen === false && onSelect === true ? '#0B50D0' : '' }}>
            { btnName }
          </h4>
          {
            isOpen === true && onSelect === true ?
            <span className="total">2</span> :
            isOpen === false && onSelect === true ?
            <span className="total close">2</span> :
            null
          }
          <i className={`svg-icon ico-angle ${isOpen ? 'up' : 'down'}`} />
        </button>
        {
          isOpen && (
            <>
            <div className="accordionList">
              <div className="krds-check-area">
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_1" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_1">전체</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_2" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_2">서울</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_3" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_3">부산</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_4" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_4">대구</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_5" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_5">인천</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_6" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_6">광주</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_7" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_7">대전</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_8" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_8">울산</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_9" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_9">세종</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_10" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_10">경기</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_11" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_11">강원</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_12" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_12">충북</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_13" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_13">충남</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_14" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_14">전북</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_15" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_15">전남</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_16" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_16">경북</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_17" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_17">경남</label>
                </div>
                <div className="krds-form-chip small">
                  <input type="checkbox" className="checkbox" id="chk1_18" name="chk1"/>
                  <label className="krds-form-chip-outline" for="chk1_18">제주</label>
                </div>
              </div>
            </div>
          </>
          )
        }
      </div>
    </>
  );
};

export default AiChatAccordionButton;
