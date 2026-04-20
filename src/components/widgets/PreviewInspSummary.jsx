const DATA = {
  compliance: 96,
  total:      198,
  systems:    6,
  stats: [
    { label: '정상',   count: 190, color: '#00bc7d', bg: '#edfaf4' },
    { label: '비정상', count:   5, color: '#fd9a00', bg: '#fff8ec' },
    { label: '실패',   count:   3, color: '#fb2c36', bg: '#fff0f1' },
  ],
};

function DonutGauge({ pct, size = 72 }) {
  const cx = size / 2, cy = size / 2;
  const r  = size / 2 - 6;
  const ri = r - 10;
  const toXY = (angle, radius) => [
    cx + radius * Math.cos(angle),
    cy + radius * Math.sin(angle),
  ];
  const start = -Math.PI / 2;
  const sweep = (pct / 100) * 2 * Math.PI;
  const end   = start + sweep;
  const lg    = sweep > Math.PI ? 1 : 0;
  const [x1o, y1o] = toXY(start, r);
  const [x1i, y1i] = toXY(start, ri);
  const [x2o, y2o] = toXY(end,   r);
  const [x2i, y2i] = toXY(end,   ri);
  const arcPath = `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${r} ${r} 0 ${lg} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${ri} ${ri} 0 ${lg} 0 ${x1i} ${y1i} Z`;
  const bgPath  = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z M ${cx} ${cy - ri} A ${ri} ${ri} 0 1 0 ${cx + 0.001} ${cy - ri} Z`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={bgPath} fill="#f0f2f5" fillRule="evenodd" />
      <path d={arcPath} fill="#0056a4" />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1a222b">{pct}%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="#8a9299">준수율</text>
    </svg>
  );
}

export default function PreviewInspSummary() {
  return (
    <div className="w-full bg-white px-5 py-4 flex flex-col gap-4">

      {/* 상단: 게이지 + 상태 */}
      <div className="flex items-center gap-5">
        <DonutGauge pct={DATA.compliance} size={72} />

        <div className="flex-1 flex flex-col gap-[6px]">
          {DATA.stats.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[12px] text-[#5b646f] w-[40px]">{s.label}</span>
              <div className="flex-1 h-[5px] rounded-full bg-[#f0f2f5] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(s.count / DATA.total) * 100}%`, background: s.color }}
                />
              </div>
              <span className="text-[12px] font-semibold text-[#1a222b] w-[28px] text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 하단: 메타 */}
      <div className="flex items-center gap-0 border-t border-[#f0f2f5] pt-3">
        <div className="flex-1 flex flex-col items-center gap-[2px]">
          <span className="text-[18px] font-bold text-[#1a222b]">{DATA.systems}</span>
          <span className="text-[10px] text-[#8a9299]">대상 시스템</span>
        </div>
        <div className="w-px h-[28px] bg-[#eaedf1]" />
        <div className="flex-1 flex flex-col items-center gap-[2px]">
          <span className="text-[18px] font-bold text-[#1a222b]">{DATA.total}</span>
          <span className="text-[10px] text-[#8a9299]">전체 항목</span>
        </div>
        <div className="w-px h-[28px] bg-[#eaedf1]" />
        <div className="flex-1 flex flex-col items-center gap-[2px]">
          <span className="text-[18px] font-bold text-[#0056a4]">{DATA.compliance}%</span>
          <span className="text-[10px] text-[#8a9299]">준수율</span>
        </div>
      </div>

    </div>
  );
}
