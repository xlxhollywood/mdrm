import React, { useState, useCallback, useEffect } from 'react';
import './WidgetDashboard.css';

/* ─── Local Asset Paths (saved from Figma) ──── */
const imgViewImage  = '/assets/logo.png';
const imgIconNoti   = '/assets/icon-noti.png';
const imgIconUser   = '/assets/icon-user.png';
const imgIconSet    = '/assets/icon-settings.png';
// 시스템 상태 위젯_심플
const imgStatus1    = '/assets/widget-status.png';
const imgDatacenter = '/assets/icon-datacenter-img.png';
const imgDrag1      = '/assets/icon-drag.png';
const imgIconOk     = '/assets/icon-ok.png';
const imgIconWarn   = '/assets/icon-warn.png';
const imgIconOffline= '/assets/icon-offline.png';
// 시스템 변경이력 위젯_테이블
const imgServerBox  = '/assets/icon-server-box.png';
// 시스템 유형 위젯_심플
const imgCategories = '/assets/widget-categories.png';
const imgIconServer  = '/assets/icon-server.png';
const imgIconNetwork = '/assets/icon-network.png';
const imgIconStorage = '/assets/icon-storage.png';

/* ─── Navbar ──────────────────────────────────── */
const NAV_MENUS = ['대시보드', '시스템', '워크플로우', '점검작업', '리포트'];

