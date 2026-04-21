'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import WidgetPreview from '../../widgets/WidgetPreview';
import WidgetPlaceholder from '../WidgetPlaceholder';
import TextBlock from './TextBlock';
import TodoListBlock from './TodoListBlock';

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

/* ── 행/열 구분선 삽입 포인트 ── */
/* position:absolute 로 부모 td 전체를 호버 영역으로 사용 */
/* align: 'row' → 하단 중앙 (행 거터), 'col' → 하단 우측 (열 거터) */


/* ── ��/열 컨텍스트 메뉴 ── */
function TableCtxMenu({ type, anchorRect, onClose, onMoveUp, onMoveDown, onDelete, onClear, onBgColor, canMoveUp, canMoveDown, onAddBefore, onAddAfter, onMerge, onSplit, canMerge, canSplit }) {
  const menuRef = useRef(null);
  const [showColor, setShowColor] = useState(false);
  const label = type === 'row' ? '행' : '열';

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    const onKey   = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown',   onKey);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const Item = ({ icon, txt, onClick: oc, danger, disabled }) => (
    <button
      onMouseDown={e => e.preventDefault()}
      onClick={() => { oc(); }}
      disabled={disabled}
      className={`w-full px-3 py-[7px] text-left text-[13px] leading-none flex items-center gap-2 transition-colors
        ${danger   ? 'text-red-400 hover:bg-red-400/10'   : 'text-white/90 hover:bg-white/10 hover:text-white'}
        ${disabled ? 'opacity-30 cursor-not-allowed'     : ''}`}
    >
      <span className="w-4 text-center shrink-0 text-[13px] leading-none">{icon}</span><span>{txt}</span>
    </button>
  );

  const upIcon   = type === 'row' ? '↑' : '←';
  const downIcon = type === 'row' ? '↓' : '→';
  const upLabel  = type === 'row' ? '행 위로 이동'     : '열 왼쪽으로 이동';
  const downLabel= type === 'row' ? '행 아래로 이동'   : '열 오른쪽으로 이동';
  const addBeforeLabel = type === 'row' ? '위에 행 추가' : '왼쪽에 열 추가';
  const addAfterLabel  = type === 'row' ? '아래에 행 추가' : '오른쪽에 열 추가';
  const addBeforeIcon  = type === 'row' ? '⬆' : '⬅';
  const addAfterIcon   = type === 'row' ? '⬇' : '➡';

  const BG_PRESETS = ['#ffffff','#fef9c3','#fce7f3','#dbeafe','#d1fae5','#ede9fe','#fee2e2','#e5e7eb'];

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: type === 'cell' ? anchorRect.left : anchorRect.right + 6, top: anchorRect.top, zIndex: 9999 }}
      className="bg-[#232d3b] rounded-[8px] shadow-[0_6px_24px_rgba(0,0,0,0.45)] py-1.5 min-w-[176px]"
    >
      {type !== 'cell' && (
        <>
          <Item icon={addBeforeIcon} txt={addBeforeLabel} onClick={() => { onAddBefore?.(); onClose(); }} />
          <Item icon={addAfterIcon}  txt={addAfterLabel}  onClick={() => { onAddAfter?.();  onClose(); }} />
          <div className="h-px bg-white/15 my-1.5" />
          <Item icon={upIcon}   txt={upLabel}   onClick={() => { onMoveUp();   onClose(); }} disabled={!canMoveUp}   />
          <Item icon={downIcon} txt={downLabel} onClick={() => { onMoveDown(); onClose(); }} disabled={!canMoveDown} />
          <div className="h-px bg-white/15 my-1.5" />
        </>
      )}

      {/* 배경색 */}
      <div className="relative">
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={() => setShowColor(s => !s)}
          className="w-full px-3 py-[7px] text-left text-[13px] leading-none text-white/90 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors"
        >
          <span className="w-4 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="8" width="12" height="4" rx="1" fill="white" opacity="0.6"/>
              <path d="M7 2L3 8h8L7 2z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>채우기</span>
          <span className="ml-auto text-white/40 text-[11px]">›</span>
        </button>
        {showColor && (
          <div
            onMouseDown={e => e.stopPropagation()}
            className="absolute left-full top-0 bg-[#232d3b] border border-white/15 rounded-[8px] shadow-xl p-2.5"
          >
            <div className="flex flex-wrap gap-[5px] w-[108px]">
              {BG_PRESETS.map(color => (
                <button
                  key={color}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { onBgColor(color); onClose(); }}
                  className="w-[24px] h-[24px] rounded-[3px] border border-white/15 hover:scale-110 transition-transform shrink-0"
                  style={{ background: color }}
                />
              ))}
            </div>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onBgColor(null); onClose(); }}
              className="mt-[6px] w-full text-[11px] text-white/50 hover:text-red-400 text-left px-1"
            >배경색 제거</button>
          </div>
        )}
      </div>

      {canMerge && <Item icon="⊞" txt="셀 병합" onClick={() => { onMerge?.(); onClose(); }} />}
      {canSplit && <Item icon="⊟" txt="셀 나누기" onClick={() => { onSplit?.(); onClose(); }} />}
      <Item icon="✕" txt="셀 지우기"  onClick={() => { onClear();  onClose(); }} />
      {type !== 'cell' && <div className="h-px bg-[#eef0f2] my-1" />}
      {type !== 'cell' && <Item icon="🗑" txt={`${label} 삭제`} onClick={() => { onDelete(); onClose(); }} danger />}
    </div>
  );
}

