const DATA = { compliance: 96, total: 198, systems: 6 };

function SemiGauge({ pct, w = 200, h = 110 }) {
  const cx = w / 2, cy = h - 10;
  const r = h - 22, ri = r - 20;
  const toXY = (deg, rad) => {
    const a = (deg * Math.PI) / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };
  // 반원: 180° (왼쪽) → 0° (오른쪽), 시작 180
  const startDeg = 180;
  const endDeg   = 180 - pct * 1.8; // 1.8 = 180/100
  const lg = pct > 50 ? 1 : 0;

  const [x1o, y1o] = toXY(startDeg, r),  [x1i, y1i] = toXY(startDeg, ri);
  const [x2o, y2o] = toXY(endDeg,   r),  [x2i, y2i] = toXY(endDeg,   ri);

  const arc = `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${r} ${r} 0 ${lg} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${ri} ${ri} 0 ${lg} 0 ${x1i} ${y1i} Z`;
  const bgArc = () => {
    const [ax1o, ay1o] = toXY(180, r), [ax1i, ay1i] = toXY(180, ri);
    const [ax2o, ay2o] = toXY(0,   r), [ax2i, ay2i] = toXY(0,   ri);
    return `M ${ax1i} ${ay1i} L ${ax1o} ${ay1o} A ${r} ${r} 0 1 1 ${ax2o} ${ay2o} L ${ax2i} ${ay2i} A ${ri} ${ri} 0 1 0 ${ax1i} ${ay1i} Z`;
  };

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={bgArc()} fill="#eef1f5" />
      <path d={arc}    fill="#0056a4" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1a222b">{pct}%</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9"  fill="#8a9299">준수율</text>
    </svg>
  );
}

export default function PreviewInspSummary() {
  return (
    <div className="w-full bg-white px-5 pt-4 pb-4 flex flex-col items-center gap-3">
      <SemiGauge pct={DATA.compliance} w={200} h={110} />
      <div className="flex items-center gap-0 w-full border-t border-[#eaedf1] pt-3">
        <div className="flex-1 flex flex-col items-center gap-[3px]">
          <span className="text-[24px] font-black leading-none text-[#1a222b]">{DATA.systems}</span>
          <span className="text-[10px] text-[#8a9299]">대상 시스템</span>
        </div>
        <div className="w-px h-8 bg-[#eaedf1]" />
        <div className="flex-1 flex flex-col items-center gap-[3px]">
          <span className="text-[24px] font-black leading-none text-[#1a222b]">{DATA.total}</span>
          <span className="text-[10px] text-[#8a9299]">전체 항목</span>
        </div>
      </div>
    </div>
  );
}
