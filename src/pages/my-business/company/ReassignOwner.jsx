import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Pagination from '@components/ui/Pagination.jsx';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import {
  formatPhoneNumber,
  normalizeApiPayload,
} from './companyMemberUtils.js';
import ChangeManager from './components/ChangeManager.jsx';
import JoinOwner from './components/JoinOwner.jsx';

const PAGE_SIZE = 10;
const TEMP_FALLBACK_MBR_NO = '2025120500136492';

const fetchCorporateContacts = async (mbrNo) => {
  const response = normalizeApiPayload(
    await apiClient.get(`/api/v1/member/corporate/${encodeURIComponent(mbrNo)}/contacts`),
  );
  return Array.isArray(response) ? response : [];
};

const fetchCorporateContactCandidate = async (mbrNo, lgnId) =>
  normalizeApiPayload(
    await apiClient.get(
      `/api/v1/member/corporate/${encodeURIComponent(mbrNo)}/contacts/candidates/${encodeURIComponent(lgnId)}`,
    ),
  );

const createCorporateContact = async (mbrNo, entPicMbrNo) =>
  normalizeApiPayload(
    await apiClient.post(`/api/v1/member/corporate/${encodeURIComponent(mbrNo)}/contacts`, {
      entPicMbrNo,
    }),
  );

const checkCorporateManagerChangeAuth = async (mbrNo, entPicMbrNo) =>
  normalizeApiPayload(
    await apiClient.post(
      `/api/v1/member/corporate/${encodeURIComponent(mbrNo)}/contacts/manager/auth-check`,
      { entPicMbrNo },
    ),
  );

const changeCorporateManager = async (mbrNo, entPicMbrNo) =>
  normalizeApiPayload(
    await apiClient.put(`/api/v1/member/corporate/${encodeURIComponent(mbrNo)}/contacts/manager`, {
      entPicMbrNo,
    }),
  );

const deleteCorporateContacts = async (mbrNo, entPicMbrNos) =>
  normalizeApiPayload(
    await apiClient.delete(`/api/v1/member/corporate/${encodeURIComponent(mbrNo)}/contacts`, {
      body: { entPicMbrNos },
    }),
  );

const renderValue = (value) => {
  const normalized = String(value ?? '').trim();
  return normalized || '-';
};

const getRoleLabel = (entMngPicYn) => (entMngPicYn === 'Y' ? '기업관리자' : '담당자');

