import React, { useRef, useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";
import galleryThumb from "../assets/common/galleryThumb.png";
import noImg from "../assets/common/noImg.png";

const UI_USR_L_070 = () => {
  const tabData = useRef(['보도자료', '카드뉴스', '영상']);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };

  const navigationData = {
    depth1Title: "정책정보",
    depth: [
       {
        depth2: '정책리포트',
				active: true,
        depth3: [
          {
            label: '정책뉴스',
            link: '/',
						active: true
          },
          {
            label: '행사정보',
            link: '/',
						active: false
          },
          {
            label: '월간중기누리',
            link: '/',
						active: false
          },
        ],
      },
      {
        depth2: "중소벤처기업부 지원사업 소개",
        active: false,
      },
      {
        depth2: "사업공고",
      },
      {
        depth2: "정책금융",
      },
      {
        depth2: "증명서 발급",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "정책정보", link: "#" },
    { label: "정책리포트", link: "#" },
    { label: "정책뉴스", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">정책뉴스</h2>
        </div>
				<div className="search-top-box">
						<div className="sch-form-wrap">
							<select className="krds-form-select">
								<option value="">전체</option>
							</select>
							<div className="sch-input">
								<input type="text" className="krds-input" placeholder="검색어를 입력해주세요." title="검색어 입력" />
								<button type="button" className="krds-btn medium icon ico-search" >
									<span className="sr-only">검색</span>
									<i className="svg-icon ico-sch"></i>
								</button>
							</div>
						</div>
				</div>
        <div className="krds-tab-area layer">
            <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>

            <div className="tab-conts-wrap">
              <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
                <h3 className="sr-only">보도자료</h3>
								<div className="search-list-top">
									<ul className="sch-info" aria-live="polite">
										<li>검색 결과 <span className="point">24</span>개</li>
									</ul>
									<ul className="sch-sort">
										<li>
											<strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
											<select className="krds-form-select-sort" id="search_result_count">
												<option>12개</option>
												<option>9개</option>
											</select>
										</li>
									</ul>
								</div>

								<ul className="krds-structured-list">
									<li className="structured-item">
										<div className="card-body">
											<a href="#" className="c-text">
												<div className="ongallery-thumnb noImage">
													<img src={galleryThumb} alt="" />
												</div>
												<div className="krds-badge-wrap">
													<span className="krds-badge bg-light-primary">농림축산식품부</span>
												</div>
												<p className="c-tit no-icon"><span className="span onellipsis-2">경북도, 신규 글로벌혁신 규제자유특구 참여기업 모집</span></p>
												<div className="c-date type2">
														<p>
															<strong className="key">날짜</strong>
															<span className="value">2025.12.19</span>
														</p>
														<p>
															<span className="sr-only">조회수</span>
															<i className="ml-auto svg-icon ico-pw-visible-on"></i>
															<span>3</span>
														</p>
												</div>
											</a>
										</div>
									</li>
									<li className="structured-item">
										<div className="card-body">
											<a href="#" className="c-text">
												<div className="ongallery-thumnb noImage">
													<img src={noImg} alt="" />
												</div>
												<div className="krds-badge-wrap">
													<span className="krds-badge bg-light-primary">농림축산식품부</span>
												</div>
												<p className="c-tit no-icon"><span className="span onellipsis-2">경북도, 신규 글로벌혁신 규제자유특구 참여기업 모집</span></p>
												<div className="c-date type2">
														<p>
															<strong className="key">날짜</strong>
															<span className="value">2025.12.19</span>
														</p>
														<p>
															<span className="sr-only">조회수</span>
															<i className="ml-auto svg-icon ico-pw-visible-on"></i>
															<span>3</span>
														</p>
												</div>
											</a>
										</div>
									</li>
									<li className="structured-item">
										<div className="card-body">
											<a href="#" className="c-text">
												<div className="ongallery-thumnb noImage">
													<img src={noImg} alt="" />
												</div>
												<div className="krds-badge-wrap">
													<span className="krds-badge bg-light-primary">농림축산식품부</span>
												</div>
												<p className="c-tit no-icon"><span className="span onellipsis-2">경북도, 신규 글로벌혁신 규제자유특구 참여기업 모집</span></p>
												<div className="c-date type2">
														<p>
															<strong className="key">날짜</strong>
															<span className="value">2025.12.19</span>
														</p>
														<p>
															<span className="sr-only">조회수</span>
															<i className="ml-auto svg-icon ico-pw-visible-on"></i>
															<span>3</span>
														</p>
												</div>
											</a>
										</div>
									</li>
								</ul>

              
                <Pagination /> 
              </section>
              
            </div>
        </div>
        
      
      </div> 
    </>
  );
};

export default UI_USR_L_070;