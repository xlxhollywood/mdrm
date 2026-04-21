'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import WidgetPreview from '../../widgets/WidgetPreview';
import WidgetPlaceholder from '../WidgetPlaceholder';
import TextBlock from './TextBlock';
import TodoListBlock from './TodoListBlock';
export { default as TableBlock } from './TableBlock';

export function DragHandleIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
      <circle cx="3"  cy="2.5"  r="1.2" fill="currentColor"/>
      <circle cx="7"  cy="2.5"  r="1.2" fill="currentColor"/>
      <circle cx="3"  cy="7"    r="1.2" fill="currentColor"/>
      <circle cx="7"  cy="7"    r="1.2" fill="currentColor"/>
      <circle cx="3"  cy="11.5" r="1.2" fill="currentColor"/>
      <circle cx="7"  cy="11.5" r="1.2" fill="currentColor"/>
    </svg>
  );
}

export function WidgetBlock({ block, config, widgetDef, isActive, onClick, onDelete }) {
  if (!widgetDef) return null;
  const cfg = config[block.instanceId] || {};
  const viewType    = cfg.viewType   || widgetDef.viewTypes[0]?.id;
  const showPreview = !widgetDef.hasSystemSelect || (cfg.systemIds?.length > 0);
  const showBorder  = cfg.showBorder !== false;
  const showLabel   = cfg.showLabel  !== false;

  return (
    <div className="flex items-start w-full">
      <div
        className={`relative cursor-pointer rounded-[10px] flex-1 min-w-0 ${isActive ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}`}
        onClick={(e) => { e.stopPropagation(); onClick(block.instanceId, widgetDef); }}
      >
        {showPreview
          ? <WidgetPreview widgetId={widgetDef.id} viewType={viewType} showBorder={showBorder} showLabel={showLabel} title={cfg.widgetTitle} showSummary={cfg.showSummary} headerRow={cfg.headerRow !== false} headerCol={!!cfg.headerCol} />
          : <WidgetPlaceholder widgetDef={widgetDef} className="w-full min-h-[120px]" />}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
        className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-[#c0c7ce] hover:text-danger text-[14px] transition-opacity bg-white rounded-full border border-[#e2e5e9] shadow-sm z-10"
      >×</button>
    </div>
  );
}

/* ── 위젯 래퍼: 너비 100% 채움 ── */
function ScaledWidget({ children }) {
  return <div className="px-[10px] py-[10px]">{children}</div>;
}

/* ── 열 레이아웃 셀 블록 — TextBlock/TodoListBlock 재사용 ── */
function LayoutCellBlock({
  block, onUpdateBlock, onUpdateText, onFocusBlock,
  activeBlockId, allSelected,
  onEnterBlock, onBackspaceBlock, onArrowBlock, onDeleteBlock, onConvertToSubtype,
  onSlashTrigger, onSlashClose, slashMenuRef, isSlashOpen,
  config, findWidgetDef, selectedWidget, onCardClick,
  bulletNumber, onDragHandleMouseDown, isDragging, blockRef,
}) {
  const [hovered, setHovered] = React.useState(false);
  const isActive = allSelected || activeBlockId === block.id;

  const inner = (() => {
    if (block.type === 'divider') {
      return <div className="py-1"><div className="h-px bg-[#d9dfe5]" /></div>;
    }
    if (block.type === 'text') {
      if (block.subtype === 'todo') {
        return (
          <TodoListBlock
            block={block}
            onUpdateBlock={onUpdateBlock}
            onEnterAfterBlock={onEnterBlock}
            onBackspaceAtStart={onBackspaceBlock}
            onArrowOut={onArrowBlock}
            onFocusBlock={onFocusBlock}
            lineHeight={1.6}
            letterSpacing={0}
          />
        );
      }
      return (
        <TextBlock
          block={block}
          onChange={onUpdateText}
          onDelete={onDeleteBlock}
          onEnter={onEnterBlock}
          onArrow={onArrowBlock}
          onBackspaceAtStart={onBackspaceBlock}
          onFocusBlock={() => { onFocusBlock?.(block.id); }}
          onBlurBlock={() => {}}
          isBlockActive={activeBlockId === block.id}
          allSelected={allSelected}
          bulletNumber={bulletNumber}
          onConvertToSubtype={onConvertToSubtype}
          lineHeight={1.6}
          letterSpacing={0}
          onSlashTrigger={onSlashTrigger}
          onSlashClose={onSlashClose}
          isSlashOpen={isSlashOpen}
          slashMenuRef={slashMenuRef}
        />
      );
    }
    if (block.type === 'widget') {
      const widgetDef = findWidgetDef?.(block.widgetId);
      if (!widgetDef) return null;
      return (
        <ScaledWidget>
          <WidgetBlock
            block={block}
            config={config}
            widgetDef={widgetDef}
            isActive={selectedWidget?.instanceId === block.instanceId}
            onClick={onCardClick}
            onDelete={onDeleteBlock}
          />
        </ScaledWidget>
      );
    }
    return null;
  })();

  return (
    <div
      ref={blockRef}
      className={`relative group/cell transition-all duration-100 rounded-[6px] ${isDragging ? 'opacity-30' : isActive ? 'bg-[#dce8ff]' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 드래그 핸들 */}
      <div
        className={`absolute left-0 top-[3px] transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          window.getSelection()?.removeAllRanges();
          onDragHandleMouseDown?.(e, block.id);
        }}
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'grab', transform: 'translateX(-100%)' }}
      >
        <DragHandleIcon />
      </div>
      {inner}
    </div>
  );
}

