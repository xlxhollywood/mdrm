'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import WidgetPreview from '../../widgets/WidgetPreview';
import WidgetPlaceholder from '../WidgetPlaceholder';

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
    <div className="flex items-start">
      <div
        className={`relative cursor-pointer rounded-[10px] ${isActive ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}`}
        onClick={(e) => { e.stopPropagation(); onClick(block.instanceId, widgetDef); }}
      >
        {showPreview
          ? <WidgetPreview widgetId={widgetDef.id} viewType={viewType} showBorder={showBorder} showLabel={showLabel} />
          : <WidgetPlaceholder widgetDef={widgetDef} />}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
        className="opacity-0 group-hover:opacity-100 ml-2 w-5 h-5 flex items-center justify-center text-[#c0c7ce] hover:text-danger text-[14px] shrink-0 transition-opacity mt-2"
      >×</button>
    </div>
  );
}

/* ── 열 레이아웃 블록 ── */
function LayoutCellBlock({ block, onUpdateBlock, onFocusBlock, onSlashTrigger, onSlashClose, slashMenuRef, isSlashOpen }) {
  const ref = useRef(null);
  const slashStartRef = useRef(null);

  useEffect(() => {
    if (ref.current && !ref.current.dataset.init) {
      ref.current.dataset.init = '1';
      ref.current.innerHTML = block.html || '';
      // 초기 비어있을 때만 placeholder 표시
      const isEmpty = !(block.html || '').replace(/<br\s*\/?>/gi, '').trim();
      if (isEmpty) ref.current.setAttribute('data-placeholder', '텍스트를 입력하세요');
    }
  });

  const getCaretRect = () => {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return { left: 0, right: 0, top: 0, bottom: 0 };
    return sel.getRangeAt(0).getBoundingClientRect();
  };

  const handleInput = (e) => {
    const html  = e.currentTarget.innerHTML;
    const text  = (e.currentTarget.textContent || '').trim();
    // 내용 있으면 placeholder 숨김, 비면 다시 표시
    if (text) e.currentTarget.removeAttribute('data-placeholder');
    else      e.currentTarget.setAttribute('data-placeholder', '텍스트를 입력하세요');
    onUpdateBlock(block.id, { html });

    if (slashStartRef.current !== null) {
      const query = text.slice(slashStartRef.current);
      if (query.includes(' ') || text.length < slashStartRef.current) {
        slashStartRef.current = null;
        onSlashClose?.();
      } else {
        onSlashTrigger?.(block.id, getCaretRect(), query);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (isSlashOpen && slashMenuRef?.current) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); slashMenuRef.current.navigate(e.key); return; }
      if (e.key === 'Enter')  { e.preventDefault(); slashMenuRef.current.select(); return; }
      if (e.key === 'Escape') { onSlashClose?.(); return; }
    }
    if (e.key === '/') {
      const text = ref.current?.textContent || '';
      slashStartRef.current = text.length + 1;
      setTimeout(() => onSlashTrigger?.(block.id, getCaretRect(), ''), 0);
    }
  };

  if (block.type === 'divider') {
    return <div className="py-1"><div className="h-px bg-[#d9dfe5]" /></div>;
  }
  if (block.type === 'text') {
    return (
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-text-id={block.id}
        className="outline-none text-[13px] text-[#1a222b] min-h-[20px] px-1 relative"
        onFocus={() => onFocusBlock?.()}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />
    );
  }
  if (block.type === 'widget') {
    return (
      <div className="text-[12px] text-[#5b646f] px-2 py-1.5 bg-[#f5f5f5] rounded-[4px]">
        위젯: {block.widgetId}
      </div>
    );
  }
  return null;
}

