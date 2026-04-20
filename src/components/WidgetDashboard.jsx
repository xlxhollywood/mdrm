'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import AppHeader  from './AppHeader';
import RightPanel from './RightPanel';
import GridCanvas from './canvas/GridCanvas';
import WordCanvas from './canvas/WordCanvas';
import { WIDGET_CATEGORIES, TODAY, MONTH_AGO } from '@/lib/constants';
import { createWeeklyTemplate } from '@/lib/weeklyTemplate';

const allWidgets = Object.values(WIDGET_CATEGORIES).flatMap(c => c.widgets);

const findWidgetDef = (id) => allWidgets.find(w => w.id === id);
const makeConfig = (def) => ({
  viewType: def?.viewTypes[0]?.id || null,
  periodOn: false, from: MONTH_AGO, to: TODAY, quick: null,
  showBorder: true, showLabel: true,
});

/* ── 위젯 목록 아이템 ── */
function WidgetListItem({ widget, onAdd }) {
  return (
    <div
      onClick={() => onAdd(widget.id)}
      className="flex items-center gap-2 px-4 py-[9px] cursor-pointer border-l-[3px] border-transparent
        transition-colors hover:bg-primary-light hover:border-primary active:bg-blue-50"
    >
      <div className="w-7 h-7 rounded bg-primary-light flex items-center justify-center shrink-0 text-[14px]">
        {widget.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-dark truncate">{widget.name}</div>
        <div className="text-[11px] text-muted mt-px truncate">{widget.desc}</div>
      </div>
      <span className="text-[11px] text-border shrink-0">+</span>
    </div>
  );
}

/* ── 모드 전환 툴바 ── */
const MODES = [
  {
    mode: 'grid', label: 'Grid',
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/><rect x="7.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/><rect x="1" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/><rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/></svg>,
  },
  {
    mode: 'word', label: 'Word',
    icon: <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><rect x="1" y="1" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M3 4H9M3 6H9M3 8H7M3 10H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  },
];

/* ── Main ── */
export default function WidgetDashboard() {
  const [activeTab,      setActiveTab]      = useState('system');
  const [canvasWidgets,  setCanvasWidgets]  = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [selectedTable,  setSelectedTable]  = useState(null); // { blockId, rows, cols, row, col }
  const selectedTableRef = useRef(null);
  useEffect(() => { selectedTableRef.current = selectedTable; }, [selectedTable]);

  // ── 레이아웃 열 커서 추적 (focusin 기준 — 프로그래매틱 포커스도 감지) ──
  const activeLayoutContextRef = useRef(null);
  useEffect(() => {
    const onFocusIn = (e) => {
      // 위젯 목록 클릭은 컨텍스트 유지
      if (e.target.closest('[data-widget-list]')) return;
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
      // 레이아웃 열 밖으로 포커스 이동 → 컨텍스트 초기화
      activeLayoutContextRef.current = null;
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  // ── 구조적 변경 히스토리 (Ctrl+Z용) ──
  const historyRef = useRef([]);
  const [config,         setConfig]         = useState({});
  const [canvasMode,     setCanvasMode]     = useState('grid');
  const [docBlocks,      setDocBlocks]      = useState([{ id: 'init', type: 'text', html: '' }]);
  const [published,      setPublished]      = useState(false);
  const [tempSaved,      setTempSaved]      = useState(false);
  const [docConfig,      setDocConfig]      = useState({
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 10, bottom: 10, left: 10, right: 10 },
    lineHeight: 1.6,
    letterSpacing: 0,
    blockSpacing: 3,
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
    setSelectedWidget(null);
    setCanvasMode('word');
  }, []);

  const handleAddWidget = useCallback((widgetId) => {
    const instanceId = `${widgetId}-${Date.now()}`;
    const def = findWidgetDef(widgetId);
    setConfig(prev => ({ ...prev, [instanceId]: makeConfig(def) }));
    setSelectedWidget({ instanceId, widgetDef: def });
    if (canvasMode === 'word') {
      const layoutCtx = activeLayoutContextRef.current;
      setDocBlocks(prev => {
        historyRef.current = [...historyRef.current.slice(-30), prev];
        const newBlock = { id: instanceId, type: 'widget', instanceId, widgetId };
        if (layoutCtx) {
          const { layoutId, colIdx } = layoutCtx;
          newBlock.layoutRef = { layoutId, colIdx };
          // 같은 열의 빈 텍스트 블록 제거
          const emptyInCol = prev.filter(b =>
            b.layoutRef?.layoutId === layoutId &&
            b.layoutRef?.colIdx === colIdx &&
            b.type === 'text' &&
            !(b.html || '').replace(/<br\s*\/?>/gi, '').trim()
          );
          const base = emptyInCol.length > 0
            ? prev.filter(b => !emptyInCol.includes(b))
            : prev;
          return [...base, newBlock];
        }
        return [...prev, newBlock];
      });
    } else {
      setCanvasWidgets(prev => [...prev, { id: instanceId, widgetId }]);
    }
  }, [canvasMode]);

  const handleRemove = useCallback((instanceId) => {
    setCanvasWidgets(prev => prev.filter(w => w.id !== instanceId));
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      return prev.filter(b => b.instanceId !== instanceId);
    });
    setConfig(prev => { const n = { ...prev }; delete n[instanceId]; return n; });
    if (selectedWidget?.instanceId === instanceId) setSelectedWidget(null);
  }, [selectedWidget]);

  const handleCardClick    = useCallback((instanceId, widgetDef) => setSelectedWidget({ instanceId, widgetDef }), []);
  const handleConfigChange = useCallback((instanceId, newCfg) => setConfig(prev => ({ ...prev, [instanceId]: newCfg })), []);

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
      setSelectedWidget(null);
      return;
    }
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      return prev
        .filter(b => !deleteIds.includes(b.id) && !deleteIds.includes(b.instanceId))
        .map(b => b.id === keepId ? { ...b, html: '' } : b);
    });
    deleteIds.forEach(id => {
      setConfig(c => { const n = { ...c }; delete n[id]; return n; });
    });
    if (deleteIds.includes(selectedWidget?.instanceId)) setSelectedWidget(null);
  }, [selectedWidget]);

  const handleReorderBlocks = useCallback((fromIdx, toIdx) => {
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, item);
      return arr;
    });
  }, []);

  // 열 블록 → 메인 캔버스로 드래그
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

  // 열 블록 → 열로 이동 (같은 열 재정렬 포함)
  const handleMoveColBlock = useCallback((fromBlockId, targetLayoutId, targetColIdx, insertBeforeBlockId) => {
    setDocBlocks(prev => {
      const fromIdx = prev.findIndex(b => b.id === fromBlockId);
      if (fromIdx === -1) return prev;
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const arr = prev.filter((_, i) => i !== fromIdx);
      const updatedBlock = { ...prev[fromIdx], layoutRef: { layoutId: targetLayoutId, colIdx: targetColIdx } };

      if (insertBeforeBlockId) {
        const targetIdx = arr.findIndex(b => b.id === insertBeforeBlockId);
        if (targetIdx !== -1) {
          arr.splice(targetIdx, 0, updatedBlock);
          return arr;
        }
      }
      // 대상 열의 마지막 블록 뒤에 추가
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
      const b = prev.find(x => x.id === blockId);
      if (b?.type === 'widget') {
        setConfig(c => { const n = { ...c }; delete n[b.instanceId]; return n; });
        if (selectedWidget?.instanceId === b.instanceId) setSelectedWidget(null);
      }
      const filtered = prev.filter(x => x.id !== blockId);
      return filtered.length > 0 ? filtered : [{ id: `text-${Date.now()}`, type: 'text', html: '' }];
    });
  }, [selectedWidget]);

  const handleInsertBlock = useCallback((afterIdx, blockDef) => {
    setDocBlocks(prev => {
      historyRef.current = [...historyRef.current.slice(-30), prev];
      const a = [...prev]; a.splice(afterIdx + 1, 0, blockDef); return a;
    });
  }, []);

  const handleUpdateBlock = useCallback((id, fields) => {
    setDocBlocks(prev => {
      // 타입 변경(layout·table·divider 변환)은 history 저장
      if (fields.type !== undefined) {
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
        setSelectedWidget(null);
      }
      return prev;
    });
  }, []);

  const handleTableAction = useCallback((action) => {
    const sel = selectedTableRef.current;
    if (!sel) return;
    const { blockId, row, col } = sel;

    setDocBlocks(blocks => blocks.map(b => {
      if (b.id !== blockId || b.type !== 'table') return b;
      const { rows, cols, cells } = b;
      const shifted = {};

      if (action === 'addRowBelow') {
        Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[r > row ? `${r+1},${c}` : k] = v; });
        setSelectedTable(s => s ? { ...s, rows: rows + 1 } : s);
        return { ...b, rows: rows + 1, cells: shifted };
      }
      if (action === 'addRowAbove') {
        Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[r >= row ? `${r+1},${c}` : k] = v; });
        setSelectedTable(s => s ? { ...s, row: s.row + 1, rows: rows + 1 } : s);
        return { ...b, rows: rows + 1, cells: shifted };
      }
      if (action === 'deleteRow') {
        if (rows <= 1) return b;
        Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); if (r !== row) shifted[r > row ? `${r-1},${c}` : k] = v; });
        setSelectedTable(s => s ? { ...s, row: Math.max(0, s.row - 1), rows: rows - 1 } : s);
        return { ...b, rows: rows - 1, cells: shifted };
      }
      if (action === 'addColRight') {
        Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[c > col ? `${r},${c+1}` : k] = v; });
        setSelectedTable(s => s ? { ...s, cols: cols + 1 } : s);
        return { ...b, cols: cols + 1, cells: shifted };
      }
      if (action === 'addColLeft') {
        Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[c >= col ? `${r},${c+1}` : k] = v; });
        setSelectedTable(s => s ? { ...s, col: s.col + 1, cols: cols + 1 } : s);
        return { ...b, cols: cols + 1, cells: shifted };
      }
      if (action === 'deleteCol') {
        if (cols <= 1) return b;
        Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); if (c !== col) shifted[c > col ? `${r},${c-1}` : k] = v; });
        setSelectedTable(s => s ? { ...s, col: Math.max(0, s.col - 1), cols: cols - 1 } : s);
        return { ...b, cols: cols - 1, cells: shifted };
      }
      return b;
    }));
  }, []);

  const handleTableDelete = useCallback((blockId) => {
    handleDeleteBlock(blockId);
    setSelectedTable(null);
  }, [handleDeleteBlock]);

  const handleTableSwapHeaders = useCallback((blockId) => {
    setDocBlocks(prev => prev.map(b => {
      if (b.id !== blockId || b.type !== 'table') return b;
      const { rows, cols, cells, cellBg = {} } = b;
      const newCells = {};
      const newCellBg = {};
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
    // 테이블 스키마: 헤더 열 정의
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
    const newRows = 1 + selectedLeaves.length; // 헤더 행 + 데이터 행

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

  const isAllTab = activeTab === 'all';
  const currentCategory = WIDGET_CATEGORIES[activeTab];

  return (
    <div className="flex flex-col h-screen text-[13px] text-dark bg-bg">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* ── 좌측 패널 ── */}
        <div className="w-[300px] bg-white border-r border-border flex flex-col shrink-0 overflow-hidden">
          <div className="px-4 pt-[14px] border-b border-border">
            <div className="text-[13px] font-semibold text-dark mb-[10px]">위젯 목록</div>
            <div className="flex">
              {[['all', '전체'], ...Object.entries(WIDGET_CATEGORIES).map(([k, c]) => [k, c.label])].map(([key, label]) => (
                <div
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-2 text-center text-[13px] cursor-pointer border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === key
                      ? 'text-primary border-primary font-semibold'
                      : 'text-muted border-transparent font-normal hover:text-dark'}`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-3" data-widget-list="true">
            {(isAllTab
              ? Object.values(WIDGET_CATEGORIES).flatMap(c => c.widgets)
              : currentCategory.widgets
            ).map(widget => (
              <WidgetListItem key={widget.id} widget={widget} onAdd={handleAddWidget} />
            ))}
          </div>

          {/* 템플릿 섹션 */}
          <div className="shrink-0 border-t border-border px-4 py-3">
            <div className="text-[11px] font-semibold text-muted mb-2">템플릿</div>
            <div
              onClick={() => handleLoadTemplate(createWeeklyTemplate)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-white cursor-pointer
                hover:border-primary hover:bg-primary-light transition-colors group"
            >
              <span className="text-[18px] shrink-0">📋</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-dark group-hover:text-primary">주간 점검 보고서</div>
                <div className="text-[10px] text-muted mt-px">번다운·타임라인·히트맵 포함</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-muted group-hover:text-primary">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* ── 캔버스 ── */}
        <div className={`flex-1 overflow-auto flex flex-col items-center ${canvasMode === 'word' ? 'bg-[#c8cdd3]' : 'bg-bg'}`}>

          {/* 모드 전환 툴바 */}
          <div className="w-full flex justify-end gap-1 px-3 py-2 bg-black/[0.08] shrink-0">
            {MODES.map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => { setCanvasMode(mode); setSelectedWidget(null); }}
                className={`flex items-center gap-[5px] px-[10px] py-1 rounded-[5px] border text-[12px] transition-colors
                  ${canvasMode === mode
                    ? 'bg-white/[0.22] border-white/30 text-white'
                    : 'border-transparent text-white/65 hover:bg-white/15 hover:text-white'}`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {canvasMode === 'grid' && (
            <GridCanvas
              canvasWidgets={canvasWidgets}
              setCanvasWidgets={setCanvasWidgets}
              config={config}
              selectedWidget={selectedWidget}
              findWidgetDef={findWidgetDef}
              onCardClick={handleCardClick}
              onRemove={handleRemove}
            />
          )}

          {canvasMode === 'word' && (
            <WordCanvas
              docBlocks={docBlocks}
              config={config}
              selectedWidget={selectedWidget}
              docConfig={docConfig}
              findWidgetDef={findWidgetDef}
              onCardClick={handleCardClick}
              onDeleteBlock={handleDeleteBlock}
              onUpdateText={handleUpdateText}
              onInsertText={handleInsertText}
              onInsertBlock={handleInsertBlock}
              onUpdateBlock={handleUpdateBlock}
              onDeleteBlocksInRange={handleDeleteBlocksInRange}
              onDeselectWidget={() => { setSelectedWidget(null); setSelectedTable(null); }}
              onReorderBlocks={handleReorderBlocks}
              onDropColToMain={handleDropColToMain}
              onMoveColBlock={handleMoveColBlock}
              onCellFocus={handleCellFocus}
              onUndo={handleUndo}
            />
          )}
        </div>

        {/* ── 우측 패널 ── */}
        <RightPanel
          mode={canvasMode}
          selected={selectedWidget}
          config={config}
          onConfigChange={handleConfigChange}
          onRemove={handleRemove}
          docConfig={docConfig}
          onDocConfigChange={setDocConfig}
          published={published}
          onPublish={() => { setPublished(true); setTimeout(() => setPublished(false), 3000); }}
          tempSaved={tempSaved}
          onTempSave={() => { setTempSaved(true); setTimeout(() => setTempSaved(false), 3000); }}
          selectedTable={selectedTable}
          onTableLoadData={handleTableLoadData}
          onTableToggleHeader={handleTableToggleHeader}
          onTableSwapHeaders={handleTableSwapHeaders}
          onTableAction={handleTableAction}
          onTableDelete={handleTableDelete}
        />
      </div>
    </div>
  );
}
