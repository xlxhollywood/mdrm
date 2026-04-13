'use client';

import { useState, useRef, useEffect } from 'react';

export default function TextBlock({ block, onChange, onDelete, onEnter, onArrow, onBackspaceAtStart, onFocusBlock, onBlurBlock, isBlockActive, allSelected, bulletNumber, onConvertToSubtype, lineHeight, letterSpacing }) {
  const ref = useRef(null);
  const isComposing = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const isList = block.subtype === 'bullet' || block.subtype === 'numbered';
  const isEmpty = isList
    ? !(block.html || '').replace(/<[^>]*>/g, '').trim()
    : !(block.html || '').replace(/<br\s*\/?>/gi, '').trim();
  const showPlaceholder = block.subtype ? isEmpty : (isFocused && isEmpty);

  const placeholderText = {
    bullet: '목록', numbered: '목록', todo: '할 일',
    callout: '내용을 입력하세요...', quote: '인용문을 입력하세요...',
    h1: '제목 1', h2: '제목 2', h3: '제목 3', h4: '제목 4', h5: '제목 5',
  }[block.subtype] || '텍스트를 입력하세요...';

  const headingStyle = {
    h1: { fontSize: '30px', fontWeight: 'bold' },
    h2: { fontSize: '24px', fontWeight: 'bold' },
    h3: { fontSize: '20px', fontWeight: 'bold' },
    h4: { fontSize: '16px', fontWeight: 'bold' },
    h5: { fontSize: '14px', fontWeight: 'bold' },
  }[block.subtype] || {};

  useEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      const isList = block.subtype === 'bullet' || block.subtype === 'numbered';
      ref.current.innerHTML = block.html || (isList ? '<li></li>' : '');
    }
  }, [block.html]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing.current) {
      if (isList) {
        const sel = window.getSelection();
        if (sel?.rangeCount) {
          let node = sel.getRangeAt(0).startContainer;
          while (node && node !== ref.current && node.tagName !== 'LI') node = node.parentElement;
          const currentLi = node?.tagName === 'LI' ? node : null;
          if (currentLi && !currentLi.textContent.trim()) {
            e.preventDefault();
            const isLastLi = !currentLi.nextElementSibling;
            currentLi.remove();
            const hasRemaining = !!ref.current.textContent.trim();
            if (hasRemaining) {
              onChange(block.id, ref.current.innerHTML);
              if (isLastLi) onEnter(block.id);
            } else {
              onChange(block.id, '');
              onBackspaceAtStart?.(block.id, '');
            }
          }
        }
        return;
      }
      e.preventDefault();
      onEnter(block.id);
      return;
    }
    // - + 스페이스 → 글머리 기호 목록 자동 변환
    if (e.key === ' ' && !isComposing.current && !block.subtype) {
      const text = ref.current?.textContent || '';
      if (text === '-') { e.preventDefault(); onConvertToSubtype?.(block.id, 'bullet'); return; }
      if (text === '1.') { e.preventDefault(); onConvertToSubtype?.(block.id, 'numbered'); return; }
    }
    if (e.key === 'Backspace' && !isComposing.current) {
      if (isList) {
        const sel = window.getSelection();
        const listEmpty = !ref.current?.textContent?.trim();
        if (listEmpty) {
          e.preventDefault();
          onBackspaceAtStart?.(block.id, '');
          return;
        }
        if (sel?.rangeCount && sel.getRangeAt(0).collapsed) {
          const range = sel.getRangeAt(0);
          const firstLi = ref.current.querySelector('li');
          if (firstLi) {
            try {
              const test = document.createRange();
              test.setStart(firstLi, 0);
              test.setEnd(range.startContainer, range.startOffset);
              if (test.toString().length === 0) {
                e.preventDefault();
                onBackspaceAtStart?.(block.id, firstLi.innerHTML);
                return;
              }
            } catch (_) {}
          }
        }
        return;
      }
      const sel = window.getSelection();
      if (!sel?.rangeCount || !sel.getRangeAt(0).collapsed) return;
      const range = sel.getRangeAt(0);
      const el = ref.current;
      const node = range.startContainer;
      const offset = range.startOffset;
      const atStart =
        (node === el && offset === 0) ||
        (node.nodeType === Node.TEXT_NODE && offset === 0 && el.firstChild === node) ||
        isEmpty;
      if (atStart) {
        e.preventDefault();
        onBackspaceAtStart?.(block.id, block.html || '');
        return;
      }
    }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.shiftKey && !e.metaKey && !e.ctrlKey && !isComposing.current) {
      const sel = window.getSelection();
      if (!sel?.rangeCount || !sel.getRangeAt(0).collapsed) return;
      const prevNode   = sel.focusNode;
      const prevOffset = sel.focusOffset;
      const dir        = e.key === 'ArrowLeft' ? 'left' : 'right';
      requestAnimationFrame(() => {
        const next = window.getSelection();
        if (next && document.activeElement === ref.current &&
            next.focusNode === prevNode && next.focusOffset === prevOffset) {
          onArrow(block.id, dir);
        }
      });
      return;
    }
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (e.metaKey || e.ctrlKey) && !isComposing.current) {
      e.preventDefault();
      onArrow(block.id, e.key === 'ArrowUp' ? 'first' : 'last', 0);
      return;
    }
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isComposing.current) {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const caretRect = sel.getRangeAt(0).getBoundingClientRect();
      const elRect    = ref.current.getBoundingClientRect();
      const lineH     = caretRect.height || 20;
      const zeroRect  = caretRect.top === 0 && caretRect.bottom === 0;
      const caretX    = zeroRect ? elRect.left : (caretRect.left + caretRect.width / 2);
      if (e.key === 'ArrowUp' && (zeroRect || caretRect.top < elRect.top + lineH)) {
        e.preventDefault();
        onArrow(block.id, 'up', caretX);
      } else if (e.key === 'ArrowDown' && (zeroRect || caretRect.bottom > elRect.bottom - lineH)) {
        e.preventDefault();
        onArrow(block.id, 'down', caretX);
      }
    }
  };

  const editableDiv = (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      dir="ltr"
      data-text-id={block.id}
      data-placeholder={showPlaceholder ? placeholderText : undefined}
      className="flex-1 outline-none px-1 py-0.5 cursor-text"
      style={{
        color: block.subtype === 'quote' ? '#5b646f' : '#1a222b',
        fontStyle: block.subtype === 'quote' ? 'italic' : undefined,
        fontSize: '13px',
        lineHeight: lineHeight ?? 1.6,
        letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
        ...headingStyle,
      }}
      onFocus={() => { setIsFocused(true); onFocusBlock?.(); }}
      onBlur={() => { setIsFocused(false); onBlurBlock?.(); }}
      onDragStart={(e) => e.preventDefault()}
      onCompositionStart={() => { isComposing.current = true; }}
      onCompositionEnd={() => { isComposing.current = false; }}
      onInput={(e) => onChange(block.id, e.currentTarget.innerHTML)}
      onKeyDown={handleKeyDown}
    />
  );

  if (block.subtype === 'bullet' || block.subtype === 'numbered') {
    const Tag = block.subtype === 'bullet' ? 'ul' : 'ol';
    return (
      <Tag
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-text-id={block.id}
        data-placeholder={showPlaceholder ? '목록을 입력하세요...' : undefined}
        className={`outline-none cursor-text pl-5 min-h-[28px] ${block.subtype === 'bullet' ? 'list-disc' : 'list-decimal'}`}
        style={{ fontSize: '13px', color: '#1a222b', lineHeight: lineHeight ?? 1.6, letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined, marginLeft: '-16px' }}
        onFocus={() => { setIsFocused(true); onFocusBlock?.(); }}
        onBlur={() => { setIsFocused(false); onBlurBlock?.(); }}
        onDragStart={e => e.preventDefault()}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; }}
        onInput={e => onChange(block.id, e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
      />
    );
  }
  if (block.subtype === 'quote') {
    return (
      <div className="flex items-stretch min-h-[32px] gap-2 py-0.5">
        <div className="w-[3px] rounded-full shrink-0 bg-[#d9dfe5]" />
        {editableDiv}
      </div>
    );
  }
  if (block.subtype === 'callout') {
    return (
      <div className="flex items-start min-h-[32px] gap-2 px-3 py-2 rounded-[8px] bg-[#f0f4ff] border border-[#c5d3f0]">
        <span className="text-[15px] leading-[1.8] shrink-0 select-none">💡</span>
        {editableDiv}
      </div>
    );
  }
  return (
    <div className="flex items-start min-h-[32px]">
      {editableDiv}
    </div>
  );
}
