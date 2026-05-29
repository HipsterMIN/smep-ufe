const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_PER_WEEK = 7;
const CALENDAR_DAY_COUNT = DAYS_PER_WEEK * 2;

const padDatePart = (value) => String(value).padStart(2, '0');

const createLocalDate = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    ? date
    : null;
};

const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const toDateKey = (date) => (
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
);

const getWeekStartDate = (date) => addDays(normalizeDate(date), -date.getDay());

const parseDateParts = (year, month, day) => {
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);

  if (!Number.isInteger(numericYear) || !Number.isInteger(numericMonth) || !Number.isInteger(numericDay)) {
    return null;
  }

  return createLocalDate(numericYear, numericMonth, numericDay);
};

const parseDeadlineDate = (value) => {
  const text = String(value ?? '').trim();

  if (!text) {
    return null;
  }

  // 정책금융 마감값은 YYYYMMDDHHmmss, 날짜+문구 혼합처럼 포맷이 섞여 있어 첫 날짜 토큰만 사용한다.
  const compactDateMatch = text.match(/(\d{4})(\d{2})(\d{2})/);
  if (compactDateMatch) {
    return parseDateParts(compactDateMatch[1], compactDateMatch[2], compactDateMatch[3]);
  }

  // new Date('YYYY-MM-DD')는 UTC 파싱으로 하루 밀릴 수 있어 구분자 포맷도 직접 분해한다.
  const delimitedDateMatch = text.match(/(\d{4})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{1,2})/);
  if (delimitedDateMatch) {
    return parseDateParts(delimitedDateMatch[1], delimitedDateMatch[2], delimitedDateMatch[3]);
  }

  return null;
};

const getDeadlineValue = (item) => item?.deadlineYmd ?? item?.deadline_ymd ?? item?.deadlineymd;

const countDeadlinesByDate = (items) => (
  (Array.isArray(items) ? items : []).reduce((counts, item) => {
    const deadlineDate = parseDeadlineDate(getDeadlineValue(item));

    if (!deadlineDate) {
      return counts;
    }

    const dateKey = toDateKey(deadlineDate);
    counts[dateKey] = (counts[dateKey] || 0) + 1;
    return counts;
  }, {})
);

const buildDeadlineCalendarDays = (items) => {
  const today = normalizeDate(new Date());
  const todayKey = toDateKey(today);
  const weekStartDate = getWeekStartDate(today);
  const deadlineCounts = countDeadlinesByDate(items);

  // 현재 주 일요일부터 다음 주 토요일까지 14칸을 고정해 기존 7열 2행 레이아웃을 유지한다.
  return Array.from({ length: CALENDAR_DAY_COUNT }, (_, index) => {
    const date = addDays(weekStartDate, index);
    const key = toDateKey(date);

    return {
      key,
      dayOfMonth: date.getDate(),
      deadlineCount: deadlineCounts[key] || 0,
      isToday: key === todayKey,
    };
  });
};

const chunkByWeek = (days) => [
  days.slice(0, DAYS_PER_WEEK),
  days.slice(DAYS_PER_WEEK, CALENDAR_DAY_COUNT),
];

const formatDeadlineCount = (count) => String(count).padStart(2, '0');

const DeadlineCalendarSection = ({ dashboardData = {} }) => {
  const calendarRows = chunkByWeek(buildDeadlineCalendarDays(dashboardData.scraps?.items));

  return (
    <section className="deadline-calendar compact">
      <h2>관심공고 마감 캘린더</h2>

      <div className="calendar-table compact">
        <div className="calendar-row calendar-head">
          {WEEK_DAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="calendar-body">
          {calendarRows.map((weekDays) => (
            <div className="calendar-row" key={weekDays[0]?.key}>
              {weekDays.map((day) => (
                <div className={day.isToday ? 'today' : undefined} key={day.key}>
                  {day.isToday ? (
                    <>
                      <strong>{day.dayOfMonth}</strong>
                      <span className="today-bubble">today</span>
                    </>
                  ) : (
                    day.dayOfMonth
                  )}
                  {day.deadlineCount > 0 && (
                    <em>마감 <strong>{formatDeadlineCount(day.deadlineCount)}</strong>건</em>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeadlineCalendarSection;
