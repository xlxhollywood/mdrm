import { imgDrag1, imgServerBox } from '@/lib/assets';

const rows = [
  { name: 'MDRMMSL-Agent-01', badge: 'Kernel', before: '10.0.14393.0',       after: '10.0.14393.1' },
  { name: '10.110.34.111',    badge: 'OS',     before: 'Windows Server 2016', after: 'Windows Server 2016' },
  { name: '10.110.34.112',    badge: 'OS',     before: '1024 MB',             after: '1024 MB' },
];

export default function PreviewHistorySimple() {
  return (
    <div className="w-[360px] bg-white border border-border rounded-[10px] shrink-0 shadow-[0_1px_4px_rgba(26,34,43,0.08)] p-[13px_14px_14px]">
      <div className="flex items-center justify-between mb-[10px]">
        <span className="text-[12px] text-muted">시스템 변경 이력</span>
        <img src={imgDrag1} alt="drag" className="w-4 h-4 opacity-40 pointer-events-none" />
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <img src={imgServerBox} alt="" className="w-5 h-5 shrink-0" />
            <span className="text-[12px] text-dark font-medium w-[110px] overflow-hidden text-ellipsis whitespace-nowrap shrink-0">
              {r.name}
            </span>
            <span className="text-[11px] font-semibold text-white bg-link rounded px-[7px] py-[1px] shrink-0">
              {r.badge}
            </span>
            <span className="text-[11px] text-muted overflow-hidden text-ellipsis whitespace-nowrap flex-1">
              {r.before}
            </span>
            <span className="text-[11px] text-link font-bold shrink-0">››</span>
            <span className="text-[11px] text-muted overflow-hidden text-ellipsis whitespace-nowrap flex-1">
              {r.after}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
