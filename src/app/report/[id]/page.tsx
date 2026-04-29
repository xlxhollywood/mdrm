'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import RightPanel from '@/components/RightPanel';
import WordCanvas from '@/components/canvas/WordCanvas';
import { createInspDetailTemplate } from '@/lib/inspDetailTemplate';
import { createInspDetailWordTemplate } from '@/lib/inspDetailWordTemplate';

/* ── 사이드바 트리 ── */
const SIDEBAR_TREE = [
  { id: 'folder-server', label: '서버 점검', icon: 'folder' as const, children: [
    { id: '1', label: '서버 및 WEB 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
    { id: '3', label: 'WAS 서버 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
    { id: '4', label: 'Linux 보안 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
  ]},
  { id: 'folder-db', label: 'DB 점검', icon: 'folder' as const, children: [
    { id: '2', label: 'DB 정기 점검 결과 리포트', icon: 'report' as const, status: 'draft' as const },
    { id: '6', label: 'DB 백업 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
  ]},
  { id: 'folder-network', label: '네트워크 점검', icon: 'folder' as const, children: [
    { id: '5', label: '네트워크 장비 점검 결과 리포트', icon: 'report' as const, status: 'draft' as const },
    { id: '10', label: '방화벽 정책 점검 리포트', icon: 'report' as const, status: 'draft' as const },
  ]},
  { id: 'folder-dr', label: 'DR', icon: 'folder' as const, children: [
    { id: '8', label: 'DR 훈련 결과 리포트', icon: 'report' as const, status: 'published' as const },
  ]},
  { id: 'folder-ipl', label: 'IPL', icon: 'folder' as const, children: [
    { id: '9', label: 'IPL 실행 내역 리포트', icon: 'report' as const, status: 'published' as const },
  ]},
  { id: 'folder-word', label: 'Editor ver', icon: 'folder' as const, children: [
    { id: 'word', label: '점검결과 상세 리포트 (Editor ver)', icon: 'report' as const, status: 'published' as const },
  ]},
];

const REPORT_META: Record<string, any> = {
  '1': { title: '서버 및 WEB 점검 결과 리포트', inspName: '서버 및 WEB 점검', date: '2026-04-21', author: '김세훈' },
  'word': { title: '점검결과 상세 리포트 (Editor ver)', inspName: '서버 및 WEB 점검', date: '2026-04-03', author: '김세훈' },
};

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
  const [open, setOpen] = useState(true);
  const hasChildren = node.children?.length > 0;
  const isSelected = node.id === selectedId;
  return (
    <div>
      <div
        className={`flex items-center gap-[6px] py-[6px] cursor-pointer rounded-[4px] transition-colors ${isSelected ? 'bg-[#eff6ff] text-[#0056a4]' : 'hover:bg-[#f8fafc]'}`}
        style={{ paddingLeft: depth * 16 + 10, paddingRight: 8 }}
        onClick={() => { if (hasChildren) setOpen(!open); onSelect(node.id); }}
      >
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

/* ── 우측 조회 패널 ── */
function ViewPanel({ meta, blocks, onEdit }: { meta: any; blocks: any[]; onEdit: () => void }) {
  return (
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
        <div className="flex gap-4">
          <div><div className="text-[10px] text-[#94a3b8] mb-1">점검명</div><span className="text-[12px] text-[#334155]">{meta.inspName}</span></div>
          <div><div className="text-[10px] text-[#94a3b8] mb-1">점검일</div><span className="text-[12px] text-[#334155]">{meta.date}</span></div>
        </div>
        <div><div className="text-[10px] text-[#94a3b8] mb-1">작성자</div><span className="text-[12px] text-[#334155]">{meta.author}</span></div>
      </div>
      <div className="px-4 py-3 flex-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-[#64748b] mb-2">목차</div>
        <div className="flex flex-col gap-0.5">
          {blocks.filter(b => (b.type === 'text' && b.subtype?.startsWith('h')) || (b.type === 'widget' && b.title && !b.headerItems)).map(b => (
            <button key={b.id} onClick={() => document.getElementById(`viewer-${b.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="text-left text-[11px] text-[#5b646f] hover:text-[#0056a4] py-1.5 px-2 rounded-[4px] hover:bg-[#f8fafc] transition-colors truncate">
              {b.type === 'widget' ? b.title : b.html?.replace(/<[^>]*>/g, '')}
            </button>
          ))}
        </div>
      </div>
      <div className="px-3 py-3 border-t border-border flex flex-col gap-2">
        <button onClick={onEdit} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[6px] bg-[#0056a4] text-white text-[12px] font-medium hover:bg-[#004a8f] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          편집
        </button>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1 py-[7px] rounded-[5px] bg-white text-[#64748b] text-[11px] font-medium border border-[#e2e8f0] hover:border-[#0056a4] hover:text-[#0056a4] transition-colors">인쇄</button>
          <button className="flex-1 flex items-center justify-center gap-1 py-[7px] rounded-[5px] bg-white text-[#64748b] text-[11px] font-medium border border-[#e2e8f0] hover:border-[#0056a4] hover:text-[#0056a4] transition-colors">다운로드</button>
        </div>
      </div>
    </div>
  );
}

/* ── 메인 ── */
export default function ReportViewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [editing, setEditing] = useState(false);

  const isWord = id === 'word';
  const meta = REPORT_META[id] || REPORT_META['1'];

  const initialData = useMemo(() => isWord ? createInspDetailWordTemplate() : createInspDetailTemplate(), [isWord]);
  const [docBlocks, setDocBlocks] = useState(initialData.blocks);
  const [config, setConfig] = useState(initialData.configs || {});
  const historyRef = useRef<any[]>([]);
  const activeBlockIdRef = useRef(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [tempSaved, setTempSaved] = useState(false);
  const [docConfig, setDocConfig] = useState({ paperSize: 'A4', orientation: 'portrait', margins: { top: 10, bottom: 10, left: 10, right: 10 }, lineHeight: 1.6, letterSpacing: 0, blockSpacing: 5 });

  const noop = useCallback(() => {}, []);
  const handleUpdateText = useCallback((id: string, html: string) => {
    setDocBlocks(prev => { historyRef.current = [...historyRef.current.slice(-30), prev]; return prev.map(b => b.id === id ? { ...b, html } : b); });
  }, []);
  const handleDeleteBlock = useCallback((id: string) => {
    setDocBlocks(prev => { historyRef.current = [...historyRef.current.slice(-30), prev]; const f = prev.filter(b => b.id !== id); return f.length ? f : [{ id: `text-${Date.now()}`, type: 'text', html: '' }]; });
  }, []);
  const handleInsertText = useCallback((afterIdx: number, newId: string) => {
    setDocBlocks(prev => { historyRef.current = [...historyRef.current.slice(-30), prev]; const arr = [...prev]; arr.splice(afterIdx + 1, 0, { id: newId, type: 'text', html: '' }); return arr; });
  }, []);
  const handleInsertBlock = useCallback((afterIdx: number, block: any) => {
    setDocBlocks(prev => { historyRef.current = [...historyRef.current.slice(-30), prev]; const arr = [...prev]; arr.splice(afterIdx + 1, 0, block); return arr; });
  }, []);
  const handleUpdateBlock = useCallback((id: string, fields: any) => {
    setDocBlocks(prev => { historyRef.current = [...historyRef.current.slice(-30), prev]; return prev.map(b => b.id === id ? { ...b, ...fields } : b); });
  }, []);
  const handleReorder = useCallback((from: number, to: number) => {
    setDocBlocks(prev => { historyRef.current = [...historyRef.current.slice(-30), prev]; const arr = [...prev]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return arr; });
  }, []);
  const handleDeleteBlocksInRange = useCallback((_keepId: any, deleteIds: string[]) => {
    setDocBlocks(prev => { historyRef.current = [...historyRef.current.slice(-30), prev]; let r = prev.filter(b => !deleteIds.includes(b.id)); if (!r.length) r = [{ id: `text-${Date.now()}`, type: 'text', html: '' }]; return r; });
  }, []);
  const handleUndo = useCallback(() => { const prev = historyRef.current.pop(); if (prev) setDocBlocks(prev); }, []);

  return (
    <div className="flex flex-col h-screen text-[13px] text-dark bg-bg">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 사이드바 (항상 동일) */}
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
              <SidebarNode key={node.id} node={node} selectedId={id} onSelect={(nid: string) => { if (!nid.startsWith('folder-')) router.push(`/report/${nid}`); }} />
            ))}
          </div>
        </div>

        {/* 가운데: 같은 WordCanvas, readOnly만 토글 */}
        <div className="flex-1 overflow-auto flex flex-col items-center bg-[#c8cdd3]">
          <WordCanvas
            docBlocks={docBlocks}
            config={config}
            docConfig={docConfig}
            readOnly={!editing}
            onDeleteBlock={handleDeleteBlock}
            onUpdateText={handleUpdateText}
            onDeselectWidget={() => { setSelectedWidgetId(null); setSelectedTable(null); }}
            onReorderBlocks={handleReorder}
            onInsertText={handleInsertText}
            onDeleteBlocksInRange={handleDeleteBlocksInRange}
            onInsertBlock={handleInsertBlock}
            onUpdateBlock={handleUpdateBlock}
            onCellFocus={(blockId: string, r: number, c: number) => setSelectedTable({ blockId, row: r, col: c, rows: docBlocks.find(b => b.id === blockId)?.rows, cols: docBlocks.find(b => b.id === blockId)?.cols } as any)}
            onWidgetFocus={(w: any) => setSelectedWidgetId(w?.id || null)}
            onUndo={handleUndo}
            onDropColToMain={noop}
            onMoveColBlock={noop}
            onActiveBlockChange={(aid: any) => { activeBlockIdRef.current = aid; }}
          />
        </div>

        {/* 우측: 조회=메타, 편집=옵션 */}
        {editing ? (
          <RightPanel
            mode="word"
            selected={null}
            config={config}
            onConfigChange={(cid: string, cfg: any) => setConfig((prev: any) => ({ ...prev, [cid]: cfg }))}
            docConfig={docConfig}
            onDocConfigChange={setDocConfig}
            published={published}
            onPublish={() => { setPublished(true); setEditing(false); }}
            tempSaved={tempSaved}
            onTempSave={() => setTempSaved(true)}
            selectedTable={selectedTable}
            onAddRow={noop}
            onAddCol={noop}
            onDeleteRow={noop}
            onDeleteCol={noop}
            onMoveRow={noop}
            onMoveCol={noop}
            docBlocks={docBlocks}
            onUpdateBlock={handleUpdateBlock}
            selectedWidgetId={selectedWidgetId}
          />
        ) : (
          <ViewPanel meta={meta} blocks={docBlocks} onEdit={() => setEditing(true)} />
        )}
      </div>
    </div>
  );
}
