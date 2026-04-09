import axios from 'axios';

const appBaseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

// 공통 Axios 인스턴스: 세션 쿠키(JSESSIONID)를 포함하여 요청
const http = axios.create({
  baseURL: appBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default http;
