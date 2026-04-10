import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0d14",
  surface: "#111827",
  surfaceHover: "#161f30",
  border: "#1e2d45",
  borderLight: "#243550",
  accent: "#00d4ff",
  accentDim: "#0099bb",
  green: "#00e676",
  yellow: "#ffd740",
  red: "#ff5252",
  orange: "#ff9100",
  purple: "#bb86fc",
  text: "#e2e8f0",
  textMuted: "#64748b",
  textDim: "#94a3b8",
};

const statusColor = (s) =>
  s === "정상" || s === "완료" || s === "실행중"
    ? COLORS.green
    : s === "경고" || s === "대기"
    ? COLORS.yellow
    : s === "오류" || s === "실패"
    ? COLORS.red
    : COLORS.textMuted;

const Badge = ({ status }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "2px 9px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.04em",
      color: statusColor(status),
      background: statusColor(status) + "22",
      border: `1px solid ${statusColor(status)}44`,
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: statusColor(status),
        boxShadow: `0 0 6px ${statusColor(status)}`,
        animation: status === "실행중" ? "pulse 1.5s infinite" : "none",
      }}
    />
    {status}
  </span>
);

// ─── DATA ────────────────────────────────────────────────────────────────────
const dataCenters = [
  {
    id: "dc1", name: "DC-SEOUL-01", location: "서울 상암",
    systems: 24, healthy: 21, warning: 2, error: 1,
    cpu: 68, mem: 74, disk: 55, net: "1.2 Gbps",
    uptime: "99.97%", lastCheck: "00:32:14",
  },
  {
    id: "dc2", name: "DC-BUSAN-01", location: "부산 센텀",
    systems: 16, healthy: 16, warning: 0, error: 0,
    cpu: 42, mem: 58, disk: 61, net: "820 Mbps",
    uptime: "100%", lastCheck: "00:31:58",
  },
  {
    id: "dc3", name: "DC-SEOUL-02", location: "서울 가산",
    systems: 18, healthy: 14, warning: 3, error: 1,
    cpu: 81, mem: 88, disk: 72, net: "2.1 Gbps",
    uptime: "99.82%", lastCheck: "00:32:01",
  },
];

const systems = [
  { id: "s1", name: "WAS-PROD-01", dc: "DC-SEOUL-01", type: "WAS", status: "정상", cpu: 72, mem: 68, disk: 44, ip: "10.10.1.11", os: "RHEL 8.6", uptime: "47d 12h" },
  { id: "s2", name: "WAS-PROD-02", dc: "DC-SEOUL-01", type: "WAS", status: "정상", cpu: 65, mem: 71, disk: 44, ip: "10.10.1.12", os: "RHEL 8.6", uptime: "47d 12h" },
  { id: "s3", name: "DB-PROD-01", dc: "DC-SEOUL-01", type: "DB", status: "경고", cpu: 91, mem: 88, disk: 78, ip: "10.10.2.11", os: "RHEL 8.6", uptime: "47d 12h" },
  { id: "s4", name: "DB-PROD-02", dc: "DC-SEOUL-01", type: "DB", status: "정상", cpu: 44, mem: 55, disk: 76, ip: "10.10.2.12", os: "RHEL 8.6", uptime: "47d 12h" },
  { id: "s5", name: "WEB-PROD-01", dc: "DC-SEOUL-01", type: "WEB", status: "오류", cpu: 2, mem: 12, disk: 31, ip: "10.10.3.11", os: "RHEL 8.6", uptime: "0d 0h" },
  { id: "s6", name: "MQ-PROD-01", dc: "DC-BUSAN-01", type: "MQ", status: "정상", cpu: 38, mem: 50, disk: 30, ip: "10.20.1.11", os: "RHEL 8.6", uptime: "120d 4h" },
  { id: "s7", name: "APP-PROD-01", dc: "DC-SEOUL-02", type: "APP", status: "경고", cpu: 85, mem: 90, disk: 68, ip: "10.30.1.11", os: "RHEL 8.6", uptime: "12d 3h" },
  { id: "s8", name: "BATCH-01", dc: "DC-SEOUL-02", type: "BATCH", status: "정상", cpu: 55, mem: 62, disk: 55, ip: "10.30.2.11", os: "RHEL 8.6", uptime: "12d 3h" },
];

