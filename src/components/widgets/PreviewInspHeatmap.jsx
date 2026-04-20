const DAYS = ['월(14)', '화(15)', '수(16)', '목(17)', '금(18)'];

const CELL = {
  '정상':   { bg: '#edfaf4', text: '#00a36a', label: '정' },
  '경고':   { bg: '#fff8ec', text: '#c97a00', label: '경' },
  '불합격': { bg: '#fff0f1', text: '#d0202a', label: '불' },
  '-':      { bg: '#f5f6f8', text: '#c0c7ce', label: '-'  },
};

const SYSTEMS = [
  { name: 'MDRM-Web-01',    results: ['정상', '경고',   '정상',   '정상',   '정상'  ] },
  { name: 'MDRM-DB-01',     results: ['정상', '불합격', '정상',   '-',      '정상'  ] },
  { name: 'Switch-Core-01', results: ['-',    '정상',   '-',      '정상',   '-'     ] },
  { name: 'Router-Main',    results: ['-',    '정상',   '경고',   '-',      '정상'  ] },
  { name: 'Storage-01',     results: ['-',    '-',      '-',      '-',      '-'     ] },
];

/* 컬럼 너비: 시스템명 + 5일 */
const GRID = `100px repeat(5, 1fr)`;

export default function PreviewInspHeatmap() {
  return (
    <div className="w-full bg-white border border-[#e4e8ee] overflow-hidden">
      {/* 헤더 */}
      <div className="grid items-center bg-[#f8f9fb] border-b border-[#eaedf1] px-3 h-[32px]"
        style={{ gridTemplateColumns: GRID }}>
        <div className="text-[11px] font-semibold text-[#8a9299]">시스템</div>
        {DAYS.map(d => (
          <div key={d} className="text-[10px] font-semibold text-[#8a9299] text-center">{d}</div>
        ))}
      </div>

      {/* 바디 */}
      {SYSTEMS.map((sys, i) => (
        <div key={sys.name} className="grid items-center px-3 h-[38px]"
          style={{
            gridTemplateColumns: GRID,
            borderBottom: i < SYSTEMS.length - 1 ? '1px solid #f2f4f7' : 'none',
            background: i % 2 === 1 ? '#fafbfc' : '#fff',
          }}>
          <div className="text-[11px] font-medium text-[#3d5068] overflow-hidden text-ellipsis whitespace-nowrap pr-2">
            {sys.name}
          </div>
          {sys.results.map((r, j) => {
            const c = CELL[r];
            return (
              <div key={j} className="flex justify-center">
                <div className="w-[28px] h-[22px] rounded flex items-center justify-center text-[10px] font-semibold"
                  style={{ background: c.bg, color: c.text }}>
                  {r === '-' ? <span className="text-[#c0c7ce]">–</span> : c.label}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* 범례 */}
      <div className="flex items-center gap-3 px-3 h-[30px] bg-[#fafbfc] border-t border-[#f2f4f7]">
        {Object.entries(CELL).filter(([k]) => k !== '-').map(([k, v]) => (
          <div key={k} className="flex items-center gap-[4px]">
            <div className="w-[14px] h-[12px] rounded text-[8px] flex items-center justify-center font-semibold"
              style={{ background: v.bg, color: v.text }}>{v.label}</div>
            <span className="text-[10px] text-muted">{k}</span>
          </div>
        ))}
        <div className="flex items-center gap-[4px]">
          <div className="w-[14px] h-[12px] rounded flex items-center justify-center"
            style={{ background: CELL['-'].bg }}>
            <span className="text-[10px]" style={{ color: CELL['-'].text }}>–</span>
          </div>
          <span className="text-[10px] text-muted">미실시</span>
        </div>
      </div>
    </div>
  );
}
