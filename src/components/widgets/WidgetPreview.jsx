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

const ALL_WIDGETS = Object.values(WIDGET_CATEGORIES).flatMap(c => c.widgets);

function getWidgetInfo(widgetId, viewType) {
  const widget = ALL_WIDGETS.find(w => w.id === widgetId);
  if (!widget) return { title: '', viewTypeLabel: '' };
  const vt = widget.viewTypes?.find(v => v.id === viewType);
  return { title: widget.name, viewTypeLabel: vt?.label ?? '' };
}

function WidgetPanel({ widgetId, viewType, title: titleProp, children }) {
  const { title: defaultTitle, viewTypeLabel } = getWidgetInfo(widgetId, viewType);
  const title = titleProp || defaultTitle;
  return (
    <div className="w-full rounded-[10px] overflow-hidden border border-[#e4e8ee] shadow-[0_1px_5px_rgba(26,34,43,0.08)]">
      <div className="bg-[#f8f9fb] h-[40px] px-[14px] flex items-center shrink-0">
        <span className="text-[12px] font-semibold text-[#3d4e60]">{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function WidgetPreview({ widgetId, viewType, title, showSummary, headerRow = true, headerCol = false }) {
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

  } else {
    content = <PreviewHistory />;
  }

  return (
    <WidgetPanel widgetId={widgetId} viewType={viewType} title={title}>
      {content}
    </WidgetPanel>
  );
}