const workflows = [
  { id: "w1", name: "야간 배치 IPL", type: "IPL", status: "완료", lastRun: "2026-03-06 02:00", duration: "14m 32s", steps: 8, successSteps: 8 },
  { id: "w2", name: "정산 배치 처리", type: "배치", status: "실행중", lastRun: "2026-03-06 04:00", duration: "진행중", steps: 12, successSteps: 7 },
  { id: "w3", name: "DB 백업 플로우", type: "백업", status: "완료", lastRun: "2026-03-06 01:00", duration: "28m 11s", steps: 5, successSteps: 5 },
  { id: "w4", name: "월말 정산 배치", type: "배치", status: "대기", lastRun: "-", duration: "-", steps: 15, successSteps: 0 },
  { id: "w5", name: "시스템 재기동 플로우", type: "IPL", status: "실패", lastRun: "2026-03-05 22:00", duration: "3m 12s", steps: 10, successSteps: 3 },
];

const inspections = [
  { id: "i1", name: "서버 헬스체크", target: "전체 시스템", schedule: "매일 00:00, 06:00, 12:00, 18:00", type: "주기", status: "정상", lastRun: "2026-03-06 06:00", nextRun: "2026-03-06 12:00" },
  { id: "i2", name: "DB 테이블스페이스 점검", target: "DB-PROD-*", schedule: "매주 월요일 01:00", type: "주기", status: "경고", lastRun: "2026-03-03 01:00", nextRun: "2026-03-10 01:00" },
  { id: "i3", name: "배치 완료 검증", target: "BATCH-01", schedule: "배치 완료 후 즉시", type: "단발", status: "완료", lastRun: "2026-03-06 04:47", nextRun: "-" },
  { id: "i4", name: "네트워크 포트 스캔", target: "전체 DC", schedule: "매월 1일 03:00", type: "주기", status: "정상", lastRun: "2026-03-01 03:00", nextRun: "2026-04-01 03:00" },
  { id: "i5", name: "인증서 만료 점검", target: "WEB-PROD-*", schedule: "2026-03-15 09:00", type: "단발", status: "대기", lastRun: "-", nextRun: "2026-03-15 09:00" },
];

// ─── GAUGE ────────────────────────────────────────────────────────────────────
const MiniBar = ({ value, warn = 80, danger = 90 }) => {
  const color = value >= danger ? COLORS.red : value >= warn ? COLORS.yellow : COLORS.green;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "#1e2d45", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: 11, color, fontFamily: "monospace", minWidth: 30, textAlign: "right" }}>{value}%</span>
    </div>
  );
};

// ─── FLOWCHART ────────────────────────────────────────────────────────────────
const FlowNode = ({ node, selected, onClick }) => {
  const colors = {
    start: { bg: "#00e67622", border: COLORS.green, text: COLORS.green },
    end: { bg: "#ff525222", border: COLORS.red, text: COLORS.red },
    task: { bg: "#00d4ff22", border: COLORS.accent, text: COLORS.accent },
    condition: { bg: "#ffd74022", border: COLORS.yellow, text: COLORS.yellow },
    parallel: { bg: "#bb86fc22", border: COLORS.purple, text: COLORS.purple },
  };
  const c = colors[node.type] || colors.task;
  const shape = node.type === "condition" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : node.type === "start" || node.type === "end" ? "none" : "none";
  return (
    <div
      onClick={() => onClick(node)}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: node.w || 130,
        height: node.h || 44,
        background: c.bg,
        border: `1.5px solid ${selected ? "#fff" : c.border}`,
        borderRadius: node.type === "start" || node.type === "end" ? 22 : node.type === "condition" ? 0 : 6,
        clipPath: node.type === "condition" ? shape : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: selected ? `0 0 16px ${c.border}` : `0 0 8px ${c.border}44`,
        transition: "all 0.2s",
        zIndex: 2,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: c.text, textAlign: "center", padding: "0 8px", lineHeight: 1.3 }}>
        {node.label}
      </span>
      {node.status && (
        <span style={{
          position: "absolute", top: -8, right: -8,
          width: 14, height: 14, borderRadius: "50%",
          background: node.status === "done" ? COLORS.green : node.status === "running" ? COLORS.accent : node.status === "fail" ? COLORS.red : "#333",
          border: "2px solid #0a0d14",
          boxShadow: `0 0 6px ${node.status === "done" ? COLORS.green : node.status === "running" ? COLORS.accent : COLORS.red}`,
          animation: node.status === "running" ? "pulse 1s infinite" : "none"
        }} />
      )}
    </div>
  );
};

