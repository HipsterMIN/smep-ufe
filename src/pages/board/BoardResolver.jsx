import { useEffect, useMemo, useState } from 'react';
import { useMatches } from 'react-router-dom';
import { api as apiClient } from '@lib/apiClient.js';
import BoardBasic from './components/BoardBasic.jsx';
import BoardFaq from './components/BoardFaq.jsx';
import BoardQna from './components/BoardQna.jsx';
import BoardThumbnail from './components/BoardThumbnail.jsx';
import BoardResolverStateView from './components/BoardResolverStateView.jsx';

/**
 * 게시판 "목록 페이지" 타입별 실제 렌더 컴포넌트 매핑 테이블
 *
 * 키: 게시판 유형 코드(bbs_type_cd / bbsTypeCd)
 * 값: 해당 유형을 렌더링할 React 컴포넌트
 *
 * 유지보수 포인트:
 * - 신규 게시판 유형이 생기면 이 매핑에 추가
 * - 매핑이 없으면 "지원하지 않는 게시판 유형" 상태 화면이 노출됨
 */
const BOARD_COMPONENT_BY_TYPE = {
  BSC: BoardBasic,
  QNA: BoardQna,
  FAQ: BoardFaq,
  IMG: BoardThumbnail, // eg. 월간중기누리..
  VDO: BoardThumbnail, //
  LNK: BoardBasic, //
  WBZ: BoardBasic, //
};

/**
 * API 응답 스키마 차이를 흡수해서 "정규화된 게시판 유형 코드"를 반환한다.
 *
 * 백엔드 응답 키가 환경/버전별로 달라도 동일하게 처리하기 위해
 * snake_case, camelCase를 모두 확인한다.
 *
 * @param {Object|null} boardDetail 게시판 상세 API 응답 객체
 * @returns {string} 공백 제거 + 대문자 변환된 게시판 유형 코드
 */
const getBoardTypeCd = (boardDetail) => {
  const rawBoardTypeCd = boardDetail?.bbs_type_cd ?? boardDetail?.bbsTypeCd ?? '';
  return String(rawBoardTypeCd).trim().toUpperCase();
};

/**
 * BoardResolver
 *
 * 역할:
 * 1) 현재 라우트 컨텍스트에서 게시판 번호(bbsNo) 추출
 * 2) 게시판 상세(/api/v1/board/{bbsNo}) 조회
 * 3) 조회된 게시판 유형 코드로 실제 목록 컴포넌트 동적 분기
 * 4) 로딩/에러/미지원 상태에서도 동일 레이아웃 셸 유지
 *
 * 핵심 의도:
 * - 상태 전환 시 레이아웃이 비지 않도록 공통 상태 뷰(BoardResolverStateView)를 사용한다.
 * - 이를 통해 footer가 순간적으로 위로 붙는 점프/깜빡임을 완화한다.
 */
const BoardResolver = () => {
  const matches = useMatches();

  /**
   * boardDetail: 게시판 메타 정보(유형, 이름 등)
   * isLoading: 게시판 메타 조회 진행 상태
   * errorMessage: 사용자에게 보여줄 조회 실패 메시지
   */
  const [boardDetail, setBoardDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * 현재 매칭된 라우트 체인(handle 포함)에서 게시판 번호를 계산한다.
   *
   * 왜 reverse 탐색을 하는가?
   * - 중첩 라우트 구조에서 가장 안쪽 child가 부모 handle을 덮거나
   *   누락하는 케이스를 방어하기 위해 "가장 가까운 유효 bbsNo"를 우선 선택한다.
   *
   * fallback:
   * - reverse 탐색에서 못 찾으면 currentMatch의 handle.bbsNo를 마지막으로 확인
   */
  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo;
  }, [matches]);

  /**
   * 게시판 메타 정보 로드 effect
   *
   * 트리거:
   * - bbsNo가 바뀔 때마다 재조회
   *
   * 안전장치:
   * - isMounted 플래그로 언마운트 후 setState 호출을 방지한다.
   *   (빠른 라우트 전환/중복 요청 상황의 메모리릭 경고 및 레이스 방지)
   */
  useEffect(() => {
    let isMounted = true;

    /**
     * 실제 API 호출 + 상태 반영 루틴
     */
    const loadBoardDetail = async () => {
      // 라우트 메타에서 게시판 번호를 못 찾은 경우: API 호출 없이 즉시 에러 상태로 전환
      if (bbsNo == null || bbsNo === '') {
        if (!isMounted) return;
        setBoardDetail(null);
        setErrorMessage('게시판 번호를 확인할 수 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        if (!isMounted) return;

        // 재조회 시작: 로딩 ON + 이전 에러 초기화
        setIsLoading(true);
        setErrorMessage('');

        // 게시판 메타 조회
        const response = await apiClient.get(`/api/v1/board/${bbsNo}`);

        if (!isMounted) return;

        // 정상 응답 반영
        setBoardDetail(response.data);
      } catch (error) {
        if (!isMounted) return;

        // 실패 시 기존 상세 데이터 제거 + 메시지 세팅
        setBoardDetail(null);
        setErrorMessage(error?.message || '게시판 정보를 불러오지 못했습니다.');
      } finally {
        // 성공/실패와 무관하게 로딩 종료
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

  /**
   * boardDetail에서 정규화된 게시판 유형 코드 도출
   */
  const boardTypeCd = useMemo(() => getBoardTypeCd(boardDetail), [boardDetail]);

  /**
   * 게시판 유형 코드에 대응되는 실제 렌더 컴포넌트 선택
   * - 유형 코드가 비어있거나 매핑이 없으면 null
   */
  const ResolvedBoardComponent = boardTypeCd ? BOARD_COMPONENT_BY_TYPE[boardTypeCd] : null;

  /**
   * 상태 우선 분기
   *
   * 주의:
   * - 단순 텍스트 div를 반환하면 레이아웃이 순간적으로 붕괴되어 footer 점프가 발생할 수 있다.
   * - 반드시 공통 상태 뷰(동일 2컬럼 셸)를 사용한다.
   */
  if (isLoading) {
    return (
      <BoardResolverStateView
        title="게시판"
        message="게시판 정보를 불러오는 중입니다."
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

  // 매핑되지 않은 게시판 유형에 대한 방어 분기
  if (!ResolvedBoardComponent) {
    return (
      <BoardResolverStateView
        title={boardDetail?.bbsNm || '게시판'}
        message="지원하지 않는 게시판 유형입니다."
      />
    );
  }

  // 최종 정상 경로: 유형별 목록 컴포넌트 렌더
  return <ResolvedBoardComponent boardDetail={boardDetail} bbsNo={bbsNo} />;
};

export default BoardResolver;
