import { FORBIDDEN_CONSUMER_FIELDS } from './contract';

export const findForbiddenConsumerFields = (value) => {
  const found = new Set();

  const visit = (current) => {
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }

    if (!current || typeof current !== 'object') {
      return;
    }

    Object.entries(current).forEach(([key, entryValue]) => {
      if (FORBIDDEN_CONSUMER_FIELDS.includes(key)) {
        found.add(key);
      }
      visit(entryValue);
    });
  };

  visit(value);
  return [...found];
};

/**
 * Provider contract result가 Consumer 정책 필드를 포함하지 않는지 검증한다.
 *
 * @param {unknown} value Provider request/result 후보
 * @returns {string[]} 발견된 금지 필드
 */
export const assertNoForbiddenConsumerFields = (value) => {
  const fields = findForbiddenConsumerFields(value);
  if (fields.length > 0) {
    throw new Error(`Provider result must not include Consumer fields: ${fields.join(', ')}`);
  }
  return fields;
};
