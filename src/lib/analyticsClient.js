import { apiBaseUrl } from './apiClient.js';

const PAGE_VIEW_ENDPOINT = `${apiBaseUrl}/api/v1/analytics/page-view`;

export const postPageView = (payload, { token } = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(PAGE_VIEW_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => undefined);
  } catch {
    return Promise.resolve();
  }
};
