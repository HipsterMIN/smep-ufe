import React from 'react';
import { Link } from 'react-router-dom';

const PublishingList = () => {
  const publishingPages = [
    {
      fileName: 'UI_USR_L_010',
      screenName: '지원사업 공고 목록',
      path: '/publishing/UI_USR_L_010'
    },
    {
      fileName: 'UI_USR_L_011',
      screenName: '지원사업 공고 상세',
      path: '/publishing/UI_USR_L_011'
    },
    {
      fileName: 'UI_USR_R_005',
      screenName: 'AI 스마트 통합 검색',
      path: '/publishing/UI_USR_R_005'
    },
    {
      fileName: 'MainPage',
      screenName: '메인 페이지',
      path: '/publishing/main'
    }
  ];

  return (
    <div style={{ padding: '40px', width: '100%', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px', fontSize: '28px', fontWeight: 'bold' }}>
        퍼블리싱 페이지 목록
      </h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {publishingPages.map((page, index) => (
          <li
            key={index}
            style={{
              marginBottom: '5px',
              padding: '10px 20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            className="publishing-list-item"
          >
            <Link
              to={page.path}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '2px' }}>
                {page.screenName}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {page.fileName}.jsx
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .publishing-list-item:hover {
          background-color: #f5f5f5;
          border-color: #1976d2;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default PublishingList;