const sampleFlow = {
  nodes: [
    { id: "n0", type: "start", label: "시작", x: 180, y: 20, w: 100, h: 36, status: "done" },
    { id: "n1", type: "task", label: "사전 점검\n(Pre-check)", x: 145, y: 90, w: 170, h: 44, status: "done" },
    { id: "n2", type: "condition", label: "점검 통과?", x: 170, y: 172, w: 120, h: 44, status: "done" },
    { id: "n3", type: "task", label: "서비스 중지", x: 60, y: 254, w: 130, h: 44, status: "done" },
    { id: "n4", type: "task", label: "알림 발송\n(오류)", x: 295, y: 254, w: 130, h: 44, status: null },
    { id: "n5", type: "parallel", label: "병렬: OS 재기동\n+ DB 재기동", x: 60, y: 334, w: 160, h: 44, status: "done" },
    { id: "n6", type: "task", label: "서비스 기동", x: 80, y: 414, w: 130, h: 44, status: "running" },
    { id: "n7", type: "task", label: "사후 검증", x: 80, y: 494, w: 130, h: 44, status: null },
    { id: "n8", type: "end", label: "완료", x: 180, y: 574, w: 100, h: 36, status: null },
  ],
  edges: [
    { from: "n0", to: "n1" },
    { from: "n1", to: "n2" },
    { from: "n2", to: "n3", label: "Yes" },
    { from: "n2", to: "n4", label: "No" },
    { from: "n3", to: "n5" },
    { from: "n5", to: "n6" },
    { from: "n6", to: "n7" },
    { from: "n7", to: "n8" },
  ],
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dc");
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflows[1]);
  const [tick, setTick] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 3000);
    return () => clearInterval(t);
  }, []);

  // Draw flowchart edges
  useEffect(() => {
    if (tab !== "workflow") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodeMap = {};
    sampleFlow.nodes.forEach((n) => (nodeMap[n.id] = n));

    sampleFlow.edges.forEach(({ from, to, label }) => {
      const a = nodeMap[from], b = nodeMap[to];
      const ax = a.x + (a.w || 130) / 2, ay = a.y + (a.h || 44);
      const bx = b.x + (b.w || 130) / 2, by = b.y;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.bezierCurveTo(ax, ay + 20, bx, by - 20, bx, by);
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // arrowhead
      ctx.beginPath();
      ctx.moveTo(bx - 5, by - 8);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + 5, by - 8);
      ctx.strokeStyle = COLORS.borderLight;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (label) {
        ctx.font = "10px monospace";
        ctx.fillStyle = COLORS.yellow;
        ctx.fillText(label, (ax + bx) / 2 + 4, (ay + by) / 2);
      }
    });
  }, [tab, tick]);

  const tabs = [
    { id: "dc", label: "데이터센터", icon: "🏢" },
    { id: "system", label: "시스템", icon: "🖥" },
    { id: "workflow", label: "워크플로우", icon: "⚡" },
    { id: "inspection", label: "점검 작업", icon: "🔍" },
  ];

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0a0d14; }
        ::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .row-hover:hover { background: #131f32 !important; }
        .tab-btn:hover { background: #1a2740 !important; }
        .card-hover:hover { border-color: #243550 !important; background: #131f32 !important; }
        .btn:hover { opacity: 0.8; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#080b12", borderBottom: `1px solid ${COLORS.border}`, padding: "0 28px", display: "flex", alignItems: "center", height: 54, gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚙</div>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>자동화</span>
          <span style={{ color: COLORS.textMuted, fontSize: 12 }}>/ Automation Center</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>
          <span>총 시스템 <strong style={{ color: COLORS.text }}>58</strong></span>
          <span style={{ color: COLORS.green }}>● 정상 51</span>
          <span style={{ color: COLORS.yellow }}>● 경고 5</span>
          <span style={{ color: COLORS.red }}>● 오류 2</span>
          <span style={{ color: COLORS.textMuted }}>| {new Date().toLocaleTimeString("ko-KR")}</span>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ background: "#0d1321", borderBottom: `1px solid ${COLORS.border}`, padding: "0 28px", display: "flex", gap: 4 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className="tab-btn"
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? COLORS.surface : "transparent",
              border: "none",
              borderBottom: tab === t.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
              color: tab === t.id ? COLORS.text : COLORS.textMuted,
              padding: "12px 20px",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: tab === t.id ? 600 : 400,
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "all 0.15s",
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24, animation: "fadeIn 0.3s ease" }} key={tab}>

        {/* ── 데이터센터 ── */}
        {tab === "dc" && (
          <div>
            <SectionHeader title="데이터센터 통합 뷰" sub="전체 데이터센터의 시스템 상태 현황" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {dataCenters.map((dc) => (
                <div key={dc.id} className="card-hover" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 2 }}>{dc.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{dc.location}</div>
                    </div>
                    <Badge status={dc.error > 0 ? "오류" : dc.warning > 0 ? "경고" : "정상"} />
                  </div>

                  {/* System status mini-grid */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {[...Array(dc.healthy)].map((_, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.green, opacity: 0.8 }} />)}
                    {[...Array(dc.warning)].map((_, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.yellow }} />)}
                    {[...Array(dc.error)].map((_, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.red, animation: "pulse 1s infinite" }} />)}
                  </div>

                  <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
                    {[["CPU", dc.cpu], ["MEM", dc.mem], ["DISK", dc.disk]].map(([k, v]) => (
                      <div key={k} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: COLORS.textMuted }}>{k}</span>
                        <MiniBar value={v} />
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textMuted }}>
                    <span>업타임 <strong style={{ color: COLORS.green }}>{dc.uptime}</strong></span>
                    <span>NET <strong style={{ color: COLORS.accent }}>{dc.net}</strong></span>
                    <span>점검 <strong style={{ color: COLORS.text }}>{dc.lastCheck}</strong>전</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary table */}
            <SectionHeader title="전체 시스템 상태 요약" sub="데이터센터별 시스템 현황" />
            <Table
              cols={["데이터센터", "시스템 수", "정상", "경고", "오류", "가용률"]}
              rows={dataCenters.map((dc) => [
                <span style={{ fontWeight: 600 }}>{dc.name}</span>,
                dc.systems,
                <span style={{ color: COLORS.green }}>{dc.healthy}</span>,
                <span style={{ color: COLORS.yellow }}>{dc.warning}</span>,
                <span style={{ color: COLORS.red }}>{dc.error}</span>,
                <span style={{ color: COLORS.accent }}>{dc.uptime}</span>,
              ])}
            />
          </div>
        )}

        {/* ── 시스템 ── */}
        {tab === "system" && (
          <div>
            <SectionHeader title="시스템 모니터링" sub="개별 서버 리소스 및 상태 현황" action={
              <div style={{ display: "flex", gap: 8 }}>
                {["전체", "WAS", "DB", "WEB", "APP", "MQ", "BATCH"].map((f) => (
                  <button key={f} className="btn" style={{ background: f === "전체" ? COLORS.accent + "22" : "transparent", border: `1px solid ${f === "전체" ? COLORS.accent : COLORS.border}`, color: f === "전체" ? COLORS.accent : COLORS.textMuted, borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>{f}</button>
                ))}
              </div>
            } />
            <div style={{ display: "grid", gap: 8 }}>
              {systems.map((sys) => (
                <div key={sys.id} className="row-hover" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "14px 18px", display: "grid", gridTemplateColumns: "180px 90px 90px 1fr 1fr 1fr 120px 100px", gap: 12, alignItems: "center", transition: "all 0.15s" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{sys.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{sys.ip} · {sys.dc}</div>
                  </div>
                  <span style={{ fontSize: 11, color: COLORS.textDim, background: COLORS.border, padding: "2px 7px", borderRadius: 4, textAlign: "center" }}>{sys.type}</span>
                  <Badge status={sys.status} />
                  <div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3 }}>CPU</div>
                    <MiniBar value={sys.cpu} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3 }}>MEM</div>
                    <MiniBar value={sys.mem} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3 }}>DISK</div>
                    <MiniBar value={sys.disk} />
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                    <div>{sys.os}</div>
                    <div style={{ color: COLORS.textDim }}>UP {sys.uptime}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn" style={{ fontSize: 10, background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>상세</button>
                    <button className="btn" style={{ fontSize: 10, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>터미널</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 워크플로우 ── */}
        {tab === "workflow" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 280px", gap: 16, height: "calc(100vh - 140px)" }}>
            {/* Workflow list */}
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 600, fontSize: 13 }}>워크플로우</span>
                <button className="btn" style={{ background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, borderRadius: 4, padding: "3px 10px", fontSize: 11, cursor: "pointer" }}>+ 생성</button>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {workflows.map((w) => (
                  <div key={w.id} className="row-hover" onClick={() => setSelectedWorkflow(w)} style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", background: selectedWorkflow?.id === w.id ? "#131f32" : "transparent", borderLeft: selectedWorkflow?.id === w.id ? `3px solid ${COLORS.accent}` : "3px solid transparent", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{w.name}</span>
                      <Badge status={w.status} />
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                      <span style={{ background: COLORS.border, padding: "1px 5px", borderRadius: 3, marginRight: 6 }}>{w.type}</span>
                      스텝 {w.successSteps}/{w.steps}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "'IBM Plex Sans'" }}>{selectedWorkflow?.name}</span>
                <Badge status={selectedWorkflow?.status} />
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  {["▶ 실행", "⏸ 일시정지", "✎ 편집"].map((b) => (
                    <button key={b} className="btn" style={{ background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textDim, borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>{b}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, position: "relative", overflow: "auto", background: `radial-gradient(circle at 20px 20px, ${COLORS.border}33 1px, transparent 1px)`, backgroundSize: "24px 24px" }}>
                <canvas ref={canvasRef} width={460} height={640} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }} />
                <div style={{ position: "relative", width: 460, height: 640 }}>
                  {sampleFlow.nodes.map((node) => (
                    <FlowNode key={node.id} node={node} selected={selectedNode?.id === node.id} onClick={setSelectedNode} />
                  ))}
                </div>
              </div>
              {/* Legend */}
              <div style={{ padding: "8px 16px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 14, fontSize: 10, color: COLORS.textMuted }}>
                {[["완료", COLORS.green], ["실행중", COLORS.accent], ["오류", COLORS.red], ["대기", "#444"]].map(([l, c]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block", boxShadow: `0 0 4px ${c}` }} />{l}
                  </span>
                ))}
              </div>
            </div>

            {/* Detail panel */}
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "'IBM Plex Sans'" }}>{selectedNode ? "스텝 상세" : "워크플로우 정보"}</span>
              </div>
              <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
                {selectedNode ? (
                  <div style={{ animation: "fadeIn 0.2s ease" }}>
                    <KV k="스텝명" v={selectedNode.label.replace("\n", " ")} />
                    <KV k="유형" v={selectedNode.type} />
                    <KV k="상태" v={selectedNode.status === "done" ? "완료" : selectedNode.status === "running" ? "실행중" : selectedNode.status === "fail" ? "오류" : "대기"} />
                    <KV k="ID" v={selectedNode.id} mono />
                    <div style={{ marginTop: 16, padding: 12, background: "#0a0d14", borderRadius: 6, fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6, fontFamily: "monospace" }}>
                      <div style={{ color: COLORS.textDim, marginBottom: 6 }}># 실행 로그</div>
                      {selectedNode.status === "done" && <><div style={{ color: COLORS.green }}>[OK] 스텝 시작</div><div style={{ color: COLORS.green }}>[OK] 실행 완료</div><div style={{ color: COLORS.textMuted }}>소요: 00:01:24</div></>}
                      {selectedNode.status === "running" && <><div style={{ color: COLORS.green }}>[OK] 스텝 시작</div><div style={{ color: COLORS.accent, animation: "pulse 1s infinite" }}>[..] 실행 중...</div></>}
                      {!selectedNode.status && <div style={{ color: COLORS.textMuted }}>[--] 대기 중</div>}
                    </div>
                  </div>
                ) : selectedWorkflow && (
                  <div>
                    <KV k="이름" v={selectedWorkflow.name} />
                    <KV k="유형" v={selectedWorkflow.type} />
                    <KV k="상태" v={selectedWorkflow.status} />
                    <KV k="마지막 실행" v={selectedWorkflow.lastRun} />
                    <KV k="소요 시간" v={selectedWorkflow.duration} />
                    <KV k="전체 스텝" v={selectedWorkflow.steps} />
                    <KV k="완료 스텝" v={selectedWorkflow.successSteps} />
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>진행률</div>
                      <div style={{ height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${(selectedWorkflow.successSteps / selectedWorkflow.steps) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.green})`, borderRadius: 4 }} />
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 4, textAlign: "right" }}>
                        {Math.round((selectedWorkflow.successSteps / selectedWorkflow.steps) * 100)}%
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: COLORS.textMuted }}>스텝을 클릭하면 상세 정보가 표시됩니다.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 점검 작업 ── */}
        {tab === "inspection" && (
          <div>
            <SectionHeader title="점검 작업" sub="주기적·단발적 점검 스케줄 관리" action={
              <button className="btn" style={{ background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, borderRadius: 4, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Sans'" }}>+ 점검 작업 추가</button>
            } />

            {/* Stats strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "전체 작업", value: inspections.length, color: COLORS.text },
                { label: "실행 중", value: inspections.filter(i => i.status === "실행중").length, color: COLORS.accent },
                { label: "경고", value: inspections.filter(i => i.status === "경고").length, color: COLORS.yellow },
                { label: "다음 실행", value: "12:00", color: COLORS.green },
              ].map((s) => (
                <div key={s.label} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "14px 18px" }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'IBM Plex Sans'" }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {inspections.map((ins) => (
                <div key={ins.id} className="row-hover" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "16px 20px", display: "grid", gridTemplateColumns: "200px 120px 1fr 1fr 1fr 130px 120px", gap: 12, alignItems: "center", transition: "all 0.15s" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{ins.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{ins.target}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Badge status={ins.status} />
                    <span style={{ fontSize: 10, color: ins.type === "주기" ? COLORS.accent : COLORS.purple, background: (ins.type === "주기" ? COLORS.accent : COLORS.purple) + "22", padding: "2px 7px", borderRadius: 3, textAlign: "center" }}>{ins.type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.5 }}>
                    <div style={{ color: COLORS.textMuted, fontSize: 10, marginBottom: 2 }}>스케줄</div>
                    {ins.schedule}
                  </div>
                  <div style={{ fontSize: 11 }}>
                    <div style={{ color: COLORS.textMuted, fontSize: 10, marginBottom: 2 }}>마지막 실행</div>
                    <span style={{ color: COLORS.textDim }}>{ins.lastRun}</span>
                  </div>
                  <div style={{ fontSize: 11 }}>
                    <div style={{ color: COLORS.textMuted, fontSize: 10, marginBottom: 2 }}>다음 실행</div>
                    <span style={{ color: ins.nextRun === "-" ? COLORS.textMuted : COLORS.green }}>{ins.nextRun}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="btn" style={{ fontSize: 10, background: COLORS.green + "22", border: `1px solid ${COLORS.green}44`, color: COLORS.green, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>즉시 실행</button>
                    <button className="btn" style={{ fontSize: 10, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>편집</button>
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted, display: "flex", gap: 6 }}>
                    <button className="btn" style={{ fontSize: 10, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>이력</button>
                    <button className="btn" style={{ fontSize: 10, background: "transparent", border: `1px solid ${COLORS.red}33`, color: COLORS.red, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
      <div>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 15 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
    </div>
  );
}

function KV({ k, v, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8, fontSize: 12 }}>
      <span style={{ color: COLORS.textMuted }}>{k}</span>
      <span style={{ color: COLORS.text, fontFamily: mono ? "monospace" : "inherit" }}>{v}</span>
    </div>
  );
}

function Table({ cols, rows }) {
  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, background: "#0d1321", padding: "10px 18px", borderBottom: `1px solid ${COLORS.border}` }}>
        {cols.map((c) => <span key={c} style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, letterSpacing: "0.05em" }}>{c}</span>)}
      </div>
      {rows.map((row, i) => (
        <div key={i} className="row-hover" style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, padding: "12px 18px", borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.border}` : "none", transition: "all 0.15s" }}>
          {row.map((cell, j) => <span key={j} style={{ fontSize: 13 }}>{cell}</span>)}
        </div>
      ))}
    </div>
  );
}
