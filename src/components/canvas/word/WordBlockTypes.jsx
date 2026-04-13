'use client';

import { useRef } from 'react';
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

export function TableBlock({ block, onUpdateBlock, onCellFocus, onFocusBlock }) {
  const { rows = 3, cols = 3, cells = {} } = block;
  const cellRefs = useRef({});

  const focusCell = (r, c) => {
    const el = cellRefs.current[`${r},${c}`];
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  return (
    <div className="py-1 overflow-x-auto">
      <table className="border-collapse">
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => {
                const key = `${r},${c}`;
                const isHeader = r === 0;
                return (
                  <td key={c} className={`border border-[#d9dfe5] px-2 py-1 min-w-[80px] ${isHeader ? 'bg-[#f5f5f5]' : ''}`}>
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
                      className={`outline-none text-[13px] min-h-[20px] ${isHeader ? 'font-semibold' : ''}`}
                      style={{ color: '#1a222b' }}
                      onFocus={() => { onCellFocus?.(block.id, r, c); onFocusBlock?.(); }}
                      onInput={e => onUpdateBlock(block.id, { cells: { ...cells, [key]: e.currentTarget.innerHTML } })}
                      onKeyDown={e => {
                        if (e.key !== 'Tab') return;
                        e.preventDefault();
                        if (e.shiftKey) {
                          if (c > 0)       focusCell(r, c - 1);
                          else if (r > 0)  focusCell(r - 1, cols - 1);
                        } else {
                          if (c < cols - 1) focusCell(r, c + 1);
                          else if (r < rows - 1) focusCell(r + 1, 0);
                          else {
                            // 마지막 셀 Tab → 행 추가
                            onUpdateBlock(block.id, { rows: rows + 1 });
                            setTimeout(() => focusCell(rows, 0), 30);
                          }
                        }
                      }}
                    />
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
