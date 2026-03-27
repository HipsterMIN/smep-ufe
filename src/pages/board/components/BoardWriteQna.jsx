import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

const normalizeResponse = (response) => response?.data ?? response ?? null;
const normalizeText = (value) => String(value ?? '').trim();

const BoardWriteQna = ({ boardDetail, bbsNo }) => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategoryNo, setSelectedCategoryNo] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [saving, setSaving] = useState(false);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const boardTitle = useMemo(() => boardDetail?.bbsNm || 'Q&A', [boardDetail]);
  const isCategoryRequired = useMemo(
    () => String(boardDetail?.ctgryUseYn ?? '').trim().toUpperCase() === 'Y',
    [boardDetail],
  );
  const contentLength = useMemo(() => content.length, [content]);

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
    if (!selectedCategoryNo) return;

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

    if (isCategoryRequired && categories.length > 0 && selectedCategoryNo === '') {
      alert('카테고리를 선택해주세요.');
      return false;
    }

    return true;
  };

  const buildRequestBody = () => {
    const parsedCategoryNo =
      isCategoryRequired && selectedCategoryNo !== '' ? Number(selectedCategoryNo) : null;

    return {
      ctgryNo: Number.isFinite(parsedCategoryNo) ? parsedCategoryNo : null,
      pstTtl: normalizeText(title),
      pstCn: normalizeText(content),
      pstRlsYn: visibility === 'PRIVATE' ? 'N' : 'Y',
    };
  };

  const handleCancel = () => {
    navigate('..');
  };

  const handleSave = async () => {
    if (saving) return;
    if (!validateForm()) return;

    try {
      setSaving(true);
      await apiClient.post(`/api/v1/board/${bbsNo}/posts`, buildRequestBody());
      alert('문의가 등록되었습니다.');
      navigate('..');
    } catch (error) {
      alert(error?.message || '문의 등록 중 오류가 발생했습니다.');
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
          <h2 className="h-tit">{boardTitle}</h2>
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
                      className="krds-input"
                      id="board_qna_content"
                      placeholder="문의내용을 입력해주세요."
                      required
                      rows={8}
                      value={content}
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