/* ── 셀 선택 플로팅 툴바 ── */
function CellToolbar({ sel, tableRef, tableWrapRef, cellFocused, canMerge, canSplit, onMerge, onSplit, onClear, onBgColor }) {
  const [pos, setPos] = useState(null);
  const [showColor, setShowColor] = useState(false);
  const toolbarRef = useRef(null);

  useLayoutEffect(() => {
    if (!tableRef.current || !tableWrapRef.current) { setPos(null); return; }
    const wrapRect = tableWrapRef.current.getBoundingClientRect();
    // 선택 영역의 앵커(r1,c1)와 끝(r2,c2) 셀 DOM을 찾아 좌표 계산
    const allTds = tableRef.current.querySelectorAll('td[class*="border"]');
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    allTds.forEach(td => {
      const cellId = td.querySelector('[data-cell-id]')?.dataset.cellId;
      if (!cellId) return;
      const parts = cellId.split('-');
      const r = parseInt(parts[parts.length - 2]);
      const c = parseInt(parts[parts.length - 1]);
      if (r >= sel.r1 && r <= sel.r2 && c >= sel.c1 && c <= sel.c2) {
        const rect = td.getBoundingClientRect();
        minX = Math.min(minX, rect.left);
        maxX = Math.max(maxX, rect.right);
        minY = Math.min(minY, rect.top);
        maxY = Math.max(maxY, rect.bottom);
      }
    });
    if (minX === Infinity) { setPos(null); return; }
    setPos({
      left: (minX + maxX) / 2 - wrapRect.left,
      top: maxY - wrapRect.top + 6,
    });
  }, [sel, tableRef, tableWrapRef]);

  if (!pos) return null;

  const BG_PRESETS = ['#ffffff','#fef9c3','#fce7f3','#dbeafe','#d1fae5','#ede9fe','#fee2e2','#e5e7eb'];

  const Btn = ({ children, label, title, onClick }) => (
    <button
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="h-7 px-2 flex items-center gap-1.5 rounded text-white hover:bg-white/15 transition-colors shrink-0"
    >
      <span className="flex items-center justify-center w-[14px] h-[14px] shrink-0">{children}</span>
      {label && <span className="text-[12px] leading-none translate-y-[1px]">{label}</span>}
    </button>
  );
  const Sep = () => <div className="w-px h-4 bg-white/20 mx-0.5 shrink-0" />;

  return (
    <div
      ref={toolbarRef}
      style={{ position: 'absolute', left: pos.left, top: pos.top, transform: 'translateX(-50%)', zIndex: 50 }}
      onMouseDown={e => e.preventDefault()}
      className="bg-[#232d3b] rounded-[8px] shadow-[0_6px_24px_rgba(0,0,0,0.45)] flex items-center gap-0.5 px-2 py-[5px]"
    >
      {canMerge && (
        <Btn title="셀 병합" label="병합" onClick={onMerge}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="white" strokeWidth="1.2"/>
            <path d="M4.5 7h5M7 4.5v5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </Btn>
      )}
      {canSplit && (
        <Btn title="셀 나누기" label="나누기" onClick={onSplit}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="white" strokeWidth="1.2"/>
            <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </Btn>
      )}
      {(canMerge || canSplit) && <Sep />}

      {/* 배경색 */}
      <div className="relative">
        <Btn title="채우기" label="채우기" onClick={() => setShowColor(s => !s)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="8" width="12" height="4" rx="1" fill="white" opacity="0.6"/>
            <path d="M7 2L3 8h8L7 2z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </Btn>
        {showColor && (
          <div
            onMouseDown={e => e.stopPropagation()}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#232d3b] border border-white/15 rounded-[8px] shadow-xl p-2.5"
          >
            <div className="flex flex-wrap gap-[5px] w-[108px]">
              {BG_PRESETS.map(color => (
                <button
                  key={color}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { onBgColor(color); setShowColor(false); }}
                  className="w-[24px] h-[24px] rounded-[3px] border border-white/15 hover:scale-110 transition-transform shrink-0"
                  style={{ background: color }}
                />
              ))}
            </div>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onBgColor(null); setShowColor(false); }}
              className="mt-[6px] w-full text-[11px] text-white/50 hover:text-red-400 text-left px-1"
            >배경색 제거</button>
          </div>
        )}
      </div>

      <Btn title="셀 지우기" label="지우기" onClick={onClear}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 4h8M5.5 4V3h3v1M4 4v7.5h6V4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Btn>
    </div>
  );
}

