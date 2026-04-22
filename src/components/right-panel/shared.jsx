'use client';

/* ── 섹션 구분선 ── */
export const Sep = () => <div className="h-px bg-[#e8ecf0] mx-[-20px]" />;

/* ── 섹션 라벨 ── */
export const SectionLabel = ({ children }) => (
  <div className="text-[11px] font-semibold text-[#64748b] tracking-[0.04em] mb-1">{children}</div>
);

/* ── 라디오 옵션 카드 ── */
export function RadioOption({ selected, onClick, label, desc }) {
  return (
    <div
      className={`flex items-center gap-[10px] px-3 py-[9px] rounded-[6px] cursor-pointer border transition-all duration-100
        ${selected
          ? 'border-primary bg-[#f0f5ff] text-primary'
          : 'border-[#e8ecf0] hover:border-[#cbd5e1] hover:bg-[#f8fafc] text-[#334155]'}`}
      onClick={onClick}
    >
      <div className={`w-[15px] h-[15px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors
        ${selected ? 'border-primary' : 'border-[#c0c7ce]'}`}>
        {selected && <div className="w-[7px] h-[7px] rounded-full bg-primary" />}
      </div>
      <div className="min-w-0">
        <div className="text-[12px] font-medium leading-tight">{label}</div>
        {desc && <div className="text-[10px] text-[#94a3b8] mt-[1px] leading-tight">{desc}</div>}
      </div>
    </div>
  );
}

/* ── 토글 스위��� ── */
export function Toggle({ value, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between gap-3 py-[2px]">
      <div className="min-w-0">
        <div className="text-[12px] font-medium text-[#334155]">{label}</div>
        {desc && <div className="text-[10px] text-[#94a3b8] mt-[1px]">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-[34px] h-[18px] rounded-full transition-colors relative shrink-0 ${value ? 'bg-primary' : 'bg-[#c0c7ce]'}`}
      >
        <span className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all duration-150
          ${value ? 'left-[17px]' : 'left-[2px]'}`} />
      </button>
    </div>
  );
}

/* ── 패널 섹션 래퍼 ─��� */
export function Section({ label, children }) {
  return (
    <div className="flex flex-col gap-[8px]">
      {label && <SectionLabel>{label}</SectionLabel>}
      {children}
    </div>
  );
}
