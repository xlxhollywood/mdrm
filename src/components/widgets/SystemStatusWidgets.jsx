import { imgDatacenter, imgDrag1, imgIconOk, imgIconWarn, imgIconOffline, imgStatus1 } from '@/lib/assets';

/* ── 공통 데이터 ── */
const DATA = [
  { label: '정상',    count: 3, color: '#00bc7d', icon: imgIconOk },
  { label: '경고',    count: 1, color: '#fd9a00', icon: imgIconWarn },
  { label: '오프라인', count: 1, color: '#fb2c36', icon: imgIconOffline },
];
const TOTAL = DATA.reduce((s, d) => s + d.count, 0);

/* ── 공통 우측 범례 ── */
function Legend({ rows }) {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-1 mb-[10px]">
        <img src={imgDatacenter} alt="dc" className="w-[14px] h-[14px] shrink-0" />
        <span className="text-[12px] text-link whitespace-nowrap">Datacenter</span>
      </div>
      <div className="flex flex-col gap-[7px]">
        {rows.map(r => (
          <div key={r.label} className="flex items-center gap-2 h-[18px]">
            <span className="w-[10px] h-[10px] shrink-0 flex items-center justify-center">
              {r.icon
                ? <img src={r.icon} alt={r.label} className="w-[10px] h-[10px]" />
                : <span className="w-[8px] h-[8px] rounded-full block" style={{ background: r.color }} />}
            </span>
            <span className="text-[10px] text-muted flex-1">{r.label}</span>
            <span className="text-[10px] font-semibold text-dark">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 공통 카드 래퍼 ── */
function StatusCard({ chart, legendRows }) {
  return (
    <div className="w-[274px] h-[153px] bg-white border border-border rounded-[10px] overflow-hidden shrink-0 relative">
      <div className="absolute left-[10px] top-[13px] right-[32px]">
        <span className="text-[12px] text-muted">시스템 상태</span>
      </div>
      <img src={imgDrag1} alt="drag"
        className="absolute right-2 top-3 w-4 h-4 pointer-events-none opacity-40" />
      <div className="absolute left-0 right-10 top-[28px] bottom-0 flex items-center px-[14px] gap-[14px]">
        <div className="w-[100px] flex items-center justify-center shrink-0">
          {chart}
        </div>
        <div className="flex-1">
          <Legend rows={legendRows} />
        </div>
      </div>
    </div>
  );
}

/* ── 파이 차트 ── */
function PieChart({ size = 96 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 1;
  let angle = -Math.PI / 2;
  const slices = DATA.map(d => {
    const sweep = (d.count / TOTAL) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`,
      color: d.color,
    };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
    </svg>
  );
}

/* ── Export: 세 variant ── */
export function PreviewSimpleStatus() {
  return (
    <div className="w-[274px] h-[153px] bg-white border border-border rounded-[10px] overflow-hidden shrink-0 relative">
      <div className="absolute left-[10px] top-[13px] right-[32px]">
        <span className="text-[12px] text-muted">시스템 상태</span>
      </div>
      <img src={imgDrag1} alt="drag"
        className="absolute right-2 top-3 w-4 h-4 pointer-events-none opacity-40" />
      <div className="absolute left-0 right-10 top-[28px] bottom-0 flex items-center px-[14px] gap-[14px]">
        <div className="w-[100px] flex items-center justify-center shrink-0">
          <img src={imgStatus1} alt="status"
            className="w-[96px] h-[96px] object-contain pointer-events-none" />
        </div>
        <div className="flex-1">
          <Legend rows={DATA} />
        </div>
      </div>
    </div>
  );
}

export function PreviewDonutStatus() {
  return (
    <StatusCard
      chart={<PieChart size={96} />}
      legendRows={DATA.map(d => ({ ...d, icon: null }))}
    />
  );
}

export function PreviewBarStatus() {
  return (
    <div className="relative w-[298px] h-[124px] bg-white border border-border rounded-[10px] overflow-hidden shrink-0">
      <span className="absolute left-[10px] top-[13px] text-[12px] text-muted">시스템 상태</span>
      <img src={imgDrag1} alt="drag"
        className="absolute right-2 top-3 w-4 h-4 pointer-events-none opacity-40" />

      <div className="absolute left-0 right-0 top-[34px] flex items-center justify-center gap-1">
        <img src={imgDatacenter} alt="dc" className="w-[14px] h-[14px] shrink-0" />
        <span className="text-[12px] text-link">Datacenter</span>
      </div>

      <div className="absolute left-[12px] right-[12px] top-[56px] h-[22px] rounded-full overflow-hidden flex">
        {DATA.map((d, i) => (
          <div
            key={d.label}
            style={{
              width: `${(d.count / TOTAL) * 100}%`,
              background: d.color,
              borderRadius: i === 0 ? '9999px 0 0 9999px' : i === DATA.length - 1 ? '0 9999px 9999px 0' : '0',
            }}
          />
        ))}
      </div>

      <div className="absolute left-0 right-0 bottom-[12px] flex items-center justify-center gap-4">
        {DATA.map(d => (
          <div key={d.label} className="flex items-center gap-1">
            <span className="w-[8px] h-[8px] rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-[11px] text-muted">{d.label}</span>
            <span className="text-[11px] font-semibold text-dark ml-0.5">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
