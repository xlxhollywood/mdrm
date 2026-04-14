'use client';

import { useState, useCallback } from 'react';
import AppHeader  from './AppHeader';
import RightPanel from './RightPanel';
import GridCanvas from './canvas/GridCanvas';
import WordCanvas from './canvas/WordCanvas';
import { WIDGET_CATEGORIES, TODAY, MONTH_AGO } from '@/lib/constants';

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
  const [config,         setConfig]         = useState({});
  const [canvasMode,     setCanvasMode]     = useState('grid');
  const [docBlocks,      setDocBlocks]      = useState([{ id: 'init', type: 'text', html: '' }]);
  const [published,      setPublished]      = useState(false);
  const [tempSaved,      setTempSaved]      = useState(false);
  const [docConfig,      setDocConfig]      = useState({
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 25, bottom: 25, left: 25, right: 25 },
    lineHeight: 1.6,
    letterSpacing: 0,
    blockSpacing: 3,
  });

  const handleAddWidget = useCallback((widgetId) => {
    const instanceId = `${widgetId}-${Date.now()}`;
    const def = findWidgetDef(widgetId);
    setConfig(prev => ({ ...prev, [instanceId]: makeConfig(def) }));
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

  const handleCardClick    = useCallback((instanceId, widgetDef) => setSelectedWidget({ instanceId, widgetDef }), []);
  const handleConfigChange = useCallback((instanceId, newCfg) => setConfig(prev => ({ ...prev, [instanceId]: newCfg })), []);

  const handleUpdateText = useCallback((id, html) =>
    setDocBlocks(prev => prev.map(b => b.id === id ? { ...b, html } : b)), []);

  const handleInsertText = useCallback((afterIdx, id) => {
    const newBlock = { id: id || `text-${Date.now()}`, type: 'text', html: '' };
    setDocBlocks(prev => { const a = [...prev]; a.splice(afterIdx + 1, 0, newBlock); return a; });
  }, []);

  const handleDeleteBlocksInRange = useCallback((keepId, deleteIds) => {
    if (keepId === null) {
      // 전체 선택 삭제 → 빈 블록 하나로 리셋
      setDocBlocks([{ id: `text-${Date.now()}`, type: 'text', html: '' }]);
      setSelectedWidget(null);
      return;
    }
    setDocBlocks(prev =>
      prev
        .filter(b => !deleteIds.includes(b.id) && !deleteIds.includes(b.instanceId))
        .map(b => b.id === keepId ? { ...b, html: '' } : b)
    );
    deleteIds.forEach(id => {
      setConfig(c => { const n = { ...c }; delete n[id]; return n; });
    });
    if (deleteIds.includes(selectedWidget?.instanceId)) setSelectedWidget(null);
  }, [selectedWidget]);

  const handleReorderBlocks = useCallback((fromIdx, toIdx) => {
    setDocBlocks(prev => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, item);
      return arr;
    });
  }, []);

  const handleDeleteBlock = useCallback((blockId) => {
    setDocBlocks(prev => {
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
    setDocBlocks(prev => { const a = [...prev]; a.splice(afterIdx + 1, 0, blockDef); return a; });
  }, []);

  const handleUpdateBlock = useCallback((id, fields) => {
    setDocBlocks(prev => prev.map(b => b.id === id ? { ...b, ...fields } : b));
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
    setSelectedTable(prev => {
      if (!prev) return prev;
      const { blockId, row, col } = prev;
      setDocBlocks(blocks => blocks.map(b => {
        if (b.id !== blockId || b.type !== 'table') return b;
        let { rows, cols, cells } = b;
        const shifted = {};
        if (action === 'addRowBelow') {
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[r > row ? `${r+1},${c}` : k] = v; });
          return { ...b, rows: rows + 1, cells: shifted };
        }
        if (action === 'addRowAbove') {
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[r >= row ? `${r+1},${c}` : k] = v; });
          setTimeout(() => setSelectedTable(s => s ? { ...s, row: s.row + 1 } : s), 0);
          return { ...b, rows: rows + 1, cells: shifted };
        }
        if (action === 'deleteRow') {
          if (rows <= 1) return b;
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); if (r !== row) shifted[r > row ? `${r-1},${c}` : k] = v; });
          setTimeout(() => setSelectedTable(s => s ? { ...s, row: Math.max(0, s.row - 1), rows: rows - 1 } : s), 0);
          return { ...b, rows: rows - 1, cells: shifted };
        }
        if (action === 'addColRight') {
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[c > col ? `${r},${c+1}` : k] = v; });
          return { ...b, cols: cols + 1, cells: shifted };
        }
        if (action === 'addColLeft') {
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); shifted[c >= col ? `${r},${c+1}` : k] = v; });
          setTimeout(() => setSelectedTable(s => s ? { ...s, col: s.col + 1, cols: cols + 1 } : s), 0);
          return { ...b, cols: cols + 1, cells: shifted };
        }
        if (action === 'deleteCol') {
          if (cols <= 1) return b;
          Object.entries(cells).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); if (c !== col) shifted[c > col ? `${r},${c-1}` : k] = v; });
          setTimeout(() => setSelectedTable(s => s ? { ...s, col: Math.max(0, s.col - 1), cols: cols - 1 } : s), 0);
          return { ...b, cols: cols - 1, cells: shifted };
        }
        return b;
      }));
      return prev;
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
          <div className="flex-1 overflow-y-auto py-3">
            {(isAllTab
              ? Object.values(WIDGET_CATEGORIES).flatMap(c => c.widgets)
              : currentCategory.widgets
            ).map(widget => (
              <WidgetListItem key={widget.id} widget={widget} onAdd={handleAddWidget} />
            ))}
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
              onCellFocus={handleCellFocus}
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
