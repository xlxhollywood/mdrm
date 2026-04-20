import { imgDatacenter, imgIconOk, imgIconWarn, imgIconOffline, imgStatus1 } from '@/lib/assets';

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
      <div className="flex items-center gap-1.5 mb-[12px]">
        <img src={imgDatacenter} alt="dc" className="w-[16px] h-[16px] shrink-0" />
        <span className="text-[13px] text-link whitespace-nowrap">Datacenter</span>
      </div>
      <div className="flex flex-col gap-[10px]">
        {rows.map(r => (
          <div key={r.label} className="flex items-center gap-2 h-[20px]">
            <span className="w-[14px] h-[14px] shrink-0 flex items-center justify-center">
              {r.icon
                ? <img src={r.icon} alt={r.label} className="w-[14px] h-[14px]" />
                : <span className="w-[10px] h-[10px] rounded-full block" style={{ background: r.color }} />}
            </span>
            <span className="text-[12px] text-muted flex-1">{r.label}</span>
            <span className="text-[13px] font-bold text-dark">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 공통 카드 래퍼 ── */
function StatusCard({ chart, legendRows, showBorder = true, showLabel = true }) {
  return (
    <div className={`w-full h-[180px] bg-white overflow-hidden shrink-0 relative ${showBorder ? 'border border-border rounded-[10px]' : ''}`}>
      <div className={`absolute left-[12px] top-[14px] right-[12px] ${showLabel ? '' : 'invisible'}`}>
        <span className="text-[12px] text-muted">시스템 상태</span>
      </div>
      <div className="absolute left-0 right-0 top-[34px] bottom-0 flex items-center px-[16px] gap-[16px]">
        <div className="w-[120px] flex items-center justify-center shrink-0">
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
function PieChart({ size = 116 }) {
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
export function PreviewSimpleStatus({ showBorder = true, showLabel = true }) {
  return (
    <div className={`w-full h-[180px] bg-white overflow-hidden shrink-0 relative ${showBorder ? 'border border-border rounded-[10px]' : ''}`}>
      <div className={`absolute left-[12px] top-[14px] right-[12px] ${showLabel ? '' : 'invisible'}`}>
        <span className="text-[12px] text-muted">시스템 상태</span>
      </div>
      <div className="absolute left-0 right-0 top-[34px] bottom-0 flex items-center px-[16px] gap-[16px]">
        <div className="w-[120px] flex items-center justify-center shrink-0">
          <img src={imgStatus1} alt="status"
            className="w-[112px] h-[112px] object-contain pointer-events-none" />
        </div>
        <div className="flex-1">
          <Legend rows={DATA} />
        </div>
      </div>
    </div>
  );
}

export function PreviewDonutStatus({ showBorder = true, showLabel = true }) {
  return (
    <StatusCard
      chart={<PieChart size={116} />}
      legendRows={DATA.map(d => ({ ...d, icon: null }))}
      showBorder={showBorder}
      showLabel={showLabel}
    />
  );
}

export function PreviewBarStatus({ showBorder = true, showLabel = true }) {
  return (
    <div className={`relative w-full h-[148px] bg-white overflow-hidden shrink-0 ${showBorder ? 'border border-border rounded-[10px]' : ''}`}>
      <span className={`absolute left-[12px] top-[14px] text-[12px] text-muted ${showLabel ? '' : 'invisible'}`}>시스템 상태</span>

      <div className="absolute left-0 right-0 top-[38px] flex items-center justify-center gap-1.5">
        <img src={imgDatacenter} alt="dc" className="w-[16px] h-[16px] shrink-0" />
        <span className="text-[13px] text-link">Datacenter</span>
      </div>

      <div className="absolute left-[14px] right-[14px] top-[64px] h-[22px] rounded-full overflow-hidden flex">
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

      <div className="absolute left-0 right-0 bottom-[14px] flex items-center justify-center gap-5">
        {DATA.map(d => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-[12px] text-muted">{d.label}</span>
            <span className="text-[13px] font-bold text-dark ml-0.5">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
