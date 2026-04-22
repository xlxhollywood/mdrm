import { WIDGET_CATEGORIES } from '@/lib/constants';
import PreviewHistorySimple   from './PreviewHistorySimple';
import PreviewHistoryTable    from './PreviewHistoryTable';
import PreviewTable           from './PreviewTable';
import PreviewFlowchart       from './PreviewFlowchart';
import PreviewHistory         from './PreviewHistory';
import PreviewInspResult      from './PreviewInspResult';
import PreviewInspSummary     from './PreviewInspSummary';
import PreviewInspSysList     from './PreviewInspSysList';
import PreviewInspWeeklyList      from './PreviewInspWeeklyList';
import PreviewInspWeeklyListTable from './PreviewInspWeeklyListTable';
import PreviewInspBurndown    from './PreviewInspBurndown';
import PreviewInspResultChart from './PreviewInspResultChart';
import PreviewInspTimeline    from './PreviewInspTimeline';
import PreviewInspPriority    from './PreviewInspPriority';
import PreviewInspHeatmap     from './PreviewInspHeatmap';
import { PreviewSimpleType, PreviewDonutType, PreviewBarType }       from './SystemTypeWidgets';
import { PreviewSimpleStatus, PreviewDonutStatus, PreviewBarStatus } from './SystemStatusWidgets';
import PreviewRptSummaryCard    from './PreviewRptSummaryCard';
import PreviewRptInspectionStatus from './PreviewRptInspectionStatus';

const ALL_WIDGETS = Object.values(WIDGET_CATEGORIES).flatMap(c => c.widgets);

function getWidgetInfo(widgetId, viewType) {
  const widget = ALL_WIDGETS.find(w => w.id === widgetId);
  if (!widget) return { title: '', viewTypeLabel: '' };
  const vt = widget.viewTypes?.find(v => v.id === viewType);
  return { title: widget.name, viewTypeLabel: vt?.label ?? '' };
}

const ShieldIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

function ActionButtons({ onDuplicate, onDelete }) {
  if (!onDuplicate && !onDelete) return null;
  return (
    <div className="flex gap-[4px] ml-auto shrink-0">
      {onDuplicate && (
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] transition-colors"
          title="복사"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
          title="삭제"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function WidgetPanel({ widgetId, viewType, title: titleProp, inspName, onDuplicate, onDelete, children }) {
  const { title: defaultTitle } = getWidgetInfo(widgetId, viewType);
  const title = titleProp || defaultTitle;

  return (
    <div className="w-full rounded-[8px] overflow-hidden bg-white border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {inspName ? (
        <div className="px-[14px] py-[10px] border-b border-[#eef0f3] flex items-center">
          <div className="flex items-center gap-[6px] min-w-0">
            <ShieldIcon size={15} />
            <span className="text-[13px] font-bold text-[#1e293b] leading-tight">{inspName}</span>
          </div>
          <ActionButtons onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>
      ) : (
        <div className="h-[38px] px-[14px] flex items-center border-b border-[#eef0f3]">
          <span className="text-[12px] font-semibold text-[#334155]">{title}</span>
          <ActionButtons onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>
      )}
      {children}
    </div>
  );
}

export default function WidgetPreview({ widgetId, viewType, title, inspName, showSummary, showFailDetail, showNonpassDetail, displayMode, onDuplicate, onDelete, headerRow = true, headerCol = false }) {
  const p = { showBorder: false, showLabel: false };

  let content;

  /* ── 시스템 위젯 ── */
  if (widgetId === 'sys-status') {
    if (viewType === 'donut') content = <PreviewDonutStatus {...p} />;
    else if (viewType === 'bar') content = <PreviewBarStatus {...p} />;
    else content = <PreviewSimpleStatus {...p} />;
  } else if (widgetId === 'sys-type') {
    if (viewType === 'donut') content = <PreviewDonutType {...p} />;
    else if (viewType === 'bar') content = <PreviewBarType {...p} />;
    else content = <PreviewSimpleType {...p} />;
  } else if (widgetId === 'sys-history') {
    content = viewType === 'table' ? <PreviewHistoryTable /> : <PreviewHistorySimple />;

  /* ── 워크플로우 위젯 ── */
  } else if (widgetId === 'wf-process') {
    content = viewType === 'flowchart' ? <PreviewFlowchart /> : <PreviewTable />;
  } else if (widgetId === 'wf-result') {
    if (viewType === 'table') content = <PreviewTable />;
    else if (viewType === 'flowchart') content = <PreviewFlowchart />;
    else content = <PreviewHistory />;
  } else if (widgetId === 'wf-history') {
    content = <PreviewHistory />;

  /* ── 점검 작업 위젯 ── */
  } else if (widgetId === 'insp-summary') {
    content = <PreviewInspSummary />;
  } else if (widgetId === 'insp-result') {
    content = <PreviewInspResult />;
  } else if (widgetId === 'insp-schedule') {
    content = <PreviewHistory />;

  /* ── 주간 점검 위젯 ── */
  } else if (widgetId === 'insp-sys-list') {
    content = <PreviewInspSysList />;
  } else if (widgetId === 'insp-weekly-list') {
    content = <PreviewInspWeeklyList showSummary={showSummary} />;
  } else if (widgetId === 'insp-burndown') {
    content = <PreviewInspBurndown />;
  } else if (widgetId === 'insp-result-chart') {
    content = <PreviewInspResultChart viewType={viewType || 'donut'} />;
  } else if (widgetId === 'insp-timeline') {
    content = <PreviewInspTimeline />;
  } else if (widgetId === 'insp-priority') {
    content = <PreviewInspPriority />;
  } else if (widgetId === 'insp-heatmap') {
    content = <PreviewInspHeatmap />;

  /* ── 리포트 위젯 ── */
  } else if (widgetId === 'rpt-summary-card') {
    content = <PreviewRptSummaryCard showFailDetail={showFailDetail} showNonpassDetail={showNonpassDetail} />;
  } else if (widgetId === 'rpt-inspection-status') {
    content = <PreviewRptInspectionStatus viewType={viewType} displayMode={displayMode} />;
  } else {
    content = <PreviewHistory />;
  }

  return (
    <WidgetPanel widgetId={widgetId} viewType={viewType} title={title} inspName={inspName} onDuplicate={onDuplicate} onDelete={onDelete}>
      {content}
    </WidgetPanel>
  );
}
