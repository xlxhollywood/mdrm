const DAYS  = ['월(14)', '화(15)', '수(16)', '목(17)', '금(18)'];
const TOTAL = 25;

/* 누적 완료 / 누적 실패 */
const COMPLETED_DAILY = [5, 7, 4,  6,  3];
const FAILED_DAILY    = [0, 1, 2,  0,  1];

export default function PreviewInspBurndown() {
  const W = 300, H = 130;
  const PAD = { top: 12, right: 14, bottom: 32, left: 30 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top  - PAD.bottom;

  /* 잔여(번다운) 라인 — 0일차 포함 6포인트 */
  const remainingPts = [TOTAL];
  let rem = TOTAL;
  COMPLETED_DAILY.forEach((c, i) => { rem -= (c + FAILED_DAILY[i]); remainingPts.push(Math.max(0, rem)); });

  /* 이상적 직선 */
  const idealPts = Array.from({ length: 6 }, (_, i) => TOTAL - (TOTAL / 5) * i);

  /* 누적 실패 라인 */
  const failedCum = [0];
  let cumF = 0;
  FAILED_DAILY.forEach(f => { cumF += f; failedCum.push(cumF); });

  const maxY = TOTAL;
  const xOf  = (i) => PAD.left + (i / 5) * cw;
  const yOf  = (v) => PAD.top  + ch - (v / maxY) * ch;

  const polyline = (pts) =>
    pts.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ');

  return (
    <div className="w-full bg-white px-3 pt-3 pb-2">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Y 가이드 */}
        {[0, 5, 10, 15, 20, 25].map(v => (
          <g key={v}>
            <line x1={PAD.left} y1={yOf(v)} x2={PAD.left + cw} y2={yOf(v)}
              stroke="#f0f2f5" strokeWidth="1" />
            <text x={PAD.left - 5} y={yOf(v) + 3.5} fontSize="8" fill="#b0b8c1" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* X축 */}
        <line x1={PAD.left} y1={PAD.top + ch} x2={PAD.left + cw} y2={PAD.top + ch}
          stroke="#dde1e7" strokeWidth="1" />
        {DAYS.map((d, i) => (
          <text key={d} x={xOf(i)} y={PAD.top + ch + 14} fontSize="8.5" fill="#8a9299" textAnchor="middle">{d}</text>
        ))}
        <text x={xOf(5)} y={PAD.top + ch + 14} fontSize="8.5" fill="#8a9299" textAnchor="middle">완료</text>

        {/* 이상적 직선 (점선) */}
        <polyline points={polyline(idealPts)} fill="none" stroke="#c0c7ce"
          strokeWidth="1.2" strokeDasharray="4 3" strokeLinecap="round" />

        {/* 번다운 (잔여) 라인 */}
        <polyline points={polyline(remainingPts)} fill="none" stroke="#3571ce"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {remainingPts.map((v, i) => (
          <circle key={i} cx={xOf(i)} cy={yOf(v)} r="3" fill="#fff" stroke="#3571ce" strokeWidth="1.5" />
        ))}

        {/* 누적 실패 라인 */}
        <polyline points={polyline(failedCum)} fill="none" stroke="#fb2c36"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {failedCum.map((v, i) => (
          <circle key={i} cx={xOf(i)} cy={yOf(v)} r="2.5" fill="#fff" stroke="#fb2c36" strokeWidth="1.5" />
        ))}
      </svg>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-4 mt-0.5">
        {[['잔여(실제)', '#3571ce', false], ['이상(목표)', '#c0c7ce', true], ['누적 실패', '#fb2c36', false]].map(([label, color, dashed]) => (
          <div key={label} className="flex items-center gap-1">
            <svg width="16" height="8">
              <line x1="0" y1="4" x2="16" y2="4" stroke={color} strokeWidth="1.5"
                strokeDasharray={dashed ? '3 2' : undefined} />
            </svg>
            <span className="text-[10px] text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
