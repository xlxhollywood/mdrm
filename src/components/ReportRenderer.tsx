'use client';

import { PAPER_SIZES, MM_TO_PX } from '@/components/report/constants';

/* ── 아이콘 ── */
function Icon({ type, size = 16 }: { type: string; size?: number }) {
  const cls = "shrink-0 text-[#0056a4]";
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: cls };
  if (type === 'chart') return <svg {...props}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
  if (type === 'table') return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>;
  if (type === 'shield') return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  if (type === 'clipboard') return <svg {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></svg>;
  if (type === 'alert') return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
  if (type === 'xmark') return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
  if (type === 'clock') return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (type === 'user') return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  return null;
}

/* ── 테이블 ── */
const COL_WIDTHS_4: Record<number, string> = { 0: '22%', 1: '10%', 2: '30%', 3: '38%' };

function Table({ table }: { table: any }) {
  const { rows = 3, cols = 3, cells = {}, headerRow = false } = table;
  const widths = cols === 4 ? COL_WIDTHS_4 : null;
  return (
    <table className="border-collapse w-full text-[12px]" style={{ tableLayout: widths ? 'fixed' : undefined }}>
      {widths && (
        <colgroup>
          {Array.from({ length: cols }, (_, c) => (
            <col key={c} style={{ width: widths[c] }} />
          ))}
        </colgroup>
      )}
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }, (_, c) => {
              const html = cells[`${r},${c}`] || '';
              return headerRow && r === 0 ? (
                <th key={c} className="border border-[#d9dfe5] px-2.5 py-2 text-left text-[11px] font-semibold text-[#334155] bg-[#f8fafc]" dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <td key={c} className="border border-[#d9dfe5] px-2.5 py-2 text-[12px] text-[#334155]" dangerouslySetInnerHTML={{ __html: html }} />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 위젯 블록 ── */
function WidgetBlock({ block }: { block: any }) {
  const SIZES: Record<string, string> = { h1: '22px', h2: '18px', h3: '16px', h4: '15px', h5: '13px' };
  const titleSize = SIZES[block.titleSubtype] || '14px';
  const hasHeaderItems = !!block.headerItems;
  const hasSections = !!block.sections;
  const hasSubtitle = !!block.subtitle;
  const titleColor = hasHeaderItems ? '#1a222b' : '#0056a4';

  return (
    <div className="my-2 px-[6px] pt-[12px] pb-[10px]">
      {/* 헤더 타이틀 (점검명) */}
      {hasHeaderItems && block.title && (
        <div className="flex items-center gap-1.5 mb-3">
          <Icon type="shield" size={24} />
          <span style={{ fontSize: titleSize, fontWeight: 700, color: titleColor }}>{block.title}</span>
        </div>
      )}

      {/* headerItems (날짜 등) */}
      {hasHeaderItems && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginBottom: 8, marginRight: -40 }}>
          {block.headerItems.filter((item: any) => item.visible !== false).map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, width: 180 }}>
              <Icon type={item.icon} size={15} />
              <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1, width: 36, flexShrink: 0 }}>{item.icon === 'clock' ? '점검일' : item.icon === 'user' ? '담당자' : ''}</span>
              <span style={{ fontSize: 14, color: '#5b646f', lineHeight: 1 }}>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* 일반 위젯 타이틀 */}
      {!hasHeaderItems && block.title && (
        <div className="flex items-center gap-1.5 mb-3 -mx-1 px-1 py-[4px] bg-[#f8fafc] rounded-[4px]">
          {block.titleIcon && <div style={{ marginTop: 2 }}><Icon type={block.titleIcon} /></div>}
          <span style={{ fontSize: titleSize, fontWeight: 700, color: titleColor, marginTop: 2 }}>{block.title}</span>
        </div>
      )}

      {/* sections (비정상 항목 등 — 여러 서브테이블) */}
      {hasSections && block.sections.map((sec: any, si: number) => {
        const secCount = Math.max(0, (sec.table?.rows || 0) - (sec.table?.headerRow ? 1 : 0));
        return (
          <div key={si} className={si > 0 ? 'mt-5' : 'mt-2'}>
            <div className="flex items-center justify-start gap-1 mb-[10px] ml-[4px]">
              {sec.subtitleIcon && <span style={{ position: 'relative', top: -2 }}><Icon type={sec.subtitleIcon} size={12} /></span>}
              <span className="text-[12px] font-medium text-[#0056a4]">{sec.subtitle}</span>
              <span className="text-[10px] text-[#94a3b8]">({secCount}건)</span>
            </div>
            <Table table={sec.table} />
          </div>
        );
      })}

      {/* 단일 서브타이틀 + 테이블 */}
      {!hasSections && hasSubtitle && (
        <div className="flex items-center justify-start gap-1 mb-[10px] ml-[4px] mt-2">
          {block.subtitleIcon && <span style={{ position: 'relative', top: -2 }}><Icon type={block.subtitleIcon} size={12} /></span>}
          <span className="text-[12px] font-medium text-[#0056a4]">{block.subtitle}</span>
          <span className="text-[10px] text-[#94a3b8]">({Math.max(0, (block.table?.rows || 0) - (block.table?.headerRow ? 1 : 0))}건)</span>
        </div>
      )}
      {!hasSections && block.table && <Table table={block.table} />}

      {/* HTML (점검 결과 요약 카드 등) */}
      {block.code && <div dangerouslySetInnerHTML={{ __html: block.code }} />}
    </div>
  );
}

