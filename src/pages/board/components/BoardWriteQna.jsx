import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

const normalizeResponse = (response) => response?.data ?? response ?? null;
const normalizeText = (value) => String(value ?? '').trim();
const BOARD_SUBMIT_TOKEN_HEADER = 'X-Board-Submit-Token';

const BoardWriteQna = ({ boardDetail, bbsNo, mode = 'create' }) => {
  const params = useParams();
  const pstNo = params.id;
  const isEditMode = mode === 'edit' && !!pstNo;


  //  숨겨진 file input ref
  const fileInputRef = useRef(null);
  const atchFileIdRef = useRef('');

  // 첨부파일 버튼 클릭 시 input 이벤트 트리거
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategoryNo, setSelectedCategoryNo] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [saving, setSaving] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const boardTitle = useMemo(() => boardDetail?.bbsNm || 'Q&A', [boardDetail]);
  const isCategoryRequired = useMemo(
    () => String(boardDetail?.ctgryUseYn ?? '').trim().toUpperCase() === 'Y',
    [boardDetail],
  );
  const contentLength = useMemo(() => content.length, [content]);

  useEffect(() => {
    window.scrollTo(0, 0);
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
        const data = normalizeResponse(response);

        if (!isMounted) return;
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isMounted) return;
        setCategories([]);
        console.error('Q&A 등록 카테고리 조회 실패:', error);
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

    const fetchPostDetail = async () => {
      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}/posts/${pstNo}/for-update`);
        const data = normalizeResponse(response);

        if (data) {
          setTitle(data.pstTtl || '');
          setContent(data.pstCn || '');
          setVisibility(data.pstRlsYn === 'N' ? 'PRIVATE' : 'PUBLIC');
          setSelectedCategoryNo(String(data.ctgryNo || ''));
          atchFileIdRef.current = data.atchFileId || '';
          setExistingFiles(data.attachFiles || []); // 기존 파일 목록 저장
        }
      } catch (error) {
        alert('게시글 정보를 불러오지 못했습니다.');
        navigate('..');
      }
    };
    fetchPostDetail();
  }, [isEditMode, bbsNo, pstNo, navigate]);


  useEffect(() => {
    if (!selectedCategoryNo || categories.length === 0) return;

    const exists = categories.some((category) => String(category?.ctgryNo ?? '') === selectedCategoryNo);
    if (!exists) {
      setSelectedCategoryNo('');
    }
  }, [categories, selectedCategoryNo]);

  const validateForm = () => {
    if (!bbsNo) {
      alert('게시판 정보를 확인할 수 없습니다.');
      return false;
    }

    if (normalizeText(title) === '') {
      alert('제목을 입력해주세요.');
      return false;
    }

    if (normalizeText(content) === '') {
      alert('문의내용을 입력해주세요.');
      return false;
    }

    const cleanContent = normalizeText(content);
    if (cleanContent.length > 100) {
      alert('문의내용은 최대 100자까지 입력 가능합니다.');
      return false;
    }

    if (isCategoryRequired && categories.length > 0 && selectedCategoryNo === '') {
      alert('카테고리를 선택해주세요.');
      return false;
    }

    return true;
  };
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    const file = files[0];

    // 1. 확장자 벨리데이션 설정
    const allowedExtensions = [
      'zip',
      'hwp', 'hwpx', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'pdf', 'txt',
      'jpg', 'jpeg', 'png', 'gif',
    ];

    // 파일명에서 확장자 추출 (소문자 변환)
    const fileExtension = file.name.split('.').pop().toLowerCase();

    // 2. 확장자 체크
    if (!allowedExtensions.includes(fileExtension)) {
      alert('허용되지 않은 파일 형식입니다.\n(zip, hwp, xls, doc, ppt, pdf, txt, jpg, png, gif 등만 가능)');
      event.target.value = ''; // input 비우기
      return;
    }

    // 3. 용량 제한 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('첨부파일은 10MB 이하만 가능합니다.');
      event.target.value = '';
      return;
    }

    setFileList([file]);
    setExistingFiles([]); // 새 파일을 올리면 기존 파일 목록은 초기화

    // input 초기화 (같은 파일 다시 선택 가능하도록)
    event.target.value = '';
  };

  const buildRequestBody = (fileId) => {
    const parsedCategoryNo =
      isCategoryRequired && selectedCategoryNo !== '' ? Number(selectedCategoryNo) : null;

    return {
      ctgryNo: Number.isFinite(parsedCategoryNo) ? parsedCategoryNo : null,
      pstTtl: normalizeText(title),
      pstCn: normalizeText(content),
      pstRlsYn: visibility === 'PRIVATE' ? 'N' : 'Y',
      atchFileId: fileId,
    };
  };

  const fetchSubmitToken = async () => {
    const response = await apiClient.post(`/api/v1/board/${bbsNo}/posts/submit-token`);
    const data = normalizeResponse(response);
    const submitToken = normalizeText(data?.submitToken);
    if (submitToken === '') {
      throw new Error('등록 요청을 처리하지 못했습니다.');
    }
    return submitToken;
  };

  const handleCancel = () => {
    navigate('..');
  };

  const removeFile = () => {
    setFileList([]);
  };

  const removeExistingFile = () => {
    setExistingFiles([]);
    atchFileIdRef.current = '';
  };

  const handleSave = async () => {
    if (saving) return;
    if (!validateForm()) return;

    try {
      setSaving(true);

      // 저장 시점에 파일을 먼저 업로드
      let finalAtchFileId = atchFileIdRef.current;

      if (fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach(file => formData.append('file', file));
        formData.append('type', 'general');

        const fileRes = await apiClient.post('/api/v1/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const result = normalizeResponse(fileRes);
        finalAtchFileId = result?.data?.atchFileId || result?.atchFileId;
      }

      // 최종 게시글 저장
      const body = buildRequestBody(finalAtchFileId);

      if (isEditMode) {
        await apiClient.post(`/api/v1/board/${bbsNo}/posts/${pstNo}`, body);
        alert('문의가 수정되었습니다.');
      } else {
        const submitToken = await fetchSubmitToken();
        await apiClient.post(`/api/v1/board/${bbsNo}/posts`, body, {
          headers: { [BOARD_SUBMIT_TOKEN_HEADER]: submitToken },
        });
        alert('문의가 등록되었습니다.');
      }
      navigate('..');
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
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="board_qna_category">
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
                    id="board_qna_category"
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
                <label htmlFor="board_qna_title">
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
                    id="board_qna_title"
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
                <label htmlFor="board_qna_content">
                  문의내용
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
                      id="board_qna_content"
                      placeholder="문의내용을 입력해주세요."
                      required
                      rows={8}
                      value={content}
                      maxLength={100}
                      onChange={(event) => setContent(event.target.value)}
                      disabled={saving}
                    />
                    <p className="textarea-count">
                      <span className="count-now">{contentLength}</span>
                      <span className="count-total">/100</span>
                    </p>
                  </div>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <span className="label-title" id="visibility-label">
                  공개여부
                  <span className="on-required">
                    <span className="sr-only">필수입력</span>
                  </span>
                </span>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <div
                    className="krds-check-area"
                    role="radiogroup"
                    aria-labelledby="visibility-label"
                  >
                    <div className="krds-form-check medium">
                      <input
                        type="radio"
                        name="visibility"
                        id="visibility-public"
                        checked={visibility === 'PUBLIC'}
                        onChange={() => setVisibility('PUBLIC')}
                        disabled={saving}
                      />
                      <label htmlFor="visibility-public">공개</label>
                    </div>

                    <div className="krds-form-check medium">
                      <input
                        type="radio"
                        name="visibility"
                        id="visibility-private"
                        checked={visibility === 'PRIVATE'}
                        onChange={() => setVisibility('PRIVATE')}
                        disabled={saving}
                      />
                      <label htmlFor="visibility-private">비공개</label>
                    </div>
                  </div>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="file-input" className="label">첨부파일</label>
              </dt>
              <dd className="form-row-content">
                <ul className="info-list-point">
                  <li><i className="svg-icon ico-checkbox"></i>첨부파일은 10MB 이하의 파일만 가능합니다.</li>
                  <li><i className="svg-icon ico-checkbox"></i>첨부파일은 zip 압축파일, 문서(한글, 엑셀, MS워드, 파워포인트, PDF, TXT)또는
                    이미지(jpg, png, gif 등)파일만 가능합니다.
                  </li>
                </ul>
                <div className="file-upload mt-16">
                  {/* 실제 파일 입력창은 숨김 처리 */}
                  <input
                    type="file"
                    id="file-input"
                    className="sr-only"
                    ref={fileInputRef}
                    accept=".zip, .hwp, .hwpx, .xls, .xlsx, .doc, .docx, .ppt, .pptx, .pdf, .txt, .jpg, .jpeg, .png, .gif"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="krds-btn secondary medium"
                    onClick={handleButtonClick}
                  >
                    찾아보기
                  </button>
                  <div className="file-list-container mt-16">
                    {existingFiles.map((file, index) => (
                      <div key={`existing-${file.atchFileId}-${index}`} className="file-item d-flex ai-center mb-8">
                        <span className="text-primary">📎{file.orgnlFileNm}</span>
                        <button
                          type="button"
                          className="ml-8"
                          onClick={removeExistingFile}
                        >
                          삭제
                        </button>
                      </div>
                    ))}

                    {/* 2. 새로 선택한 로컬 파일 표시 */}
                    {fileList.map((file, index) => (
                      <div key={`new-${file.name}-${index}`} className="file-item d-flex ai-center mb-8">
                        <span className="text-primary">📎{file.name}</span>
                        <button
                          type="button"
                          className="ml-8"
                          onClick={() => removeFile(index)}
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
            <button type="button" className="krds-btn tertiary  xlarge" onClick={handleCancel} disabled={saving}>
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

export default BoardWriteQna;
