const normalizeText = (value) => String(value ?? '').trim();

const buildFileKey = (file) => {
  const atchFileId = normalizeText(file?.atchFileId);
  const atchFileSn = file?.atchFileSn;
  if (!atchFileId || atchFileSn == null) return '';
  return `${atchFileId}:${String(atchFileSn)}`;
};

// 의도: 본문 출력 파일과 일반 첨부파일이 같은 상세 화면의 첨부파일 문단에 함께 보여야 하므로 병합 규칙을 한곳에 둔다.
// 동작: mtxtCnOtptFiles를 먼저 배치하고 attachFiles를 뒤에 붙인 뒤, atchFileId + atchFileSn 기준으로 중복을 제거한다.
// 주의: 파일 ID나 순번이 없는 항목은 다운로드/미리보기 URL을 만들 수 없으므로 화면 노출 대상에서 제외한다.
export const mergeBoardPostFiles = (mtxtCnOtptFiles = [], attachFiles = []) => {
  const mergedFiles = [];
  const seenKeys = new Set();

  [...mtxtCnOtptFiles, ...attachFiles].forEach((file) => {
    const key = buildFileKey(file);
    if (!key || seenKeys.has(key)) return;

    seenKeys.add(key);
    mergedFiles.push(file);
  });

  return mergedFiles;
};

// 의도: 인라인 뷰어는 본문 출력 파일 중 실제 StreamDocs 변환이 끝난 첫 문서만 자동 표시해야 한다.
// 동작: 파일 목록을 순서대로 확인해 공백이 아닌 strmdcsId를 반환하고, 없으면 빈 문자열을 반환한다.
// 주의: strmdcsId가 없는 파일도 다운로드는 가능할 수 있으므로 여기서는 미리보기 가능 여부만 판단한다.
export const getFirstPreviewableStreamdocsId = (files = []) =>
  files
    .map((file) => normalizeText(file?.strmdcsId))
    .find(Boolean) || '';

export const getBoardPostFileLabel = (file, fallbackIndex) =>
  normalizeText(file?.orgnlFileNm ?? file?.strgFileNm) || `첨부파일 ${fallbackIndex + 1}`;
