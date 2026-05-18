import { useEffect, useMemo, useState } from 'react';
import {useMatches, useParams} from 'react-router-dom';
import { api as apiClient } from '@lib/apiClient.js';
import BoardWriteQna from './components/BoardWriteQna.jsx';
import BoardResolverStateView from './components/BoardResolverStateView.jsx';

const BOARD_WRITE_COMPONENT_BY_TYPE = {
  QNA: BoardWriteQna,
};

const getBoardTypeCd = (boardDetail) => {
  const rawBoardTypeCd = boardDetail?.bbs_type_cd ?? boardDetail?.bbsTypeCd ?? '';
  return String(rawBoardTypeCd).trim().toUpperCase();
};

const BoardWriteResolver = ({ mode: propsMode }) => {
  const matches = useMatches();
  const params = useParams();
  const paramPstNo = params.pstNo || params.id;


  const [boardDetail, setBoardDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo;
  }, [matches]);

  const isEditMode = propsMode === 'edit' || !!paramPstNo;
  const currentMode = isEditMode ? 'edit' : 'create';

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
  }, [bbsNo]);

  const boardTypeCd = useMemo(() => getBoardTypeCd(boardDetail), [boardDetail]);
  const ResolvedBoardWriteComponent = boardTypeCd ? BOARD_WRITE_COMPONENT_BY_TYPE[boardTypeCd] : null;

  if (isLoading) {
    return (
      <BoardResolverStateView
        title="게시판"
        message="등록 화면을 불러오는 중입니다."
      />
    );
  }

  if (errorMessage) {
    return (
      <BoardResolverStateView
        title="게시판"
        message={errorMessage}
      />
    );
  }

  if (!ResolvedBoardWriteComponent) {
    return (
      <BoardResolverStateView
        title={boardDetail?.bbsNm || '게시판'}
        message="등록을 지원하지 않는 게시판 유형입니다."
      />
    );
  }

  return <ResolvedBoardWriteComponent boardDetail={boardDetail} bbsNo={bbsNo} pstNo={paramPstNo} mode={currentMode}/>;
};

export default BoardWriteResolver;
