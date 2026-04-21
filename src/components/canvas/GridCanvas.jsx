'use client';

import { useEffect, useRef, useState } from 'react';
import WidgetPreview from '../widgets/WidgetPreview';
import WidgetPlaceholder from './WidgetPlaceholder';

/* ── 배치된 카드 ── */
function PlacedCard({ instance, widgetDef, config, isActive, isDragOver, isDragging, onClick, onDelete, onDragHandleMouseDown }) {
  const cfg = config[instance.id] || {};
  const viewType = cfg.viewType || widgetDef.viewTypes[0]?.id;
  const showPreview = !widgetDef.hasSystemSelect || (cfg.systemIds?.length > 0);
  const showBorder = cfg.showBorder !== false;
  const showLabel  = cfg.showLabel  !== false;

  return (
    <div
      data-card-id={instance.id}
      className={`relative inline-flex cursor-pointer rounded-[10px] transition-all duration-150
        ${isActive   ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}
        ${isDragOver ? 'ring-2 ring-[#3571ce] ring-offset-2 ring-dashed' : ''}
        ${isDragging ? 'opacity-30' : 'opacity-100'}`}
      onClick={() => !isDragging && onClick(instance.id, widgetDef)}
    >
      {showPreview
        ? <WidgetPreview widgetId={widgetDef.id} viewType={viewType} showBorder={showBorder} showLabel={showLabel} title={cfg.widgetTitle} showSummary={cfg.showSummary} headerRow={cfg.headerRow !== false} headerCol={!!cfg.headerCol} />
        : <WidgetPlaceholder widgetDef={widgetDef} />}

      {isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(instance.id); }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#5b646f] text-white text-[11px] font-bold flex items-center justify-center shadow-md z-20 hover:bg-[#1a222b] transition-colors"
        >×</button>
      )}

      <div
        onMouseDown={(e) => { e.stopPropagation(); onDragHandleMouseDown(e, instance.id); }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-2 top-3 w-4 h-4 cursor-grab z-10"
      />
    </div>
  );
}

/* ── Grid 캔버스 ── */
export default function GridCanvas({ canvasWidgets, setCanvasWidgets, config, selectedWidget, findWidgetDef, onCardClick, onRemove }) {
  const [dragOverId,    setDragOverId]    = useState(null);
  const [reorderDragPos, setReorderDragPos] = useState(null);
  const reorderDragRef = useRef(null);

  const startReorderDrag = (e, instanceId) => {
    e.preventDefault();
    const card = e.currentTarget.closest('[data-card-id]');
    const rect = card.getBoundingClientRect();
    reorderDragRef.current = { instanceId, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    setReorderDragPos({ instanceId, x: rect.left, y: rect.top });
  };

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

  return (
    <>
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
                  onClick={onCardClick}
                  onDelete={onRemove}
                  onDragHandleMouseDown={startReorderDrag}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 드래그 중 플로팅 카드 */}
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
    </>
  );
}
