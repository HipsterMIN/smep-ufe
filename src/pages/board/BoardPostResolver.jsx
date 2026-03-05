import { useEffect, useMemo, useState } from 'react';
import { useMatches, useParams } from 'react-router-dom';
import { api as apiClient } from '@lib/apiClient.js';
import BoardPostBasic from './components/BoardPostBasic.jsx';
import BoardPostQna from './components/BoardPostQna.jsx';
import BoardPostThumbnail from './components/BoardPostThumbnail.jsx';

const BOARD_POST_COMPONENT_BY_TYPE = {
  BSC: BoardPostBasic,
  QNA: BoardPostQna,
  FAQ: BoardPostBasic,
  IMG: BoardPostThumbnail,
  VDO: BoardPostThumbnail,
};

const getBoardTypeCd = (boardDetail) => {
  const rawBoardTypeCd = boardDetail?.bbs_type_cd ?? boardDetail?.bbsTypeCd ?? '';
  return String(rawBoardTypeCd).trim().toUpperCase();
};

const BoardPostResolver = () => {
  const matches = useMatches();
  const { id } = useParams();

  const [boardDetail, setBoardDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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

    const loadBoardDetail = async () => {
      if (bbsNo == null || bbsNo === '') {
        if (!isMounted) return;
        setBoardDetail(null);
        setErrorMessage('게시판 번호를 확인할 수 없습니다.');
        setIsLoading(false);
        return;
      }

      if (!pstNo) {
        if (!isMounted) return;
        setBoardDetail(null);
        setErrorMessage('게시물 번호를 확인할 수 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        if (!isMounted) return;
        setIsLoading(true);
        setErrorMessage('');

        const response = await apiClient.get(`/api/v1/board/${bbsNo}`);

        if (!isMounted) return;
        setBoardDetail(response?.data ?? null);
      } catch (error) {
        if (!isMounted) return;
        setBoardDetail(null);
        setErrorMessage(error?.message || '게시판 정보를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBoardDetail();

    return () => {
      isMounted = false;
    };
  }, [bbsNo, pstNo]);

  const boardTypeCd = useMemo(() => getBoardTypeCd(boardDetail), [boardDetail]);
  const ResolvedBoardPostComponent = boardTypeCd ? BOARD_POST_COMPONENT_BY_TYPE[boardTypeCd] : null;

  if (isLoading) return <div>게시물 정보를 불러오는 중입니다.</div>;
  if (errorMessage) return <div>{errorMessage}</div>;

  if (!ResolvedBoardPostComponent) {
    return <div>지원하지 않는 게시판 유형입니다.</div>;
  }

  return <ResolvedBoardPostComponent boardDetail={boardDetail} bbsNo={bbsNo} pstNo={pstNo} />;
};

export default BoardPostResolver;
