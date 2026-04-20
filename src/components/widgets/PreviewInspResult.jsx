
const GRID = '130px 1fr 72px 72px 80px';

const SortIcon = () => (
  <svg width="7" height="10" viewBox="0 0 7 10" fill="none" className="shrink-0">
    <path d="M3.5 0.5L6.5 4H0.5L3.5 0.5Z" fill="#c0c7ce"/>
    <path d="M3.5 9.5L0.5 6H6.5L3.5 9.5Z" fill="#c0c7ce"/>
  </svg>
);

const RESULT_STYLE = {
  '정상':   { bg: '#edfaf4', text: '#00a36a', dot: '#00bc7d' },
  '경고':   { bg: '#fff8ec', text: '#c97a00', dot: '#fd9a00' },
  '불합격': { bg: '#fff0f1', text: '#d0202a', dot: '#fb2c36' },
};

const SYSTEMS = [
  {
    name: 'MDRM-Web-01',
    items: [
      { name: 'CPU 사용률',    value: '23 %',  result: '정상',   date: '26-04-19' },
      { name: '메모리 사용률', value: '87 %',  result: '경고',   date: '26-04-19' },
      { name: '디스크 여유',   value: '67 GB', result: '정상',   date: '26-04-19' },
    ],
  },
  {
    name: 'MDRM-DB-01',
    items: [
      { name: 'DB 연결 상태',  value: 'OK',    result: '정상',   date: '26-04-19' },
      { name: '쿼리 응답시간', value: '8.2 s', result: '불합격', date: '26-04-19' },
    ],
  },
  {
    name: 'Switch-Core-01',
    items: [
      { name: '포트 상태',     value: '24/24', result: '정상',   date: '26-04-18' },
    ],
  },
  {
    name: 'Router-Main',
    items: [
      { name: '라우팅 테이블', value: '512',   result: '정상',   date: '26-04-18' },
      { name: 'BGP 세션',      value: '2/3',   result: '경고',   date: '26-04-18' },
    ],
  },
];

const allItems = SYSTEMS.flatMap(s => s.items);
const SUMMARY = [
  { label: '정상',   count: allItems.filter(i => i.result === '정상').length,   color: '#00bc7d' },
  { label: '경고',   count: allItems.filter(i => i.result === '경고').length,   color: '#fd9a00' },
  { label: '불합격', count: allItems.filter(i => i.result === '불합격').length, color: '#fb2c36' },
];

const HEADERS = [
  { label: '시스템' },
  { label: '점검 항목' },
  { label: '측정값' },
  { label: '결과' },
  { label: '점검일시', right: true },
];

export default function PreviewInspResult() {
  const rows = [];
  SYSTEMS.forEach((sys, sIdx) => {
    sys.items.forEach((item, iIdx) => {
      rows.push({
        sysName:       iIdx === 0 ? sys.name : null,
        isFirst:       iIdx === 0,
        isLastInGroup: iIdx === sys.items.length - 1,
        isLastSys:     sIdx === SYSTEMS.length - 1,
        item,
      });
    });
  });

  return (
    <div className="w-full bg-white">
      {/* 요약 + 테이블 — 하나의 외곽선 컨테이너 */}
      <div className="border-t border-x border-b border-[#e4e8ee] overflow-hidden">
          {/* 요약 배지 */}
          <div className="flex items-center gap-[6px] px-4 h-[32px] bg-[#f8f9fb] border-b border-[#eaedf1]">
            <span className="text-[11px] text-[#9ba4ad]">총 {allItems.length}건</span>
            <span className="w-px h-[10px] bg-[#e2e5e9]" />
            {SUMMARY.map(s => (
              <div key={s.label} className="flex items-center gap-[4px]">
                <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-[11px] text-muted">{s.label}</span>
                <span className="text-[11px] font-semibold" style={{ color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>

          {/* 테이블 헤더 */}
          <div
            className="grid items-center bg-[#f8f9fb] border-b border-[#eaedf1] px-4 h-[34px]"
            style={{ gridTemplateColumns: GRID }}
          >
            {HEADERS.map(h => (
              <div
                key={h.label}
                className="flex items-center gap-[3px] text-[11px] font-semibold text-[#8a9299] tracking-[0.02em]"
                style={{ justifyContent: h.right ? 'flex-end' : 'flex-start' }}
              >
                {h.label}<SortIcon />
              </div>
            ))}
          </div>

          {/* 데이터 행 */}
          {rows.map((row, i) => {
            const st = RESULT_STYLE[row.item.result] ?? RESULT_STYLE['정상'];
            const isEven = i % 2 === 1;
            const borderStyle = row.isLastInGroup && !row.isLastSys
              ? '1px solid #dde1e7'
              : (!row.isLastInGroup || !row.isLastSys) ? '1px solid #f2f4f7' : 'none';

            return (
              <div
                key={i}
                className="grid items-center px-4 h-[34px]"
                style={{
                  gridTemplateColumns: GRID,
                  borderBottom: borderStyle,
                  background: isEven ? '#fafbfc' : '#fff',
                }}
              >
                <div className="flex items-center gap-[5px] overflow-hidden pr-2">
                  {row.isFirst && (
                    <>
                      <span className="w-[6px] h-[6px] rounded-full shrink-0 bg-[#c5d0db]" />
                      <span className="text-[11px] font-medium text-[#3d5068] overflow-hidden text-ellipsis whitespace-nowrap">
                        {row.sysName}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-[12px] text-dark overflow-hidden text-ellipsis whitespace-nowrap pr-2">{row.item.name}</div>
                <div className="text-[12px] text-muted whitespace-nowrap">{row.item.value}</div>
                <div>
                  <span
                    className="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full text-[10px] font-semibold whitespace-nowrap"
                    style={{ background: st.bg, color: st.text }}
                  >
                    <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: st.dot }} />
                    {row.item.result}
                  </span>
                </div>
                <div className="text-[11px] text-[#9ba4ad] text-right whitespace-nowrap">{row.item.date}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
