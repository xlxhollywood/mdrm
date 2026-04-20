const STATUS = {
  '완료':   { color: '#00bc7d', bg: '#edfaf4', dot: '#00bc7d' },
  '경고':   { color: '#c97a00', bg: '#fff8ec', dot: '#fd9a00' },
  '실패':   { color: '#d0202a', bg: '#fff0f1', dot: '#fb2c36' },
  '미실시': { color: '#8a9299', bg: '#f4f6f8', dot: '#c0c7ce' },
};

const SYSTEMS = [
  { name: 'MDRM-Web-01',   ip: '10.110.34.111', type: 'Server',  count: 3, status: '완료'   },
  { name: 'MDRM-DB-01',    ip: '10.110.34.112', type: 'Server',  count: 2, status: '경고'   },
  { name: 'Switch-Core-01',ip: '10.110.98.11',  type: 'Network', count: 1, status: '완료'   },
  { name: 'Router-Main',   ip: '10.120.30.91',  type: 'Network', count: 1, status: '실패'   },
  { name: 'Storage-01',    ip: '10.110.99.10',  type: 'Storage', count: 2, status: '미실시' },
];

const GRID = '1fr 108px 64px 48px 64px';

export default function PreviewInspSysList() {
  return (
    <div className="w-full bg-white border border-[#e4e8ee] overflow-hidden">
      {/* 헤더 */}
      <div className="grid items-center bg-[#f8f9fb] border-b border-[#eaedf1] px-4 h-[34px]"
        style={{ gridTemplateColumns: GRID }}>
        {['시스템명', 'IP 주소', '유형', '점검 수', '상태'].map((h, i) => (
          <div key={h} className={`text-[11px] font-semibold text-[#8a9299] ${i >= 2 ? 'text-center' : ''}`}>{h}</div>
        ))}
      </div>
      {/* 바디 */}
      {SYSTEMS.map((s, i) => {
        const st = STATUS[s.status];
        return (
          <div key={s.name} className="grid items-center px-4 h-[36px]"
            style={{
              gridTemplateColumns: GRID,
              borderBottom: i < SYSTEMS.length - 1 ? '1px solid #f2f4f7' : 'none',
              background: i % 2 === 1 ? '#fafbfc' : '#fff',
            }}>
            <div className="text-[12px] font-medium text-link overflow-hidden text-ellipsis whitespace-nowrap pr-2">{s.name}</div>
            <div className="text-[11px] text-muted font-mono">{s.ip}</div>
            <div className="text-[11px] text-[#5b646f] text-center">{s.type}</div>
            <div className="text-[12px] font-semibold text-dark text-center">{s.count}</div>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full text-[10px] font-semibold whitespace-nowrap"
                style={{ background: st.bg, color: st.color }}>
                <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: st.dot }} />
                {s.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
