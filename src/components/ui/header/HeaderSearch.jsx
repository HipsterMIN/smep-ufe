import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderSearch = () => {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/req/ai/ai-smart-search');
  };

  return (
    <button type="button" className="btn-navi sch" onClick={handleSearchClick}>
      AI 스마트검색
    </button>
  );
};

export default HeaderSearch;
