import React, {lazy, Suspense} from 'react';

// src/publishing 하위의 모든 .jsx 파일을 가져옵니다.
const modules = import.meta.glob('../publishing/*.jsx');

// SubpageLayout을 적용하지 않을 페이지 목록
const NO_LAYOUT_PAGES = ['MainPage', 'AiSmartSearch'];

export const autoPublishingRoutes = Object.keys(modules).map((path) => {
    // 1. 파일 경로에서 순수 파일명 추출 및 확장자 제거, 앞뒤 공백 제거
    const fileName = path.split('/').pop().replace('.jsx', '').trim();

    // PublishingList.jsx는 목록 페이지이므로 자동 라우팅 목록에서 제외할 수도 있지만,
    // smep-afe 처럼 모든 페이지를 포함하고 싶다면 그대로 둡니다.
    // 여기서는 PublishingList를 제외하고 index로 직접 설정하는 방식을 사용하거나 포함시킵니다.
    if (fileName === 'PublishingList') return null;

    const PageComponent = lazy(modules[path]);

    // 2. URL로 사용하기 위해 파일명을 기반으로 경로 생성
    // 예: "AiSmartSearch" -> "AiSmartSearch" (또는 소문자/하이픈 변환)
    // smep-afe 방식을 따름
    const safePath = fileName
        .replace(/[^a-zA-Z0-9가-힣]/g, '-') // 영문, 숫자, 한글 제외 모두 -로 변경
        .replace(/-+/g, '-')               // 연속된 -를 하나로 축소
        .replace(/^-|-$/g, '')             // 시작과 끝의 - 제거
        .toUpperCase();

    const noLayout = NO_LAYOUT_PAGES.includes(fileName);

    return {
        path: safePath,
        name: fileName,
        noLayout, // 레이아웃 미적용 여부 플래그
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <PageComponent/>
            </Suspense>
        ),
    };
}).filter(Boolean);

// SubpageLayout이 필요한 라우트만 필터링
export const autoPublishingRoutesWithLayout = autoPublishingRoutes.filter(route => !route.noLayout);

// SubpageLayout이 필요 없는 라우트만 필터링 (MenuProviderOnly 사용)
export const autoPublishingRoutesWithoutLayout = autoPublishingRoutes.filter(route => route.noLayout);
