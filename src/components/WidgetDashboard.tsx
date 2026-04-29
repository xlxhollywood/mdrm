'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import AppHeader  from './AppHeader';
import RightPanel from './RightPanel';
import WordCanvas from './canvas/WordCanvas';
import { createInspDetailTemplate } from '@/lib/inspDetailTemplate';
import { createInspDetailWordTemplate } from '@/lib/inspDetailWordTemplate';
import { WIDGET_LIST, createWidgetBlock } from '@/lib/widgetDefinitions';

/* ── Main ── */
export default function WidgetDashboard({ onBack }: { onBack?: () => void }) {
  const [selectedTable,  setSelectedTable]  = useState(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const selectedTableRef = useRef(null);
  useEffect(() => { selectedTableRef.current = selectedTable; }, [selectedTable]);

  const activeBlockIdRef = useRef(null);
  const activeLayoutContextRef = useRef(null);
  useEffect(() => {
    const onFocusIn = (e) => {
      const textId = e.target?.dataset?.textId;
      if (textId) {
        const colEl = e.target.closest('[data-layout-col]');
        if (colEl) {
          activeLayoutContextRef.current = {
            layoutId: colEl.dataset.layoutId,
            colIdx: parseInt(colEl.dataset.colIdx, 10),
          };
          return;
        }
      }
      activeLayoutContextRef.current = null;
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  const historyRef = useRef([]);
  const [config,         setConfig]         = useState({});
  const [docBlocks,      setDocBlocks]      = useState([{ id: 'init', type: 'text', html: '' }]);
  const [published,      setPublished]      = useState(false);
  const [tempSaved,      setTempSaved]      = useState(false);
  const [docConfig,      setDocConfig]      = useState({
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 10, bottom: 10, left: 10, right: 10 },
    lineHeight: 1.6,
    letterSpacing: 0,
    blockSpacing: 5,
  });

  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const previous = historyRef.current.pop();
    setDocBlocks(previous);
  }, []);

  const handleLoadTemplate = useCallback((templateFn) => {
    const { blocks, configs } = templateFn();
    historyRef.current = [];
    setDocBlocks(blocks);
    setConfig(configs);
  }, []);

  const handleAddWidget = useCallback((widgetId: string) => {
    const newBlock = createWidgetBlock(widgetId);
    if (!newBlock) return;
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const activeId = activeBlockIdRef.current;
      const activeIdx = activeId ? prev.findIndex(b => b.id === activeId) : -1;
      if (activeIdx !== -1) {
        const arr = [...prev];
        arr.splice(activeIdx + 1, 0, newBlock);
        return arr;
      }
      return [...prev, newBlock];
    });
  }, []);

  const handleUpdateText = useCallback((id, html) =>
    setDocBlocks(prev => prev.map(b => b.id === id ? { ...b, html } : b)), []);

  const handleInsertText = useCallback((afterIdx, id) => {
    const newBlock = { id: id || `text-${Date.now()}`, type: 'text', html: '' };
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const a = [...prev]; a.splice(afterIdx + 1, 0, newBlock); return a;
    });
  }, []);

  const handleDeleteBlocksInRange = useCallback((keepId, deleteIds) => {
    if (keepId === null) {
      setDocBlocks(prev => {
        historyRef.current = [...historyRef.current.slice(-30), prev];
        return [{ id: `text-${Date.now()}`, type: 'text', html: '' }];
      });
      return;
    }
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      return prev
        .filter(b => !deleteIds.includes(b.id))
        .map(b => b.id === keepId ? { ...b, html: '' } : b);
    });
  }, []);

  const handleReorderBlocks = useCallback((fromIdx, toIdx) => {
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, item);
      return arr;
    });
  }, []);

  const handleDropColToMain = useCallback((fromDocIdx, toDocIdx) => {
    setDocBlocks(prev => {
      if (fromDocIdx < 0 || fromDocIdx >= prev.length) return prev;
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const arr = [...prev];
      const [item] = arr.splice(fromDocIdx, 1);
      const updated = { ...item };
      delete updated.layoutRef;
      const insertAt = toDocIdx > fromDocIdx ? Math.max(0, toDocIdx - 1) : toDocIdx;
      arr.splice(Math.min(insertAt, arr.length), 0, updated);
      return arr;
    });
  }, []);

  const handleMoveColBlock = useCallback((fromBlockId, targetLayoutId, targetColIdx, insertBeforeBlockId) => {
    setDocBlocks(prev => {
      const fromIdx = prev.findIndex(b => b.id === fromBlockId);
      if (fromIdx === -1) return prev;
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const arr = prev.filter((_, i) => i !== fromIdx);
      const updatedBlock = { ...prev[fromIdx], layoutRef: { layoutId: targetLayoutId, colIdx: targetColIdx } };
      if (insertBeforeBlockId) {
        const targetIdx = arr.findIndex(b => b.id === insertBeforeBlockId);
        if (targetIdx !== -1) { arr.splice(targetIdx, 0, updatedBlock); return arr; }
      }
      const colBlocks = arr.filter(b => b.layoutRef?.layoutId === targetLayoutId && b.layoutRef?.colIdx === targetColIdx);
      if (colBlocks.length > 0) {
        const lastIdx = arr.findIndex(b => b.id === colBlocks[colBlocks.length - 1].id);
        arr.splice(lastIdx + 1, 0, updatedBlock);
      } else {
        const layoutIdx = arr.findIndex(b => b.id === targetLayoutId);
        arr.splice(layoutIdx + 1, 0, updatedBlock);
      }
      return arr;
    });
  }, []);

  const handleDeleteBlock = useCallback((blockId) => {
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const filtered = prev.filter(x => x.id !== blockId);
      return filtered.length > 0 ? filtered : [{ id: `text-${Date.now()}`, type: 'text', html: '' }];
    });
  }, []);

  const handleInsertBlock = useCallback((afterIdx, blockDef) => {
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const a = [...prev]; a.splice(afterIdx + 1, 0, blockDef); return a;
    });
  }, []);

  const handleUpdateBlock = useCallback((id, fields) => {
    setDocBlocks(prev => {
      const structuralKeys = ['type', 'merges', 'rows', 'cols', 'table'];
      if (structuralKeys.some(k => fields[k] !== undefined)) {
        historyRef.current = [...historyRef.current.slice(-30), prev];
      }
      return prev.map(b => b.id === id ? { ...b, ...fields } : b);
    });
  }, []);

  const handleCellFocus = useCallback((blockId, row, col) => {
    setDocBlocks(prev => {
      const block = prev.find(b => b.id === blockId);
      if (block?.type === 'table') {
        setSelectedTable({
          blockId, rows: block.rows, cols: block.cols, row, col,
          headerRow: block.headerRow ?? true, headerCol: block.headerCol ?? false,
        });
      } else if (block?.type === 'widget' && block.table) {
        setSelectedTable({
          blockId, rows: block.table.rows, cols: block.table.cols, row, col,
          headerRow: block.table.headerRow ?? true, headerCol: block.table.headerCol ?? false,
        });
      }
      return prev;
    });
  }, []);

  const handleTableAction = useCallback((action) => {
    const sel = selectedTableRef.current;
    if (!sel) return;
    const { blockId, row, col } = sel;
    setDocBlocks(blocks => {
      historyRef.current = [...historyRef.current.slice(-30), blocks];
      return blocks.map(b => {
        if (b.id !== blockId) return b;
        // widget 블록이면 table 필드 안에서 조작
        const isWidget = b.type === 'widget';
        if (!isWidget && b.type !== 'table') return b;
        const tbl = isWidget ? (b.table || {}) : b;
        const { rows, cols, cells } = tbl;
        const shifted = {};
        const apply = (patch) => isWidget ? { ...b, table: { ...tbl, ...patch } } : { ...b, ...patch };

        if (action === 'addRowBelow') {
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[r > row ? `${r+1},${c}` : k] = v; });
          setSelectedTable(s => s ? { ...s, rows: rows + 1 } : s);
          return apply({ rows: rows + 1, cells: shifted });
        }
        if (action === 'addRowAbove') {
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[r >= row ? `${r+1},${c}` : k] = v; });
          setSelectedTable(s => s ? { ...s, row: s.row + 1, rows: rows + 1 } : s);
          return apply({ rows: rows + 1, cells: shifted });
        }
        if (action === 'deleteRow') {
          if (rows <= 1) return b;
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); if (r !== row) shifted[r > row ? `${r-1},${c}` : k] = v; });
          setSelectedTable(s => s ? { ...s, row: Math.max(0, s.row - 1), rows: rows - 1 } : s);
          return apply({ rows: rows - 1, cells: shifted });
        }
        if (action === 'addColRight') {
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[c > col ? `${r},${c+1}` : k] = v; });
          setSelectedTable(s => s ? { ...s, cols: cols + 1 } : s);
          return apply({ cols: cols + 1, cells: shifted });
        }
        if (action === 'addColLeft') {
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[c >= col ? `${r},${c+1}` : k] = v; });
          setSelectedTable(s => s ? { ...s, col: s.col + 1, cols: cols + 1 } : s);
          return apply({ cols: cols + 1, cells: shifted });
        }
        if (action === 'deleteCol') {
          if (cols <= 1) return b;
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); if (c !== col) shifted[c > col ? `${r},${c-1}` : k] = v; });
          setSelectedTable(s => s ? { ...s, col: Math.max(0, s.col - 1), cols: cols - 1 } : s);
          return apply({ cols: cols - 1, cells: shifted });
        }
        return b;
      });
    });
  }, []);

  const handleTableDelete = useCallback((blockId) => {
    handleDeleteBlock(blockId);
    setSelectedTable(null);
  }, [handleDeleteBlock]);

  const handleTableSwapHeaders = useCallback((blockId) => {
    setDocBlocks(prev => prev.map(b => {
      if (b.id !== blockId || b.type !== 'table') return b;
      const { rows, cols, cells, cellBg = {} } = b;
      const newCells = {}, newCellBg = {};
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (cells[`${r},${c}`]) newCells[`${c},${r}`] = cells[`${r},${c}`];
          if (cellBg[`${r},${c}`]) newCellBg[`${c},${r}`] = cellBg[`${r},${c}`];
        }
      }
      return { ...b, rows: cols, cols: rows, cells: newCells, cellBg: newCellBg };
    }));
    setSelectedTable(s => s?.blockId === blockId ? { ...s, rows: s.cols, cols: s.rows } : s);
  }, []);

  const handleTableToggleHeader = useCallback((blockId, key, val) => {
    setDocBlocks(prev => prev.map(b =>
      b.id === blockId && b.type === 'table' ? { ...b, [key]: val } : b
    ));
    setSelectedTable(s => s?.blockId === blockId ? { ...s, [key]: val } : s);
  }, []);

  const handleTableLoadData = useCallback((blockId, category, selectedLeaves, tableType) => {
    const SCHEMAS = {
      '시스템 상태': ['시스템 명', '상태', 'OS', 'IP 주소', '마지막 점검'],
      '계정':       ['시스템 명', '계정명', '권한', '마지막 로그인'],
      '변경요약':   ['시스템 명', '변경 유형', '변경 일시', '담당자'],
      '알림':       ['시스템 명', '알림 유형', '내용', '발생 시간'],
    };
    const MOCK_ROW = {
      '시스템 상태': s => ['정상', s.os, '192.168.1.1', '2026-04-14 09:00'],
      '계정':       s => ['admin', '관리자', '2026-04-13 18:22'],
      '변경요약':   s => ['설정 변경', '2026-04-12 14:30', '홍길동'],
      '알림':       s => ['경고', 'CPU 사용률 90% 초과', '2026-04-14 08:45'],
    };
    const headers = SCHEMAS[tableType] || [];
    if (!headers.length || !selectedLeaves.length) return;
    const newCols = headers.length;
    const newRows = 1 + selectedLeaves.length;
    const newCells = {};
    headers.forEach((h, c) => { newCells[`0,${c}`] = h; });
    selectedLeaves.forEach((sys, r) => {
      newCells[`${r + 1},0`] = sys.label;
      const mockVals = MOCK_ROW[tableType]?.(sys) || [];
      mockVals.forEach((val, c) => { newCells[`${r + 1},${c + 1}`] = val; });
    });
    setDocBlocks(prev => prev.map(b => {
      if (b.id !== blockId || b.type !== 'table') return b;
      return { ...b, rows: newRows, cols: newCols, cells: newCells };
    }));
    setSelectedTable(s => s?.blockId === blockId ? { ...s, rows: newRows, cols: newCols } : s);
  }, []);

  return (
    <div className="flex flex-col h-screen text-[13px] text-dark bg-bg">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* ── 좌측 패널 ── */}
        <div className="w-[300px] bg-white border-r border-border flex flex-col shrink-0 overflow-hidden">
          {/* 뒤로가기 */}
          {onBack && (
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
          )}
          {/* 위젯 목록 */}
          <div className="px-4 pt-[14px] pb-2 border-b border-border">
            <div className="text-[13px] font-semibold text-dark">위젯</div>
            <div className="text-[11px] text-muted mt-0.5">클릭하면 문서에 삽입됩니다</div>
          </div>
          <div className="overflow-y-auto flex-1">
            <div className="p-3 flex flex-col gap-1">
              {WIDGET_LIST.map(w => (
                <div
                  key={w.id}
                  onClick={() => handleAddWidget(w.id)}
                  className="flex items-center gap-2.5 px-3 py-[10px] rounded-lg cursor-pointer
                    hover:bg-primary-light transition-colors group"
                >
                  <span className="text-[16px] shrink-0">{w.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-dark group-hover:text-primary">{w.name}</div>
                    <div className="text-[10px] text-muted mt-px">{w.desc}</div>
                  </div>
                  <span className="text-[11px] text-border shrink-0 group-hover:text-primary">+</span>
                </div>
              ))}
            </div>

            {/* 템플릿 */}
            <div className="border-t border-border px-4 py-3">
              <div className="text-[11px] font-semibold text-muted mb-2">템플릿</div>
              <div className="flex flex-col gap-1.5">
                {[
                  { fn: createInspDetailTemplate, icon: '📊', name: '점검결과 상세 보고서', desc: '위젯 기반 상세 분석' },
                ].map((t, i) => (
                  <div
                    key={i}
                    onClick={() => handleLoadTemplate(t.fn)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-white cursor-pointer
                      hover:border-primary hover:bg-primary-light transition-colors group"
                  >
                    <span className="text-[18px] shrink-0">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-dark group-hover:text-primary">{t.name}</div>
                      <div className="text-[10px] text-muted mt-px">{t.desc}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-muted group-hover:text-primary">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 캔버스 ── */}
        <div className="flex-1 overflow-auto flex flex-col items-center bg-[#c8cdd3]">
          <WordCanvas
            docBlocks={docBlocks}
            config={config}
            docConfig={docConfig}
            onDeleteBlock={handleDeleteBlock}
            onUpdateText={handleUpdateText}
            onInsertText={handleInsertText}
            onInsertBlock={handleInsertBlock}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlocksInRange={handleDeleteBlocksInRange}
            onDeselectWidget={() => { setSelectedTable(null); setSelectedWidgetId(null); }}
            onReorderBlocks={handleReorderBlocks}
            onDropColToMain={handleDropColToMain}
            onMoveColBlock={handleMoveColBlock}
            onCellFocus={(blockId, r, c) => { handleCellFocus(blockId, r, c); setSelectedWidgetId(null); }}
            onWidgetFocus={(block) => { setSelectedWidgetId(block?.id || null); setSelectedTable(null); }}
            onUndo={handleUndo}
            onActiveBlockChange={(id) => { activeBlockIdRef.current = id; }}
          />
        </div>

        {/* ── 우측 패널 ── */}
        <RightPanel
          mode="word"
          selected={null}
          config={config}
          onConfigChange={(id, cfg) => setConfig(prev => ({ ...prev, [id]: cfg }))}
          docConfig={docConfig}
          onDocConfigChange={setDocConfig}
          published={published}
          onPublish={() => setPublished(true)}
          tempSaved={tempSaved}
          onTempSave={() => { setTempSaved(true); setTimeout(() => setTempSaved(false), 3000); }}
          selectedTable={selectedTable}
          onTableLoadData={handleTableLoadData}
          onTableToggleHeader={handleTableToggleHeader}
          onTableSwapHeaders={handleTableSwapHeaders}
          onTableAction={handleTableAction}
          onTableDelete={handleTableDelete}
          selectedWidget={selectedWidgetId ? docBlocks.find(b => b.id === selectedWidgetId) || null : null}
          onUpdateBlock={handleUpdateBlock}
        />
      </div>
    </div>
  );
}