const UI_USR_L_460 = () => {
  const location = useLocation();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  // 기업 기본정보 화면과 같은 임시 경로를 따라, 전달값이 없으면 동일 폴백 회원번호로 담당자 관리 진입을 보장한다.
  const effectiveMemberNo = location.state?.mbrNo || TEMP_FALLBACK_MBR_NO;

  const [contacts, setContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [joinPopupOpen, setJoinPopupOpen] = useState(false);
  const [joinSearchLgnId, setJoinSearchLgnId] = useState('');
  const [joinSearching, setJoinSearching] = useState(false);
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinCandidate, setJoinCandidate] = useState(null);
  const [joinErrorMessage, setJoinErrorMessage] = useState('');
  const [managerPopupOpen, setManagerPopupOpen] = useState(false);
  const [managerSubmitting, setManagerSubmitting] = useState(false);
  const [managerErrorMessage, setManagerErrorMessage] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadContacts = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await fetchCorporateContacts(effectiveMemberNo);
        if (!active) {
          return;
        }
        setContacts(response);
        setSelectedIds((prev) => prev.filter((entPicMbrNo) => response.some((item) => item.entPicMbrNo === entPicMbrNo)));
      } catch (error) {
        if (!active) {
          return;
        }
        console.error('기업담당자 목록 조회 실패:', error);
        setErrorMessage(error?.message || '기업담당자 목록을 불러오지 못했습니다.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadContacts();

    return () => {
      active = false;
    };
  }, [effectiveMemberNo, reloadKey]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(contacts.length / PAGE_SIZE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [contacts.length, currentPage]);

  const currentManager = useMemo(
    () => contacts.find((contact) => contact.entMngPicYn === 'Y') || null,
    [contacts],
  );

  const selectedContacts = useMemo(
    () => contacts.filter((contact) => selectedIds.includes(contact.entPicMbrNo)),
    [contacts, selectedIds],
  );

  const totalElements = contacts.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return contacts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [contacts, currentPage]);

  const selectedManagerCandidate =
    selectedContacts.length === 1 && selectedContacts[0].entMngPicYn !== 'Y'
      ? selectedContacts[0]
      : null;

  const resetJoinPopupState = () => {
    setJoinPopupOpen(false);
    setJoinSearchLgnId('');
    setJoinCandidate(null);
    setJoinErrorMessage('');
    setJoinSearching(false);
    setJoinSubmitting(false);
  };

  const resetManagerPopupState = () => {
    setManagerPopupOpen(false);
    setManagerErrorMessage('');
    setManagerSubmitting(false);
  };

  const handleToggleSelection = (entPicMbrNo) => {
    setSelectedIds((prev) =>
      prev.includes(entPicMbrNo)
        ? prev.filter((item) => item !== entPicMbrNo)
        : [...prev, entPicMbrNo],
    );
    setFeedbackMessage('');
  };

  const handleOpenJoinPopup = () => {
    setFeedbackMessage('');
    resetJoinPopupState();
    setJoinPopupOpen(true);
  };

  const handleOpenManagerPopup = () => {
    if (!selectedManagerCandidate) {
      return;
    }
    setFeedbackMessage('');
    resetManagerPopupState();
    setManagerPopupOpen(true);
  };

  const handleSearchCandidate = async () => {
    const normalizedLgnId = joinSearchLgnId.trim();
    if (!normalizedLgnId) {
      setJoinErrorMessage('개인회원 아이디를 입력해주세요.');
      setJoinCandidate(null);
      return;
    }

    setJoinSearching(true);
    setJoinErrorMessage('');
    setJoinCandidate(null);

    try {
      const candidate = await fetchCorporateContactCandidate(effectiveMemberNo, normalizedLgnId);
      setJoinCandidate(candidate);
    } catch (error) {
      console.error('기업담당자 등록 후보 조회 실패:', error);
      setJoinErrorMessage(error?.message || '담당자 후보를 조회하지 못했습니다.');
    } finally {
      setJoinSearching(false);
    }
  };

  const handleCreateContact = async () => {
    if (!joinCandidate?.entPicMbrNo) {
      setJoinErrorMessage('등록할 담당자를 먼저 조회해주세요.');
      return;
    }

    setJoinSubmitting(true);
    setJoinErrorMessage('');

    try {
      await createCorporateContact(effectiveMemberNo, joinCandidate.entPicMbrNo);
      resetJoinPopupState();
      setFeedbackMessage('담당자를 등록했습니다.');
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error('기업담당자 등록 실패:', error);
      setJoinErrorMessage(error?.message || '담당자 등록에 실패했습니다.');
    } finally {
      setJoinSubmitting(false);
    }
  };

  const handleChangeManager = async () => {
    if (!selectedManagerCandidate?.entPicMbrNo) {
      setManagerErrorMessage('기업관리자로 변경할 담당자 1명을 선택해주세요.');
      return;
    }

    setManagerSubmitting(true);
    setManagerErrorMessage('');

    try {
      const authResult = await checkCorporateManagerChangeAuth(
        effectiveMemberNo,
        selectedManagerCandidate.entPicMbrNo,
      );
      if (!authResult?.authorized) {
        throw new Error('기업관리자 변경 인증에 실패했습니다.');
      }

      await changeCorporateManager(effectiveMemberNo, selectedManagerCandidate.entPicMbrNo);
      resetManagerPopupState();
      setSelectedIds([]);
      setFeedbackMessage('기업관리자를 변경했습니다.');
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error('기업관리자 변경 실패:', error);
      setManagerErrorMessage(error?.message || '기업관리자 변경에 실패했습니다.');
    } finally {
      setManagerSubmitting(false);
    }
  };

  const handleDeleteContacts = async () => {
    if (selectedContacts.length < 1) {
      return;
    }

    setDeleteSubmitting(true);
    setFeedbackMessage('');
    setErrorMessage('');

    try {
      await deleteCorporateContacts(effectiveMemberNo, selectedContacts.map((contact) => contact.entPicMbrNo));
      setSelectedIds([]);
      setFeedbackMessage('선택한 담당자를 삭제했습니다.');
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error('기업담당자 삭제 실패:', error);
      setErrorMessage(error?.message || '담당자 삭제에 실패했습니다.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap side-conts" data-type="responsive">
          <h2 className="h-tit">
            담당자 관리
          </h2>
        </div>

        <div className="txt-box outline">
          <ul className="check-list">
            <li>기업관리자 역할변경은 기업관리자, 담당자 누구나 할 수 있으나 반드시 법인 공동인증서로 인증하셔야 합니다.</li>
            <li>담당자 변경방법: <br />
              <ol>
                <li className="bold">1.담당자등록(변경할 담당자 개인회원 아이디 등록)</li>
                <li className="bold">2.기업관리자변경(기업인증서 필요)</li>
                <li className="bold">3.기존 담당자 삭제</li>
              </ol>
            </li>
          </ul>
        </div>

        {feedbackMessage && (
          <div className="txt-box">
            <p>{feedbackMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="txt-box">
            <p className="txt-caution">{errorMessage}</p>
          </div>
        )}

        <div className="search-list-top flex-end">
          <button
            type="button"
            className="krds-btn tertiary small"
            onClick={handleDeleteContacts}
            disabled={loading || deleteSubmitting || selectedContacts.length < 1}
          >
            담당자 삭제
          </button>
          <button
            type="button"
            className="krds-btn secondary small"
            onClick={handleOpenManagerPopup}
            disabled={loading || !selectedManagerCandidate}
          >
            기업관리자 변경
          </button>
          <button type="button" className="krds-btn primary small" onClick={handleOpenJoinPopup}>
            담당자 등록
          </button>
        </div>
        <div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>담당자명 목록 표. 선택 여부, 담당자명, 역할, 부서명, 직위, 휴대전화, 유선전화, 이메일 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '7.4%' }} />
              <col style={{ width: '9.2%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '16.8%' }} />
              <col style={{ width: '9.2%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '16.6%' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">선택</th>
                <th scope="col" className="ac">담당자명</th>
                <th scope="col" className="ac">역할</th>
                <th scope="col" className="ac">부서명</th>
                <th scope="col" className="ac">직위</th>
                <th scope="col" className="ac">휴대전화</th>
                <th scope="col" className="ac">유선전화</th>
                <th scope="col" className="ac">이메일</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="ac">로딩 중...</td>
                </tr>
              ) : pagedRows.length > 0 ? (
                pagedRows.map((row, index) => {
                  const checkboxId = `contact-check-${currentPage}-${index}`;
                  const disabled = row.entMngPicYn === 'Y';
                  return (
                    <tr key={row.entPicMbrNo}>
                      <td className="ac">
                        {disabled ? (
                          <span>-</span>
                        ) : (
                          // KRDS checkbox skin uses the adjacent label in the same cell as its visual target.
                          <div className="krds-form-check no-txt" style={{ display: 'inline-block' }}>
                            <input
                              type="checkbox"
                              className="checkbox"
                              id={checkboxId}
                              checked={selectedIds.includes(row.entPicMbrNo)}
                              onChange={() => handleToggleSelection(row.entPicMbrNo)}
                            />
                            <label className="krds-form-check-label" htmlFor={checkboxId}>
                              <span className="sr-only">{renderValue(row.mbrNm)} 선택</span>
                            </label>
                          </div>
                        )}
                      </td>
                      <td className="ac">
                        <span>{renderValue(row.mbrNm)}</span>
                      </td>
                      <td className="ac"><span>{getRoleLabel(row.entMngPicYn)}</span></td>
                      <td className="ac"><span>{renderValue(row.picDeptNm)}</span></td>
                      <td className="ac"><span>{renderValue(row.picJbpsNm)}</span></td>
                      <td className="ac"><span>{formatPhoneNumber(row.picMblTelno)}</span></td>
                      <td className="ac"><span>{formatPhoneNumber(row.picTelno)}</span></td>
                      <td className="ac"><span>{renderValue(row.picEmlAddr)}</span></td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="ac">등록된 담당자가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          syncUrl
        />
      </div>

      <JoinOwner
        isOpen={joinPopupOpen}
        onClose={resetJoinPopupState}
        searchLgnId={joinSearchLgnId}
        onSearchLgnIdChange={setJoinSearchLgnId}
        candidate={joinCandidate}
        searching={joinSearching}
        submitting={joinSubmitting}
        errorMessage={joinErrorMessage}
        onSearch={handleSearchCandidate}
        onSubmit={handleCreateContact}
      />

      <ChangeManager
        isOpen={managerPopupOpen}
        onClose={resetManagerPopupState}
        currentManager={currentManager}
        nextManager={selectedManagerCandidate}
        submitting={managerSubmitting}
        errorMessage={managerErrorMessage}
        onSubmit={handleChangeManager}
      />
    </>
  );
};

export default UI_USR_L_460;
