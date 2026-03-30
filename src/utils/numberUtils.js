export const formatNumberWithCommas = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '0';
  }

  return numericValue.toLocaleString('ko-KR');
};
