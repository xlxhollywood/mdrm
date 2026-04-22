import { WIDGET_CATEGORIES } from './constants';

const findDef = (id) =>
  Object.values(WIDGET_CATEGORIES).flatMap(c => c.widgets).find(w => w.id === id);

const makeConfig = (def, overrides = {}) => ({
  viewType: null,
  showBorder: true,
  showLabel: true,
  widgetTitle: undefined,
  ...overrides,
});

let _seq = 0;
const uid = (prefix) => `gt-${prefix}-${++_seq}`;

const FULL = 1044;
const HALF = 516;

export function createInspGridTemplate() {
  _seq = 0;

  const ids = {
    summary:    uid('summary'),
    inspByItem: uid('insp-item'),
    inspBySys:  uid('insp-sys'),
  };

  const widgets = [
    { id: ids.summary,    widgetId: 'rpt-summary-card',        width: FULL },
    { id: ids.inspBySys,  widgetId: 'rpt-inspection-status',   width: FULL },
    { id: ids.inspByItem, widgetId: 'rpt-inspection-status',   width: FULL },
  ];

  const configs = {
    [ids.summary]:    makeConfig(findDef('rpt-summary-card'), {
      widgetTitle: '점검 결과 요약',
      showFailDetail: true,
      showNonpassDetail: true,
      inspName: '서버 및 WEB 점검',
    }),
    [ids.inspByItem]: makeConfig(findDef('rpt-inspection-status'), {
      viewType: 'by-item',
      inspName: '서버 및 WEB 점검',
    }),
    [ids.inspBySys]:  makeConfig(findDef('rpt-inspection-status'), {
      viewType: 'by-system',
      inspName: '서버 및 WEB 점검',
    }),
  };

  return {
    title: '나이스 시스템 정기 점검 결과 보고서',
    subtitle: '2026.04.21 13:31 · 전체 223건 · 준수율 75%',
    widgets,
    configs,
  };
}
