import { useEffect, useMemo, useState } from 'react';
import { useMatches, useParams } from 'react-router-dom';
import { api as apiClient } from '@lib/apiClient.js';
import BoardPostBasic from './components/BoardPostBasic.jsx';
import BoardPostQna from './components/BoardPostQna.jsx';
import BoardPostThumbnail from './components/BoardPostThumbnail.jsx';
import BoardResolverStateView from './components/BoardResolverStateView.jsx';
import BoardBasic from '@pages/board/components/BoardBasic.jsx';

/**
 * 게시판 "상세 페이지" 타입별 실제 렌더 컴포넌트 매핑
 *
 * 목록과 상세는 UI/동작이 다르므로 별도 매핑 테이블을 유지한다.
 * 예) FAQ 목록은 아코디언이지만 상세는 기본 상세 템플릿을 재사용할 수 있음.
 */
const BOARD_POST_COMPONENT_BY_TYPE = {
  BSC: BoardPostBasic,
  QNA: BoardPostQna,
  FAQ: BoardPostBasic,
  IMG: BoardPostThumbnail,
  VDO: BoardPostThumbnail,
  LNK: BoardPostBasic, // 
  WBZ: BoardPostBasic, //
};

/**
 * 게시판 메타에서 게시판 유형 코드를 정규화한다.
 *
 * - 응답 키 형태 차이(snake/camel) 흡수
 * - 공백/대소문자 차이 제거
 */
const getBoardTypeCd = (boardDetail) => {
  const rawBoardTypeCd = boardDetail?.bbs_type_cd ?? boardDetail?.bbsTypeCd ?? '';
  return String(rawBoardTypeCd).trim().toUpperCase();
};

/**
 * BoardPostResolver
 *
 * 역할:
 * 1) 라우트 컨텍스트에서 게시판 번호(bbsNo), URL 파라미터에서 게시물 번호(pstNo) 획득
 * 2) 게시판 메타 조회로 유형 파악
 * 3) 유형에 맞는 상세 컴포넌트 선택 후 렌더
 * 4) 로딩/에러/미지원 상태는 공통 셸 상태 뷰로 렌더
 *
 * 설계 포인트:
 * - 상세 페이지도 목록과 동일하게 "레이아웃 셸 유지"를 우선한다.
 * - 상태 전환 중 레이아웃 공백을 만들지 않아 footer 점프를 방지한다.
 */
const BoardPostResolver = () => {
  const matches = useMatches();
  const { id } = useParams();

  /**
   * boardDetail: 게시판 메타 정보(유형, 이름 등)
   * isLoading: 메타 조회 진행 상태
   * errorMessage: 사용자 표시용 오류 메시지
   */
  const [boardDetail, setBoardDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * 라우트 handle 체인에서 게시판 번호를 역순 우선 탐색한다.
   * - 가장 안쪽 라우트부터 유효 bbsNo를 찾고, 없으면 currentMatch fallback
   */
  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo;
  }, [matches]);

  /**
   * URL 파라미터 id를 게시물 번호 문자열로 정규화
   * - null/undefined면 빈 문자열로 변환해 검증 분기를 단순화한다.
   */
  const pstNo = useMemo(() => {
    if (id == null) return '';
    return String(id).trim();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  /**
   * 게시판 메타 조회 effect
   *
   * 트리거:
   * - bbsNo, pstNo 변경 시 재실행
   *
   * 이유:
   * - 상세 화면은 게시판 번호 + 게시물 번호 모두 유효해야 정상 렌더 가능
   */
  useEffect(() => {
    let isMounted = true;

    /**
     * API 호출 및 상태 반영 루틴
     */
    const loadBoardDetail = async () => {
      // 게시판 번호가 없으면 API 요청하지 않고 즉시 종료
      if (bbsNo == null || bbsNo === '') {
        if (!isMounted) return;
        setBoardDetail(null);
        setErrorMessage('게시판 번호를 확인할 수 없습니다.');
        setIsLoading(false);
        return;
      }

      // 상세 라우트에서 게시물 번호가 없으면 즉시 종료
      if (!pstNo) {
        if (!isMounted) return;
        setBoardDetail(null);
        setErrorMessage('게시물 번호를 확인할 수 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        if (!isMounted) return;

        // 재조회 시작
        setIsLoading(true);
        setErrorMessage('');

        // 게시판 메타 조회(유형 분기용)
        const response = await apiClient.get(`/api/v1/board/${bbsNo}`);

        if (!isMounted) return;

        // 응답 데이터 반영
        setBoardDetail(response?.data ?? null);
      } catch (error) {
        if (!isMounted) return;

        // 실패 시 방어 상태로 전환
        setBoardDetail(null);
        setErrorMessage(error?.message || '게시판 정보를 불러오지 못했습니다.');
      } finally {
        // 항상 로딩 종료
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

  // 조회된 메타에서 유형 코드 계산
  const boardTypeCd = useMemo(() => getBoardTypeCd(boardDetail), [boardDetail]);

  // 유형 코드 기반 상세 컴포넌트 선택
  const ResolvedBoardPostComponent = boardTypeCd ? BOARD_POST_COMPONENT_BY_TYPE[boardTypeCd] : null;

  /**
   * 상태 분기:
   * - 레이아웃 공백을 만들지 않기 위해 공통 상태 뷰를 사용한다.
   */
  if (isLoading) {
    return (
      <BoardResolverStateView
        title="게시판"
        message="게시물 정보를 불러오는 중입니다."
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

  // 유형 매핑 누락/미지원 방어
  if (!ResolvedBoardPostComponent) {
    return (
      <BoardResolverStateView
        title={boardDetail?.bbsNm || '게시판'}
        message="지원하지 않는 게시판 유형입니다."
      />
    );
  }

  // 정상 경로: 유형별 상세 컴포넌트 렌더
  return <ResolvedBoardPostComponent boardDetail={boardDetail} bbsNo={bbsNo} pstNo={pstNo} />;
};

export default BoardPostResolver;