function AppHeader() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hh = String(h % 12 || 12).padStart(2, '0');
      return `${ampm} ${hh}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', height: 40, flexShrink: 0 }}>
      {/* Logo info — 245px, #2d57ac */}
      <div style={{
        width: 245, flexShrink: 0, background: '#2d57ac',
        borderBottom: '1px solid #525151', borderTop: '1px solid #525151',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img src={imgViewImage} alt="logo"
          style={{ width: 154, height: 30, objectFit: 'contain', pointerEvents: 'none' }} />
      </div>

      {/* 네비 바 컴포넌트 — flex-grow, #2d57ac */}
      <div style={{
        flex: 1, background: '#2d57ac', borderBottom: '1px solid #2d57ac',
        display: 'flex', alignItems: 'center', position: 'relative',
      }}>
        {/* Left menus */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: 5 }}>
          {NAV_MENUS.map((menu) => {
            const isActive = menu === '리포트';
            return (
              <div key={menu} style={{
                height: 32, minWidth: 78, padding: '0 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? '#224895' : 'transparent',
                borderRadius: isActive ? 2 : 0,
                cursor: isActive ? 'pointer' : 'default',
                marginTop: 4,
              }}>
                <span style={{
                  fontSize: 14, fontFamily: "'Apple SD Gothic Neo', sans-serif",
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#fff' : '#b8cbf3',
                  whiteSpace: 'nowrap',
                  opacity: isActive ? 1 : 0.6,
                }}>{menu}</span>
              </div>
            );
          })}
        </div>

        {/* Right icons */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, paddingRight: 16 }}>
          <div style={{ position: 'relative', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imgIconUser} alt="user" style={{ width: 28, height: 28 }} />
          </div>
          <div style={{ position: 'relative', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imgIconNoti} alt="noti" style={{ width: 28, height: 28 }} />
            <div style={{
              position: 'absolute', top: 2, right: 0,
              background: '#ec1d46', borderRadius: 10,
              minWidth: 16, height: 14, padding: '0 3px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: 'Arial, sans-serif',
            }}>9+</div>
          </div>
          <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imgIconSet} alt="settings" style={{ width: 28, height: 28 }} />
          </div>
          <div style={{ width: 1, height: 22, background: '#4874ce', margin: '0 8px' }} />
          <span style={{
            fontSize: 13, fontFamily: "'Apple SD Gothic Neo', sans-serif",
            color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap',
          }}>{time}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Widget Definitions ───────────────────────── */
const WIDGET_CATEGORIES = {
  system: {
    label: '시스템',
    icon: '🖥',
    widgets: [
      {
        id: 'sys-status',
        name: '시스템 상태',
        desc: '심플 · 도넛 · 막대',
        icon: '📊',
        viewTypes: [
          { id: 'simple', label: '심플형', icon: '▦' },
          { id: 'donut', label: '도넛 차트', icon: '◎' },
          { id: 'bar', label: '막대 차트', icon: '▬' },
        ],
        hasPeriod: false,
      },
      {
        id: 'sys-type',
        name: '시스템 유형',
        desc: '심플 · 도넛 · 막대',
        icon: '🗂',
        viewTypes: [
          { id: 'simple', label: '심플형', icon: '▦' },
          { id: 'donut', label: '도넛 차트', icon: '◎' },
          { id: 'bar', label: '막대 차트', icon: '▬' },
        ],
        hasPeriod: false,
      },
      {
        id: 'sys-history',
        name: '시스템 변경 이력',
        desc: '심플 · 테이블',
        icon: '📋',
        viewTypes: [
          { id: 'simple', label: '심플형', icon: '▦' },
          { id: 'table', label: '테이블형', icon: '☰' },
        ],
        hasPeriod: false,
      },
    ],
  },
  workflow: {
    label: '워크플로우',
    icon: '⚙',
    widgets: [
      {
        id: 'wf-process',
        name: '워크플로우 절차',
        desc: '테이블 · 플로우차트',
        icon: '↔',
        viewTypes: [
          { id: 'table', label: '테이블형', icon: '☰' },
          { id: 'flowchart', label: '플로우차트', icon: '⟶' },
        ],
        hasPeriod: true,
      },
      {
        id: 'wf-result',
        name: '워크플로우 실행 결과',
        desc: '심플 · 테이블 · 플로우차트',
        icon: '✓',
        viewTypes: [
          { id: 'simple', label: '심플형', icon: '▦' },
          { id: 'table', label: '테이블형', icon: '☰' },
          { id: 'flowchart', label: '플로우차트', icon: '⟶' },
        ],
        hasPeriod: true,
      },
      {
        id: 'wf-history',
        name: '워크플로우 실행 이력',
        desc: '기간 설정',
        icon: '🕐',
        viewTypes: [],
        hasPeriod: true,
      },
    ],
  },
  inspection: {
    label: '점검 작업',
    icon: '🔍',
    widgets: [
      {
        id: 'insp-result',
        name: '점검 결과',
        desc: '기간 설정',
        icon: '📝',
        viewTypes: [],
        hasPeriod: true,
      },
      {
        id: 'insp-schedule',
        name: '점검 작업 스케줄',
        desc: '기간 설정',
        icon: '📅',
        viewTypes: [],
        hasPeriod: true,
      },
    ],
  },
};

const TODAY = new Date().toISOString().split('T')[0];
const MONTH_AGO = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

const QUICK_PERIODS = ['오늘', '1주', '1개월', '3개월', '6개월'];

/* ─── Preview Components ──────────────────────── */
function PreviewSimple() {
  const rows = [
    { icon: imgIconOk,      label: '정상',    count: 3 },
    { icon: imgIconWarn,    label: '경고',    count: 1 },
    { icon: imgIconOffline, label: '오프라인', count: 1 },
  ];
  return (
    /* 피그마 "시스템 상태 위젯_심플" — 274×153 */
    <div style={{ position: 'relative', width: 274, height: 153, background: '#fff', border: '1px solid #d9dfe5', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
      {/* 타이틀 */}
      <span style={{ position: 'absolute', left: 10, top: 13, fontSize: 12, color: '#5b646f', fontFamily: "'Apple SD Gothic Neo', sans-serif", lineHeight: '20px' }}>
        시스템 상태
      </span>

      {/* 왼쪽 상태 이미지 */}
      <img src={imgStatus1} alt="status" style={{ position: 'absolute', left: 10, top: 29, width: 108, height: 108, objectFit: 'cover', pointerEvents: 'none' }} />

      {/* 오른쪽 패널 */}
      <div style={{ position: 'absolute', left: 151, top: 39, width: 83, height: 76 }}>
        {/* Datacenter 헤더 */}
        <div style={{ position: 'absolute', left: 0, top: 0, height: 16, width: 79, display: 'flex', alignItems: 'center', gap: 4 }}>
          <img src={imgDatacenter} alt="dc" style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#3571ce', fontFamily: "'Apple SD Gothic Neo', sans-serif", whiteSpace: 'nowrap' }}>Datacenter</span>
        </div>

        {/* 상태 rows */}
        <div style={{ position: 'absolute', left: 3, top: 24, width: 80, height: 57, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {rows.map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', height: 19 }}>
              <img src={r.icon} alt={r.label} style={{ width: 10, height: 10, flexShrink: 0 }} />
              <span style={{ marginLeft: 8, fontSize: 10, color: '#5b646f', fontFamily: "'Apple SD Gothic Neo', sans-serif", flex: 1 }}>{r.label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#1a222b' }}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 드래그 핸들 */}
      <img src={imgDrag1} alt="drag" style={{ position: 'absolute', right: 8, top: 12, width: 16, height: 16, pointerEvents: 'none' }} />
    </div>
  );
}

const IcoServer = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <rect x="0.5" y="0.5" width="9" height="3.5" rx="1" fill="#3571ce" stroke="#3571ce" strokeWidth="0.3"/>
    <rect x="0.5" y="5.5" width="9" height="3.5" rx="1" fill="#3571ce" stroke="#3571ce" strokeWidth="0.3"/>
    <circle cx="7.8" cy="2.25" r="0.7" fill="#fff"/>
    <circle cx="7.8" cy="7.25" r="0.7" fill="#fff"/>
    <rect x="1.5" y="1.7" width="4" height="1" rx="0.4" fill="#fff" opacity="0.7"/>
    <rect x="1.5" y="6.7" width="4" height="1" rx="0.4" fill="#fff" opacity="0.7"/>
  </svg>
);

const IcoNetwork = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <circle cx="5" cy="5" r="1.2" fill="#3571ce"/>
    <circle cx="1.5" cy="2" r="1" fill="#3571ce"/>
    <circle cx="8.5" cy="2" r="1" fill="#3571ce"/>
    <circle cx="1.5" cy="8" r="1" fill="#3571ce"/>
    <circle cx="8.5" cy="8" r="1" fill="#3571ce"/>
    <line x1="5" y1="5" x2="1.5" y2="2" stroke="#3571ce" strokeWidth="0.8"/>
    <line x1="5" y1="5" x2="8.5" y2="2" stroke="#3571ce" strokeWidth="0.8"/>
    <line x1="5" y1="5" x2="1.5" y2="8" stroke="#3571ce" strokeWidth="0.8"/>
    <line x1="5" y1="5" x2="8.5" y2="8" stroke="#3571ce" strokeWidth="0.8"/>
  </svg>
);

const IcoStorage = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <ellipse cx="5" cy="2.2" rx="3.8" ry="1.4" fill="#3571ce"/>
    <rect x="1.2" y="2.2" width="7.6" height="5.2" fill="#3571ce"/>
    <ellipse cx="5" cy="7.4" rx="3.8" ry="1.4" fill="#4a82d4"/>
    <ellipse cx="5" cy="2.2" rx="3.8" ry="1.4" fill="#5590e0"/>
    <ellipse cx="5" cy="4.8" rx="3.8" ry="1.2" fill="#4a82d4" opacity="0.6"/>
  </svg>
);

function PreviewSimpleType() {
  const rows = [
    { icon: <IcoServer />,  label: '서버',    count: 3 },
    { icon: <IcoNetwork />, label: '네트워크', count: 1 },
    { icon: <IcoStorage />, label: '스토리지', count: 1 },
  ];
  return (
    /* 피그마 "시스템 유형 위젯_심플" — 274×153 */
    <div style={{ position: 'relative', width: 274, height: 153, background: '#fff', border: '1px solid #d9dfe5', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
      <span style={{ position: 'absolute', left: 10, top: 13, fontSize: 12, color: '#5b646f', fontFamily: "'Apple SD Gothic Neo', sans-serif", lineHeight: '20px' }}>
        시스템 유형
      </span>

      <img src={imgCategories} alt="categories" style={{ position: 'absolute', left: 21, top: 42, width: 82, height: 82, objectFit: 'cover', pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', left: 151, top: 39, width: 83, height: 76 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: 16, width: 79, display: 'flex', alignItems: 'center', gap: 4 }}>
          <img src={imgDatacenter} alt="dc" style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#3571ce', fontFamily: "'Apple SD Gothic Neo', sans-serif", whiteSpace: 'nowrap' }}>Datacenter</span>
        </div>
        <div style={{ position: 'absolute', left: 3, top: 24, width: 80, height: 57, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {rows.map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', height: 19 }}>
              <span style={{ width: 10, height: 10, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{r.icon}</span>
              <span style={{ marginLeft: 8, fontSize: 10, color: '#5b646f', fontFamily: "'Apple SD Gothic Neo', sans-serif", flex: 1 }}>{r.label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#1a222b' }}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      <img src={imgDrag1} alt="drag" style={{ position: 'absolute', right: 8, top: 12, width: 16, height: 16, pointerEvents: 'none' }} />
    </div>
  );
}

function PreviewDonut() {
  const segments = [
    { pct: 65, color: '#00bc7d', label: '정상 65%' },
    { pct: 20, color: '#fd9a00', label: '경고 20%' },
    { pct: 15, color: '#fb2c36', label: '오류 15%' },
  ];
  // SVG donut
  const r = 30, cx = 40, cy = 40, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="wd-preview-donut">
      <svg viewBox="0 0 80 80">
        {segments.map((s, i) => {
          const dash = (s.pct / 100) * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={s.color} strokeWidth={12}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ / 100 + circ / 4 * -1}
              transform="rotate(-90 40 40)"
            />
          );
          offset += s.pct;
          return el;
        })}
        <circle cx={cx} cy={cy} r={18} fill="#fff" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="#1a222b" fontWeight="700">12</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#5b646f' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewBar() {
  const data = [
    { label: '서버', pct: 75, color: '#3571ce' },
    { label: 'DB', pct: 45, color: '#3571ce' },
    { label: '네트워크', pct: 90, color: '#3571ce' },
    { label: '앱', pct: 30, color: '#3571ce' },
  ];
  return (
    <div className="wd-preview-bar">
      {data.map(d => (
        <div key={d.label} className="wd-preview-bar-row">
          <span className="wd-preview-bar-label">{d.label}</span>
          <div className="wd-preview-bar-track">
            <div className="wd-preview-bar-fill" style={{ width: `${d.pct}%`, background: d.color }} />
          </div>
          <span style={{ fontSize: 10, color: '#5b646f', width: 28, textAlign: 'right' }}>{d.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function PreviewHistoryTable() {
  // CSS grid template: icon | name | item | before | after | date
  const GRID = '26px 140px 120px 140px 130px 72px';

  const rows = [
    { name: 'MDRMMSL-Agent-01', item: 'Kernel',       before: '10.0.14393.0',              after: '10.0.14393.1',              date: '25-08-19' },
    { name: '10.110.34.111',    item: 'OS',            before: 'Windows Server 2016 Std',   after: 'Windows Server 2016 Std',   date: '25-11-04' },
    { name: '10.110.34.112',    item: 'Memory size',   before: '2048 MB',                   after: '2048 MB',                   date: '25-11-07' },
    { name: '10.110.98.11',     item: 'Product name',  before: 'VMware Virtual Platform',   after: 'VMware Virtual Platform',   date: '26-03-03' },
    { name: '10.120.30.91',     item: 'System vendor', before: 'Unknown',                   after: '-',                         date: '26-03-06' },
    { name: 'Switch-Core-01',   item: 'FQDN',          before: 'Cisco IOS',                 after: 'SNMP',                      date: '26-02-15' },
    { name: 'Router-Main',      item: 'Kernel',        before: 'Juniper Junos',             after: 'SNMP',                      date: '26-01-20' },
  ];

  const SortIcon = () => (
    <svg width="7" height="10" viewBox="0 0 7 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3.5 0.5L6.5 4H0.5L3.5 0.5Z" fill="#c0c7ce"/>
      <path d="M3.5 9.5L0.5 6H6.5L3.5 9.5Z" fill="#c0c7ce"/>
    </svg>
  );

  const cellBase = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 };

  return (
    <div style={{
      width: 700, background: '#fff', border: '1px solid #d9dfe5',
      borderRadius: 10, flexShrink: 0,
      boxShadow: '0 1px 4px rgba(26,34,43,0.08)',
      fontFamily: "'Apple SD Gothic Neo', sans-serif",
      padding: '13px 14px 14px',
    }}>

      {/* 카드 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: '#5b646f' }}>시스템 변경 이력</span>
        <img src={imgDrag1} alt="drag" style={{ width: 16, height: 16, opacity: 0.4, pointerEvents: 'none' }} />
      </div>

      {/* 테이블 컨테이너 */}
      <div style={{ borderRadius: 8, border: '1px solid #e4e8ee', overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,34,43,0.06)' }}>

        {/* 헤더 */}
        <div style={{
          display: 'grid', gridTemplateColumns: GRID,
          alignItems: 'center',
          background: '#f8f9fb', borderBottom: '1px solid #eaedf1',
          padding: '0 16px', height: 34,
        }}>
          <div />
          {[
            { label: '이름', ml: -20 },
            { label: '변경 구성 항목' },
            { label: '변경 전' },
            { label: '변경 후' },
            { label: '생성일자', right: true },
          ].map(c => (
            <div key={c.label} style={{
              fontSize: 11, fontWeight: 600, color: '#8a9299',
              display: 'flex', alignItems: 'center', gap: 3,
              letterSpacing: '0.02em',
              justifyContent: c.right ? 'flex-end' : 'flex-start',
              overflow: 'hidden',
              marginLeft: c.ml || 0,
            }}>
              {c.label}<SortIcon />
            </div>
          ))}
        </div>

        {/* 바디 */}
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: GRID,
            alignItems: 'center',
            padding: '0 16px', height: 36,
            borderBottom: i < rows.length - 1 ? '1px solid #f2f4f7' : 'none',
            background: i % 2 === 1 ? '#fafbfc' : '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={imgServerBox} alt="" style={{ width: 16, height: 16 }} />
            </div>
            <div style={{ ...cellBase, fontSize: 12, color: '#3571ce' }}>{r.name}</div>
            <div style={{ ...cellBase, fontSize: 12, color: '#1a222b' }}>{r.item}</div>
            <div style={{ ...cellBase, fontSize: 12, color: '#5b646f' }}>{r.before}</div>
            <div style={{ ...cellBase, fontSize: 12, color: '#5b646f' }}>{r.after}</div>
            <div style={{ fontSize: 12, color: '#9ba4ad', textAlign: 'right', whiteSpace: 'nowrap' }}>{r.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTable() {
  return (
    <table className="wd-preview-table">
      <thead>
        <tr>
          <th>이름</th>
          <th>유형</th>
          <th>상태</th>
          <th>변경일</th>
        </tr>
      </thead>
      <tbody>
        {[
          ['서버-01', 'Physical', '정상', '04-07'],
          ['DB-02', 'Virtual', '경고', '04-06'],
          ['APP-03', 'Container', '정상', '04-05'],
        ].map(row => (
          <tr key={row[0]}>
            <td>{row[0]}</td>
            <td>{row[1]}</td>
            <td>
              <span className={`badge ${row[2] === '정상' ? 'badge-success' : 'badge-warning'}`}>
                {row[2]}
              </span>
            </td>
            <td>{row[3]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PreviewFlowchart() {
  const nodes = ['시작', '검증', '실행', '검사', '완료'];
  return (
    <div className="wd-preview-flowchart">
      {nodes.map((n, i) => (
        <React.Fragment key={n}>
          <div className="wd-preview-flow-node">{n}</div>
          {i < nodes.length - 1 && <span className="wd-preview-flow-arrow">›</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PreviewHistory() {
  const rows = [
    { label: 'workflow-001 실행 완료', time: '10:32', color: '#00bc7d' },
    { label: 'workflow-002 실행 중', time: '10:15', color: '#fd9a00' },
    { label: 'workflow-003 실패', time: '09:58', color: '#fb2c36' },
    { label: 'workflow-004 실행 완료', time: '09:40', color: '#00bc7d' },
  ];
  return (
    <div className="wd-preview-history">
      {rows.map(r => (
        <div key={r.label} className="wd-preview-history-row">
          <div className="wd-preview-history-dot" style={{ background: r.color }} />
          <span className="wd-preview-history-text">{r.label}</span>
          <span className="wd-preview-history-time">{r.time}</span>
        </div>
      ))}
    </div>
  );
}

function WidgetPreview({ widgetId, viewType }) {
  if (viewType === 'simple' || (!viewType && (widgetId === 'insp-result' || widgetId === 'insp-schedule'))) {
    if (widgetId === 'wf-history' || widgetId === 'insp-result' || widgetId === 'insp-schedule') return <PreviewHistory />;
    if (widgetId === 'sys-type') return <PreviewSimpleType />;
    return <PreviewSimple />;
  }
  if (viewType === 'donut') return <PreviewDonut />;
  if (viewType === 'bar') return <PreviewBar />;
  if (viewType === 'table') return widgetId === 'sys-history' ? <PreviewHistoryTable /> : <PreviewTable />;
  if (viewType === 'flowchart') return <PreviewFlowchart />;
  return <PreviewHistory />;
}

/* ─── Right Panel Config ──────────────────────── */
function RightPanel({ selected, config, onConfigChange, onRemove }) {
  if (!selected) {
    return (
      <div className="wd-right">
        <div className="wd-right-header">
          <div>
            <div className="wd-right-title">위젯 옵션</div>
            <div className="wd-right-subtitle">캔버스에서 위젯을 선택하세요</div>
          </div>
        </div>
        <div className="wd-right-empty">
          <div className="wd-right-empty-icon">⚙</div>
          <div className="wd-right-empty-text">선택된 위젯이 없습니다</div>
        </div>
      </div>
    );
  }

  const { widgetDef, instanceId } = selected;
  const cfg = config[instanceId] || {};

  const setViewType = (vt) => onConfigChange(instanceId, { ...cfg, viewType: vt });
  const setPeriodOn = (v) => onConfigChange(instanceId, { ...cfg, periodOn: v });
  const setFrom = (v) => onConfigChange(instanceId, { ...cfg, from: v });
  const setTo = (v) => onConfigChange(instanceId, { ...cfg, to: v });
  const setQuick = (q) => onConfigChange(instanceId, { ...cfg, quick: q });

  return (
    <div className="wd-right">
      <div className="wd-right-header">
        <div>
          <div className="wd-right-title">{widgetDef.name}</div>
          <div className="wd-right-subtitle">{widgetDef.desc}</div>
        </div>
      </div>
      <div className="wd-right-body">

        {/* View type */}
        {widgetDef.viewTypes.length > 0 && (
          <div className="wd-option-group">
            <div className="wd-option-label">표시 형태</div>
            <div className="wd-view-options">
              {widgetDef.viewTypes.map(vt => (
                <div
                  key={vt.id}
                  className={`wd-view-option ${cfg.viewType === vt.id ? 'selected' : ''}`}
                  onClick={() => setViewType(vt.id)}
                >
                  <div className="wd-view-option-radio" />
                  <span className="wd-view-option-icon">{vt.icon}</span>
                  <span className="wd-view-option-text">{vt.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {widgetDef.viewTypes.length > 0 && widgetDef.hasPeriod && (
          <div className="wd-option-divider" />
        )}

        {/* Period */}
        {widgetDef.hasPeriod && (
          <div className="wd-option-group">
            <div className="wd-option-label">기간 설정</div>
            <div className="wd-period-section">
              <div className="wd-period-toggle">
                <span className="wd-period-toggle-label">기간 필터 사용</span>
                <button
                  className={`wd-toggle ${cfg.periodOn ? 'on' : ''}`}
                  onClick={() => setPeriodOn(!cfg.periodOn)}
                />
              </div>

              {cfg.periodOn && (
                <>
                  <div className="wd-quick-periods">
                    {QUICK_PERIODS.map(q => (
                      <button
                        key={q}
                        className={`wd-quick-period-btn ${cfg.quick === q ? 'selected' : ''}`}
                        onClick={() => setQuick(cfg.quick === q ? null : q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {!cfg.quick && (
                    <div className="wd-date-inputs">
                      <div className="wd-date-row">
                        <span className="wd-date-row-label">시작</span>
                        <input
                          type="date"
                          className="wd-date-input"
                          value={cfg.from || MONTH_AGO}
                          onChange={e => setFrom(e.target.value)}
                        />
                      </div>
                      <div className="wd-date-row">
                        <span className="wd-date-row-label">종료</span>
                        <input
                          type="date"
                          className="wd-date-input"
                          value={cfg.to || TODAY}
                          onChange={e => setTo(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="wd-apply-btn">적용</button>
          <button className="wd-reset-btn">초기화</button>
          <button
            className="wd-reset-btn"
            style={{ color: '#fb2c36', borderColor: '#fb2c36' }}
            onClick={() => onRemove && onRemove(selected.instanceId)}
          >
            위젯 삭제
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Word Mode: Block Components ────────────── */
function TextBlock({ block, onChange, onDelete }) {
  const ref = React.useRef(null);
  return (
    <div className="wd-block-row">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="wd-text-block"
        data-placeholder="텍스트를 입력하세요..."
        onInput={(e) => onChange(block.id, e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: block.html || '' }}
      />
      <button className="wd-block-del" onClick={() => onDelete(block.id)} title="삭제">×</button>
    </div>
  );
}

function WidgetBlock({ block, config, widgetDef, isActive, onClick, onDelete }) {
  if (!widgetDef) return null;
  const cfg = config[block.instanceId] || {};
  const viewType = cfg.viewType || widgetDef.viewTypes[0]?.id;
  return (
    <div
      className={`wd-block-row wd-widget-block-row ${isActive ? 'active' : ''}`}
      onClick={() => onClick(block.instanceId, widgetDef)}
    >
      <WidgetPreview widgetId={widgetDef.id} viewType={viewType} />
      <button className="wd-block-del" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} title="삭제">×</button>
    </div>
  );
}

function BlockInsert({ onInsertText }) {
  return (
    <div className="wd-block-insert" onClick={onInsertText}>
      <span className="wd-block-insert-line" />
      <span className="wd-block-insert-btn">+</span>
      <span className="wd-block-insert-line" />
    </div>
  );
}

/* ─── Placed Widget Card ──────────────────────── */
function PlacedCard({ instance, widgetDef, config, isActive, isDragOver, isDragging, onClick, onDragHandleMouseDown }) {
  const cfg = config[instance.id] || {};
  const viewType = cfg.viewType || (widgetDef.viewTypes[0]?.id);

  return (
    <div
      data-card-id={instance.id}
      style={{
        position: 'relative', display: 'inline-flex', cursor: 'pointer',
        outline: isActive   ? '2px solid #3571ce'
               : isDragOver ? '2px dashed #3571ce'
               : 'none',
        outlineOffset: 2, borderRadius: 10,
        opacity: isDragging ? 0.3 : 1,
        boxShadow: isActive ? '0 0 0 3px rgba(53,113,206,0.15)' : 'none',
        transition: 'opacity 0.15s, outline 0.1s, box-shadow 0.1s',
      }}
      onClick={() => !isDragging && onClick(instance.id, widgetDef)}
    >
      <WidgetPreview widgetId={widgetDef.id} viewType={viewType} />

      {/* 드래그 핸들 */}
      <div
        onMouseDown={(e) => { e.stopPropagation(); onDragHandleMouseDown(e, instance.id); }}
        onClick={(e) => e.stopPropagation()}
        title="드래그하여 순서 변경"
        style={{
          position: 'absolute', right: 8, top: 12,
          width: 16, height: 16,
          cursor: 'grab', zIndex: 10,
        }}
      />
    </div>
  );
}

/* ─── Main Component ──────────────────────────── */
export default function WidgetDashboard() {
  const [activeTab, setActiveTab] = useState('system');
  const [canvasWidgets, setCanvasWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null); // { instanceId, widgetDef }
  const [config, setConfig] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [canvasMode, setCanvasMode] = useState('grid'); // 'grid' | 'word'
  const [docBlocks, setDocBlocks] = useState([{ id: 'init', type: 'text', html: '' }]);
  const [dragWidgetId, setDragWidgetId] = useState(null);  // 왼쪽 패널 → 캔버스 추가용
  const [dragOverId, setDragOverId] = useState(null);      // 캔버스 내 hover 타겟
  const [highlightedWidget, setHighlightedWidget] = useState(null);
  // 캔버스 내 마우스 드래그 재배치
  const reorderDragRef = React.useRef(null);               // { instanceId, offsetX, offsetY }
  const [reorderDragPos, setReorderDragPos] = useState(null); // { instanceId, x, y }

  const allWidgets = Object.values(WIDGET_CATEGORIES).flatMap(c => c.widgets);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const findWidgetDef = useCallback((id) => allWidgets.find(w => w.id === id), []);

  const handleDragStart = useCallback((widgetId) => {
    setDragWidgetId(widgetId);
  }, []);

  const makeWidgetConfig = (def) => ({
    viewType: def?.viewTypes[0]?.id || null,
    periodOn: false, from: MONTH_AGO, to: TODAY, quick: null,
  });

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!dragWidgetId) return;
    const instanceId = `${dragWidgetId}-${Date.now()}`;
    const def = findWidgetDef(dragWidgetId);
    setConfig(prev => ({ ...prev, [instanceId]: makeWidgetConfig(def) }));
    setSelectedWidget({ instanceId, widgetDef: def });
    if (canvasMode === 'word') {
      setDocBlocks(prev => [...prev, { id: instanceId, type: 'widget', instanceId, widgetId: dragWidgetId }]);
    } else {
      setCanvasWidgets(prev => [...prev, { id: instanceId, widgetId: dragWidgetId }]);
    }
    setDragWidgetId(null);
  }, [dragWidgetId, canvasMode]);

  const handleAddWidget = useCallback((widgetId) => {
    const instanceId = `${widgetId}-${Date.now()}`;
    const def = findWidgetDef(widgetId);
    setConfig(prev => ({ ...prev, [instanceId]: makeWidgetConfig(def) }));
    setSelectedWidget({ instanceId, widgetDef: def });
    if (canvasMode === 'word') {
      setDocBlocks(prev => [...prev, { id: instanceId, type: 'widget', instanceId, widgetId }]);
    } else {
      setCanvasWidgets(prev => [...prev, { id: instanceId, widgetId }]);
    }
  }, [canvasMode]);

  const handleRemove = useCallback((instanceId) => {
    setCanvasWidgets(prev => prev.filter(w => w.id !== instanceId));
    setDocBlocks(prev => prev.filter(b => b.instanceId !== instanceId));
    setConfig(prev => { const n = { ...prev }; delete n[instanceId]; return n; });
    if (selectedWidget?.instanceId === instanceId) setSelectedWidget(null);
  }, [selectedWidget]);

  // Word 모드 블록 관리
  const insertTextBlock = useCallback((afterIdx) => {
    const newBlock = { id: `text-${Date.now()}`, type: 'text', html: '' };
    setDocBlocks(prev => {
      const arr = [...prev];
      arr.splice(afterIdx + 1, 0, newBlock);
      return arr;
    });
  }, []);

  const updateTextBlock = useCallback((blockId, html) => {
    setDocBlocks(prev => prev.map(b => b.id === blockId ? { ...b, html } : b));
  }, []);

  const deleteDocBlock = useCallback((blockId) => {
    setDocBlocks(prev => {
      const b = prev.find(x => x.id === blockId);
      if (b?.type === 'widget') {
        setConfig(c => { const n = { ...c }; delete n[b.instanceId]; return n; });
        if (selectedWidget?.instanceId === b.instanceId) setSelectedWidget(null);
      }
      return prev.filter(x => x.id !== blockId);
    });
  }, [selectedWidget]);

  const handleCardClick = useCallback((instanceId, widgetDef) => {
    setSelectedWidget({ instanceId, widgetDef });
  }, []);

  const handleConfigChange = useCallback((instanceId, newCfg) => {
    setConfig(prev => ({ ...prev, [instanceId]: newCfg }));
  }, []);

  // 캔버스 내 마우스 드래그 시작
  const startReorderDrag = useCallback((e, instanceId) => {
    e.preventDefault();
    const card = e.currentTarget.closest('[data-card-id]');
    const rect = card.getBoundingClientRect();
    reorderDragRef.current = { instanceId, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    setReorderDragPos({ instanceId, x: rect.left, y: rect.top });
  }, []);

  // 전역 mousemove / mouseup
  useEffect(() => {
    const onMove = (e) => {
      if (!reorderDragRef.current) return;
      const { offsetX, offsetY } = reorderDragRef.current;
      setReorderDragPos(prev => prev ? { ...prev, x: e.clientX - offsetX, y: e.clientY - offsetY } : null);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const card = el?.closest('[data-card-id]');
      const overId = card?.getAttribute('data-card-id');
      setDragOverId(overId && overId !== reorderDragRef.current.instanceId ? overId : null);
    };
    const onUp = (e) => {
      if (!reorderDragRef.current) return;
      const { instanceId } = reorderDragRef.current;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const toId = el?.closest('[data-card-id]')?.getAttribute('data-card-id');
      if (toId && toId !== instanceId) {
        setCanvasWidgets(prev => {
          const arr = [...prev];
          const fi = arr.findIndex(w => w.id === instanceId);
          const ti = arr.findIndex(w => w.id === toId);
          const [item] = arr.splice(fi, 1);
          arr.splice(ti, 0, item);
          return arr;
        });
      }
      reorderDragRef.current = null;
      setReorderDragPos(null);
      setDragOverId(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const currentCategory = WIDGET_CATEGORIES[activeTab];

  return (
    <div className="wd-root">
      <AppHeader />

      <div className="wd-body">
        {/* Left: Widget List */}
        <div className="wd-left">
          <div className="wd-left-header">
            <div className="wd-left-title">위젯 목록</div>
            <div className="wd-tabs">
              {Object.entries(WIDGET_CATEGORIES).map(([key, cat]) => (
                <div
                  key={key}
                  className={`wd-tab ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </div>

          <div className="wd-widget-list">
            {currentCategory.widgets.map(widget => (
              <div
                key={widget.id}
                className={`wd-widget-item ${highlightedWidget === widget.id ? 'selected' : ''}`}
                draggable
                onDragStart={() => handleDragStart(widget.id)}
                onMouseEnter={() => setHighlightedWidget(widget.id)}
                onMouseLeave={() => setHighlightedWidget(null)}
              >
                <div className="wd-widget-icon">{widget.icon}</div>
                <div className="wd-widget-info">
                  <div className="wd-widget-name">{widget.name}</div>
                  <div className="wd-widget-desc">{widget.desc}</div>
                </div>
                <span className="wd-drag-icon">⠿</span>
              </div>
            ))}
          </div>

          <button
            className="wd-add-btn"
            disabled={!highlightedWidget}
            onClick={() => highlightedWidget && handleAddWidget(highlightedWidget)}
          >
            + 캔버스에 추가
          </button>
        </div>

        {/* Center: Canvas */}
        <div
          className={`wd-canvas ${isDragOver ? 'drag-over' : ''} ${canvasMode === 'word' ? 'a4-mode' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!reorderDragRef.current) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            if (reorderDragRef.current) return;
            handleDrop(e);
          }}
        >
          {/* 캔버스 모드 토글 */}
          <div className="wd-canvas-toolbar">
            <button
              className={`wd-mode-btn ${canvasMode === 'grid' ? 'active' : ''}`}
              onClick={() => setCanvasMode('grid')}
              title="Grid 모드"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/>
                <rect x="7.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/>
                <rect x="1" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/>
                <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/>
              </svg>
              Grid
            </button>
            <button
              className={`wd-mode-btn ${canvasMode === 'word' ? 'active' : ''}`}
              onClick={() => setCanvasMode('word')}
              title="Word 문서 모드"
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <rect x="1" y="1" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M3 4H9M3 6H9M3 8H7M3 10H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Word
            </button>
          </div>

          {/* Grid 모드 */}
          {canvasMode === 'grid' && (
            <div className="wd-fluid-page">
              {canvasWidgets.length === 0 ? (
                <div className="wd-canvas-empty">
                  <div className="wd-canvas-empty-icon">⊞</div>
                  <div className="wd-canvas-empty-text">위젯을 배치하세요</div>
                  <div className="wd-canvas-empty-sub">왼쪽 목록에서 위젯을 드래그하거나 선택 후 추가 버튼을 누르세요</div>
                </div>
              ) : (
                <div className="wd-canvas-grid">
                  {canvasWidgets.map(inst => {
                    const def = findWidgetDef(inst.widgetId);
                    if (!def) return null;
                    return (
                      <PlacedCard
                        key={inst.id}
                        instance={inst}
                        widgetDef={def}
                        config={config}
                        isActive={selectedWidget?.instanceId === inst.id}
                        isDragOver={dragOverId === inst.id}
                        isDragging={reorderDragPos?.instanceId === inst.id}
                        onClick={handleCardClick}
                        onDragHandleMouseDown={startReorderDrag}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Word 모드 */}
          {canvasMode === 'word' && (
            <div className="wd-a4-page">
              {docBlocks.map((block, i) => (
                <React.Fragment key={block.id}>
                  {block.type === 'text' ? (
                    <TextBlock
                      block={block}
                      onChange={updateTextBlock}
                      onDelete={deleteDocBlock}
                    />
                  ) : (
                    <WidgetBlock
                      block={block}
                      config={config}
                      widgetDef={findWidgetDef(block.widgetId)}
                      isActive={selectedWidget?.instanceId === block.instanceId}
                      onClick={handleCardClick}
                      onDelete={deleteDocBlock}
                    />
                  )}
                  <BlockInsert onInsertText={() => insertTextBlock(i)} />
                </React.Fragment>
              ))}
              {docBlocks.length === 0 && (
                <BlockInsert onInsertText={() => insertTextBlock(-1)} />
              )}
            </div>
          )}
        </div>

        {/* Right: Options */}
        <RightPanel
          selected={selectedWidget}
          config={config}
          onConfigChange={handleConfigChange}
          onRemove={handleRemove}
        />
      </div>

      {/* Floating card — 마우스 따라다니는 드래그 카드 */}
      {reorderDragPos && (() => {
        const inst = canvasWidgets.find(w => w.id === reorderDragPos.instanceId);
        const def = inst ? findWidgetDef(inst.widgetId) : null;
        if (!def) return null;
        const cfg = config[reorderDragPos.instanceId] || {};
        const viewType = cfg.viewType || def.viewTypes[0]?.id;
        return (
          <div style={{
            position: 'fixed',
            left: reorderDragPos.x,
            top: reorderDragPos.y,
            pointerEvents: 'none',
            zIndex: 9999,
            borderRadius: 10,
            transform: 'scale(1.05)',
            boxShadow: '0 20px 48px rgba(26,34,43,0.32), 0 4px 12px rgba(53,113,206,0.2)',
            opacity: 0.95,
          }}>
            <WidgetPreview widgetId={def.id} viewType={viewType} />
          </div>
        );
      })()}
    </div>
  );
}
