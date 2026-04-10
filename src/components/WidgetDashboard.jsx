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
  const [config,         setConfig]         = useState({});
  const [canvasMode,     setCanvasMode]     = useState('grid');
  const [docBlocks,      setDocBlocks]      = useState([{ id: 'init', type: 'text', html: '' }]);
  const [published,      setPublished]      = useState(false);
  const [docConfig,      setDocConfig]      = useState({
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 25, bottom: 25, left: 25, right: 25 },
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
      return prev.filter(x => x.id !== blockId);
    });
  }, [selectedWidget]);

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
              onDeleteBlocksInRange={handleDeleteBlocksInRange}
              onDeselectWidget={() => setSelectedWidget(null)}
              onReorderBlocks={handleReorderBlocks}
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
        />
      </div>
    </div>
  );
}
