'use client';

import { useRef, useEffect } from 'react';

export default function TodoListBlock({ block, onUpdateBlock, onEnterAfterBlock, onBackspaceAtStart, onArrowOut, onFocusBlock, lineHeight, letterSpacing }) {
  const items = block.items ?? [{ id: `ti-0-${block.id}`, html: block.html || '', checked: block.checked || false }];
  const itemRefs    = useRef({});
  const isComposing = useRef(false);
  const pendingItemFocus = useRef(null);

  useEffect(() => {
    if (!pendingItemFocus.current) return;
    const { itemId, position } = pendingItemFocus.current;
    pendingItemFocus.current = null;
    const el = itemRefs.current[itemId];
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    const r = document.createRange();
    if (position === 'end') {
      r.selectNodeContents(el);
      r.collapse(false);
    } else {
      r.setStart(el, 0);
      r.collapse(true);
    }
    sel.addRange(r);
  }, [items]);

  const updateItems = (newItems) => onUpdateBlock(block.id, { items: newItems });

  const handleItemEnter = (e, idx) => {
    e.preventDefault();
    if (isComposing.current) return;
    const item = items[idx];
    const el = itemRefs.current[item.id];
    const isEmpty = !el?.textContent?.trim();
    const isLast = idx === items.length - 1;

    if (isEmpty) {
      if (items.length === 1) {
        onBackspaceAtStart?.(block.id, '');
      } else if (isLast) {
        const newItems = items.filter((_, i) => i !== idx);
        updateItems(newItems);
        onEnterAfterBlock?.(block.id);
      } else {
        updateItems(items.filter((_, i) => i !== idx));
      }
      return;
    }

    // 현재 항목의 최신 html을 DOM에서 직접 읽어 저장
    const currentHtml = el?.innerHTML || '';
    const updatedItems = items.map(it => it.id === item.id ? { ...it, html: currentHtml } : it);
    const newItem = { id: `ti-${Date.now()}`, html: '', checked: false };
    const newItems = [...updatedItems];
    newItems.splice(idx + 1, 0, newItem);
    updateItems(newItems);
    pendingItemFocus.current = { itemId: newItem.id };
  };

  const handleItemBackspace = (e, idx) => {
    const item = items[idx];
    const el = itemRefs.current[item.id];
    const sel = window.getSelection();
    if (!sel?.rangeCount || !sel.getRangeAt(0).collapsed) return;

    const isEmpty = !el?.textContent?.trim();

    if (!isEmpty) {
      const range = sel.getRangeAt(0);
      try {
        const test = document.createRange();
        test.setStart(el, 0);
        test.setEnd(range.startContainer, range.startOffset);
        if (test.toString().length === 0) {
          e.preventDefault();
          onBackspaceAtStart?.(block.id, el.innerHTML);
        }
      } catch (_) {}
      return;
    }

    e.preventDefault();
    if (items.length === 1) {
      onBackspaceAtStart?.(block.id, '');
    } else {
      const newItems = items.filter((_, i) => i !== idx);
      updateItems(newItems);
      const focusIdx = idx > 0 ? idx - 1 : 0;
      pendingItemFocus.current = { itemId: newItems[focusIdx].id, position: 'end' };
    }
  };

  const handleItemArrow = (e, idx) => {
    const item = items[idx];
    const el = itemRefs.current[item.id];
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const caretRect = sel.getRangeAt(0).getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const lineH = caretRect.height || 20;
    const zeroRect = caretRect.top === 0 && caretRect.bottom === 0;

    if (e.key === 'ArrowUp') {
      const isFirstLine = zeroRect || caretRect.top < elRect.top + lineH;
      if (!isFirstLine) return;
      if (idx > 0) {
        e.preventDefault();
        const prevEl = itemRefs.current[items[idx - 1].id];
        if (prevEl) {
          prevEl.focus();
          const r = document.createRange();
          r.selectNodeContents(prevEl);
          r.collapse(false);
          sel.removeAllRanges();
          sel.addRange(r);
        }
      } else {
        e.preventDefault();
        onArrowOut?.(block.id, 'up', zeroRect ? elRect.left : caretRect.left + caretRect.width / 2);
      }
    } else if (e.key === 'ArrowDown') {
      const isLastLine = zeroRect || caretRect.bottom > elRect.bottom - lineH;
      if (!isLastLine) return;
      if (idx < items.length - 1) {
        e.preventDefault();
        const nextEl = itemRefs.current[items[idx + 1].id];
        if (nextEl) {
          nextEl.focus();
          const r = document.createRange();
          r.setStart(nextEl, 0);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        }
      } else {
        e.preventDefault();
        onArrowOut?.(block.id, 'down', zeroRect ? elRect.left : caretRect.left + caretRect.width / 2);
      }
    }
  };

  const handleToggle = (item) => {
    updateItems(items.map(it => it.id === item.id ? { ...it, checked: !it.checked } : it));
  };

  return (
    <div>
      {items.map((item, idx) => {
        const isItemEmpty = !item.html?.replace(/<br\s*\/?>/gi, '').trim();
        return (
          <div key={item.id} className="flex items-start gap-2 min-h-[28px]">
            <button
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleToggle(item); }}
              className="mt-[5px] shrink-0 w-[15px] h-[15px] rounded border-[1.5px] flex items-center justify-center transition-colors"
              style={{ borderColor: item.checked ? '#0056a4' : '#5b646f', background: item.checked ? '#0056a4' : 'white' }}
            >
              {item.checked && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <div
              ref={el => {
                if (el) {
                  itemRefs.current[item.id] = el;
                  if (!el.dataset.init) { el.dataset.init = '1'; el.innerHTML = item.html || ''; }
                }
              }}
              contentEditable
              suppressContentEditableWarning
              data-text-id={idx === 0 ? block.id : undefined}
              data-placeholder={isItemEmpty ? '할 일을 입력하세요...' : undefined}
              className="flex-1 outline-none px-1 py-0.5 cursor-text"
              style={{
                color: '#1a222b',
                textDecoration: item.checked ? 'line-through' : undefined,
                fontSize: '13px',
                lineHeight: lineHeight ?? 1.6,
                letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
              }}
              onFocus={onFocusBlock}
              onDragStart={e => e.preventDefault()}
              onCompositionStart={() => { isComposing.current = true; }}
              onCompositionEnd={() => { isComposing.current = false; }}
              onInput={e => {
                const el = e.currentTarget;
                updateItems(items.map(it => it.id === item.id ? { ...it, html: el.innerHTML } : it));
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) handleItemEnter(e, idx);
                else if (e.key === 'Backspace') handleItemBackspace(e, idx);
                else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') handleItemArrow(e, idx);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
