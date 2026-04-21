const RESULT_STYLE = {
  '정상':   { bg: '#edfaf4', text: '#00a36a', dot: '#00bc7d' },
  '비정상': { bg: '#fff8ec', text: '#c97a00', dot: '#fd9a00' },
  '실패':   { bg: '#fff0f1', text: '#d0202a', dot: '#fb2c36' },
};

const HEADERS = ['#', '점검명', '대상 시스템', '결과', '점검일'];

const ROWS = [
  ['1', 'CPU 사용률 점검',  'MDRM-Web-01',    '정상',   '04-14'],
  ['2', '메모리 사용률',    'MDRM-Web-01',    '비정상', '04-14'],
  ['3', '디스크 여유 공간', 'MDRM-Web-01',    '정상',   '04-14'],
  ['4', 'DB 연결 상태',     'MDRM-DB-01',     '정상',   '04-15'],
  ['5', '쿼리 응답시간',    'MDRM-DB-01',     '실패',   '04-15'],
  ['6', '포트 상태 점검',   'Switch-Core-01', '정상',   '04-16'],
  ['7', '라우팅 테이블',    'Router-Main',    '정상',   '04-16'],
  ['8', 'BGP 세션 상태',    'Router-Main',    '비정상', '04-17'],
];

// 결과 컬럼(인덱스 3)만 뱃지 렌더링
function CellContent({ value, colIdx }) {
  if (colIdx === 3 && RESULT_STYLE[value]) {
    const st = RESULT_STYLE[value];
    return (
      <span className="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full text-[10px] font-semibold whitespace-nowrap"
        style={{ background: st.bg, color: st.text }}>
        <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: st.dot }} />
        {value}
      </span>
    );
  }
  return <span>{value}</span>;
}

export default function PreviewInspWeeklyListTable({ headerRow = true, headerCol = false }) {
  return (
    <div className="w-full bg-white overflow-x-auto">
      <table className="border-collapse w-full" style={{ tableLayout: 'auto' }}>
        <tbody>
          {/* 헤더 행 */}
          {headerRow && (
            <tr>
              {HEADERS.map((h, c) => {
                const isHeader = headerRow || (headerCol && c === 0);
                return (
                  <td key={c}
                    className="border border-[#d9dfe5] px-2 py-1 text-[13px] font-semibold whitespace-nowrap"
                    style={{ background: '#f5f5f5', color: '#1a222b' }}>
                    {h}
                  </td>
                );
              })}
            </tr>
          )}

          {/* 데이터 행 */}
          {ROWS.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                const isHeader = (headerCol && c === 0);
                return (
                  <td key={c}
                    className={`border border-[#d9dfe5] px-2 py-1 text-[13px] whitespace-nowrap
                      ${isHeader ? 'font-semibold' : ''}`}
                    style={{ background: isHeader ? '#f5f5f5' : '#ffffff', color: '#1a222b' }}>
                    <CellContent value={cell} colIdx={c} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
