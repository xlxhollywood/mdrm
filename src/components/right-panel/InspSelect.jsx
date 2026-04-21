'use client';

import { useState } from 'react';
import { IcoChevron } from './SystemSelect';
import { SectionLabel } from './shared';

/* ── 목 데이터 ── */
const INSP_TREE = [
  {
    id: 'cat-server',
    label: '서버 점검',
    items: [
      { id: 'insp-s1', label: '주간 서버 점검' },
      { id: 'insp-s2', label: '월간 서버 점검' },
    ],
  },
  {
    id: 'cat-network',
    label: '네트워크 점검',
    items: [
      { id: 'insp-n1', label: '주간 네트워크 점검' },
      { id: 'insp-n2', label: '분기 네트워크 점검' },
    ],
  },
  {
    id: 'cat-db',
    label: 'DB 점검',
    items: [
      { id: 'insp-d1', label: '월간 DB 점검' },
    ],
  },
];

/* 점검별 이력 목 데이터 */
const INSP_HISTORY = {
  'insp-s1': [
    { id: 'h1', label: '2026-04-20' },
    { id: 'h2', label: '2026-04-14' },
    { id: 'h3', label: '2026-04-07' },
    { id: 'h4', label: '2026-03-31' },
  ],
  'insp-s2': [
    { id: 'h5', label: '2026-04-15' },
    { id: 'h6', label: '2026-03-17' },
  ],
  'insp-n1': [
    { id: 'h7', label: '2026-04-18' },
    { id: 'h8', label: '2026-04-11' },
    { id: 'h9', label: '2026-04-04' },
  ],
  'insp-n2': [
    { id: 'h10', label: '2026-04-10' },
    { id: 'h11', label: '2026-01-09' },
  ],
  'insp-d1': [
    { id: 'h12', label: '2026-04-16' },
    { id: 'h13', label: '2026-03-19' },
  ],
};

/* ── 아이콘 ── */
const IcoInsp = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <rect x="1" y="1" width="11" height="11" rx="2" stroke="#8a9299" strokeWidth="1.2" />
    <path d="M3.5 6.5h6M3.5 4.5h6M3.5 8.5h4" stroke="#8a9299" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IcoHistory = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="#8a9299" strokeWidth="1.2" />
    <path d="M6 3.5V6l1.5 1.5" stroke="#8a9299" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export function InspSelectSection({ cfg, onCfgChange, singleMode = false }) {
  const [openCats, setOpenCats] = useState({ 'cat-server': true });

  const selectedInspId  = cfg.inspId || null;
  const selectedHistIds = cfg.inspHistIds || [];
  const selectedHistId  = cfg.inspHistId  || null; // single mode

  const toggleCat = (catId) =>
    setOpenCats(prev => ({ ...prev, [catId]: !prev[catId] }));

  const selectInsp = (inspId) => {
    if (selectedInspId === inspId) {
      onCfgChange({ inspId: null, inspHistIds: [], inspHistId: null });
    } else {
      onCfgChange({ inspId, inspHistIds: [], inspHistId: null });
    }
  };

  const toggleHist = (histId) => {
    if (singleMode) {
      onCfgChange({ inspId: selectedInspId, inspHistId: selectedHistId === histId ? null : histId });
    } else {
      const next = selectedHistIds.includes(histId)
        ? selectedHistIds.filter(id => id !== histId)
        : [...selectedHistIds, histId];
      onCfgChange({ inspId: selectedInspId, inspHistIds: next });
    }
  };

  const history = selectedInspId ? (INSP_HISTORY[selectedInspId] || []) : [];

  return (
    <>
      {/* 점검 선택 트리 */}
      <div className="flex flex-col gap-2">
        <SectionLabel>점검 선택</SectionLabel>
        <div className="border border-border rounded overflow-hidden">
          {INSP_TREE.map((cat, ci) => (
            <div key={cat.id}>
              {ci > 0 && <div className="h-px bg-border" />}
              {/* 카테고리 헤더 */}
              <button
                onClick={() => toggleCat(cat.id)}
                className="w-full flex items-center gap-1.5 px-2.5 py-2 bg-[#f8f9fb] hover:bg-[#f0f3f7] text-left transition-colors"
              >
                <IcoChevron open={!!openCats[cat.id]} />
                <span className="text-[11px] font-semibold text-[#5b646f]">{cat.label}</span>
              </button>
              {/* 점검 항목 */}
              {openCats[cat.id] && cat.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => selectInsp(item.id)}
                  className={`w-full flex items-center gap-2 pl-6 pr-2.5 py-2 text-left transition-colors border-t border-[#f0f3f7]
                    ${selectedInspId === item.id
                      ? 'bg-primary-light text-primary'
                      : 'bg-white hover:bg-[#f8fafc] text-dark'}`}
                >
                  <IcoInsp />
                  <span className="text-[11px] flex-1 truncate">{item.label}</span>
                  {selectedInspId === item.id && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5L8.5 2" stroke="#0056a4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 점검 이력 선택 */}
      {selectedInspId && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <SectionLabel>점검 이력</SectionLabel>
              {!singleMode && selectedHistIds.length > 0 && (
                <span className="text-[10px] text-primary font-medium">{selectedHistIds.length}개 선택</span>
              )}
            </div>
            <div className="border border-border rounded overflow-hidden">
              {history.map((h, hi) => {
                const active = singleMode ? selectedHistId === h.id : selectedHistIds.includes(h.id);
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHist(h.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 text-left transition-colors
                      ${hi > 0 ? 'border-t border-[#f0f3f7]' : ''}
                      ${active ? 'bg-primary-light' : 'bg-white hover:bg-[#f8fafc]'}`}
                  >
                    {singleMode ? (
                      /* 라디오 버튼 */
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                        ${active ? 'border-primary' : 'border-[#c0c7ce]'}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                    ) : (
                      /* 체크박스 */
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                        ${active ? 'bg-primary border-primary' : 'border-[#c0c7ce]'}`}>
                        {active && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3l2.5 2.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    )}
                    <IcoHistory />
                    <span className={`text-[11px] flex-1 truncate ${active ? 'text-primary font-medium' : 'text-dark'}`}>
                      {h.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
