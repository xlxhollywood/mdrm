const GRID = '76px 110px 1fr 70px 70px';

const SortIcon = () => (
  <svg width="7" height="10" viewBox="0 0 7 10" fill="none" className="shrink-0">
    <path d="M3.5 0.5L6.5 4H0.5L3.5 0.5Z" fill="#c0c7ce"/>
    <path d="M3.5 9.5L0.5 6H6.5L3.5 9.5Z" fill="#c0c7ce"/>
  </svg>
);

const RESULT_STYLE = {
  '정상':   { bg: '#edfaf4', text: '#00a36a', dot: '#00bc7d' },
  '비정상':   { bg: '#fff8ec', text: '#c97a00', dot: '#fd9a00' },
  '실패': { bg: '#fff0f1', text: '#d0202a', dot: '#fb2c36' },
};

/* 기간 내 반복 점검 데이터 — 날짜별 3회 실행 */
const RUNS = [
  {
    date: '26-04-01',
    items: [
      { system: 'MDRM-Web-01', name: 'CPU 사용률',    value: '18 %',  result: '정상' },
      { system: 'MDRM-Web-01', name: '메모리 사용률', value: '72 %',  result: '정상' },
      { system: 'MDRM-DB-01',  name: 'DB 연결 상태',  value: 'OK',    result: '정상' },
      { system: 'MDRM-DB-01',  name: '쿼리 응답시간', value: '1.2 s', result: '정상' },
    ],
  },
  {
    date: '26-04-08',
    items: [
      { system: 'MDRM-Web-01', name: 'CPU 사용률',    value: '45 %',  result: '비정상' },
      { system: 'MDRM-Web-01', name: '메모리 사용률', value: '87 %',  result: '비정상' },
      { system: 'MDRM-DB-01',  name: 'DB 연결 상태',  value: 'OK',    result: '정상' },
      { system: 'MDRM-DB-01',  name: '쿼리 응답시간', value: '8.2 s', result: '실패' },
    ],
  },
  {
    date: '26-04-15',
    items: [
      { system: 'MDRM-Web-01', name: 'CPU 사용률',    value: '22 %',  result: '정상' },
      { system: 'MDRM-Web-01', name: '메모리 사용률', value: '68 %',  result: '정상' },
      { system: 'MDRM-DB-01',  name: 'DB 연결 상태',  value: 'OK',    result: '정상' },
      { system: 'MDRM-DB-01',  name: '쿼리 응답시간', value: '3.1 s', result: '정상' },
    ],
  },
];

const allItems = RUNS.flatMap(r => r.items);
const SUMMARY = [
  { label: '정상',   color: '#00bc7d', count: allItems.filter(i => i.result === '정상').length },
  { label: '비정상',   color: '#fd9a00', count: allItems.filter(i => i.result === '비정상').length },
  { label: '실패', color: '#fb2c36', count: allItems.filter(i => i.result === '실패').length },
];

const HEADERS = [
  { label: '점검일' },
  { label: '시스템' },
  { label: '점검 항목' },
  { label: '측정값' },
  { label: '결과', right: true },
];

export default function PreviewInspResult() {
  /* 날짜 그룹별 행 목록 생성 */
  const rows = [];
  RUNS.forEach((run, rIdx) => {
    run.items.forEach((item, iIdx) => {
      rows.push({
        date:          iIdx === 0 ? run.date : null,
        isFirstInRun:  iIdx === 0,
        isLastInRun:   iIdx === run.items.length - 1,
        isLastRun:     rIdx === RUNS.length - 1,
        item,
      });
    });
  });

  return (
    <div className="w-full bg-white border border-[#e4e8ee] overflow-hidden">
      {/* 요약 배지 */}
      <div className="flex items-center gap-[6px] px-4 h-[32px] bg-[#f8f9fb] border-b border-[#eaedf1]">
        <span className="text-[11px] text-[#9ba4ad]">총 {RUNS.length}회 점검 · {allItems.length}건</span>
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
        const borderStyle = row.isLastInRun && !row.isLastRun
          ? '1px solid #dde1e7'
          : (!row.isLastInRun || !row.isLastRun) ? '1px solid #f2f4f7' : 'none';

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
            {/* 점검일 — 그룹 첫 행만 */}
            <div className="text-[11px] text-[#8a9299] whitespace-nowrap">
              {row.date ?? ''}
            </div>
            {/* 시스템 */}
            <div className="text-[11px] font-medium text-[#3d5068] overflow-hidden text-ellipsis whitespace-nowrap pr-2">
              {row.item.system}
            </div>
            {/* 점검 항목 */}
            <div className="text-[12px] text-dark overflow-hidden text-ellipsis whitespace-nowrap pr-2">
              {row.item.name}
            </div>
            {/* 측정값 */}
            <div className="text-[12px] text-muted whitespace-nowrap">
              {row.item.value}
            </div>
            {/* 결과 */}
            <div className="flex justify-end">
              <span
                className="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full text-[10px] font-semibold whitespace-nowrap"
                style={{ background: st.bg, color: st.text }}
              >
                <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: st.dot }} />
                {row.item.result}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