export function LayoutBlock({ block, colBlocks, registerColRef, registerColBlockRef, hoveredColKey,
  colDropInfo, draggingColBlockId, onColDragHandleMouseDown,
  onUpdateBlock, onUpdateText, onFocusBlock,
  activeBlockId, allSelected,
  onSlashTrigger, onSlashClose, slashMenuRef, slashBlockId, onCreateColumnBlock,
  onColumnEnter, onColumnBackspace, onColumnArrow, onConvertToSubtype,
  config, findWidgetDef, selectedWidget, onCardClick, onDeleteBlock }) {
  const { cols = 2 } = block;

  const defaultWidths = useCallback(() => Array.from({ length: cols }, () => 100 / cols), [cols]);

  const [colWidths,  setColWidths]  = useState(() => block.colWidths ?? defaultWidths());
  const [minHeight,  setMinHeight]  = useState(block.colMinHeight ?? 0);
  const containerRef  = useRef(null);
  const resizeRef     = useRef(null);
  const colWidthsRef  = useRef(colWidths);
  const minHeightRef  = useRef(minHeight);

  // cols 변경 시 너비 초기화
  useEffect(() => {
    const w = block.colWidths ?? Array.from({ length: cols }, () => 100 / cols);
    setColWidths(w);
    colWidthsRef.current = w;
  }, [cols]); // eslint-disable-line react-hooks/exhaustive-deps

  // 리사이즈 마우스 이벤트
  useEffect(() => {
    const onMove = (e) => {
      if (!resizeRef.current) return;
      if (resizeRef.current.type === 'col') {
        const { colIdx, startX, startWidths } = resizeRef.current;
        const cw = containerRef.current?.getBoundingClientRect().width || 500;
        const deltaP = ((e.clientX - startX) / cw) * 100;
        const nw = [...startWidths];
        nw[colIdx]     = Math.max(8, startWidths[colIdx]     + deltaP);
        nw[colIdx + 1] = Math.max(8, startWidths[colIdx + 1] - deltaP);
        const sum  = nw.reduce((a, b) => a + b, 0);
        const norm = nw.map(w => (w / sum) * 100);
        colWidthsRef.current = norm;
        setColWidths(norm);
      } else if (resizeRef.current.type === 'height') {
        const { startY, startHeight } = resizeRef.current;
        const h = Math.max(0, startHeight + (e.clientY - startY));
        minHeightRef.current = h;
        setMinHeight(h);
      }
    };
    const onUp = () => {
      if (!resizeRef.current) return;
      document.body.style.userSelect = '';
      if (resizeRef.current.type === 'col')    onUpdateBlock(block.id, { colWidths:    colWidthsRef.current });
      if (resizeRef.current.type === 'height') onUpdateBlock(block.id, { colMinHeight: minHeightRef.current });
      resizeRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [block.id, onUpdateBlock]);

  return (
    <div className="w-full py-[5px]">
      {/* 열 컨테이너 */}
      <div ref={containerRef} className="flex w-full">
        {Array.from({ length: cols }, (_, colIdx) => {
          const blocks  = colBlocks?.[colIdx] || [];
          const colKey  = `${block.id}::${colIdx}`;
          const isHover = hoveredColKey === colKey;
          const isLast  = colIdx === cols - 1;
          const width   = colWidths[colIdx] ?? (100 / cols);

          return (
            <React.Fragment key={colIdx}>
              <div
                ref={el => registerColRef?.(colKey, el)}
                data-layout-col="true"
                data-layout-id={block.id}
                data-col-idx={String(colIdx)}
                className={`rounded-[4px] transition-colors cursor-text
                  ${isHover ? 'bg-[#eef4ff]' : ''}`}
                style={{ width: `${width}%`, minHeight: minHeight || undefined }}
                onClick={(e) => {
                  if (e.target.isContentEditable || e.target.closest('[data-text-id]')) return;
                  e.stopPropagation();
                  const lastBlock = blocks[blocks.length - 1];
                  if (!lastBlock) {
                    onCreateColumnBlock?.(block.id, colIdx);
                  } else if (lastBlock.type === 'text') {
                    const el = document.querySelector(`[data-text-id="${lastBlock.id}"]`);
                    if (el) {
                      el.focus();
                      const sel = window.getSelection();
                      sel.removeAllRanges();
                      const r = document.createRange();
                      r.selectNodeContents(el);
                      r.collapse(false);
                      sel.addRange(r);
                    }
                  } else {
                    onColumnEnter?.(lastBlock.id);
                  }
                }}
              >
                {blocks.length === 0 ? (
                  <div
                    className="text-[13px] text-[#c0c7ce] cursor-text py-0.5"
                    onClick={e => { e.stopPropagation(); onCreateColumnBlock?.(block.id, colIdx); }}
                  >
                    {isHover ? '여기에 놓기' : '텍스트를 입력하세요'}
                  </div>
                ) : (
                  <div className="space-y-1 cursor-text">
                    {(() => {
                      const thisColKey = `${block.id}::${colIdx}`;
                      const isActiveCol = colDropInfo?.colKey === thisColKey;
                      return blocks.map((b, bIdx) => (
                        <React.Fragment key={b.id}>
                          {isActiveCol && colDropInfo?.insertBeforeBlockId === b.id && (
                            <div className="h-[2px] bg-primary rounded-full my-0.5" />
                          )}
                          <LayoutCellBlock
                            block={b}
                            onUpdateBlock={onUpdateBlock}
                            onUpdateText={onUpdateText}
                            activeBlockId={activeBlockId}
                            allSelected={allSelected}
                            onFocusBlock={onFocusBlock}
                            onEnterBlock={onColumnEnter ? (id) => onColumnEnter(id) : undefined}
                            onBackspaceBlock={onColumnBackspace ? (id, html) => onColumnBackspace(id, html) : undefined}
                            onArrowBlock={onColumnArrow ? (id, dir, x) => onColumnArrow(id, dir, x) : undefined}
                            onDeleteBlock={onDeleteBlock}
                            onConvertToSubtype={onConvertToSubtype}
                            onSlashTrigger={onSlashTrigger}
                            onSlashClose={onSlashClose}
                            slashMenuRef={slashMenuRef}
                            isSlashOpen={slashBlockId === b.id}
                            bulletNumber={b.subtype === 'numbered'
                              ? blocks.slice(0, bIdx).filter(x => x.subtype === 'numbered').length + 1
                              : null}
                            config={config}
                            findWidgetDef={findWidgetDef}
                            selectedWidget={selectedWidget}
                            onCardClick={onCardClick}
                            onDragHandleMouseDown={onColDragHandleMouseDown}
                            isDragging={draggingColBlockId === b.id}
                            blockRef={el => registerColBlockRef?.(b.id, el)}
                          />
                        </React.Fragment>
                      ));
                    })()}
                    {/* 맨 끝 드롭 표시선 */}
                    {colDropInfo?.colKey === `${block.id}::${colIdx}` && colDropInfo?.insertBeforeBlockId === null && (
                      <div className="h-[2px] bg-primary rounded-full my-0.5" />
                    )}
                  </div>
                )}
              </div>

              {/* 열 너비 조절 핸들 */}
              {!isLast && (
                <div
                  className="w-[1px] shrink-0 cursor-col-resize flex items-stretch justify-center group self-stretch"
                  onMouseDown={e => {
                    e.preventDefault();
                    document.body.style.userSelect = 'none';
                    resizeRef.current = { type: 'col', colIdx, startX: e.clientX, startWidths: [...colWidthsRef.current] };
                  }}
                >
                  <div className="w-px h-[60%] my-auto bg-[#e2e5e9] group-hover:bg-[#3571ce] group-hover:w-[3px] transition-all rounded-full" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
}
