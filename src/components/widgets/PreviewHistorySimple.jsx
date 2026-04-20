import { imgServerBox } from '@/lib/assets';

const rows = [
  { name: 'MDRMMSL-Agent-01', badge: 'Kernel', before: '10.0.14393.0',       after: '10.0.14393.1' },
  { name: '10.110.34.111',    badge: 'OS',     before: 'Windows Server 2016', after: 'Windows Server 2016' },
  { name: '10.110.34.112',    badge: 'OS',     before: '1024 MB',             after: '1024 MB' },
];

export default function PreviewHistorySimple() {
  return (
    <div className="w-full bg-white p-[13px_14px_14px]">
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
