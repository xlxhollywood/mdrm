'use client';

import React, { useRef, useEffect } from 'react';
import TableBlock from '../table/TableBlock';

function WidgetIcon({ type, size = 16 }: { type: string; size?: number }) {
  const cls = "shrink-0 text-[#0056a4]";
  if (type === 'chart') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <path d="M18 20V10M12 20V4M6 20v-6"/>
    </svg>
  );
  if (type === 'table') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
    </svg>
  );
  if (type === 'list') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  );
  if (type === 'shield') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
  if (type === 'clipboard') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h6"/>
    </svg>
  );
  if (type === 'alert') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
  if (type === 'xmark') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
  if (type === 'clock') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
  return null;
}

interface WidgetBlockProps {
  block: any;
  isActive?: boolean;
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
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export default function WidgetBlock({
  block, isActive,  onUpdateBlock,
  onCellFocus, onFocusBlock,
  onAddRow, onAddCol, onDeleteRow, onDeleteCol,
  onMoveRow, onMoveCol, forceSync = 0,
  onDuplicate, onDelete,
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

  const isBold = block.titleBold !== false;
  const isItalic = !!block.titleItalic;
  const titleColor = block.titleColor || (block.headerItems ? '#1a222b' : '#0056a4');
  const titleHighlight = block.titleHighlight || undefined;
  const TITLE_SIZES: Record<string, string> = {
    h1: 'text-[22px]',
    h2: 'text-[18px]',
    h3: 'text-[16px]',
    h4: 'text-[15px]',
    h5: 'text-[13px]',
  };
  const titleClass = `${TITLE_SIZES[block.titleSubtype] || 'text-[14px]'} ${isBold ? 'font-bold' : 'font-normal'} ${isItalic ? 'italic' : ''}`;
  const hasSubtitle = !!block.subtitle;

  return (
    <div className="my-2 px-[6px] pt-[12px] pb-[10px] cursor-pointer group/widget">
      {/* 메인 제목 */}
      {title && (
        <div className={`relative flex items-center gap-1.5 ${block.headerItems ? 'mb-3' : hasSubtitle ? 'mb-1' : 'mb-4'}`}>
          {block.titleIcon && !block.headerItems && <WidgetIcon type={block.titleIcon} />}
          <div className="relative flex-1">
            {showPlaceholder && !block.titleIcon && (
              <div className={`absolute inset-0 ${titleClass} text-[#94a3b8] pointer-events-none font-normal`}>제목을 입력하세요</div>
            )}
            <div
              ref={titleRef}
              className={`${titleClass} relative cursor-pointer select-none ${titleHighlight ? 'px-2 py-1 rounded-[3px]' : ''}`}
              style={{ color: titleColor, backgroundColor: titleHighlight, textAlign: block.headerItems ? 'center' : undefined }}
            />
          </div>
          {/* 복제/삭제 (헤더 위젯에서는 숨김) */}
          {!block.headerItems && <div className={`flex gap-[2px] shrink-0 -mt-[6px] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>
            {onDuplicate && (
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="w-[24px] h-[24px] rounded-[4px] flex items-center justify-center text-[#0056a4] hover:text-[#004a8f] hover:bg-[#eff6ff] transition-colors"
                title="복제"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="w-[24px] h-[24px] rounded-[4px] flex items-center justify-center text-[#0056a4] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                title="삭제"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
              </button>
            )}
          </div>}
        </div>
      )}

      {/* 문서 헤더 아이템 (점검명, 일시 등) */}
      {block.headerItems && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginBottom: 8 }}>
          {block.headerItems.filter((item: any) => item.visible !== false).map((item: any, hi: number) => (
            <div key={hi} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <WidgetIcon type={item.icon} size={item.iconSize || 13} />
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newItems = [...block.headerItems];
                  newItems[hi] = { ...newItems[hi], text: e.currentTarget.textContent || '' };
                  onUpdateBlock(block.id, { headerItems: newItems });
                }}
                style={{ fontSize: item.fontSize || 12, color: item.color || '#5b646f', lineHeight: 1, outline: 'none', cursor: 'text', textAlign: 'right', flex: 1 }}
                dangerouslySetInnerHTML={{ __html: item.text }}
              />
            </div>
          ))}
        </div>
      )}

      {/* sections: 여러 서브타이틀+테이블 묶음 */}
      {block.sections?.map((sec: any, si: number) => {
        const secTable = { id: `${block.id}-s${si}`, type: 'table' as const, ...sec.table };
        const secCount = Math.max(0, (sec.table?.rows || 0) - (sec.table?.headerRow ? 1 : 0));
        return (
          <div key={si} className={si > 0 ? 'mt-3' : ''}>
            <div className="flex items-center justify-end gap-1 mb-0.5 mr-[4px]">
              {sec.subtitleIcon && <WidgetIcon type={sec.subtitleIcon} size={12} />}
              <span className="text-[12px] font-medium text-[#0056a4]">{sec.subtitle}</span>
              <span className="text-[10px] text-[#94a3b8] font-normal">({secCount}건)</span>
            </div>
            <TableBlock
              block={secTable}
              onUpdateBlock={(_, fields) => {
                const newSections = [...block.sections];
                newSections[si] = { ...newSections[si], table: { ...newSections[si].table, ...fields } };
                onUpdateBlock(block.id, { sections: newSections });
              }}
              onCellFocus={onCellFocus}
              onFocusBlock={onFocusBlock}
              forceSync={forceSync}
              readOnly
            />
          </div>
        );
      })}

      {/* 단일 서브타이틀+테이블 */}
      {!block.sections && hasSubtitle && (() => {
        const subCount = Math.max(0, (block.table?.rows || 0) - (block.table?.headerRow ? 1 : 0));
        return (
          <div className="flex items-center justify-end gap-1 mb-0.5 mr-[4px]">
            {block.subtitleIcon && <WidgetIcon type={block.subtitleIcon} size={12} />}
            <span className="text-[12px] font-medium text-[#0056a4]">{block.subtitle}</span>
            <span className="text-[10px] text-[#94a3b8] font-normal">({subCount}건)</span>
          </div>
        );
      })()}
      {!block.sections && hasTable && tableBlock && (
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
          readOnly
        />
      )}

      {/* 콘텐츠: HTML 코드블록 */}
      {hasCode && (
        <div dangerouslySetInnerHTML={{ __html: block.code }} />
      )}
    </div>
  );
}
