'use client';


/* ── 디자인 토큰 ── */
const T = {
  headerBg:     '#f8fafc',
  headerText:   '#475569',
  headerBorder: '#e2e8f0',
  bodyText:     '#1e293b',
  mutedText:    '#94a3b8',
  monoText:     '#334155',
  rowBorder:    '#f1f5f9',
  pass:    { text: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
  nonpass: { text: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  fail:    { text: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
  primary: '#0056a4',
};

/* ── 데이터 ── */
const SYSTEMS_COUNT = 12;
const ITEMS_COUNT = 11;
const TOTAL = SYSTEMS_COUNT * ITEMS_COUNT;
const PASS = 104, NONPASS = 20, FAIL = 8;

const FAILS = [
  { sys: 'icenshis02', item: '로그 점검', msg: 'Not found executable remote scripts' },
  { sys: 'icenspos01', item: '로그 점검', msg: 'Not found executable remote scripts' },
  { sys: 'icensbut02', item: '로그 점검', msg: 'Not found executable remote scripts' },
  { sys: 'icensga01',  item: '로그 점검', msg: 'Not found executable remote scripts' },
];

const CRITICAL = [
  { sys: 'icensbut02', item: 'CPU 사용률',  detail: 'CPU 사용률 높음',  value: '94.7%' },
  { sys: 'icensmis02', item: 'Disk I/O',    detail: 'I/O Wait 높음', value: '12.46%' },
  { sys: 'icensels02', item: 'Disk I/O',    detail: 'I/O Wait 높음', value: '14.78%' },
  { sys: 'icensns02',  item: 'Disk I/O',    detail: 'I/O Wait 높음', value: '14.58%' },
];

/* ── SVG 파이 차트 ── */
function PieChart({ size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 2;
  const segments = [
    { value: PASS,    color: T.pass.dot },
    { value: NONPASS, color: T.nonpass.dot },
    { value: FAIL,    color: T.fail.dot },
  ];

  let angle = -90; // 12시 방향부터 시작
  const paths = segments.map((seg, i) => {
    const sweep = (seg.value / TOTAL) * 360;
    const startRad = (angle * Math.PI) / 180;
    const endRad = ((angle + sweep) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = sweep > 180 ? 1 : 0;
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
    angle += sweep;
    return <path key={i} d={d} fill={seg.color} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="#e8ecf0" />
      {paths}
    </svg>
  );
}

/* ── 스코프 + 파이 히어로 ── */
function HeroSection() {
  const results = [
    { label: '준수',   value: PASS,    ...T.pass },
    { label: '미준수', value: NONPASS, ...T.nonpass },
    { label: '실패',   value: FAIL,    ...T.fail },
  ];

  return (
    <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 20, alignItems: 'center' }}>
      {/* 파이 차트 */}
      <div style={{ width: 120, height: 120, flexShrink: 0 }}>
        <PieChart />
      </div>

      {/* 우측 정보 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* 스���프 */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: '총 건수', value: TOTAL, unit: '건', bg: '#f0f1fe', color: '#4f46e5', icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>
              </svg>
            )},
            { label: '시스템', value: SYSTEMS_COUNT, unit: '대', bg: '#eef6ff', color: '#0369a1', icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            )},
            { label: '항목', value: ITEMS_COUNT, unit: '개', bg: '#faf5ff', color: '#7e22ce', icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d8b4fe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            )},
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, padding: '12px 12px', background: s.bg,
              borderRadius: 8, position: 'relative', overflow: 'hidden',
            }}>
              {/* 워터마크 아이콘 */}
              <div style={{ position: 'absolute', right: -2, bottom: -4, opacity: 0.3 }}>{s.icon}</div>
              <div style={{ fontSize: 10, color: s.color, fontWeight: 600, opacity: 0.7, marginBottom: 4 }}>{s.label}</div>
              {/* 숫자 + 단위 */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'flex-end', marginRight: 30 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.color, opacity: 0.6 }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 결과 바 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {results.map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 50 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.dot, shrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: T.headerText }}>{r.label}</span>
              </div>
              {/* 미니 프로그레스 바 */}
              <div style={{ flex: 1, height: 6, background: '#e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${(r.value / TOTAL) * 100}%`, height: '100%',
                  background: r.dot, borderRadius: 3,
                  transition: 'width 0.5s',
                }} />
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, color: r.text,
                fontVariantNumeric: 'tabular-nums', width: 28, textAlign: 'right',
              }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 상세 테이블 ── */
function DetailTable({ title, token, rows, columns }) {
  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: token.dot }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: token.text }}>{title}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.mutedText }}>{rows.length}건</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.label} style={{
                padding: '8px 10px', textAlign: col.align || 'left',
                fontSize: 10, fontWeight: 600, color: T.mutedText,
                borderBottom: `1.5px solid ${T.headerBorder}`,
                background: T.headerBg,
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '8px 10px',
                  fontSize: 11,
                  fontWeight: col.bold ? 600 : 400,
                  fontFamily: col.mono ? "'SF Mono', 'Menlo', monospace" : 'inherit',
                  color: col.color || T.bodyText,
                  textAlign: col.align || 'left',
                  borderBottom: `1px solid ${T.rowBorder}`,
                  whiteSpace: col.mono ? 'nowrap' : undefined,
                }}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── 메인 ── */
export default function PreviewRptSummaryCard({ showFailDetail = false, showNonpassDetail = false }) {
  const hasDetail = showFailDetail || showNonpassDetail;
  return (
    <div>
      <HeroSection />

      {hasDetail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {showFailDetail && (
            <div style={{ borderTop: `1px solid ${T.headerBorder}`, padding: '16px 0' }}>
              <DetailTable
                title="실패"
                token={T.fail}
                rows={FAILS.map(f => ({ sys: f.sys, item: f.item, msg: f.msg }))}
                columns={[
                  { key: 'sys',  label: '시스템',    mono: true, bold: true, color: T.monoText },
                  { key: 'item', label: '점검항목',  bold: true, color: T.fail.text },
                  { key: 'msg',  label: '상세 메시지', color: T.headerText },
                ]}
              />
            </div>
          )}
          {showNonpassDetail && (
            <div style={{ borderTop: `1px solid ${T.headerBorder}`, padding: '16px 0' }}>
              <DetailTable
                title="주요 미준수"
                token={T.nonpass}
                rows={CRITICAL.map(c => ({ sys: c.sys, item: c.item, detail: c.detail, value: c.value }))}
                columns={[
                  { key: 'sys',    label: '시스템',    mono: true, bold: true, color: T.monoText },
                  { key: 'item',   label: '점검항목',  bold: true, color: T.nonpass.text },
                  { key: 'detail', label: '요약',      color: T.headerText },
                  { key: 'value',  label: '수치',      align: 'right', bold: true, color: T.fail.text },
                ]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
