'use client';

import { SectionLabel } from './shared';

export function WordDocPanel({ docConfig, onChange, onPublish, published, onTempSave, tempSaved }) {
  const set = (key, val) => onChange({ ...docConfig, [key]: val });
  const setMargin = (side, val) => onChange({ ...docConfig, margins: { ...docConfig.margins, [side]: Number(val) } });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="flex-1 p-4 flex flex-col gap-3">
        <SectionLabel>페이지 설정</SectionLabel>

        {/* 용지 크기 */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted">용지 크기</label>
          <select
            value={docConfig.paperSize}
            onChange={e => set('paperSize', e.target.value)}
            className="text-[12px] border border-border rounded-[6px] px-2.5 py-[7px] text-dark bg-white outline-none focus:border-primary"
          >
            <option value="A4">A4  (210 × 297mm)</option>
            <option value="A3">A3  (297 × 420mm)</option>
            <option value="B5">B5  (176 × 250mm)</option>
            <option value="Letter">Letter  (216 × 279mm)</option>
            <option value="Legal">Legal  (216 × 356mm)</option>
          </select>
        </div>

        {/* 방향 */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted">방향</label>
          <div className="flex gap-2">
            {[
              {
                val: 'portrait', label: '세로',
                icon: (
                  <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                    <rect x="1" y="1" width="16" height="22" rx="2"
                      stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08"/>
                  </svg>
                ),
              },
              {
                val: 'landscape', label: '가로',
                icon: (
                  <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                    <rect x="1" y="1" width="22" height="16" rx="2"
                      stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08"/>
                  </svg>
                ),
              },
            ].map(({ val, label, icon }) => (
              <button
                key={val}
                onClick={() => set('orientation', val)}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-[6px] border text-[11px] transition-colors
                  ${docConfig.orientation === val
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border text-muted hover:border-primary hover:text-primary'}`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 행간 / 자간 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted">간격</label>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted">행간</span>
                <span className="text-[10px] text-muted font-medium">{docConfig.lineHeight.toFixed(1)}</span>
              </div>
              <input
                type="range" min="1.0" max="3.0" step="0.1"
                value={docConfig.lineHeight}
                onChange={e => set('lineHeight', parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted">자간</span>
                <span className="text-[10px] text-muted font-medium">{docConfig.letterSpacing.toFixed(1)}px</span>
              </div>
              <input
                type="range" min="-2" max="10" step="0.5"
                value={docConfig.letterSpacing}
                onChange={e => set('letterSpacing', parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted">블록 간격</span>
                <span className="text-[10px] text-muted font-medium">{docConfig.blockSpacing}px</span>
              </div>
              <input
                type="range" min="0" max="40" step="1"
                value={docConfig.blockSpacing}
                onChange={e => set('blockSpacing', parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* 여백 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted">여백 (mm)</label>
          <div className="grid grid-cols-2 gap-2">
            {[['top','위'], ['bottom','아래'], ['left','왼쪽'], ['right','오른쪽']].map(([side, label]) => (
              <div key={side} className="flex flex-col gap-1">
                <span className="text-[10px] text-muted">{label}</span>
                <input
                  type="number"
                  value={docConfig.margins[side]}
                  onChange={e => setMargin(side, e.target.value)}
                  min="0" max="100"
                  className="text-[12px] border border-border rounded-[6px] px-2 py-1.5 text-dark outline-none focus:border-primary w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 임시 저장 / 발행 버튼 */}
      <div className="px-4 py-3 border-t border-border flex flex-col gap-2">
        <button
          onClick={onTempSave}
          className={`w-full py-2.5 text-[13px] font-semibold rounded-[6px] border transition-colors
            ${tempSaved
              ? 'bg-[#e8f5e9] text-success border-success'
              : 'bg-white text-dark border-border hover:border-primary hover:text-primary'}`}
        >
          {tempSaved ? '✓ 임시 저장됨' : '임시 저장'}
        </button>
        <button
          onClick={onPublish}
          className={`w-full py-2.5 text-[13px] font-semibold rounded-[6px] transition-colors
            ${published
              ? 'bg-success text-white'
              : 'bg-primary text-white hover:bg-primary-hover'}`}
        >
          {published ? '✓ 발행 완료' : '발행'}
        </button>
      </div>
    </div>
  );
}
