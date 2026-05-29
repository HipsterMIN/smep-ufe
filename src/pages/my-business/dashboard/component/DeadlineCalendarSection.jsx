import { useMemo } from 'react';

// 퍼블 원형이 두 주차만 노출하므로, 실제 마감 건수만 이 날짜 셀에 덮어쓴다.
const calendarRows = [
  [17, 18, 19, 20, 21, 22, 23],
  [10, 11, 12, 13, 14, 15, 16],
];

// 관심공고 응답에 마감일 필드가 없을 때 화면 빈칸화를 막는 퍼블 기준 fallback 값이다.
const fallbackDeadlineCounts = {
  18: 2,
  20: 2,
  13: 2,
  16: 2,
};

// 관심공고 계열 API의 마감일 필드명이 아직 통일되지 않아 후보 키를 순서대로 검사한다.
const deadlineDateKeys = [
  'pbancRcptEndYmd',
  'bizPbancRcptEndYmd',
  'rcptEndYmd',
  'sprtEndYmd',
  'endYmd',
  'deadlineYmd',
];

// yyyyMMdd, yyyy-MM-dd, datetime처럼 섞인 날짜 문자열에서 일자만 추출한다.
const getDateDay = (value) => {
  if (!value) {
    return null;
  }

  const digits = String(value).replace(/[^0-9]/g, '');
  if (digits.length < 8) {
    return null;
  }

  return Number(digits.slice(6, 8));
};

// 한 관심공고 item 안에서 첫 번째로 발견되는 마감일 후보를 캘린더 기준일로 사용한다.
const getDeadlineDay = (item) => {
  for (const key of deadlineDateKeys) {
    const day = getDateDay(item?.[key]);

    if (Number.isFinite(day)) {
      return day;
    }
  }

  return null;
};

// 관심공고 목록 전체를 날짜별 마감 건수 map으로 바꾼다.
const countDeadlineDays = (items = []) => {
  const counts = {};

  items.forEach((item) => {
    const day = getDeadlineDay(item);

    if (Number.isFinite(day)) {
      counts[day] = (counts[day] || 0) + 1;
    }
  });

  return counts;
};

// 실제 건수가 있으면 실제값을 쓰고, 없으면 퍼블 원형 fallback을 유지한다.
const getDeadlineCount = (counts, day) => counts[day] ?? fallbackDeadlineCounts[day] ?? 0;

const DeadlineCalendarSection = ({ dashboardData } = {}) => {
  // 현재 scrap API는 마감일을 항상 주지 않으므로, 필드가 있을 때만 퍼블 자리의 건수를 실제값으로 대체한다.
  const deadlineCounts = useMemo(
    () => countDeadlineDays(dashboardData?.scraps?.items || []),
    [dashboardData],
  );

  return (
    <section className="deadline-calendar compact">
      <h2>관심공고 마감 캘린더</h2>

      <div className="calendar-table compact">
        <div className="calendar-row calendar-head">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="calendar-body">
          {calendarRows.map((row) => (
            <div className="calendar-row" key={row.join('-')}>
              {row.map((day) => {
                const deadlineCount = getDeadlineCount(deadlineCounts, day);
                const isToday = day === 18;

                return (
                  <div className={isToday ? 'today' : ''} key={day}>
                    {isToday ? <strong>{day}</strong> : day}
                    {isToday && <span className="today-bubble">today</span>}
                    {deadlineCount > 0 && <em>마감 <strong>{String(deadlineCount).padStart(2, '0')}</strong>건</em>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeadlineCalendarSection;
