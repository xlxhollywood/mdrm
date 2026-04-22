'use client';

import React, { useRef, useEffect } from 'react';
import TableBlock from '../table/TableBlock';

interface WidgetBlockProps {
  block: any;
  onUpdateBlock: (id: string, fields: any) => void;
  onCellFocus?: (blockId: string, row: number, col: number) => void;
  onFocusBlock?: () => void;
  onAddRow?: (blockId: string, afterRow: number) => void;
  onAddCol?: (blockId: string, afterCol: number) => void;
  onDeleteRow?: (blockId: string, row: number) => void;
  onDeleteCol?: (blockId: string, col: number) => void;
  onMoveRow?: (blockId: string, from: number, to: number) => void;
  onMoveCol?: (blockId: string, from: number, to: number) => void;
  forceSync?: number;
}

export default function WidgetBlock({
  block, onUpdateBlock,
  onCellFocus, onFocusBlock,
  onAddRow, onAddCol, onDeleteRow, onDeleteCol,
  onMoveRow, onMoveCol, forceSync = 0,
}: WidgetBlockProps) {
  const titleRef = useRef<HTMLDivElement>(null);
  const { title = '' } = block;
  const [showPlaceholder, setShowPlaceholder] = React.useState(!title);

  // 제목 초기화 + 외부 변경 동기화
  useEffect(() => {
    if (titleRef.current) {
      // 외부에서 title이 바뀌었고, 현재 포커스가 이 요소가 아닐 때만 동기화
      if (document.activeElement !== titleRef.current && titleRef.current.innerHTML !== title) {
        titleRef.current.innerHTML = title;
      }
      setShowPlaceholder(!title);
    }
  }, [title]);

  const handleTitleInput = () => {
    const html = titleRef.current?.innerHTML || '';
    const text = titleRef.current?.textContent || '';
    setShowPlaceholder(!text.trim());
    onUpdateBlock(block.id, { title: html });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  // 콘텐츠 타입 판별: table or code(html)
  const hasTable = !!block.table;
  const hasCode = !!block.code;

  const tableBlock = hasTable ? { id: block.id, type: 'table' as const, ...block.table } : null;

  const handleTableUpdate = (id: string, fields: any) => {
    onUpdateBlock(block.id, { table: { ...block.table, ...fields } });
  };

  const TITLE_STYLES: Record<string, string> = {
    h1: 'text-[22px] font-bold',
    h2: 'text-[18px] font-bold',
    h3: 'text-[15px] font-bold',
    h4: 'text-[14px] font-bold',
    h5: 'text-[13px] font-bold',
  };
  const titleClass = TITLE_STYLES[block.titleSubtype] || 'text-[14px] font-bold';

  return (
    <div>
      {/* 제목 */}
      <div className="relative mb-1">
        {showPlaceholder && (
          <div className={`absolute inset-0 ${titleClass} text-[#94a3b8] pointer-events-none font-normal`}>제목을 입력하세요</div>
        )}
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleTitleInput}
          onKeyDown={handleTitleKeyDown}
          className={`${titleClass} text-[#1e293b] outline-none relative`}
        />
      </div>

      {/* 콘텐츠: 테이블 */}
      {hasTable && tableBlock && (
        <TableBlock
          block={tableBlock}
          onUpdateBlock={handleTableUpdate}
          onCellFocus={onCellFocus}
          onFocusBlock={onFocusBlock}
          onAddRow={onAddRow}
          onAddCol={onAddCol}
          onDeleteRow={onDeleteRow}
          onDeleteCol={onDeleteCol}
          onMoveRow={onMoveRow}
          onMoveCol={onMoveCol}
          forceSync={forceSync}
        />
      )}

      {/* 콘텐츠: HTML 코드블록 */}
      {hasCode && (
        <div dangerouslySetInnerHTML={{ __html: block.code }} />
      )}
    </div>
  );
}
