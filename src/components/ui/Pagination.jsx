import React, { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

const Pagination = ({
  totalPages = 0,
  currentPage,
  onPageChange,
  syncUrl = false,
  pageParam = "page",
}) => {
  const [searchParams] = useSearchParams();
  const lastRequestedPageRef = useRef(null);

  const normalizedTotalPages = Number.isFinite(totalPages)
    ? Math.max(0, Math.floor(totalPages))
    : 0;

  const queryPage = syncUrl
    ? Number.parseInt(searchParams.get(pageParam) || "", 10)
    : NaN;
  const hasValidQueryPage = Number.isFinite(queryPage) && queryPage > 0;

  const resolvedCurrentPage = Number.isFinite(currentPage)
    ? currentPage
    : hasValidQueryPage
      ? queryPage
      : 1;

  const normalizedCurrentPage = Number.isFinite(resolvedCurrentPage)
    ? Math.floor(resolvedCurrentPage)
    : 1;
  const page = Math.min(
    Math.max(normalizedCurrentPage, 1),
    normalizedTotalPages || 1,
  );

  useEffect(() => {
    // syncUrl=true + controlled currentPage 조합에서 URL의 page 쿼리로
    // 상위 컴포넌트 페이지 상태를 초기/브라우저 내비게이션 시 동기화한다.
    if (
      !syncUrl
      || !Number.isFinite(currentPage)
      || typeof onPageChange !== "function"
      || !hasValidQueryPage
    ) {
      return;
    }

    const targetPage = Math.max(1, Math.floor(queryPage));
    if (targetPage === normalizedCurrentPage) {
      return;
    }

    if (lastRequestedPageRef.current !== null) {
      return;
    }

    onPageChange(targetPage);
  }, [
    syncUrl,
    currentPage,
    onPageChange,
    hasValidQueryPage,
    queryPage,
    normalizedCurrentPage,
  ]);

  useEffect(() => {
    if (!syncUrl || !Number.isFinite(currentPage)) {
      return;
    }

    if (hasValidQueryPage && queryPage === normalizedCurrentPage) {
      lastRequestedPageRef.current = null;
      return;
    }

    if (!hasValidQueryPage && normalizedCurrentPage <= 1) {
      lastRequestedPageRef.current = null;
    }
  }, [syncUrl, currentPage, hasValidQueryPage, queryPage, normalizedCurrentPage]);

  const getPageUrl = (targetPage) => {
    if (!syncUrl) {
      return "#";
    }

    const params = new URLSearchParams(searchParams);
    if (targetPage <= 1) {
      params.delete(pageParam);
    } else {
      params.set(pageParam, String(targetPage));
    }

    const nextQuery = params.toString();
    return nextQuery ? `?${nextQuery}` : "?";
  };

  const handlePageClick = (targetPage, event) => {
    if (!syncUrl) {
      event.preventDefault();
    }

    const pageToMove = Math.min(Math.max(targetPage, 1), normalizedTotalPages);
    if (pageToMove === page) {
      event.preventDefault();
      return;
    }

    lastRequestedPageRef.current = pageToMove;

    if (typeof onPageChange === "function") {
      onPageChange(pageToMove);
    }
  };

  if (normalizedTotalPages <= 1) {
    return null;
  }

  const visiblePages = 10;
  const startPage = Math.floor((page - 1) / visiblePages) * visiblePages + 1;
  const endPage = Math.min(startPage + visiblePages - 1, normalizedTotalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handleBoundaryClick = (targetPage, isDisabled, event) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    handlePageClick(targetPage, event);
  };

  return (
    <div className="krds-pagination">
      <Link
        className={`page-navi prev ${page <= 1 ? "disabled" : ""}`}
        to={getPageUrl(page - 1)}
        onClick={(event) => handleBoundaryClick(page - 1, page <= 1, event)}
      >
        이전
      </Link>
      <div className="page-links">
        {pages.map((pageNumber) => (
          <Link
            key={pageNumber}
            className={`page-link ${pageNumber === page ? "active" : ""}`}
            to={getPageUrl(pageNumber)}
            onClick={(event) => handlePageClick(pageNumber, event)}
          >
            {pageNumber === page && <span className="sr-only">현재페이지 </span>}
            {pageNumber}
          </Link>
        ))}
        {endPage < normalizedTotalPages && (
          <>
            <span className="page-link link-dot"></span>
            <Link
              className="page-link"
              to={getPageUrl(normalizedTotalPages)}
              onClick={(event) =>
                handlePageClick(normalizedTotalPages, event)
              }
            >
              {normalizedTotalPages}
            </Link>
          </>
        )}
      </div>
      <Link
        className={`page-navi next ${page >= normalizedTotalPages ? "disabled" : ""}`}
        to={getPageUrl(page + 1)}
        onClick={(event) =>
          handleBoundaryClick(page + 1, page >= normalizedTotalPages, event)
        }
      >
        다음
      </Link>
    </div>
  );
};

export default Pagination;
