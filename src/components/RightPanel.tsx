'use client';

import { WordDocPanel } from './panel/WordDocPanel';
import { TablePanel } from './panel/TablePanel';

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
  /* 표 포커스 → 표 설정 */
  if (selectedTable) {
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

  /* 문서 설정 */
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
