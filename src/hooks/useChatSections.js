import { useMemo } from 'react';
import { mapSourcesToPrograms } from '@cube-i-ax/sdk/smes/program';

/**
 * AI 채팅 섹션(지원공고, 대화, 진행중 상태 등)을 관리하는 훅
 */
export const useChatSections = ({
  payloadReady,
  initialSummary,
  selectedPrograms,
  programIds,
  initialQuery,
  conversations,
  contextPanels,
  displaySources,
  isPending,
  pendingQuery,
  hasChatContent,
  createProgramKey,
  normalizeProgramIds,
}) => {
  return useMemo(() => {
    const sections = [];
    const shouldShowSummary =
      payloadReady ||
      initialSummary ||
      selectedPrograms.length > 0 ||
      (!payloadReady && !hasChatContent);

    if (shouldShowSummary) {
      sections.push({
        id: 'summary-section',
        type: 'summary',
        title: '지원공고',
        query: initialQuery,
        summary: initialSummary,
        programs: selectedPrograms,
        programIds: programIds,
      });
    }

    const contextQueue = [...contextPanels];

    // 1. Pending 섹션 미리 준비 (중복 체크용)
    let pendingSection = null;
    if (isPending) {
      const pendingPrograms = mapSourcesToPrograms(displaySources);
      const pendingProgramIds = pendingPrograms.map((p) => p.id).filter(Boolean);
      const fallbackProgramIds = displaySources.map((s) => s.documentId).filter(Boolean);
      const resolvedProgramIds = pendingProgramIds.length > 0 ? pendingProgramIds : fallbackProgramIds;
      const pendingKey = createProgramKey(resolvedProgramIds) || 'pending';
      pendingSection = {
        id: `pending-${pendingKey}`,
        type: 'pending',
        title: 'AI 추천 공고',
        query: pendingQuery || '검색',
        programs: pendingPrograms,
        programIds: resolvedProgramIds,
      };
    }

    // 2. conversations 처리
    conversations.forEach((conv) => {
      let programs = conv.programs || [];
      let panelIds = programs.map((program) => program.id).filter(Boolean);

      // contextQueue에서 매칭되는 패널 소모 (강화된 매칭)
      if (contextQueue.length > 0) {
        const convKey = createProgramKey(panelIds);
        const matchedIndex = contextQueue.findIndex((panel) => {
          // 쿼리가 정확히 일치하거나
          if (panel.query === conv.query) return true;
          // 공고 목록이 일치하는 경우 (둘 다 공고 정보가 있을 때만)
          const panelKey = createProgramKey(panel.programIds);
          return convKey && panelKey && convKey === panelKey;
        });

        if (matchedIndex !== -1) {
          const matchedPanel = contextQueue.splice(matchedIndex, 1)[0];
          // conversation에 프로그램 정보가 없으면 패널 정보를 가져옴
          if (programs.length === 0) {
            programs = matchedPanel.programs || [];
            panelIds = programs.map((p) => p.id).filter(Boolean);
            if (panelIds.length === 0) {
              panelIds = normalizeProgramIds(matchedPanel.programIds);
            }
          }
        }
      }

      sections.push({
        id: `conversation-${conv.id}`,
        type: 'conversation',
        title: 'AI 추천 공고',
        query: conv.query,
        conversation: conv,
        programs,
        programIds: panelIds,
      });
    });

    // 3. 남은 contextQueue 처리
    contextQueue.forEach((panel) => {
      const panelIds = normalizeProgramIds(panel.programIds);
      if (panelIds.length === 0 && (!panel.programs || panel.programs.length === 0)) {
        return;
      }

      const currentKey = createProgramKey(panelIds);

      // 직전 섹션(conversation)과 공고 목록이 중복되는지 체크
      if (sections.length > 0) {
        const lastSection = sections[sections.length - 1];
        const lastKey = createProgramKey(lastSection.programIds);
        if (currentKey && lastKey === currentKey) return;
      }

      // Pending 섹션과 공고 목록이 중복되는지 체크 (이미 나올 예정인 경우 생략)
      if (pendingSection) {
        const pendingKey = createProgramKey(pendingSection.programIds);
        if (currentKey && pendingKey === currentKey) return;
      }

      sections.push({
        id: panel.id,
        type: 'context',
        title: 'AI 추천 공고',
        query: panel.query,
        panel,
        programs: panel.programs || [],
        programIds: panelIds,
      });
    });

    // 4. Pending 섹션 추가
    if (pendingSection) {
      sections.push(pendingSection);
    }

    return sections;
  }, [
    payloadReady,
    initialSummary,
    selectedPrograms,
    programIds,
    initialQuery,
    conversations,
    contextPanels,
    displaySources,
    isPending,
    pendingQuery,
    hasChatContent,
    createProgramKey,
    normalizeProgramIds,
  ]);
};
