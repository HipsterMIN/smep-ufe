import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useMatches, useNavigate, useParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { appendListSearchToPath } from '@utils/listNavigation.js';

const normalizeText = (value) => String(value ?? '').trim();
const unwrapApiData = (response, fallback = null) => response?.data?.data ?? response?.data ?? fallback;
const BOARD_SUBMIT_TOKEN_HEADER = 'X-Board-Submit-Token';

// 의미/출처: 이벤트 참여 메뉴 M_PIIO_00171은 현재 bbs_no 69 전용이며, 메뉴 API bbsNo 누락 시에만 fallback으로 사용한다.
const EVENT_PARTICIPATION_BBS_NO = 69;
const ALLOWED_FILE_EXTENSIONS = [
  'zip',
  'hwp',
  'hwpx',
  'xls',
  'xlsx',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'pdf',
  'txt',
  'jpg',
  'jpeg',
  'png',
  'gif',
];

const EventParticipationWrite = ({ mode = 'create' }) => {
  const matches = useMatches();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const atchFileIdRef = useRef('');
  const { currentMenu, breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const authToken = useAuthStore((state) => state.token);
  const isLoggedIn = Boolean(authToken);

  const [boardDetail, setBoardDetail] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategoryNo, setSelectedCategoryNo] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const pstNo = useMemo(() => String(id ?? '').trim(), [id]);
  const isEditMode = mode === 'edit' && pstNo !== '';

  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo ?? EVENT_PARTICIPATION_BBS_NO;
  }, [matches]);

  const routeMenuTitle = useMemo(
    () => [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm,
    [matches],
  );

  const boardTitle = useMemo(
    () => routeMenuTitle || currentMenu?.menuNm || boardDetail?.bbsNm || '이벤트 참여',
    [boardDetail, currentMenu, routeMenuTitle],
  );
  const isCategoryRequired = useMemo(
    () => String(boardDetail?.ctgryUseYn ?? boardDetail?.ctgry_use_yn ?? '').trim().toUpperCase() === 'Y',
    [boardDetail],
  );

  useEffect(() => {
    if (isLoggedIn) return;

    alert('로그인이 필요합니다.');
    navigate('..', { replace: true });
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchBoardDetail = async () => {
      if (bbsNo == null || bbsNo === '') {
        if (!isMounted) return;
        setBoardDetail(null);
        return;
      }

      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}`);
        if (!isMounted) return;
        setBoardDetail(unwrapApiData(response));
      } catch (error) {
        if (!isMounted) return;
        setBoardDetail(null);
      }
    };

    fetchBoardDetail();

    return () => {
      isMounted = false;
    };
  }, [bbsNo]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      if (!bbsNo || !isCategoryRequired) {
        if (!isMounted) return;
        setCategories([]);
        setSelectedCategoryNo('');
        return;
      }

      try {
        if (!isMounted) return;
        setLoadingCategories(true);

        const response = await apiClient.get(`/api/v1/board/${bbsNo}/categories`);
        const data = unwrapApiData(response, []);

        if (!isMounted) return;
        setCategories(
          Array.isArray(data)
            ? data.filter((category) => String(category?.useYn ?? 'Y').toUpperCase() === 'Y')
            : [],
        );
      } catch (error) {
        if (!isMounted) return;
        setCategories([]);
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [bbsNo, isCategoryRequired]);

  useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;

    const fetchPostForUpdate = async () => {
      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}/posts/${pstNo}/for-update`);
        const data = unwrapApiData(response);
        if (!isMounted || !data) return;

        setTitle(data.pstTtl || '');
        setContent(data.pstCn || '');
        setSelectedCategoryNo(String(data.ctgryNo || ''));
        atchFileIdRef.current = data.atchFileId || '';
        setExistingFiles(Array.isArray(data.attachFiles) ? data.attachFiles : []);
      } catch (error) {
        alert(error?.message || '게시글 정보를 불러오지 못했습니다.');
        navigate('..', { replace: true });
      }
    };

    fetchPostForUpdate();

    return () => {
      isMounted = false;
    };
  }, [bbsNo, isEditMode, navigate, pstNo]);

  useEffect(() => {
    if (!selectedCategoryNo || categories.length === 0) return;

    const exists = categories.some((category) => String(category?.ctgryNo ?? '') === selectedCategoryNo);
    if (!exists) {
      setSelectedCategoryNo('');
    }
  }, [categories, selectedCategoryNo]);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const file = files[0];
    const fileExtension = String(file.name.split('.').pop() ?? '').toLowerCase();

    if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
      alert('허용되지 않은 파일 형식입니다.\n(zip, hwp, xls, doc, ppt, pdf, txt, jpg, png, gif 등만 가능)');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('첨부파일은 10MB 이하만 가능합니다.');
      event.target.value = '';
      return;
    }

    setFileList([file]);
    setExistingFiles([]);
    atchFileIdRef.current = '';
    event.target.value = '';
  };

  const removeFile = () => {
    setFileList([]);
  };

  const removeExistingFile = () => {
    setExistingFiles([]);
    atchFileIdRef.current = '';
  };

  const validateForm = () => {
    if (!bbsNo) {
      alert('게시판 정보를 확인할 수 없습니다.');
      return false;
    }

    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return false;
    }

    if (normalizeText(title) === '') {
      alert('제목을 입력해주세요.');
      return false;
    }

    if (normalizeText(content) === '') {
      alert('내용을 입력해주세요.');
      return false;
    }

    if (isCategoryRequired && categories.length > 0 && selectedCategoryNo === '') {
      alert('카테고리를 선택해주세요.');
      return false;
    }

    return true;
  };

  const buildRequestBody = (fileId) => {
    const parsedCategoryNo =
      isCategoryRequired && selectedCategoryNo !== '' ? Number(selectedCategoryNo) : null;

    return {
      ctgryNo: Number.isFinite(parsedCategoryNo) ? parsedCategoryNo : null,
      pstTtl: normalizeText(title),
      pstCn: normalizeText(content),
      // 이벤트참여 게시판은 공개 선택 없이 항상 비공개로 등록한다.
      pstRlsYn: 'N',
      atchFileId: fileId,
    };
  };

  const fetchSubmitToken = async () => {
    const response = await apiClient.post(`/api/v1/board/${bbsNo}/posts/submit-token`);
    const data = unwrapApiData(response, {});
    const submitToken = normalizeText(data?.submitToken);
    if (submitToken === '') {
      throw new Error('등록 요청을 처리하지 못했습니다.');
    }
    return submitToken;
  };

  const moveToDetail = () => {
    navigate(appendListSearchToPath('..', location.search));
  };

  const handleCancel = () => {
    moveToDetail();
  };

  const handleSave = async () => {
    if (saving) return;
    if (!validateForm()) return;

    try {
      setSaving(true);

      let finalAtchFileId = atchFileIdRef.current;

      if (fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach((file) => formData.append('file', file));
        formData.append('type', 'general');

        const fileResponse = await apiClient.post('/api/v1/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const fileResult = unwrapApiData(fileResponse, {});
        finalAtchFileId = fileResult?.data?.atchFileId || fileResult?.atchFileId || '';
      }

      if (isEditMode) {
        await apiClient.post(`/api/v1/board/${bbsNo}/posts/${pstNo}`, buildRequestBody(finalAtchFileId));
        alert('수정되었습니다.');
      } else {
        const submitToken = await fetchSubmitToken();
        await apiClient.post(`/api/v1/board/${bbsNo}/posts`, buildRequestBody(finalAtchFileId), {
          headers: { [BOARD_SUBMIT_TOKEN_HEADER]: submitToken },
        });
        alert('등록되었습니다.');
      }
      moveToDetail();
    } catch (error) {
      alert(error?.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">{isEditMode ? `${boardTitle} 수정` : boardTitle}</h2>
        </div>

        <div className="mt-48">
          <dl className="on-form-row large">
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="event_participation_category">
                  카테고리
                  {isCategoryRequired && (
                    <span className="on-required">
                      <span className="sr-only">필수입력</span>
                    </span>
                  )}
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select
                    id="event_participation_category"
                    className="krds-form-select small"
                    value={selectedCategoryNo}
                    onChange={(event) => setSelectedCategoryNo(event.target.value)}
                    disabled={!isCategoryRequired || loadingCategories || saving}
                  >
                    <option value="">선택해주세요</option>
                    {categories.map((category) => (
                      <option key={category?.ctgryNo} value={String(category?.ctgryNo ?? '')}>
                        {category?.ctgryNm || '-'}
                      </option>
                    ))}
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="event_participation_title">
                  제목
                  <span className="on-required">
                    <span className="sr-only">필수입력</span>
                  </span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <input
                    type="text"
                    id="event_participation_title"
                    className="krds-input small"
                    placeholder="제목을 입력해주세요."
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    disabled={saving}
                  />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="event_participation_content">
                  내용
                  <span className="on-required">
                    <span className="sr-only">필수입력</span>
                  </span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <div className="textarea-wrap">
                    <textarea
                      className="krds-input medium"
                      id="event_participation_content"
                      style={{ height: '24rem' }}
                      placeholder="내용을 입력해주세요."
                      required
                      rows={8}
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="event_participation_file_input" className="label">첨부파일</label>
              </dt>
              <dd className="form-row-content">
                <ul className="info-list-point">
                  <li><i className="svg-icon ico-checkbox"></i>첨부파일은 10MB 이하의 파일만 가능합니다.</li>
                  <li><i className="svg-icon ico-checkbox"></i>첨부파일은 zip 압축파일, 문서(한글, 엑셀, MS워드, 파워포인트, PDF, TXT)또는 이미지(jpg, png, gif 등)파일만 가능합니다.</li>
                </ul>
                <div className="file-upload mt-16">
                  <input
                    type="file"
                    id="event_participation_file_input"
                    className="sr-only"
                    ref={fileInputRef}
                    accept=".zip, .hwp, .hwpx, .xls, .xlsx, .doc, .docx, .ppt, .pptx, .pdf, .txt, .jpg, .jpeg, .png, .gif"
                    onChange={handleFileChange}
                    disabled={saving}
                  />
                  <button
                    type="button"
                    className="krds-btn secondary medium"
                    onClick={handleFileButtonClick}
                    disabled={saving}
                  >
                    찾아보기
                  </button>
                  <div className="file-list-container mt-16">
                    {existingFiles.map((file, index) => (
                      <div key={`existing-${file?.atchFileId ?? 'file'}-${file?.atchFileSn ?? index}`} className="file-item d-flex ai-center mb-8">
                        <span className="text-primary">{file?.orgnlFileNm || file?.fileName || '-'}</span>
                        <button
                          type="button"
                          className="ml-8"
                          onClick={removeExistingFile}
                          disabled={saving}
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    {fileList.map((file) => (
                      <div key={file.name} className="file-item d-flex ai-center mb-8">
                        <span className="text-primary">{file.name}</span>
                        <button
                          type="button"
                          className="ml-8"
                          onClick={removeFile}
                          disabled={saving}
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </dd>
            </div>
          </dl>
        </div>

        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={handleCancel} disabled={saving}>
              취소
            </button>
          </div>
          <div>
            <button type="button" className="krds-btn xlarge" onClick={handleSave} disabled={saving}>
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventParticipationWrite;
