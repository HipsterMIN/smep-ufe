const summaryItems = [
  { icon: 'doc-list', title: '지원사업 신청이력', count: 12 },
  { icon: 'cert-list', title: '증명서 발급이력', count: 8 },
  { icon: 'heart', title: '나의 관심공고', count: 24 },
  { icon: 'chat', title: '나의 질의내역', count: 5 },
  { icon: 'key', title: 'API 인증키', count: 2 },
  { icon: 'alarm', title: '알림 내역', count: 7 },
];

const BusinessSummarySection = () => (
  <section className="my-summary compact">
    <article className="company-card compact">
      <h3>(주)대한OOOO</h3>
      <dl>
        <dt>사업자 등록번호</dt>
        <dd>123-45-67890</dd>
      </dl>
      <dl>
        <dt>대표자</dt>
        <dd>홍길동</dd>
      </dl>
      <dl>
        <dt>업종</dt>
        <dd>시스템구축/유지보수/솔루션...</dd>
      </dl>

      <ul className="btn-group">
        <li><button type="button" className="krds-btn btn-primary"><i className="svg-icon alarm pure"></i> 알림 수신 설정</button></li>
        <li><button type="button" className="krds-btn btn-primary">기업정보 수정</button></li>
      </ul>
    </article>

    <div className="summary-grid compact">
      {summaryItems.map((item) => (
        <button type="button" className="summary-card compact" key={item.title}>
          <span>
            <i className={`summary-icon svg-icon ${item.icon}`} aria-hidden="true"></i>
            <strong>{item.title}</strong>
          </span>
          <em><strong>{item.count}</strong>건</em>
        </button>
      ))}
    </div>
  </section>
);

export default BusinessSummarySection;
