const DATA = [
  { label: '정상',   count: 14, color: '#00bc7d' },
  { label: '비정상', count:  5, color: '#fd9a00' },
  { label: '실패',   count:  3, color: '#fb2c36' },
];
const TOTAL = DATA.reduce((s, d) => s + d.count, 0);

function DonutChart({ size = 110, innerRatio = 0.55 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 2;
  const ri = r * innerRatio;
  let angle = -Math.PI / 2;

  const slices = DATA.map(d => {
    const sweep = (d.count / TOTAL) * 2 * Math.PI;
    const x1o = cx + r  * Math.cos(angle), y1o = cy + r  * Math.sin(angle);
    const x1i = cx + ri * Math.cos(angle), y1i = cy + ri * Math.sin(angle);
    angle += sweep;
    const x2o = cx + r  * Math.cos(angle), y2o = cy + r  * Math.sin(angle);
    const x2i = cx + ri * Math.cos(angle), y2i = cy + ri * Math.sin(angle);
    const lg = sweep > Math.PI ? 1 : 0;
    return {
      d: `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${r} ${r} 0 ${lg} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${ri} ${ri} 0 ${lg} 0 ${x1i} ${y1i} Z`,
      color: d.color,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
      <text x={cx} y={cy - 4} fontSize="14" fontWeight="bold" fill="#1a222b" textAnchor="middle">{TOTAL}</text>
      <text x={cx} y={cy + 10} fontSize="8" fill="#8a9299" textAnchor="middle">총 건수</text>
    </svg>
  );
}

function PieChart({ size = 110 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 2;
  let angle = -Math.PI / 2;
  const slices = DATA.map(d => {
    const sweep = (d.count / TOTAL) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
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

export default function PreviewInspResultChart({ viewType = 'donut' }) {
  return (
    <div className="w-full bg-white flex items-center gap-4 px-4 py-4">
      <div className="shrink-0">
        {viewType === 'pie' ? <PieChart size={110} /> : <DonutChart size={110} />}
      </div>
      <div className="flex flex-col gap-[10px]">
        {DATA.map(d => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-[12px] text-muted w-[44px]">{d.label}</span>
            <span className="text-[13px] font-bold text-dark">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
