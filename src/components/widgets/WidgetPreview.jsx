import PreviewSimple       from './PreviewSimple';
import PreviewSimpleType   from './PreviewSimpleType';
import PreviewHistorySimple from './PreviewHistorySimple';
import PreviewHistoryTable from './PreviewHistoryTable';
import PreviewDonut        from './PreviewDonut';
import PreviewBar          from './PreviewBar';
import PreviewTable        from './PreviewTable';
import PreviewFlowchart    from './PreviewFlowchart';
import PreviewHistory      from './PreviewHistory';

export default function WidgetPreview({ widgetId, viewType }) {
  if (viewType === 'simple' || (!viewType && (widgetId === 'insp-result' || widgetId === 'insp-schedule'))) {
    if (widgetId === 'wf-history' || widgetId === 'insp-result' || widgetId === 'insp-schedule') return <PreviewHistory />;
    if (widgetId === 'sys-type') return <PreviewSimpleType />;
    if (widgetId === 'sys-history') return <PreviewHistorySimple />;
    return <PreviewSimple />;
  }
  if (viewType === 'donut')     return <PreviewDonut />;
  if (viewType === 'bar')       return <PreviewBar />;
  if (viewType === 'table')     return widgetId === 'sys-history' ? <PreviewHistoryTable /> : <PreviewTable />;
  if (viewType === 'flowchart') return <PreviewFlowchart />;
  return <PreviewHistory />;
}
