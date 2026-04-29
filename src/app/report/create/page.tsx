'use client';

import { Suspense, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import ReportRenderer from '@/components/ReportRenderer';
import { createInspDetailTemplate } from '@/lib/inspDetailTemplate';
import { SIDEBAR_TREE } from '@/lib/sidebarTree';

/* ── 트리 컴포넌트 ── */
function TreeIcon({ type, status }: { type: string; status?: string }) {
  if (type === 'folder') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={status === 'published' ? '#0056a4' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

function SidebarNode({ node, depth = 0, selectedId, onSelect }: any) {
  const [open, setOpen] = useState(node.id === 'folder-server');
  const hasChildren = node.children?.length > 0;
  const isSelected = node.id === selectedId;
  return (
    <div>
      <div className={`flex items-center gap-[6px] py-[6px] cursor-pointer rounded-[4px] transition-colors ${isSelected ? 'bg-[#eff6ff] text-[#0056a4]' : 'hover:bg-[#f8fafc]'}`}
        style={{ paddingLeft: depth * 16 + 10, paddingRight: 8 }}
        onClick={() => { if (hasChildren) setOpen(!open); onSelect(node.id); }}>
        {hasChildren ? (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className={`transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}>
            <path d="M3.5 2L6.5 5L3.5 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : <div className="w-2" />}
        <TreeIcon type={node.icon} status={node.status} />
        <span className={`text-[12px] flex-1 min-w-0 truncate ${isSelected ? 'font-semibold text-[#0056a4]' : 'text-[#334155]'}`}>{node.label}</span>
        {hasChildren && <span className="text-[10px] text-[#94a3b8] shrink-0">{node.children.length}</span>}
      </div>
      {hasChildren && open && node.children.map((child: any) => (
        <SidebarNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

/* ── 메인 ── */
function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspId = searchParams.get('insp');

  const { blocks, configs } = useMemo(() => createInspDetailTemplate(), []);
  const [docBlocks, setDocBlocks] = useState(blocks);
  const docConfig = { paperSize: 'A4', orientation: 'portrait', margins: { top: 10, bottom: 10, left: 10, right: 10 } };

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
            {SIDEBAR_TREE.map(node => (
              <SidebarNode key={node.id} node={node} selectedId="" onSelect={(nid: string) => {
                if (!nid.startsWith('folder-')) router.push(`/report/${nid}`);
              }} />
            ))}
          </div>
        </div>

        {/* 가운데: 리포트 렌더러 */}
        <ReportRenderer blocks={docBlocks} docConfig={docConfig} />

      </div>
    </div>
  );
}

export default function ReportCreatePage() {
  return (
    <Suspense>
      <CreateContent />
    </Suspense>
  );
}
