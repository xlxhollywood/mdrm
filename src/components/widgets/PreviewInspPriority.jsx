const PRIORITY = {
  '높음': { color: '#d0202a', bg: '#fff0f1', dot: '#fb2c36' },
  '중간': { color: '#c97a00', bg: '#fff8ec', dot: '#fd9a00' },
  '낮음': { color: '#1d7a4a', bg: '#edfaf4', dot: '#00bc7d' },
};

const RESULT_STYLE = {
  '정상':   { color: '#00a36a', bg: '#edfaf4', dot: '#00bc7d' },
  '비정상':   { color: '#c97a00', bg: '#fff8ec', dot: '#fd9a00' },
  '실패': { color: '#d0202a', bg: '#fff0f1', dot: '#fb2c36' },
  '미실시': { color: '#8a9299', bg: '#f4f6f8', dot: '#c0c7ce' },
};

const ITEMS = [
  { priority: '높음', name: '쿼리 응답시간 점검',   system: 'MDRM-DB-01',     result: '실패' },
  { priority: '높음', name: 'BGP 세션 상태',         system: 'Router-Main',    result: '비정상'   },
  { priority: '중간', name: '메모리 사용률 점검',    system: 'MDRM-Web-01',    result: '비정상'   },
  { priority: '중간', name: '라우팅 테이블 확인',    system: 'Router-Main',    result: '정상'   },
  { priority: '낮음', name: 'CPU 사용률 점검',       system: 'MDRM-Web-01',    result: '정상'   },
  { priority: '낮음', name: '포트 상태 점검',        system: 'Switch-Core-01', result: '정상'   },
  { priority: '낮음', name: '스토리지 용량 확인',    system: 'Storage-01',     result: '미실시' },
];

export default function PreviewInspPriority() {
  return (
    <div className="w-full bg-white border border-[#e4e8ee] overflow-hidden">
      {/* 헤더 */}
      <div className="grid items-center bg-[#f8f9fb] border-b border-[#eaedf1] px-4 h-[34px]"
        style={{ gridTemplateColumns: '56px 1fr 110px 70px' }}>
        {['우선순위', '점검 항목', '대상 시스템', '결과'].map((h, i) => (
          <div key={h} className={`text-[11px] font-semibold text-[#8a9299] ${i === 3 ? 'text-center' : ''}`}>{h}</div>
        ))}
      </div>

      {/* 바디 */}
      {ITEMS.map((item, i) => {
        const ps = PRIORITY[item.priority];
        const rs = RESULT_STYLE[item.result];
        return (
          <div key={i} className="grid items-center px-4 h-[36px]"
            style={{
              gridTemplateColumns: '56px 1fr 110px 70px',
              borderBottom: i < ITEMS.length - 1 ? '1px solid #f2f4f7' : 'none',
              background: i % 2 === 1 ? '#fafbfc' : '#fff',
            }}>
            <div>
              <span className="inline-flex items-center gap-[3px] px-[6px] py-[2px] rounded-full text-[9px] font-semibold"
                style={{ background: ps.bg, color: ps.color }}>
                <span className="w-[4px] h-[4px] rounded-full shrink-0" style={{ background: ps.dot }} />
                {item.priority}
              </span>
            </div>
            <div className="text-[12px] text-dark overflow-hidden text-ellipsis whitespace-nowrap pr-2">{item.name}</div>
            <div className="text-[11px] text-muted overflow-hidden text-ellipsis whitespace-nowrap pr-2">{item.system}</div>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-[3px] px-[6px] py-[2px] rounded-full text-[9px] font-semibold"
                style={{ background: rs.bg, color: rs.color }}>
                <span className="w-[4px] h-[4px] rounded-full shrink-0" style={{ background: rs.dot }} />
                {item.result}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