/* ── 표 블록 ── */
export function TableBlock({
  block, onUpdateBlock, onCellFocus, onFocusBlock,
  onAddRow, onAddCol,
  onDeleteRow, onDeleteCol,
  onMoveRow, onMoveCol,
  forceSync = 0,
}) {
  const { rows = 3, cols = 3, cells = {}, cellBg = {}, headerRow = true, headerCol = false, merges = [] } = block;
  const cellRefs     = useRef({});
  const colWidthsRef = useRef(null);
  const rowHeightsRef = useRef(null);
  const tableWrapRef = useRef(null);
  const tableRef     = useRef(null);

  const [colWidths, setColWidths] = useState(() =>
    block.colWidths ?? Array.from({ length: cols }, () => 100 / cols)
  );
  const [rowHeights, setRowHeights] = useState(() =>
    block.rowHeights ?? Array.from({ length: rows }, () => null)
  );
  const [colBoundaryXs, setColBoundaryXs] = useState([]); // 열 경계 x 좌표 (오버레이용)
  const [rowBoundaryYs, setRowBoundaryYs] = useState([]); // 행 경계 y 좌표 (오버레이용)
  const [hovRowHandle,  setHovRowHandle]  = useState(null); // 호버 중인 행 리사이즈 핸들
  const [hovColHandle, setHovColHandle]   = useState(null); // 호버 중인 열 핸들 인덱스
  const [draggingCol, setDraggingCol] = useState(null); // { col } — 시각 표시용
  const [draggingRow, setDraggingRow] = useState(null); // { row } — 시각 표시용
  const [hovGutterCol, setHovGutterCol] = useState(null); // 호버 중인 열 거터 (드래그핸들 표시용)
  const [hovGutterRow, setHovGutterRow] = useState(null); // 호버 중인 행 거터 (드래그핸들 표시용)
  const [sel,         setSel]         = useState(null);  // { r1,r2,c1,c2 }
  const [isDragging,  setIsDragging]  = useState(false);
  const [dragOrigin,  setDragOrigin]  = useState(null);
  const [ctxMenu,     setCtxMenu]     = useState(null);  // { type, idx, rect }
  const dragStartPosRef = useRef(null); // mousedown 위치 — 드래그 임계값 판단용
  const [cellFocused, setCellFocused] = useState(false); // 셀에 포커스 있을 때만 거터 표시

  /* 열 수 변경 시 colWidths 동기화 */
  useEffect(() => {
    setColWidths(prev => {
      if (prev.length === cols) return prev;
      if (prev.length < cols) return [...prev, ...Array.from({ length: cols - prev.length }, () => 100 / cols)];
      return prev.slice(0, cols);
    });
  }, [cols]);

  /* 행 수 변경 시 rowHeights 동기화 */
  useEffect(() => {
    setRowHeights(prev => {
      if (prev.length === rows) return prev;
      if (prev.length < rows) return [...prev, ...Array.from({ length: rows - prev.length }, () => null)];
      return prev.slice(0, rows);
    });
  }, [rows]);

  /* 열 너비 드래그 시작 (race condition 없이 즉시 리스너 등록) */
  const startColResize = (e, colIdx) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startWidths = [...colWidths];
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    setDraggingCol({ col: colIdx });
    const onMove = (ev) => {
      const tableWidth = tableWrapRef.current?.getBoundingClientRect().width || 600;
      const deltaP = ((ev.clientX - startX) / tableWidth) * 100;
      const nw = [...startWidths];
      nw[colIdx]     = Math.max(5, startWidths[colIdx]     + deltaP);
      nw[colIdx + 1] = Math.max(5, startWidths[colIdx + 1] - deltaP);
      const sum  = nw.reduce((a, b) => a + b, 0);
      const norm = nw.map(w => (w / sum) * 100);
      setColWidths(norm);
      colWidthsRef.current = norm;
    };
    const onUp = () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      setDraggingCol(null);
      if (colWidthsRef.current) { onUpdateBlock(block.id, { colWidths: colWidthsRef.current }); colWidthsRef.current = null; }
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* 행 높이 드래그 시작 */
  const startRowResize = (e, rowIdx) => {
    e.preventDefault(); e.stopPropagation();
    const startY = e.clientY;
    const startHeight = rowHeights[rowIdx] || 32;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
    setDraggingRow({ row: rowIdx });
    const onMove = (ev) => {
      const h = Math.max(24, startHeight + (ev.clientY - startY));
      setRowHeights(prev => { const next = [...prev]; next[rowIdx] = h; rowHeightsRef.current = next; return next; });
    };
    const onUp = () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      setDraggingRow(null);
      if (rowHeightsRef.current) { onUpdateBlock(block.id, { rowHeights: rowHeightsRef.current }); rowHeightsRef.current = null; }
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* 구조 변경(삽입/삭제/이동) 후 DOM 콘텐츠 동기화 */
  useEffect(() => {
    Object.entries(cellRefs.current).forEach(([key, el]) => {
      if (!el) return;
      const expected = cells[key] ?? '';
      if (el.innerHTML !== expected) el.innerHTML = expected;
    });
  }, [rows, cols, forceSync]); // eslint-disable-line react-hooks/exhaustive-deps


  /* 테이블 내 셀 포커스 추적 — 거터 표시용 */
  useEffect(() => {
    const wrap = tableWrapRef.current;
    if (!wrap) return;
    const onIn  = () => setCellFocused(true);
    const onOut = (e) => { if (!wrap.contains(e.relatedTarget)) setCellFocused(false); };
    wrap.addEventListener('focusin',  onIn);
    wrap.addEventListener('focusout', onOut);
    return () => { wrap.removeEventListener('focusin', onIn); wrap.removeEventListener('focusout', onOut); };
  }, []);

  /* 열/행 경계 좌표 측정 — 오버레이 핸들 위치 계산용 */
  useLayoutEffect(() => {
    if (!tableRef.current || !tableWrapRef.current) return;
    const wrapRect = tableWrapRef.current.getBoundingClientRect();
    const allRows = tableRef.current.querySelectorAll('tbody tr');
    const dataRow = allRows[0];
    if (!dataRow) return;
    const tds = Array.from(dataRow.querySelectorAll('td'));
    const xs = tds.slice(0, tds.length - 1).map(td => {
      const rect = td.getBoundingClientRect();
      return rect.right - wrapRect.left;
    });
    setColBoundaryXs(xs);

    const ys = Array.from(allRows).slice(0, allRows.length - 1).map(tr => {
      const rect = tr.getBoundingClientRect();
      return rect.bottom - wrapRect.top;
    });
    setRowBoundaryYs(ys);
  }, [cols, colWidths, rows, rowHeights]);

  /* 셀 드래그 선택 종료 */
  useEffect(() => {
    if (!isDragging) return;
    const onUp = () => setIsDragging(false);
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [isDragging]);

  /* 테이블 외부 클릭 시 선택 해제 */
  useEffect(() => {
    const handler = (e) => {
      if (tableWrapRef.current && !tableWrapRef.current.contains(e.target)) {
        setSel(null); setCtxMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const focusCell = (r, c) => {
    const el = cellRefs.current[`${r},${c}`];
    if (!el) return;
    el.focus();
    const range = document.createRange(); range.selectNodeContents(el); range.collapse(false);
    const sel2 = window.getSelection(); sel2.removeAllRanges(); sel2.addRange(range);
  };

  /* 선택 헬퍼 */
  const isSelected = (r, c) =>
    sel && r >= sel.r1 && r <= sel.r2 && c >= sel.c1 && c <= sel.c2;
  const isFullRowSel = (r) =>
    sel && sel.r1 <= r && r <= sel.r2 && sel.c1 === 0 && sel.c2 === cols - 1;
  const isFullColSel = (c) =>
    sel && sel.c1 <= c && c <= sel.c2 && sel.r1 === 0 && sel.r2 === rows - 1;

  /* 병합 헬퍼 */
  const getMergeAt = (r, c) => merges.find(m => r >= m.r1 && r <= m.r2 && c >= m.c1 && c <= m.c2);
  const isMergeAnchor = (r, c) => merges.some(m => m.r1 === r && m.c1 === c);
  const isMergedHidden = (r, c) => { const m = getMergeAt(r, c); return m && (m.r1 !== r || m.c1 !== c); };

  /* 셀 병합 */
  const handleMergeCells = () => {
    if (!sel) return;
    const { r1, r2, c1, c2 } = sel;
    if (r1 === r2 && c1 === c2) return;
    // 기존 병합 중 선택 범위와 겹치는 것 제거
    const filtered = merges.filter(m =>
      m.r2 < r1 || m.r1 > r2 || m.c2 < c1 || m.c1 > c2
    );
    // 앵커 셀에 내용 합치기
    const anchorKey = `${r1},${c1}`;
    const newCells = { ...cells };
    const parts = [];
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const k = `${r},${c}`;
        const v = (newCells[k] || '').trim();
        if (v) parts.push(v);
        if (r !== r1 || c !== c1) delete newCells[k];
      }
    }
    newCells[anchorKey] = parts.join('<br>');
    // DOM 동기화
    Object.keys(cellRefs.current).forEach(k => {
      const el = cellRefs.current[k];
      if (el) { el.dataset.init = ''; }
    });
    onUpdateBlock(block.id, { cells: newCells, merges: [...filtered, { r1, c1, r2, c2 }] });
  };

  /* 셀 나누기 */
  const handleSplitCell = () => {
    if (!sel) return;
    // 선택 범위 안에 있는 모든 병합을 제거
    const filtered = merges.filter(m =>
      m.r2 < sel.r1 || m.r1 > sel.r2 || m.c2 < sel.c1 || m.c1 > sel.c2
    );
    // DOM 동기화
    Object.keys(cellRefs.current).forEach(k => {
      const el = cellRefs.current[k];
      if (el) { el.dataset.init = ''; }
    });
    onUpdateBlock(block.id, { merges: filtered });
  };

  /* 선택 영역에 병합이 포함되어 있는지 */
  const selHasMerge = sel && merges.some(m =>
    !(m.r2 < sel.r1 || m.r1 > sel.r2 || m.c2 < sel.c1 || m.c1 > sel.c2)
  );
  /* 선택 영역이 2셀 이상인지 */
  const selIsMulti = sel && (sel.r1 !== sel.r2 || sel.c1 !== sel.c2);

  /* 셀 마우스다운: 다른 셀로 드래그 시 범위 선택 시작 */
  const handleCellMouseDown = (e, r, c) => {
    if (e.shiftKey && sel) {
      setSel({ r1: Math.min(sel.r1, r), r2: Math.max(sel.r2, r), c1: Math.min(sel.c1, c), c2: Math.max(sel.c2, c) });
    } else {
      setSel(null);
      setDragOrigin({ r, c });
      setIsDragging(true);
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    }
    setCtxMenu(null);
  };

  /* 셀 마우스엔터: 드래그 중 진입한 셀 기준으로 범위 갱신 */
  const handleCellMouseEnter = (r, c) => {
    if (!isDragging || !dragOrigin) return;
    window.getSelection()?.removeAllRanges();
    setSel({
      r1: Math.min(dragOrigin.r, r), r2: Math.max(dragOrigin.r, r),
      c1: Math.min(dragOrigin.c, c), c2: Math.max(dragOrigin.c, c),
    });
  };

  /* 컨텍스트 메뉴 동작 */
  const getSelCells = () => {
    if (!sel) return [];
    const out = [];
    for (let r = sel.r1; r <= sel.r2; r++) for (let c = sel.c1; c <= sel.c2; c++) out.push(`${r},${c}`);
    return out;
  };
  const clearSelContents = () => {
    const newCells = { ...cells };
    getSelCells().forEach(key => { newCells[key] = ''; const el = cellRefs.current[key]; if (el) el.innerHTML = ''; });
    onUpdateBlock(block.id, { cells: newCells });
  };
  const applyBgColor = (color) => {
    const newBg = { ...cellBg };
    getSelCells().forEach(key => { if (color) newBg[key] = color; else delete newBg[key]; });
    onUpdateBlock(block.id, { cellBg: newBg });
  };

  return (
    <div ref={tableWrapRef} className="py-1 px-1" style={{ position: 'relative', overflow: 'visible', cursor: draggingCol ? 'col-resize' : draggingRow ? 'row-resize' : undefined }} onClick={e => e.stopPropagation()}>
      {/* 열 너비 조절 오버레이 핸들 — 표 전체 높이에 걸쳐 렌더링 */}
      {colBoundaryXs.map((x, i) => (
        <div
          key={i}
          onMouseDown={e => startColResize(e, i)}
          onMouseEnter={() => setHovColHandle(i)}
          onMouseLeave={() => setHovColHandle(null)}
          style={{
            position: 'absolute', top: 0, bottom: 0,
            left: x - 6, width: 12,
            cursor: 'col-resize', zIndex: 40,
            display: 'flex', alignItems: 'stretch',
          }}
        >
          <div style={{
            margin: '0 auto', width: 2,
            background: (draggingCol?.col === i || hovColHandle === i) ? '#0056a4' : 'transparent',
            transition: 'background 0.1s',
          }} />
        </div>
      ))}
      {/* 행 높이 조절 오버레이 핸들 — 표 전체 너비에 걸쳐 렌더링 */}
      {rowBoundaryYs.map((y, i) => (
        <div
          key={`row-${i}`}
          onMouseDown={e => startRowResize(e, i)}
          onMouseEnter={() => setHovRowHandle(i)}
          onMouseLeave={() => setHovRowHandle(null)}
          style={{
            position: 'absolute', left: 0, right: 0,
            top: y - 4, height: 8,
            cursor: 'row-resize', zIndex: 40,
            display: 'flex', alignItems: 'center',
          }}
        >
          <div style={{
            width: '100%', height: 2,
            background: (draggingRow?.row === i || hovRowHandle === i) ? '#0056a4' : 'transparent',
            transition: 'background 0.1s',
          }} />
        </div>
      ))}
      {/* 열 드래그핸들 오버레이 — 각 열 상단 테두리 중앙에 배치 */}
      {cellFocused && (() => {
        const tableTop = tableRef.current ? tableRef.current.getBoundingClientRect().top - tableWrapRef.current.getBoundingClientRect().top : 0;
        return Array.from({ length: cols }, (_, c) => {
          const left = c === 0 ? 0 : colBoundaryXs[c - 1] || 0;
          const right = c < colBoundaryXs.length ? colBoundaryXs[c] : (tableRef.current?.offsetWidth || 0);
          const cx = (left + right) / 2;
          return (
            <div
              key={`col-handle-${c}`}
              style={{ position: 'absolute', left, top: tableTop - 14, width: right - left, height: 28, zIndex: 35 }}
              onMouseEnter={() => setHovGutterCol(c)}
              onMouseLeave={() => setHovGutterCol(null)}
            >
              {hovGutterCol === c && (
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={e => {
                    setSel({ r1: 0, r2: rows - 1, c1: c, c2: c });
                    setCtxMenu({ type: 'col', c1: c, c2: c, rect: e.currentTarget.getBoundingClientRect() });
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[14px] h-[14px] flex items-center justify-center rounded-[3px] cursor-pointer bg-[#0056a4] hover:bg-[#004a8f]"
                  title="열 옵션"
                >
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 1.5h6M1 4h6" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          );
        });
      })()}
      {/* 행 드래그핸들 오버레이 — 각 행 좌측 테두리 중앙에 배치 */}
      {cellFocused && (() => {
        const wrapRect = tableWrapRef.current?.getBoundingClientRect();
        const tblRect = tableRef.current?.getBoundingClientRect();
        const tableTop = (wrapRect && tblRect) ? tblRect.top - wrapRect.top : 0;
        const tableBottom = (wrapRect && tblRect) ? tblRect.bottom - wrapRect.top : 0;
        return Array.from({ length: rows }, (_, r) => {
          const top = r === 0 ? tableTop : (rowBoundaryYs[r - 1] || tableTop);
          const bottom = r < rowBoundaryYs.length ? rowBoundaryYs[r] : tableBottom;
          const cy = (top + bottom) / 2;
          return (
            <div
              key={`row-handle-${r}`}
              style={{ position: 'absolute', left: -28, top, width: 28, height: bottom - top, zIndex: 35 }}
              onMouseEnter={() => setHovGutterRow(r)}
              onMouseLeave={() => setHovGutterRow(null)}
            >
              {hovGutterRow === r && (
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={e => {
                    setSel({ r1: r, r2: r, c1: 0, c2: cols - 1 });
                    setCtxMenu({ type: 'row', r1: r, r2: r, rect: e.currentTarget.getBoundingClientRect() });
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[14px] h-[14px] flex items-center justify-center rounded-[3px] cursor-pointer bg-[#0056a4] hover:bg-[#004a8f]"
                  title="행 옵션"
                >
                  <svg width="6" height="8" viewBox="0 0 6 8" fill="none">
                    <path d="M1.5 1v6M4.5 1v6" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          );
        });
      })()}
      {ctxMenu && (
        <TableCtxMenu
          type={ctxMenu.type}
          anchorRect={ctxMenu.rect}
          onClose={() => setCtxMenu(null)}
          canMoveUp={ctxMenu.type === 'row' ? ctxMenu.r1 > 0 : ctxMenu.c1 > 0}
          canMoveDown={ctxMenu.type === 'row' ? ctxMenu.r2 < rows - 1 : ctxMenu.c2 < cols - 1}
          onMoveUp={()   => ctxMenu.type === 'row' ? onMoveRow?.(block.id, ctxMenu.r1, ctxMenu.r2, 'up')   : onMoveCol?.(block.id, ctxMenu.c1, ctxMenu.c2, 'left')}
          onMoveDown={()  => ctxMenu.type === 'row' ? onMoveRow?.(block.id, ctxMenu.r1, ctxMenu.r2, 'down') : onMoveCol?.(block.id, ctxMenu.c1, ctxMenu.c2, 'right')}
          onDelete={()    => ctxMenu.type === 'row' ? onDeleteRow?.(block.id, ctxMenu.r1, ctxMenu.r2)       : onDeleteCol?.(block.id, ctxMenu.c1, ctxMenu.c2)}
          onAddBefore={() => ctxMenu.type === 'row' ? onAddRow?.(block.id, ctxMenu.r1)   : onAddCol?.(block.id, ctxMenu.c1)}
          onAddAfter={() =>  ctxMenu.type === 'row' ? onAddRow?.(block.id, ctxMenu.r1 + 1) : onAddCol?.(block.id, ctxMenu.c1 + 1)}
          onClear={clearSelContents}
          onBgColor={applyBgColor}
          canMerge={selIsMulti}
          canSplit={selHasMerge}
          onMerge={handleMergeCells}
          onSplit={handleSplitCell}
        />
      )}

      <table
        ref={tableRef}
        className="border-collapse w-full"
        style={{ tableLayout: 'fixed', userSelect: (isDragging && sel && (sel.r1 !== sel.r2 || sel.c1 !== sel.c2)) ? 'none' : undefined }}
      >
        <colgroup>
          {Array.from({ length: cols }, (_, c) => <col key={c} style={{ width: `${colWidths[c] ?? (100 / cols)}%` }} />)}
        </colgroup>
        <tbody>
          {/* 실제 행들 */}
          {Array.from({ length: rows }, (_, r) => {
            return (
            <tr key={r} style={rowHeights[r] ? { height: rowHeights[r] } : undefined}>

              {/* 실제 셀들 */}
              {Array.from({ length: cols }, (_, c) => {
                // 병합으로 숨겨진 셀은 렌더링하지 않음
                if (isMergedHidden(r, c)) return null;

                const merge    = getMergeAt(r, c);
                const rSpan    = merge ? merge.r2 - merge.r1 + 1 : 1;
                const cSpan    = merge ? merge.c2 - merge.c1 + 1 : 1;
                const key      = `${r},${c}`;
                const isHeader = (headerRow && r === 0) || (headerCol && c === 0);
                const selected = isSelected(r, c);
                const bg       = cellBg[key] || (isHeader ? '#f5f5f5' : '#ffffff');
                const selBg    = selected ? (isHeader ? '#cfddf5' : '#dce8ff') : bg;

                return (
                  <td
                    key={c}
                    rowSpan={rSpan > 1 ? rSpan : undefined}
                    colSpan={cSpan > 1 ? cSpan : undefined}
                    className="relative border border-[#d9dfe5]"
                    style={{ background: selBg }}
                    onMouseDown={e => { handleCellMouseDown(e, r, c); }}
                    onMouseEnter={() => handleCellMouseEnter(r, c)}
                    onMouseLeave={e => {
                      if (!isDragging || !dragOrigin || dragOrigin.r !== r || dragOrigin.c !== c || sel || !dragStartPosRef.current) return;
                      const dx = e.clientX - dragStartPosRef.current.x;
                      const dy = e.clientY - dragStartPosRef.current.y;
                      if (Math.sqrt(dx * dx + dy * dy) < 8) return;
                      window.getSelection()?.removeAllRanges();
                      setSel({ r1: r, r2: r, c1: c, c2: c });
                    }}
                  >
                    <div
                      ref={el => {
                        if (el) {
                          cellRefs.current[key] = el;
                          if (!el.dataset.init) { el.dataset.init = '1'; el.innerHTML = cells[key] || ''; }
                        }
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      data-cell-id={`${block.id}-${r}-${c}`}
                      className={`outline-none text-[13px] min-h-[32px] px-2 py-[6px] ${isHeader ? 'font-semibold' : ''}`}
                      style={{ color: '#1a222b' }}
                      onFocus={() => { onCellFocus?.(block.id, r, c); onFocusBlock?.(); }}
                      onInput={e => onUpdateBlock(block.id, { cells: { ...cells, [key]: e.currentTarget.innerHTML } })}
                      onKeyDown={e => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          if (e.shiftKey) {
                            if (c > 0)      focusCell(r, c - 1);
                            else if (r > 0) focusCell(r - 1, cols - 1);
                          } else {
                            if (c < cols - 1)      focusCell(r, c + 1);
                            else if (r < rows - 1) focusCell(r + 1, 0);
                            else { onUpdateBlock(block.id, { rows: rows + 1 }); setTimeout(() => focusCell(rows, 0), 30); }
                          }
                          return;
                        }
                        if (e.key === 'ArrowUp')   { e.preventDefault(); if (r > 0)        focusCell(r - 1, c); return; }
                        if (e.key === 'ArrowDown')  { e.preventDefault(); if (r < rows - 1) focusCell(r + 1, c); return; }
                      }}
                    />
                  </td>
                );
              })}
            </tr>
            );
          })}
        </tbody>
      </table>

      {/* 셀 선택 플로팅 툴바 */}
      {sel && !isDragging && !ctxMenu && <CellToolbar
        sel={sel}
        tableRef={tableRef}
        tableWrapRef={tableWrapRef}
        cellFocused={cellFocused}
        canMerge={selIsMulti}
        canSplit={selHasMerge}
        onMerge={handleMergeCells}
        onSplit={handleSplitCell}
        onClear={clearSelContents}
        onBgColor={applyBgColor}
      />}
    </div>
  );
}