/* ── 블록 렌더러 ── */
function BlockRenderer({ block }: { block: any }) {
  if (block.type === 'widget') return <WidgetBlock block={block} />;

  if (block.type === 'text') {
    const SIZES: Record<string, string> = { h1: '22px', h2: '18px', h3: '16px', h4: '15px', h5: '13px' };
    const fontSize = SIZES[block.subtype] || '14px';
    const isHeading = block.subtype?.startsWith('h');
    if (block.subtype === 'callout') return (
      <div className="my-1 px-4 py-3 rounded-[6px] border-l-[3px]" style={{ background: block.calloutBg || '#eff6ff', borderColor: block.calloutBorder || '#0056a4' }}>
        <div className="text-[14px]" dangerouslySetInnerHTML={{ __html: block.html || '' }} />
      </div>
    );
    if (block.subtype === 'quote') return (
      <div className="my-1 px-4 py-2 border-l-[3px] border-[#d9dfe5] text-[#5b646f] italic">
        <div className="text-[13px]" dangerouslySetInnerHTML={{ __html: block.html || '' }} />
      </div>
    );
    return (
      <div className="my-0.5" style={{ fontSize, fontWeight: isHeading ? 700 : 400, lineHeight: 1.6, color: '#1a222b' }} dangerouslySetInnerHTML={{ __html: block.html || '' }} />
    );
  }

  if (block.type === 'html') return <div className="my-2" dangerouslySetInnerHTML={{ __html: block.code || '' }} />;
  if (block.type === 'divider') return <div className="my-2" style={{ height: 1, background: '#d9dfe5' }} />;
  if (block.type === 'table') return <div className="my-2"><Table table={block} /></div>;

  return null;
}

/* ── 메인 렌더러 ── */
interface ReportRendererProps {
  blocks: any[];
  docConfig?: {
    paperSize?: string;
    orientation?: string;
    margins?: { top: number; bottom: number; left: number; right: number };
  };
}

export default function ReportRenderer({ blocks, docConfig }: ReportRendererProps) {
  const paper = PAPER_SIZES[(docConfig?.paperSize as keyof typeof PAPER_SIZES) || 'A4'] || PAPER_SIZES.A4;
  const isLand = docConfig?.orientation === 'landscape';
  const docW = isLand ? paper.h : paper.w;
  const docH = isLand ? paper.w : paper.h;
  const m = docConfig?.margins || { top: 10, bottom: 10, left: 10, right: 10 };
  const pad = `${Math.round(m.top * MM_TO_PX)}px ${Math.round(m.right * MM_TO_PX)}px ${Math.round(m.bottom * MM_TO_PX)}px ${Math.round(m.left * MM_TO_PX)}px`;

  // 점검 세트 분리 (headerItems 기준)
  const sections: any[][] = [];
  let current: any[] = [];
  for (const block of blocks) {
    if (block.type === 'widget' && block.headerItems && current.length > 0) {
      sections.push(current);
      current = [];
    }
    current.push(block);
  }
  if (current.length > 0) sections.push(current);

  return (
    <div className="flex-1 overflow-auto flex flex-col items-center bg-[#c8cdd3]">
      {sections.map((sectionBlocks, si) => (
        <div
          key={si}
          className="shrink-0 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.10)] my-6"
          style={{ width: docW, minHeight: docH, padding: pad }}
        >
          {sectionBlocks.map(block => (
            <div key={block.id} id={`viewer-${block.id}`} style={{ marginBottom: 5 }}>
              <BlockRenderer block={block} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
