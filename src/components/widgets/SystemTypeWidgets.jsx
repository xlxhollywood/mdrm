import { imgCategories, imgDatacenter, imgDrag1 } from '@/lib/assets';

/* ── 공통 데이터 ── */
const DATA = [
  { label: '서버',    count: 3, color: '#1e3a8a', dotColor: '#1e3a8a' },
  { label: '네트워크', count: 1, color: '#3571ce', dotColor: '#3571ce' },
  { label: '스토리지', count: 1, color: '#93c5fd', dotColor: '#93c5fd' },
];
const TOTAL = DATA.reduce((s, d) => s + d.count, 0);

/* ── SVG 아이콘 (심플형 전용) ── */
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
      <div className="flex items-center gap-1 mb-[10px]">
        <img src={imgDatacenter} alt="dc" className="w-[14px] h-[14px] shrink-0" />
        <span className="text-[12px] text-link whitespace-nowrap">Datacenter</span>
      </div>
      {/* 항목 */}
      <div className="flex flex-col gap-[7px]">
        {rows.map(r => (
          <div key={r.label} className="flex items-center gap-2 h-[18px]">
            <span className="w-[10px] h-[10px] shrink-0 flex items-center justify-center">
              {r.icon ?? <span className="w-[8px] h-[8px] rounded-full block" style={{ background: r.dotColor }} />}
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
function TypeCard({ chart, legendRows, showBorder = true, showLabel = true }) {
  return (
    <div className={`w-[274px] h-[153px] bg-white rounded-[10px] overflow-hidden shrink-0 relative ${showBorder ? 'border border-border' : ''}`}>
      {/* 헤더 */}
      <div className={`absolute left-[10px] top-[13px] right-[32px] ${showLabel ? '' : 'invisible'}`}>
        <span className="text-[12px] text-muted">시스템 유형</span>
      </div>
      <img src={imgDrag1} alt="drag"
        className="absolute right-2 top-3 w-4 h-4 pointer-events-none opacity-40" />

      {/* 바디: 좌측 차트 + 우측 범례 */}
      <div className="absolute left-0 right-10 top-[28px] bottom-0 flex items-center px-[14px] gap-[14px]">
        {/* 차트 영역 — 고정 너비 */}
        <div className="w-[100px] flex items-center justify-center shrink-0">
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

/* ── 스택 바 차트 (막대형) ── */
function StackedBar() {
  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="w-full h-[14px] rounded-full overflow-hidden flex">
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
    </div>
  );
}

/* ── Export: 세 variant ── */
export function PreviewSimpleType({ showBorder = true, showLabel = true }) {
  return (
    <TypeCard
      chart={
        <img src={imgCategories} alt="categories"
          className="w-[90px] h-[90px] object-contain pointer-events-none" />
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
      chart={<PieChart size={96} />}
      legendRows={DATA.map(d => ({ ...d, icon: null }))}
      showBorder={showBorder}
      showLabel={showLabel}
    />
  );
}

export function PreviewBarType({ showBorder = true, showLabel = true }) {
  return (
    <div className={`relative w-[298px] h-[124px] bg-white rounded-[10px] overflow-hidden shrink-0 ${showBorder ? 'border border-border' : ''}`}>
      <span className={`absolute left-[10px] top-[13px] text-[12px] text-muted ${showLabel ? '' : 'invisible'}`}>시스템 유형</span>
      <img src={imgDrag1} alt="drag"
        className="absolute right-2 top-3 w-4 h-4 pointer-events-none opacity-40" />

      <div className="absolute left-0 right-0 top-[34px] flex items-center justify-center gap-1">
        <img src={imgDatacenter} alt="dc" className="w-[14px] h-[14px] shrink-0" />
        <span className="text-[12px] text-link">Datacenter</span>
      </div>

      <div className="absolute left-[12px] right-[12px] top-[56px] h-[18px] rounded-full overflow-hidden flex">
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
