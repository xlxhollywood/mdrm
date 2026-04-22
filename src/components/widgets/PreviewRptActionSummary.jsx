'use client';

const ACTIONS = [
  { category: '파일시스템', count: 32, status: '진행중', color: '#f59e0b', desc: '불필요 로그 및 덤프 파일 정리, /backup 파티션 증설 요청 예정' },
  { category: '로그 점검',  count: 4,  status: '완료',   color: '#22c55e', desc: '에이전트 v2.3.1 → v2.3.2 패치 적용, 스크립트 호환성 확인' },
  { category: '메모리',     count: 7,  status: '진행중', color: '#f59e0b', desc: 'DBA팀 협조 PGA/SGA 파라미터 최적화 진행' },
  { category: 'CPU',        count: 3,  status: '예정',   color: '#3b82f6', desc: '비효율 쿼리 튜닝 요청 (DBA팀 처리 예정)' },
  { category: 'Disk I/O',   count: 8,  status: '진행중', color: '#f59e0b', desc: '배치 스케줄 분산 및 I/O 경합 해소 작업' },
];

const statusStyle = {
  '완료':   { bg: '#f0fdf4', color: '#22c55e', border: '#bbf7d0' },
  '진행중': { bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' },
  '예정':   { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' },
};

export default function PreviewRptActionSummary() {
  const total = ACTIONS.reduce((s, a) => s + a.count, 0);
  const done = ACTIONS.filter(a => a.status === '완료').reduce((s, a) => s + a.count, 0);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 진행률 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: '#64748b' }}>조치 진행률</span>
        <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3 }}>
          <div style={{ width: `${Math.round(done / total * 100)}%`, height: '100%', background: '#22c55e', borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>{done}/{total}건</span>
      </div>
      {/* 항목별 조치 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ACTIONS.map(a => {
          const st = statusStyle[a.status];
          return (
            <div key={a.category} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: '#f8fafc', borderRadius: 6 }}>
              <div style={{ minWidth: 80 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{a.category}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{a.count}건</div>
              </div>
              <div style={{ flex: 1, fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{a.desc}</div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, shrink: 0,
                color: st.color, background: st.bg, border: `1px solid ${st.border}`,
              }}>{a.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
