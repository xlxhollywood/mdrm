'use client';

/* ── 데이터 ── */
const ITEMS = [
  'CPU 사용률', '메모리 사용률', '파일시스템 사용량', 'Disk I/O',
  'NIC 이중화', 'Ping Loss', '로그 점검',
  '프로세스 CPU', '프로세스 메모리', '프로세스 기동', '서비스 포트',
];

const SYSTEMS = [
  'icenscdb01', 'icenscld01', 'icenscsm01', 'icenscsn01', 'icenscw01',
  'icenshis01', 'icenshis02', 'icensmis02', 'icensele01', 'icensbut02',
  'icensga01', 'icenspp02',
];

const DATA = [
  ['준수','준수','미준수','준수','준수','준수','준수','준수','준수','준수','준수'],
  ['준수','준수','미준수','준수','준수','준수','준수','준수','준수','준수','준수'],
  ['준수','준수','준수','준수','준수','준수','준수','준수','준수','준수','준수'],
  ['준수','미준수','미준수','준수','준수','준수','준수','준수','준수','준수','준수'],
  ['준수','준수','준수','준수','준수','준수','준수','준수','준수','준수','준수'],
  ['준수','실패','미준수','준수','준수','준수','준수','준수','준수','준수','준수'],
  ['준수','준수','미준수','미준수','준수','준수','실패','준수','준수','준수','준수'],
  ['실패','준수','준수','미준수','준수','준수','준수','준수','준수','준수','준수'],
  ['준수','실패','준수','미준수','준수','준수','준수','준수','준수','준수','준수'],
  ['실패','준수','미준수','준수','준수','준수','실패','준수','준수','준수','준수'],
  ['미준수','준수','준수','미준수','준수','준수','실패','준수','준수','준수','준수'],
  ['실패','미준수','미준수','준수','준수','준수','준수','준수','준수','준수','준수'],
];

/* ── 디자인 토큰 (Nutanix DS 참고) ── */
const T = {
  // 배경
  headerBg:   '#f8fafc',
  rowEven:    '#ffffff',
  rowOdd:     '#f8fafc',
  hoverRow:   '#f1f5f9',
  // 텍스트
  headerText: '#475569',
  bodyText:   '#1e293b',
  mutedText:  '#94a3b8',
  monoText:   '#334155',
  // 보더
  headerBorder: '#e2e8f0',
  rowBorder:    '#f1f5f9',
  // 상태 색상
  pass:     { text: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
  nonpass:  { text: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  fail:     { text: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
  // 히트맵 셀
  heatPass:    '#bbf7d0',
  heatNonpass: '#fde68a',
  heatFail:    '#fecaca',
  // 간격
  cellPadX:  15,
  cellPadY:  10,
  firstColPadX: 20,
  headerPadY: 10,
};

const statusToken = (s) => s === '실패' ? T.fail : s === '미준수' ? T.nonpass : T.pass;
const heatColor   = (s) => s === '실패' ? T.heatFail : s === '미준수' ? T.heatNonpass : T.heatPass;

/* ── 공통 컴포넌트 ── */
function Badge({ status }) {
  const t = statusToken(status);
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, lineHeight: 1,
      padding: '3px 7px', borderRadius: 4,
      color: t.text, background: t.bg,
      whiteSpace: 'nowrap',
    }}>{status}</span>
  );
}

function CountCell({ value, type }) {
  const t = statusToken(type);
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
      color: value > 0 ? t.text : T.mutedText,
    }}>{value}</span>
  );
}

/* ── 공통 테이블 래퍼 ── */
const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: 0 };

function THead({ children }) {
  return (
    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
      <tr>{children}</tr>
    </thead>
  );
}

function TH({ children, first, center, style: extra }) {
  return (
    <th style={{
      padding: `${T.headerPadY}px ${first ? T.firstColPadX : T.cellPadX}px`,
      textAlign: center ? 'center' : 'left',
      fontSize: 11, fontWeight: 600, color: T.headerText,
      background: T.headerBg,
      borderBottom: `1.5px solid ${T.headerBorder}`,
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
      ...extra,
    }}>{children}</th>
  );
}

