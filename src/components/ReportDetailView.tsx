'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from './AppHeader';
import ReportRenderer from './ReportRenderer';
import { createInspDetailTemplate } from '@/lib/inspDetailTemplate';
import { createInspMultiTemplate } from '@/lib/inspMultiTemplate';
import { SIDEBAR_TREE } from '@/lib/sidebarTree';

/* ── 리포트 메타 ── */
const REPORT_META: Record<string, any> = {
  '1': { title: '서버 및 WEB 점검 결과 리포트', inspName: '서버 및 WEB 점검', date: '2026-04-21', author: '김세훈' },
  '10': { title: '서버 및 WEB 점검 외 1건 결과 리포트', inspName: '서버 및 WEB 점검, WAS 서버 점검', date: '2026-04-21', author: '김세훈' },
};

/* ── 트리 아이콘 ── */
function TreeIcon({ type, status }: { type: string; status?: string }) {
  if (type === 'division') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
  if (type === 'workflow') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M6 3v12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 9c0-3 3-3 6-3h3"/><path d="M6 15c0 0 3 0 6 0h3"/>
    </svg>
  );
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

/* ── 사이드바 트리 노드 ── */
function SidebarNode({ node, depth = 0, selectedId, onSelect }: any) {
  const [open, setOpen] = useState(node.icon === 'division' || node.id === 'folder-server');
  const hasChildren = node.children?.length > 0;
  const isSelected = node.id === selectedId;
  const isDivision = node.icon === 'division' || node.icon === 'workflow';

  if (isDivision) {
    return (
      <div className={depth === 0 ? 'mt-3 first:mt-0' : ''}>
        <div className="flex items-center justify-between py-[6px] px-[10px]">
          <div className="flex items-center gap-[6px] cursor-pointer" onClick={() => setOpen(!open)}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className={`transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}>
              <path d="M3.5 2L6.5 5L3.5 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <TreeIcon type={node.icon} />
            <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide" style={{ marginTop: 2 }}>{node.label}</span>
          </div>
        </div>
        {open && node.children.map((child: any) => (
          <SidebarNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
        ))}
      </div>
    );
  }

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
        <span className={`text-[12px] flex-1 min-w-0 truncate ${isSelected ? 'font-semibold text-[#0056a4]' : 'text-[#334155]'}`} style={{ marginTop: 2 }}>
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

/* ── 메인 ── */
interface ReportDetailViewProps {
  reportId: string;
}

export default function ReportDetailView({ reportId }: ReportDetailViewProps) {
  const router = useRouter();
  const meta = REPORT_META[reportId] || REPORT_META['1'];

  const { blocks, configs } = useMemo(() => {
    if (reportId === '10') return createInspMultiTemplate();
    return createInspDetailTemplate();
  }, [reportId]);

  const docConfig = { paperSize: 'A4', orientation: 'portrait', margins: { top: 10, bottom: 10, left: 10, right: 10 } };

  // 트리에 현재 id가 없으면 동적 추가
  const sidebarTree = useMemo(() => {
    const allIds = new Set<string>();
    const collect = (nodes: any[]) => { for (const n of nodes) { allIds.add(n.id); if (n.children) collect(n.children); } };
    collect(SIDEBAR_TREE);
    if (allIds.has(reportId)) return SIDEBAR_TREE;
    const tree = JSON.parse(JSON.stringify(SIDEBAR_TREE));
    tree.push({ id: reportId, label: meta.title, icon: 'report', status: 'published' });
    return tree;
  }, [reportId, meta.title]);

  return (
    <div className="flex flex-col h-screen text-[13px] text-dark bg-bg">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">

        {/* 좌측 사이드바 */}
        <div className="w-[260px] bg-white border-r border-border flex flex-col shrink-0">
          <div className="px-3 pt-3 pb-2">
            <button onClick={() => router.push('/report')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-[24px] h-[24px] rounded-[6px] bg-[#0056a4] flex items-center justify-center text-[10px] font-bold text-white shrink-0">공</div>
              <span className="text-[12px] font-semibold text-[#1a222b]">공유 스페이스</span>
            </button>
          </div>
          <div className="px-3 pb-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="리포트 검색..." className="w-full text-[11px] border border-[#e2e8f0] rounded-[5px] pl-7 pr-2 py-[5px] outline-none focus:border-[#0056a4] text-[#334155] bg-white" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-1 pb-2">
            {sidebarTree.map(node => (
              <SidebarNode key={node.id} node={node} selectedId={reportId} onSelect={(nid: string) => {
                if (!nid.startsWith('folder-') && !nid.startsWith('div-')) router.push(`/report/${nid}`);
              }} />
            ))}
          </div>
        </div>

        {/* 가운데: 리포트 렌더러 */}
        <ReportRenderer blocks={blocks} docConfig={docConfig} />

        {/* 우측: 리포트 정보 + 목차 + PDF */}
        <div className="w-[280px] bg-white border-l border-border flex flex-col shrink-0">
          <div className="px-4 py-4 border-b border-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748b]">리포트 정보</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0056a4]">
                <div className="w-[5px] h-[5px] rounded-full bg-[#0056a4]" />발행됨
              </span>
            </div>
            <div>
              <div className="text-[10px] text-[#94a3b8] mb-1">리포트명</div>
              <div className="text-[13px] font-semibold text-[#1a222b]">{meta.title}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#94a3b8] mb-1">점검명</div>
              <span className="text-[12px] text-[#334155]">{meta.inspName}</span>
            </div>
            <div>
              <div className="text-[10px] text-[#94a3b8] mb-1">발행일</div>
              <span className="text-[12px] text-[#334155]">{meta.date}</span>
            </div>
            <div>
              <div className="text-[10px] text-[#94a3b8] mb-1">작성자</div>
              <span className="text-[12px] text-[#334155]">{meta.author}</span>
            </div>
          </div>

          {/* 목차 (2단계) */}
          <div className="px-4 py-3 flex-1 overflow-y-auto">
            <div className="text-[11px] font-semibold text-[#64748b] mb-2">목차</div>
            <div className="flex flex-col gap-0.5">
              {(() => {
                const items: { id: string; label: string; isSection: boolean }[] = [];
                for (const b of blocks) {
                  if (b.type === 'widget' && b.headerItems) items.push({ id: b.id, label: b.title, isSection: true });
                  else if (b.type === 'widget' && b.title && !b.headerItems) items.push({ id: b.id, label: b.title, isSection: false });
                }
                return items.map(item => (
                  <button key={item.id} onClick={() => document.getElementById(`viewer-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className={`text-left truncate rounded-[4px] hover:bg-[#f8fafc] transition-colors flex items-center gap-1.5 ${item.isSection
                      ? 'text-[12px] font-semibold text-[#1a222b] py-2 px-2 mt-1 first:mt-0'
                      : 'text-[11px] text-[#5b646f] hover:text-[#0056a4] py-1 px-2 pl-4'}`}>
                    {item.isSection && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    )}
                    {item.label}
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* PDF 다운로드 */}
          <div className="px-3 py-3 border-t border-border">
            <button className="w-full flex items-center justify-center gap-1.5 py-[7px] rounded-[5px] bg-white text-[#64748b] text-[11px] font-medium border border-[#e2e8f0] hover:border-[#0056a4] hover:text-[#0056a4] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              PDF 다운로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
