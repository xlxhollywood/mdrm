'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AppHeader    from './AppHeader';
import RightPanel   from './RightPanel';
import WidgetPreview from './widgets/WidgetPreview';
import { WIDGET_CATEGORIES, TODAY, MONTH_AGO } from '@/lib/constants';

const allWidgets = Object.values(WIDGET_CATEGORIES).flatMap(c => c.widgets);
const findWidgetDef = (id) => allWidgets.find(w => w.id === id);
const makeConfig = (def) => ({
  viewType: def?.viewTypes[0]?.id || null,
  periodOn: false, from: MONTH_AGO, to: TODAY, quick: null,
});

/* ── Word Mode Blocks ── */
function TextBlock({ block, onChange, onDelete }) {
  return (
    <div className="relative flex items-start group">
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="텍스트를 입력하세요..."
        className="flex-1 min-h-[32px] text-[13px] text-dark outline-none px-1 py-0.5"
        onInput={(e) => onChange(block.id, e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: block.html || '' }}
      />
      <button
        onClick={() => onDelete(block.id)}
        className="opacity-0 group-hover:opacity-100 ml-2 w-5 h-5 flex items-center justify-center text-[#c0c7ce] hover:text-danger text-[14px] shrink-0 transition-opacity"
      >×</button>
    </div>
  );
}

function WidgetBlock({ block, config, widgetDef, isActive, onClick, onDelete }) {
  if (!widgetDef) return null;
  const cfg = config[block.instanceId] || {};
  const viewType = cfg.viewType || widgetDef.viewTypes[0]?.id;
  return (
    <div
      className={`relative flex items-start group cursor-pointer rounded-[10px]
        ${isActive ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}`}
      onClick={() => onClick(block.instanceId, widgetDef)}
    >
      <WidgetPreview widgetId={widgetDef.id} viewType={viewType} />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
        className="opacity-0 group-hover:opacity-100 ml-2 w-5 h-5 flex items-center justify-center text-[#c0c7ce] hover:text-danger text-[14px] shrink-0 transition-opacity"
      >×</button>
    </div>
  );
}

function BlockInsert({ onInsertText }) {
  return (
    <div
      onClick={onInsertText}
      className="flex items-center gap-2 py-1 cursor-pointer opacity-0 hover:opacity-100 group transition-opacity"
    >
      <span className="flex-1 h-px bg-[#e4e8ee]" />
      <span className="w-5 h-5 rounded-full border border-[#c0c7ce] flex items-center justify-center text-[12px] text-[#c0c7ce] hover:border-primary hover:text-primary transition-colors">+</span>
      <span className="flex-1 h-px bg-[#e4e8ee]" />
    </div>
  );
}

