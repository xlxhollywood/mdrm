import { imgCategories, imgDatacenter } from '@/lib/assets';

/* ── 공통 데이터 ── */
const DATA = [
  { label: '서버',    count: 3, color: '#1e3a8a', dotColor: '#1e3a8a' },
  { label: '네트워크', count: 1, color: '#3571ce', dotColor: '#3571ce' },
  { label: '스토리지', count: 1, color: '#93c5fd', dotColor: '#93c5fd' },
];
const TOTAL = DATA.reduce((s, d) => s + d.count, 0);

/* ── SVG 아이콘 (심플형 전용) ── */
const IcoServer = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="0.5" y="0.5" width="13" height="5" rx="1.2" fill="#3571ce" stroke="#3571ce" strokeWidth="0.3"/>
    <rect x="0.5" y="7.5" width="13" height="5" rx="1.2" fill="#3571ce" stroke="#3571ce" strokeWidth="0.3"/>
    <circle cx="10.8" cy="3" r="1" fill="#fff"/>
    <circle cx="10.8" cy="10" r="1" fill="#fff"/>
    <rect x="2" y="2.3" width="6" height="1.3" rx="0.5" fill="#fff" opacity="0.7"/>
    <rect x="2" y="9.3" width="6" height="1.3" rx="0.5" fill="#fff" opacity="0.7"/>
  </svg>
);
const IcoNetwork = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="1.8" fill="#3571ce"/>
    <circle cx="2" cy="2.5" r="1.4" fill="#3571ce"/>
    <circle cx="12" cy="2.5" r="1.4" fill="#3571ce"/>
    <circle cx="2" cy="11.5" r="1.4" fill="#3571ce"/>
    <circle cx="12" cy="11.5" r="1.4" fill="#3571ce"/>
    <line x1="7" y1="7" x2="2" y2="2.5" stroke="#3571ce" strokeWidth="1"/>
    <line x1="7" y1="7" x2="12" y2="2.5" stroke="#3571ce" strokeWidth="1"/>
    <line x1="7" y1="7" x2="2" y2="11.5" stroke="#3571ce" strokeWidth="1"/>
    <line x1="7" y1="7" x2="12" y2="11.5" stroke="#3571ce" strokeWidth="1"/>
  </svg>
);
const IcoStorage = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <ellipse cx="7" cy="3" rx="5.3" ry="2" fill="#3571ce"/>
    <rect x="1.7" y="3" width="10.6" height="7.2" fill="#3571ce"/>
    <ellipse cx="7" cy="10.2" rx="5.3" ry="2" fill="#4a82d4"/>
    <ellipse cx="7" cy="3" rx="5.3" ry="2" fill="#5590e0"/>
    <ellipse cx="7" cy="6.6" rx="5.3" ry="1.7" fill="#4a82d4" opacity="0.6"/>
  </svg>
);

const SIMPLE_ROWS = [
  { icon: <IcoServer />,  ...DATA[0] },
  { icon: <IcoNetwork />, ...DATA[1] },
  { icon: <IcoStorage />, ...DATA[2] },
];

/* ── 공통 우측 범례 ── */
function Legend({ rows }) {
  return (
    <div className="flex flex-col gap-0">
      {/* Datacenter 헤더 */}
      <div className="flex items-center gap-1.5 mb-[12px]">
        <img src={imgDatacenter} alt="dc" className="w-[16px] h-[16px] shrink-0" />
        <span className="text-[13px] text-link whitespace-nowrap">Datacenter</span>
      </div>
      {/* 항목 */}
      <div className="flex flex-col gap-[10px]">
        {rows.map(r => (
          <div key={r.label} className="flex items-center gap-2 h-[20px]">
            <span className="w-[14px] h-[14px] shrink-0 flex items-center justify-center">
              {r.icon ?? <span className="w-[10px] h-[10px] rounded-full block" style={{ background: r.dotColor }} />}
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
function TypeCard({ chart, legendRows, showBorder = true, showLabel = true }) {
  return (
    <div className={`w-full h-[180px] bg-white overflow-hidden shrink-0 relative ${showBorder ? 'border border-border rounded-[10px]' : ''}`}>
      {/* 헤더 */}
      <div className={`absolute left-[12px] top-[14px] right-[12px] ${showLabel ? '' : 'invisible'}`}>
        <span className="text-[12px] text-muted">시스템 유형</span>
      </div>

      {/* 바디: 좌측 차트 + 우측 범례 */}
      <div className="absolute left-0 right-0 top-[34px] bottom-0 flex items-center px-[16px] gap-[16px]">
        {/* 차트 영역 — 고정 너비 */}
        <div className="w-[120px] flex items-center justify-center shrink-0">
          {chart}
        </div>
        {/* 범례 */}
        <div className="flex-1">
          <Legend rows={legendRows} />
        </div>
      </div>
    </div>
  );
}

/* ── 파이 차트 (도넛형) ── */
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
export function PreviewSimpleType({ showBorder = true, showLabel = true }) {
  return (
    <TypeCard
      chart={
        <img src={imgCategories} alt="categories"
          className="w-[110px] h-[110px] object-contain pointer-events-none" />
      }
      legendRows={SIMPLE_ROWS}
      showBorder={showBorder}
      showLabel={showLabel}
    />
  );
}

export function PreviewDonutType({ showBorder = true, showLabel = true }) {
  return (
    <TypeCard
      chart={<PieChart size={116} />}
      legendRows={DATA.map(d => ({ ...d, icon: null }))}
      showBorder={showBorder}
      showLabel={showLabel}
    />
  );
}

export function PreviewBarType({ showBorder = true, showLabel = true }) {
  return (
    <div className={`relative w-full h-[148px] bg-white overflow-hidden shrink-0 ${showBorder ? 'border border-border rounded-[10px]' : ''}`}>
      <span className={`absolute left-[12px] top-[14px] text-[12px] text-muted ${showLabel ? '' : 'invisible'}`}>시스템 유형</span>

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
