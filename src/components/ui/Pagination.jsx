import React from "react";

const Pagination = () => {
  return (
    <div className="krds-pagination">
      <span className="page-navi prev disabled" href="#">이전</span>
      <div className="page-links">
        <a className="page-link" href="#">1</a>
        <a className="page-link" href="#">2</a>
        <a className="page-link" href="#">3</a>
        <a className="page-link active" href="#"><span className="sr-only">현재페이지 </span>4</a>
        <a className="page-link" href="#">5</a>
        <a className="page-link" href="#">6</a>
        <a className="page-link" href="#">7</a>
        <a className="page-link" href="#">8</a>
        <span className="page-link link-dot"></span>
        <a className="page-link" href="#">99</a>
      </div>
      <a className="page-navi next" href="#">다음</a>
    </div>
  );
};

export default Pagination;
