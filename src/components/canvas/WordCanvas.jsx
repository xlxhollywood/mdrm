'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PAPER_SIZES, MM_TO_PX } from './word/wordConstants';
import FloatingToolbar   from './word/FloatingToolbar';
import TextBlock         from './word/TextBlock';
import TodoListBlock     from './word/TodoListBlock';
import BlockPlusMenu     from './word/BlockPlusMenu';
import SlashMenu         from './word/SlashMenu';
import TableSizePicker      from './word/TableSizePicker';
import LayoutColumnPicker   from './word/LayoutColumnPicker';
import { DragHandleIcon, WidgetBlock, TableBlock, LayoutBlock } from './word/WordBlockTypes';
import useDragBlocks     from './word/useDragBlocks';

export default function WordCanvas({
  docBlocks, config, selectedWidget, docConfig, findWidgetDef,
  onCardClick, onDeleteBlock, onUpdateText, onDeselectWidget, onReorderBlocks, onInsertText, onDeleteBlocksInRange,
  onInsertBlock, onUpdateBlock, onCellFocus, onUndo, onDropColToMain, onMoveColBlock,
}) {
  const paper = PAPER_SIZES[docConfig.paperSize] || PAPER_SIZES.A4;
  const isLand = docConfig.orientation === 'landscape';
  const docW = isLand ? paper.h : paper.w;
  const docH = isLand ? paper.w : paper.h;
  const m   = docConfig.margins;
  const pad = `${Math.round(m.top * MM_TO_PX)}px ${Math.round(m.right * MM_TO_PX)}px ${Math.round(m.bottom * MM_TO_PX)}px ${Math.round(m.left * MM_TO_PX)}px`;

  const pendingFocusRef = useRef(null);
  const didInitFocus    = useRef(false);
  const paperRef        = useRef(null);
  const blockRefs       = useRef([]);

  const [hoveredBlockId,   setHoveredBlockId]   = useState(null);
  const [activeBlockId,    setActiveBlockId]    = useState(null);
  const [allSelected,      setAllSelected]      = useState(false);
  const [selectedBlockIds, setSelectedBlockIds] = useState(new Set());
  const [dragSelRect,      setDragSelRect]      = useState(null); // { x1,y1,x2,y2 } in viewport coords
  const [plusMenu,         setPlusMenu]         = useState(null);
  const [slashMenu,        setSlashMenu]        = useState(null);
  const [tableSizePicker,  setTableSizePicker]  = useState(null);
  const [layoutPicker,     setLayoutPicker]     = useState(null);
  const [tableSync,        setTableSync]        = useState(0);
  const slashMenuRef      = useRef(null);
  const prevTableCellsRef = useRef({});
  const pendingResetFocus = useRef(false);
  const dragSelStartRef   = useRef(null); // { startX, startY }

  const layoutColRefsMap  = useRef({});
  const colBlockRefsMap   = useRef({});

  const registerColRef = useCallback((key, el) => {
    if (el) layoutColRefsMap.current[key] = el;
    else delete layoutColRefsMap.current[key];
  }, []);

  const registerColBlockRef = useCallback((blockId, el) => {
    if (el) colBlockRefsMap.current[blockId] = el;
    else delete colBlockRefsMap.current[blockId];
  }, []);

  const handleDropToColumn = useCallback((fromIdx, layoutBlockId, colIdx) => {
    const block = docBlocks[fromIdx];
    if (!block || block.type === 'layout') return;
    onUpdateBlock(block.id, { layoutRef: { layoutId: layoutBlockId, colIdx } });
    if (block.type === 'widget') {
      // 빈 텍스트 블록 제거 후 위젯 뒤에 새 텍스트 블록 삽입
      const emptyInCol = docBlocks.filter(b =>
        b.id !== block.id &&
        b.layoutRef?.layoutId === layoutBlockId &&
        b.layoutRef?.colIdx === colIdx &&
        b.type === 'text' &&
        !(b.html || '').replace(/<br\s*\/?>/gi, '').trim()
      );
      emptyInCol.forEach(b => onDeleteBlock(b.id));
      const newTextId = `text-${Date.now()}`;
      onInsertBlock(fromIdx, { id: newTextId, type: 'text', html: '', layoutRef: { layoutId: layoutBlockId, colIdx } });
      pendingFocusRef.current = { id: newTextId, position: 'start' };
    }
  }, [docBlocks, onUpdateBlock, onDeleteBlock, onInsertBlock]);

  // ── 열 내부 블록 조작 핸들러 ──
  const handleColumnEnter = useCallback((blockId) => {
    const idx = docBlocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;
    const block = docBlocks[idx];
    const newId = `text-${Date.now()}`;
    pendingFocusRef.current = { id: newId, position: 'start' };
    onInsertBlock(idx, { id: newId, type: 'text', html: '', layoutRef: block.layoutRef });
  }, [docBlocks, onInsertBlock]);

  const handleColumnBackspace = useCallback((blockId, currentHtml) => {
    const idx = docBlocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;
    const block = docBlocks[idx];
    const isListSubtype = block?.subtype === 'bullet' || block?.subtype === 'numbered' || block?.subtype === 'todo';
    const hasContent = !!(currentHtml || '').replace(/<br\s*\/?>/gi, '').trim();

    if (isListSubtype && hasContent) {
      onUpdateBlock(blockId, { subtype: undefined, checked: undefined, html: currentHtml, items: undefined });
      pendingFocusRef.current = { id: blockId, position: 'start' };
      return;
    }
    if (block?.subtype && !hasContent) {
      onUpdateBlock(blockId, { subtype: undefined, checked: undefined, html: '', items: undefined });
      pendingFocusRef.current = { id: blockId, position: 'start' };
      return;
    }

    const { layoutRef } = block;
    if (!layoutRef) return;
    const sameCol = docBlocks.filter(b =>
      b.layoutRef?.layoutId === layoutRef.layoutId && b.layoutRef?.colIdx === layoutRef.colIdx
    );
    const colPos = sameCol.findIndex(b => b.id === blockId);
    if (colPos <= 0) return; // 첫 번째 블록 — 열 밖으로 나가지 않음

    let prevPos = colPos - 1;
    while (prevPos >= 0 && sameCol[prevPos].type !== 'text') prevPos--;
    if (prevPos < 0) return;
    const prevBlock = sameCol[prevPos];

    if (!hasContent) {
      pendingFocusRef.current = { id: prevBlock.id, position: 'end' };
      onDeleteBlock(blockId);
    } else {
      const prevHtml = prevBlock.html || '';
      const tmp = document.createElement('div');
      tmp.innerHTML = prevHtml;
      const prevTextLen = tmp.textContent.length;
      onUpdateText(prevBlock.id, prevHtml + currentHtml);
      onDeleteBlock(blockId);
      pendingFocusRef.current = { id: prevBlock.id, position: 'offset', charOffset: prevTextLen };
    }
  }, [docBlocks, onDeleteBlock, onUpdateText, onUpdateBlock]);

  const handleColumnArrow = useCallback((blockId, direction, caretX = 0) => {
    const block = docBlocks.find(b => b.id === blockId);
    if (!block?.layoutRef) return;
    const { layoutId, colIdx } = block.layoutRef;
    const colTextBlocks = docBlocks.filter(b =>
      b.layoutRef?.layoutId === layoutId && b.layoutRef?.colIdx === colIdx && b.type === 'text'
    );
    const ci = colTextBlocks.findIndex(b => b.id === blockId);
    const step = (direction === 'up' || direction === 'left') ? -1 : 1;
    const ti = ci + step;
    if (ti < 0 || ti >= colTextBlocks.length) return;
    const targetEl = document.querySelector(`[data-text-id="${colTextBlocks[ti].id}"]`);
    if (!targetEl) return;
    targetEl.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (step === -1) {
      const r = document.createRange(); r.selectNodeContents(targetEl); r.collapse(false); sel.addRange(r);
    } else {
      const r = document.createRange(); r.setStart(targetEl, 0); r.collapse(true); sel.addRange(r);
    }
  }, [docBlocks]);

  const handleCreateColumnBlock = useCallback((layoutBlockId, colIdx) => {
    const layoutIdx = docBlocks.findIndex(b => b.id === layoutBlockId);
    if (layoutIdx === -1) return;
    const newId = `text-${Date.now()}`;
    onInsertBlock(layoutIdx, { id: newId, type: 'text', html: '', layoutRef: { layoutId: layoutBlockId, colIdx } });
    pendingFocusRef.current = { id: newId, position: 'start' };
  }, [docBlocks, onInsertBlock]);

  const { draggingIdx, draggingColBlockId, dropIdx, hoveredColKey, colDropInfo, handleDragHandleMouseDown, handleColDragHandleMouseDown } = useDragBlocks({
    docBlocks,
    blockRefs,
    onReorderBlocks,
    layoutColRefs:   layoutColRefsMap,
    onDropToColumn:  handleDropToColumn,
    colBlockRefs:    colBlockRefsMap,
    onDropColToMain,
    onMoveColBlock,
  });

  // 외부에서 cells가 교체된 경우 DOM 강제 동기화
  useEffect(() => {
    let needSync = false;
    docBlocks.forEach(b => {
      if (b.type !== 'table') return;
      if (prevTableCellsRef.current[b.id] !== b.cells) needSync = true;
      prevTableCellsRef.current[b.id] = b.cells;
    });
    if (needSync) setTableSync(s => s + 1);
  }, [docBlocks]);

  // activeBlockId 설정 시 paper div로 포커스 이동 (contenteditable 바깥인 경우)
  // 드래그 핸들의 e.preventDefault()로 인해 자연 포커스가 이동하지 않으므로 강제 설정
  useEffect(() => {
    if (activeBlockId && !document.activeElement?.isContentEditable && paperRef.current) {
      paperRef.current.focus({ preventScroll: true });
    }
  }, [activeBlockId]);

  // 최초 마운트 시 첫 텍스트 블록 포커스
  useEffect(() => {
    if (didInitFocus.current) return;
    const first = docBlocks.find(b => b.type === 'text');
    if (!first) return;
    const el = document.querySelector(`[data-text-id="${first.id}"]`);
    if (el) { el.focus(); didInitFocus.current = true; }
  });

  // hover 감지 (핸들 영역 72px 포함)
  useEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    const onMove = (e) => {
      let found = null;
      for (let i = 0; i < blockRefs.current.length; i++) {
        const el = blockRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom &&
            e.clientX >= rect.left - 72 && e.clientX <= rect.right) {
          found = docBlocks[i]?.id ?? null;
          break;
        }
      }
      setHoveredBlockId(found);
    };
    const onLeave = () => setHoveredBlockId(null);
    paper.addEventListener('mousemove', onMove);
    paper.addEventListener('mouseleave', onLeave);
    return () => { paper.removeEventListener('mousemove', onMove); paper.removeEventListener('mouseleave', onLeave); };
  }, [docBlocks]);

  // 드래그 멀티 블록 선택
  useEffect(() => {
    const onMove = (e) => {
      if (!dragSelStartRef.current) return;
      const { startX, startY } = dragSelStartRef.current;
      const x1 = Math.min(startX, e.clientX);
      const y1 = Math.min(startY, e.clientY);
      const x2 = Math.max(startX, e.clientX);
      const y2 = Math.max(startY, e.clientY);
      if (x2 - x1 < 4 && y2 - y1 < 4) return;
      setDragSelRect({ x1, y1, x2, y2 });
      const ids = new Set();
      blockRefs.current.forEach((el, i) => {
        if (!el || el.style.display === 'none') return;
        const r = el.getBoundingClientRect();
        if (r.right > x1 && r.left < x2 && r.bottom > y1 && r.top < y2) {
          const block = docBlocks[i];
          if (block && !block.layoutRef) ids.add(block.id);
        }
      });
      setSelectedBlockIds(ids);
    };
    const onUp = () => {
      if (!dragSelStartRef.current) return;
      dragSelStartRef.current = null;
      setDragSelRect(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [docBlocks]);

  // pendingFocus 처리
  useEffect(() => {
    if (!pendingFocusRef.current) return;
    const pending = pendingFocusRef.current;
    const id = typeof pending === 'string' ? pending : pending.id;
    const position = typeof pending === 'string' ? 'start' : pending.position;
    const el = document.querySelector(`[data-text-id="${id}"]`);
    if (!el) return;
    pendingFocusRef.current = null;
    el.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    const isListEl = el.tagName === 'UL' || el.tagName === 'OL';
    const targetEl = isListEl
      ? (position === 'end' ? el.querySelector('li:last-child') : el.querySelector('li')) ?? el
      : el;
    if (position === 'start') {
      const r = document.createRange(); r.setStart(targetEl, 0); r.collapse(true); sel.addRange(r);
    } else if (position === 'end') {
      const r = document.createRange(); r.selectNodeContents(targetEl); r.collapse(false); sel.addRange(r);
    } else if (position === 'offset') {
      let remaining = pending.charOffset;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let placed = false;
      let node;
      while ((node = walker.nextNode())) {
        if (remaining <= node.length) {
          const r = document.createRange(); r.setStart(node, remaining); r.collapse(true); sel.addRange(r);
          placed = true; break;
        }
        remaining -= node.length;
      }
      if (!placed) {
        const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); sel.addRange(r);
      }
    }
  });

  // Ctrl+A 삭제 후 포커스 복귀
  useEffect(() => {
    if (!pendingResetFocus.current) return;
    if (docBlocks.length === 1 && docBlocks[0].type === 'text') {
      const el = document.querySelector(`[data-text-id="${docBlocks[0].id}"]`);
      if (el) { el.focus(); pendingResetFocus.current = false; }
    }
  });

  const handleArrow = useCallback((blockId, direction, caretX = 0) => {
    let ti;
    if (direction === 'first') {
      ti = docBlocks.findIndex(b => b.type === 'text');
    } else if (direction === 'last') {
      ti = docBlocks.length - 1;
      while (ti >= 0 && docBlocks[ti].type !== 'text') ti--;
    } else {
      const idx = docBlocks.findIndex(b => b.id === blockId);
      const step = (direction === 'up' || direction === 'left') ? -1 : 1;
      ti = idx + step;
      while (ti >= 0 && ti < docBlocks.length && docBlocks[ti].type !== 'text') ti += step;
    }
    if (ti < 0 || ti >= docBlocks.length) return;
    const targetEl = document.querySelector(`[data-text-id="${docBlocks[ti].id}"]`);
    if (!targetEl) return;
    targetEl.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (direction === 'left' || direction === 'last') {
      const r = document.createRange(); r.selectNodeContents(targetEl); r.collapse(false); sel.addRange(r);
    } else if (direction === 'right' || direction === 'first') {
      const r = document.createRange(); r.setStart(targetEl, 0); r.collapse(true); sel.addRange(r);
    } else {
      const targetRect = targetEl.getBoundingClientRect();
      const goToEnd = direction === 'up';
      const y = goToEnd ? targetRect.bottom - 4 : targetRect.top + 4;
      const range = document.caretRangeFromPoint?.(caretX, y);
      if (range && targetEl.contains(range.startContainer)) {
        sel.addRange(range);
      } else {
        const r = document.createRange();
        if (goToEnd) { r.selectNodeContents(targetEl); r.collapse(false); }
        else { r.setStart(targetEl, 0); r.collapse(true); }
        sel.addRange(r);
      }
    }
  }, [docBlocks]);

  const handleEnterBlock = useCallback((blockId) => {
    const idx = docBlocks.findIndex(b => b.id === blockId);
    const newId = `text-${Date.now()}`;
    pendingFocusRef.current = { id: newId, position: 'start' };
    onInsertText(idx, newId);
  }, [docBlocks, onInsertText]);

  const handleBackspaceAtStart = useCallback((blockId, currentHtml) => {
    const idx = docBlocks.findIndex(b => b.id === blockId);
    const block = docBlocks[idx];

    const isListSubtype = block?.subtype === 'bullet' || block?.subtype === 'numbered' || block?.subtype === 'todo';
    const hasContent = !!(currentHtml || '').replace(/<br\s*\/?>/gi, '').trim();

    if (isListSubtype && hasContent) {
      onUpdateBlock(blockId, { subtype: undefined, checked: undefined, html: currentHtml, items: undefined });
      pendingFocusRef.current = { id: blockId, position: 'start' };
      return;
    }
    if (block?.subtype && !hasContent) {
      onUpdateBlock(blockId, { subtype: undefined, checked: undefined, html: '', items: undefined });
      pendingFocusRef.current = { id: blockId, position: 'start' };
      return;
    }

    if (idx <= 0) return;
    let ti = idx - 1;
    while (ti >= 0 && docBlocks[ti].type !== 'text') ti--;
    if (ti < 0) return;

    const prevBlock = docBlocks[ti];
    const isEmpty = !currentHtml.replace(/<br\s*\/?>/gi, '').trim();

    if (isEmpty) {
      pendingFocusRef.current = { id: prevBlock.id, position: 'end' };
      onDeleteBlock(blockId);
    } else {
      const prevHtml = prevBlock.html || '';
      const tmp = document.createElement('div');
      tmp.innerHTML = prevHtml;
      const prevTextLen = tmp.textContent.length;
      onUpdateText(prevBlock.id, prevHtml + currentHtml);
      onDeleteBlock(blockId);
      pendingFocusRef.current = { id: prevBlock.id, position: 'offset', charOffset: prevTextLen };
    }
  }, [docBlocks, onDeleteBlock, onUpdateText, onUpdateBlock]);

  const handleInsertBlockFromMenu = useCallback((afterIdx, type, subtype) => {
    const currentBlock = docBlocks[afterIdx];

    // 현재 블록을 변환하는 타입들
    if (type === 'textSize') {
      if (currentBlock) onUpdateBlock(currentBlock.id, { subtype: subtype || undefined });
      return;
    }
    if (type === 'todo') {
      if (currentBlock) {
        onUpdateBlock(currentBlock.id, { subtype: 'todo', html: undefined, items: [{ id: `ti-${Date.now()}`, html: '', checked: false }] });
        pendingFocusRef.current = { id: currentBlock.id, position: 'start' };
      }
      return;
    }
    if (type === 'bullet' || type === 'numbered') {
      if (currentBlock) {
        onUpdateBlock(currentBlock.id, { subtype: type, html: '<li></li>', items: undefined });
        pendingFocusRef.current = { id: currentBlock.id, position: 'start' };
      }
      return;
    }
    if (type === 'callout' || type === 'quote') {
      if (currentBlock) {
        onUpdateBlock(currentBlock.id, { subtype: type, items: undefined });
        pendingFocusRef.current = { id: currentBlock.id, position: 'start' };
      }
      return;
    }

    // 새 블록을 삽입하는 타입 (table 등)
    if (type === 'divider') {
      if (currentBlock) {
        onUpdateBlock(currentBlock.id, { type: 'divider', subtype: undefined, html: undefined, items: undefined });
        const newId = `text-${Date.now()}`;
        pendingFocusRef.current = { id: newId, position: 'start' };
        onInsertText(afterIdx, newId);
      }
      return;
    }
    // table은 BlockPlusMenu의 onTablePick 경로로 처리됨
  }, [docBlocks, onInsertBlock, onInsertText, onUpdateBlock]);

  const handleConvertToSubtype = useCallback((blockId, subtype) => {
    const isListType = subtype === 'bullet' || subtype === 'numbered';
    onUpdateBlock(blockId, { subtype, html: isListType ? '<li></li>' : '' });
    pendingFocusRef.current = { id: blockId, position: 'start' };
  }, [onUpdateBlock]);

  const handleTablePick = useCallback((blockIdx, anchorRect) => {
    const block = docBlocks[blockIdx];
    if (block) setTableSizePicker({ blockId: block.id, blockIdx, anchorRect });
  }, [docBlocks]);

  const handleLayoutPick = useCallback((blockIdx, anchorRect) => {
    const block = docBlocks[blockIdx];
    if (block) setLayoutPicker({ blockId: block.id, blockIdx, anchorRect });
  }, [docBlocks]);

  const handleLayoutCreate = useCallback((cols) => {
    if (!layoutPicker) return;
    const { blockId, blockIdx } = layoutPicker;
    setLayoutPicker(null);

    // 현재 블록을 layout으로 변환
    onUpdateBlock(blockId, { type: 'layout', cols, cells: undefined, subtype: undefined, html: undefined, items: undefined });

    // 각 컬럼에 빈 텍스트 블록 자동 삽입 (React 18 updater 체이닝 활용)
    const now = Date.now();
    for (let i = 0; i < cols; i++) {
      onInsertBlock(blockIdx + i, {
        id: `text-${now + i}`,
        type: 'text',
        html: '',
        layoutRef: { layoutId: blockId, colIdx: i },
      });
    }

    // 첫 번째 컬럼에 포커스
    pendingFocusRef.current = { id: `text-${now}`, position: 'start' };
  }, [layoutPicker, onUpdateBlock, onInsertBlock]);

  const handleDeleteTableRow = useCallback((blockId, r1, r2) => {
    const block = docBlocks.find(b => b.id === blockId);
    if (!block) return;
    const { rows = 3, cells = {} } = block;
    const rangeSize = r2 - r1 + 1;
    if (rows - rangeSize < 1) return;
    const shifted = {};
    Object.entries(cells).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      if (r < r1 || r > r2) shifted[r > r2 ? `${r - rangeSize},${c}` : k] = v;
    });
    onUpdateBlock(blockId, { rows: rows - rangeSize, cells: shifted });
  }, [docBlocks, onUpdateBlock]);

  const handleDeleteTableCol = useCallback((blockId, c1, c2) => {
    const block = docBlocks.find(b => b.id === blockId);
    if (!block) return;
    const { cols = 3, cells = {}, colWidths } = block;
    const rangeSize = c2 - c1 + 1;
    if (cols - rangeSize < 1) return;
    const shifted = {};
    Object.entries(cells).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      if (c < c1 || c > c2) shifted[c > c2 ? `${r},${c - rangeSize}` : k] = v;
    });
    const newWidths = colWidths ? colWidths.filter((_, i) => i < c1 || i > c2) : undefined;
    onUpdateBlock(blockId, { cols: cols - rangeSize, cells: shifted, ...(newWidths ? { colWidths: newWidths } : {}) });
  }, [docBlocks, onUpdateBlock]);

  const handleMoveTableRow = useCallback((blockId, r1, r2, dir) => {
    const block = docBlocks.find(b => b.id === blockId);
    if (!block) return;
    const { rows = 3, cells = {} } = block;
    const newCells = {};
    if (dir === 'up') {
      if (r1 <= 0) return;
      Object.entries(cells).forEach(([k, v]) => {
        const [r, c] = k.split(',').map(Number);
        if (r === r1 - 1)            newCells[`${r2},${c}`]    = v;
        else if (r >= r1 && r <= r2) newCells[`${r - 1},${c}`] = v;
        else                         newCells[k] = v;
      });
    } else {
      if (r2 >= rows - 1) return;
      Object.entries(cells).forEach(([k, v]) => {
        const [r, c] = k.split(',').map(Number);
        if (r === r2 + 1)            newCells[`${r1},${c}`]    = v;
        else if (r >= r1 && r <= r2) newCells[`${r + 1},${c}`] = v;
        else                         newCells[k] = v;
      });
    }
    onUpdateBlock(blockId, { cells: newCells });
    setTableSync(s => s + 1);
  }, [docBlocks, onUpdateBlock]);

  const handleMoveTableCol = useCallback((blockId, c1, c2, dir) => {
    const block = docBlocks.find(b => b.id === blockId);
    if (!block) return;
    const { cols = 3, cells = {}, colWidths } = block;
    const newCells = {};
    if (dir === 'left') {
      if (c1 <= 0) return;
      Object.entries(cells).forEach(([k, v]) => {
        const [r, c] = k.split(',').map(Number);
        if (c === c1 - 1)            newCells[`${r},${c2}`]    = v;
        else if (c >= c1 && c <= c2) newCells[`${r},${c - 1}`] = v;
        else                         newCells[k] = v;
      });
    } else {
      if (c2 >= cols - 1) return;
      Object.entries(cells).forEach(([k, v]) => {
        const [r, c] = k.split(',').map(Number);
        if (c === c2 + 1)            newCells[`${r},${c1}`]    = v;
        else if (c >= c1 && c <= c2) newCells[`${r},${c + 1}`] = v;
        else                         newCells[k] = v;
      });
    }
    let newWidths;
    if (colWidths) {
      newWidths = [...colWidths];
      if (dir === 'left' && c1 > 0) {
        const moved = newWidths.splice(c1 - 1, 1)[0];
        newWidths.splice(c2, 0, moved);
      } else if (dir === 'right' && c2 < cols - 1) {
        const moved = newWidths.splice(c2 + 1, 1)[0];
        newWidths.splice(c1, 0, moved);
      }
    }
    onUpdateBlock(blockId, { cells: newCells, ...(newWidths ? { colWidths: newWidths } : {}) });
    setTableSync(s => s + 1);
  }, [docBlocks, onUpdateBlock]);

  const handleAddTableRow = useCallback((blockId, afterRowIdx) => {
    const block = docBlocks.find(b => b.id === blockId);
    if (!block) return;
    const { rows = 3, cells = {} } = block;
    const shifted = {};
    Object.entries(cells).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      shifted[r > afterRowIdx ? `${r + 1},${c}` : k] = v;
    });
    onUpdateBlock(blockId, { rows: rows + 1, cells: shifted });
  }, [docBlocks, onUpdateBlock]);

  const handleAddTableCol = useCallback((blockId, afterColIdx) => {
    const block = docBlocks.find(b => b.id === blockId);
    if (!block) return;
    const { cols = 3, cells = {} } = block;
    const shifted = {};
    Object.entries(cells).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      shifted[c > afterColIdx ? `${r},${c + 1}` : k] = v;
    });
    onUpdateBlock(blockId, { cols: cols + 1, cells: shifted });
  }, [docBlocks, onUpdateBlock]);

  const handleTableCreate = useCallback((rows, cols) => {
    if (!tableSizePicker) return;
    const { blockId, blockIdx } = tableSizePicker;
    setTableSizePicker(null);
    onUpdateBlock(blockId, { type: 'table', rows, cols, cells: {}, subtype: undefined, html: undefined, items: undefined });
    setTimeout(() => {
      const el = document.querySelector(`[data-cell-id="${blockId}-0-0"]`);
      if (el) el.focus();
    }, 30);
  }, [tableSizePicker, onUpdateBlock]);

  const handleSlashTrigger = useCallback((blockId, caretRect, query) => {
    setSlashMenu(prev =>
      prev?.blockId === blockId
        ? { ...prev, query }
        : { blockId, anchorRect: caretRect, query }
    );
  }, []);

  const handleSlashClose = useCallback(() => setSlashMenu(null), []);

  const handleSlashSelect = useCallback((type, subtype) => {
    if (!slashMenu) return;
    const { blockId, query } = slashMenu;
    setSlashMenu(null);

    const blockIdx = docBlocks.findIndex(b => b.id === blockId);
    if (blockIdx === -1) return;

    // DOM에서 /query 텍스트 제거 후 clean HTML 추출
    const el = document.querySelector(`[data-text-id="${blockId}"]`);
    let cleanHtml = '';
    if (el) {
      const slashStr = '/' + query;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        const idx = textNode.textContent.lastIndexOf(slashStr);
        if (idx !== -1) {
          textNode.textContent =
            textNode.textContent.slice(0, idx) +
            textNode.textContent.slice(idx + slashStr.length);
          break;
        }
      }
      cleanHtml = el.innerHTML;
    }

    if (type === 'textSize') {
      onUpdateBlock(blockId, { subtype: subtype || undefined, html: cleanHtml });
      pendingFocusRef.current = { id: blockId, position: 'start' };
    } else if (type === 'todo') {
      onUpdateBlock(blockId, { subtype: 'todo', html: undefined, items: [{ id: `ti-${Date.now()}`, html: cleanHtml, checked: false }] });
      pendingFocusRef.current = { id: blockId, position: 'end' };
    } else if (type === 'bullet' || type === 'numbered') {
      const liContent = cleanHtml.replace(/<br\s*\/?>/gi, '').trim();
      onUpdateBlock(blockId, { subtype: type, html: liContent ? `<li>${cleanHtml}</li>` : '<li></li>', items: undefined });
      pendingFocusRef.current = { id: blockId, position: 'end' };
    } else if (type === 'callout' || type === 'quote') {
      onUpdateBlock(blockId, { subtype: type, html: cleanHtml, items: undefined });
      pendingFocusRef.current = { id: blockId, position: 'end' };
    } else if (type === 'divider') {
      onUpdateBlock(blockId, { type: 'divider', subtype: undefined, html: undefined, items: undefined });
      const newId = `text-${Date.now()}`;
      pendingFocusRef.current = { id: newId, position: 'start' };
      onInsertText(blockIdx, newId);
    } else if (type === 'table') {
      onUpdateText(blockId, cleanHtml);
      setTableSizePicker({ blockId, blockIdx, anchorRect: slashMenu.anchorRect });
    } else if (type === 'layout') {
      onUpdateText(blockId, cleanHtml);
      setLayoutPicker({ blockId, blockIdx, anchorRect: slashMenu.anchorRect });
    }
  }, [slashMenu, docBlocks, onUpdateBlock, onUpdateText, onInsertBlock]);

  return (
    <>
      {dragSelRect && dragSelRect.x2 - dragSelRect.x1 > 4 && (
        <div
          className="fixed pointer-events-none z-50 rounded-[3px]"
          style={{
            left:   dragSelRect.x1,
            top:    dragSelRect.y1,
            width:  dragSelRect.x2 - dragSelRect.x1,
            height: dragSelRect.y2 - dragSelRect.y1,
            background: 'rgba(53,113,206,0.10)',
            border: '1px solid rgba(53,113,206,0.35)',
          }}
        />
      )}
      <FloatingToolbar />
      {plusMenu && (
        <BlockPlusMenu
          blockIdx={plusMenu.blockIdx}
          anchorRect={plusMenu.anchorRect}
          onInsert={handleInsertBlockFromMenu}
          onClose={() => setPlusMenu(null)}
          onTablePick={handleTablePick}
          onLayoutPick={handleLayoutPick}
        />
      )}
      {tableSizePicker && (
        <TableSizePicker
          anchorRect={tableSizePicker.anchorRect}
          onSelect={handleTableCreate}
          onClose={() => setTableSizePicker(null)}
        />
      )}
      {layoutPicker && (
        <LayoutColumnPicker
          anchorRect={layoutPicker.anchorRect}
          onSelect={handleLayoutCreate}
          onClose={() => setLayoutPicker(null)}
        />
      )}
      {slashMenu && (
        <SlashMenu
          ref={slashMenuRef}
          anchorRect={slashMenu.anchorRect}
          query={slashMenu.query}
          onSelect={handleSlashSelect}
          onClose={handleSlashClose}
        />
      )}

      <div
        ref={paperRef}
        tabIndex={-1}
        className="shrink-0 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.10)] my-6 mb-10 outline-none"
        style={{ width: docW, minHeight: docH, padding: pad }}
        onClick={(e) => { onDeselectWidget(e); setActiveBlockId(null); setAllSelected(false); setSelectedBlockIds(new Set()); }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          if (
            e.target.isContentEditable ||
            e.target.closest('[contenteditable="true"]') ||
            e.target.closest('button') ||
            e.target.closest('[data-text-id]') ||
            e.target.closest('[data-layout-col]')
          ) return;
          dragSelStartRef.current = { startX: e.clientX, startY: e.clientY };
          setSelectedBlockIds(new Set());
          setActiveBlockId(null);
          setAllSelected(false);
        }}
        onKeyDown={(e) => {
          const sel = window.getSelection();
          const container = e.currentTarget;

          if (activeBlockId && (e.key === 'Backspace' || e.key === 'Delete')) {
            e.preventDefault();
            const delId  = activeBlockId;
            const delIdx = docBlocks.findIndex(b => b.id === delId);
            setActiveBlockId(null);
            onDeleteBlock(delId);
            // 현재 포커스가 data-text-id 텍스트 블록 안이면 그대로 유지 (블록이 삭제되지 않으니까)
            // 표 셀이나 포커스 없는 경우엔 인접 텍스트 블록으로 이동 필요
            const focused = document.activeElement;
            const focusedInTextBlock = focused?.isContentEditable && focused?.hasAttribute('data-text-id');
            if (!focusedInTextBlock) {
              // 삭제된 블록 기준으로 뒤쪽 → 앞쪽 순서로 인접 텍스트 블록 탐색
              let ti = delIdx + 1;
              while (ti < docBlocks.length && docBlocks[ti].type !== 'text') ti++;
              if (ti >= docBlocks.length) {
                ti = delIdx - 1;
                while (ti >= 0 && docBlocks[ti].type !== 'text') ti--;
              }
              const targetId = (ti >= 0 && ti < docBlocks.length) ? docBlocks[ti].id : null;
              setTimeout(() => {
                // targetId가 있으면 해당 블록, 없으면 DOM에서 첫 번째 텍스트 블록 (새로 생성된 빈 블록 포함)
                const el = targetId
                  ? document.querySelector(`[data-text-id="${targetId}"]`)
                  : document.querySelector('[data-text-id]');
                if (el) {
                  el.focus();
                  const s = window.getSelection();
                  s.removeAllRanges();
                  const r = document.createRange(); r.setStart(el, 0); r.collapse(true); s.addRange(r);
                }
              }, 0);
            }
            return;
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            const activeEl = document.activeElement;
            const isInLayoutCol = !!activeEl?.closest?.('[data-layout-col]');
            if (!activeEl?.isContentEditable || isInLayoutCol) {
              e.preventDefault();
              onUndo?.();
              return;
            }
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            sel.removeAllRanges();
            setAllSelected(true);
            setActiveBlockId(null);
            return;
          }
          if (selectedBlockIds.size > 0 && (e.key === 'Backspace' || e.key === 'Delete')) {
            e.preventDefault();
            const ids = [...selectedBlockIds];
            setSelectedBlockIds(new Set());
            pendingResetFocus.current = true;
            onDeleteBlocksInRange(null, ids);
            return;
          }
          if (selectedBlockIds.size > 0) setSelectedBlockIds(new Set());
          if (allSelected && (e.key === 'Backspace' || e.key === 'Delete')) {
            e.preventDefault();
            setAllSelected(false);
            const allIds = docBlocks.map(b => b.id);
            pendingResetFocus.current = true;
            onDeleteBlocksInRange(null, allIds);
            return;
          }
          if (allSelected) setAllSelected(false);

          if ((e.key === 'Backspace' || e.key === 'Delete') && sel && !sel.isCollapsed) {
            const editables = [...container.querySelectorAll('[contenteditable]')];
            const aIdx = editables.findIndex(el => el.contains(sel.anchorNode));
            const fIdx = editables.findIndex(el => el.contains(sel.focusNode));
            if (aIdx === -1 || fIdx === -1 || aIdx === fIdx) return;
            e.preventDefault();
            sel.removeAllRanges();
            const fromIdx   = Math.min(aIdx, fIdx);
            const toIdx     = Math.max(aIdx, fIdx);
            const keepId    = editables[fromIdx].getAttribute('data-text-id');
            const deleteIds = editables.slice(fromIdx + 1, toIdx + 1)
              .map(el => el.getAttribute('data-text-id')).filter(Boolean);
            onDeleteBlocksInRange(keepId, deleteIds);
            setTimeout(() => {
              const el = container.querySelector(`[data-text-id="${keepId}"]`);
              if (el) { el.innerHTML = ''; el.focus(); }
            }, 0);
          }
        }}
      >
        {draggingIdx !== null && dropIdx === 0 && (
          <div className="h-[2px] bg-primary rounded-full mb-1" />
        )}

        {docBlocks.map((block, i) => {
          // layoutRef가 있는 블록은 레이아웃 컬럼 안에서 렌더링 → 숨김 placeholder만
          if (block.layoutRef) {
            return (
              <div key={block.id} ref={el => { blockRefs.current[i] = el; }} style={{ display: 'none' }} />
            );
          }

          const colBlocks = block.type === 'layout'
            ? Array.from({ length: block.cols }, (_, col) =>
                docBlocks.filter(b => b.layoutRef?.layoutId === block.id && b.layoutRef?.colIdx === col)
              )
            : null;

          return (
            <React.Fragment key={block.id}>
              <div
                ref={el => blockRefs.current[i] = el}
                style={{ marginBottom: docConfig.blockSpacing ?? 3 }}
                className={`relative rounded-[6px] transition-all duration-100
                  ${draggingIdx === i
                    ? 'opacity-40 bg-[#e8f0fc] shadow-[0_2px_12px_rgba(53,113,206,0.18)] cursor-grabbing scale-[0.99]'
                    : allSelected || activeBlockId === block.id || selectedBlockIds.has(block.id) ? 'bg-[#dce8ff]' : ''}`}
              >
                {/* 드래그 핸들 + + 버튼 */}
                {(() => {
                  const isHovered = hoveredBlockId === block.id;
                  return (
                    <div className={`absolute -left-[52px] top-[3px] flex items-center gap-[3px] transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); setPlusMenu({ blockIdx: i, anchorRect: e.currentTarget.getBoundingClientRect() }); }}
                        className="w-[18px] h-[18px] flex items-center justify-center rounded text-[#8c959e] text-[15px] font-normal leading-none hover:bg-[#e2e6ea] hover:text-[#3d4a56] select-none transition-colors"
                      >+</button>
                      <div
                        onMouseDown={(e) => { e.stopPropagation(); window.getSelection()?.removeAllRanges(); handleDragHandleMouseDown(e, i, block.id, setActiveBlockId); }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#8c959e] cursor-grab active:cursor-grabbing"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  );
                })()}

                {block.type === 'text' && block.subtype === 'todo' ? (
                  <TodoListBlock
                    block={block}
                    onUpdateBlock={onUpdateBlock}
                    onEnterAfterBlock={handleEnterBlock}
                    onBackspaceAtStart={handleBackspaceAtStart}
                    onArrowOut={handleArrow}
                    onFocusBlock={() => setAllSelected(false)}
                    lineHeight={docConfig.lineHeight}
                    letterSpacing={docConfig.letterSpacing}
                  />
                ) : block.type === 'text' ? (
                  <TextBlock
                    block={block}
                    onChange={onUpdateText}
                    onDelete={onDeleteBlock}
                    onEnter={handleEnterBlock}
                    onArrow={handleArrow}
                    onBackspaceAtStart={handleBackspaceAtStart}
                    onFocusBlock={() => { setAllSelected(false); if (slashMenu?.blockId !== block.id) setSlashMenu(null); }}
                    onBlurBlock={() => {}}
                    isBlockActive={activeBlockId === block.id}
                    allSelected={allSelected}
                    bulletNumber={block.subtype === 'numbered'
                      ? docBlocks.slice(0, i).filter(b => b.subtype === 'numbered').length + 1
                      : null}
                    onConvertToSubtype={handleConvertToSubtype}
                    lineHeight={docConfig.lineHeight}
                    letterSpacing={docConfig.letterSpacing}
                    onSlashTrigger={handleSlashTrigger}
                    onSlashClose={handleSlashClose}
                    isSlashOpen={slashMenu?.blockId === block.id}
                    slashMenuRef={slashMenuRef}
                  />
                ) : block.type === 'divider' ? (
                  <div
                    className={`py-2 cursor-pointer rounded-[4px] ${activeBlockId === block.id ? 'ring-1 ring-[#3571ce]' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setActiveBlockId(block.id); }}
                  >
                    <div style={{ height: 1, background: activeBlockId === block.id ? '#3571ce' : '#d9dfe5', borderRadius: 1 }} />
                  </div>
                ) : block.type === 'table' ? (
                  <TableBlock
                    block={block}
                    onUpdateBlock={onUpdateBlock}
                    onCellFocus={(blockId, r, c) => { onCellFocus?.(blockId, r, c); setAllSelected(false); setActiveBlockId(null); }}
                    onFocusBlock={() => { setAllSelected(false); setActiveBlockId(null); }}
                    onAddRow={handleAddTableRow}
                    onAddCol={handleAddTableCol}
                    onDeleteRow={handleDeleteTableRow}
                    onDeleteCol={handleDeleteTableCol}
                    onMoveRow={handleMoveTableRow}
                    onMoveCol={handleMoveTableCol}
                    forceSync={tableSync}
                  />
                ) : block.type === 'layout' ? (
                  <LayoutBlock
                    block={block}
                    colBlocks={colBlocks}
                    registerColRef={registerColRef}
                    registerColBlockRef={registerColBlockRef}
                    hoveredColKey={(draggingIdx !== null || draggingColBlockId !== null) ? hoveredColKey : null}
                    colDropInfo={(draggingIdx !== null || draggingColBlockId !== null) ? colDropInfo : null}
                    draggingColBlockId={draggingColBlockId}
                    onColDragHandleMouseDown={handleColDragHandleMouseDown}
                    onUpdateBlock={onUpdateBlock}
                    onUpdateText={onUpdateText}
                    activeBlockId={activeBlockId}
                    allSelected={allSelected}
                    onFocusBlock={(id) => { setAllSelected(false); setActiveBlockId(id ?? null); }}
                    onSlashTrigger={handleSlashTrigger}
                    onSlashClose={handleSlashClose}
                    slashMenuRef={slashMenuRef}
                    slashBlockId={slashMenu?.blockId}
                    onCreateColumnBlock={handleCreateColumnBlock}
                    onColumnEnter={handleColumnEnter}
                    onColumnBackspace={handleColumnBackspace}
                    onColumnArrow={handleColumnArrow}
                    onConvertToSubtype={handleConvertToSubtype}
                    config={config}
                    findWidgetDef={findWidgetDef}
                    selectedWidget={selectedWidget}
                    onCardClick={onCardClick}
                    onDeleteBlock={onDeleteBlock}
                  />
                ) : (
                  <div className="px-[10px] py-[10px]">
                    <WidgetBlock
                      block={block}
                      config={config}
                      widgetDef={findWidgetDef(block.widgetId)}
                      isActive={selectedWidget?.instanceId === block.instanceId}
                      onClick={onCardClick}
                      onDelete={onDeleteBlock}
                    />
                  </div>
                )}
              </div>

              {draggingIdx !== null && dropIdx === i + 1 && draggingIdx !== i && draggingIdx !== i + 1 && (
                <div className="h-[2px] bg-primary rounded-full my-0.5" />
              )}
            </React.Fragment>
          );
        })}

        {/* 문서 끝 클릭 영역: 마지막 블록이 비텍스트여도 커서를 둘 수 있음 */}
        <div
          className="min-h-[60px] cursor-text"
          onClick={(e) => {
            e.stopPropagation();
            const lastMain = [...docBlocks].reverse().find(b => !b.layoutRef);
            if (lastMain?.type === 'text') {
              const el = document.querySelector(`[data-text-id="${lastMain.id}"]`);
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
              const newId = `text-${Date.now()}`;
              pendingFocusRef.current = { id: newId, position: 'end' };
              onInsertText(docBlocks.length - 1, newId);
            }
          }}
        />
      </div>
    </>
  );
}
