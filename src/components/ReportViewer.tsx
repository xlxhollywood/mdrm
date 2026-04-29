'use client';

import { useState, useMemo } from 'react';
import AppHeader from './AppHeader';
import { PAPER_SIZES, MM_TO_PX } from './editor/wordConstants';
import { createInspDetailTemplate } from '@/lib/inspDetailTemplate';

/* ── 아이콘 (WidgetBlock과 동일) ── */
function Icon({ type, size = 16 }: { type: string; size?: number }) {
  const cls = "shrink-0 text-[#0056a4]";
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: cls };
  if (type === 'chart') return <svg {...props}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
  if (type === 'table') return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>;
  if (type === 'shield') return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  if (type === 'clipboard') return <svg {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></svg>;
  if (type === 'alert') return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
  if (type === 'xmark') return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
  if (type === 'clock') return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (type === 'list') return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
  return null;
}

/* ── 읽기 전용 테이블 렌더 ── */
function ReadOnlyTable({ table }: { table: any }) {
  const { rows = 3, cols = 3, cells = {}, headerRow = false } = table;
  return (
    <table className="border-collapse w-full text-[12px]">
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }, (_, c) => {
              const isHeader = headerRow && r === 0;
              const html = cells[`${r},${c}`] || '';
              return isHeader ? (
                <th
                  key={c}
                  className="border border-[#d9dfe5] px-2.5 py-2 text-left text-[11px] font-semibold text-[#334155] bg-[#f8fafc]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <td
                  key={c}
                  className="border border-[#d9dfe5] px-2.5 py-2 text-[12px] text-[#334155]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 읽기 전용 블록 렌더 ── */
function ReadOnlyBlock({ block }: { block: any }) {
  // 위젯 블록
  if (block.type === 'widget') {
    const TITLE_SIZES: Record<string, string> = { h1: '22px', h2: '18px', h3: '16px', h4: '15px', h5: '13px' };
    const titleSize = TITLE_SIZES[block.titleSubtype] || '14px';
    const hasHeaderItems = !!block.headerItems;
    const hasSections = !!block.sections;
    const hasSubtitle = !!block.subtitle;

    return (
      <div className="my-2 px-[6px] pt-[12px] pb-[10px]">
        {/* 헤더 위젯 */}
        {hasHeaderItems && (
          <>
            <div style={{ fontSize: titleSize, fontWeight: 700, color: '#1a222b', textAlign: 'center', marginBottom: 12 }}>
              {block.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginBottom: 8 }}>
              {block.headerItems.filter((item: any) => item.visible !== false).map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon type={item.icon} size={13} />
                  <span style={{ fontSize: item.fontSize || 12, color: '#5b646f', lineHeight: 1 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 일반 위젯 타이틀 */}
        {!hasHeaderItems && block.title && (
          <div className="flex items-center gap-1.5 mb-4">
            {block.titleIcon && <Icon type={block.titleIcon} />}
            <span style={{ fontSize: titleSize, fontWeight: 700, color: '#0056a4' }}>{block.title}</span>
          </div>
        )}

        {/* sections (비정상 항목 등) */}
        {hasSections && block.sections.map((sec: any, si: number) => {
          const secCount = Math.max(0, (sec.table?.rows || 0) - (sec.table?.headerRow ? 1 : 0));
          return (
            <div key={si} className={si > 0 ? 'mt-3' : ''}>
              <div className="flex items-center justify-end gap-1 mb-0.5 mr-[4px]">
                {sec.subtitleIcon && <Icon type={sec.subtitleIcon} size={12} />}
                <span className="text-[12px] font-medium text-[#0056a4]">{sec.subtitle}</span>
                <span className="text-[10px] text-[#94a3b8]">({secCount}건)</span>
              </div>
              <ReadOnlyTable table={sec.table} />
            </div>
          );
        })}

        {/* 단일 서브타이틀 + 테이블 */}
        {!hasSections && hasSubtitle && (
          <div className="flex items-center justify-end gap-1 mb-0.5 mr-[4px]">
            {block.subtitleIcon && <Icon type={block.subtitleIcon} size={12} />}
            <span className="text-[12px] font-medium text-[#0056a4]">{block.subtitle}</span>
            <span className="text-[10px] text-[#94a3b8]">({Math.max(0, (block.table?.rows || 0) - (block.table?.headerRow ? 1 : 0))}건)</span>
          </div>
        )}
        {!hasSections && block.table && <ReadOnlyTable table={block.table} />}

        {/* HTML 코드 */}
        {block.code && <div dangerouslySetInnerHTML={{ __html: block.code }} />}
      </div>
    );
  }

  // 텍스트 블록
  if (block.type === 'text') {
    const SIZES: Record<string, string> = { h1: '22px', h2: '18px', h3: '16px', h4: '15px', h5: '13px' };
    const fontSize = SIZES[block.subtype] || '14px';
    const isHeading = block.subtype?.startsWith('h');
    const isBullet = block.subtype === 'bullet';
    const isNumbered = block.subtype === 'numbered';
    const isCallout = block.subtype === 'callout';
    const isQuote = block.subtype === 'quote';

    if (isCallout) {
      return (
        <div className="my-1 px-4 py-3 rounded-[6px] border-l-[3px]"
          style={{ background: block.calloutBg || '#eff6ff', borderColor: block.calloutBorder || '#0056a4' }}>
          <div className="text-[14px]" dangerouslySetInnerHTML={{ __html: block.html || '' }} />
        </div>
      );
    }
    if (isQuote) {
      return (
        <div className="my-1 px-4 py-2 border-l-[3px] border-[#d9dfe5] text-[#5b646f] italic">
          <div className="text-[13px]" dangerouslySetInnerHTML={{ __html: block.html || '' }} />
        </div>
      );
    }
    if (isBullet || isNumbered) {
      const Tag = isBullet ? 'ul' : 'ol';
      return (
        <Tag className={`my-0.5 pl-6 ${isBullet ? 'list-disc' : 'list-decimal'}`}
          style={{ fontSize: '14px', lineHeight: 1.6, color: '#1a222b' }}
          dangerouslySetInnerHTML={{ __html: block.html || '' }}
        />
      );
    }

    return (
      <div
        className="my-0.5"
        style={{ fontSize, fontWeight: isHeading ? 700 : 400, lineHeight: 1.6, color: '#1a222b' }}
        dangerouslySetInnerHTML={{ __html: block.html || '' }}
      />
    );
  }

  // 구분선
  if (block.type === 'divider') {
    return <div className="my-2" style={{ height: 1, background: '#d9dfe5' }} />;
  }

  // 테이블 블록
  if (block.type === 'table') {
    return <div className="my-2"><ReadOnlyTable table={block} /></div>;
  }

  return null;
}

/* ── 리포트 메타 정보 ── */
const REPORT_META = {
  'rpt-1': { title: '서버 및 WEB 점검 결과 보고서', inspName: '서버 및 WEB 점검', date: '2026-04-21', author: '김세훈', status: 'published' as const },
};

/* ── 메인 뷰어 ── */
interface ReportViewerProps {
  reportId: string;
  onBack: () => void;
  onEdit: () => void;
}

/* ── 사이드바 트리 (오버뷰와 동일 구조) ── */
const SIDEBAR_TREE = [
  {
    id: 'folder-server', label: '서버 점검', icon: 'folder' as const,
    children: [
      { id: 'rpt-1', label: '서버 및 WEB 점검 결과 보고서', icon: 'report' as const, status: 'published' as const },
      { id: 'rpt-3', label: 'WAS 서버 점검 결과 보고서', icon: 'report' as const, status: 'published' as const },
      { id: 'rpt-4', label: 'Linux 보안 점검 결과 보고서', icon: 'report' as const, status: 'published' as const },
    ],
  },
  {
    id: 'folder-db', label: 'DB 점검', icon: 'folder' as const,
    children: [
      { id: 'rpt-2', label: 'DB 정기 점검 결과 보고서', icon: 'report' as const, status: 'draft' as const },
      { id: 'rpt-6', label: 'DB 백업 점검 결과 보고서', icon: 'report' as const, status: 'published' as const },
    ],
  },
  {
    id: 'folder-network', label: '네트워크 점검', icon: 'folder' as const,
    children: [
      { id: 'rpt-5', label: '네트워크 장비 점검 결과 보고서', icon: 'report' as const, status: 'draft' as const },
    ],
  },
];

function TreeIcon({ type, status }: { type: string; status?: string }) {
  if (type === 'folder') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
  const color = status === 'published' ? '#0056a4' : '#94a3b8';
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

function SidebarNode({ node, depth = 0, selectedId, onSelect }: any) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const isSelected = node.id === selectedId;
  return (
    <div>
      <div
        className={`flex items-center gap-[6px] py-[6px] cursor-pointer rounded-[4px] transition-colors
          ${isSelected ? 'bg-[#eff6ff] text-[#0056a4]' : 'hover:bg-[#f8fafc]'}`}
        style={{ paddingLeft: depth * 16 + 10, paddingRight: 8 }}
        onClick={() => { if (hasChildren) setOpen(!open); onSelect(node.id); }}
      >
        {hasChildren ? (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className={`transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}>
            <path d="M3.5 2L6.5 5L3.5 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : <div className="w-2" />}
        <TreeIcon type={node.icon} status={node.status} />
        <span className={`text-[12px] flex-1 min-w-0 truncate ${isSelected ? 'font-semibold text-[#0056a4]' : 'text-[#334155]'}`}>
          {node.label}
        </span>
        {hasChildren && <span className="text-[10px] text-[#94a3b8] shrink-0">{node.children.length}</span>}
        {node.status === 'draft' && !hasChildren && <span className="text-[9px] text-[#94a3b8] bg-[#f1f5f9] rounded-[3px] px-1 shrink-0">임시</span>}
      </div>
      {hasChildren && open && node.children.map((child: any) => (
        <SidebarNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default function ReportViewer({ reportId, onBack, onEdit }: ReportViewerProps) {
  const [selectedId, setSelectedId] = useState(reportId);
  const { blocks } = useMemo(() => createInspDetailTemplate(), []);
  const meta = REPORT_META['rpt-1'];

  const paper = PAPER_SIZES.A4;
  const docW = paper.w;
  const pad = `${Math.round(10 * MM_TO_PX)}px`;

  return (
    <div className="flex flex-col h-screen text-[13px] text-dark bg-bg">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* ── 좌측 사이드바 (트리) ── */}
        <div className="w-[260px] bg-white border-r border-border flex flex-col shrink-0">
          <div className="px-3 pt-3 pb-2 border-b border-border">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[12px] text-[#5b646f] hover:text-[#0056a4] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              리포트 목록
            </button>
          </div>
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <svg className="absolute left-2 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="검색..." className="w-full text-[11px] border border-[#e2e8f0] rounded-[5px] pl-7 pr-2 py-[5px] outline-none focus:border-[#0056a4] text-[#334155] bg-white" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-1 pb-2">
            {SIDEBAR_TREE.map(node => (
              <SidebarNode key={node.id} node={node} selectedId={selectedId} onSelect={setSelectedId} />
            ))}
          </div>
        </div>

        {/* ── 문서 영역 ── */}
        <div className="flex-1 overflow-auto flex flex-col items-center bg-[#c8cdd3]">
          <div
            className="shrink-0 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.10)] my-6 mb-10"
            style={{ width: docW, minHeight: paper.h, padding: pad }}
          >
            {blocks.filter(b => !b.layoutRef).map(block => (
              <div key={block.id} id={`viewer-${block.id}`} style={{ marginBottom: 5 }}>
                <ReadOnlyBlock block={block} />
              </div>
            ))}
          </div>
        </div>

        {/* ── 우측 정보 패널 ── */}
        <div className="w-[280px] bg-white border-l border-border flex flex-col shrink-0">
          {/* 리포트 정보 */}
          <div className="px-4 py-4 border-b border-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-[#64748b]">리포트 정보</div>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0056a4]">
                <div className="w-[5px] h-[5px] rounded-full bg-[#0056a4]" />
                발행됨
              </span>
            </div>
            <div>
              <div className="text-[10px] text-[#94a3b8] mb-1">리포트명</div>
              <div className="text-[13px] font-semibold text-[#1a222b]">{meta.title}</div>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-[10px] text-[#94a3b8] mb-1">점검명</div>
                <div className="flex items-center gap-1">
                  <Icon type="shield" size={12} />
                  <span className="text-[12px] text-[#334155]">{meta.inspName}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#94a3b8] mb-1">점검일</div>
                <div className="flex items-center gap-1">
                  <Icon type="clock" size={12} />
                  <span className="text-[12px] text-[#334155]">{meta.date}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#94a3b8] mb-1">작성자</div>
              <span className="text-[12px] text-[#334155]">{meta.author}</span>
            </div>
          </div>

          {/* 목차 */}
          <div className="px-4 py-3 flex-1 overflow-y-auto">
            <div className="text-[11px] font-semibold text-[#64748b] mb-2">목차</div>
            <div className="flex flex-col gap-0.5">
              {blocks.filter(b => b.type === 'widget' && b.title && !b.headerItems).map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    document.getElementById(`viewer-${b.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-left text-[11px] text-[#5b646f] hover:text-[#0056a4] py-1.5 px-2 rounded-[4px] hover:bg-[#f8fafc] transition-colors truncate"
                >
                  {b.title}
                </button>
              ))}
            </div>
          </div>

          {/* 하단 액션 */}
          <div className="px-3 py-3 border-t border-border flex flex-col gap-2">
            <button
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[6px] bg-[#0056a4] text-white text-[12px] font-medium hover:bg-[#004a8f] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              편집
            </button>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 py-[7px] rounded-[5px] bg-white text-[#64748b] text-[11px] font-medium border border-[#e2e8f0] hover:border-[#0056a4] hover:text-[#0056a4] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                인쇄
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 py-[7px] rounded-[5px] bg-white text-[#64748b] text-[11px] font-medium border border-[#e2e8f0] hover:border-[#0056a4] hover:text-[#0056a4] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                다운로드
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
