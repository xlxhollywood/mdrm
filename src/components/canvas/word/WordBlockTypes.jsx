'use client';

import { useRef, useState, useEffect } from 'react';
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

/* ── 행/열 구분선 삽입 포인트 ── */
function SepDot({ hovered, onClick, onEnter, onLeave }) {
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} className="flex items-center justify-center">
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={e => { e.stopPropagation(); onClick(); }}
        className={`rounded-full transition-all duration-100 select-none flex items-center justify-center
          ${hovered
            ? 'w-[8px] h-[8px] bg-[#0056a4] text-transparent shadow-sm hover:bg-[#004a8f]'
            : 'w-[3px] h-[3px] bg-[#c8cdd3] cursor-default text-transparent'}`}
      />
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
  const { rows = 3, cols = 3, cells = {}, cellBg = {} } = block;
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
    <div ref={tableWrapRef} className="py-1 overflow-x-auto" style={{ cursor: draggingCol ? 'col-resize' : undefined }}>
      {ctxMenu && (
        <TableCtxMenu
          type={ctxMenu.type}
          anchorRect={ctxMenu.rect}
          onClose={() => setCtxMenu(null)}
          canMoveUp={ctxMenu.type === 'row' ? ctxMenu.idx > 0 : ctxMenu.idx > 0}
          canMoveDown={ctxMenu.type === 'row' ? ctxMenu.idx < rows - 1 : ctxMenu.idx < cols - 1}
          onMoveUp={()    => ctxMenu.type === 'row' ? onMoveRow?.(block.id, ctxMenu.idx, 'up')   : onMoveCol?.(block.id, ctxMenu.idx, 'left')}
          onMoveDown={()  => ctxMenu.type === 'row' ? onMoveRow?.(block.id, ctxMenu.idx, 'down') : onMoveCol?.(block.id, ctxMenu.idx, 'right')}
          onDelete={()    => ctxMenu.type === 'row' ? onDeleteRow?.(block.id, ctxMenu.idx) : onDeleteCol?.(block.id, ctxMenu.idx)}
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
          <tr key="top-gutter" style={{ height: 16 }}>
            <td style={{ padding: 0, border: 0 }} />
            {Array.from({ length: cols }, (_, c) => {
              const fullCol = isFullColSel(c);
              return (
                <td key={c} style={{ padding: '0 2px 0 0', border: 0, position: 'relative' }}>
                  {fullCol ? (
                    <button
                      onMouseDown={e => e.preventDefault()}
                      onClick={e => setCtxMenu({ type: 'col', idx: c, rect: e.currentTarget.getBoundingClientRect() })}
                      className="w-full h-full flex items-center justify-center bg-[#0056a4] rounded-t-[3px] cursor-pointer hover:bg-[#004a8f]"
                      title="열 옵션"
                    >
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M2 1.5h6M2 3h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  ) : (
                    <div className="h-full flex items-center justify-end">
                      <SepDot
                        hovered={hovSepCol === c}
                        onClick={() => onAddCol?.(block.id, c)}
                        onEnter={() => setHovSepCol(c)}
                        onLeave={() => setHovSepCol(null)}
                      />
                    </div>
                  )}
                </td>
              );
            })}
          </tr>

          {/* 실제 행들 */}
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {/* 좌측 거터: 행 삽입 포인트 + 행 선택 밴드 */}
              <td style={{ padding: '0 0 2px 0', border: 0, verticalAlign: 'bottom', position: 'relative' }}>
                {isFullRowSel(r) ? (
                  <button
                    onMouseDown={e => e.preventDefault()}
                    onClick={e => setCtxMenu({ type: 'row', idx: r, rect: e.currentTarget.getBoundingClientRect() })}
                    className="w-full h-full flex items-center justify-center bg-[#0056a4] rounded-l-[3px] cursor-pointer hover:bg-[#004a8f]"
                    style={{ minHeight: 24 }}
                    title="행 옵션"
                  >
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                      <path d="M1.5 2v6M3 2v6" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <SepDot
                      hovered={hovSepRow === r}
                      onClick={() => onAddRow?.(block.id, r)}
                      onEnter={() => setHovSepRow(r)}
                      onLeave={() => setHovSepRow(null)}
                    />
                  </div>
                )}
              </td>

              {/* 실제 셀들 */}
              {Array.from({ length: cols }, (_, c) => {
                const key      = `${r},${c}`;
                const isHeader = r === 0;
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

                    {/* 열 너비 조절 핸들 (헤더 행만) */}
                    {isHeader && (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
