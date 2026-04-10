const nodes = ['시작', '검증', '실행', '검사', '완료'];

export default function PreviewFlowchart() {
  return (
    <div className="flex items-center gap-1 p-4 bg-white border border-border rounded-[10px] shrink-0 flex-wrap">
      {nodes.map((n, i) => (
        <>
          <div key={n} className="px-3 py-1.5 bg-[#d9e6f9] text-primary text-[11px] font-semibold rounded border border-[#b8cbf3]">
            {n}
          </div>
          {i < nodes.length - 1 && (
            <span key={`arrow-${i}`} className="text-[#b8cbf3] text-lg font-bold">›</span>
          )}
        </>
      ))}
    </div>
  );
}
