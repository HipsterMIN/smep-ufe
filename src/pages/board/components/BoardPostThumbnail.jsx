import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import StreamDocsInlineViewer from '@components/ui/StreamDocsInlineViewer.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { buildStreamDocsPreviewUrl } from '@utils/streamDocsUtils.js';
import {
  getBoardPostFileLabel,
  getFirstPreviewableStreamdocsId,
  mergeBoardPostFiles,
} from '@utils/boardPostFileUtils.js';

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

const appBaseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const BoardPostThumbnail = ({ boardDetail, bbsNo, pstNo }) => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const preservedQueryString = useMemo(() => searchParams.toString(), [searchParams]);
  const navigationCategoryNo = useMemo(() => {
    const rawCategoryNo = searchParams.get('ctgryNo');
    if (rawCategoryNo == null) return '';

    const normalizedCategoryNo = String(rawCategoryNo).trim();
    return normalizedCategoryNo || '';
  }, [searchParams]);

  useEffect(() => {
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

        const queryString = navigationCategoryNo
          ? `?ctgryNo=${encodeURIComponent(navigationCategoryNo)}`
          : '';
        const response = await apiClient.get(`/api/v1/board/${bbsNo}/posts/${pstNo}${queryString}`);

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
  }, [bbsNo, pstNo, navigationCategoryNo]);

  const boardTitle = useMemo(() => boardDetail?.bbsNm || '', [boardDetail]);
  const postTitle = useMemo(() => postDetail?.pstTtl || '-', [postDetail]);
  const categoryName = useMemo(() => postDetail?.ctgryNm || '-', [postDetail]);
  const regDate = useMemo(() => formatDate(postDetail?.pstRegDt ?? postDetail?.regDt), [postDetail]);
  const viewCount = useMemo(() => postDetail?.inqCnt ?? '-', [postDetail]);

  const contentHtml = useMemo(() => {
    if (loading) return '게시물 상세 정보를 불러오는 중입니다.';
    if (errorMessage) return errorMessage;
    const rawContent = postDetail?.pstCn;
    if (rawContent && String(rawContent).trim()) return rawContent;
    return '-';
  }, [loading, errorMessage, postDetail]);
  const attachFiles = useMemo(
    () => (Array.isArray(postDetail?.attachFiles) ? postDetail.attachFiles : []),
    [postDetail],
  );
  const mtxtCnOtptFiles = useMemo(
    () => (Array.isArray(postDetail?.mtxtCnOtptFiles) ? postDetail.mtxtCnOtptFiles : []),
    [postDetail],
  );
  const inlinePreviewStreamdocsId = useMemo(
    () => getFirstPreviewableStreamdocsId(mtxtCnOtptFiles),
    [mtxtCnOtptFiles],
  );
  const boardPostFiles = useMemo(
    () => mergeBoardPostFiles(mtxtCnOtptFiles, attachFiles),
    [mtxtCnOtptFiles, attachFiles],
  );
  const prevPost = useMemo(() => postDetail?.prevPost ?? null, [postDetail]);
  const nextPost = useMemo(() => postDetail?.nextPost ?? null, [postDetail]);

  const moveToList = () => {
    navigate(preservedQueryString ? `..?${preservedQueryString}` : '..');
  };

  const buildAttachmentDownloadUrl = (file) => {
    const atchFileId = String(file?.atchFileId ?? '').trim();
    const atchFileSn = file?.atchFileSn;
    if (!atchFileId || atchFileSn == null) {
      return '#';
    }

    return `${appBaseUrl}/api/v1/files/download/${encodeURIComponent(atchFileId)}/${encodeURIComponent(atchFileSn)}`;
  };

  const buildPostLink = (targetPstNo) => {
    if (targetPstNo == null) return '#';
    return preservedQueryString ? `../${targetPstNo}?${preservedQueryString}` : `../${targetPstNo}`;
  };

  const handleNavigationClick = (event, targetPstNo) => {
    if (targetPstNo == null) {
      event.preventDefault();
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
          <p className="on-p1 on-colorblue">{boardTitle}</p>
          <h2 className="h-tit2">{postTitle}</h2>
        </div>
        <ul className="onboard-summary">
          <li>
            <span className="sr-only">카테고리</span>
            {categoryName}
          </li>
          <li>
            <span className="sr-only">작성일</span>
            <span>{regDate}</span>
          </li>
          <li>
            <span>
              <span className="sr-only">조회수</span>
              <i className="svg-icon ico-pw-visible-on"></i>
              {viewCount}
            </span>
          </li>
        </ul>

        {/* 게시글 내용 */}

        <div className="onboard-conts-area">
          <p dangerouslySetInnerHTML={{ __html: contentHtml }} />
          <br /><br />
        </div>

        <StreamDocsInlineViewer streamdocsId={inlinePreviewStreamdocsId} />

        {/* 첨부파일 */}
        {boardPostFiles.length > 0 && (
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">첨부파일</p>
            <ul className="box-group-area">
              {boardPostFiles.map((file, index) => {
                const fileLabel = getBoardPostFileLabel(file, index);
                const downloadUrl = buildAttachmentDownloadUrl(file);
                const streamdocsId = String(file?.strmdcsId ?? '').trim();

                return (
                  <li key={`${file?.atchFileId ?? 'atch'}-${file?.atchFileSn ?? index}`}>
                    <p className="tit">
                      <i className="svg-icon ico-file2"></i>
                      {fileLabel}
                    </p>
                    <div className="btn-wrap">
                      {streamdocsId && (
                        <a
                          className="krds-btn medium link basic"
                          href={buildStreamDocsPreviewUrl(streamdocsId)}
                          title="문서 미리보기 새 창 열림"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <i className="svg-icon ico-sch-plus"></i> 바로가기
                        </a>
                      )}
                      <a className="krds-btn medium text on-colorblue" href={downloadUrl}>
                        <i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 이전글, 다음글 */}
        <ul className="post-nav-list mt-40">
          {/* 이전글 */}
          <li className="post-nav-item prev">
            <Link
              to={buildPostLink(prevPost?.pstNo)}
              className="post-nav-link"
              onClick={(event) => handleNavigationClick(event, prevPost?.pstNo)}
            >
              <i className="svg-icon ico-angle left"></i>
              <span className="post-nav-label">이전글</span>
              <span className="post-nav-title onellipsis-1">{prevPost?.pstTtl || '-'}</span>
            </Link>
          </li>

          {/* 다음글 */}
          <li className="post-nav-item next">
            <Link
              to={buildPostLink(nextPost?.pstNo)}
              className="post-nav-link"
              onClick={(event) => handleNavigationClick(event, nextPost?.pstNo)}
            >
              <span className="post-nav-label">다음글</span>
              <span className="post-nav-title onellipsis-1">{nextPost?.pstTtl || '-'}</span>
              <i className="svg-icon ico-angle right"></i>
            </Link>
          </li>
        </ul>


        {/* 하단 버튼 */}
        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={moveToList}>
              목록
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default BoardPostThumbnail;
