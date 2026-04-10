import { imgStatus1, imgDatacenter, imgDrag1, imgIconOk, imgIconWarn, imgIconOffline } from '@/lib/assets';

const rows = [
  { icon: imgIconOk,      label: '정상',    count: 3 },
  { icon: imgIconWarn,    label: '경고',    count: 1 },
  { icon: imgIconOffline, label: '오프라인', count: 1 },
];

export default function PreviewSimple() {
  return (
    <div className="relative w-[274px] h-[153px] bg-white border border-border rounded-[10px] overflow-hidden shrink-0">
      <span className="absolute left-[10px] top-[13px] text-[12px] text-muted leading-5">시스템 상태</span>

      <img src={imgStatus1} alt="status"
        className="absolute left-[10px] top-[29px] w-[108px] h-[108px] object-cover pointer-events-none" />

      <div className="absolute left-[151px] top-[39px] w-[83px] h-[76px]">
        <div className="absolute left-0 top-0 h-4 w-[79px] flex items-center gap-1">
          <img src={imgDatacenter} alt="dc" className="w-[14px] h-[14px] shrink-0" />
          <span className="text-[12px] text-link whitespace-nowrap">Datacenter</span>
        </div>
        <div className="absolute left-[3px] top-6 w-[80px] h-[57px] flex flex-col justify-between">
          {rows.map(r => (
            <div key={r.label} className="flex items-center h-[19px]">
              <img src={r.icon} alt={r.label} className="w-[10px] h-[10px] shrink-0" />
              <span className="ml-2 text-[10px] text-muted flex-1">{r.label}</span>
              <span className="text-[10px] font-semibold text-dark">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      <img src={imgDrag1} alt="drag"
        className="absolute right-2 top-3 w-4 h-4 pointer-events-none opacity-40" />
    </div>
  );
}
