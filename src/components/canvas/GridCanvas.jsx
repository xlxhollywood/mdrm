'use client';

import { useEffect, useRef, useState } from 'react';
import WidgetPreview from '../widgets/WidgetPreview';
import WidgetPlaceholder from './WidgetPlaceholder';

/* ── 배치된 카드 ── */
function PlacedCard({ instance, widgetDef, config, isActive, isDragOver, isDragging, onClick, onDelete, onDuplicate, onDragHandleMouseDown, onResize }) {
  const cfg = config[instance.id] || {};
  const viewType = cfg.viewType || widgetDef.viewTypes[0]?.id;
  const showPreview = !widgetDef.hasSystemSelect || (cfg.systemIds?.length > 0);
  const showBorder = cfg.showBorder !== false;
  const showLabel  = cfg.showLabel  !== false;
  const cardRef = useRef(null);
  const cardWidth = instance.width || 'auto';

  const startResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const el = cardRef.current;
    if (!el) return;
    const startW = el.offsetWidth;
    let lastW = startW;
    let raf = 0;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
    const onMove = (ev) => {
      lastW = Math.max(200, startW + (ev.clientX - startX));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { el.style.width = `${lastW}px`; });
    };
    const onUp = () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      cancelAnimationFrame(raf);
      // DOM에 최종 값 유지한 채 state 업데이트
      el.style.width = `${lastW}px`;
      onResize(instance.id, lastW);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      data-card-id={instance.id}
      className={`relative flex items-start shrink-0 group/card
        ${isDragging ? 'opacity-30' : 'opacity-100'}`}
      style={{ width: cardWidth }}
    >
      {/* 드래그 핸들 (카드 좌측) */}
      <div
        onMouseDown={(e) => { e.stopPropagation(); onDragHandleMouseDown(e, instance.id); }}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 w-[24px] flex items-start justify-center pt-[10px] self-stretch cursor-grab active:cursor-grabbing opacity-0 group-hover/card:opacity-100 transition-opacity"
        title="드래그하여 위치 변경"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
          <circle cx="2.5" cy="2" r="1.3" fill="#b0b8c1"/>
          <circle cx="7.5" cy="2" r="1.3" fill="#b0b8c1"/>
          <circle cx="2.5" cy="8" r="1.3" fill="#b0b8c1"/>
          <circle cx="7.5" cy="8" r="1.3" fill="#b0b8c1"/>
          <circle cx="2.5" cy="14" r="1.3" fill="#b0b8c1"/>
          <circle cx="7.5" cy="14" r="1.3" fill="#b0b8c1"/>
        </svg>
      </div>

      {/* 카드 본체 */}
      <div
        ref={cardRef}
        className={`relative flex-1 min-w-0 cursor-pointer rounded-[8px] transition-all duration-150
          ${isActive   ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}
          ${isDragOver ? 'ring-2 ring-[#3571ce] ring-offset-2 ring-dashed' : ''}`}
        onClick={() => !isDragging && onClick(instance.id, widgetDef)}
      >
        {showPreview
          ? <WidgetPreview widgetId={widgetDef.id} viewType={viewType} showBorder={showBorder} showLabel={showLabel} title={cfg.widgetTitle} showSummary={cfg.showSummary} showFailDetail={cfg.showFailDetail} showNonpassDetail={cfg.showNonpassDetail} displayMode={cfg.displayMode} inspName={cfg.inspName} headerRow={cfg.headerRow !== false} headerCol={!!cfg.headerCol} onDuplicate={isActive ? () => onDuplicate(instance.id) : undefined} onDelete={isActive ? () => onDelete(instance.id) : undefined} />
          : <WidgetPlaceholder widgetDef={widgetDef} />}

        {/* 우측 리사이즈 핸들 */}
        <div
          onMouseDown={startResize}
          className="absolute right-0 top-0 bottom-0 w-[6px] cursor-ew-resize z-10 group/resize"
        >
          <div className="w-[2px] h-[30px] my-auto bg-transparent group-hover/resize:bg-[#3571ce] transition-colors rounded-full absolute top-1/2 right-[2px] -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}

/* ── Grid 캔버스 ── */
export default function GridCanvas({ canvasWidgets, setCanvasWidgets, config, onConfigChange, selectedWidget, findWidgetDef, onCardClick, onRemove, gridTitle, gridSubtitle, onTitleChange, onSubtitleChange }) {
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

  const handleResize = (instanceId, width) => {
    setCanvasWidgets(prev => prev.map(w => w.id === instanceId ? { ...w, width } : w));
  };

  const handleDuplicate = (instanceId) => {
    const src = canvasWidgets.find(w => w.id === instanceId);
    if (!src) return;
    const newId = `${src.widgetId}-${Date.now()}`;
    const srcIdx = canvasWidgets.indexOf(src);
    setCanvasWidgets(prev => {
      const arr = [...prev];
      arr.splice(srcIdx + 1, 0, { ...src, id: newId });
      return arr;
    });
    if (config[instanceId] && onConfigChange) {
      onConfigChange(newId, { ...config[instanceId] });
    }
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
      <div className="w-full min-h-full flex-1 flex flex-col items-center bg-[#e8ecf0] overflow-auto">
        {/* 시트지 */}
        <div
          className="shrink-0 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.1)] my-6 mb-10"
          style={{ width: 1100, minHeight: 900, padding: '32px 28px' }}
        >
          {/* 헤더 */}
          {gridTitle !== undefined && (
            <div className="mb-5">
              <input
                type="text"
                value={gridTitle}
                onChange={e => onTitleChange?.(e.target.value)}
                placeholder="보고서 제목을 입력하세요"
                className="text-[22px] font-semibold text-[#1a222b] leading-tight w-full outline-none bg-transparent border-none hover:bg-[#f8fafc] focus:bg-[#f8fafc] rounded px-1 -mx-1 transition-colors"
              />
              <input
                type="text"
                value={gridSubtitle || ''}
                onChange={e => onSubtitleChange?.(e.target.value)}
                placeholder="부제목 (날짜, 요약 등)"
                className="text-[12px] text-[#64748b] mt-1.5 w-full outline-none bg-transparent border-none hover:bg-[#f8fafc] focus:bg-[#f8fafc] rounded px-1 -mx-1 transition-colors"
              />
              <div className="h-[2px] bg-[#0056a4] mt-3 w-full" />
            </div>
          )}

          {/* 위젯 그리드 */}
          <div className="flex flex-wrap gap-3 content-start">
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
                  onDuplicate={handleDuplicate}
                  onDragHandleMouseDown={startReorderDrag}
                  onResize={handleResize}
                />
              );
            })}

          </div>
        </div>
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
            style={{ left: reorderDragPos.x, top: reorderDragPos.y, width: inst.width || 'auto' }}
          >
            <WidgetPreview widgetId={def.id} viewType={cfg.viewType || def.viewTypes[0]?.id} />
          </div>
        );
      })()}
    </>
  );
}
