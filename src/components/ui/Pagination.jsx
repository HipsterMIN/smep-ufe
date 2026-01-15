import React from "react";
import { useSearchParams, Link } from "react-router-dom";

const Pagination = ({ totalPages = 10, currentPage, onPageChange }) => {
  const [searchParams] = useSearchParams();
  
  // currentPage가 전달되지 않으면 URL 쿼리 파라미터에서 가져옴
  const page = currentPage || parseInt(searchParams.get("page") || "1");

  const visiblePages = 10;
  const startPage = Math.floor((page - 1) / visiblePages) * visiblePages + 1;
  const endPage = Math.min(startPage + visiblePages - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const getPageUrl = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p.toString());
    return `?${params.toString()}`;
  };

  const handlePageClick = (p) => {
    if (onPageChange) {
      onPageChange(p);
    }
  };

  return (
    <div className="krds-pagination">
      <Link 
        className={`page-navi prev ${page <= 1 ? 'disabled' : ''}`} 
        to={page > 1 ? getPageUrl(page - 1) : "#"}
        onClick={(e) => {
          if (page <= 1) e.preventDefault();
          handlePageClick(page - 1);
        }}
      >
        이전
      </Link>
      <div className="page-links">
        {pages.map((p) => (
          <Link
            key={p}
            className={`page-link ${p === page ? "active" : ""}`}
            to={getPageUrl(p)}
            onClick={() => handlePageClick(p)}
          >
            {p === page && <span className="sr-only">현재페이지 </span>}
            {p}
          </Link>
        ))}
        {endPage < totalPages && (
          <>
            <span className="page-link link-dot"></span>
            <Link 
              className="page-link" 
              to={getPageUrl(totalPages)}
              onClick={() => handlePageClick(totalPages)}
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>
      <Link 
        className={`page-navi next ${page >= totalPages ? 'disabled' : ''}`} 
        to={page < totalPages ? getPageUrl(page + 1) : "#"}
        onClick={(e) => {
          if (page >= totalPages) e.preventDefault();
          handlePageClick(page + 1);
        }}
      >
        다음
      </Link>
    </div>
  );
};

export default Pagination;
