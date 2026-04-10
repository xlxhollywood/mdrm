'use client';

import { TODAY, MONTH_AGO, QUICK_PERIODS } from '@/lib/constants';

export default function RightPanel({ selected, config, onConfigChange, onRemove }) {
  if (!selected) {
    return (
      <div className="w-[280px] bg-white border-l border-border flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[13px] font-semibold text-dark">위젯 옵션</div>
          <div className="text-[11px] text-muted mt-0.5">캔버스에서 위젯을 선택하세요</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-border">
          <span className="text-3xl">⚙</span>
          <span className="text-[12px]">선택된 위젯이 없습니다</span>
        </div>
      </div>
    );
  }

  const { widgetDef, instanceId } = selected;
  const cfg = config[instanceId] || {};

  const setViewType = (vt) => onConfigChange(instanceId, { ...cfg, viewType: vt });
  const setPeriodOn = (v)  => onConfigChange(instanceId, { ...cfg, periodOn: v });
  const setFrom = (v)      => onConfigChange(instanceId, { ...cfg, from: v });
  const setTo = (v)        => onConfigChange(instanceId, { ...cfg, to: v });
  const setQuick = (q)     => onConfigChange(instanceId, { ...cfg, quick: q });

  return (
    <div className="w-[280px] bg-white border-l border-border flex flex-col shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[13px] font-semibold text-dark">{widgetDef.name}</div>
        <div className="text-[11px] text-muted mt-0.5">{widgetDef.desc}</div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">
        {/* 표시 형태 */}
        {widgetDef.viewTypes.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-[0.06em]">표시 형태</div>
            <div className="flex flex-col gap-1">
              {widgetDef.viewTypes.map(vt => (
                <div
                  key={vt.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer border transition-colors
                    ${cfg.viewType === vt.id
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border hover:bg-gray-50 text-dark'}`}
                  onClick={() => setViewType(vt.id)}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0
                    ${cfg.viewType === vt.id ? 'border-primary' : 'border-[#c0c7ce]'}`}>
                    {cfg.viewType === vt.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-[11px]">{vt.icon}</span>
                  <span className="text-[12px] font-medium">{vt.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {widgetDef.viewTypes.length > 0 && widgetDef.hasPeriod && (
          <div className="h-px bg-border" />
        )}

        {/* 기간 설정 */}
        {widgetDef.hasPeriod && (
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-[0.06em]">기간 설정</div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-dark">기간 필터 사용</span>
              <button
                onClick={() => setPeriodOn(!cfg.periodOn)}
                className={`w-9 h-5 rounded-full transition-colors relative ${cfg.periodOn ? 'bg-primary' : 'bg-[#c0c7ce]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                  ${cfg.periodOn ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {cfg.periodOn && (
              <>
                <div className="flex flex-wrap gap-1 mt-1">
                  {QUICK_PERIODS.map(q => (
                    <button
                      key={q}
                      onClick={() => setQuick(cfg.quick === q ? null : q)}
                      className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors
                        ${cfg.quick === q
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-muted border-border hover:border-primary hover:text-primary'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {!cfg.quick && (
                  <div className="flex flex-col gap-2 mt-1">
                    {[['시작', cfg.from || MONTH_AGO, setFrom], ['종료', cfg.to || TODAY, setTo]].map(([label, val, setter]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-[11px] text-muted w-6 shrink-0">{label}</span>
                        <input
                          type="date"
                          value={val}
                          onChange={e => setter(e.target.value)}
                          className="flex-1 text-[11px] border border-border rounded px-2 py-1 text-dark outline-none focus:border-primary"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* 버튼 */}
        <div className="flex flex-col gap-2">
          <button className="w-full py-2 bg-primary text-white text-[12px] font-semibold rounded hover:bg-primary-hover transition-colors">
            적용
          </button>
          <button className="w-full py-2 bg-white text-muted text-[12px] font-medium rounded border border-border hover:border-primary hover:text-primary transition-colors">
            초기화
          </button>
          <button
            onClick={() => onRemove && onRemove(instanceId)}
            className="w-full py-2 bg-white text-danger text-[12px] font-medium rounded border border-danger hover:bg-red-50 transition-colors"
          >
            위젯 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
