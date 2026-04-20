const DATA = [
  { label: '정상',   count: 14, color: '#00bc7d' },
  { label: '비정상', count:  5, color: '#fd9a00' },
  { label: '실패',   count:  3, color: '#fb2c36' },
];
const TOTAL = DATA.reduce((s, d) => s + d.count, 0);

const W = 260, H = 126;
const CX = 62, CY = 65, R = 50, RI = 28;

function buildDonut() {
  let angle = -Math.PI / 2;
  return DATA.map(d => {
    const sweep = (d.count / TOTAL) * 2 * Math.PI;
    const cos1 = Math.cos(angle), sin1 = Math.sin(angle);
    angle += sweep;
    const cos2 = Math.cos(angle), sin2 = Math.sin(angle);
    const lg = sweep > Math.PI ? 1 : 0;
    return {
      d: [
        `M ${CX + RI * cos1} ${CY + RI * sin1}`,
        `L ${CX + R  * cos1} ${CY + R  * sin1}`,
        `A ${R}  ${R}  0 ${lg} 1 ${CX + R  * cos2} ${CY + R  * sin2}`,
        `L ${CX + RI * cos2} ${CY + RI * sin2}`,
        `A ${RI} ${RI} 0 ${lg} 0 ${CX + RI * cos1} ${CY + RI * sin1} Z`,
      ].join(' '),
      color: d.color,
    };
  });
}

function buildPie() {
  let angle = -Math.PI / 2;
  return DATA.map(d => {
    const sweep = (d.count / TOTAL) * 2 * Math.PI;
    const x1 = CX + R * Math.cos(angle), y1 = CY + R * Math.sin(angle);
    angle += sweep;
    const x2 = CX + R * Math.cos(angle), y2 = CY + R * Math.sin(angle);
    return {
      d: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`,
      color: d.color,
    };
  });
}

export default function PreviewInspResultChart({ viewType = 'donut' }) {
  const slices = viewType === 'pie' ? buildPie() : buildDonut();
  const LX = 138;

  return (
    <div className="w-full bg-white px-3 pt-3 pb-2">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* 차트 */}
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}

        {/* 도넛 중앙 텍스트 */}
        {viewType !== 'pie' && (
          <>
            <text x={CX} y={CY - 4} fontSize="14" fontWeight="bold" fill="#1a222b" textAnchor="middle">{TOTAL}</text>
            <text x={CX} y={CY + 10} fontSize="8" fill="#8a9299" textAnchor="middle">총 건수</text>
          </>
        )}

        {/* 범례 */}
        {DATA.map((d, i) => {
          const y = CY - 24 + i * 24;
          return (
            <g key={d.label}>
              <rect x={LX} y={y - 5} width="10" height="10" rx="2" fill={d.color} />
              <text x={LX + 15} y={y + 4} fontSize="11" fill="#5b646f">{d.label}</text>
              <text x={W - 8}   y={y + 4} fontSize="12" fontWeight="bold" fill="#1a222b" textAnchor="end">{d.count}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
