import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DeadlineCalendarSection from './DeadlineCalendarSection.jsx';

describe('DeadlineCalendarSection', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('현재 주와 다음 주 14칸에 관심공고 마감 건수를 날짜별로 묶는다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 29, 12));

    const { container } = render(
      <DeadlineCalendarSection
        dashboardData={{
          scraps: {
            items: [
              { deadlineYmd: '20260529' },
              { deadlineYmd: '20260601000000' },
              { deadlineYmd: '2026-06-01 00:00:00' },
              { deadlineYmd: '2025. 12. 26. 또는 한도소진 시까지' },
              { deadlineYmd: '한도소진시' },
            ],
          },
        }}
      />,
    );

    const calendarCells = Array.from(container.querySelectorAll('.calendar-body .calendar-row > div'));
    const deadlineLabels = Array.from(container.querySelectorAll('.calendar-body em'))
      .map((element) => element.textContent.replace(/\s+/g, ''));

    expect(calendarCells).toHaveLength(14);
    expect(calendarCells[0].textContent).toContain('24');
    expect(calendarCells[13].textContent).toContain('6');
    expect(container.querySelector('.calendar-body .today')?.textContent).toContain('29');
    expect(container.querySelector('.calendar-body .today')?.textContent).toContain('today');
    expect(deadlineLabels).toHaveLength(2);
    expect(deadlineLabels).toContain('마감01건');
    expect(deadlineLabels).toContain('마감02건');
  });
});
