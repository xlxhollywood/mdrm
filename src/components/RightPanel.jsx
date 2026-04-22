'use client';

import { TODAY, MONTH_AGO, QUICK_PERIODS } from '@/lib/constants';
import { Sep, Section, RadioOption, Toggle } from './right-panel/shared';
import { SystemSelectSection } from './right-panel/SystemSelect';
import { InspSelectSection } from './right-panel/InspSelect';
import { WordDocPanel } from './right-panel/WordDocPanel';
import { TablePanel } from './right-panel/TablePanel';

/* ── 패널 셸 ── */
function PanelShell({ title, desc, children }) {
  return (
    <div className="w-[280px] bg-white border-l border-[#e2e8f0] flex flex-col shrink-0 overflow-hidden">
      <div className="px-5 py-[14px] border-b border-[#e8ecf0]">
        <div className="text-[13px] font-semibold text-[#1e293b] leading-tight">{title}</div>
        {desc && <div className="text-[11px] text-[#94a3b8] mt-[3px] leading-tight">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export default function RightPanel({
  mode, selected, config, onConfigChange, onRemove,
  docConfig, onDocConfigChange, published, onPublish,
  tempSaved, onTempSave,
  selectedTable, onTableAction, onTableDelete,
  onTableLoadData, onTableToggleHeader, onTableSwapHeaders,
}) {
  /* Word 모드 + 표 포커스 → 표 설정 */
  if (mode === 'word' && !selected && selectedTable) {
    return (
      <PanelShell title="표 설정" desc={`${selectedTable.rows}행 × ${selectedTable.cols}열`}>
        <TablePanel
          table={selectedTable}
          onAction={onTableAction}
          onDelete={() => onTableDelete(selectedTable.blockId)}
          onLoadData={(category, selectedLeaves, tableType) => onTableLoadData?.(selectedTable.blockId, category, selectedLeaves, tableType)}
          onToggleHeader={(key, val) => onTableToggleHeader?.(selectedTable.blockId, key, val)}
          onSwapHeaders={() => onTableSwapHeaders?.(selectedTable.blockId)}
        />
      </PanelShell>
    );
  }

  /* Word 모드 + 위젯 미선택 → 문서 설정 */
  if (mode === 'word' && !selected) {
    return (
      <PanelShell title="문서 설정" desc="용지·여백을 설정하세요">
        <WordDocPanel
          docConfig={docConfig}
          onChange={onDocConfigChange}
          onPublish={onPublish}
          published={published}
          onTempSave={onTempSave}
          tempSaved={tempSaved}
        />
      </PanelShell>
    );
  }

  /* Grid 모드 + 위젯 미선택 → 빈 상태 + 가이드 */
  if (!selected) {
    const steps = [
      { num: 1, icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      ), text: '좌측에서 위젯을 추가하세요' },
      { num: 2, icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
        </svg>
      ), text: '캔버스에서 위젯을 클릭하세요' },
      { num: 3, icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ), text: '여기서 옵션을 설정하세요' },
    ];
    return (
      <PanelShell title="위젯 옵션" desc="캔버스에서 위젯을 선택하세요">
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="flex flex-col gap-[14px] w-full">
            {steps.map(s => (
              <div key={s.num} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#f0f5ff] flex items-center justify-center shrink-0 mt-[1px]">
                  {s.icon}
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#0056a4] leading-none">STEP {s.num}</div>
                  <div className="text-[12px] text-[#475569] mt-[3px] leading-tight">{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PanelShell>
    );
  }

  /* ── 위젯 선택 → 위젯 옵션 ── */
  const { widgetDef, instanceId } = selected;
  const cfg = config[instanceId] || {};

  const set = (patch) => onConfigChange(instanceId, { ...cfg, ...patch });

  return (
    <PanelShell title={widgetDef.name} desc={widgetDef.desc}>
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 gap-5">

        {/* 시스템 선택 */}
        {widgetDef.hasSystemSelect && (
          <SystemSelectSection cfg={cfg} onCfgChange={(ids) => set({ systemIds: ids })} />
        )}

        {/* 표시 형태 (viewType) */}
        {widgetDef.viewTypes.length > 0 && (
          <>
            {widgetDef.hasSystemSelect && <Sep />}
            <Section label="표시 형태">
              <div className="flex flex-col gap-[6px]">
                {widgetDef.viewTypes.map(vt => (
                  <RadioOption
                    key={vt.id}
                    selected={cfg.viewType === vt.id}
                    onClick={() => set({ viewType: vt.id })}
                    label={`${vt.icon}  ${vt.label}`}
                  />
                ))}
              </div>
            </Section>
          </>
        )}

        {/* 표시 방식 (카운트 / 상세 / 히트맵) */}
        {widgetDef.hasItemDetailToggle && (
          <>
            <Sep />
            <Section label="표시 방식">
              <div className="flex flex-col gap-[6px]">
                {[
                  { id: 'count',   label: '카운트', desc: '준수·미준수·실패 건수' },
                  { id: 'detail',  label: '상세',   desc: cfg.viewType === 'by-item' ? '각 시스템별 결과 표시' : '각 점검항목별 결과 표시' },
                  { id: 'heatmap', label: '히트맵', desc: '색상으로 한눈에 현황 파악' },
                ].map(opt => (
                  <RadioOption
                    key={opt.id}
                    selected={(cfg.displayMode || 'count') === opt.id}
                    onClick={() => set({ displayMode: opt.id })}
                    label={opt.label}
                    desc={opt.desc}
                  />
                ))}
              </div>
            </Section>
          </>
        )}

        {/* 패널 제목 */}
        {!widgetDef.fixedTitle && (
          <>
            <Sep />
            <Section label="패널 제목">
              <input
                type="text"
                value={cfg.widgetTitle ?? widgetDef.name}
                onChange={e => set({ widgetTitle: e.target.value })}
                placeholder={widgetDef.name}
                className="w-full text-[12px] border border-[#e2e8f0] rounded-[6px] px-3 py-[7px] text-[#1e293b] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors"
              />
            </Section>
          </>
        )}

        {/* 표시 설정 */}
        <>
          <Sep />
          <Section label="표시 설정">
            <Toggle label="외곽선" value={cfg.showBorder !== false} onChange={v => set({ showBorder: v })} />
            <Toggle label="라벨" value={cfg.showLabel !== false} onChange={v => set({ showLabel: v })} />
          </Section>
        </>

        {/* 요약 차트 토글 */}
        {widgetDef.hasSummaryToggle && (
          <>
            <Sep />
            <Toggle label="요약 차트" desc="결과 도넛 차트 표시" value={!!cfg.showSummary} onChange={v => set({ showSummary: v })} />
          </>
        )}

        {/* 실패 / 미준수 상세 토글 */}
        {widgetDef.hasFailDetailToggle && (
          <>
            <Sep />
            <Section label="상세 항목">
              <Toggle label="실패 항목" desc="실패 건 상세 표시" value={!!cfg.showFailDetail} onChange={v => set({ showFailDetail: v })} />
              <Toggle label="미준수 항목" desc="주요 미준수 건 상세 표시" value={!!cfg.showNonpassDetail} onChange={v => set({ showNonpassDetail: v })} />
            </Section>
          </>
        )}

        {/* 점검 선택 (번다운·결과차트) */}
        {widgetDef.hasInspSelect && (
          <>
            <Sep />
            <InspSelectSection cfg={cfg} onCfgChange={(patch) => set(patch)} singleMode={!!widgetDef.inspHistSingle} />
          </>
        )}

        {/* 기간 설정 */}
        {widgetDef.hasPeriod && !widgetDef.hasInspSelect && (
          <>
            {(widgetDef.viewTypes.length > 0 || widgetDef.hasSystemSelect) && <Sep />}
            <Section label="기간 설정">
              <div className="flex flex-wrap gap-[5px]">
                {QUICK_PERIODS.map(q => (
                  <button
                    key={q}
                    onClick={() => set({ quick: cfg.quick === q ? null : q })}
                    className={`px-[10px] py-[5px] rounded-[5px] text-[11px] font-medium border transition-colors
                      ${cfg.quick === q
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-primary hover:text-primary'}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              {!cfg.quick && (
                <div className="flex flex-col gap-[6px] mt-1">
                  {[['시작', cfg.from || MONTH_AGO, v => set({ from: v })], ['종료', cfg.to || TODAY, v => set({ to: v })]].map(([label, val, setter]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[11px] text-[#94a3b8] w-6 shrink-0">{label}</span>
                      <input
                        type="date"
                        value={val}
                        onChange={e => setter(e.target.value)}
                        className="flex-1 text-[11px] border border-[#e2e8f0] rounded-[5px] px-[10px] py-[5px] text-[#1e293b] outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        {/* spacer + 삭제 버튼 */}
        <div className="flex-1" />
        <div className="pt-2 pb-1">
          <button
            onClick={() => onRemove && onRemove(instanceId)}
            className="w-full py-[8px] bg-white text-[#dc2626] text-[12px] font-medium rounded-[6px] border border-[#fecaca] hover:bg-[#fef2f2] transition-colors"
          >
            위젯 삭제
          </button>
        </div>
      </div>
    </PanelShell>
  );
}
