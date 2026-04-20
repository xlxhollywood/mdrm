import { WIDGET_CATEGORIES } from './constants';

const findDef = (id) =>
  Object.values(WIDGET_CATEGORIES).flatMap(c => c.widgets).find(w => w.id === id);

const makeConfig = (def) => ({
  viewType:   def?.viewTypes[0]?.id || null,
  periodOn:   false,
  from:       '2026-04-14',
  to:         '2026-04-18',
  quick:      '1주',
  showBorder: true,
  showLabel:  true,
  widgetTitle: undefined,
});

let _seq = 0;
const uid = (prefix) => `wt-${prefix}-${++_seq}`;

export function createWeeklyTemplate() {
  _seq = 0; // reset so IDs are stable per call

  /* 위젯 인스턴스 ID 생성 */
  const ids = {
    sysList:     uid('sys-list'),
    burndown:    uid('burndown'),
    resultChart: uid('result-chart'),
    weeklyList:  uid('weekly-list'),
    priority:    uid('priority'),
    layoutId:    uid('layout'),
  };

  /* 위젯 config 맵 */
  const configs = {
    [ids.sysList]:     { ...makeConfig(findDef('insp-sys-list')) },
    [ids.burndown]:    { ...makeConfig(findDef('insp-burndown')) },
    [ids.resultChart]: { ...makeConfig(findDef('insp-result-chart')), viewType: 'donut' },
    [ids.weeklyList]:  { ...makeConfig(findDef('insp-weekly-list')) },
    [ids.priority]:    { ...makeConfig(findDef('insp-priority')) },
  };

  /* 문서 블록 */
  const blocks = [
    { id: uid('t'), type: 'text', subtype: 'h1', html: '주간 점검 보고서' },
    { id: uid('t'), type: 'text', html: '점검 기간: 2026년 04월 14일(월) ~ 04월 18일(금)' },
    { id: uid('d'), type: 'divider' },

    { id: ids.sysList, type: 'widget', widgetId: 'insp-sys-list', instanceId: ids.sysList },

    { id: ids.layoutId, type: 'layout', cols: 2 },
    {
      id: ids.burndown, type: 'widget', widgetId: 'insp-burndown', instanceId: ids.burndown,
      layoutRef: { layoutId: ids.layoutId, colIdx: 0 },
    },
    {
      id: ids.resultChart, type: 'widget', widgetId: 'insp-result-chart', instanceId: ids.resultChart,
      layoutRef: { layoutId: ids.layoutId, colIdx: 1 },
    },

    { id: ids.weeklyList, type: 'widget', widgetId: 'insp-weekly-list', instanceId: ids.weeklyList },
    { id: ids.priority, type: 'widget', widgetId: 'insp-priority', instanceId: ids.priority },

    { id: uid('t'), type: 'text', html: '' },
  ];

  return { blocks, configs };
}
