import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import calendarIcon from '../../../styles/img/component/icon/ico_datepicker_calendar.svg';

// Custom Input: 아이콘과 입력창을 함께 렌더링하고 클릭 영역을 확보
const CustomInput = forwardRef(({ value, onClick, placeholder, id, ...props }, ref) => (
  <div className="ondatepicker-wrapper" onClick={onClick}>
    <input
      {...props} // DatePicker 속성 전달
      id={id}
      className="ondatepicker-input krds-input medium"
      value={value}
      placeholder={placeholder}
      ref={ref}
    />
    <img src={calendarIcon} alt="" aria-hidden="true" className="ondatepicker-icon" />
  </div>
));

export default function Datepicker({
  id,
  menuName,
  required = false,
  selected,
  onChange,
  className,
  dateFormat = "yyyy.MM.dd",
  showMonthYearPicker = false,
  placeholder = 'YYYY.MM.DD', // 기본값
  ...props
}) {
  return (
    <div className={`ondatepicker ${className ? className : "" }`}>
      {menuName && (
        <label htmlFor={id} className="label">
          {menuName}
          {required && <span className="on-required"><span className="sr-only">필수입력</span></span>}
        </label>
      )}
      <DatePicker
        id={id}
        selected={selected}
        onChange={onChange}
        dateFormat={dateFormat}
        showMonthYearPicker={showMonthYearPicker}
        locale={ko}
        placeholderText={placeholder} 
        customInput={<CustomInput id={id} />} 
        {...props}
      />
    </div>
  );
}