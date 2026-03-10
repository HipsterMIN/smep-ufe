import { useEffect, useMemo, useState } from 'react';
import { Link, useMatches, useNavigate, useParams } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

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

const UI_USR_R_101 = () => {
  const matches = useMatches();
  const { id } = useParams();
  const navigate = useNavigate();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [boardDetail, setBoardDetail] = useState(null);
  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo;
  }, [matches]);

  const pstNo = useMemo(() => {
    if (id == null) return '';
    return String(id).trim();
  }, [id]);

  useEffect(() => {
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
        setBoardDetail(response?.data ?? null);
      } catch (error) {
        if (!isMounted) return;
        setBoardDetail(null);
        console.error('게시판 상세 조회 실패:', error);
      }
    };

    fetchBoardDetail();

    return () => {
      isMounted = false;
    };
  }, [bbsNo]);

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

  const boardTitle = useMemo(() => boardDetail?.bbsNm || depth1Menu?.menuNm || '', [boardDetail, depth1Menu]);
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
  const prevPost = useMemo(() => postDetail?.prevPost ?? null, [postDetail]);
  const nextPost = useMemo(() => postDetail?.nextPost ?? null, [postDetail]);

  const moveToList = () => {
    navigate('..');
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
    return `../${targetPstNo}`;
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

        <div className="onboard-conts-area">
          <p dangerouslySetInnerHTML={{ __html: contentHtml }} />
          <br /><br />
        </div>

        {attachFiles.length > 0 && (
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">첨부파일</p>
            <ul className="box-group-area">
              {attachFiles.map((file, index) => {
                const fileLabel =
                  String(file?.orgnlFileNm ?? file?.strgFileNm ?? '').trim() || `첨부파일 ${index + 1}`;
                const downloadUrl = buildAttachmentDownloadUrl(file);

                return (
                  <li key={`${file?.atchFileId ?? 'atch'}-${file?.atchFileSn ?? index}`}>
                    <p className="tit">
                      <i className="svg-icon ico-file2"></i>
                      {fileLabel}
                    </p>
                    <div className="btn-wrap">
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

        <ul className="post-nav-list mt-40">
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

export default UI_USR_R_101;
