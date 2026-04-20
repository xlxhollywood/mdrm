const RESULT_STYLE = {
  '정상':   { bg: '#edfaf4', text: '#00a36a', dot: '#00bc7d' },
  '비정상':   { bg: '#fff8ec', text: '#c97a00', dot: '#fd9a00' },
  '실패': { bg: '#fff0f1', text: '#d0202a', dot: '#fb2c36' },
};

const ITEMS = [
  { no: 1,  name: 'CPU 사용률 점검',   system: 'MDRM-Web-01',    result: '정상',   date: '04-14' },
  { no: 2,  name: '메모리 사용률',     system: 'MDRM-Web-01',    result: '비정상',   date: '04-14' },
  { no: 3,  name: '디스크 여유 공간',  system: 'MDRM-Web-01',    result: '정상',   date: '04-14' },
  { no: 4,  name: 'DB 연결 상태',      system: 'MDRM-DB-01',     result: '정상',   date: '04-15' },
  { no: 5,  name: '쿼리 응답시간',     system: 'MDRM-DB-01',     result: '실패', date: '04-15' },
  { no: 6,  name: '포트 상태 점검',    system: 'Switch-Core-01', result: '정상',   date: '04-16' },
  { no: 7,  name: '라우팅 테이블',     system: 'Router-Main',    result: '정상',   date: '04-16' },
  { no: 8,  name: 'BGP 세션 상태',     system: 'Router-Main',    result: '비정상',   date: '04-17' },
];

const GRID = '28px 1fr 120px 70px 60px';

const SortIcon = () => (
  <svg width="7" height="10" viewBox="0 0 7 10" fill="none" className="shrink-0">
    <path d="M3.5 0.5L6.5 4H0.5L3.5 0.5Z" fill="#c0c7ce"/>
    <path d="M3.5 9.5L0.5 6H6.5L3.5 9.5Z" fill="#c0c7ce"/>
  </svg>
);

const W = 300, H = 130, CX = 55, CY = H / 2;

function SummaryChart({ summary, total }) {
  const r = 48, ri = r * 0.56;
  let angle = -Math.PI / 2;
  const slices = summary.map(d => {
    const sweep = (d.count / total) * 2 * Math.PI;
    const toXY = (a, rad) => [CX + rad * Math.cos(a), CY + rad * Math.sin(a)];
    const [x1o, y1o] = toXY(angle, r);
    const [x1i, y1i] = toXY(angle, ri);
    angle += sweep;
    const [x2o, y2o] = toXY(angle, r);
    const [x2i, y2i] = toXY(angle, ri);
    const lg = sweep > Math.PI ? 1 : 0;
    return {
      d: `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${r} ${r} 0 ${lg} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${ri} ${ri} 0 ${lg} 0 ${x1i} ${y1i} Z`,
      color: d.color,
    };
  });
  const LX = CX + 58;
  return (
    <div className="w-full bg-white px-3 pt-3 pb-2 border-b border-[#eaedf1]">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
        <text x={CX} y={CY - 5} fontSize="13" fontWeight="bold" fill="#1a222b" textAnchor="middle">{total}</text>
        <text x={CX} y={CY + 8}  fontSize="8"  fill="#8a9299"   textAnchor="middle">총 건수</text>
        {summary.map((d, i) => {
          const y = CY - 22 + i * 22;
          return (
            <g key={d.label}>
              <circle cx={LX} cy={y} r="5" fill={d.color} />
              <text x={LX + 10} y={y + 4} fontSize="10" fill="#5b646f">{d.label}</text>
              <text x={LX + 60} y={y + 4} fontSize="11" fontWeight="bold" fill="#1a222b" textAnchor="end">{d.count}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function PreviewInspWeeklyList({ showSummary }) {
  const total = ITEMS.length;
  const summary = [
    { label: '정상',   color: '#00bc7d', count: ITEMS.filter(i => i.result === '정상').length },
    { label: '비정상', color: '#fd9a00', count: ITEMS.filter(i => i.result === '비정상').length },
    { label: '실패',   color: '#fb2c36', count: ITEMS.filter(i => i.result === '실패').length },
  ];

  return (
    <div className="w-full bg-white border border-[#e4e8ee] overflow-hidden">
      {showSummary && <SummaryChart summary={summary} total={total} />}
      {/* 요약 */}
      <div className="flex items-center gap-[6px] px-4 h-[32px] bg-[#f8f9fb] border-b border-[#eaedf1]">
        <span className="text-[11px] text-[#9ba4ad]">총 {total}건</span>
        <span className="w-px h-[10px] bg-[#e2e5e9]" />
        {summary.map(s => (
          <div key={s.label} className="flex items-center gap-[4px]">
            <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[11px] text-muted">{s.label}</span>
            <span className="text-[11px] font-semibold" style={{ color: s.color }}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* 테이블 헤더 */}
      <div className="grid items-center bg-[#f8f9fb] border-b border-[#eaedf1] px-4 h-[34px]"
        style={{ gridTemplateColumns: GRID }}>
        {[{ l: '#' }, { l: '점검명' }, { l: '대상 시스템' }, { l: '결과', center: true }, { l: '점검일', right: true }].map(h => (
          <div key={h.l} className={`flex items-center gap-[3px] text-[11px] font-semibold text-[#8a9299]
            ${h.right ? 'justify-end' : h.center ? 'justify-center' : ''}`}>
            {h.l}<SortIcon />
          </div>
        ))}
      </div>

      {/* 바디 */}
      {ITEMS.map((item, i) => {
        const st = RESULT_STYLE[item.result];
        return (
          <div key={item.no} className="grid items-center px-4 h-[34px]"
            style={{
              gridTemplateColumns: GRID,
              borderBottom: i < ITEMS.length - 1 ? '1px solid #f2f4f7' : 'none',
              background: i % 2 === 1 ? '#fafbfc' : '#fff',
            }}>
            <div className="text-[11px] text-[#9ba4ad]">{item.no}</div>
            <div className="text-[12px] text-dark overflow-hidden text-ellipsis whitespace-nowrap pr-2">{item.name}</div>
            <div className="text-[11px] text-muted overflow-hidden text-ellipsis whitespace-nowrap pr-2">{item.system}</div>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full text-[10px] font-semibold whitespace-nowrap"
                style={{ background: st.bg, color: st.text }}>
                <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: st.dot }} />
                {item.result}
              </span>
            </div>
            <div className="text-[11px] text-[#9ba4ad] text-right">{item.date}</div>
          </div>
        );
      })}
    </div>
  );
}
