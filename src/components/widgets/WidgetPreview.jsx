import PreviewHistorySimple from './PreviewHistorySimple';
import PreviewHistoryTable  from './PreviewHistoryTable';
import PreviewTable         from './PreviewTable';
import PreviewFlowchart     from './PreviewFlowchart';
import PreviewHistory       from './PreviewHistory';
import { PreviewSimpleType, PreviewDonutType, PreviewBarType } from './SystemTypeWidgets';
import { PreviewSimpleStatus, PreviewDonutStatus, PreviewBarStatus } from './SystemStatusWidgets';

export default function WidgetPreview({ widgetId, viewType, showBorder = true, showLabel = true }) {
  const p = { showBorder, showLabel };
  if (viewType === 'simple' || (!viewType && (widgetId === 'insp-result' || widgetId === 'insp-schedule'))) {
    if (widgetId === 'wf-history' || widgetId === 'insp-result' || widgetId === 'insp-schedule') return <PreviewHistory />;
    if (widgetId === 'sys-type')    return <PreviewSimpleType {...p} />;
    if (widgetId === 'sys-history') return <PreviewHistorySimple />;
    return <PreviewSimpleStatus {...p} />;
  }
  if (viewType === 'donut')     return widgetId === 'sys-type' ? <PreviewDonutType {...p} />   : <PreviewDonutStatus {...p} />;
  if (viewType === 'bar')       return widgetId === 'sys-type' ? <PreviewBarType {...p} />     : <PreviewBarStatus {...p} />;
  if (viewType === 'table')     return widgetId === 'sys-history' ? <PreviewHistoryTable /> : <PreviewTable />;
  if (viewType === 'flowchart') return <PreviewFlowchart />;
  return <PreviewHistory />;
}
