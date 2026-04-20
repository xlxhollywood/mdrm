import { imgServerBox } from '@/lib/assets';

const GRID = '26px 1fr 1fr 1fr 1fr 72px';

const rows = [
  { name: 'MDRMMSL-Agent-01', item: 'Kernel',       before: '10.0.14393.0',            after: '10.0.14393.1',            date: '25-08-19' },
  { name: '10.110.34.111',    item: 'OS',            before: 'Windows Server 2016 Std', after: 'Windows Server 2016 Std', date: '25-11-04' },
  { name: '10.110.34.112',    item: 'Memory size',   before: '2048 MB',                 after: '2048 MB',                 date: '25-11-07' },
  { name: '10.110.98.11',     item: 'Product name',  before: 'VMware Virtual Platform', after: 'VMware Virtual Platform', date: '26-03-03' },
  { name: '10.120.30.91',     item: 'System vendor', before: 'Unknown',                 after: '-',                       date: '26-03-06' },
  { name: 'Switch-Core-01',   item: 'FQDN',          before: 'Cisco IOS',               after: 'SNMP',                    date: '26-02-15' },
  { name: 'Router-Main',      item: 'Kernel',        before: 'Juniper Junos',           after: 'SNMP',                    date: '26-01-20' },
];

const SortIcon = () => (
  <svg width="7" height="10" viewBox="0 0 7 10" fill="none" className="shrink-0">
    <path d="M3.5 0.5L6.5 4H0.5L3.5 0.5Z" fill="#c0c7ce"/>
    <path d="M3.5 9.5L0.5 6H6.5L3.5 9.5Z" fill="#c0c7ce"/>
  </svg>
);

const headers = [
  { label: '이름',         ml: -20 },
  { label: '변경 구성 항목' },
  { label: '변경 전' },
  { label: '변경 후' },
  { label: '생성일자',     right: true },
];

export default function PreviewHistoryTable() {
  return (
    <div className="w-full bg-white border border-[#e4e8ee] overflow-hidden">
        {/* 헤더 */}
        <div
          className="grid items-center bg-[#f8f9fb] border-b border-[#eaedf1] px-4 h-[34px]"
          style={{ gridTemplateColumns: GRID }}
        >
          <div />
          {headers.map(c => (
            <div
              key={c.label}
              className="flex items-center gap-[3px] text-[11px] font-semibold text-[#8a9299] tracking-[0.02em] overflow-hidden"
              style={{
                justifyContent: c.right ? 'flex-end' : 'flex-start',
                marginLeft: c.ml || 0,
              }}
            >
              {c.label}<SortIcon />
            </div>
          ))}
        </div>

        {/* 바디 */}
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid items-center px-4 h-[36px]"
            style={{
              gridTemplateColumns: GRID,
              borderBottom: i < rows.length - 1 ? '1px solid #f2f4f7' : 'none',
              background: i % 2 === 1 ? '#fafbfc' : '#fff',
            }}
          >
            <div className="flex items-center">
              <img src={imgServerBox} alt="" className="w-4 h-4" />
            </div>
            <div className="text-[12px] text-link overflow-hidden text-ellipsis whitespace-nowrap pr-2">{r.name}</div>
            <div className="text-[12px] text-dark overflow-hidden text-ellipsis whitespace-nowrap pr-2">{r.item}</div>
            <div className="text-[12px] text-muted overflow-hidden text-ellipsis whitespace-nowrap pr-2">{r.before}</div>
            <div className="text-[12px] text-muted overflow-hidden text-ellipsis whitespace-nowrap pr-2">{r.after}</div>
            <div className="text-[12px] text-[#9ba4ad] text-right whitespace-nowrap">{r.date}</div>
          </div>
        ))}
    </div>
  );
}
