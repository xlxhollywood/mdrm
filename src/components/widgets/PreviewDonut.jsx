const segments = [
  { pct: 65, color: '#00bc7d', label: '정상 65%' },
  { pct: 20, color: '#fd9a00', label: '경고 20%' },
  { pct: 15, color: '#fb2c36', label: '오류 15%' },
];

export default function PreviewDonut() {
  const r = 30, cx = 40, cy = 40, circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-border rounded-[10px] shrink-0">
      <svg viewBox="0 0 80 80" className="w-20 h-20 shrink-0">
        {segments.map((s, i) => {
          const dash = (s.pct / 100) * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={s.color} strokeWidth={12}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ / 100 + circ / 4 * -1}
              transform="rotate(-90 40 40)"
            />
          );
          offset += s.pct;
          return el;
        })}
        <circle cx={cx} cy={cy} r={18} fill="#fff" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="#1a222b" fontWeight="700">12</text>
      </svg>
      <div className="flex flex-col gap-1">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-[5px] text-[10px] text-muted">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
