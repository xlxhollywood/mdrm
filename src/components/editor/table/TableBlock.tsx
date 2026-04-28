'use client';

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

/* ── 행/열 컨텍스트 메뉴 ── */
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

      {/* 채우기 */}
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
      {type !== 'cell' && <div className="h-px bg-white/15 my-1.5" />}
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

      {/* 채우기 */}
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
export default function TableBlock({
  block, onUpdateBlock, onCellFocus, onFocusBlock,
  onAddRow, onAddCol,
  onDeleteRow, onDeleteCol,
  onMoveRow, onMoveCol,
  forceSync = 0,
  readOnly = false,
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
  const [colBoundaryXs, setColBoundaryXs] = useState([]);
  const [rowBoundaryYs, setRowBoundaryYs] = useState([]);
  const [hovRowHandle,  setHovRowHandle]  = useState(null);
  const [hovColHandle, setHovColHandle]   = useState(null);
  const [draggingCol, setDraggingCol] = useState(null);
  const [draggingRow, setDraggingRow] = useState(null);
  const [hovGutterCol, setHovGutterCol] = useState(null);
  const [hovGutterRow, setHovGutterRow] = useState(null);
  const [sel,         setSel]         = useState(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const [dragOrigin,  setDragOrigin]  = useState(null);
  const [ctxMenu,     setCtxMenu]     = useState(null);
  const dragStartPosRef = useRef(null);
  const [cellFocused_, setCellFocused] = useState(false);
  const cellFocused = readOnly ? false : cellFocused_;

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

  /* 열 너비 드래그 */
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

  /* 행 높이 드래그 */
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

  /* 구조 변경 후 DOM 콘텐츠 동기화 */
  useEffect(() => {
    Object.entries(cellRefs.current).forEach(([key, el]) => {
      if (!el) return;
      const expected = cells[key] ?? '';
      if (el.innerHTML !== expected) el.innerHTML = expected;
    });
  }, [rows, cols, forceSync]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 셀 포커스 추적 */
  useEffect(() => {
    const wrap = tableWrapRef.current;
    if (!wrap) return;
    const onIn  = () => setCellFocused(true);
    const onOut = (e) => { if (!wrap.contains(e.relatedTarget)) setCellFocused(false); };
    wrap.addEventListener('focusin',  onIn);
    wrap.addEventListener('focusout', onOut);
    return () => { wrap.removeEventListener('focusin', onIn); wrap.removeEventListener('focusout', onOut); };
  }, []);

  /* 셀 복사/붙여넣기 — 엑셀 호환 */
  useEffect(() => {
    const wrap = tableWrapRef.current;
    if (!wrap) return;

    const stripHtml = (html) => {
      const d = document.createElement('div');
      d.innerHTML = html || '';
      return d.textContent || '';
    };

    const onCopy = (e) => {
      if (!sel || !wrap.contains(document.activeElement)) return;
      if (sel.r1 === sel.r2 && sel.c1 === sel.c2) return;
      e.preventDefault();
      const lines = [];
      for (let r = sel.r1; r <= sel.r2; r++) {
        const row = [];
        for (let c = sel.c1; c <= sel.c2; c++) {
          row.push(stripHtml(cells[`${r},${c}`] || ''));
        }
        lines.push(row.join('\t'));
      }
      e.clipboardData.setData('text/plain', lines.join('\n'));
      const htmlRows = [];
      for (let r = sel.r1; r <= sel.r2; r++) {
        const htmlCells = [];
        for (let c = sel.c1; c <= sel.c2; c++) {
          htmlCells.push(`<td>${cells[`${r},${c}`] || ''}</td>`);
        }
        htmlRows.push(`<tr>${htmlCells.join('')}</tr>`);
      }
      e.clipboardData.setData('text/html', `<table>${htmlRows.join('')}</table>`);
    };

    const onPaste = (e) => {
      if (!sel || !wrap.contains(document.activeElement)) return;
      const text = e.clipboardData.getData('text/plain');
      if (!text) return;
      if (!text.includes('\t') && !text.includes('\n')) return;
      e.preventDefault();
      e.stopPropagation();
      const pasteRows = text.split('\n').filter(l => l.length > 0).map(l => l.split('\t'));
      const newCells = { ...cells };
      for (let r = 0; r < pasteRows.length; r++) {
        for (let c = 0; c < pasteRows[r].length; c++) {
          const tr = sel.r1 + r;
          const tc = sel.c1 + c;
          if (tr < rows && tc < cols) {
            const key = `${tr},${tc}`;
            newCells[key] = pasteRows[r][c];
            const el = cellRefs.current[key];
            if (el) { el.innerHTML = pasteRows[r][c]; }
          }
        }
      }
      onUpdateBlock(block.id, { cells: newCells });
    };

    document.addEventListener('copy', onCopy, true);
    document.addEventListener('paste', onPaste, true);
    return () => { document.removeEventListener('copy', onCopy, true); document.removeEventListener('paste', onPaste, true); };
  }, [sel, cells, rows, cols, block.id, onUpdateBlock]);

  /* 열/행 경계 좌표 측정 */
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

  /* 병합 헬퍼 */
  const getMergeAt = (r, c) => merges.find(m => r >= m.r1 && r <= m.r2 && c >= m.c1 && c <= m.c2);
  const isMergedHidden = (r, c) => { const m = getMergeAt(r, c); return m && (m.r1 !== r || m.c1 !== c); };

  /* 셀 병합 */
  const handleMergeCells = () => {
    if (!sel) return;
    const { r1, r2, c1, c2 } = sel;
    if (r1 === r2 && c1 === c2) return;
    const filtered = merges.filter(m => m.r2 < r1 || m.r1 > r2 || m.c2 < c1 || m.c1 > c2);
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
    Object.keys(cellRefs.current).forEach(k => {
      const el = cellRefs.current[k];
      if (el) { el.dataset.init = ''; }
    });
    onUpdateBlock(block.id, { cells: newCells, merges: [...filtered, { r1, c1, r2, c2 }] });
  };

  /* 셀 나누기 */
  const handleSplitCell = () => {
    if (!sel) return;
    const filtered = merges.filter(m =>
      m.r2 < sel.r1 || m.r1 > sel.r2 || m.c2 < sel.c1 || m.c1 > sel.c2
    );
    Object.keys(cellRefs.current).forEach(k => {
      const el = cellRefs.current[k];
      if (el) { el.dataset.init = ''; }
    });
    onUpdateBlock(block.id, { merges: filtered });
  };

  const selHasMerge = sel && merges.some(m =>
    !(m.r2 < sel.r1 || m.r1 > sel.r2 || m.c2 < sel.c1 || m.c1 > sel.c2)
  );
  const selIsMulti = sel && (sel.r1 !== sel.r2 || sel.c1 !== sel.c2);

  /* 셀 마우스다운 */
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

  /* 셀 마우스엔터 */
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
      {/* 열 너비 조절 오버레이 */}
      {!readOnly && colBoundaryXs.map((x, i) => (
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
      {/* 행 높이 조절 오버레이 — 병합 구간은 제외하고 열별로 분리 */}
      {!readOnly && rowBoundaryYs.map((y, i) => {
        // 각 열이 이 행 경계(i와 i+1 사이)를 가로지르는 병합에 속하는지 체크
        const blocked = Array.from({ length: cols }, (_, c) =>
          merges.some(m => c >= m.c1 && c <= m.c2 && m.r1 <= i && m.r2 >= i + 1)
        );
        // 연속된 비병합 열을 세그먼트로 그룹핑
        const segments = [];
        let start = null;
        for (let c = 0; c <= cols; c++) {
          if (c < cols && !blocked[c]) {
            if (start === null) start = c;
          } else {
            if (start !== null) {
              const left = start === 0 ? 0 : (colBoundaryXs[start - 1] || 0);
              const right = (c - 1) < colBoundaryXs.length ? colBoundaryXs[c - 1] : (tableRef.current?.offsetWidth || 0);
              segments.push({ left, width: right - left });
              start = null;
            }
          }
        }
        return segments.map((seg, si) => (
          <div
            key={`row-${i}-${si}`}
            onMouseDown={e => startRowResize(e, i)}
            onMouseEnter={() => setHovRowHandle(i)}
            onMouseLeave={() => setHovRowHandle(null)}
            style={{
              position: 'absolute',
              left: seg.left, width: seg.width,
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
        ));
      })}
      {/* 열 드래그핸들 오버레이 */}
      {cellFocused && (() => {
        const tableTop = tableRef.current ? tableRef.current.getBoundingClientRect().top - tableWrapRef.current.getBoundingClientRect().top : 0;
        return Array.from({ length: cols }, (_, c) => {
          const left = c === 0 ? 0 : colBoundaryXs[c - 1] || 0;
          const right = c < colBoundaryXs.length ? colBoundaryXs[c] : (tableRef.current?.offsetWidth || 0);
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
      {/* 행 드래그핸들 오버레이 */}
      {cellFocused && (() => {
        const wrapRect = tableWrapRef.current?.getBoundingClientRect();
        const tblRect = tableRef.current?.getBoundingClientRect();
        const tableTop = (wrapRect && tblRect) ? tblRect.top - wrapRect.top : 0;
        const tableBottom = (wrapRect && tblRect) ? tblRect.bottom - wrapRect.top : 0;
        return Array.from({ length: rows }, (_, r) => {
          const top = r === 0 ? tableTop : (rowBoundaryYs[r - 1] || tableTop);
          const bottom = r < rowBoundaryYs.length ? rowBoundaryYs[r] : tableBottom;
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
        className="border-collapse w-full rounded-[6px] overflow-hidden"
        style={{ tableLayout: 'fixed', userSelect: (isDragging && sel && (sel.r1 !== sel.r2 || sel.c1 !== sel.c2)) ? 'none' : undefined, boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)' }}
      >
        <colgroup>
          {Array.from({ length: cols }, (_, c) => <col key={c} style={{ width: `${colWidths[c] ?? (100 / cols)}%` }} />)}
        </colgroup>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r} style={rowHeights[r] ? { height: rowHeights[r] } : undefined}>
              {Array.from({ length: cols }, (_, c) => {
                if (isMergedHidden(r, c)) return null;

                const merge    = getMergeAt(r, c);
                const rSpan    = merge ? merge.r2 - merge.r1 + 1 : 1;
                const cSpan    = merge ? merge.c2 - merge.c1 + 1 : 1;
                const key      = `${r},${c}`;
                const isHeader = (headerRow && r === 0) || (headerCol && c === 0);
                const selected = isSelected(r, c);
                const bg       = cellBg[key] || (isHeader ? '#f8fafc' : '#ffffff');
                const selBg    = selected ? (isHeader ? '#dbeafe' : '#eff6ff') : bg;

                return (
                  <td
                    key={c}
                    rowSpan={rSpan > 1 ? rSpan : undefined}
                    colSpan={cSpan > 1 ? cSpan : undefined}
                    className="relative border border-[#e2e8f0]"
                    style={{ background: selBg, borderBottom: isHeader && headerRow && r === 0 ? '1.5px solid #cbd5e1' : undefined }}
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
                      contentEditable={!readOnly}
                      suppressContentEditableWarning
                      data-cell-id={`${block.id}-${r}-${c}`}
                      className={`outline-none text-[12px] leading-[1.5] min-h-[34px] px-[10px] py-[8px] ${isHeader ? 'font-semibold text-[#475569]' : 'text-[#1e293b]'} ${readOnly ? 'cursor-pointer select-none' : ''}`}
                      onFocus={() => { if (!readOnly) { onCellFocus?.(block.id, r, c); onFocusBlock?.(); } }}
                      onPaste={e => {
                        // 테이블 셀 복사/붙여넣기(다중 셀)는 상위 핸들러에서 처리
                        if (sel && (sel.r1 !== sel.r2 || sel.c1 !== sel.c2)) return;
                        const html = e.clipboardData.getData('text/html');
                        if (html) {
                          e.preventDefault();
                          const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '');
                          document.execCommand('insertHTML', false, clean);
                        }
                      }}
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
                        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                          e.preventDefault();
                          window.getSelection()?.removeAllRanges();
                          setSel({ r1: 0, r2: rows - 1, c1: 0, c2: cols - 1 });
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
          ))}
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
