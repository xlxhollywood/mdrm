import PreviewHistorySimple from './PreviewHistorySimple';
import PreviewHistoryTable  from './PreviewHistoryTable';
import PreviewTable         from './PreviewTable';
import PreviewFlowchart     from './PreviewFlowchart';
import PreviewHistory       from './PreviewHistory';
import { PreviewSimpleType, PreviewDonutType, PreviewBarType } from './SystemTypeWidgets';
import { PreviewSimpleStatus, PreviewDonutStatus, PreviewBarStatus } from './SystemStatusWidgets';

export default function WidgetPreview({ widgetId, viewType }) {
  if (viewType === 'simple' || (!viewType && (widgetId === 'insp-result' || widgetId === 'insp-schedule'))) {
    if (widgetId === 'wf-history' || widgetId === 'insp-result' || widgetId === 'insp-schedule') return <PreviewHistory />;
    if (widgetId === 'sys-type')    return <PreviewSimpleType />;
    if (widgetId === 'sys-history') return <PreviewHistorySimple />;
    return <PreviewSimpleStatus />;
  }
  if (viewType === 'donut')     return widgetId === 'sys-type' ? <PreviewDonutType /> : <PreviewDonutStatus />;
  if (viewType === 'bar')       return widgetId === 'sys-type' ? <PreviewBarType />   : <PreviewBarStatus />;
  if (viewType === 'table')     return widgetId === 'sys-history' ? <PreviewHistoryTable /> : <PreviewTable />;
  if (viewType === 'flowchart') return <PreviewFlowchart />;
  return <PreviewHistory />;
}
