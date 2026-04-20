import { WIDGET_CATEGORIES } from '@/lib/constants';
import PreviewHistorySimple from './PreviewHistorySimple';
import PreviewHistoryTable  from './PreviewHistoryTable';
import PreviewTable         from './PreviewTable';
import PreviewFlowchart     from './PreviewFlowchart';
import PreviewHistory       from './PreviewHistory';
import PreviewInspResult    from './PreviewInspResult';
import { PreviewSimpleType, PreviewDonutType, PreviewBarType } from './SystemTypeWidgets';
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
    <div className="w-full overflow-hidden shadow-[0_1px_5px_rgba(26,34,43,0.10)]">
      {/* 패널 헤더 */}
      <div className="bg-[#eef1f6] h-[34px] px-[14px] flex items-center justify-between border-b border-[#dde3ea] shrink-0">
        <span className="text-[12px] font-semibold text-[#3d4e60]">{title}</span>
        {viewTypeLabel && (
          <span className="text-[10px] text-[#8a9299] bg-white px-[7px] py-[2px] rounded-full border border-[#dde3ea]">
            {viewTypeLabel}
          </span>
        )}
      </div>
      {/* 위젯 컨텐츠 */}
      {children}
    </div>
  );
}

export default function WidgetPreview({ widgetId, viewType, title }) {
  const p = { showBorder: false, showLabel: false };

  let content;
  if (widgetId === 'insp-result') {
    content = <PreviewInspResult />;
  } else if (viewType === 'simple' || (!viewType && widgetId === 'insp-schedule')) {
    if (widgetId === 'wf-history' || widgetId === 'insp-schedule') content = <PreviewHistory />;
    else if (widgetId === 'sys-type')    content = <PreviewSimpleType {...p} />;
    else if (widgetId === 'sys-history') content = <PreviewHistorySimple />;
    else content = <PreviewSimpleStatus {...p} />;
  } else if (viewType === 'donut') {
    content = widgetId === 'sys-type' ? <PreviewDonutType {...p} /> : <PreviewDonutStatus {...p} />;
  } else if (viewType === 'bar') {
    content = widgetId === 'sys-type' ? <PreviewBarType {...p} /> : <PreviewBarStatus {...p} />;
  } else if (viewType === 'table') {
    content = widgetId === 'sys-history' ? <PreviewHistoryTable /> : <PreviewTable />;
  } else if (viewType === 'flowchart') {
    content = <PreviewFlowchart />;
  } else {
    content = <PreviewHistory />;
  }

  return (
    <WidgetPanel widgetId={widgetId} viewType={viewType} title={title}>
      {content}
    </WidgetPanel>
  );
}
