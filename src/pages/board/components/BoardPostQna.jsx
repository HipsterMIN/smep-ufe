import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient, apiBaseUrl } from '@lib/apiClient.js';
import { resolveListBackPath } from '@utils/listNavigation.js';
import { useAuthStore } from "@store/useAuthStore.jsx";

const EMPTY_HTML_PATTERNS = new Set([
  '<p style="text-align: left;"></p>',
  '<p><br></p>',
  '<p>&nbsp;</p>',
]);

const isMeaningfulHtml = (html) => {
  if (!html || typeof html !== 'string') return false;

  const normalized = html.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!normalized || EMPTY_HTML_PATTERNS.has(normalized)) return false;

  const textOnly = normalized.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
  return textOnly.length > 0;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

const BoardPostQna = ({ boardDetail, bbsNo, pstNo }) => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuthStore((state) => ({
    token: state.token,
    user: state.user,
  }));

  const isLoggedIn = Boolean(token);

  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const isMyPost = useMemo(() => {
    if (!isLoggedIn || !postDetail) return false;

    return (
      String(postDetail.pstRegMbrNo) === String(user.id)
    );
  }, [isLoggedIn, postDetail, user]);

  const moveToEdit = () => {
    navigate('edit', { state: { from: location.pathname } });
  };

  // [추가] 삭제 처리
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      setLoading(true);
      await apiClient.post(`/api/v1/board/${bbsNo}/posts/${pstNo}`);
      alert('삭제되었습니다.');
      moveToList(); // 삭제 후 목록으로 이동
    } catch (error) {
      alert(error?.message || '삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchPostDetail = async () => {
      if (!bbsNo || !pstNo) {
        if (!isMounted) return;
        setPostDetail(null);
        setErrorMessage('게시물 정보를 확인할 수 없습니다.');
        return;
      }

      try {
        if (!isMounted) return;
        setLoading(true);
        setErrorMessage('');

        const response = await apiClient.get(`/api/v1/board/${bbsNo}/posts/${pstNo}`);

        if (!isMounted) return;
        setPostDetail(response?.data ?? null);
      } catch (error) {
        if (!isMounted) return;
        setPostDetail(null);
        setErrorMessage(error?.message || '게시물 상세 정보를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPostDetail();

    return () => {
      isMounted = false;
    };
  }, [bbsNo, pstNo]);

  const downloadFile = (atchFileId, atchFileSn) => {
    if (!atchFileId || atchFileSn == null) return;
    window.location.href = `${apiBaseUrl}/api/v1/files/download/${atchFileId}/${atchFileSn}`;
  };

  const isPrivatePostHidden = useMemo(() => Boolean(postDetail?.privatePostHidden), [postDetail]);

  const attachedFiles = useMemo(() => {
    if (isPrivatePostHidden) return [];
    return postDetail?.attachFiles || [];
  }, [isPrivatePostHidden, postDetail]);
  const boardTitle = useMemo(() => boardDetail?.bbsNm || '', [boardDetail]);
  const postTitle = useMemo(() => postDetail?.pstTtl || '-', [postDetail]);
  const categoryName = useMemo(() => postDetail?.ctgryNm || '-', [postDetail]);
  const visibilityLabel = useMemo(() => {
    const normalizedVisibility = String(postDetail?.pstRlsYn ?? '').trim().toUpperCase();
    return normalizedVisibility === 'N' ? '비공개' : '공개';
  }, [postDetail]);
  const regDate = useMemo(() => formatDate(postDetail?.pstRegDt ?? postDetail?.regDt), [postDetail]);
  const writerName = useMemo(() => postDetail?.pstRgtrNm || '-', [postDetail]);
  const answerHtml = useMemo(() => {
    if (isPrivatePostHidden) return '';
    const rawAnswer = String(postDetail?.pstAnsCn ?? '').trim();
    if (!isMeaningfulHtml(rawAnswer)) return '';
    return rawAnswer;
  }, [isPrivatePostHidden, postDetail]);
  const hasAnswer = useMemo(() => answerHtml.length > 0, [answerHtml]);
  const answerManagerName = useMemo(() => {
    const rawManagerName = postDetail?.pstMdfrNm ?? postDetail?.pstRgtrNm;
    const normalizedManagerName = String(rawManagerName ?? '').trim();
    return normalizedManagerName || '-';
  }, [postDetail]);

  const contentHtml = useMemo(() => {
    if (loading) return '게시물 상세 정보를 불러오는 중입니다.';
    if (errorMessage) return errorMessage;
    if (isPrivatePostHidden) return '비공개 게시글입니다';
    const rawContent = postDetail?.pstCn;
    if (rawContent && String(rawContent).trim()) return rawContent;
    return '-';
  }, [loading, errorMessage, isPrivatePostHidden, postDetail]);

  const moveToList = () => {
    navigate(resolveListBackPath(location));
  };
  console.log(attachedFiles);

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">{boardTitle}</p>
          <h2 className="h-tit2">{postTitle}</h2>
        </div>
        <ul className="onboard-summary">
          <li>
            <span className="sr-only">카테고리</span>
            {categoryName}
          </li>
          <li>
            <span className="sr-only">공개여부</span>
            <span>{visibilityLabel}</span>
          </li>
          <li>
            <span className="sr-only">작성일</span>
            <span>{regDate}</span>
          </li>
          <li>
            <span>{`작성자 ${writerName}`}</span>
          </li>
        </ul>

        {/* 게시글 내용 */}
        <br/><br/>
        <p dangerouslySetInnerHTML={{ __html: contentHtml }}/>
        <br/><br/>
        {attachedFiles.length > 0 && (
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">첨부파일</p>
            <ul className="box-group-area">
              {attachedFiles.map((file, index) => (
                <li key={`${file?.atchFileId ?? 'atch'}-${file?.atchFileSn ?? index}`}>
                  <p className="tit">
                    <i className="svg-icon ico-file2"></i>
                    {file?.orgnlFileNm || '-'}
                  </p>
                  <div className="btn-wrap">
                    <button type="button" className="krds-btn medium text on-colorblue" onClick={() => downloadFile(file?.atchFileId, file?.atchFileSn)}>
                      <i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* 하단 버튼 */}
        <div className="onboard-btm-btngroup">
          {hasAnswer && (
            <div className="onanswerbox">
              <dl>
                <dt>담당자</dt>
                <dd className="usrNm">{answerManagerName}</dd>
              </dl>
              <p className="answer-txt" dangerouslySetInnerHTML={{ __html: answerHtml }}/>
            </div>
          )}
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={moveToList}>
              목록
            </button>
          </div>
          {isMyPost && (
            <div className="btn-group">
              <button type="button" className="krds-btn secondary xlarge" onClick={moveToEdit}>
                수정
              </button>
              <button type="button" className="krds-btn small width-auto xlarge" onClick={handleDelete}>
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BoardPostQna;
