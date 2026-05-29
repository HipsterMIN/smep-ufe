const DeadlineCalendarSection = () => (
  <section className="deadline-calendar compact">
    <h2>관심공고 마감 캘린더</h2>

    <div className="calendar-table compact">
      <div className="calendar-row calendar-head">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-body">
        <div className="calendar-row">
          <div>17</div>
          <div className="today">
            <strong>18</strong>
            <span className="today-bubble">today</span>
            <em>마감 <strong>02</strong>건</em>
          </div>
          <div>19</div>
          <div>
            20 <em>마감 <strong>02</strong>건</em>
          </div>
          <div>21</div>
          <div>22</div>
          <div>23</div>
        </div>

        <div className="calendar-row">
          <div>10</div>
          <div>11</div>
          <div>12</div>
          <div>
            13 <em>마감 <strong>02</strong>건</em>
          </div>
          <div>14</div>
          <div>15</div>
          <div>
            16 <em>마감 <strong>02</strong>건</em>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DeadlineCalendarSection;
