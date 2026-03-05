# React Router `handle` 사용법 (간단)

## 1) 라우트 생성 시 `handle`에 메타데이터 넣기
`src/routes/dynamicRoutes.jsx`의 `createRouteFromNode`에서 아래처럼 세팅합니다.

```jsx
const routeConfig = {
  path: fullPath,
  handle: {
    menuId: menuNode.menuId,
    menuNm: menuNode.menuNm,
    scrnTypeCd: menuNode.scrnTypeCd,
    bbsNo: menuNode?.bbsNo,
  },
};
```

## 2) 페이지 컴포넌트에서 `handle` 읽기
`useMatches()`로 현재 매치된 라우트들을 가져오고, 필요한 `handle` 값을 꺼냅니다.

```jsx
import { useMatches } from 'react-router-dom';

const matches = useMatches();
const pageTitle =
  [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '사업 공고';
```

## 3) 화면에 바인딩
`src/pages/Pbanc.jsx`에서는 `h2`에 바인딩하면 됩니다.

```jsx
<div className="page-title-wrap" data-type="responsive">
  <h2 className="h-tit">{pageTitle}</h2>
</div>
```

## 참고
- `reverse()`를 쓰는 이유: 보통 마지막 매치(가장 상세한 라우트)가 현재 화면 기준으로 가장 적합한 메타데이터를 가집니다.
- 기본값(`|| '사업 공고'`)을 두면 `handle`이 없는 경우에도 UI가 깨지지 않습니다.
