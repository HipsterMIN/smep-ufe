import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatAIResponse } from '@cube-i-ax/sdk/smes/program';

/**
 * AI 응답 마크다운 렌더러
 * - GFM 지원 (테이블 등)
 * - HTML 태그 제거 옵션
 * - 공통 스타일 클래스 적용
 */
const AIMarkdownRenderer = ({ content, stripTags = true, className = '' }) => {
  if (!content) return null;

  const formattedContent = formatAIResponse(content, { stripTags });

  return (
    <div className={`ai-chat-markdown ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
};

export default React.memo(AIMarkdownRenderer);
