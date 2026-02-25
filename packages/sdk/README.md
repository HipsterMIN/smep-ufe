# @cube-i-ax/sdk

AI Search & Chatbot SDK for React

## Installation

```bash
npm install @cube-i-ax/sdk
```

### Prerequisites

- Node.js 18+
- React 18+

## Quick Start

### 1. 환경변수 설정

```bash
# Vite
VITE_CUBE_IAX_API_KEY=your-api-key
VITE_CUBE_IAX_API_URL=https://api.example.com/v1
```

### 2. Provider 설정

```tsx
import { CubeIAxProvider } from '@cube-i-ax/sdk/react';

function App() {
  return (
    <CubeIAxProvider
      apiKey={import.meta.env.VITE_CUBE_IAX_API_KEY}
      baseUrl={import.meta.env.VITE_CUBE_IAX_API_URL}
    >
      <YourApp />
    </CubeIAxProvider>
  );
}
```

### 3. 검색 사용

```tsx
import { useCubeIAxSearch } from '@cube-i-ax/sdk/react';

function SearchComponent() {
  const { results, isLoading, search } = useCubeIAxSearch({ stream: true });

  return (
    <div>
      <button onClick={() => search('검색어')}>검색</button>
      {results.map((result) => (
        <div key={result.documentId}>{result.title}</div>
      ))}
    </div>
  );
}
```

### 4. 채팅 사용

```tsx
import { useCubeIAxChat } from '@cube-i-ax/sdk/react';

function ChatComponent() {
  const { messages, sendMessage, streamingContent } = useCubeIAxChat();

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      {streamingContent && <div>{streamingContent}</div>}
      <button onClick={() => sendMessage('Hello!')}>Send</button>
    </div>
  );
}
```

## SMES 지원사업 도메인

```tsx
import { CubeIAxProvider } from '@cube-i-ax/sdk/react';
import {
  ProgramSearchProvider,
  ProgramChatProvider,
  useProgramSearch,
  useProgramChat,
} from '@cube-i-ax/sdk/smes/program';

function App() {
  return (
    <CubeIAxProvider apiKey={API_KEY} baseUrl={API_URL}>
      <ProgramSearchProvider>
        <ProgramChatProvider>
          <MyApp />
        </ProgramChatProvider>
      </ProgramSearchProvider>
    </CubeIAxProvider>
  );
}
```

## Documentation

- API Reference: [docs/api/](./docs/api/)
- Examples: [examples/](./examples/)

## AI-Friendly Usage (For AI Assistants like Junie)

If you are using an AI assistant (like Junie, Cursor, or GitHub Copilot) to develop with this SDK, you can help it understand the context better by adding the following to your project's `.junie/guidelines.md`:

```markdown
# AI 가이드라인: @cube-i-ax/sdk 활용

이 프로젝트는 `@cube-i-ax/sdk`를 사용하여 AI 검색 및 채팅 기능을 구현합니다. AI 어시스턴트(Junie 등)는 다음 정보를 바탕으로 개발을 지원하세요.

## 핵심 참조 정보
- **공식 문서**: `node_modules/@cube-i-ax/sdk/README.md`
- **주요 모듈**:
  - `@cube-i-ax/sdk/react`: `CubeIAxProvider`, `useCubeIAxSearch`, `useCubeIAxChat`
  - `@cube-i-ax/sdk/smes/program`: `useProgramSearch`, `useProgramChat` (중소기업 지원사업 특화)

## 구현 규칙
1. **Provider 설정**: 앱 최상위에서 `CubeIAxProvider`를 설정해야 합니다. (apiKey, baseUrl 필요)
2. **Hook 사용**: 일반적인 AI 기능은 `react` 모듈의 훅을, 지원사업 관련은 `smes/program` 모듈의 훅을 우선 사용하세요.
3. **스트리밍**: SDK는 SSE 스트리밍을 지원합니다. UI 구현 시 `streamingContent` 또는 `isLoading` 상태를 적절히 처리하세요.
```

## License

Apache License 2.0
