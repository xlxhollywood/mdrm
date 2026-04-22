'use client';

const FAILS = [
  { sys: 'icenshis02', item: '로그 점검', msg: 'Not found executable remote scripts', time: '11:55' },
  { sys: 'icenspos01', item: '로그 점검', msg: 'Not found executable remote scripts', time: '09:32' },
  { sys: 'icensbut02', item: '로그 점검', msg: 'Not found executable remote scripts', time: '10:05' },
  { sys: 'icensga01',  item: '로그 점검', msg: 'Not found executable remote scripts', time: '09:15' },
];

const CRITICAL = [
  { sys: 'icensbut02', item: 'CPU 사용률', value: '94.7%', color: '#ef4444' },
  { sys: 'icensmis02', item: 'Disk I/O',   value: 'iowait 12.46%', color: '#f59e0b' },
  { sys: 'icensels02', item: 'Disk I/O',   value: 'iowait 14.78%', color: '#f59e0b' },
  { sys: 'icensns02',  item: 'Disk I/O',   value: 'iowait 14.58%', color: '#f59e0b' },
];

export default function PreviewRptFailDetail() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 실패 항목 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          실패 4건 — 로그 점검 스크립트 오류
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {FAILS.map(f => (
            <div key={f.sys} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#fef2f2', borderRadius: 6, fontSize: 11 }}>
              <span style={{ fontWeight: 600, color: '#991b1b', minWidth: 90, fontFamily: 'monospace', fontSize: 10 }}>{f.sys}</span>
              <span style={{ color: '#7f1d1d', flex: 1 }}>{f.msg}</span>
              <span style={{ color: '#94a3b8', fontSize: 10 }}>{f.time}</span>
            </div>
          ))}
        </div>
      </div>
      {/* 주요 미준수 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          주요 미준수 — 긴급 조치 필요
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CRITICAL.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#fff7ed', borderRadius: 6, fontSize: 11 }}>
              <span style={{ fontWeight: 600, color: '#92400e', minWidth: 90, fontFamily: 'monospace', fontSize: 10 }}>{c.sys}</span>
              <span style={{ color: '#78350f' }}>{c.item}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 600, color: c.color }}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
