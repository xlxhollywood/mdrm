'use client';

import WidgetPreview from '../widgets/WidgetPreview';

export default function GridPublishView({ canvasWidgets, config, findWidgetDef, gridTitle, gridSubtitle, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#f1f3f5] flex flex-col">
      {/* 상단 바 */}
      <div className="h-[48px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-5 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <span className="text-[14px] font-semibold text-[#1e293b]">{gridTitle || '보고서'}</span>
          <span className="text-[11px] text-[#94a3b8] bg-[#f0fdf4] text-[#16a34a] font-semibold px-2 py-[2px] rounded">발행됨</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-[6px] px-3 py-[6px] rounded-[6px] border border-[#e2e8f0] bg-white text-[12px] font-medium text-[#475569] hover:bg-[#f8fafc] hover:text-[#1e293b] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          편집으로 돌아가기
        </button>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-auto flex justify-center py-8">
        <div
          className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] rounded-[4px]"
          style={{ width: 1100, minHeight: 900, padding: '40px 36px' }}
        >
          {/* 보고서 헤더 */}
          {gridTitle && (
            <div className="mb-6">
              <h1 className="text-[24px] font-bold text-[#1e293b] leading-tight">{gridTitle}</h1>
              {gridSubtitle && <p className="text-[12px] text-[#64748b] mt-2">{gridSubtitle}</p>}
              <div className="h-[2px] bg-[#0056a4] mt-4 w-full" />
            </div>
          )}

          {/* 위젯들 (읽기 전용) */}
          <div className="flex flex-wrap gap-4 content-start">
            {canvasWidgets.map(inst => {
              const def = findWidgetDef(inst.widgetId);
              if (!def) return null;
              const cfg = config[inst.id] || {};
              const viewType = cfg.viewType || def.viewTypes[0]?.id;

              return (
                <div key={inst.id} style={{ width: inst.width || '100%' }}>
                  <WidgetPreview
                    widgetId={def.id}
                    viewType={viewType}
                    title={cfg.widgetTitle}
                    inspName={cfg.inspName}
                    showSummary={cfg.showSummary}
                    showFailDetail={cfg.showFailDetail}
                    showNonpassDetail={cfg.showNonpassDetail}
                    displayMode={cfg.displayMode}
                    headerRow={cfg.headerRow !== false}
                    headerCol={!!cfg.headerCol}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
