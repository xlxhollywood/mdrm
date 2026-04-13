'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PAPER_SIZES, MM_TO_PX } from './word/wordConstants';
import FloatingToolbar   from './word/FloatingToolbar';
import TextBlock         from './word/TextBlock';
import TodoListBlock     from './word/TodoListBlock';
import BlockPlusMenu     from './word/BlockPlusMenu';
import SlashMenu         from './word/SlashMenu';
import TableSizePicker   from './word/TableSizePicker';
import { DragHandleIcon, WidgetBlock, TableBlock } from './word/WordBlockTypes';
import useDragBlocks     from './word/useDragBlocks';

export default function WordCanvas({
  docBlocks, config, selectedWidget, docConfig, findWidgetDef,
  onCardClick, onDeleteBlock, onUpdateText, onDeselectWidget, onReorderBlocks, onInsertText, onDeleteBlocksInRange,
  onInsertBlock, onUpdateBlock, onCellFocus,
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

  const [hoveredBlockId, setHoveredBlockId] = useState(null);
  const [activeBlockId,  setActiveBlockId]  = useState(null);
  const [allSelected,    setAllSelected]    = useState(false);
  const [plusMenu,       setPlusMenu]       = useState(null);
  const [slashMenu,        setSlashMenu]        = useState(null);
  const [tableSizePicker,  setTableSizePicker]  = useState(null); // { blockId, blockIdx, anchorRect }
  const slashMenuRef    = useRef(null);
  const pendingResetFocus = useRef(false);

  const { draggingIdx, dropIdx, handleDragHandleMouseDown } = useDragBlocks({
    docBlocks, blockRefs, onReorderBlocks,
  });

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
    }
  }, [slashMenu, docBlocks, onUpdateBlock, onUpdateText, onInsertBlock]);

  return (
    <>
      <FloatingToolbar />
      {plusMenu && (
        <BlockPlusMenu
          blockIdx={plusMenu.blockIdx}
          anchorRect={plusMenu.anchorRect}
          onInsert={handleInsertBlockFromMenu}
          onClose={() => setPlusMenu(null)}
          onTablePick={handleTablePick}
        />
      )}
      {tableSizePicker && (
        <TableSizePicker
          anchorRect={tableSizePicker.anchorRect}
          onSelect={handleTableCreate}
          onClose={() => setTableSizePicker(null)}
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
        className="shrink-0 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.10)] my-6 mb-10"
        style={{ width: docW, minHeight: docH, padding: pad }}
        onClick={(e) => { onDeselectWidget(e); setActiveBlockId(null); setAllSelected(false); }}
        onKeyDown={(e) => {
          const sel = window.getSelection();
          const container = e.currentTarget;

          if (activeBlockId && (e.key === 'Backspace' || e.key === 'Delete')) {
            e.preventDefault();
            const delId = activeBlockId;
            setActiveBlockId(null);
            onDeleteBlock(delId);
            return;
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            sel.removeAllRanges();
            setAllSelected(true);
            setActiveBlockId(null);
            return;
          }
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

        {docBlocks.map((block, i) => (
          <React.Fragment key={block.id}>
            <div
              ref={el => blockRefs.current[i] = el}
              style={{ marginBottom: docConfig.blockSpacing ?? 3 }}
              className={`relative rounded-[6px] transition-all duration-100
                ${draggingIdx === i
                  ? 'opacity-40 bg-[#e8f0fc] shadow-[0_2px_12px_rgba(53,113,206,0.18)] cursor-grabbing scale-[0.99]'
                  : allSelected || activeBlockId === block.id ? 'bg-[#dce8ff]' : ''}`}
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
                  onCellFocus={(blockId, r, c) => { onCellFocus?.(blockId, r, c); setAllSelected(false); }}
                  onFocusBlock={() => setAllSelected(false)}
                />
              ) : (
                <WidgetBlock
                  block={block}
                  config={config}
                  widgetDef={findWidgetDef(block.widgetId)}
                  isActive={selectedWidget?.instanceId === block.instanceId}
                  onClick={onCardClick}
                  onDelete={onDeleteBlock}
                />
              )}
            </div>

            {draggingIdx !== null && dropIdx === i + 1 && draggingIdx !== i && draggingIdx !== i + 1 && (
              <div className="h-[2px] bg-primary rounded-full my-0.5" />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