function TD({ children, first, mono, center, style: extra }) {
  return (
    <td style={{
      padding: `${T.cellPadY}px ${first ? T.firstColPadX : T.cellPadX}px`,
      textAlign: center ? 'center' : 'left',
      fontFamily: mono ? "'SF Mono', 'Menlo', monospace" : 'inherit',
      fontSize: first ? 12 : 12,
      fontWeight: first ? 500 : 400,
      color: mono ? T.monoText : T.bodyText,
      whiteSpace: first ? 'nowrap' : undefined,
      borderBottom: `1px solid ${T.rowBorder}`,
      verticalAlign: 'middle',
      ...extra,
    }}>{children}</td>
  );
}

/* ── 항목별 카운트 ── */
function ByItemCountView() {
  const rows = ITEMS.map((item, itemIdx) => {
    let pass = 0, nonpass = 0, fail = 0;
    SYSTEMS.forEach((_, sysIdx) => {
      const v = DATA[sysIdx][itemIdx];
      if (v === '준수') pass++; else if (v === '미준수') nonpass++; else fail++;
    });
    return { item, pass, nonpass, fail };
  });

  return (
    <table style={tableStyle}>
      <THead>
        <TH first>점검항목</TH>
        <TH center>준수</TH>
        <TH center>미준수</TH>
        <TH center>실패</TH>
      </THead>
      <tbody>
        {rows.map((d, i) => (
          <tr key={d.item} style={{ background: i % 2 ? T.rowOdd : T.rowEven }}>
            <TD first>{d.item}</TD>
            <TD center><CountCell value={d.pass} type="준수" /></TD>
            <TD center><CountCell value={d.nonpass} type="미준수" /></TD>
            <TD center><CountCell value={d.fail} type="실패" /></TD>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 항목별 상세 ── */
function ByItemDetailView() {
  const shortSys = SYSTEMS.map(s => s.replace('icens', ''));
  return (
    <table style={tableStyle}>
      <THead>
        <TH first>점검항목</TH>
        {shortSys.map(h => <TH key={h} center>{h}</TH>)}
      </THead>
      <tbody>
        {ITEMS.map((item, itemIdx, arr) => (
          <tr key={item} style={{ background: itemIdx % 2 ? T.rowOdd : T.rowEven }}>
            <TD first>{item}</TD>
            {SYSTEMS.map((_, sysIdx) => (
              <TD key={sysIdx} center><Badge status={DATA[sysIdx][itemIdx]} /></TD>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 항목별 히트맵 ── */
function ByItemHeatmapView() {
  const shortSys = SYSTEMS.map(s => s.replace('icens', ''));
  return (
    <table style={tableStyle}>
      <THead>
        <TH first>점검항목</TH>
        {shortSys.map(h => <TH key={h} center style={{ padding: `${T.headerPadY}px 4px` }}>{h}</TH>)}
      </THead>
      <tbody>
        {ITEMS.map((item, itemIdx) => (
          <tr key={item}>
            <TD first style={{ borderBottom: `1px solid ${T.rowBorder}` }}>{item}</TD>
            {SYSTEMS.map((_, sysIdx) => {
              const status = DATA[sysIdx][itemIdx];
              return (
                <td key={sysIdx} style={{ padding: '3px 2px', borderBottom: `1px solid ${T.rowBorder}` }}>
                  <div title={`${SYSTEMS[sysIdx]}: ${status}`} style={{
                    height: 24, borderRadius: 4, background: heatColor(status),
                    transition: 'opacity 0.15s',
                  }} />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 시스템별 카운트 ── */
function BySystemCountView() {
  const rows = SYSTEMS.map((sys, sysIdx) => {
    let pass = 0, nonpass = 0, fail = 0;
    ITEMS.forEach((_, itemIdx) => {
      const v = DATA[sysIdx][itemIdx];
      if (v === '준수') pass++; else if (v === '미준수') nonpass++; else fail++;
    });
    return { sys, pass, nonpass, fail };
  });

  return (
    <table style={tableStyle}>
      <THead>
        <TH first>시스템</TH>
        <TH center>준수</TH>
        <TH center>미준수</TH>
        <TH center>실패</TH>
      </THead>
      <tbody>
        {rows.map((d, i) => (
          <tr key={d.sys} style={{ background: i % 2 ? T.rowOdd : T.rowEven }}>
            <TD first mono>{d.sys}</TD>
            <TD center><CountCell value={d.pass} type="준수" /></TD>
            <TD center><CountCell value={d.nonpass} type="미준수" /></TD>
            <TD center><CountCell value={d.fail} type="실패" /></TD>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 시스템별 상세 ── */
function BySystemDetailView() {
  const shortItems = ITEMS.map(n =>
    n.replace(' 사용률', '').replace(' 사용량', '').replace('파일시스템', '디스크').replace('프로세스 ', 'P/')
  );
  return (
    <table style={tableStyle}>
      <THead>
        <TH first>시스템</TH>
        {shortItems.map(h => <TH key={h} center>{h}</TH>)}
      </THead>
      <tbody>
        {SYSTEMS.map((sys, sysIdx) => (
          <tr key={sys} style={{ background: sysIdx % 2 ? T.rowOdd : T.rowEven }}>
            <TD first mono>{sys}</TD>
            {ITEMS.map((_, itemIdx) => (
              <TD key={itemIdx} center><Badge status={DATA[sysIdx][itemIdx]} /></TD>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 시스템별 히트맵 ── */
function BySystemHeatmapView() {
  const shortItems = ITEMS.map(n =>
    n.replace(' 사용률', '').replace(' 사용량', '').replace('파일시스템', '디스크').replace('프로세스 ', 'P/')
  );
  return (
    <table style={tableStyle}>
      <THead>
        <TH first>시스템</TH>
        {shortItems.map(h => <TH key={h} center style={{ padding: `${T.headerPadY}px 4px` }}>{h}</TH>)}
      </THead>
      <tbody>
        {SYSTEMS.map((sys, sysIdx) => (
          <tr key={sys}>
            <TD first mono style={{ borderBottom: `1px solid ${T.rowBorder}` }}>{sys}</TD>
            {ITEMS.map((item, itemIdx) => {
              const status = DATA[sysIdx][itemIdx];
              return (
                <td key={itemIdx} style={{ padding: '3px 2px', borderBottom: `1px solid ${T.rowBorder}` }}>
                  <div title={`${item}: ${status}`} style={{
                    height: 24, borderRadius: 4, background: heatColor(status),
                    transition: 'opacity 0.15s',
                  }} />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 범례 ── */
function Legend() {
  const items = [
    { label: '준수', ...T.pass },
    { label: '미준수', ...T.nonpass },
    { label: '실패', ...T.fail },
  ];
  return (
    <div style={{ padding: '10px 20px', display: 'flex', gap: 16, fontSize: 10, color: T.headerText }}>
      {items.map(({ label, dot }) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
          {label}
        </span>
      ))}
    </div>
  );
}

/* ── 메인 ── */
export default function PreviewRptInspectionStatus({ viewType, displayMode }) {
  const mode = displayMode || 'count';
  let view;
  if (viewType === 'by-system') {
    if (mode === 'heatmap') view = <BySystemHeatmapView />;
    else if (mode === 'detail') view = <BySystemDetailView />;
    else view = <BySystemCountView />;
  } else {
    if (mode === 'heatmap') view = <ByItemHeatmapView />;
    else if (mode === 'detail') view = <ByItemDetailView />;
    else view = <ByItemCountView />;
  }

  return (
    <div>
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {view}
      </div>
      <Legend />
    </div>
  );
}