export function LayoutBlock({ block, colBlocks, registerColRef, hoveredColKey, onUpdateBlock, onFocusBlock, onSlashTrigger, onSlashClose, slashMenuRef, slashBlockId, onCreateColumnBlock }) {
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
    <div className="w-full py-1">
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
                className={`rounded-[4px] transition-colors overflow-hidden px-2 py-1
                  ${isHover ? 'bg-[#eef4ff]' : ''}`}
                style={{ width: `${width}%`, minHeight: minHeight || undefined }}
              >
                {blocks.length === 0 ? (
                  <div
                    className="text-[13px] text-[#c0c7ce] cursor-text py-0.5"
                    onClick={e => { e.stopPropagation(); onCreateColumnBlock?.(block.id, colIdx); }}
                  >
                    {isHover ? '여기에 놓기' : '텍스트를 입력하세요'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {blocks.map(b => (
                      <LayoutCellBlock
                        key={b.id}
                        block={b}
                        onUpdateBlock={onUpdateBlock}
                        onFocusBlock={onFocusBlock}
                        onSlashTrigger={onSlashTrigger}
                        onSlashClose={onSlashClose}
                        slashMenuRef={slashMenuRef}
                        isSlashOpen={slashBlockId === b.id}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 열 너비 조절 핸들 */}
              {!isLast && (
                <div
                  className="w-[9px] shrink-0 cursor-col-resize flex items-stretch justify-center group self-stretch"
                  onMouseDown={e => {
                    e.preventDefault();
                    document.body.style.userSelect = 'none';
                    resizeRef.current = { type: 'col', colIdx, startX: e.clientX, startWidths: [...colWidthsRef.current] };
                  }}
                >
                  <div className="w-px self-stretch bg-[#e2e5e9] group-hover:bg-[#3571ce] group-hover:w-[3px] transition-all rounded-full" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 높이 조절 핸들 (호버 시 표시) */}
      <div
        className="h-[12px] cursor-row-resize flex items-center justify-center group mt-0.5"
        onMouseDown={e => {
          e.preventDefault();
          document.body.style.userSelect = 'none';
          const curH = containerRef.current?.getBoundingClientRect().height || 0;
          resizeRef.current = { type: 'height', startY: e.clientY, startHeight: minHeightRef.current || curH };
        }}
      >
        <div className="w-8 h-[3px] rounded-full opacity-0 group-hover:opacity-100 bg-[#3571ce] transition-opacity" />
      </div>
    </div>
  );
}

/* ── 행/열 구분선 삽입 포인트 ── */
/* position:absolute 로 부모 td 전체를 호버 영역으로 사용 */
/* align: 'row' → 하단 중앙 (행 거터), 'col' → 하단 우측 (열 거터) */
function SepDot({ hovered, onClick, onEnter, onLeave, align = 'row' }) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseDown={e => e.preventDefault()}
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{ position: 'absolute', inset: 0 }}
      className={`cursor-pointer flex items-end pb-[2px] ${align === 'col' ? 'justify-end pr-[2px]' : 'justify-center'}`}
    >
      <div className={`rounded-full transition-all duration-100 select-none flex items-center justify-center
        ${hovered ? 'w-[14px] h-[14px] bg-[#0056a4] shadow-sm' : 'w-[4px] h-[4px] bg-[#c8cdd3]'}`}>
        {hovered && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4 1v6M1 4h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}

/* ── 행/열 컨텍스트 메뉴 ── */
function TableCtxMenu({ type, anchorRect, onClose, onMoveUp, onMoveDown, onDelete, onClear, onBgColor, canMoveUp, canMoveDown }) {
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
      className={`w-full px-3 py-[6px] text-left text-[13px] flex items-center gap-2 transition-colors
        ${danger   ? 'text-[#fb2c36] hover:bg-red-50'   : 'text-[#1a222b] hover:bg-[#f5f5f5]'}
        ${disabled ? 'opacity-30 cursor-not-allowed'     : ''}`}
    >
      <span className="w-4 text-center shrink-0 text-[12px]">{icon}</span>{txt}
    </button>
  );

  const upIcon   = type === 'row' ? '↑' : '←';
  const downIcon = type === 'row' ? '↓' : '→';
  const upLabel  = type === 'row' ? '행 위로 이동'     : '열 왼쪽으로 이동';
  const downLabel= type === 'row' ? '행 아래로 이동'   : '열 오른쪽으로 이동';

  const BG_PRESETS = ['#ffffff','#fef9c3','#fce7f3','#dbeafe','#d1fae5','#ede9fe','#fee2e2','#e5e7eb'];

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: anchorRect.right + 6, top: anchorRect.top, zIndex: 9999 }}
      className="bg-white border border-[#d9dfe5] rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] py-1 min-w-[168px]"
    >
      <Item icon={upIcon}   txt={upLabel}   onClick={() => { onMoveUp();   onClose(); }} disabled={!canMoveUp}   />
      <Item icon={downIcon} txt={downLabel} onClick={() => { onMoveDown(); onClose(); }} disabled={!canMoveDown} />
      <div className="h-px bg-[#eef0f2] my-1" />

      {/* 배경색 */}
      <div className="relative">
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={() => setShowColor(s => !s)}
          className="w-full px-3 py-[6px] text-left text-[13px] text-[#1a222b] hover:bg-[#f5f5f5] flex items-center gap-2 transition-colors"
        >
          <span className="w-4 text-center shrink-0 text-[12px]">🎨</span>
          배경색
          <span className="ml-auto text-[#5b646f] text-[11px]">›</span>
        </button>
        {showColor && (
          <div
            onMouseDown={e => e.stopPropagation()}
            className="absolute left-full top-0 bg-white border border-[#d9dfe5] rounded-[8px] shadow-lg p-2"
          >
            <div className="flex flex-wrap gap-[5px] w-[108px]">
              {BG_PRESETS.map(color => (
                <button
                  key={color}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { onBgColor(color); onClose(); }}
                  className="w-[24px] h-[24px] rounded-[3px] border border-[#d9dfe5] hover:scale-110 transition-transform shrink-0"
                  style={{ background: color }}
                />
              ))}
            </div>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onBgColor(null); onClose(); }}
              className="mt-[6px] w-full text-[11px] text-[#5b646f] hover:text-[#fb2c36] text-left px-1"
            >배경색 제거</button>
          </div>
        )}
      </div>

      <Item icon="✕" txt="셀 지우기"  onClick={() => { onClear();  onClose(); }} />
      <div className="h-px bg-[#eef0f2] my-1" />
      <Item icon="🗑" txt={`${label} 삭제`} onClick={() => { onDelete(); onClose(); }} danger />
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
  const { rows = 3, cols = 3, cells = {}, cellBg = {}, headerRow = true, headerCol = false } = block;
  const cellRefs     = useRef({});
  const colWidthsRef = useRef(null);
  const tableWrapRef = useRef(null);

  const [colWidths, setColWidths] = useState(() =>
    block.colWidths ?? Array.from({ length: cols }, () => 100)
  );
  const [draggingCol, setDraggingCol] = useState(null); // { col, startX, startWidth }
  const [hovSepRow,   setHovSepRow]   = useState(null);
  const [hovSepCol,   setHovSepCol]   = useState(null);
  const [sel,         setSel]         = useState(null);  // { r1,r2,c1,c2 }
  const [isDragging,  setIsDragging]  = useState(false);
  const [dragOrigin,  setDragOrigin]  = useState(null);
  const [ctxMenu,     setCtxMenu]     = useState(null);  // { type, idx, rect }

  /* 열 수 변경 시 colWidths 동기화 */
  useEffect(() => {
    setColWidths(prev => {
      if (prev.length === cols) return prev;
      if (prev.length < cols) return [...prev, ...Array.from({ length: cols - prev.length }, () => 100)];
      return prev.slice(0, cols);
    });
  }, [cols]);

  /* 구조 변경(삽입/삭제/이동) 후 DOM 콘텐츠 동기화 */
  useEffect(() => {
    Object.entries(cellRefs.current).forEach(([key, el]) => {
      if (!el) return;
      const expected = cells[key] ?? '';
      if (el.innerHTML !== expected) el.innerHTML = expected;
    });
  }, [rows, cols, forceSync]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 열 너비 드래그 */
  useEffect(() => {
    if (!draggingCol) return;
    const onMove = (e) => {
      const delta = e.clientX - draggingCol.startX;
      const w = Math.max(50, draggingCol.startWidth + delta);
      setColWidths(prev => {
        const next = [...prev]; next[draggingCol.col] = w;
        colWidthsRef.current = next; return next;
      });
    };
    const onUp = () => {
      if (colWidthsRef.current) onUpdateBlock(block.id, { colWidths: colWidthsRef.current });
      setDraggingCol(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [draggingCol]); // eslint-disable-line react-hooks/exhaustive-deps

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

  /* 셀 마우스다운: sel을 초기화하고 드래그 원점만 기록 */
  const handleCellMouseDown = (e, r, c) => {
    if (e.shiftKey && sel) {
      // Shift+클릭: 기존 선택 확장
      setSel({ r1: Math.min(sel.r1, r), r2: Math.max(sel.r2, r), c1: Math.min(sel.c1, c), c2: Math.max(sel.c2, c) });
    } else {
      // 새 드래그 시작 — 아직 sel은 설정하지 않음 (다른 셀에 진입 시 설정)
      setSel(null);
      setDragOrigin({ r, c });
      setIsDragging(true);
    }
    setCtxMenu(null);
  };

  /* 셀 마우스엔터: 다른 셀로 진입할 때만 범위 선택 시작 */
  const handleCellMouseEnter = (r, c) => {
    if (!isDragging || !dragOrigin) return;
    if (r === dragOrigin.r && c === dragOrigin.c) return; // 원점 셀 복귀 → 선택 해제
    // 텍스트 드래그 취소하고 셀 범위 선택으로 전환
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
    <div ref={tableWrapRef} className="py-1 overflow-x-auto" style={{ cursor: draggingCol ? 'col-resize' : undefined }} onClick={e => e.stopPropagation()}>
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
          onClear={clearSelContents}
          onBgColor={applyBgColor}
        />
      )}

      <table
        className="border-collapse"
        style={{ tableLayout: 'fixed', userSelect: isDragging ? 'none' : undefined }}
      >
        <colgroup>
          <col style={{ width: 16 }} />
          {Array.from({ length: cols }, (_, c) => <col key={c} style={{ width: colWidths[c] ?? 100 }} />)}
        </colgroup>
        <tbody>
          {/* 상단 거터: 열 삽입 포인트 + 열 선택 밴드 */}
          <tr key="top-gutter" style={{ height: 20 }}>
            <td style={{ padding: 0, border: 0 }} />
            {Array.from({ length: cols }, (_, c) => {
              const isFullColRange   = sel && sel.r1 === 0 && sel.r2 === rows - 1;
              const isColAnchor      = isFullColRange && c === sel.c1;
              const colGutterSkip    = isFullColRange && c > sel.c1 && c <= sel.c2;
              const colGutterSpan    = isColAnchor ? sel.c2 - sel.c1 + 1 : 1;
              if (colGutterSkip) return null;
              return (
                <td key={c} colSpan={colGutterSpan}
                  style={isColAnchor
                    ? { padding: 0, border: 0, position: 'relative' }
                    : { padding: 0, border: 0, position: 'relative' }}>
                  {isColAnchor ? (
                    <button
                      onMouseDown={e => e.preventDefault()}
                      onClick={e => setCtxMenu({ type: 'col', c1: sel.c1, c2: sel.c2, rect: e.currentTarget.getBoundingClientRect() })}
                      style={{ position: 'absolute', inset: 0 }}
                      className="flex items-center justify-center bg-[#0056a4] rounded-t-[3px] cursor-pointer hover:bg-[#004a8f]"
                      title="열 옵션"
                    >
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M2 1.5h6M2 3h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  ) : (
                    <SepDot
                      align="col"
                      hovered={hovSepCol === c}
                      onClick={() => onAddCol?.(block.id, c)}
                      onEnter={() => setHovSepCol(c)}
                      onLeave={() => setHovSepCol(null)}
                    />
                  )}
                </td>
              );
            })}
          </tr>

          {/* 실제 행들 */}
          {Array.from({ length: rows }, (_, r) => {
            const isFullRowRange = sel && sel.c1 === 0 && sel.c2 === cols - 1;
            const isRowAnchor    = isFullRowRange && r === sel.r1;
            const gutterSkip     = isFullRowRange && r > sel.r1 && r <= sel.r2;
            const gutterSpan     = isRowAnchor ? sel.r2 - sel.r1 + 1 : 1;
            return (
            <tr key={r}>
              {/* 좌측 거터: 행 삽입 포인트 + 행 선택 밴드 */}
              {!gutterSkip && (
                <td
                  rowSpan={gutterSpan}
                  style={isRowAnchor
                    ? { padding: 0, border: 0, position: 'relative', width: 16 }
                    : { padding: 0, border: 0, position: 'relative' }}
                >
                  {isRowAnchor ? (
                    <button
                      onMouseDown={e => e.preventDefault()}
                      onClick={e => setCtxMenu({ type: 'row', r1: sel.r1, r2: sel.r2, rect: e.currentTarget.getBoundingClientRect() })}
                      style={{ position: 'absolute', inset: 0 }}
                      className="flex items-center justify-center bg-[#0056a4] rounded-l-[3px] cursor-pointer hover:bg-[#004a8f]"
                      title="행 옵션"
                    >
                      <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                        <path d="M1.5 2v6M3 2v6" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  ) : (
                    <SepDot
                      hovered={hovSepRow === r}
                      onClick={() => onAddRow?.(block.id, r)}
                      onEnter={() => setHovSepRow(r)}
                      onLeave={() => setHovSepRow(null)}
                    />
                  )}
                </td>
              )}

              {/* 실제 셀들 */}
              {Array.from({ length: cols }, (_, c) => {
                const key      = `${r},${c}`;
                const isHeader = (headerRow && r === 0) || (headerCol && c === 0);
                const selected = isSelected(r, c);
                const bg       = cellBg[key] || (isHeader ? '#f5f5f5' : '#ffffff');
                const selBg    = selected ? (isHeader ? '#cfddf5' : '#dce8ff') : bg;

                return (
                  <td
                    key={c}
                    className="relative border border-[#d9dfe5]"
                    style={{ background: selBg }}
                    onMouseDown={e => { handleCellMouseDown(e, r, c); }}
                    onMouseEnter={() => handleCellMouseEnter(r, c)}
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
                      className={`outline-none text-[13px] min-h-[20px] px-2 py-1 ${isHeader ? 'font-semibold' : ''}`}
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

                    {/* 열 너비 조절 핸들 (첫 행만) */}
                    {r === 0 && (
                      <div
                        onMouseDown={e => {
                          e.preventDefault(); e.stopPropagation();
                          setDraggingCol({ col: c, startX: e.clientX, startWidth: colWidths[c] ?? 100 });
                        }}
                        className="absolute top-0 right-0 w-[4px] h-full cursor-col-resize z-10 group"
                      >
                        <div className={`w-full h-full transition-colors
                          ${draggingCol?.col === c ? 'bg-[#0056a4]' : 'group-hover:bg-[#0056a4]/40'}`} />
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
