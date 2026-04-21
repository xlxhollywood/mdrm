export default function WidgetPlaceholder({ widgetDef, className = 'w-[274px] h-[153px]' }) {
  return (
    <div className={`${className} bg-white border-2 border-dashed border-border rounded-[10px] flex flex-col items-center justify-center gap-2`}>
      <span className="text-[26px]">{widgetDef.icon}</span>
      <span className="text-[12px] font-medium text-dark">{widgetDef.name}</span>
      <span className="text-[10px] text-muted text-center leading-[1.5]">
        우측 패널에서<br/>시스템을 선택해주세요
      </span>
    </div>
  );
}
