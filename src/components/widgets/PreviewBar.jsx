const data = [
  { label: '서버',    pct: 75 },
  { label: 'DB',     pct: 45 },
  { label: '네트워크', pct: 90 },
  { label: '앱',     pct: 30 },
];

export default function PreviewBar() {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-border rounded-[10px] w-[200px] shrink-0">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[10px] text-muted w-[44px] shrink-0">{d.label}</span>
          <div className="flex-1 h-[6px] bg-[#e8edf3] rounded-full overflow-hidden">
            <div className="h-full bg-link rounded-full" style={{ width: `${d.pct}%` }} />
          </div>
          <span className="text-[10px] text-muted w-7 text-right shrink-0">{d.pct}%</span>
        </div>
      ))}
    </div>
  );
}
