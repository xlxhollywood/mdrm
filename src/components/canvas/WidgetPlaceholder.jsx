export default function WidgetPlaceholder({ widgetDef, className = 'w-[274px] h-[153px]' }) {
  return (
    <div className={`${className} bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-[8px] flex flex-col items-center justify-center gap-3 px-4`}>
      <div className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm">
        <span className="text-[20px]">{widgetDef.icon}</span>
      </div>
      <div className="text-center">
        <div className="text-[12px] font-semibold text-[#334155]">{widgetDef.name}</div>
        <div className="text-[10px] text-[#94a3b8] mt-1 leading-[1.5]">
          우측 패널에서 시스템을 선택하면<br/>미리보기가 표시됩니다
        </div>
      </div>
      {/* 안내 화살표 */}
      <div className="flex items-center gap-[6px] mt-1">
        <div className="flex gap-[3px]">
          <div className="w-[3px] h-[3px] rounded-full bg-[#94a3b8] animate-pulse" />
          <div className="w-[3px] h-[3px] rounded-full bg-[#94a3b8] animate-pulse [animation-delay:150ms]" />
          <div className="w-[3px] h-[3px] rounded-full bg-[#94a3b8] animate-pulse [animation-delay:300ms]" />
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  );
}
