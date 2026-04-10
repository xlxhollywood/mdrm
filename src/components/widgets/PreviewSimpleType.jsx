import { imgCategories, imgDatacenter, imgDrag1 } from '@/lib/assets';

const IcoServer = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <rect x="0.5" y="0.5" width="9" height="3.5" rx="1" fill="#3571ce" stroke="#3571ce" strokeWidth="0.3"/>
    <rect x="0.5" y="5.5" width="9" height="3.5" rx="1" fill="#3571ce" stroke="#3571ce" strokeWidth="0.3"/>
    <circle cx="7.8" cy="2.25" r="0.7" fill="#fff"/>
    <circle cx="7.8" cy="7.25" r="0.7" fill="#fff"/>
    <rect x="1.5" y="1.7" width="4" height="1" rx="0.4" fill="#fff" opacity="0.7"/>
    <rect x="1.5" y="6.7" width="4" height="1" rx="0.4" fill="#fff" opacity="0.7"/>
  </svg>
);

const IcoNetwork = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <circle cx="5" cy="5" r="1.2" fill="#3571ce"/>
    <circle cx="1.5" cy="2" r="1" fill="#3571ce"/>
    <circle cx="8.5" cy="2" r="1" fill="#3571ce"/>
    <circle cx="1.5" cy="8" r="1" fill="#3571ce"/>
    <circle cx="8.5" cy="8" r="1" fill="#3571ce"/>
    <line x1="5" y1="5" x2="1.5" y2="2" stroke="#3571ce" strokeWidth="0.8"/>
    <line x1="5" y1="5" x2="8.5" y2="2" stroke="#3571ce" strokeWidth="0.8"/>
    <line x1="5" y1="5" x2="1.5" y2="8" stroke="#3571ce" strokeWidth="0.8"/>
    <line x1="5" y1="5" x2="8.5" y2="8" stroke="#3571ce" strokeWidth="0.8"/>
  </svg>
);

const IcoStorage = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <ellipse cx="5" cy="2.2" rx="3.8" ry="1.4" fill="#3571ce"/>
    <rect x="1.2" y="2.2" width="7.6" height="5.2" fill="#3571ce"/>
    <ellipse cx="5" cy="7.4" rx="3.8" ry="1.4" fill="#4a82d4"/>
    <ellipse cx="5" cy="2.2" rx="3.8" ry="1.4" fill="#5590e0"/>
    <ellipse cx="5" cy="4.8" rx="3.8" ry="1.2" fill="#4a82d4" opacity="0.6"/>
  </svg>
);

const rows = [
  { icon: <IcoServer />,  label: '서버',    count: 3 },
  { icon: <IcoNetwork />, label: '네트워크', count: 1 },
  { icon: <IcoStorage />, label: '스토리지', count: 1 },
];

export default function PreviewSimpleType() {
  return (
    <div className="relative w-[274px] h-[153px] bg-white border border-border rounded-[10px] overflow-hidden shrink-0">
      <span className="absolute left-[10px] top-[13px] text-[12px] text-muted leading-5">시스템 유형</span>

      <img src={imgCategories} alt="categories"
        className="absolute left-[21px] top-[42px] w-[82px] h-[82px] object-cover pointer-events-none" />

      <div className="absolute left-[151px] top-[39px] w-[83px] h-[76px]">
        <div className="absolute left-0 top-0 h-4 w-[79px] flex items-center gap-1">
          <img src={imgDatacenter} alt="dc" className="w-[14px] h-[14px] shrink-0" />
          <span className="text-[12px] text-link whitespace-nowrap">Datacenter</span>
        </div>
        <div className="absolute left-[3px] top-6 w-[80px] h-[57px] flex flex-col justify-between">
          {rows.map(r => (
            <div key={r.label} className="flex items-center h-[19px]">
              <span className="w-[10px] h-[10px] shrink-0 flex items-center">{r.icon}</span>
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
