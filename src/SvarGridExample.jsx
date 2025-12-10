import React from 'react';
import { Grid, Willow } from '@svar-ui/react-grid';
import '@svar-ui/react-grid/all.css';

// 예제 데이터
const data = [
  { id: 1, city: '서울', name: '홍길동', email: 'hong@example.com' },
  { id: 2, city: '부산', name: '김철수', email: 'kim@example.com' },
  { id: 3, city: '인천', name: '이영희', email: 'lee@example.com' },
  { id: 4, city: '대구', name: '박민준', email: 'park@example.com' },
  { id: 5, city: '광주', name: '최지우', email: 'choi@example.com' },
];

// 그리드 컬럼 정의
const columns = [
  { id: 'id', width: 80, header: 'ID' },
  { id: 'city', width: 150, header: '도시' },
  { id: 'name', width: 200, header: '이름' },
  { id: 'email', width: 250, header: '이메일' },
];

const SvarGridExample = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>SVAR React DataGrid Example</h1>
      <p>This is an example of <strong>@svar-ui/react-grid</strong> with the Willow theme.</p>
      <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
        <Willow>
          <Grid data={data} columns={columns} />
        </Willow>
      </div>
    </div>
  );
};

export default SvarGridExample;
