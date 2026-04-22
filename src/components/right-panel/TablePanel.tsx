'use client';

import { useState } from 'react';
import { Sep, SectionLabel } from './shared';
import { DataLoadModal } from './DataLoadModal';

export function TablePanel({ table, onAction, onDelete, onLoadData, onToggleHeader, onSwapHeaders }) {
  const { rows, cols, row, col, headerRow = true, headerCol = false } = table;
  const [showModal, setShowModal] = useState(false);

  const Btn = ({ label, action, danger }) => (
    <button
      onClick={() => onAction(action)}
      className={`w-full text-left px-3 py-2 rounded-[6px] text-[12px] border transition-colors
        ${danger
          ? 'text-danger border-danger hover:bg-red-50'
          : 'text-dark border-border hover:bg-[#f0f4ff] hover:border-primary hover:text-primary'}`}
    >
      {label}
    </button>
  );

  return (
    <>
      {showModal && (
        <DataLoadModal
          onConfirm={(category, selectedLeaves, tableType) => onLoadData?.(category, selectedLeaves, tableType)}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">
        <div className="flex flex-col gap-1">
          <SectionLabel>크기</SectionLabel>
          <div className="text-[12px] text-muted">{rows}행 × {cols}열 (현재 {row + 1}행 {col + 1}열)</div>
        </div>
        <Sep />
        <div className="flex flex-col gap-2">
          <SectionLabel>헤더</SectionLabel>
          {[['headerRow', '행 헤더', headerRow], ['headerCol', '열 헤더', headerCol]].map(([key, label, val]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[12px] text-dark">{label}</span>
              <button
                onClick={() => onToggleHeader?.(key, !val)}
                className={`w-9 h-5 rounded-full transition-colors relative ${val ? 'bg-primary' : 'bg-[#c0c7ce]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-150
                  ${val ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onSwapHeaders?.()}
            className="w-full px-3 py-2 rounded-[6px] text-[12px] border border-border text-dark hover:bg-[#f0f4ff] hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 4h9M7 1.5L10 4 7 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 10H4M7 7.5L4 10l3 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            행/열 헤더 교체
          </button>
        </div>
        <Sep />
        <div className="flex flex-col gap-1.5">
          <SectionLabel>데이터</SectionLabel>
          <button
            onClick={() => setShowModal(true)}
            className="w-full text-left px-3 py-2 rounded-[6px] text-[12px] border border-primary text-primary bg-primary-light hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            데이터 불러오기
          </button>
        </div>
        <Sep />
        <div className="flex flex-col gap-1.5">
          <SectionLabel>행</SectionLabel>
          <Btn label="위에 행 추가"   action="addRowAbove" />
          <Btn label="아래에 행 추가" action="addRowBelow" />
          <Btn label="현재 행 삭제"   action="deleteRow"   />
        </div>
        <Sep />
        <div className="flex flex-col gap-1.5">
          <SectionLabel>열</SectionLabel>
          <Btn label="왼쪽에 열 추가"  action="addColLeft"  />
          <Btn label="오른쪽에 열 추가" action="addColRight" />
          <Btn label="현재 열 삭제"    action="deleteCol"   />
        </div>
        <div className="flex-1" />
        <button
          onClick={onDelete}
          className="w-full py-2 bg-white text-danger text-[12px] font-medium rounded border border-danger hover:bg-red-50 transition-colors"
        >
          표 삭제
        </button>
      </div>
    </>
  );
}