/* ── Placed Card (Grid Mode) ── */
function PlacedCard({ instance, widgetDef, config, isActive, isDragOver, isDragging, onClick, onDragHandleMouseDown }) {
  const cfg = config[instance.id] || {};
  const viewType = cfg.viewType || widgetDef.viewTypes[0]?.id;

  return (
    <div
      data-card-id={instance.id}
      className={`relative inline-flex cursor-pointer rounded-[10px] transition-all duration-150
        ${isActive   ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}
        ${isDragOver ? 'ring-2 ring-[#3571ce] ring-offset-2 ring-dashed' : ''}
        ${isDragging ? 'opacity-30' : 'opacity-100'}`}
      onClick={() => !isDragging && onClick(instance.id, widgetDef)}
    >
      <WidgetPreview widgetId={widgetDef.id} viewType={viewType} />
      <div
        onMouseDown={(e) => { e.stopPropagation(); onDragHandleMouseDown(e, instance.id); }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-2 top-3 w-4 h-4 cursor-grab z-10"
      />
    </div>
  );
}

/* ── Main ── */
export default function WidgetDashboard() {
  const [activeTab,       setActiveTab]       = useState('system');
  const [canvasWidgets,   setCanvasWidgets]   = useState([]);
  const [selectedWidget,  setSelectedWidget]  = useState(null);
  const [config,          setConfig]          = useState({});
  const [canvasMode,      setCanvasMode]      = useState('grid');
  const [docBlocks,       setDocBlocks]       = useState([{ id: 'init', type: 'text', html: '' }]);
  const [dragOverId,      setDragOverId]      = useState(null);
  const reorderDragRef  = useRef(null);
  const [reorderDragPos, setReorderDragPos]   = useState(null);

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

  const insertTextBlock = useCallback((afterIdx) => {
    const newBlock = { id: `text-${Date.now()}`, type: 'text', html: '' };
    setDocBlocks(prev => { const a = [...prev]; a.splice(afterIdx + 1, 0, newBlock); return a; });
  }, []);

  const updateTextBlock  = useCallback((id, html) => setDocBlocks(prev => prev.map(b => b.id === id ? { ...b, html } : b)), []);
  const deleteDocBlock   = useCallback((blockId) => {
    setDocBlocks(prev => {
      const b = prev.find(x => x.id === blockId);
      if (b?.type === 'widget') {
        setConfig(c => { const n = { ...c }; delete n[b.instanceId]; return n; });
        if (selectedWidget?.instanceId === b.instanceId) setSelectedWidget(null);
      }
      return prev.filter(x => x.id !== blockId);
    });
  }, [selectedWidget]);

  const handleCardClick  = useCallback((instanceId, widgetDef) => setSelectedWidget({ instanceId, widgetDef }), []);
  const handleConfigChange = useCallback((instanceId, newCfg) => setConfig(prev => ({ ...prev, [instanceId]: newCfg })), []);

  const startReorderDrag = useCallback((e, instanceId) => {
    e.preventDefault();
    const card = e.currentTarget.closest('[data-card-id]');
    const rect = card.getBoundingClientRect();
    reorderDragRef.current = { instanceId, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    setReorderDragPos({ instanceId, x: rect.left, y: rect.top });
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!reorderDragRef.current) return;
      const { offsetX, offsetY } = reorderDragRef.current;
      setReorderDragPos(prev => prev ? { ...prev, x: e.clientX - offsetX, y: e.clientY - offsetY } : null);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const overId = el?.closest('[data-card-id]')?.getAttribute('data-card-id');
      setDragOverId(overId && overId !== reorderDragRef.current.instanceId ? overId : null);
    };
    const onUp = (e) => {
      if (!reorderDragRef.current) return;
      const { instanceId } = reorderDragRef.current;
      const toId = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-card-id]')?.getAttribute('data-card-id');
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
    <div className="flex flex-col h-screen text-[13px] text-dark bg-bg">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        <div className="w-[260px] bg-white border-r border-border flex flex-col shrink-0 overflow-hidden">
          <div className="px-4 pt-[14px] border-b border-border">
            <div className="text-[12px] font-semibold text-muted uppercase tracking-[0.06em] mb-[10px]">위젯 목록</div>
            <div className="flex">
              {Object.entries(WIDGET_CATEGORIES).map(([key, cat]) => (
                <div
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-2 text-center text-[12px] font-medium cursor-pointer border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === key
                      ? 'text-primary border-primary font-semibold'
                      : 'text-muted border-transparent hover:text-primary'}`}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-3">
            {currentCategory.widgets.map(widget => (
              <div
                key={widget.id}
                onClick={() => handleAddWidget(widget.id)}
                className="flex items-center gap-2 px-4 py-[9px] cursor-pointer border-l-[3px] border-transparent
                  transition-colors hover:bg-primary-light hover:border-primary active:bg-blue-50"
              >
                <div className="w-7 h-7 rounded bg-primary-light flex items-center justify-center shrink-0 text-[14px]">
                  {widget.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-dark truncate">{widget.name}</div>
                  <div className="text-[11px] text-muted mt-px">{widget.desc}</div>
                </div>
                <span className="text-[11px] text-border shrink-0">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Canvas ── */}
        <div
          className={`flex-1 overflow-auto flex flex-col items-center
            ${canvasMode === 'word' ? 'bg-[#c8cdd3]' : 'bg-bg'}`}
        >
          {/* 툴바 */}
          <div className="w-full flex justify-end gap-1 px-3 py-2 bg-black/[0.08] shrink-0">
            {[
              { mode: 'grid', label: 'Grid',
                icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/><rect x="7.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/><rect x="1" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/><rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.7"/></svg> },
              { mode: 'word', label: 'Word',
                icon: <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><rect x="1" y="1" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M3 4H9M3 6H9M3 8H7M3 10H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
            ].map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => setCanvasMode(mode)}
                className={`flex items-center gap-[5px] px-[10px] py-1 rounded-[5px] border text-[12px] transition-colors
                  ${canvasMode === mode
                    ? 'bg-white/[0.22] border-white/30 text-white'
                    : 'border-transparent text-white/65 hover:bg-white/15 hover:text-white'}`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Grid 모드 */}
          {canvasMode === 'grid' && (
            <div className="w-full min-h-full p-6 flex-1">
              {canvasWidgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[600px] text-border gap-3">
                  <span className="text-5xl">⊞</span>
                  <span className="text-[15px] font-medium">위젯을 배치하세요</span>
                  <span className="text-[12px] text-center">왼쪽 목록에서 위젯을 클릭하여<br/>캔버스에 추가하세요</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 content-start">
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
            <div className="w-[794px] min-h-[1123px] shrink-0 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.10)] p-10 my-6 mb-10">
              {docBlocks.map((block, i) => (
                <React.Fragment key={block.id}>
                  {block.type === 'text' ? (
                    <TextBlock block={block} onChange={updateTextBlock} onDelete={deleteDocBlock} />
                  ) : (
                    <WidgetBlock
                      block={block} config={config}
                      widgetDef={findWidgetDef(block.widgetId)}
                      isActive={selectedWidget?.instanceId === block.instanceId}
                      onClick={handleCardClick} onDelete={deleteDocBlock}
                    />
                  )}
                  <BlockInsert onInsertText={() => insertTextBlock(i)} />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <RightPanel
          selected={selectedWidget}
          config={config}
          onConfigChange={handleConfigChange}
          onRemove={handleRemove}
        />
      </div>

      {/* Floating drag card */}
      {reorderDragPos && (() => {
        const inst = canvasWidgets.find(w => w.id === reorderDragPos.instanceId);
        const def = inst ? findWidgetDef(inst.widgetId) : null;
        if (!def) return null;
        const cfg = config[reorderDragPos.instanceId] || {};
        return (
          <div
            className="fixed pointer-events-none z-[9999] rounded-[10px] scale-105 shadow-[0_20px_48px_rgba(26,34,43,0.32),0_4px_12px_rgba(53,113,206,0.2)] opacity-95"
            style={{ left: reorderDragPos.x, top: reorderDragPos.y }}
          >
            <WidgetPreview widgetId={def.id} viewType={cfg.viewType || def.viewTypes[0]?.id} />
          </div>
        );
      })()}
    </div>
  );
}
