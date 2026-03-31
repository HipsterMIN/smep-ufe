import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  INTG_SRCH_ROUTE_HINT_CD_GROUP_ID,
  resolveIntegratedSearchRoute,
} from '@utils/integratedSearchRouteResolver.js';
import { fetchCommonCodes } from '@utils/commonCodeUtils.js';

const TEST_PAGE_STATE_STORAGE_KEY = 'intg-search-route-test-page-state-v1';

/**
 * [임시 테스트 파일]
 * - 통합검색 라우팅 수동 검증용으로만 사용한다.
 * - 테스트 종료 후 반드시 삭제 대상이다.
 *
 * 통합검색 라우팅 테스트 페이지
 *
 * 목적:
  * - 업무개발자 개발 완료 전, 단서코드 기반 라우팅을 독립적으로 검증한다.
  * - 기본 입력값 3개(intgSrchRouteHintCd, workId, bbsCategoryId)와
  *   확장 파라미터(parameter.title)를 함께 검증한다.
 *
 * 참고:
 * - 리졸버는 (상세), (게시판_상세), (외부링크이동) 케이스를 지원한다.
 * - (게시판_상세) 케이스에서는 bbsCategoryId가 있으면 ctgryNo 쿼리로 path에 반영된다.
 */
const IntegratedSearchRouteTest = () => {
  const navigate = useNavigate();
  const [intgSrchRouteHintCd, setIntgSrchRouteHintCd] = useState('ISRH0001');
  const [workId, setWorkId] = useState('ST_000000000001265');
  const [bbsCategoryId, setBbsCategoryId] = useState('');
  const [parameterTitle, setParameterTitle] = useState('');
  const [routeHintCodeOptions, setRouteHintCodeOptions] = useState([]);
  const [isRouteHintOptionsLoading, setIsRouteHintOptionsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolved, setResolved] = useState(null);
  const [error, setError] = useState('');

  const persistPageState = ({
    nextHintCd = intgSrchRouteHintCd,
    nextWorkId = workId,
    nextBbsCategoryId = bbsCategoryId,
    nextParameterTitle = parameterTitle,
    nextResolved = resolved,
  } = {}) => {
    if (typeof window === 'undefined') {
      return;
    }

    const payload = {
      intgSrchRouteHintCd: nextHintCd || '',
      workId: nextWorkId || '',
      bbsCategoryId: nextBbsCategoryId || '',
      parameterTitle: nextParameterTitle || '',
      resolved: nextResolved || null,
      savedAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(TEST_PAGE_STATE_STORAGE_KEY, JSON.stringify(payload));
  };

  const buildBrowserPreview = (routerPath) => {
    if (!routerPath) {
      return {
        basename: null,
        routerPath: null,
        fullPath: null,
        url: null,
      };
    }

    // routes/index.jsx의 basename 계산 규칙과 동일하게 맞춘다.
    const base = import.meta.env.BASE_URL || '/';
    const basename = base.endsWith('/') && base !== '/' ? base.slice(0, -1) : base;
    const normalizedBase = basename === '/' ? '' : basename;
    const normalizedPath = routerPath.startsWith('/') ? routerPath : `/${routerPath}`;
    const fullPath = `${normalizedBase}${normalizedPath}`;

    if (typeof window === 'undefined') {
      return {
        basename,
        routerPath: normalizedPath,
        fullPath,
        url: fullPath,
      };
    }

    return {
      basename,
      routerPath: normalizedPath,
      fullPath,
      url: `${window.location.origin}${fullPath}`,
    };
  };

  // 결과 타입에 따라 "실제 브라우저가 요청할 URL" 미리보기를 통일해서 만든다.
  const buildResolvePreview = (result) => {
    if (result?.navigationType === 'EXTERNAL') {
      return {
        basename: null,
        routerPath: null,
        fullPath: null,
        url: result?.externalUrl || null,
      };
    }
    return buildBrowserPreview(result?.path);
  };

  useEffect(() => {
    const loadRouteHintCodeOptions = async () => {
      setIsRouteHintOptionsLoading(true);
      setError('');

      try {
        const response = await fetchCommonCodes([INTG_SRCH_ROUTE_HINT_CD_GROUP_ID]);
        const codeList = response?.[INTG_SRCH_ROUTE_HINT_CD_GROUP_ID] || [];

        const options = codeList
          .map((item) => ({
            code: item?.comCd || item?.com_cd || '',
            description: item?.comCdExpln || item?.com_cd_expln || '',
            sortSeq: Number(item?.sortSeq ?? item?.sort_seq ?? 999999),
          }))
          .filter((item) => Boolean(item.code))
          .sort((a, b) => a.sortSeq - b.sortSeq);

        setRouteHintCodeOptions(options);

        // 현재 선택값이 옵션에 없으면 첫 번째 코드로 자동 설정한다.
        setIntgSrchRouteHintCd((prev) => {
          if (options.length === 0) return prev;
          if (options.some((item) => item.code === prev)) return prev;
          return options[0].code;
        });
      } catch (err) {
        console.error('통합검색 라우트 힌트 코드 조회 실패:', err);
        setError('INTG_SRCH_ROUTE_HINT_CD 공통코드 조회에 실패했습니다.');
      } finally {
        setIsRouteHintOptionsLoading(false);
      }
    };

    loadRouteHintCodeOptions();
  }, []);

  // 뒤로가기/새로고침 후에도 테스트 입력값과 리졸브 결과를 복원한다.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.sessionStorage.getItem(TEST_PAGE_STATE_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const saved = JSON.parse(raw);
      if (saved?.intgSrchRouteHintCd) {
        setIntgSrchRouteHintCd(saved.intgSrchRouteHintCd);
      }
      if (saved?.workId) {
        setWorkId(saved.workId);
      }
      if (typeof saved?.bbsCategoryId === 'string') {
        setBbsCategoryId(saved.bbsCategoryId);
      }
      if (typeof saved?.parameterTitle === 'string') {
        setParameterTitle(saved.parameterTitle);
      }
      if (saved?.resolved) {
        setResolved(saved.resolved);
      }
    } catch (err) {
      console.error('테스트 페이지 상태 복원 실패:', err);
    }
  }, []);

  const handleResolve = async () => {
    setIsResolving(true);
    setError('');
    setResolved(null);
    try {
      const result = await resolveIntegratedSearchRoute({
        intgSrchRouteHintCd: intgSrchRouteHintCd.trim(),
        workId: workId.trim(),
        bbsCategoryId: bbsCategoryId.trim(),
        parameter: {
          title: parameterTitle.trim(),
        },
      });
      const preview = buildResolvePreview(result);

      const nextResolved = {
        ...result,
        browserPreview: preview,
      };

      setResolved(nextResolved);
      persistPageState({ nextResolved });
    } catch (err) {
      console.error('통합검색 라우트 리졸브 실패:', err);
      setError('리졸브에 실패했습니다. 콘솔 로그를 확인해주세요.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleMove = () => {
    if (!resolved) return;
    persistPageState();

    if (resolved.navigationType === 'EXTERNAL' && resolved.externalUrl) {
      window.open(resolved.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (resolved.path) {
      navigate(resolved.path);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px', padding: '10px 12px', border: '2px solid #c62828', borderRadius: '6px', background: '#fff5f5', color: '#7f1d1d', fontWeight: 700 }}>
        임시 테스트 페이지입니다. 테스트 완료 후 파일/라우트 삭제가 필요합니다.
      </div>
      <h1 style={{ marginBottom: '12px' }}>통합검색 라우팅 테스트</h1>
      <p style={{ marginBottom: '20px', color: '#555' }}>
        단서코드와 업무ID로 실제 이동 경로를 계산하는 임시 테스트 화면입니다.
      </p>

      <div style={{ marginBottom: '14px', padding: '12px', border: '1px solid #dae6f7', borderRadius: '6px', background: '#f8fbff' }}>
        <p style={{ marginBottom: '8px', fontWeight: 700 }}>검증 대상 함수</p>
        <p style={{ marginBottom: '4px' }}>
          <code>src/utils/integratedSearchRouteResolver.js</code>:
          <code>resolveIntegratedSearchRoute()</code>
        </p>
      </div>

      <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', border: '1px dashed #c8d6ea', borderRadius: '6px', background: '#fbfdff', color: '#2f3b52' }}>
          <p style={{ marginBottom: '8px' }}>
            사용 순서: 1) 단서코드 선택 2) workId/카테고리/title 입력 3) 리졸브 실행
            4) <code>reason</code> 확인 5) 결과 경로 이동
          </p>
          <p>
            리졸브 결과의 <code>navigationType</code>, <code>path/externalUrl</code>, <code>예상 요청 URL</code>을 확인한 뒤 이동하세요.
          </p>
        </div>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span>intgSrchRouteHintCd</span>
          <p style={{ margin: 0, color: '#5d6b82', fontSize: '13px', lineHeight: '1.45' }}>
            통합검색에서 전달받는 단서코드(com_cd) 값입니다.
            이 필드는 수기입력 대신 <code>INTG_SRCH_ROUTE_HINT_CD</code> 공통코드를 조회하여
            셀렉트 옵션으로 제공합니다. 옵션 라벨은 <code>코드값 + com_cd_expln</code> 조합으로
            표시되며, 오타 입력/미등록 코드 문제를 줄이기 위한 목적입니다.
          </p>
          <select
            value={intgSrchRouteHintCd}
            onChange={(e) => {
              const nextHintCd = e.target.value;
              setIntgSrchRouteHintCd(nextHintCd);
              persistPageState({ nextHintCd });
            }}
            style={{ padding: '10px', border: '1px solid #d9d9d9', borderRadius: '6px' }}
            disabled={isRouteHintOptionsLoading || routeHintCodeOptions.length === 0}
          >
            {isRouteHintOptionsLoading && <option value="">공통코드 조회 중...</option>}
            {!isRouteHintOptionsLoading && routeHintCodeOptions.length === 0 && (
              <option value="">조회된 코드가 없습니다.</option>
            )}
            {routeHintCodeOptions.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} | {item.description || '(com_cd_expln 없음)'}
              </option>
            ))}
          </select>
          {routeHintCodeOptions.length > 0 && (
            <p style={{ margin: 0, color: '#5d6b82', fontSize: '12px' }}>
              선택 코드 설명: {routeHintCodeOptions.find((item) => item.code === intgSrchRouteHintCd)?.description || '-'}
            </p>
          )}
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span>workId</span>
          <p style={{ margin: 0, color: '#5d6b82', fontSize: '13px', lineHeight: '1.45' }}>
            업무 식별자(상세 식별자) 값입니다.
            현재 단순 상세 이동 케이스에서는 basePath 뒤에 이 값이 path segment로 붙습니다.
            예: <code>ST_000000000001265</code> 입력 시 <code>/.../ST_000000000001265</code> 형태가 됩니다.
            값이 비어 있으면 상세 대신 목록(basePath)으로 폴백됩니다.
          </p>
          <input
            type="text"
            value={workId}
            onChange={(e) => {
              const nextWorkId = e.target.value;
              setWorkId(nextWorkId);
              persistPageState({ nextWorkId });
            }}
            placeholder="예: ST_000000000001265"
            style={{ padding: '10px', border: '1px solid #d9d9d9', borderRadius: '6px' }}
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span>bbsCategoryId</span>
          <p style={{ margin: 0, color: '#5d6b82', fontSize: '13px', lineHeight: '1.45' }}>
            게시판 카테고리 식별자 값입니다.
            현재 리졸버는 (게시판_상세) 케이스에서 값이 있으면 <code>ctgryNo</code> 쿼리스트링으로 붙입니다.
            비게시판 상세 케이스에서는 이 값이 있어도 path에 반영되지 않습니다.
          </p>
          <input
            type="text"
            value={bbsCategoryId}
            onChange={(e) => {
              const nextBbsCategoryId = e.target.value;
              setBbsCategoryId(nextBbsCategoryId);
              persistPageState({ nextBbsCategoryId });
            }}
            placeholder="예: 1001 (게시판_상세에서 선택 반영)"
            style={{ padding: '10px', border: '1px solid #d9d9d9', borderRadius: '6px' }}
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span>parameter.title</span>
          <p style={{ margin: 0, color: '#5d6b82', fontSize: '13px', lineHeight: '1.45' }}>
            신규 파라미터 수신 케이스에서 사용하는 제목 값입니다.
            예: <code>ISRH0014</code>는 이 값을 받아 FAQ 목록으로 이동한 뒤
            <code>searchType=TITLE</code>, <code>searchKeyword</code>로 경로를 계산합니다.
          </p>
          <input
            type="text"
            value={parameterTitle}
            onChange={(e) => {
              const nextParameterTitle = e.target.value;
              setParameterTitle(nextParameterTitle);
              persistPageState({ nextParameterTitle });
            }}
            placeholder="예: 정책자금 신청 방법"
            style={{ padding: '10px', border: '1px solid #d9d9d9', borderRadius: '6px' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={handleResolve}
          disabled={isResolving}
          style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #0b63ce', background: '#0b63ce', color: '#fff' }}
        >
          {isResolving ? '리졸브 중...' : '리졸브 실행'}
        </button>

        <button
          type="button"
          onClick={handleMove}
          disabled={!resolved?.path && !resolved?.externalUrl}
          style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #167d3f', background: '#167d3f', color: '#fff' }}
        >
          결과 경로로 이동
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '12px', color: '#c62828' }}>
          {error}
        </div>
      )}

      {resolved && (
        <div style={{ marginBottom: '14px', padding: '12px', border: '1px solid #d9e2f2', borderRadius: '6px', background: '#f7fbff' }}>
          <div style={{ marginBottom: '6px' }}>
            이동 타입: <code>{resolved.navigationType || '-'}</code>
          </div>
          <div style={{ marginBottom: '6px' }}>
            예상 Router Path: <code>{resolved.path || '-'}</code>
          </div>
          <div style={{ marginBottom: '6px' }}>
            외부 링크 URL: <code>{resolved.externalUrl || '-'}</code>
          </div>
          <div style={{ marginBottom: '6px' }}>
            예상 Full Path: <code>{resolved.browserPreview?.fullPath || '-'}</code>
          </div>
          <div>
            예상 요청 URL: <code>{resolved.browserPreview?.url || '-'}</code>
          </div>
        </div>
      )}

      <div>
        <h2 style={{ marginBottom: '8px' }}>결과(JSON)</h2>
        <pre style={{ padding: '14px', background: '#f7f7f7', border: '1px solid #eee', borderRadius: '6px', overflow: 'auto' }}>
          {JSON.stringify(resolved, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default IntegratedSearchRouteTest;
