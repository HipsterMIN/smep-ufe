import Popup from '@components/ui/Popup';

const ApiKeyDetailView = ({ isOpen, onClose, detailData }) => {
    // 데이터가 없을 경우를 대비한 초기값 설정
    const data = detailData || {};

    const usageMap = {
        'PD01': '웹사이트 개발',
        'PD02': '앱 개발',
        'PD03': '기타'
    };


    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            title="인증키 신청 내역 상세"
            footer={<button type="button" className="krds-btn tertiary medium" onClick={onClose}>닫기</button>}
        >
            <div className="form-area mt-16">
                <div className="txt-box small bg-white">
                    <h4 className="box-tit2">신청자 정보</h4>
                    <div className="box-cnt gap-8">
                        <div className="form-group-row">
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label">이름</label></div>
                                <div className="form-conts">
                                    <input type="text" className="krds-input small bg-readonly"
                                           value={data.mbrNm || '-'} readOnly/>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label">휴대전화 번호</label></div>
                                <div className="form-conts">
                                    <input type="text" className="krds-input small bg-readonly"
                                           value={data.picMblTelno || data.indvMblTelno || '-'} readOnly/>
                                </div>
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label">이메일</label></div>
                                <div className="form-conts">
                                    <input type="text" className="krds-input small bg-readonly"
                                           value={data.picEmlAddr || '-'} readOnly/>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label">유선전화번호</label></div>
                                <div className="form-conts">
                                    <input type="text" className="krds-input small bg-readonly"
                                           value={data.wrdTelno || '-'} readOnly/>
                                </div>
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label">소속기관</label></div>
                                <div className="form-conts">
                                    <select className="krds-form-select small bg-readonly" value={data.ogdpInstCd || ''}
                                            disabled>
                                        <option value={data.ogdpInstCd}>{data.ogdpInstNm || '기관 선택 안됨'}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label sr-only">소속기관 상세</label></div>
                                <div className="form-conts">
                                    <input type="text" className="krds-input small bg-readonly"
                                           value={data.ogdpInstNm || ''} readOnly/>
                                </div>
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label">부서</label></div>
                                <div className="form-conts">
                                    <input type="text" className="krds-input small bg-readonly"
                                           value={data.picDeptNm || '-'} readOnly/>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label">직위</label></div>
                                <div className="form-conts">
                                    <input type="text" className="krds-input small bg-readonly"
                                           value={data.picJbpsNm || '-'} readOnly/>
                                </div>
                            </div>
                        </div>
                        <div className="form-group-row">
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label">사용여부</label></div>
                                <div className="form-conts">
                                    <input
                                        type="text"
                                        className="krds-input small bg-readonly"
                                        value={data.useYn === 'Y' ? '사용 중' : '미사용'}
                                        readOnly
                                    />
                                </div>
                            </div>
                            {/* 우측 빈 공간을 맞춰주기 위해 빈 form-group 유지하거나 생략 가능 */}
                            {/*<div className="form-group"></div>*/}
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <div className="form-tit"><label className="form-label">인증키</label></div>
                                <div className="form-conts">
                                    <input
                                        type="text"
                                        className="krds-input small bg-readonly"
                                        value={data.apiAplySttsCd !== 'REQ' ? (data.apiCertTkn || '-') : '-'}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* 활용목적 섹션 */}
                <div className="txt-box small bg-white mt-24">
                    <h4 className="box-tit2">활용목적</h4>
                    <div className="box-cnt gap-24">
                        <div className="form-group">
                            <div className="form-tit"><label className="form-label">시스템명</label></div>
                            <div className="form-conts">
                                <input type="text" className="krds-input small bg-readonly" value={data.siteNm || '-'}
                                       readOnly/>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-tit"><span className="form-label">신청 API</span></div>
                            <div className="form-conts">
                                <div className="txt-box-value" style={{
                                    padding: '12px',
                                    background: '#f5f5f5',
                                    borderRadius: '4px',
                                    fontSize: '1.4rem'
                                }}>
                                    {data.apiNm || data.apiSeCd || '-'}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-tit"><span className="form-label">용도</span></div>
                            <div className="form-conts">
                            <div className="txt-box-value" style={{
                                    padding: '12px',
                                    background: '#f5f5f5',
                                    borderRadius: '4px',
                                    fontSize: '1.4rem'
                                }}>
                                    {usageMap[data.usgSeCd] || '-'}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-tit"><label className="form-label">활용목적</label></div>
                            <div className="form-conts">
                                <textarea className="krds-input bg-readonly" style={{ minHeight: '100px' }} value={data.apiRegAplyCn || ''} readOnly />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Popup>
    );
};

export default ApiKeyDetailView;