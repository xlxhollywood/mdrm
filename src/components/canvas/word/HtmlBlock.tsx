'use client';

import { useState, useRef, useEffect } from 'react';

export default function HtmlBlock({ block, onUpdateBlock, isActive, onClick }) {
  const [editing, setEditing] = useState(!block.code);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  const handleSave = () => {
    const code = textareaRef.current?.value ?? block.code ?? '';
    // script 태그, on* 이벤트 핸들러 제거
    const clean = code
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
    onUpdateBlock(block.id, { code: clean });
    setEditing(false);
  };

  return (
    <div
      className={`relative rounded-[6px] transition-all ${isActive ? 'ring-1 ring-[#3571ce]' : ''}`}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      {editing ? (
        <div className="border border-[#d9dfe5] rounded-[6px] overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#f5f5f5] border-b border-[#d9dfe5]">
            <span className="text-[11px] text-[#5b646f] font-medium tracking-wide">HTML</span>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={handleSave}
              className="text-[11px] text-white bg-[#0056a4] hover:bg-[#004a8f] px-2.5 py-0.5 rounded transition-colors"
            >렌더링</button>
          </div>
          {/* 코드 입력 */}
          <textarea
            ref={textareaRef}
            defaultValue={block.code || ''}
            placeholder="HTML 코드를 붙여넣으세요..."
            className="w-full min-h-[120px] p-3 text-[13px] font-mono bg-[#1a222b] text-[#e2e8f0] outline-none resize-y"
            spellCheck={false}
            onKeyDown={e => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
              // 에디터 내부 키 이벤트가 상위로 전파되지 않도록
              e.stopPropagation();
            }}
          />
        </div>
      ) : (
        <div className="group relative">
          {/* 렌더링된 HTML */}
          <div
            className="html-rendered px-1 py-1"
            dangerouslySetInnerHTML={{ __html: block.code || '' }}
          />
          {/* 편집 버튼 */}
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-[10px] text-[#5b646f] bg-white/90 border border-[#d9dfe5] px-2 py-0.5 rounded shadow-sm hover:bg-[#f5f5f5] transition-opacity"
          >편집</button>
        </div>
      )}
    </div>
  );
}
