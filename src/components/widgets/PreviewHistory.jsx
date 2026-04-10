const rows = [
  { label: 'workflow-001 실행 완료', time: '10:32', color: '#00bc7d' },
  { label: 'workflow-002 실행 중',   time: '10:15', color: '#fd9a00' },
  { label: 'workflow-003 실패',      time: '09:58', color: '#fb2c36' },
  { label: 'workflow-004 실행 완료', time: '09:40', color: '#00bc7d' },
];

export default function PreviewHistory() {
  return (
    <div className="flex flex-col gap-2 p-4 bg-white border border-border rounded-[10px] w-[240px] shrink-0">
      {rows.map(r => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
          <span className="text-[11px] text-dark flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{r.label}</span>
          <span className="text-[10px] text-muted shrink-0">{r.time}</span>
        </div>
      ))}
    </div>
  );
}
