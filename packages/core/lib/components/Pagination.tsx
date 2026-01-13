import React from 'react';

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  visiblePages?: number;
  allowDirectInput?: boolean;
  twoLines?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalPages = 10,
  currentPage = 1,
  onPageChange = () => {},
  visiblePages = 10,
  allowDirectInput = false,
  twoLines = false,
}) => {
  const startPage = Math.floor((currentPage - 1) / visiblePages) * visiblePages + 1;
  const endPage = Math.min(startPage + visiblePages - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={`krds-pagination ${twoLines ? 'two-lines' : ''}`}>
      <button
        type="button"
        className={`page-navi prev ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        이전
      </button>
      <div className="page-links">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`page-link ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page === currentPage && <span className="sr-only">현재페이지 </span>}
            {page}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            <span className="page-link link-dot"></span>
            <button
              type="button"
              className="page-link"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        className={`page-navi next ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        다음
      </button>
      {allowDirectInput && (
        <div className="page-input">
          <input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseInt((e.target as HTMLInputElement).value);
                handlePageChange(val);
              }
            }}
          />
          <span>/ {totalPages}</span>
        </div>
      )}
    </div>
  );
};
