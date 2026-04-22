import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip} from 'recharts';
import { useUserMenu} from '@context/UserMenuContext.jsx';
import { useMatches} from 'react-router-dom';


const UI_USR_R_490 = () => {

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  // 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  const matches = useMatches();
  const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '경영현황 분석';


  // chart
  const data = [
    { subject: '자산(*)',        avg: 11267292, my: 18070754 },
    { subject: '매출액(*)',      avg: 16950591, my: 38914798 },
    { subject: '영업이익(손실)', avg: 370783,   my: 1656887  },
    { subject: '자본(*)',        avg: 5184529,  my: 6134209  },
    { subject: '부채(*)',        avg: 6082764,  my: 11936545 },
  ];

  const globalMax = Math.max(...data.map((d) => Math.max(d.avg, d.my)));

  const chartData = data.map((d) => ({
    subject: d.subject,
    my:      Math.round((d.my  / globalMax) * 100),
    avg:     Math.round((d.avg / globalMax) * 100),
    myRaw:   d.my,
    avgRaw:  d.avg,
  }));

  const fmt = (n) => n.toLocaleString("ko-KR");

  // 툴팁 커스텀
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const item = chartData.find((d) => d.subject === label);
    if (!item) return null;
    return (
      <div className="tooltip">
        <p className="tooltip-tit">{label}</p>
        <p className="tooltip-text" style={{ color: "#F23A3A" }}>나의 기업현황: {fmt(item.myRaw)}</p>
        <p className="tooltip-text" style={{ color: "#4432E6" }}>동종/동형 평균: {fmt(item.avgRaw)}</p>
      </div>
    );
  };

  //레전트 커스텀
  const CustomLegend = () => (
    <div className="custom-legend">
      {[
        { stroke: "#FF9F9F", fill: "#FFEDED",  label: "나의 기업현황" },
        { stroke: "#9494FF", fill: "#EDEDFF", label: "동종/동형 평균" },
      ].map(({ stroke, fill, label }) => (
        <div key={label} className="legend-item">
          <span className="legend-shape" style={{
            background: fill,
            border: `2px solid ${stroke}`,
          }} />
          <span className="legend-tit">{label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">{pageTitle}</h2>
        </div>

        <div className="guide-txt">
          <p>
            나의 기업 경영정보를 동종 및 동형기업 평균과 비교하여 경영현황을 도표 형태로 가시적으로 표현함
            <br />
            <em className="important">※ KED 정보의 2024년 데이터를 기준년도로함</em>
          </p>
        </div>

        <div className="graph-box mt-48">
          <h3 className="graph-tit">2024 경영현황</h3>
          <div className="graph-wrap">
            <div style={{ flex: "1 1 auto", minWidth: 0, maxWidth: 430 }}>
              <ResponsiveContainer width="100%" aspect={1}>
                <RadarChart data={chartData} outerRadius="65%">
                  <PolarGrid stroke="#dde1ea" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: "clamp(10px, 1.5vw, 13px)", fill: "#555" }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="나의 기업현황"
                    dataKey="my"
                    stroke="#F23A3A"
                    fill="rgba(220,80,80,0.18)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#F23A3A", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Radar
                    name="동종/동형 평균"
                    dataKey="avg"
                    stroke="#4432E6"
                    fill="rgba(100,120,210,0.15)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#4432E6", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <CustomLegend />
          </div>
        </div>

        {/* table [S] */}
        <div className="krds-table-wrap mt-40">
          <table className="tbl col data">
            <caption>경영현황 정보표. 항목, 동종/동형 평균, 기업현황(2024)</caption>
            <colgroup>
              <col style={{width: "33.33%"}} />
              <col style={{width: "33.33%"}} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">항목</th>
                <th scope="col" className="ac">동종/동형 평균</th>
                <th scope="col" className="ac">기업현황(2024)</th>
              </tr> 
            </thead>
            <tbody>
              <tr>
                <th className="ac"><span>자산(*)</span></th>
                <td className="ac"><span>11,267,292</span></td>
                <td className="ac"><span>18,070,754</span></td>
              </tr>
              <tr>
                <th className="ac"><span>매출액(*)</span></th>
                <td className="ac"><span>16,950,591</span></td>
                <td className="ac"><span>38,914,798</span></td>
              </tr>
              <tr>
                <th className="ac"><span>영업이익(손실)</span></th>
                <td className="ac"><span>370,783</span></td>
                <td className="ac"><span>1,656,887</span></td>
              </tr>
              <tr>
                <th className="ac"><span>자본(*)</span></th>
                <td className="ac"><span>5,184,529</span></td>
                <td className="ac"><span>6,134,209</span></td>
              </tr>
              <tr>
                <th className="ac"><span>부채(*)</span></th>
                <td className="ac"><span>6,082,764</span></td>
                <td className="ac"><span>11,936,545</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* table [E] */}
      </div> 
    </>
  );
};

export default UI_USR_R_490;
