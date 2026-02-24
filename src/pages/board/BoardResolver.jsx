import { useEffect, useMemo, useState } from 'react';
import { useMatches } from 'react-router-dom';
import { api as apiClient } from '@lib/apiClient.js';
import BoardBasic from './components/BoardBasic.jsx';
import BoardFaq from './components/BoardFaq.jsx';
import BoardQna from './components/BoardQna.jsx';

const BOARD_COMPONENT_BY_TYPE = {
  BSC: BoardBasic,
  QNA: BoardQna,
  FAQ: BoardFaq,
};

const getBoardTypeCd = (boardDetail) => {
  const rawBoardTypeCd = boardDetail?.bbs_type_cd ?? boardDetail?.bbsTypeCd ?? '';
  return String(rawBoardTypeCd).trim().toUpperCase();
};

const BoardResolver = () => {
  const matches = useMatches();
  const [boardDetail, setBoardDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo;
  }, [matches]);

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
        setBoardDetail(response.data);
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
  const ResolvedBoardComponent = boardTypeCd ? BOARD_COMPONENT_BY_TYPE[boardTypeCd] : null;

  if (isLoading) return <div>게시판 정보를 불러오는 중입니다.</div>;
  if (errorMessage) return <div>{errorMessage}</div>;

  if (!ResolvedBoardComponent) {
    return <div>지원하지 않는 게시판 유형입니다.</div>;
  }

  return <ResolvedBoardComponent boardDetail={boardDetail} bbsNo={bbsNo} />;
};

export default BoardResolver;
