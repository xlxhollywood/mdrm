'use client';

import { useState } from 'react';
import { DataLoadModal } from './DataLoadModal';

export function TablePanel({ table, onAction, onDelete, onLoadData, onToggleHeader, onSwapHeaders }) {
  const { rows, cols, row, col, headerRow = true, headerCol = false } = table;
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
        <DataLoadModal
          onConfirm={(category, selectedLeaves, tableType) => onLoadData?.(category, selectedLeaves, tableType)}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* 크기 정보 */}
        <div className="px-4 pt-3 pb-2 border-b border-[#e8ecf0]">
          <div className="text-[11px] font-semibold text-[#64748b] mb-1">크기</div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#94a3b8]">행</span>
              <span className="text-[13px] font-bold text-[#1e293b]">{rows}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#94a3b8]">열</span>
              <span className="text-[13px] font-bold text-[#1e293b]">{cols}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] text-[#94a3b8]">현재</span>
              <span className="text-[11px] font-medium text-[#0056a4] bg-[#dbeafe] rounded-[4px] px-[5px] py-[1px]">{row + 1}행 {col + 1}열</span>
            </div>
          </div>
        </div>

        {/* 헤더 설정 */}
        <div className="px-4 pt-3 pb-2 border-b border-[#e8ecf0]">
          <div className="text-[11px] font-semibold text-[#64748b] mb-2">헤더</div>
          <div className="flex flex-col gap-2">
            {([['headerRow', '행 헤더', headerRow], ['headerCol', '열 헤더', headerCol]] as const).map(([key, label, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[12px] text-[#334155]">{label}</span>
                <button
                  onClick={() => onToggleHeader?.(key, !val)}
                  className={`w-[34px] h-[18px] rounded-full transition-colors relative shrink-0 ${val ? 'bg-[#0056a4]' : 'bg-[#c0c7ce]'}`}
                >
                  <span className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all duration-150
                    ${val ? 'left-[17px]' : 'left-[2px]'}`} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onSwapHeaders?.()}
              className="w-full px-3 py-[7px] rounded-[5px] text-[11px] font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-colors flex items-center justify-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 4h9M7 1.5L10 4 7 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 10H4M7 7.5L4 10l3 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              행/열 헤더 교체
            </button>
          </div>
        </div>

        {/* 행/열 조작 */}
        <div className="px-4 pt-3 pb-2 border-b border-[#e8ecf0]">
          <div className="text-[11px] font-semibold text-[#64748b] mb-2">행/열 편집</div>
          <div className="grid grid-cols-2 gap-[5px]">
            {[
              { label: '위에 행 추가', action: 'addRowAbove', icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              )},
              { label: '아래에 행 추가', action: 'addRowBelow', icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              )},
              { label: '왼쪽에 열 추가', action: 'addColLeft', icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
              )},
              { label: '오른쪽에 열 추가', action: 'addColRight', icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )},
              { label: '행 삭제', action: 'deleteRow', danger: true, icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/>
                </svg>
              )},
              { label: '열 삭제', action: 'deleteCol', danger: true, icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/>
                </svg>
              )},
            ].map(btn => (
              <button
                key={btn.action}
                onClick={() => onAction(btn.action)}
                className={`flex items-center justify-center gap-1 px-2 py-[7px] rounded-[5px] text-[11px] font-medium border transition-colors
                  ${btn.danger
                    ? 'text-[#dc2626] border-[#fecaca] hover:bg-[#fef2f2]'
                    : 'text-[#334155] border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1]'}`}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* 데이터 */}
        <div className="px-4 pt-3 pb-2 border-b border-[#e8ecf0]">
          <div className="text-[11px] font-semibold text-[#64748b] mb-2">데이터</div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-[8px] rounded-[5px] text-[12px] font-medium bg-[#0056a4] text-white hover:bg-[#004a8f] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            데이터 불러오기
          </button>
        </div>

        {/* 하단 삭제 */}
        <div className="px-4 py-3 mt-auto">
          <button
            onClick={onDelete}
            className="w-full py-[7px] rounded-[5px] bg-white text-[#dc2626] text-[12px] font-medium border border-[#fecaca] hover:bg-[#fef2f2] transition-colors flex items-center justify-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            표 삭제
          </button>
        </div>
      </div>
    </>
  );
}
